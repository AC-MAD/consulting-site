/**
 * DigitalStark Aachen - Advanced Color System
 * Smart color palette, contrast ratio calculation, and theme management
 */

'use strict';

/**
 * ColorPalette - Manage accessible colors with built-in contrast checking
 */
const ColorPalette = {
    primary: {
        50: '#e3f2fd',
        100: '#bbdefb',
        200: '#90caf9',
        300: '#64b5f6',
        400: '#42a5f5',
        500: '#2196f3',
        600: '#1e88e5',
        700: '#1976d2',
        800: '#1565c0',
        900: '#0d47a1'
    },

    green: {
        50: '#e8f5e9',
        100: '#c8e6c9',
        200: '#a5d6a7',
        300: '#81c784',
        400: '#66bb6a',
        500: '#4caf50',
        600: '#43a047',
        700: '#388e3c',
        800: '#2e7d32',
        900: '#1b5e20'
    },

    neutral: {
        white: '#ffffff',
        light: '#f5f5f5',
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121'
    },

    semantic: {
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3'
    },

    /**
     * Get color by path (e.g., 'primary.500')
     */
    get: (path) => {
        return path.split('.').reduce((obj, key) => obj[key], ColorPalette);
    },

    /**
     * Get all colors in a range
     */
    getRange: (colorKey) => {
        return ColorPalette[colorKey] || {};
    }
};

/**
 * ContrastRatioCalculator - Calculate WCAG contrast ratios
 */
const ContrastRatioCalculator = {
    /**
     * Convert hex to RGB
     */
    hexToRGB: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * Calculate relative luminance per WCAG
     */
    getRelativeLuminance: (rgb) => {
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
            val = val / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },

    /**
     * Calculate contrast ratio between two colors
     */
    calculate: (foreground, background) => {
        const fgRGB = ContrastRatioCalculator.hexToRGB(foreground);
        const bgRGB = ContrastRatioCalculator.hexToRGB(background);

        if (!fgRGB || !bgRGB) return null;

        const fgLum = ContrastRatioCalculator.getRelativeLuminance(fgRGB);
        const bgLum = ContrastRatioCalculator.getRelativeLuminance(bgRGB);

        const lighter = Math.max(fgLum, bgLum);
        const darker = Math.min(fgLum, bgLum);

        return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
    },

    /**
     * Check if ratio meets WCAG AA standard (4.5:1 for normal text)
     */
    meetsAAStandard: (ratio) => {
        return parseFloat(ratio) >= 4.5;
    },

    /**
     * Check if ratio meets WCAG AAA standard (7:1 for normal text)
     */
    meetsAAAStandard: (ratio) => {
        return parseFloat(ratio) >= 7;
    },

    /**
     * Find best text color (light or dark) for given background
     */
    getBestTextColor: (backgroundColor) => {
        const lightRatio = ContrastRatioCalculator.calculate('#ffffff', backgroundColor);
        const darkRatio = ContrastRatioCalculator.calculate('#000000', backgroundColor);

        return parseFloat(darkRatio) > parseFloat(lightRatio) ? '#000000' : '#ffffff';
    },

    /**
     * Find accessible text color from palette
     */
    findAccessibleTextColor: (backgroundColor, foregroundColor) => {
        const ratio = ContrastRatioCalculator.calculate(foregroundColor, backgroundColor);

        if (ContrastRatioCalculator.meetsAAStandard(ratio)) {
            return { color: foregroundColor, ratio, compliant: true };
        }

        // Try to find darkened version
        const textColor = ContrastRatioCalculator.getBestTextColor(backgroundColor);
        const newRatio = ContrastRatioCalculator.calculate(textColor, backgroundColor);

        return {
            color: textColor,
            ratio: newRatio,
            compliant: ContrastRatioCalculator.meetsAAStandard(newRatio)
        };
    }
};

/**
 * ThemeManager - Apply color themes globally
 */
const ThemeManager = {
    currentTheme: 'light',

    themes: {
        light: {
            name: 'Light',
            colors: {
                text: '#1a237e',
                textSecondary: '#424242',
                background: '#ffffff',
                backgroundAlt: '#f5f5f5',
                primary: '#42a5f5',
                accent: '#4caf50',
                border: '#e0e0e0'
            }
        },

        dark: {
            name: 'Dark',
            colors: {
                text: '#ffffff',
                textSecondary: '#e0e0e0',
                background: '#121212',
                backgroundAlt: '#1e1e1e',
                primary: '#64b5f6',
                accent: '#81c784',
                border: '#424242'
            }
        },

        highContrast: {
            name: 'High Contrast',
            colors: {
                text: '#000000',
                textSecondary: '#333333',
                background: '#ffffff',
                backgroundAlt: '#f0f0f0',
                primary: '#0000ff',
                accent: '#008000',
                border: '#000000'
            }
        }
    },

    /**
     * Apply theme to document
     */
    applyTheme: (themeName) => {
        const theme = ThemeManager.themes[themeName];
        if (!theme) return;

        ThemeManager.currentTheme = themeName;

        // Set CSS variables
        Object.entries(theme.colors).forEach(([key, color]) => {
            document.documentElement.style.setProperty(`--color-${key}`, color);
        });

        // Save preference
        localStorage.setItem('theme', themeName);
    },

    /**
     * Get current theme
     */
    getCurrentTheme: () => ThemeManager.themes[ThemeManager.currentTheme],

    /**
     * Register custom theme
     */
    registerTheme: (name, colors) => {
        ThemeManager.themes[name] = {
            name,
            colors
        };
    },

    /**
     * Detect user preference (light/dark mode)
     */
    detectUserPreference: () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    },

    /**
     * Apply theme from user preference or saved preference
     */
    initTheme: () => {
        const savedTheme = localStorage.getItem('theme');
        const preferredTheme = savedTheme || ThemeManager.detectUserPreference();

        ThemeManager.applyTheme(preferredTheme);
    }
};

/**
 * ColorValidator - Validate color accessibility
 */
const ColorValidator = {
    /**
     * Validate a color combination
     */
    validate: (foreground, background) => {
        const ratio = ContrastRatioCalculator.calculate(foreground, background);

        return {
            foreground,
            background,
            ratio,
            meetsAA: ContrastRatioCalculator.meetsAAStandard(ratio),
            meetsAAA: ContrastRatioCalculator.meetsAAAStandard(ratio),
            recommendation: ContrastRatioCalculator.meetsAAStandard(ratio)
                ? '✅ Meets WCAG AA standard'
                : '⚠️ Does not meet WCAG AA standard (minimum 4.5:1)'
        };
    },

    /**
     * Validate all color combinations in document
     */
    validateDocument: () => {
        const results = [];

        document.querySelectorAll('*').forEach(el => {
            const color = window.getComputedStyle(el).color;
            const backgroundColor = window.getComputedStyle(el).backgroundColor;

            if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
                const validation = ColorValidator.validate(color, backgroundColor);
                if (!validation.meetsAA) {
                    results.push({
                        element: el,
                        ...validation
                    });
                }
            }
        });

        return results;
    }
};

/**
 * ColorAccessibility - Additional accessibility helpers
 */
const ColorAccessibility = {
    /**
     * Check if color-blind friendly
     */
    isColorBlindFriendly: (colors) => {
        // Simplified check - real implementation would use more complex algorithms
        return colors.length >= 3; // Needs multiple visual distinguishing features
    },

    /**
     * Get monochromatic palette
     */
    getMonochromaticPalette: (baseColor) => {
        // Returns different tints/shades of the same color
        return [baseColor]; // Simplified
    },

    /**
     * Provide pattern alternatives for color
     */
    getPatternAlternatives: (color) => {
        const patterns = {
            primary: 'linear-gradient(45deg, ' + color + ' 25%, transparent 25%)',
            dots: 'radial-gradient(circle, ' + color + ' 2px, transparent 2px)',
            stripes: 'repeating-linear-gradient(45deg, ' + color + ', ' + color + ' 10px, transparent 10px)'
        };

        return patterns;
    }
};

/**
 * Initialize color system on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.initTheme();
    console.log('🎨 Color system initialized');

    // Listen for theme preference changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            ThemeManager.applyTheme(e.matches ? 'dark' : 'light');
        });
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ColorPalette,
        ContrastRatioCalculator,
        ThemeManager,
        ColorValidator,
        ColorAccessibility
    };
}

window.ColorPalette = ColorPalette;
window.ContrastRatioCalculator = ContrastRatioCalculator;
window.ThemeManager = ThemeManager;
window.ColorValidator = ColorValidator;
window.ColorAccessibility = ColorAccessibility;
