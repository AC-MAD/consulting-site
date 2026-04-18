/**
 * DigitalStark Aachen - Utility Functions Library
 * Comprehensive collection of helper functions for the website
 */

'use strict';

/**
 * DOM Utilities
 */
const DOM = {

    /**
     * Query selector with fallback
     */
    query: (selector) => {
        return document.querySelector(selector);
    },

    /**
     * Query all selector
     */
    queryAll: (selector) => {
        return Array.from(document.querySelectorAll(selector));
    },

    /**
     * Create element with attributes
     */
    createElement: (tag, attributes = {}, children = []) => {
        const element = document.createElement(tag);

        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'class') {
                element.className = value;
            } else if (key === 'style') {
                Object.assign(element.style, value);
            } else if (key.startsWith('data-')) {
                element.dataset[key.substring(5)] = value;
            } else if (key.startsWith('on')) {
                const eventName = key.substring(2).toLowerCase();
                element.addEventListener(eventName, value);
            } else {
                element.setAttribute(key, value);
            }
        });

        children.forEach(child => {
            element.appendChild(
                typeof child === 'string' ? document.createTextNode(child) : child
            );
        });

        return element;
    },

    /**
     * Add multiple event listeners
     */
    on: (element, events, handler) => {
        if (!element) return;

        const eventArray = Array.isArray(events) ? events : [events];
        eventArray.forEach(event => {
            element.addEventListener(event, handler);
        });
    },

    /**
     * Remove multiple event listeners
     */
    off: (element, events, handler) => {
        if (!element) return;

        const eventArray = Array.isArray(events) ? events : [events];
        eventArray.forEach(event => {
            element.removeEventListener(event, handler);
        });
    },

    /**
     * Add class to element
     */
    addClass: (element, className) => {
        if (!element) return;
        element.classList.add(...className.split(' '));
    },

    /**
     * Remove class from element
     */
    removeClass: (element, className) => {
        if (!element) return;
        element.classList.remove(...className.split(' '));
    },

    /**
     * Toggle class on element
     */
    toggleClass: (element, className) => {
        if (!element) return;
        element.classList.toggle(className);
    },

    /**
     * Check if element has class
     */
    hasClass: (element, className) => {
        return element?.classList.contains(className) ?? false;
    },

    /**
     * Get element position and dimensions
     */
    getRect: (element) => {
        return element?.getBoundingClientRect() ?? null;
    },

    /**
     * Get element offset
     */
    getOffset: (element) => {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
        };
    },

    /**
     * Set multiple styles
     */
    setStyles: (element, styles) => {
        if (!element) return;
        Object.assign(element.style, styles);
    },

    /**
     * Get computed style
     */
    getStyle: (element, property) => {
        return window.getComputedStyle(element).getPropertyValue(property);
    },

    /**
     * Check if element is visible in viewport
     */
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top < window.innerHeight &&
            rect.bottom > 0 &&
            rect.left < window.innerWidth &&
            rect.right > 0
        );
    },

    /**
     * Scroll element into view
     */
    scrollIntoView: (element, options = {}) => {
        element.scrollIntoView({
            behavior: options.smooth ? 'smooth' : 'auto',
            block: options.block || 'center',
            inline: options.inline || 'center',
        });
    },

    /**
     * Focus element with prevention
     */
    focusSafely: (element) => {
        if (element && element !== document.activeElement) {
            element.focus({ preventScroll: true });
        }
    },
};

/**
 * String Utilities
 */
const String = {

    /**
     * Capitalize first letter
     */
    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Slugify string
     */
    slugify: (str) => {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * Trim and normalize whitespace
     */
    normalize: (str) => {
        return str.trim().replace(/\s+/g, ' ');
    },

    /**
     * Truncate string
     */
    truncate: (str, length = 100, suffix = '...') => {
        return str.length > length ? str.substring(0, length) + suffix : str;
    },

    /**
     * Repeat string n times
     */
    repeat: (str, times) => {
        return str.repeat(Math.max(0, times));
    },

    /**
     * Check if string contains substring
     */
    includes: (str, search, caseSensitive = true) => {
        return caseSensitive
            ? str.includes(search)
            : str.toLowerCase().includes(search.toLowerCase());
    },
};

/**
 * Number Utilities
 */
const Number = {

    /**
     * Round to decimal places
     */
    round: (num, decimals = 0) => {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },

    /**
     * Clamp number between min and max
     */
    clamp: (num, min, max) => {
        return Math.max(min, Math.min(max, num));
    },

    /**
     * Linear interpolation
     */
    lerp: (start, end, amount) => {
        return start + (end - start) * amount;
    },

    /**
     * Format number with thousands separator
     */
    format: (num, locale = 'de-DE') => {
        return new Intl.NumberFormat(locale).format(num);
    },

    /**
     * Generate random number between min and max
     */
    random: (min = 0, max = 1) => {
        return Math.random() * (max - min) + min;
    },

    /**
     * Map number from one range to another
     */
    map: (value, inMin, inMax, outMin, outMax) => {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },

    /**
     * Check if number is even
     */
    isEven: (num) => {
        return num % 2 === 0;
    },

    /**
     * Check if number is odd
     */
    isOdd: (num) => {
        return num % 2 === 1;
    },
};

/**
 * Array Utilities
 */
const Array = {

    /**
     * Unique elements
     */
    unique: (arr) => {
        return [...new Set(arr)];
    },

    /**
     * Flatten nested array
     */
    flatten: (arr, depth = Infinity) => {
        return arr.reduce((flat, item) => {
            return flat.concat(depth > 1 && Array.isArray(item) ? Array.flatten(item, depth - 1) : item);
        }, []);
    },

    /**
     * Chunk array into smaller arrays
     */
    chunk: (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    },

    /**
     * Shuffle array
     */
    shuffle: (arr) => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    },

    /**
     * Find index of item
     */
    findIndex: (arr, predicate) => {
        return arr.findIndex(predicate);
    },

    /**
     * Group array by key
     */
    groupBy: (arr, key) => {
        return arr.reduce((groups, item) => {
            const groupKey = item[key];
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
            return groups;
        }, {});
    },
};

/**
 * Object Utilities
 */
const Object = {

    /**
     * Deep clone object
     */
    clone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Deep merge objects
     */
    merge: (target, source) => {
        const output = Object.assign({}, target);
        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach(key => {
                if (isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = Object.merge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    },

    /**
     * Get nested value
     */
    get: (obj, path, defaultValue = null) => {
        const keys = path.split('.');
        let value = obj;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }
        return value;
    },

    /**
     * Check if is empty
     */
    isEmpty: (obj) => {
        return Object.keys(obj).length === 0;
    },

    /**
     * Get object keys
     */
    keys: (obj) => {
        return Object.keys(obj);
    },

    /**
     * Get object values
     */
    values: (obj) => {
        return Object.values(obj);
    },

    /**
     * Get object entries
     */
    entries: (obj) => {
        return Object.entries(obj);
    },
};

/**
 * Validation Utilities
 */
const Validate = {

    /**
     * Check if value is null or undefined
     */
    isNull: (value) => {
        return value === null || value === undefined;
    },

    /**
     * Check if value is empty
     */
    isEmpty: (value) => {
        if (typeof value === 'string') {
            return value.trim().length === 0;
        }
        if (Array.isArray(value)) {
            return value.length === 0;
        }
        if (typeof value === 'object' && value !== null) {
            return Object.keys(value).length === 0;
        }
        return !value;
    },

    /**
     * Check if value is email
     */
    isEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Check if value is phone
     */
    isPhone: (phone) => {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.length >= 10;
    },

    /**
     * Check if value is URL
     */
    isURL: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Check if value is number
     */
    isNumber: (value) => {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    /**
     * Check if value is integer
     */
    isInteger: (value) => {
        return Number.isInteger(value);
    },

    /**
     * Check if value is object
     */
    isObject: (value) => {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    },

    /**
     * Check if value is array
     */
    isArray: (value) => {
        return Array.isArray(value);
    },

    /**
     * Check if value is function
     */
    isFunction: (value) => {
        return typeof value === 'function';
    },

    /**
     * Check if value is string
     */
    isString: (value) => {
        return typeof value === 'string';
    },

    /**
     * Check if value is boolean
     */
    isBoolean: (value) => {
        return typeof value === 'boolean';
    },
};

/**
 * Storage Utilities
 */
const Storage = {

    /**
     * Set item in localStorage
     */
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('localStorage is not available');
        }
    },

    /**
     * Get item from localStorage
     */
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    /**
     * Remove item from localStorage
     */
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('localStorage is not available');
        }
    },

    /**
     * Clear all localStorage
     */
    clear: () => {
        try {
            localStorage.clear();
        } catch (e) {
            console.warn('localStorage is not available');
        }
    },
};

/**
 * Export utilities
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DOM,
        String,
        Number,
        Array,
        Object,
        Validate,
        Storage,
    };
}

// Make available globally
window.Utils = {
    DOM,
    String,
    Number,
    Array,
    Object,
    Validate,
    Storage,
};
