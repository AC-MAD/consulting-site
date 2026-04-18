/**
 * DigitalStark Aachen - Visual Utilities
 * Background overlays, shadow system, depth effects, and visual helpers
 */

'use strict';

/**
 * OverlaySystem - Create and manage background overlays
 */
const OverlaySystem = {
    overlays: new Map(),

    /**
     * Create dark overlay
     */
    createDarkOverlay: (opacity = 0.6, color = '#000000') => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: ${color};
            opacity: ${opacity};
            pointer-events: none;
            z-index: 1;
        `;
        return overlay;
    },

    /**
     * Create gradient overlay
     */
    createGradientOverlay: (gradientCss) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: ${gradientCss};
            pointer-events: none;
            z-index: 1;
        `;
        return overlay;
    },

    /**
     * Create blur overlay
     */
    createBlurOverlay: (blurAmount = '4px', backgroundColor = 'rgba(0, 0, 0, 0.3)') => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: ${backgroundColor};
            backdrop-filter: blur(${blurAmount});
            -webkit-backdrop-filter: blur(${blurAmount});
            pointer-events: none;
            z-index: 1;
        `;
        return overlay;
    },

    /**
     * Apply overlay to element
     */
    applyOverlay: (element, type = 'dark', options = {}) => {
        const { opacity = 0.6, color = '#000000', blur = '4px' } = options;

        if (!element.style.position || element.style.position === 'static') {
            element.style.position = 'relative';
        }

        let overlay;
        if (type === 'dark') {
            overlay = OverlaySystem.createDarkOverlay(opacity, color);
        } else if (type === 'blur') {
            overlay = OverlaySystem.createBlurOverlay(blur);
        } else if (type === 'gradient') {
            overlay = OverlaySystem.createGradientOverlay(color);
        }

        element.insertBefore(overlay, element.firstChild);
        return overlay;
    },

    /**
     * Remove overlay from element
     */
    removeOverlay: (element) => {
        const overlay = element.querySelector('[style*="pointer-events: none"]');
        if (overlay) {
            overlay.remove();
        }
    }
};

/**
 * ShadowSystem - Consistent shadow depth system
 */
const ShadowSystem = {
    levels: {
        none: 'none',
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
        '3xl': '0 35px 60px rgba(0, 0, 0, 0.3)',
        inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        focus: '0 0 0 3px rgba(25, 118, 210, 0.25)',
    },

    /**
     * Apply shadow to element
     */
    applyShadow: (element, level = 'md') => {
        element.style.boxShadow = ShadowSystem.levels[level];
    },

    /**
     * Transition shadow on hover
     */
    applyHoverShadow: (element, fromLevel = 'md', toLevel = 'lg') => {
        element.style.boxShadow = ShadowSystem.levels[fromLevel];
        element.style.transition = 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

        element.addEventListener('mouseenter', () => {
            element.style.boxShadow = ShadowSystem.levels[toLevel];
        });

        element.addEventListener('mouseleave', () => {
            element.style.boxShadow = ShadowSystem.levels[fromLevel];
        });
    },

    /**
     * Apply shadow to all cards
     */
    applyCardShadows: (selector = '.card, .project-card, .service-item') => {
        document.querySelectorAll(selector).forEach(card => {
            ShadowSystem.applyHoverShadow(card, 'md', 'xl');
        });
    }
};

/**
 * ElevationSystem - Layering and depth management
 */
const ElevationSystem = {
    zIndexes: {
        base: 1,
        content: 10,
        menu: 100,
        modal: 1000,
        tooltip: 1100,
        notification: 1200
    },

    /**
     * Set elevation level
     */
    setElevation: (element, level = 'content') => {
        element.style.zIndex = ElevationSystem.zIndexes[level];
    },

    /**
     * Create layered effect
     */
    createLayeredEffect: (element, layers = 3) => {
        element.style.position = 'relative';

        for (let i = 1; i <= layers; i++) {
            const layer = document.createElement('div');
            layer.style.cssText = `
                position: absolute;
                top: ${i * 2}px;
                left: ${i * 2}px;
                right: -${i * 2}px;
                bottom: -${i * 2}px;
                background: inherit;
                border-radius: inherit;
                z-index: ${-i};
                opacity: ${1 / (i + 1)};
            `;
            element.appendChild(layer);
        }
    }
};

/**
 * BorderSystem - Consistent border styles
 */
const BorderSystem = {
    radii: {
        none: '0',
        sm: '2px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px'
    },

    colors: {
        light: '#e0e0e0',
        medium: '#bdbdbd',
        dark: '#616161',
        primary: '#42a5f5',
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800'
    },

    /**
     * Apply border radius
     */
    applyRadius: (element, radius = 'md') => {
        element.style.borderRadius = BorderSystem.radii[radius];
    },

    /**
     * Apply border
     */
    applyBorder: (element, color = 'light', width = '1px') => {
        element.style.border = `${width} solid ${BorderSystem.colors[color]}`;
    },

    /**
     * Apply bottom border accent
     */
    applyAccentBottom: (element, color = 'primary', width = '3px') => {
        element.style.borderBottom = `${width} solid ${BorderSystem.colors[color]}`;
    }
};

/**
 * OpacitySystem - Opacity levels and transitions
 */
const OpacitySystem = {
    levels: {
        invisible: 0,
        'very-dim': 0.1,
        dim: 0.25,
        fade: 0.5,
        light: 0.75,
        visible: 1
    },

    /**
     * Set opacity
     */
    setOpacity: (element, level = 'visible') => {
        element.style.opacity = OpacitySystem.levels[level];
    },

    /**
     * Fade element
     */
    fade: (element, fromLevel = 'visible', toLevel = 'invisible', duration = 300) => {
        element.style.opacity = OpacitySystem.levels[fromLevel];
        element.style.transition = `opacity ${duration}ms ease-out`;

        setTimeout(() => {
            element.style.opacity = OpacitySystem.levels[toLevel];
        }, 10);
    }
};

/**
 * BackgroundPatterns - Create visual patterns
 */
const BackgroundPatterns = {
    /**
     * Dot pattern
     */
    dots: (color = 'rgba(66, 165, 245, 0.1)', size = '4px', spacing = '20px') => {
        return `radial-gradient(circle, ${color} ${size}, transparent ${size}),
                linear-gradient(${spacing} ${spacing} transparent, ${spacing} ${spacing} ${color})`;
    },

    /**
     * Stripe pattern
     */
    stripes: (color = 'rgba(66, 165, 245, 0.1)', width = '10px', angle = '45deg') => {
        return `repeating-linear-gradient(${angle}, transparent, transparent ${width}, ${color} ${width}, ${color} ${width * 2})`;
    },

    /**
     * Grid pattern
     */
    grid: (color = 'rgba(66, 165, 245, 0.1)', size = '20px') => {
        return `linear-gradient(90deg, ${color} 1px, transparent 1px),
                linear-gradient(${color} 1px, transparent 1px)`;
    },

    /**
     * Gradient mesh
     */
    gradientMesh: (color1 = '#42a5f5', color2 = '#4caf50') => {
        return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    },

    /**
     * Apply pattern to element
     */
    apply: (element, patternType = 'dots', options = {}) => {
        let pattern;

        if (patternType === 'dots') {
            pattern = BackgroundPatterns.dots(options.color, options.size, options.spacing);
        } else if (patternType === 'stripes') {
            pattern = BackgroundPatterns.stripes(options.color, options.width, options.angle);
        } else if (patternType === 'grid') {
            pattern = BackgroundPatterns.grid(options.color, options.size);
        } else if (patternType === 'gradient') {
            pattern = BackgroundPatterns.gradientMesh(options.color1, options.color2);
        }

        element.style.background = pattern;
    }
};

/**
 * Visual Effects - Special visual effects
 */
const VisualEffects = {
    /**
     * Glow effect
     */
    addGlow: (element, color = '#42a5f5', blur = '20px') => {
        element.style.boxShadow = `0 0 ${blur} ${color}`;
    },

    /**
     * Pulse effect
     */
    addPulse: (element, duration = 2) => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
        element.style.animation = `pulse ${duration}s ease-in-out infinite`;
    },

    /**
     * Shimmer effect
     */
    addShimmer: (element) => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shimmer {
                0% { background-position: -1000px 0; }
                100% { background-position: 1000px 0; }
            }
        `;
        document.head.appendChild(style);

        element.style.backgroundImage = 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)';
        element.style.backgroundSize = '200% 100%';
        element.style.animation = 'shimmer 2s infinite';
    }
};

/**
 * Initialize visual utilities on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Apply card shadows
    ShadowSystem.applyCardShadows();

    // Apply border radius
    document.querySelectorAll('.card, .btn, input, textarea').forEach(el => {
        BorderSystem.applyRadius(el, 'md');
    });

    console.log('🎨 Visual utilities system initialized');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        OverlaySystem,
        ShadowSystem,
        ElevationSystem,
        BorderSystem,
        OpacitySystem,
        BackgroundPatterns,
        VisualEffects
    };
}

window.OverlaySystem = OverlaySystem;
window.ShadowSystem = ShadowSystem;
window.ElevationSystem = ElevationSystem;
window.BorderSystem = BorderSystem;
window.OpacitySystem = OpacitySystem;
window.BackgroundPatterns = BackgroundPatterns;
window.VisualEffects = VisualEffects;
