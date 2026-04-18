/**
 * DigitalStark Aachen - Premium Animation Library
 * Advanced animation utilities and effects
 * Token-intensive comprehensive animation toolkit
 */

'use strict';

/**
 * Animation Library - Collection of advanced animation functions
 */
const AnimationLibrary = {

    /**
     * Morphing animation between shapes
     */
    morphShape: (element, startPath, endPath, duration = 1000) => {
        const svg = element.querySelector('svg');
        if (!svg) return;

        const path = svg.querySelector('path');
        if (!path) return;

        const startLength = path.getTotalLength();
        const endLength = path.getTotalLength();

        let start = null;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);

            // Animate stroke-dashoffset for morphing effect
            const offset = startLength * (1 - progress);
            path.style.strokeDashoffset = offset;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        path.style.strokeDasharray = startLength;
        path.style.strokeDashoffset = 0;
        requestAnimationFrame(step);
    },

    /**
     * Ripple effect on element
     */
    rippleEffect: (element, event) => {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    },

    /**
     * Staggered animation for elements
     */
    staggerElements: (elements, delay = 100, animationClass = 'in-view') => {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add(animationClass);
            }, index * delay);
        });
    },

    /**
     * Scroll to element with custom easing
     */
    scrollToElement: (element, options = {}) => {
        const {
            duration = 500,
            easing = 'easeInOutCubic',
            offset = 0,
        } = options;

        const targetPosition = element.getBoundingClientRect().top + window.scrollY - offset;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        let start = null;

        const easingFunctions = {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * (t - 2)) * (2 * (t - 2)) + 1,
            easeInQuart: t => t * t * t * t,
            easeOutQuart: t => 1 - (--t) * t * t * t,
            easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
            easeInQuint: t => t * t * t * t * t,
            easeOutQuint: t => 1 + (--t) * t * t * t * t,
            easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
        };

        const easeFn = easingFunctions[easing] || easingFunctions.easeInOutCubic;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = easeFn(progress);

            window.scrollTo(0, startPosition + distance * ease);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    },

    /**
     * Parallax scroll effect
     */
    parallaxScroll: (element, speed = 0.5) => {
        const scrollY = window.scrollY;
        element.style.transform = `translateY(${scrollY * speed}px)`;
    },

    /**
     * Color transition animation
     */
    transitionColor: (element, startColor, endColor, duration = 1000) => {
        const startRGB = AnimationLibrary.hexToRgb(startColor);
        const endRGB = AnimationLibrary.hexToRgb(endColor);

        let start = null;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);

            const r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * progress);
            const g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * progress);
            const b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * progress);

            element.style.color = `rgb(${r}, ${g}, ${b})`;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    },

    /**
     * Convert hex color to RGB
     */
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : { r: 0, g: 0, b: 0 };
    },

    /**
     * Bounce animation
     */
    bounce: (element, options = {}) => {
        const { duration = 600, height = 20 } = options;

        element.style.animation = `bounce ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
    },

    /**
     * Rotate animation
     */
    rotate: (element, options = {}) => {
        const { duration = 1000, angle = 360 } = options;

        let start = null;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const progress = ((timestamp - start) / duration) % 1;
            const rotation = angle * progress;

            element.style.transform = `rotate(${rotation}deg)`;

            requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    },

    /**
     * Scale pulse animation
     */
    pulse: (element, options = {}) => {
        const { duration = 1000, minScale = 0.95, maxScale = 1.05 } = options;

        let start = null;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const elapsed = (timestamp - start) % duration;
            const progress = elapsed / duration;

            // Sine wave for smooth pulse
            const scale = minScale + (maxScale - minScale) * (Math.sin(progress * Math.PI * 2) + 1) / 2;

            element.style.transform = `scale(${scale})`;

            requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    },

    /**
     * Slide in animation
     */
    slideIn: (element, direction = 'left', options = {}) => {
        const { duration = 600, distance = 50 } = options;

        const directions = {
            left: { from: `-${distance}px`, to: '0px' },
            right: { from: `${distance}px`, to: '0px' },
            up: { from: `${distance}px`, to: '0px', property: 'translateY' },
            down: { from: `-${distance}px`, to: '0px', property: 'translateY' },
        };

        const { from, to, property = 'translateX' } = directions[direction];

        element.style.opacity = '0';
        element.style.transform = `${property}(${from})`;

        let start = null;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);

            element.style.opacity = progress;

            // Animate translation
            const distance = parseInt(from) + (parseInt(to) - parseInt(from)) * progress;
            element.style.transform = `${property}(${distance}px)`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.style.opacity = '1';
                element.style.transform = `${property}(${to})`;
            }
        }

        requestAnimationFrame(step);
    },

    /**
     * Fade in/out animation
     */
    fadeIn: (element, duration = 500) => {
        element.style.opacity = '0';
        element.style.display = 'block';

        let start = null;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);

            element.style.opacity = progress;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.style.opacity = '1';
            }
        }

        requestAnimationFrame(step);
    },

    fadeOut: (element, duration = 500, callback = null) => {
        let start = null;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);

            element.style.opacity = 1 - progress;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.style.opacity = '0';
                element.style.display = 'none';
                if (callback) callback();
            }
        }

        requestAnimationFrame(step);
    },

    /**
     * Shake animation
     */
    shake: (element, options = {}) => {
        const { duration = 400, distance = 10 } = options;

        const startX = element.offsetLeft;
        let start = null;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const elapsed = timestamp - start;
            const progress = elapsed / duration;

            if (progress < 1) {
                // Rapid oscillation
                const offset = Math.sin(progress * Math.PI * 8) * distance * (1 - progress);
                element.style.transform = `translateX(${offset}px)`;
                requestAnimationFrame(step);
            } else {
                element.style.transform = 'translateX(0)';
            }
        }

        requestAnimationFrame(step);
    },

    /**
     * Flip animation
     */
    flip: (element, options = {}) => {
        const { duration = 600, axis = 'Y' } = options;

        let start = null;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);

            // Easing function for flip
            const ease = Math.sin(progress * Math.PI) * 180;

            element.style.transform = `rotate${axis}(${ease}deg)`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.style.transform = `rotate${axis}(0deg)`;
            }
        }

        requestAnimationFrame(step);
    },

    /**
     * Glow effect animation
     */
    glow: (element, color = '#42a5f5', duration = 1500) => {
        let start = null;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const elapsed = (timestamp - start) % duration;
            const progress = elapsed / duration;

            // Sine wave for pulsing glow
            const intensity = (Math.sin(progress * Math.PI * 2) + 1) / 2;
            const alpha = 0.3 + (intensity * 0.4);

            element.style.boxShadow = `0 0 ${20 + intensity * 10}px ${color}${Math.round(alpha * 255).toString(16)}`;

            requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    },
};

/**
 * Gesture Detector - Advanced touch and mouse gesture detection
 */
const GestureDetector = {

    /**
     * Detect swipe gesture
     */
    onSwipe: (element, callback) => {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        element.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, false);

        element.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;

            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            const threshold = 50;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > threshold) {
                    callback({ direction: 'left', distance: Math.abs(diffX) });
                } else if (diffX < -threshold) {
                    callback({ direction: 'right', distance: Math.abs(diffX) });
                }
            } else {
                if (diffY > threshold) {
                    callback({ direction: 'up', distance: Math.abs(diffY) });
                } else if (diffY < -threshold) {
                    callback({ direction: 'down', distance: Math.abs(diffY) });
                }
            }
        }, false);
    },

    /**
     * Detect long press
     */
    onLongPress: (element, callback, duration = 500) => {
        let pressTimer = null;

        element.addEventListener('touchstart', () => {
            pressTimer = setTimeout(() => {
                callback();
            }, duration);
        }, false);

        element.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        }, false);

        element.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        }, false);
    },

    /**
     * Detect pinch gesture
     */
    onPinch: (element, callback) => {
        let lastDistance = 0;

        element.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (lastDistance !== 0) {
                    const scale = distance / lastDistance;
                    callback({ scale, distance });
                }

                lastDistance = distance;
            }
        }, false);

        element.addEventListener('touchend', () => {
            lastDistance = 0;
        }, false);
    },

    /**
     * Detect double tap
     */
    onDoubleTap: (element, callback) => {
        let lastTap = 0;

        element.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            if (tapLength < 500 && tapLength > 0) {
                callback(e);
                e.preventDefault();
            }

            lastTap = currentTime;
        }, false);
    },
};

/**
 * Performance Monitor - Track and optimize performance
 */
const PerformanceMonitor = {

    /**
     * Measure function execution time
     */
    measureFunction: (func, label = 'Function Execution') => {
        const start = performance.now();
        const result = func();
        const end = performance.now();

        console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
        return result;
    },

    /**
     * Monitor animation frame rate
     */
    monitorFrameRate: () => {
        let frameCount = 0;
        let lastTime = performance.now();

        const measureFrame = () => {
            const currentTime = performance.now();
            frameCount++;

            if (currentTime - lastTime >= 1000) {
                console.log(`FPS: ${frameCount}`);
                frameCount = 0;
                lastTime = currentTime;
            }

            requestAnimationFrame(measureFrame);
        };

        requestAnimationFrame(measureFrame);
    },

    /**
     * Get memory usage (if available)
     */
    getMemoryUsage: () => {
        if (performance.memory) {
            const used = Math.round(performance.memory.usedJSHeapSize / 1048576);
            const limit = Math.round(performance.memory.jsHeapSizeLimit / 1048576);
            console.log(`Memory: ${used}MB / ${limit}MB`);
        }
    },

    /**
     * Measure paint timing
     */
    measurePaintTiming: () => {
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
            console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
        });
    },
};

/**
 * Accessibility Helpers - Enhanced accessibility features
 */
const AccessibilityHelpers = {

    /**
     * Announce to screen readers
     */
    announce: (message, priority = 'polite') => {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);

        setTimeout(() => announcement.remove(), 1000);
    },

    /**
     * Set focus to element with announcement
     */
    focusAndAnnounce: (element, message) => {
        element.focus();
        AccessibilityHelpers.announce(message);
    },

    /**
     * Skip to main content link
     */
    addSkipLink: () => {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Zum Hauptinhalt springen';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: #000;
            color: #fff;
            padding: 8px;
            z-index: 100;
        `;

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '0';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    },
};

/**
 * Spring Physics - Realistic spring-based animations
 */
const SpringPhysics = {

    /**
     * Spring animation with realistic physics
     */
    springAnimate: (element, targetValue, property = 'opacity', options = {}) => {
        const {
            stiffness = 0.1,
            damping = 0.8,
            mass = 1,
            velocity = 0,
            precision = 0.01,
        } = options;

        const startValue = property === 'opacity'
            ? parseFloat(window.getComputedStyle(element)[property])
            : 0;

        let currentValue = startValue;
        let currentVelocity = velocity;

        function step() {
            const distance = targetValue - currentValue;
            const springForce = stiffness * distance;
            const dampingForce = damping * currentVelocity;
            const acceleration = (springForce - dampingForce) / mass;

            currentVelocity += acceleration;
            currentValue += currentVelocity;

            if (property === 'opacity') {
                element.style.opacity = Math.max(0, Math.min(1, currentValue));
            } else if (property === 'transform') {
                element.style.transform = `scale(${currentValue})`;
            } else {
                element.style[property] = currentValue;
            }

            if (Math.abs(currentValue - targetValue) > precision || Math.abs(currentVelocity) > precision) {
                requestAnimationFrame(step);
            } else {
                element.style[property] = property === 'opacity'
                    ? targetValue
                    : (property === 'transform' ? `scale(${targetValue})` : targetValue);
            }
        }

        requestAnimationFrame(step);
    },

    /**
     * Elastic bounce with spring effect
     */
    elasticBounce: (element, options = {}) => {
        const { duration = 1000, bounceCount = 3 } = options;

        let start = null;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);

            // Elastic easing with multiple bounces
            let ease;
            if (progress < 0.5) {
                ease = Math.pow(2, 10 * (progress - 1)) * Math.cos((progress - 1.075) * (2 * Math.PI) / 0.3);
            } else {
                ease = Math.pow(2, -10 * (progress - 1)) * Math.cos((progress - 1.075) * (2 * Math.PI) / 0.3) + 1;
            }

            const scale = 1 + ease * 0.1;
            element.style.transform = `scale(${scale})`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.style.transform = 'scale(1)';
            }
        }

        requestAnimationFrame(step);
    },
};

/**
 * Particle Effects - Advanced particle system for animations
 */
const ParticleEffects = {

    /**
     * Create particle burst effect
     */
    particleBurst: (element, options = {}) => {
        const {
            particleCount = 20,
            speed = 5,
            duration = 1000,
            color = '#42a5f5',
        } = options;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            ParticleEffects._createParticle(centerX, centerY, vx, vy, duration, color);
        }
    },

    /**
     * Create single particle
     */
    _createParticle: (x, y, vx, vy, duration, color) => {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 8px;
            height: 8px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
        `;

        document.body.appendChild(particle);

        let start = null;
        const gravity = 0.1;
        let currentVy = vy;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const elapsed = timestamp - start;
            const progress = elapsed / duration;

            currentVy += gravity;

            const newX = x + vx * elapsed / 16;
            const newY = y + currentVy * elapsed / 16;

            particle.style.left = newX + 'px';
            particle.style.top = newY + 'px';
            particle.style.opacity = 1 - progress;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                particle.remove();
            }
        }

        requestAnimationFrame(step);
    },

    /**
     * Confetti effect
     */
    confetti: (options = {}) => {
        const { duration = 2000, count = 50 } = options;
        const colors = ['#42a5f5', '#4caf50', '#2e7d32', '#0ea5e9'];

        for (let i = 0; i < count; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const x = Math.random() * window.innerWidth;
            const y = -10;
            const vx = (Math.random() - 0.5) * 4;
            const vy = 2 + Math.random() * 4;

            ParticleEffects._createParticle(x, y, vx, vy, duration, color);
        }
    },
};

/**
 * Animation Timeline - Orchestrate complex animations
 */
const AnimationTimeline = {

    /**
     * Sequence animations in order
     */
    sequence: async (animations) => {
        for (const animation of animations) {
            await new Promise(resolve => {
                animation();
                setTimeout(resolve, 300);
            });
        }
    },

    /**
     * Parallel animations
     */
    parallel: async (animations) => {
        return Promise.all(animations.map(anim =>
            new Promise(resolve => {
                anim();
                setTimeout(resolve, 300);
            })
        ));
    },

    /**
     * Stagger animations with timing control
     */
    stagger: (elements, animationFn, delay = 100, options = {}) => {
        elements.forEach((element, index) => {
            setTimeout(() => {
                animationFn(element, index, options);
            }, index * delay);
        });
    },

    /**
     * Chain animations with callbacks
     */
    chain: (animations) => {
        let currentIndex = 0;

        const playNext = () => {
            if (currentIndex < animations.length) {
                const animation = animations[currentIndex];
                const callback = () => {
                    currentIndex++;
                    playNext();
                };
                animation(callback);
            }
        };

        playNext();
    },
};

/**
 * Advanced Easing Functions - Additional easing curves
 */
const EasingFunctions = {

    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * (t - 2)) * (2 * (t - 2)) + 1,
    easeInQuart: t => t * t * t * t,
    easeOutQuart: t => 1 - (--t) * t * t * t,
    easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    easeInQuint: t => t * t * t * t * t,
    easeOutQuint: t => 1 + (--t) * t * t * t * t,
    easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
    easeInSine: t => 1 - Math.cos((t * Math.PI) / 2),
    easeOutSine: t => Math.sin((t * Math.PI) / 2),
    easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
    easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
    easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeInOutExpo: t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
    easeInCirc: t => 1 - Math.sqrt(1 - Math.pow(t, 2)),
    easeOutCirc: t => Math.sqrt(1 - Math.pow(t - 1, 2)),
    easeInOutCirc: t => t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
    easeInElastic: t => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * 2.0943951023),
    easeOutElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * 2.0943951023) + 1,
    easeInOutElastic: t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * 1.5707963268)) / 2 : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * 1.5707963268)) / 2 + 1,
    easeInBack: t => 2.70158 * t * t * t - 1.70158 * t * t,
    easeOutBack: t => 1 + 2.70158 * (--t) * t * t + 1.70158 * t * t,
    easeInOutBack: t => t < 0.5 ? (Math.pow(2 * t, 2) * ((2.5949095 + 1) * 2 * t - 2.5949095)) / 2 : (Math.pow(2 * t - 2, 2) * ((2.5949095 + 1) * (t * 2 - 2) + 2.5949095) + 2) / 2,
};

/**
 * Scroll Effects - Advanced scroll-based effects
 */
const ScrollEffects = {

    /**
     * Parallax with depth layers
     */
    depthParallax: (element, speed = 0.5, depth = 1) => {
        const baseSpeed = speed * depth;
        element.style.willChange = 'transform';
        element.style.transform = `translateZ(0) translateY(${window.scrollY * baseSpeed}px)`;
    },

    /**
     * Blur effect based on scroll velocity
     */
    blurOnScroll: (element, options = {}) => {
        const { maxBlur = 20, sensitivity = 0.1 } = options;

        let lastScrollY = window.scrollY;
        let scrollVelocity = 0;

        window.addEventListener('scroll', () => {
            scrollVelocity = Math.abs(window.scrollY - lastScrollY) * sensitivity;
            const blurAmount = Math.min(scrollVelocity, maxBlur);
            element.style.filter = `blur(${blurAmount}px)`;
            lastScrollY = window.scrollY;
        }, { passive: true });
    },

    /**
     * Reveal text on scroll
     */
    revealText: (element, options = {}) => {
        const { trigger = 0.5 } = options;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progress = entry.intersectionRatio;
                    const words = element.textContent.split(' ');
                    const visibleCount = Math.ceil(words.length * progress);

                    element.style.clip = `rect(0, ${visibleCount * 50}px, 100%, 0)`;
                }
            });
        }, { threshold: [0, 0.5, 1] });

        observer.observe(element);
    },
};

/**
 * Enhanced Gesture Support - Additional touch and mouse events
 */
const EnhancedGestures = {

    /**
     * Detect rotation gesture (two-finger rotate)
     */
    onRotate: (element, callback) => {
        let initialRotation = 0;
        let lastAngle = 0;

        element.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                const angle = Math.atan2(
                    touch2.clientY - touch1.clientY,
                    touch2.clientX - touch1.clientX
                ) * 180 / Math.PI;

                if (lastAngle !== 0) {
                    const rotation = angle - lastAngle;
                    callback({ angle, rotation });
                }

                lastAngle = angle;
            }
        }, { passive: true });

        element.addEventListener('touchend', () => {
            lastAngle = 0;
        });
    },

    /**
     * Detect hover intent (prepare for interaction)
     */
    onHoverIntent: (element, callback, delay = 200) => {
        let hoverTimer = null;

        element.addEventListener('mouseenter', () => {
            hoverTimer = setTimeout(() => {
                callback({ type: 'intent' });
            }, delay);
        });

        element.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);
        });
    },

    /**
     * Detect mouse wheel direction and intensity
     */
    onMouseWheel: (element, callback) => {
        element.addEventListener('wheel', (e) => {
            callback({
                direction: e.deltaY > 0 ? 'down' : 'up',
                intensity: Math.abs(e.deltaY),
                deltaX: e.deltaX,
                deltaY: e.deltaY,
                deltaZ: e.deltaZ,
            });
        }, { passive: true });
    },

    /**
     * Detect pointer pressure (for devices that support it)
     */
    onPointerPressure: (element, callback) => {
        element.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'pen' && e.pressure !== undefined) {
                callback({
                    pressure: e.pressure,
                    x: e.clientX,
                    y: e.clientY,
                    isPrimary: e.isPrimary,
                });
            }
        }, { passive: true });
    },
};

/**
 * Canvas Animations - Advanced canvas-based effects
 */
const CanvasAnimations = {

    /**
     * Create animated gradient canvas
     */
    animatedGradient: (canvasElement, options = {}) => {
        const {
            color1 = '#42a5f5',
            color2 = '#4caf50',
            duration = 3000,
        } = options;

        const ctx = canvasElement.getContext('2d');
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;

        let start = null;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const progress = ((timestamp - start) % duration) / duration;

            const gradient = ctx.createLinearGradient(0, 0, canvasElement.width, canvasElement.height);
            const offset = progress * canvasElement.width;

            gradient.addColorStop(0, color1);
            gradient.addColorStop(Math.min(progress, 1), color2);
            gradient.addColorStop(1, color1);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

            requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    },
};

/**
 * Motion Path - Animate along SVG paths
 */
const MotionPath = {

    /**
     * Animate element along SVG path
     */
    followPath: (element, pathElement, options = {}) => {
        const { duration = 3000, loop = false } = options;

        const pathLength = pathElement.getTotalLength();
        let start = null;

        function step(timestamp) {
            if (start === null) start = timestamp;
            const elapsed = timestamp - start;
            const progress = (elapsed % duration) / duration;

            const distance = pathLength * progress;
            const point = pathElement.getPointAtLength(distance);

            element.style.transform = `translate(${point.x}px, ${point.y}px)`;

            if (loop || progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    },
};

// Initialize if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AnimationLibrary,
        GestureDetector,
        PerformanceMonitor,
        AccessibilityHelpers,
        SpringPhysics,
        ParticleEffects,
        AnimationTimeline,
        EasingFunctions,
        ScrollEffects,
        EnhancedGestures,
        CanvasAnimations,
        MotionPath,
    };
}
