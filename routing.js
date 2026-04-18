/**
 * DigitalStark Aachen - Client-Side Routing System
 * SPA-like routing without backend requirements
 */

'use strict';

/**
 * Router - Client-side route management
 */
const Router = {
    routes: new Map(),
    currentRoute: null,
    history: [],
    historyIndex: -1,
    beforeHooks: [],
    afterHooks: [],
    notFoundHandler: null,

    /**
     * Register a route
     */
    register: (path, handler, options = {}) => {
        const route = {
            path,
            pattern: Router._pathToRegex(path),
            handler,
            ...options,
        };

        Router.routes.set(path, route);
    },

    /**
     * Convert path string to regex pattern
     */
    _pathToRegex: (path) => {
        const pattern = path
            .replace(/\//g, '\\/')
            .replace(/:(\w+)/g, '(?<$1>[^/]+)');

        return new RegExp(`^${pattern}/?$`);
    },

    /**
     * Extract params from path
     */
    _extractParams: (path, pattern) => {
        const match = pattern.exec(path);
        return match ? match.groups || {} : {};
    },

    /**
     * Navigate to route
     */
    navigate: async (path, options = {}) => {
        const { replace = false, state = {} } = options;

        // Find matching route
        let matchedRoute = null;
        let params = {};

        for (const [routePath, route] of Router.routes) {
            const routeParams = Router._extractParams(path, route.pattern);
            if (routeParams !== null) {
                matchedRoute = route;
                params = routeParams;
                break;
            }
        }

        if (!matchedRoute) {
            if (Router.notFoundHandler) {
                Router.notFoundHandler(path);
            } else {
                console.warn(`No route found for: ${path}`);
            }
            return false;
        }

        // Run before hooks
        for (const hook of Router.beforeHooks) {
            const result = await hook({ path, params, state });
            if (result === false) return false;
        }

        // Update history
        if (!replace) {
            Router.history = Router.history.slice(0, Router.historyIndex + 1);
            Router.history.push({ path, state });
            Router.historyIndex++;
        }

        // Update URL
        window.history.pushState({ path, state }, '', path);

        // Set current route
        Router.currentRoute = {
            path,
            route: matchedRoute,
            params,
            state,
        };

        // Call handler
        if (matchedRoute.handler) {
            await matchedRoute.handler(params, state);
        }

        // Run after hooks
        for (const hook of Router.afterHooks) {
            await hook({ path, params, state });
        }

        return true;
    },

    /**
     * Go back in history
     */
    back: () => {
        if (Router.historyIndex > 0) {
            Router.historyIndex--;
            const { path, state } = Router.history[Router.historyIndex];
            Router.navigate(path, { replace: true, state });
        }
    },

    /**
     * Go forward in history
     */
    forward: () => {
        if (Router.historyIndex < Router.history.length - 1) {
            Router.historyIndex++;
            const { path, state } = Router.history[Router.historyIndex];
            Router.navigate(path, { replace: true, state });
        }
    },

    /**
     * Register before navigation hook
     */
    before: (fn) => {
        Router.beforeHooks.push(fn);
    },

    /**
     * Register after navigation hook
     */
    after: (fn) => {
        Router.afterHooks.push(fn);
    },

    /**
     * Set 404 handler
     */
    notFound: (handler) => {
        Router.notFoundHandler = handler;
    },

    /**
     * Initialize router
     */
    init: () => {
        // Handle pop state (back/forward buttons)
        window.addEventListener('popstate', (e) => {
            const path = window.location.pathname;
            const state = e.state?.state || {};
            Router.navigate(path, { replace: true, state });
        });

        // Handle link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link && link.getAttribute('data-route')) {
                e.preventDefault();
                const path = link.getAttribute('href');
                Router.navigate(path);
            }
        });

        // Navigate to initial page
        const initialPath = window.location.pathname || '/';
        Router.navigate(initialPath, { replace: true });
    },

    /**
     * Get current route info
     */
    getCurrentRoute: () => {
        return Router.currentRoute;
    },

    /**
     * Check if on route
     */
    isOnRoute: (path) => {
        return Router.currentRoute?.path === path;
    },

    /**
     * Get route link
     */
    getLink: (path) => {
        return `<a href="${path}" data-route="true">${path}</a>`;
    },
};

/**
 * Link Component Helper
 */
const Link = {
    /**
     * Create link element
     */
    create: (to, text, options = {}) => {
        const link = document.createElement('a');
        link.href = to;
        link.textContent = text;
        link.setAttribute('data-route', 'true');

        if (options.className) {
            link.className = options.className;
        }

        if (options.onClick) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                options.onClick();
                Router.navigate(to);
            });
        }

        return link;
    },

    /**
     * Make element a link
     */
    makeRouteLink: (element, to) => {
        element.href = to;
        element.setAttribute('data-route', 'true');
    },
};

/**
 * Page Transition Helper
 */
const PageTransition = {
    /**
     * Fade out current page, fade in new page
     */
    fadeTransition: async (duration = 300) => {
        const main = document.querySelector('main') || document.body;

        main.style.opacity = '1';
        main.style.transition = `opacity ${duration}ms ease`;

        return new Promise((resolve) => {
            setTimeout(() => {
                main.style.opacity = '0';
                setTimeout(() => {
                    main.style.opacity = '1';
                    resolve();
                }, duration);
            }, duration);
        });
    },

    /**
     * Slide transition
     */
    slideTransition: async (direction = 'left', duration = 300) => {
        const main = document.querySelector('main') || document.body;

        const directionMap = {
            left: { out: '100%', in: '-100%' },
            right: { out: '-100%', in: '100%' },
            up: { out: '100vh', in: '-100vh' },
            down: { out: '-100vh', in: '100vh' },
        };

        const { out, in: inVal } = directionMap[direction];

        main.style.transition = `transform ${duration}ms ease`;

        return new Promise((resolve) => {
            setTimeout(() => {
                if (direction === 'left' || direction === 'right') {
                    main.style.transform = `translateX(${out})`;
                } else {
                    main.style.transform = `translateY(${out})`;
                }

                setTimeout(() => {
                    if (direction === 'left' || direction === 'right') {
                        main.style.transform = `translateX(${inVal})`;
                    } else {
                        main.style.transform = `translateY(${inVal})`;
                    }

                    setTimeout(() => {
                        main.style.transform = 'translate(0, 0)';
                        resolve();
                    }, duration);
                }, duration);
            }, duration);
        });
    },

    /**
     * Scale transition
     */
    scaleTransition: async (duration = 300) => {
        const main = document.querySelector('main') || document.body;

        main.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

        return new Promise((resolve) => {
            setTimeout(() => {
                main.style.transform = 'scale(0.95)';
                main.style.opacity = '0';

                setTimeout(() => {
                    main.style.transform = 'scale(1)';
                    main.style.opacity = '1';
                    resolve();
                }, duration);
            }, duration);
        });
    },
};

/**
 * Active Link Helper - Highlight current route
 */
const ActiveLink = {
    /**
     * Update active link styling
     */
    update: (selector = '[data-route]', activeClass = 'active') => {
        const links = document.querySelectorAll(selector);
        const currentPath = Router.currentRoute?.path || window.location.pathname;

        links.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.classList.add(activeClass);
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove(activeClass);
                link.removeAttribute('aria-current');
            }
        });
    },
};

/**
 * Route Parameters Helper
 */
const RouteParams = {
    /**
     * Get all current params
     */
    getAll: () => {
        return Router.currentRoute?.params || {};
    },

    /**
     * Get specific param
     */
    get: (key) => {
        return Router.currentRoute?.params[key];
    },

    /**
     * Check if param exists
     */
    has: (key) => {
        return key in (Router.currentRoute?.params || {});
    },
};

/**
 * Query String Handler
 */
const QueryString = {
    /**
     * Parse query string
     */
    parse: (search = window.location.search) => {
        const params = new URLSearchParams(search);
        const result = {};

        for (const [key, value] of params.entries()) {
            result[key] = value;
        }

        return result;
    },

    /**
     * Get query param
     */
    get: (key) => {
        return new URLSearchParams(window.location.search).get(key);
    },

    /**
     * Build query string
     */
    build: (params) => {
        const searchParams = new URLSearchParams();

        for (const [key, value] of Object.entries(params)) {
            if (value !== null && value !== undefined) {
                searchParams.set(key, value);
            }
        }

        const queryString = searchParams.toString();
        return queryString ? `?${queryString}` : '';
    },

    /**
     * Navigate with params
     */
    navigate: async (path, params = {}) => {
        const queryString = QueryString.build(params);
        return Router.navigate(path + queryString);
    },
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Router.init();
    ActiveLink.update();

    // Update active links after navigation
    Router.after(() => {
        ActiveLink.update();
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Router,
        Link,
        PageTransition,
        ActiveLink,
        RouteParams,
        QueryString,
    };
}

// Make available globally
window.Router = Router;
window.Link = Link;
window.PageTransition = PageTransition;
window.ActiveLink = ActiveLink;
window.RouteParams = RouteParams;
window.QueryString = QueryString;
