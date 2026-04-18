/**
 * DigitalStark Aachen - Configuration & Constants
 * Centralized configuration for animations, colors, and settings
 */

'use strict';

/**
 * Application Configuration
 */
const AppConfig = {

    // Application Info
    app: {
        name: 'DigitalStark Aachen',
        version: '1.0.0',
        title: 'Digitale Stärke für Aachener Vereine',
        email: 'kontakt@digitalstark-aachen.de',
        phone: '+49 (0) 241 / 123-456',
        location: 'Aachen, Deutschland',
    },

    // Animation Settings
    animations: {
        // Durations (milliseconds)
        preloadDuration: 2500,
        scrollDuration: 500,
        modalOpenDuration: 400,
        modalCloseDuration: 300,
        countDuration: 2000,
        staggerDelay: 100,
        hoverDuration: 300,
        activeDuration: 200,

        // Easing Functions
        easing: {
            smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
            spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            out: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            inOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
        },

        // Parallax Settings
        parallax: {
            enabled: true,
            heroSpeed: 0.5,
            blobSpeed: 0.3,
            textSpeed: 0.3,
        },

        // Scroll Settings
        scroll: {
            threshold: 16, // ~60fps throttle
            hideNavbarThreshold: 200,
            revealNavbarThreshold: 200,
        },

        // Counter Settings
        counters: {
            enabled: true,
            duration: 2000,
            easing: 'easeOutCubic',
            updateFrequency: 16, // ms
        },
    },

    // Color Palette
    colors: {
        primary: {
            blue: '#42a5f5',
            green: '#4caf50',
            darkGreen: '#2e7d32',
            lightBlue: '#e3f2fd',
            lightGreen: '#e8f5e9',
        },
        neutral: {
            white: '#ffffff',
            light: '#f5f5f5',
            gray: '#9e9e9e',
            darkGray: '#616161',
            dark: '#212121',
        },
        gradients: {
            primary: 'linear-gradient(135deg, #42a5f5 0%, #4caf50 100%)',
            blue_green: 'linear-gradient(135deg, #2196f3 0%, #66bb6a 100%)',
            soft: 'linear-gradient(180deg, #e3f2fd 0%, #e8f5e9 100%)',
            accent: 'linear-gradient(135deg, #42a5f5 0%, #2e7d32 100%)',
        },
    },

    // Typography
    typography: {
        fontFamily: {
            display: '"Playfair Display", serif',
            body: '"Inter", sans-serif',
        },
        sizes: {
            xs: '12px',
            sm: '14px',
            base: '16px',
            lg: '18px',
            xl: '20px',
            '2xl': '24px',
            '3xl': '28px',
            '4xl': '32px',
            '5xl': '36px',
            '6xl': '48px',
            '7xl': '56px',
            '8xl': '72px',
        },
        weights: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
            black: 900,
        },
    },

    // Spacing System (8px grid)
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
    },

    // Shadows
    shadows: {
        sm: '0 2px 4px rgba(0, 0, 0, 0.08)',
        md: '0 4px 12px rgba(0, 0, 0, 0.12)',
        lg: '0 12px 32px rgba(0, 0, 0, 0.16)',
        xl: '0 20px 48px rgba(0, 0, 0, 0.2)',
        '2xl': '0 32px 64px rgba(0, 0, 0, 0.24)',
    },

    // Breakpoints
    breakpoints: {
        mobile: 320,
        tablet: 768,
        desktop: 1024,
        wide: 1440,
        ultrawide: 1920,
    },

    // Feature Flags
    features: {
        parallax: true,
        smoothScroll: true,
        animations: true,
        soundEffects: false,
        pageTransitions: true,
        preloadAnimation: true,
        darkMode: true,
        analytics: true,
        serviceWorker: false,
    },

    // Service Data Configuration
    services: [
        {
            id: 'websites',
            title: 'Website-Erstellung',
            icon: '🌐',
            order: 1,
            featured: true,
        },
        {
            id: 'security',
            title: 'Cybersecurity-Beratung',
            icon: '🔐',
            order: 2,
            featured: true,
        },
        {
            id: 'pentests',
            title: 'Penetrationstests',
            icon: '⚔️',
            order: 3,
            featured: true,
        },
    ],

    // Project Data Configuration
    projects: [
        {
            id: 'kaiser-karl',
            title: 'Kaiser-Karl-Gymnasium',
            category: 'Penetrationstest',
            year: 2024,
            featured: true,
        },
        {
            id: 'europa-verband',
            title: 'Europäischer Verband',
            category: 'Website',
            year: 2024,
            featured: true,
        },
        {
            id: 'sportvereine',
            title: 'Sportvereine Netzwerk',
            category: 'IT-Sicherheit',
            year: 2024,
            featured: true,
        },
    ],

    // Navigation
    navigation: {
        items: [
            { label: 'Leistungen', href: '#services' },
            { label: 'Projekte', href: '#projects' },
            { label: 'Impact', href: '#impact' },
        ],
        socialLinks: [
            { name: 'LinkedIn', href: '#', icon: 'in' },
            { name: 'Facebook', href: '#', icon: 'f' },
            { name: 'Twitter', href: '#', icon: '𝕏' },
        ],
    },

    // Performance
    performance: {
        enableCompression: true,
        lazyLoadImages: true,
        preloadCriticalAssets: true,
        minifyCSS: true,
        minifyJS: true,
        optimizeImages: true,
    },

    // Analytics Events
    analytics: {
        events: {
            pageView: 'page_view',
            serviceClick: 'service_click',
            projectClick: 'project_click',
            contactClick: 'contact_click',
            ctaClick: 'cta_click',
            scrollDepth: 'scroll_depth',
        },
    },

    // Accessibility
    accessibility: {
        enableSkipLinks: true,
        enableKeyboardNavigation: true,
        enableScreenReaderAnnouncements: true,
        enableHighContrast: false,
        enableReducedMotion: true,
    },

    // SEO Configuration
    seo: {
        language: 'de',
        locale: 'de-DE',
        charset: 'UTF-8',
        viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
        robots: 'index, follow',
        googleSiteVerification: '',
    },

    // Social Media
    social: {
        openGraph: {
            type: 'website',
            title: 'DigitalStark Aachen',
            description: 'Digitale Stärke für Aachener Vereine',
            image: '/og-image.jpg',
        },
        twitter: {
            card: 'summary_large_image',
            creator: '@digitalstarkaachen',
        },
    },

    // Development Settings
    development: {
        debugMode: false,
        showPerformanceMetrics: false,
        verboseLogging: false,
        disableCache: false,
    },
};

/**
 * Helper function to get configuration value
 */
function getConfig(path, defaultValue = null) {
    const keys = path.split('.');
    let value = AppConfig;

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }

    return value;
}

/**
 * Helper function to set configuration value
 */
function setConfig(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = AppConfig;

    for (const key of keys) {
        if (!(key in target)) {
            target[key] = {};
        }
        target = target[key];
    }

    target[lastKey] = value;
}

/**
 * Get all animation timings for consistent use
 */
function getAnimationTimings() {
    return {
        fast: AppConfig.animations.activeDuration,
        normal: AppConfig.animations.hoverDuration,
        slow: AppConfig.animations.modalOpenDuration,
        slower: AppConfig.animations.scrollDuration,
        slowest: AppConfig.animations.preloadDuration,
    };
}

/**
 * Get all color references
 */
function getColors() {
    return {
        ...AppConfig.colors.primary,
        ...AppConfig.colors.neutral,
        gradients: AppConfig.colors.gradients,
    };
}

/**
 * Export for use in other modules
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppConfig,
        getConfig,
        setConfig,
        getAnimationTimings,
        getColors,
    };
}

// Make available globally for console access
window.AppConfig = AppConfig;
window.getConfig = getConfig;
window.setConfig = setConfig;
