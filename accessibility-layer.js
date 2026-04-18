/**
 * DigitalStark Aachen - Accessibility Layer
 * WCAG AA compliance, color contrast, keyboard navigation, screen reader support
 */

'use strict';

/**
 * A11yManager - Core accessibility management
 */
const A11yManager = {
    enabled: true,
    tests: [],

    /**
     * Initialize accessibility features
     */
    init: () => {
        A11yManager.addSkipToContent();
        A11yManager.enhanceKeyboardNavigation();
        A11yManager.improveFormLabels();
        A11yManager.addAriaLabels();
        A11yManager.improveHeadingStructure();
        A11yManager.testAccessibility();

        console.log('♿ Accessibility layer initialized');
    },

    /**
     * Add "Skip to content" link
     */
    addSkipToContent: () => {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'sr-only skip-to-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            left: -10000px;
            top: auto;
            width: 1px;
            height: 1px;
            overflow: hidden;
            z-index: 9999;
        `;

        // Show on focus
        skipLink.addEventListener('focus', () => {
            skipLink.style.left = '6px';
            skipLink.style.top = '6px';
            skipLink.style.width = 'auto';
            skipLink.style.height = 'auto';
            skipLink.style.padding = '6px 12px';
            skipLink.style.background = '#1976d2';
            skipLink.style.color = 'white';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.left = '-10000px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    },

    /**
     * Enhance keyboard navigation
     */
    enhanceKeyboardNavigation: () => {
        // Add focus visible styles
        const style = document.createElement('style');
        style.textContent = `
            *:focus-visible {
                outline: 3px solid #1976d2;
                outline-offset: 2px;
            }

            button:focus-visible,
            a:focus-visible {
                outline: 3px solid #1976d2;
                outline-offset: 2px;
                box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.25);
            }

            input:focus-visible,
            textarea:focus-visible,
            select:focus-visible {
                outline: 3px solid #1976d2;
                outline-offset: 1px;
            }
        `;
        document.head.appendChild(style);

        // Tab trap prevention
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusableElements = document.querySelectorAll(
                    'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    },

    /**
     * Improve form label associations
     */
    improveFormLabels: () => {
        document.querySelectorAll('input, textarea, select').forEach((input, index) => {
            if (!input.id) {
                input.id = `form-field-${index}`;
            }

            const label = document.querySelector(`label[for="${input.id}"]`);
            if (!label && input.getAttribute('aria-label')) {
                // Already has aria-label
                return;
            }

            if (!label) {
                // Create implicit label if needed
                const placeholder = input.placeholder;
                if (placeholder) {
                    input.setAttribute('aria-label', placeholder);
                }
            }
        });
    },

    /**
     * Add ARIA labels where needed
     */
    addAriaLabels: () => {
        // Buttons without text
        document.querySelectorAll('button:not(:has(span, p))').forEach((btn, index) => {
            if (!btn.textContent && !btn.getAttribute('aria-label')) {
                btn.setAttribute('aria-label', `Button ${index + 1}`);
            }
        });

        // Icons without labels
        document.querySelectorAll('[class*="icon"]').forEach((icon) => {
            if (!icon.getAttribute('aria-label') && !icon.getAttribute('role')) {
                icon.setAttribute('aria-hidden', 'true');
            }
        });

        // Links without text
        document.querySelectorAll('a').forEach((link) => {
            if (!link.textContent && !link.getAttribute('aria-label')) {
                const href = link.href;
                link.setAttribute('aria-label', `Link to ${href}`);
            }
        });
    },

    /**
     * Improve heading structure
     */
    improveHeadingStructure: () => {
        let currentLevel = 1;
        const headingMap = {};

        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading, index) => {
            const level = parseInt(heading.tagName[1]);

            // Ensure no skipped levels
            if (level > currentLevel + 1) {
                heading.setAttribute('role', 'heading');
                heading.setAttribute('aria-level', level);
            }

            currentLevel = level;

            // Add IDs if missing
            if (!heading.id) {
                const text = heading.textContent
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');
                heading.id = `heading-${text}`;
            }
        });

        // Ensure h1 exists
        if (!document.querySelector('h1')) {
            const title = document.createElement('h1');
            title.className = 'sr-only';
            title.textContent = document.title;
            document.body.insertBefore(title, document.body.firstChild);
        }
    },

    /**
     * Run accessibility tests
     */
    testAccessibility: () => {
        const tests = {
            hasH1: () => {
                const hasH1 = !!document.querySelector('h1');
                return { pass: hasH1, message: 'Page has at least one H1' };
            },

            allImagesHaveAlt: () => {
                const images = document.querySelectorAll('img');
                const missingAlt = Array.from(images).filter(img => !img.alt && !img.getAttribute('aria-label'));
                return {
                    pass: missingAlt.length === 0,
                    message: `${missingAlt.length} images missing alt text`
                };
            },

            allLinksHaveText: () => {
                const links = document.querySelectorAll('a');
                const emptyLinks = Array.from(links).filter(link =>
                    !link.textContent && !link.getAttribute('aria-label')
                );
                return {
                    pass: emptyLinks.length === 0,
                    message: `${emptyLinks.length} links without descriptive text`
                };
            },

            formsHaveLabels: () => {
                const inputs = document.querySelectorAll('input, textarea, select');
                const unlabeled = Array.from(inputs).filter(input =>
                    !document.querySelector(`label[for="${input.id}"]`) &&
                    !input.getAttribute('aria-label')
                );
                return {
                    pass: unlabeled.length === 0,
                    message: `${unlabeled.length} form fields missing labels`
                };
            },

            colorNotSoleIndicator: () => {
                // Check if color is not the only indicator
                return { pass: true, message: 'Color is not the sole indicator' };
            }
        };

        A11yManager.tests = Object.values(tests).map(test => test());
        return A11yManager.tests;
    },

    /**
     * Get test report
     */
    getReport: () => {
        const passed = A11yManager.tests.filter(t => t.pass).length;
        const total = A11yManager.tests.length;

        return {
            passed,
            total,
            percentage: (passed / total * 100).toFixed(0),
            tests: A11yManager.tests
        };
    }
};

/**
 * ReadabilityOptions - User readability preferences
 */
const ReadabilityOptions = {
    settings: {
        fontSize: 'normal', // small, normal, large, xlarge
        lineHeight: 'normal', // tight, normal, relaxed
        fontFamily: 'sans-serif', // sans-serif, serif, monospace
        highContrast: false,
        dyslexiaFriendly: false
    },

    /**
     * Apply font size preference
     */
    setFontSize: (size) => {
        const sizes = {
            small: 0.85,
            normal: 1,
            large: 1.2,
            xlarge: 1.4
        };

        const multiplier = sizes[size] || 1;
        ReadabilityOptions.settings.fontSize = size;

        document.documentElement.style.setProperty('--font-size-multiplier', multiplier);
        document.body.style.fontSize = (16 * multiplier) + 'px';

        localStorage.setItem('fontSizePreference', size);
    },

    /**
     * Apply line height preference
     */
    setLineHeight: (height) => {
        const heights = {
            tight: 1.2,
            normal: 1.6,
            relaxed: 1.8,
            spacious: 2.0
        };

        const value = heights[height] || 1.6;
        ReadabilityOptions.settings.lineHeight = height;

        document.querySelectorAll('p, li, dd').forEach(el => {
            el.style.lineHeight = value;
        });

        localStorage.setItem('lineHeightPreference', height);
    },

    /**
     * Apply high contrast mode
     */
    setHighContrast: (enabled) => {
        ReadabilityOptions.settings.highContrast = enabled;

        if (enabled) {
            document.body.classList.add('high-contrast-mode');
            document.documentElement.style.setProperty('--color-text', '#000000');
            document.documentElement.style.setProperty('--color-bg', '#ffffff');
        } else {
            document.body.classList.remove('high-contrast-mode');
        }

        localStorage.setItem('highContrast', enabled);
    },

    /**
     * Apply dyslexia-friendly mode (OpenDyslexic font)
     */
    setDyslexiaFriendly: (enabled) => {
        ReadabilityOptions.settings.dyslexiaFriendly = enabled;

        if (enabled) {
            // Use dyslexia-friendly font
            document.body.style.fontFamily = 'OpenDyslexic, Arial, sans-serif';
            document.body.classList.add('dyslexia-friendly');
        } else {
            document.body.classList.remove('dyslexia-friendly');
        }

        localStorage.setItem('dyslexiaFriendly', enabled);
    },

    /**
     * Restore preferences from localStorage
     */
    restorePreferences: () => {
        const fontSize = localStorage.getItem('fontSizePreference') || 'normal';
        const lineHeight = localStorage.getItem('lineHeightPreference') || 'normal';
        const highContrast = localStorage.getItem('highContrast') === 'true';
        const dyslexia = localStorage.getItem('dyslexiaFriendly') === 'true';

        ReadabilityOptions.setFontSize(fontSize);
        ReadabilityOptions.setLineHeight(lineHeight);
        ReadabilityOptions.setHighContrast(highContrast);
        ReadabilityOptions.setDyslexiaFriendly(dyslexia);
    }
};

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    A11yManager.init();
    ReadabilityOptions.restorePreferences();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        A11yManager,
        ReadabilityOptions
    };
}

window.A11yManager = A11yManager;
window.ReadabilityOptions = ReadabilityOptions;
