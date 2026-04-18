/**
 * DigitalStark Aachen - Advanced Analytics & Logging System
 * Comprehensive event tracking, performance monitoring, and error reporting
 */

'use strict';

/**
 * Analytics Engine - Track user interactions and events
 */
const Analytics = {
    sessionId: null,
    userId: null,
    events: [],
    properties: {},
    sessionStart: Date.now(),
    enabled: true,
    batchSize: 10,
    flushInterval: 30000,
    queue: [],
    flushTimer: null,

    /**
     * Initialize analytics
     */
    init: (config = {}) => {
        const {
            sessionId,
            userId,
            properties,
            enabled = true,
            batchSize = 10,
            flushInterval = 30000,
        } = config;

        Analytics.sessionId = sessionId || Analytics._generateSessionId();
        Analytics.userId = userId;
        Analytics.properties = properties || {};
        Analytics.enabled = enabled;
        Analytics.batchSize = batchSize;
        Analytics.flushInterval = flushInterval;

        if (Analytics.enabled) {
            Analytics._startAutoFlush();
            Analytics._trackPageLoad();
        }

        console.log(`📊 Analytics initialized (Session: ${Analytics.sessionId})`);
    },

    /**
     * Track event
     */
    track: (eventName, eventData = {}) => {
        if (!Analytics.enabled) return;

        const event = {
            name: eventName,
            timestamp: Date.now(),
            sessionId: Analytics.sessionId,
            userId: Analytics.userId,
            data: eventData,
            properties: { ...Analytics.properties },
            url: window.location.href,
            userAgent: navigator.userAgent,
        };

        Analytics.events.push(event);
        Analytics.queue.push(event);

        console.log(`📊 Event tracked: ${eventName}`);

        if (Analytics.queue.length >= Analytics.batchSize) {
            Analytics.flush();
        }
    },

    /**
     * Track page view
     */
    trackPageView: (pageName, pageData = {}) => {
        Analytics.track('page_view', {
            page: pageName,
            ...pageData,
        });
    },

    /**
     * Track user action
     */
    trackAction: (action, target, data = {}) => {
        Analytics.track('user_action', {
            action,
            target,
            ...data,
        });
    },

    /**
     * Track error
     */
    trackError: (error, context = {}) => {
        Analytics.track('error', {
            message: error.message,
            stack: error.stack,
            context,
        });
    },

    /**
     * Set user properties
     */
    setUserProperties: (properties) => {
        Analytics.properties = { ...Analytics.properties, ...properties };
    },

    /**
     * Set user ID
     */
    setUserId: (userId) => {
        Analytics.userId = userId;
    },

    /**
     * Flush events to backend
     */
    flush: async () => {
        if (Analytics.queue.length === 0) return;

        const eventsToSend = [...Analytics.queue];
        Analytics.queue = [];

        try {
            console.log(`📤 Flushing ${eventsToSend.length} analytics events`);
            // Send to analytics endpoint
            // await fetch('/api/analytics', {
            //     method: 'POST',
            //     body: JSON.stringify({ events: eventsToSend }),
            // });
        } catch (error) {
            console.error('Failed to flush analytics:', error);
            // Re-queue events on failure
            Analytics.queue.unshift(...eventsToSend);
        }
    },

    /**
     * Generate session ID
     */
    _generateSessionId: () => {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Track page load
     */
    _trackPageLoad: () => {
        Analytics.track('page_load', {
            title: document.title,
            referrer: document.referrer,
        });
    },

    /**
     * Start auto-flush timer
     */
    _startAutoFlush: () => {
        Analytics.flushTimer = setInterval(() => {
            Analytics.flush();
        }, Analytics.flushInterval);
    },

    /**
     * Get session duration
     */
    getSessionDuration: () => {
        return Date.now() - Analytics.sessionStart;
    },

    /**
     * Get event count
     */
    getEventCount: () => {
        return Analytics.events.length;
    },

    /**
     * Get events by name
     */
    getEventsByName: (eventName) => {
        return Analytics.events.filter(e => e.name === eventName);
    },

    /**
     * Export events
     */
    exportEvents: () => {
        return JSON.stringify(Analytics.events, null, 2);
    },

    /**
     * Clear events
     */
    clearEvents: () => {
        Analytics.events = [];
        Analytics.queue = [];
    },
};

/**
 * Logger - Advanced logging system
 */
const Logger = {
    levels: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        FATAL: 4,
    },
    currentLevel: 0,
    logs: [],
    handlers: [],
    maxLogs: 1000,

    /**
     * Set log level
     */
    setLevel: (level) => {
        Logger.currentLevel = Logger.levels[level] || 0;
    },

    /**
     * Add log handler
     */
    addHandler: (handler) => {
        Logger.handlers.push(handler);
    },

    /**
     * Log debug message
     */
    debug: (message, data = {}) => {
        Logger._log('DEBUG', message, data);
    },

    /**
     * Log info message
     */
    info: (message, data = {}) => {
        Logger._log('INFO', message, data);
    },

    /**
     * Log warning message
     */
    warn: (message, data = {}) => {
        Logger._log('WARN', message, data);
    },

    /**
     * Log error message
     */
    error: (message, data = {}) => {
        Logger._log('ERROR', message, data);
    },

    /**
     * Log fatal error
     */
    fatal: (message, data = {}) => {
        Logger._log('FATAL', message, data);
    },

    /**
     * Internal log method
     */
    _log: (level, message, data) => {
        if (Logger.levels[level] < Logger.currentLevel) return;

        const log = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            url: window.location.href,
        };

        Logger.logs.push(log);

        // Keep only recent logs
        if (Logger.logs.length > Logger.maxLogs) {
            Logger.logs.shift();
        }

        // Call handlers
        for (const handler of Logger.handlers) {
            try {
                handler(log);
            } catch (error) {
                console.error('Error in log handler:', error);
            }
        }

        // Console output
        const style = Logger._getStyle(level);
        console.log(`%c[${level}]`, style, message, data);
    },

    /**
     * Get console style for level
     */
    _getStyle: (level) => {
        const styles = {
            DEBUG: 'color: #666; font-weight: normal;',
            INFO: 'color: #2196f3; font-weight: bold;',
            WARN: 'color: #ff9800; font-weight: bold;',
            ERROR: 'color: #f44336; font-weight: bold;',
            FATAL: 'color: #f44336; font-weight: bold; background: #ffebee; padding: 2px 6px;',
        };

        return styles[level] || '';
    },

    /**
     * Export logs
     */
    exportLogs: () => {
        return JSON.stringify(Logger.logs, null, 2);
    },

    /**
     * Get logs by level
     */
    getLogsByLevel: (level) => {
        return Logger.logs.filter(log => log.level === level);
    },

    /**
     * Clear logs
     */
    clearLogs: () => {
        Logger.logs = [];
    },

    /**
     * Search logs
     */
    searchLogs: (query) => {
        return Logger.logs.filter(log =>
            log.message.includes(query) ||
            JSON.stringify(log.data).includes(query)
        );
    },
};

/**
 * Error Handler - Global error handling
 */
const ErrorHandler = {
    handlers: [],
    globallyEnabled: true,

    /**
     * Initialize global error handling
     */
    init: () => {
        window.addEventListener('error', (event) => {
            ErrorHandler.handle(event.error, {
                type: 'uncaughtError',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            ErrorHandler.handle(event.reason, {
                type: 'unhandledRejection',
            });
        });
    },

    /**
     * Register error handler
     */
    addHandler: (handler) => {
        ErrorHandler.handlers.push(handler);
    },

    /**
     * Handle error
     */
    handle: (error, context = {}) => {
        if (!ErrorHandler.globallyEnabled) return;

        const errorData = {
            message: error?.message || String(error),
            stack: error?.stack,
            context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
        };

        Logger.error('Error occurred', errorData);
        Analytics.trackError(error, context);

        // Call handlers
        for (const handler of ErrorHandler.handlers) {
            try {
                handler(errorData);
            } catch (e) {
                console.error('Error in error handler:', e);
            }
        }
    },

    /**
     * Disable global error handling
     */
    disable: () => {
        ErrorHandler.globallyEnabled = false;
    },

    /**
     * Enable global error handling
     */
    enable: () => {
        ErrorHandler.globallyEnabled = true;
    },
};

/**
 * Performance Monitor - Track performance metrics
 */
const PerformanceMonitor = {
    metrics: new Map(),

    /**
     * Mark start of operation
     */
    mark: (name) => {
        performance.mark(`${name}_start`);
    },

    /**
     * Measure operation
     */
    measure: (name) => {
        performance.mark(`${name}_end`);
        performance.measure(name, `${name}_start`, `${name}_end`);

        const measure = performance.getEntriesByName(name)[0];
        PerformanceMonitor.metrics.set(name, measure.duration);

        return measure.duration;
    },

    /**
     * Get all metrics
     */
    getMetrics: () => {
        const entries = performance.getEntries();
        const metrics = {};

        entries.forEach(entry => {
            if (entry.entryType === 'measure') {
                metrics[entry.name] = entry.duration;
            }
        });

        return metrics;
    },

    /**
     * Get navigation timing
     */
    getNavigationTiming: () => {
        const timing = performance.timing;
        return {
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            tcp: timing.connectEnd - timing.connectStart,
            request: timing.responseStart - timing.requestStart,
            response: timing.responseEnd - timing.responseStart,
            dom: timing.domComplete - timing.domLoading,
            load: timing.loadEventEnd - timing.loadEventStart,
            total: timing.loadEventEnd - timing.navigationStart,
        };
    },

    /**
     * Get resource timing
     */
    getResourceTiming: () => {
        return performance.getEntriesByType('resource').map(entry => ({
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
        }));
    },

    /**
     * Clear metrics
     */
    clearMetrics: () => {
        performance.clearMarks();
        performance.clearMeasures();
        PerformanceMonitor.metrics.clear();
    },
};

/**
 * Setup default handlers
 */
document.addEventListener('DOMContentLoaded', () => {
    ErrorHandler.init();

    // Add console log handler
    Logger.addHandler((log) => {
        // Can send to remote server here
    });

    // Track all clicks
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a, input[type="checkbox"]');
        if (target) {
            Analytics.trackAction('click', target.textContent || target.className);
        }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
        Analytics.trackAction('form_submit', e.target.name || 'form');
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Analytics,
        Logger,
        ErrorHandler,
        PerformanceMonitor,
    };
}

// Make available globally
window.Analytics = Analytics;
window.Logger = Logger;
window.ErrorHandler = ErrorHandler;
window.PerformanceMonitor = PerformanceMonitor;
