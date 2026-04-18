/**
 * DigitalStark Aachen - Advanced Typography System
 * Font scaling, readability optimization, text hierarchy management
 */

'use strict';

/**
 * Typography - Font and text management system
 */
const Typography = {
    scales: {
        mobile: {
            h1: '24px',
            h2: '20px',
            h3: '18px',
            h4: '16px',
            h5: '14px',
            h6: '12px',
            p: '14px'
        },
        tablet: {
            h1: '32px',
            h2: '28px',
            h3: '24px',
            h4: '20px',
            h5: '16px',
            h6: '14px',
            p: '15px'
        },
        desktop: {
            h1: '42px',
            h2: '36px',
            h3: '28px',
            h4: '24px',
            h5: '18px',
            h6: '16px',
            p: '16px'
        }
    },

    lineHeights: {
        tight: 1.2,
        normal: 1.6,
        relaxed: 1.8,
        spacious: 2.0
    },

    letterSpacings: {
        tight: '-0.02em',
        normal: '0em',
        wide: '0.05em',
        wider: '0.1em'
    },

    /**
     * Get current viewport size category
     */
    getBreakpoint: () => {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    },

    /**
     * Apply font size scale based on viewport
     */
    applyFontScale: () => {
        const breakpoint = Typography.getBreakpoint();
        const scale = Typography.scales[breakpoint];

        // Apply to headings
        document.querySelectorAll('h1').forEach(el => el.style.fontSize = scale.h1);
        document.querySelectorAll('h2').forEach(el => el.style.fontSize = scale.h2);
        document.querySelectorAll('h3').forEach(el => el.style.fontSize = scale.h3);
        document.querySelectorAll('h4').forEach(el => el.style.fontSize = scale.h4);
        document.querySelectorAll('h5').forEach(el => el.style.fontSize = scale.h5);
        document.querySelectorAll('h6').forEach(el => el.style.fontSize = scale.h6);

        // Apply to paragraphs
        document.querySelectorAll('p').forEach(el => el.style.fontSize = scale.p);
    },

    /**
     * Set line height for readability
     */
    setLineHeight: (selector, lineHeight = 'normal') => {
        const elements = document.querySelectorAll(selector);
        const lh = Typography.lineHeights[lineHeight] || lineHeight;
        elements.forEach(el => el.style.lineHeight = lh);
    },

    /**
     * Set letter spacing for hierarchy
     */
    setLetterSpacing: (selector, spacing = 'normal') => {
        const elements = document.querySelectorAll(selector);
        const ls = Typography.letterSpacings[spacing] || spacing;
        elements.forEach(el => el.style.letterSpacing = ls);
    },

    /**
     * Apply typography to all headings
     */
    applyHeadingTypography: () => {
        // H1 - Display style
        Typography.setLineHeight('h1', 'tight');
        Typography.setLetterSpacing('h1', 'tight');

        // H2 - Section headers
        Typography.setLineHeight('h2', 'normal');
        Typography.setLetterSpacing('h2', 'tight');

        // H3 - Subsections
        Typography.setLineHeight('h3', 'normal');
        Typography.setLetterSpacing('h3', 'normal');

        // Paragraphs - Body text
        Typography.setLineHeight('p', 'relaxed');
        Typography.setLetterSpacing('p', 'normal');

        // Links
        document.querySelectorAll('a').forEach(el => {
            if (!el.classList.contains('nav-item')) {
                el.style.textDecoration = 'underline';
                el.style.textDecorationThickness = '2px';
                el.style.textUnderlineOffset = '4px';
            }
        });
    },

    /**
     * Text hierarchy levels
     */
    applyTextHierarchy: () => {
        // Primary text (regular)
        document.querySelectorAll('h1, h2, h3, .text-primary').forEach(el => {
            el.style.fontWeight = '700';
            el.style.color = '#1a237e';
        });

        // Secondary text (body)
        document.querySelectorAll('p, body').forEach(el => {
            el.style.fontWeight = '400';
            el.style.color = '#424242';
        });

        // Tertiary text (muted)
        document.querySelectorAll('.text-muted, small').forEach(el => {
            el.style.fontWeight = '400';
            el.style.color = '#9e9e9e';
            el.style.fontSize = '0.875em';
        });
    },

    /**
     * Font family management
     */
    applyFontFamilies: () => {
        // Display font for headings
        document.querySelectorAll('h1, h2, h3').forEach(el => {
            el.style.fontFamily = "'Playfair Display', serif";
        });

        // Body font for paragraphs and text
        document.querySelectorAll('p, body, span').forEach(el => {
            if (!el.style.fontFamily) {
                el.style.fontFamily = "'Inter', sans-serif";
            }
        });

        // Monospace for code
        document.querySelectorAll('code, pre').forEach(el => {
            el.style.fontFamily = "'Roboto Mono', monospace";
        });
    },

    /**
     * Readability helper - highlight long paragraphs
     */
    checkReadability: () => {
        const issues = [];

        document.querySelectorAll('p').forEach(el => {
            const text = el.textContent;
            const words = text.split(/\s+/).length;
            const avgWordsPerLine = window.innerWidth / 8; // Approximate
            const lines = Math.ceil(words / avgWordsPerLine);

            // Flag very long paragraphs
            if (lines > 5 && words > 100) {
                issues.push({
                    element: el,
                    words,
                    suggestion: 'Consider breaking into multiple paragraphs for readability'
                });
            }

            // Check line length (ideal: 50-75 characters)
            const maxLineLength = 75;
            if (text.split('\n')[0].length > maxLineLength) {
                el.style.maxWidth = '600px';
            }
        });

        return issues;
    },

    /**
     * Adjust based on user preference
     */
    applyUserPreferences: () => {
        // Support user's font size preference
        const fontSize = localStorage.getItem('userFontSize') || 'normal';
        const sizes = {
            small: 0.85,
            normal: 1,
            large: 1.2,
            xlarge: 1.4
        };

        const multiplier = sizes[fontSize] || 1;
        document.documentElement.style.setProperty('--font-size-multiplier', multiplier);

        // Apply to all text
        document.body.style.fontSize = (16 * multiplier) + 'px';
    },

    /**
     * High contrast mode support
     */
    applyHighContrast: () => {
        if (window.matchMedia('(prefers-contrast: more)').matches) {
            document.documentElement.style.setProperty('--color-text', '#000000');
            document.documentElement.style.setProperty('--color-bg', '#ffffff');

            document.querySelectorAll('h1, h2, h3').forEach(el => {
                el.style.fontWeight = '900';
            });
        }
    },

    /**
     * Reduced motion support
     */
    applyReducedMotion: () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--duration-fast', '0.01s');
            document.documentElement.style.setProperty('--duration-normal', '0.01s');
            document.documentElement.style.setProperty('--duration-slow', '0.01s');
        }
    }
};

/**
 * Font Loading Manager - Handle web font loading
 */
const FontLoader = {
    loaded: false,
    onLoadCallbacks: [],

    /**
     * Wait for fonts to load
     */
    waitForFonts: async () => {
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
            FontLoader.loaded = true;
            FontLoader.onLoadCallbacks.forEach(cb => cb());
        }
    },

    /**
     * Register callback for when fonts load
     */
    onLoad: (callback) => {
        if (FontLoader.loaded) {
            callback();
        } else {
            FontLoader.onLoadCallbacks.push(callback);
        }
    }
};

/**
 * Initialize typography on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Apply all typography styles
    Typography.applyFontScale();
    Typography.applyHeadingTypography();
    Typography.applyTextHierarchy();
    Typography.applyFontFamilies();
    Typography.applyUserPreferences();
    Typography.applyHighContrast();
    Typography.applyReducedMotion();

    // Check readability
    const readabilityIssues = Typography.checkReadability();
    if (readabilityIssues.length > 0) {
        console.info('📝 Readability suggestions:', readabilityIssues);
    }

    // Wait for fonts to load
    FontLoader.waitForFonts().then(() => {
        console.log('✨ Typography system initialized with custom fonts');
    });
});

/**
 * Re-apply on window resize for responsive scaling
 */
window.addEventListener('resize', () => {
    Typography.applyFontScale();
});

/**
 * Listen for user preference changes
 */
window.matchMedia('(prefers-contrast: more)').addEventListener('change', () => {
    Typography.applyHighContrast();
});

window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
    Typography.applyReducedMotion();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Typography,
        FontLoader
    };
}

window.Typography = Typography;
window.FontLoader = FontLoader;
