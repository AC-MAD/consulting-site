/**
 * DigitalStark Aachen - Form Handling Module
 * Comprehensive form validation, submission, and management
 */

'use strict';

/**
 * Form Manager - Handles all form operations
 */
const FormManager = {

    /**
     * Validate email format
     */
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate phone number format
     */
    validatePhone: (phone) => {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        return phoneRegex.test(phone);
    },

    /**
     * Validate required field
     */
    validateRequired: (value) => {
        return value && value.trim().length > 0;
    },

    /**
     * Validate minimum length
     */
    validateMinLength: (value, minLength) => {
        return value && value.length >= minLength;
    },

    /**
     * Validate maximum length
     */
    validateMaxLength: (value, maxLength) => {
        return value && value.length <= maxLength;
    },

    /**
     * Validate field
     */
    validateField: (field, rules) => {
        const value = field.value;
        const errors = [];

        if (rules.required && !FormManager.validateRequired(value)) {
            errors.push('Dieses Feld ist erforderlich');
        }

        if (rules.email && value && !FormManager.validateEmail(value)) {
            errors.push('Bitte geben Sie eine gültige E-Mail-Adresse ein');
        }

        if (rules.phone && value && !FormManager.validatePhone(value)) {
            errors.push('Bitte geben Sie eine gültige Telefonnummer ein');
        }

        if (rules.minLength && !FormManager.validateMinLength(value, rules.minLength)) {
            errors.push(`Mindestens ${rules.minLength} Zeichen erforderlich`);
        }

        if (rules.maxLength && !FormManager.validateMaxLength(value, rules.maxLength)) {
            errors.push(`Maximal ${rules.maxLength} Zeichen erlaubt`);
        }

        return errors;
    },

    /**
     * Validate entire form
     */
    validateForm: (form, rules) => {
        const errors = {};
        let isValid = true;

        Object.entries(rules).forEach(([fieldName, fieldRules]) => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                const fieldErrors = FormManager.validateField(field, fieldRules);
                if (fieldErrors.length > 0) {
                    errors[fieldName] = fieldErrors;
                    isValid = false;
                }
            }
        });

        return { isValid, errors };
    },

    /**
     * Show field error
     */
    showFieldError: (field, errors) => {
        const errorElement = field.parentElement.querySelector('.error-message');

        if (errors.length > 0) {
            field.classList.add('error');

            if (errorElement) {
                errorElement.textContent = errors[0];
                errorElement.style.display = 'block';
            } else {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = errors[0];
                error.style.color = '#d32f2f';
                error.style.fontSize = '12px';
                error.style.marginTop = '4px';
                field.parentElement.appendChild(error);
            }
        } else {
            field.classList.remove('error');

            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
    },

    /**
     * Clear form errors
     */
    clearFormErrors: (form) => {
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            field.classList.remove('error');
            const errorElement = field.parentElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        });
    },

    /**
     * Get form data as object
     */
    getFormData: (form) => {
        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        return data;
    },

    /**
     * Submit form with validation
     */
    submitForm: async (form, endpoint, options = {}) => {
        const {
            rules = {},
            onSuccess = null,
            onError = null,
            showLoading = true,
            clearAfterSubmit = true,
        } = options;

        // Validate form
        const { isValid, errors } = FormManager.validateForm(form, rules);

        if (!isValid) {
            // Show validation errors
            Object.entries(errors).forEach(([fieldName, fieldErrors]) => {
                const field = form.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    FormManager.showFieldError(field, fieldErrors);
                }
            });

            if (onError) {
                onError(new Error('Form validation failed'));
            }

            return false;
        }

        // Clear previous errors
        FormManager.clearFormErrors(form);

        // Get form data
        const data = FormManager.getFormData(form);

        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        if (showLoading && submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Wird gesendet...';
        }

        try {
            // Submit form
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Success callback
            if (onSuccess) {
                onSuccess(result);
            }

            // Clear form
            if (clearAfterSubmit) {
                form.reset();
            }

            return true;

        } catch (error) {
            console.error('Form submission error:', error);

            // Error callback
            if (onError) {
                onError(error);
            }

            return false;

        } finally {
            // Reset button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Senden';
            }
        }
    },

    /**
     * Save form data to localStorage for persistence
     */
    saveFormDraft: (form, storageKey) => {
        const data = FormManager.getFormData(form);
        localStorage.setItem(storageKey, JSON.stringify(data));
    },

    /**
     * Load form data from localStorage
     */
    loadFormDraft: (form, storageKey) => {
        const data = JSON.parse(localStorage.getItem(storageKey));

        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = value;
                }
            });

            return true;
        }

        return false;
    },

    /**
     * Clear form draft
     */
    clearFormDraft: (storageKey) => {
        localStorage.removeItem(storageKey);
    },
};

/**
 * Input Handler - Advanced input field handling
 */
const InputHandler = {

    /**
     * Mask input field (e.g., phone number, credit card)
     */
    maskInput: (field, pattern) => {
        field.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            let maskedValue = '';
            let patternIndex = 0;

            for (let i = 0; i < pattern.length && patternIndex < value.length; i++) {
                if (pattern[i] === 'X') {
                    maskedValue += value[patternIndex++];
                } else {
                    maskedValue += pattern[i];
                }
            }

            e.target.value = maskedValue;
        });
    },

    /**
     * Auto-capitalize input
     */
    autoCapitalize: (field) => {
        field.addEventListener('blur', (e) => {
            e.target.value = e.target.value
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        });
    },

    /**
     * Auto-correct common mistakes
     */
    autoCorrect: (field, corrections = {}) => {
        field.addEventListener('blur', (e) => {
            let value = e.target.value;

            Object.entries(corrections).forEach(([mistake, correction]) => {
                const regex = new RegExp(`\\b${mistake}\\b`, 'gi');
                value = value.replace(regex, correction);
            });

            e.target.value = value;
        });
    },

    /**
     * Character counter for textarea
     */
    addCharacterCounter: (field, maxLength = null) => {
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = `
            font-size: 12px;
            color: #999;
            margin-top: 4px;
            text-align: right;
        `;

        field.parentElement.appendChild(counter);

        const updateCounter = () => {
            const remaining = maxLength ? maxLength - field.value.length : field.value.length;
            counter.textContent = maxLength
                ? `${field.value.length}/${maxLength}`
                : `${remaining} Zeichen`;

            if (maxLength && remaining < 50) {
                counter.style.color = '#d32f2f';
            } else if (maxLength && remaining < 100) {
                counter.style.color = '#f57c00';
            } else {
                counter.style.color = '#999';
            }
        };

        field.addEventListener('input', updateCounter);
        updateCounter();
    },

    /**
     * Password strength indicator
     */
    addPasswordStrength: (field) => {
        const indicator = document.createElement('div');
        indicator.className = 'password-strength';
        indicator.style.cssText = `
            margin-top: 8px;
            height: 4px;
            background: #e0e0e0;
            border-radius: 2px;
            overflow: hidden;
        `;

        const strength = document.createElement('div');
        strength.style.cssText = `
            width: 0%;
            height: 100%;
            transition: width 0.3s, background-color 0.3s;
        `;

        indicator.appendChild(strength);
        field.parentElement.appendChild(indicator);

        field.addEventListener('input', (e) => {
            const value = e.target.value;
            let score = 0;
            let color = '#d32f2f';

            // Length check
            if (value.length >= 8) score += 1;
            if (value.length >= 12) score += 1;

            // Character variety
            if (/[a-z]/.test(value)) score += 1;
            if (/[A-Z]/.test(value)) score += 1;
            if (/[0-9]/.test(value)) score += 1;
            if (/[^a-zA-Z0-9]/.test(value)) score += 1;

            // Determine color and width
            if (score < 2) {
                color = '#d32f2f';
            } else if (score < 4) {
                color = '#f57c00';
            } else if (score < 6) {
                color = '#fbc02d';
            } else {
                color = '#388e3c';
            }

            strength.style.width = `${(score / 6) * 100}%`;
            strength.style.backgroundColor = color;
        });
    },
};

/**
 * Initialize contact form
 */
function initializeContactForm(formSelector, endpoint) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    // Form validation rules
    const validationRules = {
        name: { required: true, minLength: 2, maxLength: 100 },
        email: { required: true, email: true },
        message: { required: true, minLength: 10, maxLength: 5000 },
    };

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const success = await FormManager.submitForm(form, endpoint, {
            rules: validationRules,
            onSuccess: (result) => {
                console.log('Form submitted successfully:', result);
                alert('Nachricht gesendet! Danke für Ihre Kontaktaufnahme.');
            },
            onError: (error) => {
                console.error('Form submission error:', error);
                alert('Es gab einen Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.');
            },
        });

        return success;
    });

    // Real-time field validation
    form.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('blur', () => {
            const fieldName = field.name;
            const rules = validationRules[fieldName];

            if (rules) {
                const errors = FormManager.validateField(field, rules);
                FormManager.showFieldError(field, errors);
            }
        });

        field.addEventListener('focus', () => {
            field.classList.remove('error');
        });
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FormManager,
        InputHandler,
        initializeContactForm,
    };
}

// Make available globally
window.FormManager = FormManager;
window.InputHandler = InputHandler;
