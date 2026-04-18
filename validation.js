/**
 * DigitalStark Aachen - Advanced Validation System
 * Comprehensive data validation with custom rules and error messaging
 */

'use strict';

/**
 * Validator - Schema-based validation engine
 */
const Validator = {
    rules: {},
    customRules: {},
    messages: {},

    /**
     * Register custom validation rule
     */
    registerRule: (name, validatorFn, message) => {
        Validator.customRules[name] = validatorFn;
        Validator.messages[name] = message || `Validation failed for rule: ${name}`;
    },

    /**
     * Validate object against schema
     */
    validate: (obj, schema) => {
        const errors = {};

        for (const [field, rules] of Object.entries(schema)) {
            const value = obj[field];
            const fieldErrors = [];

            for (const rule of rules) {
                const error = Validator._applyRule(value, rule, field);
                if (error) fieldErrors.push(error);
            }

            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    },

    /**
     * Apply validation rule
     */
    _applyRule: (value, rule, field) => {
        if (typeof rule === 'string') {
            return Validator._validateBuiltIn(value, rule, field);
        }

        if (typeof rule === 'object') {
            return Validator._validateObject(value, rule, field);
        }

        if (typeof rule === 'function') {
            return rule(value) === true ? null : `${field} is invalid`;
        }

        return null;
    },

    /**
     * Validate built-in rules
     */
    _validateBuiltIn: (value, ruleName, field) => {
        const rules = {
            required: () => !value ? `${field} is required` : null,
            email: () => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? `${field} must be valid email` : null,
            phone: () => !/^[\d\s\-\+\(\)]{10,}$/.test(value) ? `${field} must be valid phone` : null,
            url: () => {
                try {
                    new URL(value);
                    return null;
                } catch {
                    return `${field} must be valid URL`;
                }
            },
            minLength: () => value?.length < value?.minLength ? `${field} must be at least ${value.minLength} characters` : null,
            maxLength: () => value?.length > value?.maxLength ? `${field} must be at most ${value.maxLength} characters` : null,
            numeric: () => isNaN(value) ? `${field} must be numeric` : null,
            integer: () => !Number.isInteger(Number(value)) ? `${field} must be integer` : null,
            alpha: () => !/^[a-zA-Z]+$/.test(value) ? `${field} must contain only letters` : null,
            alphanumeric: () => !/^[a-zA-Z0-9]+$/.test(value) ? `${field} must be alphanumeric` : null,
            lowercase: () => value !== value?.toLowerCase() ? `${field} must be lowercase` : null,
            uppercase: () => value !== value?.toUpperCase() ? `${field} must be uppercase` : null,
            date: () => isNaN(Date.parse(value)) ? `${field} must be valid date` : null,
        };

        const rule = rules[ruleName];
        return rule ? rule() : null;
    },

    /**
     * Validate object rules
     */
    _validateObject: (value, rule, field) => {
        if (rule.type) {
            if (typeof value !== rule.type) {
                return `${field} must be ${rule.type}`;
            }
        }

        if (rule.pattern && !rule.pattern.test(value)) {
            return `${field} does not match required pattern`;
        }

        if (rule.min !== undefined && value < rule.min) {
            return `${field} must be at least ${rule.min}`;
        }

        if (rule.max !== undefined && value > rule.max) {
            return `${field} must be at most ${rule.max}`;
        }

        if (rule.length !== undefined && value?.length !== rule.length) {
            return `${field} must be exactly ${rule.length} characters`;
        }

        if (rule.minLength !== undefined && value?.length < rule.minLength) {
            return `${field} must be at least ${rule.minLength} characters`;
        }

        if (rule.maxLength !== undefined && value?.length > rule.maxLength) {
            return `${field} must be at most ${rule.maxLength} characters`;
        }

        if (rule.enum && !rule.enum.includes(value)) {
            return `${field} must be one of: ${rule.enum.join(', ')}`;
        }

        if (rule.custom && !rule.custom(value)) {
            return rule.message || `${field} is invalid`;
        }

        return null;
    },

    /**
     * Create schema builder
     */
    schema: () => {
        const schema = {};

        return {
            field: (name) => {
                schema[name] = [];
                return {
                    required: function() {
                        schema[name].push('required');
                        return this;
                    },
                    email: function() {
                        schema[name].push('email');
                        return this;
                    },
                    phone: function() {
                        schema[name].push('phone');
                        return this;
                    },
                    url: function() {
                        schema[name].push('url');
                        return this;
                    },
                    minLength: function(len) {
                        schema[name].push({ minLength: len });
                        return this;
                    },
                    maxLength: function(len) {
                        schema[name].push({ maxLength: len });
                        return this;
                    },
                    min: function(val) {
                        schema[name].push({ min: val });
                        return this;
                    },
                    max: function(val) {
                        schema[name].push({ max: val });
                        return this;
                    },
                    pattern: function(regex) {
                        schema[name].push({ pattern: regex });
                        return this;
                    },
                    enum: function(values) {
                        schema[name].push({ enum: values });
                        return this;
                    },
                    custom: function(fn, message) {
                        schema[name].push({ custom: fn, message });
                        return this;
                    },
                    parent: () => ({ build: () => schema }),
                };
            },
            build: () => schema,
        };
    },
};

/**
 * ValidationError - Custom error for validation failures
 */
class ValidationError extends Error {
    constructor(message, errors = {}) {
        super(message);
        this.name = 'ValidationError';
        this.errors = errors;
    }

    getErrorMessage(field) {
        return this.errors[field]?.[0] || null;
    }

    getErrorMessages(field) {
        return this.errors[field] || [];
    }

    hasError(field) {
        return field in this.errors;
    }

    getAllErrors() {
        return this.errors;
    }
}

/**
 * FormValidator - Form-specific validation
 */
const FormValidator = {
    /**
     * Validate form element
     */
    validateElement: (element, schema) => {
        const name = element.name;
        const rules = schema[name];

        if (!rules) return { isValid: true, errors: [] };

        const errors = [];
        const value = element.value;

        for (const rule of rules) {
            const error = Validator._applyRule(value, rule, name);
            if (error) errors.push(error);
        }

        return { isValid: errors.length === 0, errors };
    },

    /**
     * Validate form
     */
    validateForm: (form, schema) => {
        const data = new FormData(form);
        const obj = Object.fromEntries(data);

        return Validator.validate(obj, schema);
    },

    /**
     * Display validation errors
     */
    displayErrors: (form, errors) => {
        // Clear previous errors
        form.querySelectorAll('.field-error').forEach(el => el.remove());
        form.querySelectorAll('input, textarea, select').forEach(el => el.classList.remove('has-error'));

        // Display new errors
        for (const [field, fieldErrors] of Object.entries(errors)) {
            const element = form.querySelector(`[name="${field}"]`);
            if (element) {
                element.classList.add('has-error');

                const errorDiv = document.createElement('div');
                errorDiv.className = 'field-error';
                errorDiv.innerHTML = fieldErrors.map(err => `<span>${err}</span>`).join('<br>');

                element.parentElement.appendChild(errorDiv);
            }
        }
    },

    /**
     * Real-time validation
     */
    enableRealTime: (form, schema) => {
        form.querySelectorAll('input, textarea, select').forEach(element => {
            element.addEventListener('blur', () => {
                const result = FormValidator.validateElement(element, schema);
                const errorDiv = element.parentElement.querySelector('.field-error');

                if (result.isValid) {
                    element.classList.remove('has-error');
                    if (errorDiv) errorDiv.remove();
                } else {
                    element.classList.add('has-error');
                    if (errorDiv) {
                        errorDiv.innerHTML = result.errors.map(err => `<span>${err}</span>`).join('<br>');
                    } else {
                        const newErrorDiv = document.createElement('div');
                        newErrorDiv.className = 'field-error';
                        newErrorDiv.innerHTML = result.errors.map(err => `<span>${err}</span>`).join('<br>');
                        element.parentElement.appendChild(newErrorDiv);
                    }
                }
            });
        });
    },
};

/**
 * Sanitizer - Input sanitization
 */
const Sanitizer = {
    /**
     * Sanitize HTML
     */
    sanitizeHTML: (html) => {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },

    /**
     * Sanitize URL
     */
    sanitizeURL: (url) => {
        try {
            const parsed = new URL(url);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return '';
            }
            return parsed.toString();
        } catch {
            return '';
        }
    },

    /**
     * Sanitize string (remove dangerous characters)
     */
    sanitizeString: (str) => {
        return str.replace(/[<>\"']/g, char => {
            const map = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            };
            return map[char];
        });
    },

    /**
     * Sanitize object
     */
    sanitizeObject: (obj) => {
        const sanitized = {};

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = Sanitizer.sanitizeString(value);
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = Sanitizer.sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Validator,
        ValidationError,
        FormValidator,
        Sanitizer,
    };
}

// Make available globally
window.Validator = Validator;
window.ValidationError = ValidationError;
window.FormValidator = FormValidator;
window.Sanitizer = Sanitizer;
