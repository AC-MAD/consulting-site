/**
 * DigitalStark Aachen - Advanced Caching System
 * Multi-strategy caching with LRU eviction, TTL support, and persistence
 */

'use strict';

/**
 * Cache Entry - Encapsulates cached data with metadata
 */
class CacheEntry {
    constructor(key, value, ttl = null, tags = []) {
        this.key = key;
        this.value = value;
        this.createdAt = Date.now();
        this.lastAccessedAt = Date.now();
        this.accessCount = 0;
        this.ttl = ttl;
        this.expiresAt = ttl ? Date.now() + ttl : null;
        this.tags = tags;
        this.size = this._estimateSize(value);
    }

    isExpired() {
        if (!this.ttl) return false;
        return Date.now() > this.expiresAt;
    }

    updateAccessTime() {
        this.lastAccessedAt = Date.now();
        this.accessCount++;
    }

    _estimateSize(value) {
        if (typeof value === 'string') return value.length;
        if (typeof value === 'number') return 8;
        if (typeof value === 'boolean') return 4;
        if (value === null) return 0;
        if (Array.isArray(value)) return value.reduce((sum, item) => sum + this._estimateSize(item), 0);
        if (typeof value === 'object') {
            return Object.values(value).reduce((sum, item) => sum + this._estimateSize(item), 0);
        }
        return 0;
    }
}

/**
 * LRU Cache - Least Recently Used eviction strategy
 */
class LRUCache {
    constructor(maxSize = 100, maxBytes = null) {
        this.maxSize = maxSize;
        this.maxBytes = maxBytes;
        this.cache = new Map();
        this.totalBytes = 0;
    }

    set(key, value, ttl = null, tags = []) {
        const entry = new CacheEntry(key, value, ttl, tags);

        // Remove existing entry if present
        if (this.cache.has(key)) {
            const oldEntry = this.cache.get(key);
            this.totalBytes -= oldEntry.size;
            this.cache.delete(key);
        }

        // Evict entries if necessary
        while (this.cache.size >= this.maxSize || (this.maxBytes && this.totalBytes + entry.size > this.maxBytes)) {
            this._evictLRU();
        }

        this.cache.set(key, entry);
        this.totalBytes += entry.size;
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        if (entry.isExpired()) {
            this.cache.delete(key);
            this.totalBytes -= entry.size;
            return undefined;
        }

        entry.updateAccessTime();
        return entry.value;
    }

    has(key) {
        const entry = this.cache.get(key);
        if (!entry) return false;
        if (entry.isExpired()) {
            this.cache.delete(key);
            this.totalBytes -= entry.size;
            return false;
        }
        return true;
    }

    delete(key) {
        const entry = this.cache.get(key);
        if (entry) {
            this.totalBytes -= entry.size;
            this.cache.delete(key);
        }
    }

    clear() {
        this.cache.clear();
        this.totalBytes = 0;
    }

    getByTag(tag) {
        const results = [];
        for (const entry of this.cache.values()) {
            if (entry.tags.includes(tag) && !entry.isExpired()) {
                results.push(entry.value);
            }
        }
        return results;
    }

    deleteByTag(tag) {
        for (const [key, entry] of this.cache.entries()) {
            if (entry.tags.includes(tag)) {
                this.totalBytes -= entry.size;
                this.cache.delete(key);
            }
        }
    }

    _evictLRU() {
        let lruEntry = null;
        let lruKey = null;

        for (const [key, entry] of this.cache.entries()) {
            if (!lruEntry || entry.lastAccessedAt < lruEntry.lastAccessedAt) {
                lruEntry = entry;
                lruKey = key;
            }
        }

        if (lruKey) {
            this.totalBytes -= lruEntry.size;
            this.cache.delete(lruKey);
        }
    }

    getStats() {
        return {
            size: this.cache.size,
            bytes: this.totalBytes,
            maxSize: this.maxSize,
            maxBytes: this.maxBytes,
            hitRate: this._calculateHitRate(),
        };
    }

    _calculateHitRate() {
        let totalAccesses = 0;
        for (const entry of this.cache.values()) {
            totalAccesses += entry.accessCount;
        }
        return totalAccesses > 0 ? (totalAccesses / this.cache.size).toFixed(2) : 0;
    }
}

/**
 * TTL Cache - Time-To-Live based eviction
 */
class TTLCache {
    constructor(defaultTTL = 60000) {
        this.defaultTTL = defaultTTL;
        this.cache = new Map();
        this.cleanupInterval = null;
    }

    set(key, value, ttl = null, tags = []) {
        const entry = new CacheEntry(key, value, ttl || this.defaultTTL, tags);
        this.cache.set(key, entry);
        this._startCleanup();
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        if (entry.isExpired()) {
            this.cache.delete(key);
            return undefined;
        }

        entry.updateAccessTime();
        return entry.value;
    }

    delete(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
        this._stopCleanup();
    }

    _startCleanup() {
        if (this.cleanupInterval) return;

        this.cleanupInterval = setInterval(() => {
            for (const [key, entry] of this.cache.entries()) {
                if (entry.isExpired()) {
                    this.cache.delete(key);
                }
            }
        }, 30000);
    }

    _stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}

/**
 * IndexedDB Cache - Persistent browser storage
 */
class IndexedDBCache {
    constructor(dbName = 'DigitalStarkCache', storeName = 'cache') {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
        this.ready = this._initDB();
    }

    async _initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
                    store.createIndex('expiresAt', 'expiresAt', { unique: false });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };
        });
    }

    async set(key, value, ttl = null, tags = []) {
        await this.ready;

        const entry = new CacheEntry(key, value, ttl, tags);
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(entry);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async get(key) {
        await this.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const entry = request.result;
                if (!entry) {
                    resolve(undefined);
                } else if (entry.isExpired && entry.isExpired()) {
                    this.delete(key);
                    resolve(undefined);
                } else {
                    resolve(entry.value);
                }
            };
        });
    }

    async delete(key) {
        await this.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async clear() {
        await this.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async cleanup() {
        await this.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('expiresAt');
            const range = IDBKeyRange.upperBound(Date.now());
            const request = index.getAll(range);

            request.onerror = () => reject(request.error);
            request.onsuccess = async () => {
                for (const entry of request.result) {
                    await this.delete(entry.key);
                }
                resolve();
            };
        });
    }
}

/**
 * Multi-tier Cache Manager
 */
const CacheManager = {
    memory: null,
    persistent: null,
    config: {
        useMemory: true,
        usePersistent: true,
        memorySize: 100,
        persistentEnabled: typeof indexedDB !== 'undefined',
    },

    init: (config = {}) => {
        CacheManager.config = { ...CacheManager.config, ...config };

        if (CacheManager.config.useMemory) {
            CacheManager.memory = new LRUCache(CacheManager.config.memorySize, 50 * 1024 * 1024);
            console.log('💾 Memory cache initialized');
        }

        if (CacheManager.config.usePersistent && CacheManager.config.persistentEnabled) {
            CacheManager.persistent = new IndexedDBCache();
            console.log('📦 Persistent cache initialized');
        }
    },

    set: async (key, value, ttl = null, tags = [], tier = 'auto') => {
        if (!CacheManager.memory && !CacheManager.persistent) {
            CacheManager.init();
        }

        if (tier === 'auto' || tier === 'memory') {
            if (CacheManager.memory) {
                CacheManager.memory.set(key, value, ttl, tags);
            }
        }

        if (tier === 'auto' || tier === 'persistent') {
            if (CacheManager.persistent) {
                await CacheManager.persistent.set(key, value, ttl, tags);
            }
        }
    },

    get: async (key, tier = 'auto') => {
        if (!CacheManager.memory && !CacheManager.persistent) {
            CacheManager.init();
        }

        if (tier === 'memory' || tier === 'auto') {
            if (CacheManager.memory && CacheManager.memory.has(key)) {
                return CacheManager.memory.get(key);
            }
        }

        if (tier === 'persistent' || (tier === 'auto' && !CacheManager.memory?.has(key))) {
            if (CacheManager.persistent) {
                return await CacheManager.persistent.get(key);
            }
        }

        return undefined;
    },

    delete: async (key) => {
        if (CacheManager.memory) CacheManager.memory.delete(key);
        if (CacheManager.persistent) await CacheManager.persistent.delete(key);
    },

    clear: async () => {
        if (CacheManager.memory) CacheManager.memory.clear();
        if (CacheManager.persistent) await CacheManager.persistent.clear();
    },

    deleteByTag: async (tag) => {
        if (CacheManager.memory) CacheManager.memory.deleteByTag(tag);
    },

    getStats: () => {
        return {
            memory: CacheManager.memory ? CacheManager.memory.getStats() : null,
            persistent: 'IndexedDB storage available',
        };
    },

    invalidateExpired: async () => {
        if (CacheManager.persistent) {
            await CacheManager.persistent.cleanup();
        }
    },
};

/**
 * Cache Decorator - Function result caching
 */
const CacheDecorator = {
    wrap: (fn, options = {}) => {
        const {
            ttl = 60000,
            key = null,
            tags = [],
            tier = 'auto',
        } = options;

        return async (...args) => {
            const cacheKey = key || `${fn.name}:${JSON.stringify(args)}`;

            const cached = await CacheManager.get(cacheKey, tier);
            if (cached !== undefined) {
                console.log(`📦 Cache hit for ${cacheKey}`);
                return cached;
            }

            const result = await fn(...args);
            await CacheManager.set(cacheKey, result, ttl, tags, tier);

            return result;
        };
    },
};

/**
 * Cache Warming - Pre-populate cache
 */
const CacheWarmer = {
    tasks: [],

    schedule: (fn, cacheKey, ttl = 60000, interval = 300000) => {
        const task = {
            fn,
            cacheKey,
            ttl,
            interval,
            timerId: null,
        };

        const execute = async () => {
            try {
                const result = await fn();
                await CacheManager.set(cacheKey, result, ttl);
                console.log(`🔄 Cache warmed: ${cacheKey}`);
            } catch (error) {
                console.error(`Cache warming failed for ${cacheKey}:`, error);
            }
        };

        execute();
        task.timerId = setInterval(execute, interval);
        CacheWarmer.tasks.push(task);
    },

    stopAll: () => {
        for (const task of CacheWarmer.tasks) {
            clearInterval(task.timerId);
        }
        CacheWarmer.tasks = [];
    },

    getTaskCount: () => CacheWarmer.tasks.length,
};

/**
 * Cache Invalidation Strategies
 */
const CacheInvalidation = {
    immediate: async (key) => {
        await CacheManager.delete(key);
    },

    delayed: async (key, delay = 5000) => {
        setTimeout(() => CacheManager.delete(key), delay);
    },

    onDependencyChange: (key, dependencies = []) => {
        for (const dep of dependencies) {
            document.addEventListener(`cache:${dep}`, () => {
                CacheManager.delete(key);
            });
        }
    },

    cascade: async (parentKey, childKeys = []) => {
        await CacheManager.delete(parentKey);
        for (const childKey of childKeys) {
            await CacheManager.delete(childKey);
        }
    },
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CacheEntry,
        LRUCache,
        TTLCache,
        IndexedDBCache,
        CacheManager,
        CacheDecorator,
        CacheWarmer,
        CacheInvalidation,
    };
}

window.CacheEntry = CacheEntry;
window.LRUCache = LRUCache;
window.TTLCache = TTLCache;
window.IndexedDBCache = IndexedDBCache;
window.CacheManager = CacheManager;
window.CacheDecorator = CacheDecorator;
window.CacheWarmer = CacheWarmer;
window.CacheInvalidation = CacheInvalidation;
