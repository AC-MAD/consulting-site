/**
 * DigitalStark Aachen - State Management System
 * Redux-like state management for reactive applications
 */

'use strict';

/**
 * Store - Central state management
 */
const Store = {
    state: {},
    reducers: {},
    subscribers: new Map(),
    middlewares: [],
    devTools: null,
    history: [],
    maxHistorySize: 50,
    currentHistoryIndex: -1,

    /**
     * Initialize store
     */
    init: (initialState = {}, options = {}) => {
        const { enableDevTools = false, maxHistory = 50 } = options;

        Store.state = { ...initialState };
        Store.maxHistorySize = maxHistory;

        if (enableDevTools) {
            Store._setupDevTools();
        }
    },

    /**
     * Register reducer
     */
    registerReducer: (key, reducer) => {
        Store.reducers[key] = reducer;
    },

    /**
     * Register multiple reducers
     */
    registerReducers: (reducerMap) => {
        Object.assign(Store.reducers, reducerMap);
    },

    /**
     * Get state value
     */
    getState: (path = null) => {
        if (!path) return { ...Store.state };

        const keys = path.split('.');
        let value = Store.state;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }

        return value;
    },

    /**
     * Set state directly (simple approach)
     */
    setState: (updates) => {
        Store.state = {
            ...Store.state,
            ...updates,
        };

        Store._notifySubscribers();
    },

    /**
     * Dispatch action (reducer approach)
     */
    dispatch: async (action, payload = null) => {
        // Check for async thunks
        if (typeof action === 'function') {
            return await action(Store.dispatch, () => Store.getState());
        }

        // Apply middlewares
        let finalAction = { type: action, payload };

        for (const middleware of Store.middlewares) {
            const result = await middleware(finalAction);
            if (result === false) return;
            if (result) finalAction = result;
        }

        // Save to history
        Store._saveToHistory(finalAction);

        // Find and execute reducer
        const reducer = Store.reducers[finalAction.type];

        if (reducer) {
            const previousState = JSON.parse(JSON.stringify(Store.state));
            Store.state = reducer(Store.state, finalAction);

            // Notify if state changed
            if (JSON.stringify(previousState) !== JSON.stringify(Store.state)) {
                Store._notifySubscribers(finalAction);
            }
        } else {
            console.warn(`No reducer found for action: ${finalAction.type}`);
        }
    },

    /**
     * Subscribe to state changes
     */
    subscribe: (callback, path = null) => {
        const id = Math.random();

        if (!Store.subscribers.has(path)) {
            Store.subscribers.set(path, new Map());
        }

        Store.subscribers.get(path).set(id, callback);

        // Return unsubscribe function
        return () => {
            Store.subscribers.get(path).delete(id);
        };
    },

    /**
     * Notify all subscribers
     */
    _notifySubscribers: (action = null) => {
        // Notify all subscribers
        if (Store.subscribers.has(null)) {
            Store.subscribers.get(null).forEach(callback => {
                callback(Store.state, action);
            });
        }

        // Notify path subscribers
        Store.subscribers.forEach((callbacks, path) => {
            if (path !== null) {
                const value = Store.getState(path);
                callbacks.forEach(callback => {
                    callback(value, action);
                });
            }
        });
    },

    /**
     * Save state to history
     */
    _saveToHistory: (action) => {
        // Remove future history if we're not at the end
        if (Store.currentHistoryIndex < Store.history.length - 1) {
            Store.history = Store.history.slice(0, Store.currentHistoryIndex + 1);
        }

        Store.history.push({
            action,
            state: JSON.parse(JSON.stringify(Store.state)),
        });

        Store.currentHistoryIndex++;

        // Limit history size
        if (Store.history.length > Store.maxHistorySize) {
            Store.history.shift();
            Store.currentHistoryIndex--;
        }
    },

    /**
     * Undo to previous state
     */
    undo: () => {
        if (Store.currentHistoryIndex > 0) {
            Store.currentHistoryIndex--;
            const entry = Store.history[Store.currentHistoryIndex];
            Store.state = JSON.parse(JSON.stringify(entry.state));
            Store._notifySubscribers();
        }
    },

    /**
     * Redo to next state
     */
    redo: () => {
        if (Store.currentHistoryIndex < Store.history.length - 1) {
            Store.currentHistoryIndex++;
            const entry = Store.history[Store.currentHistoryIndex];
            Store.state = JSON.parse(JSON.stringify(entry.state));
            Store._notifySubscribers();
        }
    },

    /**
     * Reset to initial state
     */
    reset: (initialState) => {
        Store.state = { ...initialState };
        Store.history = [];
        Store.currentHistoryIndex = -1;
        Store._notifySubscribers();
    },

    /**
     * Setup Redux DevTools integration
     */
    _setupDevTools: () => {
        if (window.__REDUX_DEVTOOLS_EXTENSION__) {
            Store.devTools = window.__REDUX_DEVTOOLS_EXTENSION__(Store);
        }
    },

    /**
     * Add middleware
     */
    use: (middleware) => {
        Store.middlewares.push(middleware);
    },

    /**
     * Get history for debugging
     */
    getHistory: () => {
        return Store.history;
    },
};

/**
 * Selector - Memoized state selectors
 */
const Selector = {
    cache: new Map(),

    /**
     * Create memoized selector
     */
    create: (fn) => {
        let lastState = null;
        let lastResult = null;

        return (state) => {
            if (state !== lastState) {
                lastState = state;
                lastResult = fn(state);
            }
            return lastResult;
        };
    },

    /**
     * Combine selectors
     */
    combine: (...selectors) => {
        return (state) => {
            return selectors.map(selector => selector(state));
        };
    },
};

/**
 * Reducer Factory - Helper to create reducers
 */
const Reducer = {
    /**
     * Create simple reducer
     */
    create: (initialState, handlers) => {
        return (state = initialState, action) => {
            const handler = handlers[action.type];
            return handler ? handler(state, action) : state;
        };
    },

    /**
     * Create reducer with immer-like API
     */
    createDraft: (initialState, handlers) => {
        return (state = initialState, action) => {
            const handler = handlers[action.type];
            if (!handler) return state;

            const draft = JSON.parse(JSON.stringify(state));
            handler(draft, action);
            return draft;
        };
    },
};

/**
 * AsyncAction - Async action helpers
 */
const AsyncAction = {
    /**
     * Create async action (thunk)
     */
    create: (fn) => {
        return async (dispatch, getState) => {
            return await fn(dispatch, getState);
        };
    },

    /**
     * Request/Success/Error pattern
     */
    createAsync: (type) => {
        return {
            request: () => ({ type: `${type}/REQUEST` }),
            success: (payload) => ({ type: `${type}/SUCCESS`, payload }),
            error: (error) => ({ type: `${type}/ERROR`, payload: error }),
        };
    },

    /**
     * Fetch action helper
     */
    fetch: (url, options = {}) => {
        const { method = 'GET', body = null, type = 'FETCH' } = options;

        return async (dispatch) => {
            dispatch({ type: `${type}/REQUEST` });

            try {
                const response = await fetch(url, { method, body });
                const data = await response.json();

                dispatch({ type: `${type}/SUCCESS`, payload: data });
                return data;
            } catch (error) {
                dispatch({ type: `${type}/ERROR`, payload: error.message });
                throw error;
            }
        };
    },
};

/**
 * Middleware Factory - Create common middlewares
 */
const Middleware = {
    /**
     * Logger middleware
     */
    logger: async (action) => {
        console.log(`[Action] ${action.type}`, action.payload);
        return action;
    },

    /**
     * Local storage sync middleware
     */
    localStorageSync: (key) => {
        return async (action) => {
            // Persist state to localStorage after dispatch
            setTimeout(() => {
                const state = Store.getState();
                try {
                    localStorage.setItem(key, JSON.stringify(state));
                } catch (e) {
                    console.warn('Failed to save state to localStorage', e);
                }
            }, 0);

            return action;
        };
    },

    /**
     * Validation middleware
     */
    validate: (validators) => {
        return async (action) => {
            const validator = validators[action.type];

            if (validator) {
                const errors = validator(action.payload);
                if (errors && errors.length > 0) {
                    console.warn(`Validation failed for ${action.type}:`, errors);
                    return false;
                }
            }

            return action;
        };
    },

    /**
     * Throttle middleware
     */
    throttle: (delayMs = 1000) => {
        const throttledActions = new Map();

        return async (action) => {
            const now = Date.now();
            const lastTime = throttledActions.get(action.type) || 0;

            if (now - lastTime < delayMs) {
                return false;
            }

            throttledActions.set(action.type, now);
            return action;
        };
    },

    /**
     * Debounce middleware
     */
    debounce: (delayMs = 1000) => {
        const timeouts = new Map();

        return async (action) => {
            clearTimeout(timeouts.get(action.type));

            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    resolve(action);
                }, delayMs);

                timeouts.set(action.type, timeout);
            });
        };
    },
};

/**
 * Connect Helper - Bind component to store
 */
const Connect = {
    /**
     * Connect element to store updates
     */
    element: (element, selector, callback) => {
        const unsubscribe = Store.subscribe((state) => {
            callback(element, state);
        });

        // Cleanup function
        element._storeUnsubscribe = unsubscribe;

        return unsubscribe;
    },

    /**
     * Watch specific state path
     */
    watch: (path, callback) => {
        return Store.subscribe((newValue) => {
            callback(newValue);
        }, path);
    },

    /**
     * Create reactive object
     */
    reactive: (path) => {
        return {
            get value() {
                return Store.getState(path);
            },
            set value(val) {
                Store.setState({ [path]: val });
            },
            subscribe(callback) {
                return Store.subscribe(callback, path);
            },
        };
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Store,
        Selector,
        Reducer,
        AsyncAction,
        Middleware,
        Connect,
    };
}

// Make available globally
window.Store = Store;
window.Selector = Selector;
window.Reducer = Reducer;
window.AsyncAction = AsyncAction;
window.Middleware = Middleware;
window.Connect = Connect;
