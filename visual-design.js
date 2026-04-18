/**
 * DigitalStark Aachen - Visual Design & Contrast Management System
 * Smart contrast management, section theming, and visual polish animations
 */

'use strict';

/**
 * ContrastManager - Ensure all text meets WCAG AA standards
 */
const ContrastManager = {
    minRatio: 4.5, // WCAG AA standard
    checkedElements: new Set(),
    violations: [],

    /**
     * Calculate relative luminance per WCAG formula
     */
    calculateLuminance: (rgb) => {
        const [r, g, b] = rgb.map(val => {
            val = val / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },

    /**
     * Parse RGB color string
     */
    parseRGB: (rgbString) => {
        const match = rgbString.match(/\d+/g);
        return match ? match.map(Number) : [255, 255, 255];
    },

    /**
     * Calculate contrast ratio between two colors
     */
    calculateContrastRatio: (color1, color2) => {
        const lum1 = ContrastManager.calculateLuminance(ContrastManager.parseRGB(color1));
        const lum2 = ContrastManager.calculateLuminance(ContrastManager.parseRGB(color2));
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
    },

    /**
     * Check if text color has sufficient contrast against background
     */
    checkContrast: (element) => {
        if (ContrastManager.checkedElements.has(element)) return;
        ContrastManager.checkedElements.add(element);

        const textColor = window.getComputedStyle(element).color;
        const bgColor = window.getComputedStyle(element).backgroundColor;

        const ratio = ContrastManager.calculateContrastRatio(textColor, bgColor);

        if (ratio < ContrastManager.minRatio) {
            ContrastManager.violations.push({
                element,
                ratio: ratio.toFixed(2),
                required: ContrastManager.minRatio,
                message: `Text contrast ratio ${ratio.toFixed(2)}:1 is below ${ContrastManager.minRatio}:1`
            });

            console.warn(`⚠️ Low contrast detected on ${element.tagName}:`, ratio.toFixed(2) + ':1');
        }
    },

    /**
     * Check all text elements on page
     */
    checkAllElements: () => {
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, label, span');
        textElements.forEach(el => ContrastManager.checkContrast(el));

        if (ContrastManager.violations.length > 0) {
            console.warn(`🎨 Found ${ContrastManager.violations.length} contrast violations`);
        } else {
            console.log('✅ All text meets WCAG AA contrast standards');
        }

        return ContrastManager.violations;
    },

    /**
     * Get violations report
     */
    getReport: () => ({
        totalViolations: ContrastManager.violations.length,
        violations: ContrastManager.violations,
        compliant: ContrastManager.violations.length === 0
    }),

    /**
     * Clear checks for re-validation
     */
    reset: () => {
        ContrastManager.checkedElements.clear();
        ContrastManager.violations = [];
    }
};

/**
 * SectionTheme - Manage color schemes per section
 */
const SectionTheme = {
    themes: {
        hero: {
            background: '#ffffff',
            text: '#1a237e',
            accent: '#42a5f5',
            overlay: 'rgba(0, 0, 0, 0.15)'
        },
        services: {
            background: '#f5f5f5',
            text: '#1a237e',
            accent: '#42a5f5',
            overlay: 'rgba(33, 150, 243, 0.08)'
        },
        projects: {
            background: '#ffffff',
            text: '#1a237e',
            accent: '#66bb6a',
            overlay: 'rgba(76, 175, 80, 0.08)'
        },
        impact: {
            background: '#f0fdf4',
            text: '#1a237e',
            accent: '#66bb6a',
            overlay: 'rgba(76, 175, 80, 0.05)'
        },
        about: {
            background: 'linear-gradient(180deg, #e3f2fd 0%, #e8f5e9 100%)',
            text: '#1a237e',
            accent: '#42a5f5',
            overlay: 'rgba(66, 165, 245, 0.08)'
        },
        contact: {
            background: '#f5f5f5',
            text: '#1a237e',
            accent: '#42a5f5',
            overlay: 'rgba(33, 150, 243, 0.05)'
        },
        footer: {
            background: 'linear-gradient(180deg, #1a237e 0%, #004d40 100%)',
            text: '#ffffff',
            accent: '#66bb6a',
            overlay: 'rgba(0, 0, 0, 0.2)'
        }
    },

    /**
     * Apply theme to section
     */
    applyTheme: (sectionId, themeKey = null) => {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const theme = SectionTheme.themes[themeKey || sectionId];
        if (!theme) return;

        section.style.setProperty('--section-bg', theme.background);
        section.style.setProperty('--section-text', theme.text);
        section.style.setProperty('--section-accent', theme.accent);
        section.style.setProperty('--section-overlay', theme.overlay);

        // Update text colors in section
        section.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span').forEach(el => {
            if (!el.classList.contains('preserve-color')) {
                el.style.color = theme.text;
            }
        });
    },

    /**
     * Apply all themes
     */
    applyAllThemes: () => {
        Object.keys(SectionTheme.themes).forEach(key => {
            SectionTheme.applyTheme(key);
        });
    },

    /**
     * Register custom theme
     */
    registerTheme: (sectionId, theme) => {
        SectionTheme.themes[sectionId] = theme;
    },

    /**
     * Get theme by key
     */
    getTheme: (key) => SectionTheme.themes[key]
};

/**
 * VisualPolish - Subtle animations and polish effects
 */
const VisualPolish = {
    enableScrollFadeIn: (selector = '[data-fade-in]') => {
        const elements = document.querySelectorAll(selector);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        elements.forEach(el => observer.observe(el));
    },

    /**
     * Enable parallax scroll effect
     */
    enableParallax: (selector = '[data-parallax]') => {
        const elements = document.querySelectorAll(selector);

        window.addEventListener('scroll', () => {
            elements.forEach(el => {
                const rate = el.getAttribute('data-parallax-rate') || 0.5;
                const yPos = window.scrollY * rate;
                el.style.transform = `translateY(${yPos}px)`;
            });
        }, { passive: true });
    },

    /**
     * Smooth color transitions on hover
     */
    enableHoverTransitions: (selector = '.service-item, .project-card, .stat-box') => {
        const elements = document.querySelectorAll(selector);

        elements.forEach(el => {
            el.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });
    },

    /**
     * Refined button feedback
     */
    enableButtonFeedback: (selector = 'button, .btn, a.btn') => {
        const buttons = document.querySelectorAll(selector);

        buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                // Create ripple effect
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    pointer-events: none;
                    width: 20px;
                    height: 20px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 50%;
                    left: ${x}px;
                    top: ${y}px;
                    animation: ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                `;

                if (!this.style.position || this.style.position === 'static') {
                    this.style.position = 'relative';
                    this.style.overflow = 'hidden';
                }

                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }
};

/**
 * Contrast validation on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Apply themes
    SectionTheme.applyAllThemes();

    // Enable visual polish
    VisualPolish.enableScrollFadeIn();
    VisualPolish.enableParallax();
    VisualPolish.enableHoverTransitions();
    VisualPolish.enableButtonFeedback();

    // Check contrast in development
    if (typeof ContrastManager !== 'undefined') {
        setTimeout(() => {
            const violations = ContrastManager.checkAllElements();
            if (violations.length === 0) {
                console.log('✨ Visual design system initialized successfully');
            }
        }, 100);
    }
});

/**
 * Re-apply themes on window resize
 */
window.addEventListener('resize', () => {
    SectionTheme.applyAllThemes();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ContrastManager,
        SectionTheme,
        VisualPolish
    };
}

window.ContrastManager = ContrastManager;
window.SectionTheme = SectionTheme;
window.VisualPolish = VisualPolish;
