/**
 * DigitalStark Aachen - Advanced API Client Library
 * Complete HTTP client with request/response interceptors, caching, and retry logic
 */

'use strict';

/**
 * HTTP Client - Production-grade API client
 */
const HttpClient = {
    baseURL: '',
    timeout: 30000,
    headers: {},
    interceptors: {
        request: [],
        response: [],
        error: [],
    },
    cache: new Map(),
    retryConfig: {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
    },

    /**
     * Configure HTTP client
     */
    configure: (config = {}) => {
        const { baseURL, timeout, headers } = config;
        if (baseURL) HttpClient.baseURL = baseURL;
        if (timeout) HttpClient.timeout = timeout;
        if (headers) HttpClient.headers = { ...HttpClient.headers, ...headers };
    },

    /**
     * Set authorization header
     */
    setAuthToken: (token, scheme = 'Bearer') => {
        HttpClient.headers['Authorization'] = `${scheme} ${token}`;
    },

    /**
     * Add request interceptor
     */
    addRequestInterceptor: (fn) => {
        HttpClient.interceptors.request.push(fn);
    },

    /**
     * Add response interceptor
     */
    addResponseInterceptor: (fn) => {
        HttpClient.interceptors.response.push(fn);
    },

    /**
     * Add error interceptor
     */
    addErrorInterceptor: (fn) => {
        HttpClient.interceptors.error.push(fn);
    },

    /**
     * GET request
     */
    get: async (url, options = {}) => {
        return HttpClient.request(url, { ...options, method: 'GET' });
    },

    /**
     * POST request
     */
    post: async (url, data, options = {}) => {
        return HttpClient.request(url, { ...options, method: 'POST', body: data });
    },

    /**
     * PUT request
     */
    put: async (url, data, options = {}) => {
        return HttpClient.request(url, { ...options, method: 'PUT', body: data });
    },

    /**
     * PATCH request
     */
    patch: async (url, data, options = {}) => {
        return HttpClient.request(url, { ...options, method: 'PATCH', body: data });
    },

    /**
     * DELETE request
     */
    delete: async (url, options = {}) => {
        return HttpClient.request(url, { ...options, method: 'DELETE' });
    },

    /**
     * Generic request method
     */
    request: async (url, options = {}) => {
        const {
            method = 'GET',
            body = null,
            headers = {},
            useCache = true,
            cacheDuration = 5 * 60 * 1000, // 5 minutes
            timeout = HttpClient.timeout,
            retries = null,
        } = options;

        const fullURL = HttpClient._buildURL(url);
        const cacheKey = `${method}:${fullURL}`;

        // Check cache for GET requests
        if (method === 'GET' && useCache) {
            const cached = HttpClient._getFromCache(cacheKey);
            if (cached) {
                console.log(`📦 Cache hit: ${url}`);
                return cached;
            }
        }

        let request = {
            url: fullURL,
            method,
            body,
            headers: { ...HttpClient.headers, ...headers },
        };

        // Apply request interceptors
        for (const interceptor of HttpClient.interceptors.request) {
            request = await interceptor(request) || request;
        }

        try {
            const response = await HttpClient._executeRequest(request, timeout, retries);

            // Apply response interceptors
            let result = response;
            for (const interceptor of HttpClient.interceptors.response) {
                result = await interceptor(result) || result;
            }

            // Cache successful GET responses
            if (method === 'GET' && useCache && response.ok) {
                HttpClient._setInCache(cacheKey, result, cacheDuration);
            }

            return result;
        } catch (error) {
            // Apply error interceptors
            for (const interceptor of HttpClient.interceptors.error) {
                try {
                    await interceptor(error);
                } catch (e) {
                    // Silently continue
                }
            }

            throw error;
        }
    },

    /**
     * Execute HTTP request with retry logic
     */
    _executeRequest: async (request, timeout, maxRetries) => {
        let lastError;
        const attemptsToMake = (maxRetries ?? HttpClient.retryConfig.maxRetries) + 1;

        for (let attempt = 0; attempt < attemptsToMake; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(request.url, {
                    method: request.method,
                    headers: request.headers,
                    body: request.body ? JSON.stringify(request.body) : null,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                // Parse response
                const contentType = response.headers.get('content-type');
                let data = null;

                if (contentType?.includes('application/json')) {
                    data = await response.json();
                } else if (contentType?.includes('text')) {
                    data = await response.text();
                } else {
                    data = await response.blob();
                }

                return {
                    ok: response.ok,
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers),
                    data,
                    error: !response.ok ? data : null,
                };
            } catch (error) {
                lastError = error;

                if (attempt < attemptsToMake - 1) {
                    const delay = HttpClient.retryConfig.initialDelay *
                        Math.pow(HttpClient.retryConfig.backoffMultiplier, attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError;
    },

    /**
     * Build full URL
     */
    _buildURL: (path) => {
        if (path.startsWith('http')) return path;
        return HttpClient.baseURL + path;
    },

    /**
     * Get from cache
     */
    _getFromCache: (key) => {
        const cached = HttpClient.cache.get(key);
        if (!cached) return null;

        if (Date.now() > cached.expiresAt) {
            HttpClient.cache.delete(key);
            return null;
        }

        return cached.data;
    },

    /**
     * Set in cache
     */
    _setInCache: (key, data, duration) => {
        HttpClient.cache.set(key, {
            data,
            expiresAt: Date.now() + duration,
        });
    },

    /**
     * Clear cache
     */
    clearCache: () => {
        HttpClient.cache.clear();
    },

    /**
     * Create API resource
     */
    resource: (endpoint) => {
        return {
            list: (params) => HttpClient.get(`${endpoint}`, { params }),
            get: (id) => HttpClient.get(`${endpoint}/${id}`),
            create: (data) => HttpClient.post(`${endpoint}`, data),
            update: (id, data) => HttpClient.put(`${endpoint}/${id}`, data),
            delete: (id) => HttpClient.delete(`${endpoint}/${id}`),
        };
    },
};

/**
 * Request/Response Interceptor Presets
 */
const InterceptorPresets = {
    /**
     * Logging interceptor
     */
    logging: {
        request: (request) => {
            console.log(`📤 ${request.method} ${request.url}`);
            return request;
        },
        response: (response) => {
            console.log(`📥 ${response.status} ${response.statusText}`);
            return response;
        },
    },

    /**
     * Error handling interceptor
     */
    errorHandling: {
        response: (response) => {
            if (!response.ok) {
                const error = new Error(response.statusText);
                error.status = response.status;
                error.data = response.error;
                throw error;
            }
            return response;
        },
    },

    /**
     * Timeout interceptor
     */
    timeout: {
        request: (request) => {
            request._startTime = Date.now();
            return request;
        },
        response: (response) => {
            const duration = Date.now() - response._startTime;
            console.log(`⏱️ Request took ${duration}ms`);
            return response;
        },
    },

    /**
     * Retry interceptor (automatic retry on failure)
     */
    autoRetry: {
        error: async (error) => {
            if (error.status >= 500) {
                console.log('🔄 Server error, retrying...');
                // Retry logic handled in _executeRequest
            }
        },
    },
};

/**
 * API Methods Generator
 */
const APIFactory = {
    /**
     * Create API client for resource
     */
    create: (baseURL, resources = {}) => {
        const client = {
            ...HttpClient,
            baseURL,
        };

        for (const [name, endpoint] of Object.entries(resources)) {
            client[name] = HttpClient.resource(endpoint);
        }

        return client;
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HttpClient,
        InterceptorPresets,
        APIFactory,
    };
}

// Make available globally
window.HttpClient = HttpClient;
window.InterceptorPresets = InterceptorPresets;
window.APIFactory = APIFactory;
