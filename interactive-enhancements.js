/**
 * DigitalStark Aachen - Interactive Enhancements
 * Refined button, form, and card interactions with smooth feedback
 */

'use strict';

/**
 * ButtonEnhancer - Improve button interactions
 */
const ButtonEnhancer = {
    /**
     * Add ripple effect to button
     */
    addRipple: (button) => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const radius = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - radius / 2;
            const y = e.clientY - rect.top - radius / 2;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                width: ${radius}px;
                height: ${radius}px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                animation: ripple-expand 0.6s ease-out forwards;
            `;

            if (this.style.position === 'static') {
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
            }

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    },

    /**
     * Add hover scale effect
     */
    addHoverScale: (button, scale = 1.05, duration = 300) => {
        button.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

        button.addEventListener('mouseenter', () => {
            button.style.transform = `scale(${scale})`;
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    },

    /**
     * Add active state feedback
     */
    addActiveState: (button) => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.98)';
        });

        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1)';
        });
    },

    /**
     * Add loading state
     */
    setLoadingState: (button, isLoading = true) => {
        if (isLoading) {
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            const originalText = button.textContent;
            button.innerHTML = '<span class="spinner"></span> Loading...';
            button.dataset.originalText = originalText;
        } else {
            button.disabled = false;
            button.setAttribute('aria-busy', 'false');
            button.textContent = button.dataset.originalText || 'Submit';
        }
    },

    /**
     * Enhance all buttons
     */
    enhanceAll: (selector = 'button, .btn') => {
        document.querySelectorAll(selector).forEach(button => {
            ButtonEnhancer.addRipple(button);
            ButtonEnhancer.addHoverScale(button);
            ButtonEnhancer.addActiveState(button);
        });
    }
};

/**
 * FormEnhancer - Improve form interactions
 */
const FormEnhancer = {
    /**
     * Add focus effect to input
     */
    addFocusEffect: (input) => {
        const container = input.parentElement;
        if (!container.style.position) {
            container.style.position = 'relative';
        }

        input.addEventListener('focus', () => {
            container.style.transform = 'translateY(-2px)';
            container.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
        });

        input.addEventListener('blur', () => {
            container.style.transform = 'translateY(0)';
            container.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
        });
    },

    /**
     * Add label animation
     */
    addLabelAnimation: (input) => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (!label) return;

        const moveLabel = () => {
            if (input.value || document.activeElement === input) {
                label.style.transform = 'translateY(-1.5em) scale(0.85)';
                label.style.color = '#42a5f5';
            } else {
                label.style.transform = 'translateY(0) scale(1)';
                label.style.color = '#666';
            }
        };

        input.addEventListener('focus', moveLabel);
        input.addEventListener('blur', moveLabel);
        input.addEventListener('input', moveLabel);
    },

    /**
     * Add validation feedback
     */
    addValidationFeedback: (input) => {
        input.addEventListener('invalid', () => {
            input.classList.add('invalid');
            input.style.borderColor = '#f44336';
        });

        input.addEventListener('input', () => {
            if (input.validity.valid) {
                input.classList.remove('invalid');
                input.style.borderColor = '#4caf50';
            } else {
                input.classList.add('invalid');
                input.style.borderColor = '#f44336';
            }
        });
    },

    /**
     * Add success state
     */
    setSuccessState: (input, message = '') => {
        input.style.borderColor = '#4caf50';
        input.style.backgroundColor = '#f1f8f4';

        if (message) {
            const feedback = document.createElement('small');
            feedback.style.cssText = `
                color: #4caf50;
                display: block;
                margin-top: 4px;
                font-weight: 500;
            `;
            feedback.textContent = message;
            input.parentElement.appendChild(feedback);
        }
    },

    /**
     * Add error state
     */
    setErrorState: (input, message = '') => {
        input.style.borderColor = '#f44336';
        input.style.backgroundColor = '#ffebee';

        if (message) {
            const feedback = document.createElement('small');
            feedback.style.cssText = `
                color: #f44336;
                display: block;
                margin-top: 4px;
                font-weight: 500;
            `;
            feedback.textContent = message;
            input.parentElement.appendChild(feedback);
        }
    },

    /**
     * Enhance all form inputs
     */
    enhanceAll: (selector = 'input, textarea, select') => {
        document.querySelectorAll(selector).forEach(input => {
            input.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            FormEnhancer.addFocusEffect(input);
            FormEnhancer.addLabelAnimation(input);
            FormEnhancer.addValidationFeedback(input);
        });
    }
};

/**
 * CardEnhancer - Improve card interactions
 */
const CardEnhancer = {
    /**
     * Add hover lift effect
     */
    addHoverLift: (card) => {
        card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        });
    },

    /**
     * Add background change on hover
     */
    addHoverBackground: (card, hoverBg = 'rgba(66, 165, 245, 0.05)') => {
        const originalBg = card.style.backgroundColor || window.getComputedStyle(card).backgroundColor;

        card.addEventListener('mouseenter', () => {
            card.style.backgroundColor = hoverBg;
        });

        card.addEventListener('mouseleave', () => {
            card.style.backgroundColor = originalBg;
        });
    },

    /**
     * Add content reveal animation
     */
    addContentReveal: (card) => {
        const content = card.querySelector('[data-reveal]');
        if (!content) return;

        content.style.maxHeight = '0';
        content.style.overflow = 'hidden';
        content.style.transition = 'max-height 0.3s ease-out';

        card.addEventListener('mouseenter', () => {
            content.style.maxHeight = content.scrollHeight + 'px';
        });

        card.addEventListener('mouseleave', () => {
            content.style.maxHeight = '0';
        });
    },

    /**
     * Add border accent effect
     */
    addBorderAccent: (card, accentColor = '#42a5f5') => {
        card.style.position = 'relative';
        card.style.transition = 'all 0.3s ease-out';

        // Top border
        const border = document.createElement('div');
        border.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: ${accentColor};
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.3s ease-out;
        `;

        card.insertBefore(border, card.firstChild);

        card.addEventListener('mouseenter', () => {
            border.style.transform = 'scaleX(1)';
        });

        card.addEventListener('mouseleave', () => {
            border.style.transform = 'scaleX(0)';
        });
    },

    /**
     * Enhance all cards
     */
    enhanceAll: (selector = '.card, .project-card, .service-item') => {
        document.querySelectorAll(selector).forEach(card => {
            CardEnhancer.addHoverLift(card);
            CardEnhancer.addBorderAccent(card);
            CardEnhancer.addContentReveal(card);
        });
    }
};

/**
 * ClickFeedback - General click feedback system
 */
const ClickFeedback = {
    /**
     * Add click pulse to any element
     */
    addClickPulse: (element) => {
        element.addEventListener('click', function(e) {
            const pulse = document.createElement('div');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 2;

            pulse.style.cssText = `
                position: fixed;
                left: ${e.clientX - size / 2}px;
                top: ${e.clientY - size / 2}px;
                width: ${size}px;
                height: ${size}px;
                background: rgba(66, 165, 245, 0.3);
                border-radius: 50%;
                pointer-events: none;
                animation: pulse-out 0.6s ease-out forwards;
                z-index: 1000;
            `;

            document.body.appendChild(pulse);
            setTimeout(() => pulse.remove(), 600);
        });
    }
};

/**
 * Add animation keyframes to document
 */
const addAnimationStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple-expand {
            from {
                opacity: 1;
                transform: scale(0);
            }
            to {
                opacity: 0;
                transform: scale(1);
            }
        }

        @keyframes pulse-out {
            from {
                opacity: 1;
                transform: scale(0);
            }
            to {
                opacity: 0;
                transform: scale(1);
            }
        }

        .spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 0.8s linear infinite;
            margin-right: 8px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
};

/**
 * Initialize interactive enhancements on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    addAnimationStyles();

    // Enhance all interactive elements
    ButtonEnhancer.enhanceAll();
    FormEnhancer.enhanceAll();
    CardEnhancer.enhanceAll();

    // Add click feedback
    document.querySelectorAll('button, a, [role="button"]').forEach(el => {
        ClickFeedback.addClickPulse(el);
    });

    console.log('✨ Interactive enhancements initialized');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ButtonEnhancer,
        FormEnhancer,
        CardEnhancer,
        ClickFeedback
    };
}

window.ButtonEnhancer = ButtonEnhancer;
window.FormEnhancer = FormEnhancer;
window.CardEnhancer = CardEnhancer;
window.ClickFeedback = ClickFeedback;
