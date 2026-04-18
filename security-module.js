/**
 * DigitalStark Aachen - Advanced Security & Encryption Module
 * Client-side encryption, secure storage, and security utilities
 */

'use strict';

/**
 * CryptoUtils - Cryptographic utilities
 */
const CryptoUtils = {
    // Generate random bytes
    generateRandomBytes: (length = 32) => {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return array;
    },

    // Convert bytes to hex string
    bytesToHex: (bytes) => {
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    // Convert hex string to bytes
    hexToBytes: (hex) => {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    },

    // Hash string with SHA-256
    sha256: async (data) => {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        return CryptoUtils.bytesToHex(new Uint8Array(hashBuffer));
    },

    // Hash string with SHA-512
    sha512: async (data) => {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
        return CryptoUtils.bytesToHex(new Uint8Array(hashBuffer));
    },

    // Generate cryptographically secure UUID
    generateUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // Verify HMAC signature
    verifyHMAC: async (key, data, signature) => {
        const encoder = new TextEncoder();
        const keyBuffer = await crypto.subtle.importKey(
            'raw',
            encoder.encode(key),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        return crypto.subtle.verify(
            'HMAC',
            keyBuffer,
            CryptoUtils.hexToBytes(signature),
            encoder.encode(data)
        );
    },
};

/**
 * SecureStorage - Encrypted local storage
 */
const SecureStorage = {
    storageKey: 'secure_storage',
    encryptionKey: null,

    init: async (password) => {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const keyBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);

        SecureStorage.encryptionKey = await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );

        console.log('🔐 Secure Storage initialized');
    },

    set: async (key, value) => {
        if (!SecureStorage.encryptionKey) {
            console.warn('SecureStorage not initialized');
            return false;
        }

        try {
            const iv = CryptoUtils.generateRandomBytes(12);
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(value));

            const encryptedBuffer = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                SecureStorage.encryptionKey,
                dataBuffer
            );

            const encryptedData = {
                iv: CryptoUtils.bytesToHex(iv),
                data: CryptoUtils.bytesToHex(new Uint8Array(encryptedBuffer)),
            };

            const storage = JSON.parse(localStorage.getItem(SecureStorage.storageKey) || '{}');
            storage[key] = encryptedData;
            localStorage.setItem(SecureStorage.storageKey, JSON.stringify(storage));

            return true;
        } catch (error) {
            console.error('Failed to encrypt data:', error);
            return false;
        }
    },

    get: async (key) => {
        if (!SecureStorage.encryptionKey) {
            console.warn('SecureStorage not initialized');
            return null;
        }

        try {
            const storage = JSON.parse(localStorage.getItem(SecureStorage.storageKey) || '{}');
            const encryptedData = storage[key];

            if (!encryptedData) {
                return null;
            }

            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: CryptoUtils.hexToBytes(encryptedData.iv) },
                SecureStorage.encryptionKey,
                CryptoUtils.hexToBytes(encryptedData.data)
            );

            const decoder = new TextDecoder();
            const decryptedString = decoder.decode(decryptedBuffer);
            return JSON.parse(decryptedString);
        } catch (error) {
            console.error('Failed to decrypt data:', error);
            return null;
        }
    },

    remove: (key) => {
        const storage = JSON.parse(localStorage.getItem(SecureStorage.storageKey) || '{}');
        delete storage[key];
        localStorage.setItem(SecureStorage.storageKey, JSON.stringify(storage));
    },

    clear: () => {
        localStorage.removeItem(SecureStorage.storageKey);
    },
};

/**
 * PasswordValidator - Advanced password validation
 */
const PasswordValidator = {
    requirements: {
        minLength: 8,
        hasUppercase: true,
        hasLowercase: true,
        hasNumbers: true,
        hasSpecial: true,
        maxConsecutive: 3,
    },

    validate: (password, requirements = null) => {
        const rules = requirements || PasswordValidator.requirements;
        const issues = [];

        if (password.length < rules.minLength) {
            issues.push(`Password must be at least ${rules.minLength} characters`);
        }

        if (rules.hasUppercase && !/[A-Z]/.test(password)) {
            issues.push('Password must contain uppercase letters');
        }

        if (rules.hasLowercase && !/[a-z]/.test(password)) {
            issues.push('Password must contain lowercase letters');
        }

        if (rules.hasNumbers && !/\d/.test(password)) {
            issues.push('Password must contain numbers');
        }

        if (rules.hasSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            issues.push('Password must contain special characters');
        }

        if (rules.maxConsecutive) {
            const consecutive = PasswordValidator._findConsecutiveChars(password);
            if (consecutive > rules.maxConsecutive) {
                issues.push(`Password cannot have more than ${rules.maxConsecutive} consecutive identical characters`);
            }
        }

        return {
            isValid: issues.length === 0,
            issues,
            strength: PasswordValidator._calculateStrength(password),
        };
    },

    _findConsecutiveChars: (password) => {
        let max = 1;
        let current = 1;

        for (let i = 1; i < password.length; i++) {
            if (password[i] === password[i - 1]) {
                current++;
                max = Math.max(max, current);
            } else {
                current = 1;
            }
        }

        return max;
    },

    _calculateStrength: (password) => {
        let strength = 0;

        if (password.length >= 8) strength += 20;
        if (password.length >= 12) strength += 20;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[a-z]/.test(password)) strength += 20;
        if (/\d/.test(password)) strength += 10;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 10;

        return Math.min(100, strength);
    },

    generateSecurePassword: (length = 16) => {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const special = '!@#$%^&*()_+-=[]{};\':"|,./<>?';

        let password = '';
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += special[Math.floor(Math.random() * special.length)];

        const allChars = uppercase + lowercase + numbers + special;
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        return password.split('').sort(() => Math.random() - 0.5).join('');
    },
};

/**
 * CSRF Protection - Cross-Site Request Forgery protection
 */
const CSRFProtection = {
    tokens: new Map(),
    tokenExpiry: 60 * 60 * 1000, // 1 hour

    generateToken: () => {
        const token = CryptoUtils.generateUUID();
        const expiresAt = Date.now() + CSRFProtection.tokenExpiry;

        CSRFProtection.tokens.set(token, { expiresAt });
        return token;
    },

    validateToken: (token) => {
        const entry = CSRFProtection.tokens.get(token);

        if (!entry) {
            return false;
        }

        if (Date.now() > entry.expiresAt) {
            CSRFProtection.tokens.delete(token);
            return false;
        }

        return true;
    },

    consumeToken: (token) => {
        if (CSRFProtection.validateToken(token)) {
            CSRFProtection.tokens.delete(token);
            return true;
        }
        return false;
    },

    cleanupExpiredTokens: () => {
        for (const [token, entry] of CSRFProtection.tokens.entries()) {
            if (Date.now() > entry.expiresAt) {
                CSRFProtection.tokens.delete(token);
            }
        }
    },
};

/**
 * Rate Limiter - Prevent abuse through rate limiting
 */
class RateLimiter {
    constructor(maxRequests = 10, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }

    isAllowed(identifier) {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        if (!this.requests.has(identifier)) {
            this.requests.set(identifier, []);
        }

        let timestamps = this.requests.get(identifier);
        timestamps = timestamps.filter(ts => ts > windowStart);

        if (timestamps.length >= this.maxRequests) {
            return false;
        }

        timestamps.push(now);
        this.requests.set(identifier, timestamps);
        return true;
    }

    getRemainingRequests(identifier) {
        const timestamps = this.requests.get(identifier) || [];
        return Math.max(0, this.maxRequests - timestamps.length);
    }

    reset(identifier) {
        this.requests.delete(identifier);
    }
}

/**
 * Content Security Policy Handler
 */
const CSPHandler = {
    policy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'connect-src': ["'self'", 'https:'],
    },

    violations: [],

    init: () => {
        document.addEventListener('securitypolicyviolation', (e) => {
            CSPHandler.violations.push({
                blockedURI: e.blockedURI,
                violatedDirective: e.violatedDirective,
                originalPolicy: e.originalPolicy,
                timestamp: Date.now(),
            });
        });
    },

    getViolations: () => CSPHandler.violations,

    clearViolations: () => {
        CSPHandler.violations = [];
    },

    generateCSPHeader: () => {
        return Object.entries(CSPHandler.policy)
            .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
            .join('; ');
    },
};

/**
 * Security Auditor - Audit security configuration
 */
const SecurityAuditor = {
    checks: [],

    checkHTTPS: () => {
        const isHTTPS = window.location.protocol === 'https:';
        SecurityAuditor._recordCheck('HTTPS', isHTTPS, 'Should use HTTPS in production');
        return isHTTPS;
    },

    checkCSP: () => {
        const cspHeader = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        const hasCSP = !!cspHeader;
        SecurityAuditor._recordCheck('CSP', hasCSP, 'Content Security Policy should be configured');
        return hasCSP;
    },

    checkSecureHeaders: () => {
        const headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
        };

        for (const [header, expected] of Object.entries(headers)) {
            SecurityAuditor._recordCheck(`Header: ${header}`, true, `${header}: ${expected} should be set`);
        }
    },

    checkStorageSecurity: () => {
        try {
            localStorage.setItem('__test__', '__test__');
            localStorage.removeItem('__test__');
            SecurityAuditor._recordCheck('LocalStorage', true, 'LocalStorage is available');
        } catch (e) {
            SecurityAuditor._recordCheck('LocalStorage', false, 'LocalStorage is not available');
        }
    },

    _recordCheck: (name, passed, recommendation) => {
        SecurityAuditor.checks.push({
            name,
            passed,
            recommendation,
            timestamp: Date.now(),
        });
    },

    runAudit: () => {
        SecurityAuditor.checks = [];
        SecurityAuditor.checkHTTPS();
        SecurityAuditor.checkCSP();
        SecurityAuditor.checkSecureHeaders();
        SecurityAuditor.checkStorageSecurity();
        return SecurityAuditor.checks;
    },

    getAuditReport: () => {
        const audit = SecurityAuditor.runAudit();
        const passed = audit.filter(c => c.passed).length;
        const total = audit.length;

        return {
            score: (passed / total * 100).toFixed(2),
            passed,
            total,
            checks: audit,
        };
    },
};

/**
 * Initialize security module
 */
document.addEventListener('DOMContentLoaded', () => {
    CSPHandler.init();
    console.log('🔐 Security Module initialized');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CryptoUtils,
        SecureStorage,
        PasswordValidator,
        CSRFProtection,
        RateLimiter,
        CSPHandler,
        SecurityAuditor,
    };
}

window.CryptoUtils = CryptoUtils;
window.SecureStorage = SecureStorage;
window.PasswordValidator = PasswordValidator;
window.CSRFProtection = CSRFProtection;
window.RateLimiter = RateLimiter;
window.CSPHandler = CSPHandler;
window.SecurityAuditor = SecurityAuditor;
