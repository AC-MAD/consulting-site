/**
 * DigitalStark Aachen - Plugin & Extension System
 * Extensible plugin architecture for modular functionality
 */

'use strict';

/**
 * PluginManager - Manage application plugins
 */
const PluginManager = {
    plugins: new Map(),
    hooks: new Map(),
    filters: new Map(),
    middleware: [],
    eventBus: new Map(),

    /**
     * Register a plugin
     */
    register: (name, plugin) => {
        if (PluginManager.plugins.has(name)) {
            console.warn(`Plugin "${name}" is already registered`);
            return false;
        }

        if (!plugin.name || !plugin.version) {
            console.error('Plugin must have name and version');
            return false;
        }

        // Validate plugin structure
        if (plugin.hooks && typeof plugin.hooks === 'object') {
            for (const [hookName, handler] of Object.entries(plugin.hooks)) {
                PluginManager.addHook(hookName, name, handler);
            }
        }

        if (plugin.filters && typeof plugin.filters === 'object') {
            for (const [filterName, handler] of Object.entries(plugin.filters)) {
                PluginManager.addFilter(filterName, name, handler);
            }
        }

        PluginManager.plugins.set(name, {
            ...plugin,
            active: false,
            activated: false,
        });

        console.log(`✓ Plugin registered: ${name}@${plugin.version}`);
        return true;
    },

    /**
     * Activate a plugin
     */
    activate: async (name) => {
        const plugin = PluginManager.plugins.get(name);

        if (!plugin) {
            console.error(`Plugin "${name}" not found`);
            return false;
        }

        if (plugin.active) {
            console.warn(`Plugin "${name}" is already active`);
            return true;
        }

        try {
            if (plugin.activate && typeof plugin.activate === 'function') {
                await plugin.activate();
            }

            plugin.active = true;
            plugin.activated = true;

            console.log(`✓ Plugin activated: ${name}`);
            PluginManager.triggerHook('plugin:activated', { plugin: name });

            return true;
        } catch (error) {
            console.error(`Failed to activate plugin "${name}":`, error);
            return false;
        }
    },

    /**
     * Deactivate a plugin
     */
    deactivate: async (name) => {
        const plugin = PluginManager.plugins.get(name);

        if (!plugin) {
            console.error(`Plugin "${name}" not found`);
            return false;
        }

        if (!plugin.active) {
            console.warn(`Plugin "${name}" is not active`);
            return true;
        }

        try {
            if (plugin.deactivate && typeof plugin.deactivate === 'function') {
                await plugin.deactivate();
            }

            plugin.active = false;

            console.log(`✓ Plugin deactivated: ${name}`);
            PluginManager.triggerHook('plugin:deactivated', { plugin: name });

            return true;
        } catch (error) {
            console.error(`Failed to deactivate plugin "${name}":`, error);
            return false;
        }
    },

    /**
     * Add hook
     */
    addHook: (name, pluginName, handler) => {
        if (!PluginManager.hooks.has(name)) {
            PluginManager.hooks.set(name, []);
        }

        PluginManager.hooks.get(name).push({
            pluginName,
            handler,
            priority: 10,
        });
    },

    /**
     * Trigger hook
     */
    triggerHook: async (name, ...args) => {
        const hooks = PluginManager.hooks.get(name) || [];

        for (const hook of hooks) {
            try {
                await hook.handler(...args);
            } catch (error) {
                console.error(`Error in hook "${name}" from plugin "${hook.pluginName}":`, error);
            }
        }
    },

    /**
     * Add filter
     */
    addFilter: (name, pluginName, handler) => {
        if (!PluginManager.filters.has(name)) {
            PluginManager.filters.set(name, []);
        }

        PluginManager.filters.get(name).push({
            pluginName,
            handler,
        });
    },

    /**
     * Apply filter
     */
    applyFilter: async (name, value, ...args) => {
        const filters = PluginManager.filters.get(name) || [];

        let result = value;

        for (const filter of filters) {
            try {
                result = await filter.handler(result, ...args);
            } catch (error) {
                console.error(`Error in filter "${name}" from plugin "${filter.pluginName}":`, error);
            }
        }

        return result;
    },

    /**
     * Get plugin info
     */
    getPlugin: (name) => {
        return PluginManager.plugins.get(name);
    },

    /**
     * Get all plugins
     */
    getPlugins: () => {
        return Array.from(PluginManager.plugins.values());
    },

    /**
     * Get active plugins
     */
    getActivePlugins: () => {
        return PluginManager.getPlugins().filter(p => p.active);
    },

    /**
     * Check if plugin exists
     */
    hasPlugin: (name) => {
        return PluginManager.plugins.has(name);
    },

    /**
     * Remove plugin
     */
    unregister: async (name) => {
        const plugin = PluginManager.plugins.get(name);

        if (!plugin) {
            return false;
        }

        if (plugin.active) {
            await PluginManager.deactivate(name);
        }

        // Remove hooks and filters
        for (const [hookName, hooks] of PluginManager.hooks) {
            PluginManager.hooks.set(hookName, hooks.filter(h => h.pluginName !== name));
        }

        for (const [filterName, filters] of PluginManager.filters) {
            PluginManager.filters.set(filterName, filters.filter(f => f.pluginName !== name));
        }

        PluginManager.plugins.delete(name);
        console.log(`✓ Plugin unregistered: ${name}`);

        return true;
    },
};

/**
 * EventBus - Publish-subscribe event system
 */
const EventBus = {
    events: new Map(),
    priorities: new Map(),

    /**
     * Subscribe to event
     */
    on: (event, handler, priority = 10) => {
        if (!EventBus.events.has(event)) {
            EventBus.events.set(event, []);
        }

        const id = Math.random();
        const subscriber = { id, handler, priority };

        const handlers = EventBus.events.get(event);
        handlers.push(subscriber);
        handlers.sort((a, b) => b.priority - a.priority);

        // Return unsubscribe function
        return () => {
            const idx = handlers.findIndex(s => s.id === id);
            if (idx !== -1) handlers.splice(idx, 1);
        };
    },

    /**
     * Subscribe once
     */
    once: (event, handler) => {
        const wrappedHandler = (...args) => {
            handler(...args);
            unsubscribe();
        };

        const unsubscribe = EventBus.on(event, wrappedHandler);
        return unsubscribe;
    },

    /**
     * Emit event
     */
    emit: async (event, ...args) => {
        const handlers = EventBus.events.get(event) || [];

        for (const subscriber of handlers) {
            try {
                await subscriber.handler(...args);
            } catch (error) {
                console.error(`Error in event handler for "${event}":`, error);
            }
        }
    },

    /**
     * Remove all handlers for event
     */
    off: (event) => {
        EventBus.events.delete(event);
    },

    /**
     * Get listener count
     */
    listenerCount: (event) => {
        return EventBus.events.get(event)?.length || 0;
    },
};

/**
 * ExtensionPoint - Define extensible points in application
 */
const ExtensionPoint = {
    points: new Map(),

    /**
     * Define extension point
     */
    define: (name, config = {}) => {
        ExtensionPoint.points.set(name, {
            name,
            extensions: [],
            ...config,
        });
    },

    /**
     * Register extension
     */
    register: (pointName, extension) => {
        const point = ExtensionPoint.points.get(pointName);

        if (!point) {
            console.error(`Extension point "${pointName}" not found`);
            return false;
        }

        point.extensions.push(extension);
        console.log(`✓ Extension registered: ${pointName}`);

        return true;
    },

    /**
     * Get extensions for point
     */
    get: (pointName) => {
        const point = ExtensionPoint.points.get(pointName);
        return point?.extensions || [];
    },

    /**
     * Execute extensions in sequence
     */
    execute: async (pointName, context = {}) => {
        const extensions = ExtensionPoint.get(pointName);
        const results = [];

        for (const extension of extensions) {
            try {
                const result = await extension(context);
                results.push(result);
            } catch (error) {
                console.error(`Error executing extension in "${pointName}":`, error);
            }
        }

        return results;
    },

    /**
     * Execute extensions in parallel
     */
    executeParallel: async (pointName, context = {}) => {
        const extensions = ExtensionPoint.get(pointName);
        const promises = extensions.map(ext => {
            try {
                return ext(context);
            } catch (error) {
                console.error(`Error executing extension in "${pointName}":`, error);
                return null;
            }
        });

        return Promise.all(promises);
    },
};

/**
 * PluginAPI - API exposed to plugins
 */
const PluginAPI = {
    /**
     * Register hook
     */
    addHook: (name, handler) => {
        // Store current plugin context
        const currentPlugin = PluginManager.plugins.values().next().value?.name;
        PluginManager.addHook(name, currentPlugin, handler);
    },

    /**
     * Register filter
     */
    addFilter: (name, handler) => {
        const currentPlugin = PluginManager.plugins.values().next().value?.name;
        PluginManager.addFilter(name, currentPlugin, handler);
    },

    /**
     * Subscribe to event
     */
    on: EventBus.on,

    /**
     * Emit event
     */
    emit: EventBus.emit,

    /**
     * Register extension
     */
    registerExtension: ExtensionPoint.register,

    /**
     * Access store if available
     */
    getStore: () => window.Store,

    /**
     * Access router if available
     */
    getRouter: () => window.Router,

    /**
     * Access i18n if available
     */
    geti18n: () => window.i18n,
};

/**
 * Example Plugin Structure
 */
const ExamplePlugin = {
    name: 'example-plugin',
    version: '1.0.0',
    description: 'Example plugin demonstrating plugin system',
    author: 'DigitalStark',

    /**
     * Plugin activation
     */
    activate: async () => {
        console.log('Example plugin activated');

        // Register hooks
        PluginAPI.addHook('plugin:activated', (data) => {
            console.log('A plugin was activated:', data.plugin);
        });

        // Register filters
        PluginAPI.addFilter('content:process', (content) => {
            return content + ' [processed by example plugin]';
        });

        // Subscribe to events
        PluginAPI.on('app:ready', () => {
            console.log('App is ready!');
        });
    },

    /**
     * Plugin deactivation
     */
    deactivate: async () => {
        console.log('Example plugin deactivated');
    },

    /**
     * Plugin hooks
     */
    hooks: {
        'app:initialize': async () => {
            console.log('App initializing - example plugin hook');
        },
    },

    /**
     * Plugin filters
     */
    filters: {
        'user:name': async (name) => {
            return `${name} (via example plugin)`;
        },
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PluginManager,
        EventBus,
        ExtensionPoint,
        PluginAPI,
        ExamplePlugin,
    };
}

// Make available globally
window.PluginManager = PluginManager;
window.EventBus = EventBus;
window.ExtensionPoint = ExtensionPoint;
window.PluginAPI = PluginAPI;
