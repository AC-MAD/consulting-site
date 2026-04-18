/**
 * DigitalStark Aachen - Theme & Design System
 * Comprehensive design tokens and theme management
 */

'use strict';

/**
 * Design System - Centralized design tokens
 */
const DesignSystem = {
    // Color Palette
    colors: {
        blue: {
            50: '#e3f2fd',
            100: '#bbdefb',
            200: '#90caf9',
            300: '#64b5f6',
            400: '#42a5f5',
            500: '#2196f3',
            600: '#1e88e5',
            700: '#1976d2',
            800: '#1565c0',
            900: '#0d47a1',
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
            900: '#1b5e20',
        },
        gray: {
            0: '#ffffff',
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
        },
    },

    // Typography
    typography: {
        fontFamilies: {
            display: '"Playfair Display", serif',
            body: '"Inter", sans-serif',
            mono: '"Roboto Mono", monospace',
        },
        fontSizes: {
            xs: '12px',
            sm: '14px',
            md: '16px',
            lg: '18px',
            xl: '20px',
            '2xl': '24px',
            '3xl': '30px',
            '4xl': '36px',
            '5xl': '48px',
            '6xl': '60px',
            '7xl': '72px',
        },
        fontWeights: {
            thin: 100,
            extralight: 200,
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
            black: 900,
        },
        lineHeights: {
            tight: 1.1,
            snug: 1.25,
            normal: 1.5,
            relaxed: 1.625,
            loose: 2,
        },
        letterSpacings: {
            tighter: '-0.05em',
            tight: '-0.025em',
            normal: '0em',
            wide: '0.025em',
            wider: '0.05em',
            widest: '0.1em',
        },
    },

    // Spacing
    spacing: {
        0: '0',
        px: '1px',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        28: '112px',
        32: '128px',
        36: '144px',
        40: '160px',
        44: '176px',
        48: '192px',
        52: '208px',
        56: '224px',
        60: '240px',
        64: '256px',
        72: '288px',
        80: '320px',
        96: '384px',
    },

    // Border Radius
    borderRadius: {
        none: '0',
        sm: '2px',
        base: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
        full: '9999px',
    },

    // Shadows
    shadows: {
        none: 'none',
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },

    // Z-Index Scale
    zIndex: {
        hide: '-1',
        base: '0',
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        modalBackdrop: '1040',
        modal: '1050',
        popover: '1060',
        tooltip: '1070',
    },

    // Transitions
    transitions: {
        durations: {
            fast: '150ms',
            normal: '300ms',
            slow: '500ms',
            slower: '700ms',
            slowest: '1000ms',
        },
        easings: {
            linear: 'linear',
            ease: 'ease',
            easeIn: 'ease-in',
            easeOut: 'ease-out',
            easeInOut: 'ease-in-out',
            cubic: 'cubic-bezier(0.4, 0, 0.2, 1)',
            spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        },
    },

    // Breakpoints
    breakpoints: {
        xs: '320px',
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },

    // Component Sizes
    sizes: {
        badge: {
            sm: { padding: '2px 8px', fontSize: '12px' },
            md: { padding: '4px 12px', fontSize: '14px' },
            lg: { padding: '6px 16px', fontSize: '16px' },
        },
        button: {
            xs: { padding: '4px 8px', fontSize: '12px', minHeight: '24px' },
            sm: { padding: '6px 12px', fontSize: '14px', minHeight: '32px' },
            md: { padding: '8px 16px', fontSize: '16px', minHeight: '40px' },
            lg: { padding: '12px 24px', fontSize: '18px', minHeight: '48px' },
            xl: { padding: '16px 32px', fontSize: '20px', minHeight: '56px' },
        },
        input: {
            sm: { padding: '6px 12px', fontSize: '14px', minHeight: '32px' },
            md: { padding: '8px 16px', fontSize: '16px', minHeight: '40px' },
            lg: { padding: '12px 20px', fontSize: '18px', minHeight: '48px' },
        },
    },

    // Gradients
    gradients: {
        primary: 'linear-gradient(135deg, #42a5f5 0%, #4caf50 100%)',
        blueGreen: 'linear-gradient(135deg, #2196f3 0%, #66bb6a 100%)',
        soft: 'linear-gradient(180deg, #e3f2fd 0%, #e8f5e9 100%)',
        accent: 'linear-gradient(135deg, #42a5f5 0%, #2e7d32 100%)',
    },
};

/**
 * Theme Manager - Light and dark themes
 */
const ThemeManager = {
    currentTheme: 'light',
    themes: {
        light: {
            background: '#ffffff',
            surface: '#f5f5f5',
            text: '#212121',
            textSecondary: '#666666',
            border: '#e0e0e0',
            primary: '#42a5f5',
            primaryHover: '#1e88e5',
            secondary: '#4caf50',
            secondaryHover: '#388e3c',
            error: '#f44336',
            warning: '#ff9800',
            success: '#4caf50',
            info: '#2196f3',
        },
        dark: {
            background: '#121212',
            surface: '#1e1e1e',
            text: '#ffffff',
            textSecondary: '#b0b0b0',
            border: '#303030',
            primary: '#64b5f6',
            primaryHover: '#42a5f5',
            secondary: '#81c784',
            secondaryHover: '#4caf50',
            error: '#ef5350',
            warning: '#ffb74d',
            success: '#66bb6a',
            info: '#42a5f5',
        },
    },

    /**
     * Initialize theme
     */
    init: () => {
        const saved = localStorage.getItem('theme') || 'light';
        ThemeManager.setTheme(saved);
    },

    /**
     * Set theme
     */
    setTheme: (themeName) => {
        if (!ThemeManager.themes[themeName]) return;

        ThemeManager.currentTheme = themeName;
        localStorage.setItem('theme', themeName);

        const theme = ThemeManager.themes[themeName];
        const root = document.documentElement;

        Object.entries(theme).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });

        root.setAttribute('data-theme', themeName);
    },

    /**
     * Get current theme
     */
    getTheme: () => {
        return ThemeManager.themes[ThemeManager.currentTheme];
    },

    /**
     * Toggle theme
     */
    toggle: () => {
        const newTheme = ThemeManager.currentTheme === 'light' ? 'dark' : 'light';
        ThemeManager.setTheme(newTheme);
    },

    /**
     * Add custom theme
     */
    addTheme: (name, colors) => {
        ThemeManager.themes[name] = colors;
    },
};

/**
 * Typography System
 */
const TypographySystem = {
    /**
     * Create text style
     */
    style: (options = {}) => {
        const {
            fontFamily = 'body',
            fontSize = 'md',
            fontWeight = 'normal',
            lineHeight = 'normal',
            letterSpacing = 'normal',
        } = options;

        const families = DesignSystem.typography.fontFamilies;
        const sizes = DesignSystem.typography.fontSizes;
        const weights = DesignSystem.typography.fontWeights;
        const heights = DesignSystem.typography.lineHeights;
        const spacings = DesignSystem.typography.letterSpacings;

        return {
            fontFamily: families[fontFamily] || families.body,
            fontSize: sizes[fontSize] || sizes.md,
            fontWeight: weights[fontWeight] || weights.normal,
            lineHeight: heights[lineHeight] || heights.normal,
            letterSpacing: spacings[letterSpacing] || spacings.normal,
        };
    },

    /**
     * Common heading styles
     */
    heading: (level = 1) => {
        const styles = {
            1: TypographySystem.style({ fontFamily: 'display', fontSize: '7xl', fontWeight: 'bold', lineHeight: 'tight' }),
            2: TypographySystem.style({ fontFamily: 'display', fontSize: '5xl', fontWeight: 'bold', lineHeight: 'tight' }),
            3: TypographySystem.style({ fontFamily: 'display', fontSize: '3xl', fontWeight: 'semibold', lineHeight: 'snug' }),
            4: TypographySystem.style({ fontFamily: 'body', fontSize: '2xl', fontWeight: 'semibold', lineHeight: 'snug' }),
            5: TypographySystem.style({ fontFamily: 'body', fontSize: 'xl', fontWeight: 'semibold', lineHeight: 'snug' }),
            6: TypographySystem.style({ fontFamily: 'body', fontSize: 'lg', fontWeight: 'semibold', lineHeight: 'snug' }),
        };

        return styles[level] || styles[1];
    },

    /**
     * Body text style
     */
    body: (size = 'md') => {
        return TypographySystem.style({ fontSize: size, lineHeight: 'relaxed' });
    },

    /**
     * Small text style
     */
    small: () => {
        return TypographySystem.style({ fontSize: 'sm', lineHeight: 'tight' });
    },

    /**
     * Caption style
     */
    caption: () => {
        return TypographySystem.style({ fontSize: 'xs', lineHeight: 'tight', letterSpacing: 'wide' });
    },
};

/**
 * Spacing System
 */
const SpacingSystem = {
    /**
     * Get spacing value
     */
    get: (size) => {
        return DesignSystem.spacing[size] || size;
    },

    /**
     * Create padding
     */
    padding: (...sizes) => {
        return sizes.map(s => SpacingSystem.get(s)).join(' ');
    },

    /**
     * Create margin
     */
    margin: (...sizes) => {
        return sizes.map(s => SpacingSystem.get(s)).join(' ');
    },

    /**
     * Create gap
     */
    gap: (size) => {
        return SpacingSystem.get(size);
    },
};

/**
 * Color System - Advanced color utilities
 */
const ColorSystem = {
    /**
     * Get color from palette
     */
    color: (palette, shade = 500) => {
        return DesignSystem.colors[palette]?.[shade] || '#000000';
    },

    /**
     * Create color with opacity
     */
    withAlpha: (color, alpha) => {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    /**
     * Lighten color
     */
    lighten: (color, amount) => {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    },

    /**
     * Darken color
     */
    darken: (color, amount) => {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    },
};

/**
 * Component Styles - Predefined component styles
 */
const ComponentStyles = {
    /**
     * Button styles
     */
    button: (variant = 'primary', size = 'md') => {
        const variants = {
            primary: {
                background: '#42a5f5',
                color: '#ffffff',
                border: 'none',
                hover: { background: '#1e88e5' },
            },
            secondary: {
                background: '#f5f5f5',
                color: '#212121',
                border: '1px solid #e0e0e0',
                hover: { background: '#eeeeee' },
            },
            danger: {
                background: '#f44336',
                color: '#ffffff',
                border: 'none',
                hover: { background: '#d32f2f' },
            },
            ghost: {
                background: 'transparent',
                color: '#42a5f5',
                border: '1px solid #42a5f5',
                hover: { background: '#e3f2fd' },
            },
        };

        const sizeStyles = DesignSystem.sizes.button[size] || DesignSystem.sizes.button.md;

        return {
            ...variants[variant],
            ...sizeStyles,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 300ms ease',
        };
    },

    /**
     * Card styles
     */
    card: (variant = 'default') => {
        const variants = {
            default: {
                background: '#ffffff',
                border: '1px solid #e0e0e0',
                boxShadow: DesignSystem.shadows.sm,
            },
            elevated: {
                background: '#ffffff',
                border: 'none',
                boxShadow: DesignSystem.shadows.md,
            },
            outlined: {
                background: 'transparent',
                border: '2px solid #42a5f5',
                boxShadow: 'none',
            },
        };

        return {
            ...variants[variant],
            borderRadius: DesignSystem.borderRadius.lg,
            padding: '16px',
        };
    },

    /**
     * Input styles
     */
    input: (size = 'md') => {
        const sizeStyles = DesignSystem.sizes.input[size] || DesignSystem.sizes.input.md;

        return {
            ...sizeStyles,
            border: `1px solid #e0e0e0`,
            borderRadius: DesignSystem.borderRadius.md,
            fontFamily: DesignSystem.typography.fontFamilies.body,
            transition: 'border-color 200ms ease',
        };
    },
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DesignSystem,
        ThemeManager,
        TypographySystem,
        SpacingSystem,
        ColorSystem,
        ComponentStyles,
    };
}

// Make available globally
window.DesignSystem = DesignSystem;
window.ThemeManager = ThemeManager;
window.TypographySystem = TypographySystem;
window.SpacingSystem = SpacingSystem;
window.ColorSystem = ColorSystem;
window.ComponentStyles = ComponentStyles;
