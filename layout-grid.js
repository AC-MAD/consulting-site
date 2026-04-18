/**
 * DigitalStark Aachen - Premium Layout & Grid System
 * Responsive grid, spacing management, and layout helpers
 */

'use strict';

/**
 * Grid - 12-column responsive grid system
 */
const Grid = {
    columns: 12,
    gutter: 24,
    breakpoints: {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400
    },

    containerWidths: {
        sm: 540,
        md: 720,
        lg: 960,
        xl: 1140,
        xxl: 1320
    },

    /**
     * Get current breakpoint
     */
    getBreakpoint: () => {
        const width = window.innerWidth;
        for (const [bp, px] of Object.entries(Grid.breakpoints).reverse()) {
            if (width >= px) return bp;
        }
        return 'xs';
    },

    /**
     * Get container width for current breakpoint
     */
    getContainerWidth: () => {
        const bp = Grid.getBreakpoint();
        return Grid.containerWidths[bp] || 1320;
    },

    /**
     * Calculate column width percentage
     */
    getColumnWidth: (columns) => {
        return (100 / Grid.columns) * columns;
    },

    /**
     * Apply grid to container
     */
    applyGridToContainer: (selector) => {
        const containers = document.querySelectorAll(selector);
        containers.forEach(container => {
            container.style.display = 'grid';
            container.style.gridTemplateColumns = `repeat(auto-fit, minmax(250px, 1fr))`;
            container.style.gap = Grid.gutter + 'px';
            container.style.maxWidth = Grid.getContainerWidth() + 'px';
            container.style.margin = '0 auto';
        });
    }
};

/**
 * Spacing - Consistent spacing and rhythm system
 */
const Spacing = {
    scale: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        '2xl': 48,
        '3xl': 64,
        '4xl': 96
    },

    /**
     * Apply margin
     */
    applyMargin: (element, size = 'md', sides = ['top', 'right', 'bottom', 'left']) => {
        const value = Spacing.scale[size];
        sides.forEach(side => {
            element.style[`margin${side.charAt(0).toUpperCase() + side.slice(1)}`] = value + 'px';
        });
    },

    /**
     * Apply padding
     */
    applyPadding: (element, size = 'md', sides = ['top', 'right', 'bottom', 'left']) => {
        const value = Spacing.scale[size];
        sides.forEach(side => {
            element.style[`padding${side.charAt(0).toUpperCase() + side.slice(1)}`] = value + 'px';
        });
    },

    /**
     * Apply gap (for flex/grid)
     */
    applyGap: (element, size = 'md') => {
        element.style.gap = Spacing.scale[size] + 'px';
    },

    /**
     * Get spacing value
     */
    get: (size) => {
        return Spacing.scale[size] || 16;
    }
};

/**
 * SectionLayout - Predefined section layouts
 */
const SectionLayout = {
    /**
     * Hero section layout
     */
    createHeroLayout: (titleText, subtitleText, ctaText) => {
        const section = document.createElement('section');
        section.className = 'hero';
        section.style.cssText = `
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: ${Spacing.get('3xl')}px ${Spacing.get('2xl')}px;
            text-align: center;
        `;

        const content = document.createElement('div');
        content.className = 'hero-content';
        content.style.maxWidth = '800px';

        const title = document.createElement('h1');
        title.textContent = titleText;
        title.className = 'hero-title';

        const subtitle = document.createElement('p');
        subtitle.textContent = subtitleText;
        subtitle.className = 'hero-subtitle';

        const cta = document.createElement('button');
        cta.textContent = ctaText;
        cta.className = 'btn btn-primary';

        content.appendChild(title);
        content.appendChild(subtitle);
        content.appendChild(cta);
        section.appendChild(content);

        return section;
    },

    /**
     * Content section layout
     */
    createContentLayout: (title, content, layout = 'center') => {
        const section = document.createElement('section');
        section.style.cssText = `
            padding: ${Spacing.get('3xl')}px ${Spacing.get('2xl')}px;
            max-width: ${Grid.containerWidths.xl}px;
            margin: 0 auto;
        `;

        const heading = document.createElement('h2');
        heading.textContent = title;
        heading.style.cssText = `
            margin-bottom: ${Spacing.get('2xl')}px;
            text-align: ${layout === 'center' ? 'center' : 'left'};
        `;

        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = content;
        contentDiv.style.cssText = `
            line-height: 1.8;
            color: #424242;
        `;

        section.appendChild(heading);
        section.appendChild(contentDiv);

        return section;
    },

    /**
     * Grid of cards layout
     */
    createCardGridLayout: (cards, columns = 3) => {
        const section = document.createElement('section');
        section.style.cssText = `
            padding: ${Spacing.get('3xl')}px ${Spacing.get('2xl')}px;
            max-width: ${Grid.containerWidths.xl}px;
            margin: 0 auto;
        `;

        const grid = document.createElement('div');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: ${Grid.gutter}px;
            margin-top: ${Spacing.get('2xl')}px;
        `;

        cards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            cardEl.innerHTML = card;
            cardEl.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: ${Spacing.get('lg')}px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            `;
            grid.appendChild(cardEl);
        });

        section.appendChild(grid);
        return section;
    }
};

/**
 * ResponsiveHelper - Responsive behavior management
 */
const ResponsiveHelper = {
    /**
     * Adjust layout for mobile
     */
    optimizeForMobile: () => {
        if (Grid.getBreakpoint() === 'xs') {
            // Reduce padding/margins on mobile
            document.querySelectorAll('section').forEach(section => {
                section.style.padding = `${Spacing.get('lg')}px ${Spacing.get('md')}px`;
            });

            // Stack grid items
            document.querySelectorAll('[style*="grid"]').forEach(grid => {
                grid.style.gridTemplateColumns = '1fr';
            });

            // Hide non-essential elements
            document.querySelectorAll('[data-hide-mobile]').forEach(el => {
                el.style.display = 'none';
            });
        }
    },

    /**
     * Optimize for tablet
     */
    optimizeForTablet: () => {
        if (Grid.getBreakpoint() === 'md') {
            document.querySelectorAll('[style*="grid"]').forEach(grid => {
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            });
        }
    },

    /**
     * Optimize for desktop
     */
    optimizeForDesktop: () => {
        if (Grid.getBreakpoint() !== 'xs') {
            document.querySelectorAll('[style*="grid"]').forEach(grid => {
                grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            });
        }
    },

    /**
     * Adjust layout on resize
     */
    setupResponsiveListener: () => {
        window.addEventListener('resize', () => {
            const bp = Grid.getBreakpoint();
            if (bp === 'xs') {
                ResponsiveHelper.optimizeForMobile();
            } else if (bp === 'md') {
                ResponsiveHelper.optimizeForTablet();
            } else {
                ResponsiveHelper.optimizeForDesktop();
            }
        }, { passive: true });
    }
};

/**
 * Container - Predefined container styles
 */
const Container = {
    /**
     * Create a container with proper max-width and centering
     */
    create: (width = 'lg') => {
        const container = document.createElement('div');
        const maxWidth = Grid.containerWidths[width] || Grid.containerWidths.lg;

        container.style.cssText = `
            max-width: ${maxWidth}px;
            margin-left: auto;
            margin-right: auto;
            padding-left: ${Spacing.get('md')}px;
            padding-right: ${Spacing.get('md')}px;
        `;

        return container;
    },

    /**
     * Apply container styles to element
     */
    apply: (element, width = 'lg') => {
        const maxWidth = Grid.containerWidths[width] || Grid.containerWidths.lg;
        element.style.maxWidth = maxWidth + 'px';
        element.style.marginLeft = 'auto';
        element.style.marginRight = 'auto';
        element.style.paddingLeft = Spacing.get('md') + 'px';
        element.style.paddingRight = Spacing.get('md') + 'px';
    }
};

/**
 * VerticalRhythm - Maintain consistent spacing
 */
const VerticalRhythm = {
    baseLineHeight: 1.5,
    baseSpacing: 24,

    /**
     * Calculate spacing based on rhythm
     */
    getSpacing: (lines = 1) => {
        return (VerticalRhythm.baseSpacing * lines) + 'px';
    },

    /**
     * Apply rhythm to element
     */
    applyRhythm: (element, marginBottom = 1) => {
        element.style.marginBottom = VerticalRhythm.getSpacing(marginBottom);
    },

    /**
     * Apply rhythm to all elements
     */
    applyGlobalRhythm: () => {
        document.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((el, index) => {
            el.style.marginBottom = VerticalRhythm.getSpacing(1);
        });
    }
};

/**
 * Initialize layout system on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Apply container styles
    Container.apply(document.body);

    // Optimize for current viewport
    const bp = Grid.getBreakpoint();
    if (bp === 'xs') {
        ResponsiveHelper.optimizeForMobile();
    } else if (bp === 'md') {
        ResponsiveHelper.optimizeForTablet();
    } else {
        ResponsiveHelper.optimizeForDesktop();
    }

    // Apply vertical rhythm
    VerticalRhythm.applyGlobalRhythm();

    // Setup responsive listener
    ResponsiveHelper.setupResponsiveListener();

    console.log('📐 Layout grid system initialized');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Grid,
        Spacing,
        SectionLayout,
        ResponsiveHelper,
        Container,
        VerticalRhythm
    };
}

window.Grid = Grid;
window.Spacing = Spacing;
window.SectionLayout = SectionLayout;
window.ResponsiveHelper = ResponsiveHelper;
window.Container = Container;
window.VerticalRhythm = VerticalRhythm;
