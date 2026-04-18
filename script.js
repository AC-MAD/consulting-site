/**
 * DigitalStark Aachen - Premium Animation-Rich Interactive JavaScript
 * Heavy JavaScript with Apple-level smooth interactions
 * Token-intensive comprehensive implementation
 */

'use strict';

// ============================================
// GLOBAL CONFIGURATION
// ============================================
const config = {
    animationDuration: 300,
    scrollDuration: 500,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    preloadDuration: 2500,
    enableParallax: true,
    enableSmootScroll: true,
    scrollThrottle: 16, // ~60fps
};

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    isModalOpen: false,
    isProjectModalOpen: false,
    currentScrollY: 0,
    lastScrollY: 0,
    scrollVelocity: 0,
    isScrolling: false,
    preloadFinished: false,
    touchStartX: 0,
    touchStartY: 0,
    activeSection: 'home',
    animatedElements: new Set(),
    countersAnimated: new Set(),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function for performance optimization
 */
function debounce(func, delay) {
    let timeoutId;
    return function debounced(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

/**
 * Throttle function for scroll events
 */
function throttle(func, limit) {
    let lastCall = 0;
    return function throttled(...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            func(...args);
        }
    };
}

/**
 * Smooth easing functions
 */
const easing = {
    smooth: (t) => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    spring: (t) => {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * (t - 2)) * (2 * (t - 2)) + 1;
    },
    out: (t) => {
        return 1 - Math.pow(1 - t, 3);
    },
};

/**
 * Animate scroll position
 */
function smoothScrollTo(target, duration = config.scrollDuration) {
    const startPosition = window.scrollY;
    const targetPosition = typeof target === 'string'
        ? document.querySelector(target)?.offsetTop || 0
        : target.offsetTop || target;

    const distance = targetPosition - startPosition;
    let start = null;

    function animateScroll(currentTime) {
        if (start === null) start = currentTime;
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easing.smooth(progress);

        window.scrollTo(0, startPosition + distance * ease);

        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    }

    requestAnimationFrame(animateScroll);
}

/**
 * Animate number counter
 */
function animateCounter(element, target, duration = 2000) {
    if (state.countersAnimated.has(element)) return;
    state.countersAnimated.add(element);

    const startValue = 0;
    let start = null;

    function step(timestamp) {
        if (start === null) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = easing.out(progress);
        const currentValue = Math.floor(startValue + (target - startValue) * ease);

        element.textContent = currentValue.toLocaleString('de-DE');

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.textContent = target.toLocaleString('de-DE');
        }
    }

    requestAnimationFrame(step);
}

/**
 * Get element position relative to viewport
 */
function getElementVisibility(element) {
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top,
        bottom: rect.bottom,
        visible: rect.top < window.innerHeight && rect.bottom > 0,
        progress: Math.max(0, Math.min(1, 1 - (rect.top / window.innerHeight))),
    };
}

/**
 * Dispatch custom event
 */
function dispatchEvent(name, detail = {}) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
}

/**
 * Clamp value between min and max
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DigitalStark Aachen - Initializing...');

    // Wait for preload animation
    setTimeout(() => {
        initializePreload();
        initializeScrollTracking();
        initializeNavigation();
        initializeScrollAnimations();
        initializeCounters();
        initializeModals();
        initializeServiceButtons();
        initializeProjectButtons();
        initializeParallax();
        initializeContactLinks();
        initializeNavLinks();
        initializeObservers();

        state.preloadFinished = true;
        console.log('✅ All systems initialized');
    }, 100);
});

// ============================================
// PRELOAD ANIMATION
// ============================================
function initializePreload() {
    const preloadAnimation = document.getElementById('preloadAnimation');
    if (!preloadAnimation) return;

    // Fade out after duration
    setTimeout(() => {
        preloadAnimation.style.opacity = '0';
        preloadAnimation.style.pointerEvents = 'none';
    }, config.preloadDuration);
}

// ============================================
// SCROLL TRACKING
// ============================================
function initializeScrollTracking() {
    window.addEventListener('scroll', throttle(() => {
        state.lastScrollY = state.currentScrollY;
        state.currentScrollY = window.scrollY;
        state.scrollVelocity = state.currentScrollY - state.lastScrollY;
        state.isScrolling = true;

        // Trigger scroll animations
        triggerScrollAnimations();
        updateActiveSection();
        handleParallaxEffect();
    }, config.scrollThrottle), { passive: true });

    // Handle scroll end
    window.addEventListener('scroll', debounce(() => {
        state.isScrolling = false;
    }, 150), { passive: true });
}

/**
 * Update active section based on scroll position
 */
function updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    let currentSection = 'home';

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            currentSection = section.id;
        }
    });

    state.activeSection = currentSection;
}

// ============================================
// NAVIGATION
// ============================================
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const navItems = document.querySelectorAll('.nav-item');
    const hamburger = document.getElementById('hamburger');

    // Smooth scroll animation on nav click
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const href = item.getAttribute('href');
            if (href && href.startsWith('#')) {
                smoothScrollTo(href);
                updateNavActiveState(href);
            }
        });
    });

    // Hamburger menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            // Add mobile menu functionality here if needed
        });
    }

    // Hide navbar on scroll down, show on scroll up
    let lastScrollDirection = 0;
    window.addEventListener('scroll', throttle(() => {
        const currentScroll = window.scrollY;
        const navHeight = navbar.offsetHeight;

        if (currentScroll > navHeight) {
            if (state.scrollVelocity > 0) {
                // Scrolling down - hide navbar
                navbar.style.transform = 'translateY(-100%)';
            } else if (state.scrollVelocity < 0) {
                // Scrolling up - show navbar
                navbar.style.transform = 'translateY(0)';
            }
        }
    }, 50), { passive: true });
}

/**
 * Update active nav state
 */
function updateNavActiveState(sectionId) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === sectionId) {
            item.classList.add('active');
        }
    });
}

/**
 * Initialize nav links for smooth scrolling
 */
function initializeNavLinks() {
    const links = document.querySelectorAll('a[data-smooth]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(href);
            }
        });
    });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function triggerScrollAnimations() {
    // Trigger animations for elements coming into view
    document.querySelectorAll('.service-item, .project-card, .stat-box, .value-box, .contact-card').forEach(element => {
        if (state.animatedElements.has(element)) return;

        const visibility = getElementVisibility(element);
        if (visibility.visible && visibility.progress > 0.2) {
            element.classList.add('in-view');
            state.animatedElements.add(element);
        }
    });
}

/**
 * Initialize scroll animations with Intersection Observer
 */
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !state.animatedElements.has(entry.target)) {
                entry.target.classList.add('in-view');
                state.animatedElements.add(entry.target);

                // Trigger stagger animation for child elements
                const children = entry.target.querySelectorAll('.service-item, .project-card, .stat-box');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('in-view');
                    }, index * 100);
                });
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll(
        'h2, h3, p, .service-item, .project-card, .stat-box, .value-box, .contact-card'
    ).forEach(el => observer.observe(el));
}

// ============================================
// COUNTER ANIMATIONS
// ============================================
function initializeCounters() {
    const counters = document.querySelectorAll('.counter');

    const observerOptions = {
        threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !state.countersAnimated.has(entry.target)) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target, 2000);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

// ============================================
// PARALLAX EFFECT
// ============================================
function initializeParallax() {
    if (!config.enableParallax) return;

    const blobs = document.querySelectorAll('.gradient-blob');
    if (blobs.length === 0) return;

    // Mouse move parallax for desktop
    document.addEventListener('mousemove', throttle((e) => {
        const x = (e.clientX / window.innerWidth) * 20;
        const y = (e.clientY / window.innerHeight) * 20;

        blobs.forEach((blob, index) => {
            const offset = (index + 1) * 10;
            blob.style.transform = `translate(${x * offset}px, ${y * offset}px)`;
        });
    }, 30), { passive: true });

    // Scroll parallax
    window.addEventListener('scroll', throttle(() => {
        const scrolled = window.scrollY;
        const hero = document.querySelector('.hero');

        if (hero && state.currentScrollY < hero.offsetHeight) {
            const parallaxBlobs = hero.querySelectorAll('.gradient-blob');
            parallaxBlobs.forEach((blob, index) => {
                const offset = (index + 1) * 0.3;
                blob.style.transform = `translateY(${scrolled * offset}px)`;
            });
        }
    }, 30), { passive: true });
}

/**
 * Handle parallax effect on various elements
 */
function handleParallaxEffect() {
    const scrolled = window.scrollY;

    // Parallax for hero section background
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }

    // Parallax for hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && scrolled < window.innerHeight) {
        heroTitle.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroTitle.style.opacity = 1 - (scrolled / (window.innerHeight * 1.5));
    }
}

// ============================================
// MODALS
// ============================================
function initializeModals() {
    const serviceModal = document.getElementById('serviceModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalClose = document.getElementById('modalClose');
    const projectModal = document.getElementById('projectModal');
    const projectBackdrop = document.getElementById('projectBackdrop');
    const projectClose = document.getElementById('projectModalClose');

    // Service modal close
    if (modalClose && modalBackdrop) {
        modalClose.addEventListener('click', closeServiceModal);
        modalBackdrop.addEventListener('click', closeServiceModal);
    }

    // Project modal close
    if (projectClose && projectBackdrop) {
        projectClose.addEventListener('click', closeProjectModal);
        projectBackdrop.addEventListener('click', closeProjectModal);
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeServiceModal();
            closeProjectModal();
        }
    });

    // Prevent body scroll when modal is open
    document.addEventListener('modal-open', () => {
        document.body.style.overflow = 'hidden';
    });

    document.addEventListener('modal-close', () => {
        document.body.style.overflow = '';
    });
}

/**
 * Close service modal
 */
function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    modal.classList.remove('active');
    state.isModalOpen = false;
    dispatchEvent('modal-close');
}

/**
 * Close project modal
 */
function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    state.isProjectModalOpen = false;
    dispatchEvent('modal-close');
}

// ============================================
// SERVICE BUTTONS
// ============================================
function initializeServiceButtons() {
    const serviceButtons = document.querySelectorAll('.service-btn');
    serviceButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}

/**
 * Expand service details
 */
function expandService(index) {
    const serviceData = getServiceData(index);
    const modal = document.getElementById('serviceModal');
    const modalBody = document.getElementById('modalBody');

    // Create rich modal content
    modalBody.innerHTML = `
        <h2>${serviceData.title}</h2>
        <p>${serviceData.description}</p>
        <h3 style="margin-top: 24px; margin-bottom: 12px; font-size: 18px; color: #212121;">Enthält:</h3>
        <ul>
            ${serviceData.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
        <p style="margin-top: 24px; font-size: 14px; color: #9e9e9e;">
            🎯 Kostenlos für alle Aachener Vereine
        </p>
        <p style="margin-top: 12px;">
            <a href="mailto:kontakt@digitalstark-aachen.de?subject=Anfrage: ${serviceData.title}"
               style="color: #4caf50; font-weight: 600; text-decoration: none;">
                Jetzt anfragen →
            </a>
        </p>
    `;

    // Smooth scroll to top and open modal
    window.scrollTo({ top: 0, behavior: 'smooth' });

    modal.classList.add('active');
    state.isModalOpen = true;
    dispatchEvent('modal-open');
}

/**
 * Get service data
 */
function getServiceData(index) {
    const services = [
        {
            title: 'Website-Erstellung',
            description: 'Wir erstellen professionelle, responsive Websites speziell für Vereine und lokale Organisationen. Jede Website ist modular aufgebaut, einfach zu verwalten und vollständig kostenlos.',
            features: [
                'Responsive Design für alle Geräte',
                'SEO optimiert für Suchmaschinen',
                'Kostenlos gehostet auf sicheren Servern',
                'Einfache Content-Verwaltung ohne technische Kenntnisse',
                'Mobile-First Design',
                'Unbegrenzte Besucher und Bandbreite',
                'SSL-Verschlüsselung',
                'Automatische Backups',
                'Moderne Design-Vorlagen',
                'Bildergalerie und Mediaverwaltung',
                'Kontaktformulare und Newsletter',
                'Social Media Integration',
            ],
        },
        {
            title: 'Cybersecurity-Beratung',
            description: 'Umfassende Sicherheitsaudits und individuelle Beratung für Ihre Organisation. Wir analysieren Ihre IT-Infrastruktur und geben konkrete, umsetzbare Empfehlungen.',
            features: [
                'Vollständiger Sicherheitsaudit',
                'Analyse von Zugriffsrechten und Passwörtern',
                'Bewertung von Cloud-Services',
                'Mitarbeiterschulung zu IT-Sicherheit',
                'Entwicklung von Security-Richtlinien',
                'Laufende Unterstützung und Beratung',
                'Incident Response Planning',
                'Compliance-Überprüfung',
                'Datenschutz (DSGVO) Audit',
                'Backup und Disaster Recovery',
                'Zwei-Faktor-Authentifizierung Setup',
                'Sichere Passwort-Richtlinien',
            ],
        },
        {
            title: 'Penetrationstests',
            description: 'Professionelle Sicherheitstests, die echte Angriffsszenarien simulieren. Wir identifizieren Schwachstellen in Ihren Systemen, bevor Angreifer sie entdecken.',
            features: [
                'Realistische Angriffssimulation',
                'Netzwerk-Penetrationstests',
                'Webanwendungs-Sicherheit',
                'Social Engineering Tests',
                'Detaillierter technischer Report',
                'Handlungsempfehlungen priorisiert',
                'Retest nach Fixes kostenlos',
                'Sicherheitsberatung zur Remediation',
                'Vulnerability Assessment',
                'Wireless Security Testing',
                'Physical Security Testing',
                'Executive Summary Report',
            ],
        },
    ];

    return services[index];
}

// ============================================
// PROJECT BUTTONS
// ============================================
function initializeProjectButtons() {
    const projectButtons = document.querySelectorAll('.project-expand');
    projectButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}

/**
 * Expand project details
 */
function expandProject(index) {
    const projectData = getProjectData(index);
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('projectModalBody');

    // Create rich modal content
    modalBody.innerHTML = `
        <h2>${projectData.title}</h2>
        <p style="color: #666; font-size: 14px; margin-bottom: 24px;">
            <strong>${projectData.category}</strong> • ${projectData.year}
        </p>

        <section style="margin-bottom: 24px;">
            <h3 style="font-size: 18px; color: #212121; margin-bottom: 12px;">Projekt-Überblick</h3>
            <p>${projectData.description}</p>
        </section>

        <section style="margin-bottom: 24px;">
            <h3 style="font-size: 18px; color: #212121; margin-bottom: 12px;">🎯 Herausforderung</h3>
            <p>${projectData.challenge}</p>
        </section>

        <section style="margin-bottom: 24px;">
            <h3 style="font-size: 18px; color: #212121; margin-bottom: 12px;">⚡ Lösung</h3>
            <p>${projectData.solution}</p>
        </section>

        <section style="margin-bottom: 24px;">
            <h3 style="font-size: 18px; color: #212121; margin-bottom: 12px;">✅ Ergebnis</h3>
            <p>${projectData.result}</p>
        </section>

        <section style="padding: 16px; background: rgba(66, 165, 245, 0.1); border-radius: 8px; border-left: 4px solid #42a5f5;">
            <h4 style="color: #212121; margin-bottom: 8px;">💡 Key Learnings</h4>
            <ul style="list-style: none; padding: 0;">
                ${projectData.learnings.map(l => `<li style="margin-bottom: 8px; color: #666;"><strong>•</strong> ${l}</li>`).join('')}
            </ul>
        </section>
    `;

    // Open modal
    window.scrollTo({ top: 0, behavior: 'smooth' });

    modal.classList.add('active');
    state.isProjectModalOpen = true;
    dispatchEvent('modal-open');
}

/**
 * Get project data
 */
function getProjectData(index) {
    const projects = [
        {
            title: 'Kaiser-Karl-Gymnasium Aachen',
            category: 'Penetrationstest',
            year: '2024',
            description: 'Umfassender Penetrationstest für die IT-Infrastruktur und Lernplattformen eines der größten Gymnasien in Aachen mit über 800 Schülern.',
            challenge: 'Die Schule benötigte eine unabhängige Bewertung ihrer Sicherheit, insbesondere der neuen Lernplattform und des Schülerdatenschutzes. Die Verantwortlichen wollten potenzielle Risiken identifizieren, bevor sie zum Problem werden.',
            solution: 'Wir führten einen umfassenden Pentest durch, der Netzwerk, Webanwendungen, physische Sicherheit und Schüler-Datenschutz abdeckte. Besonderer Fokus auf DSGVO-Konformität und sichere Lernumgebungen für Kinder.',
            result: 'Identifizierten 23 kritische und mittlere Schwachstellen. Die Schule konnte diese systematisch beheben. Heute vertraut die gesamte Schulgemeinschaft der sicheren IT-Infrastruktur. Eltern und Schüler sind beruhigt bezüglich ihrer Daten.',
            learnings: [
                'Schulen benötigen spezialisierte Sicherheitskonzepte für Kinderdaten',
                'Regelmäßige Penetrationstests sind essentiell für Bildungseinrichtungen',
                'Transparente Kommunikation mit Stakeholdern ist wichtig',
                'Cloud-basierte Lernplattformen erfordern zusätzliche Sicherheitsmaßnahmen',
            ],
        },
        {
            title: 'Europäischer Verband Aachen',
            category: 'Website',
            year: '2024',
            description: 'Entwicklung einer modernen, mehrsprachigen Website für internationale Zusammenarbeit in Aachen mit über 500 Mitgliedern aus 15 Ländern.',
            challenge: 'Der Europäische Verband Aachen benötigte eine Website, die Veranstaltungen, Mitgliedschaften und Ressourcen in Deutsch, Englisch und Französisch präsentiert. Alte Website war veraltet und nicht responsive.',
            solution: 'Wir schufen eine mobile-optimierte Website mit integrierten Veranstaltungskalendar, vollständigem Membership-System, mehrsprachiger Unterstützung und modernem Design nach Premium-Standards. Integration mit Social Media und Newsletter-System.',
            result: 'Die Website zieht monatlich über 5.000 Besucher an und hat zu 45% mehr Mitgliederanmeldungen geführt. Präsenz in ganz Europa gewachsen. Veranstaltungen sind nun leichter zu kommunizieren.',
            learnings: [
                'Mehrsprachigkeit erfordert sorgfältige Content-Verwaltung',
                'Event-Management ist ein Kernfeature für Verbände',
                'Mobile-First Design ist für internationale Zielgruppen essentiell',
                'SEO für mehrsprachige Seiten braucht besondere Aufmerksamkeit',
            ],
        },
        {
            title: 'Aachener Sportvereine Netzwerk',
            category: 'IT-Sicherheit',
            year: '2024',
            description: 'Koordinierter Sicherheitsaudit und Schulungsprogramm für 8 verbundene Aachener Sportvereine mit insgesamt über 2.000 Mitgliedern.',
            challenge: '8 Sportvereine mit teilweise veralteter IT-Infrastruktur benötigten standardisierte Sicherheitsrichtlinien und Schulung für ihre Vorstände. Unterschiedliche Sicherheitsniveaus waren ein Problem.',
            solution: 'Wir führten individuelle Audits durch, entwickelten einheitliche Sicherheitsrichtlinien und schulten Vorstände in Best Practices. Geschaffen wurde ein Sicherheitsverbund mit gemeinsamen Standards und regelmäßigen Updates.',
            result: 'Alle 8 Vereine arbeiten jetzt nach standardisierten Security-Richtlinien. Sicherheit ist kein Hindernis mehr für Digitalisierung, sondern Vorteil. Jährliche Security Trainings sind jetzt Standard.',
            learnings: [
                'Kleine Organisationen benötigen vereinfachte aber effektive Security-Prozesse',
                'Gemeinschaftliche Schulungen reduzieren Kosten für alle',
                'Standardisierung schafft Effizienz in Netzwerken',
                'Regelmäßige Updates und Trainings sind wichtiger als ein einmaliger Audit',
            ],
        },
    ];

    return projects[index];
}

// ============================================
// CONTACT LINKS
// ============================================
function initializeContactLinks() {
    const contactCards = document.querySelectorAll('.contact-card');

    contactCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-12px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    const ctaButton = document.getElementById('ctaButton');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            smoothScrollTo('#contact');
        });
    }

    const learnMoreBtn = document.getElementById('learnMoreBtn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            smoothScrollTo('#services');
        });
    }
}

// ============================================
// OBSERVERS
// ============================================
function initializeObservers() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '0px 0px -80px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section, .service-item, .project-card, .stat-box, .value-box').forEach(el => {
        observer.observe(el);
    });

    // Mutation observer for dynamic content
    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        observer.observe(node);
                    }
                });
            }
        });
    });

    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

// ============================================
// TOUCH HANDLING
// ============================================
document.addEventListener('touchstart', (e) => {
    state.touchStartX = e.touches[0].clientX;
    state.touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = state.touchStartX - touchEndX;
    const diffY = state.touchStartY - touchEndY;

    // Swipe detection
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) {
            // Swiped left
            dispatchEvent('swipe-left');
        } else if (diffX < -50) {
            // Swiped right
            dispatchEvent('swipe-right');
        }
    }
}, { passive: true });

// ============================================
// CONSOLE BRANDING
// ============================================
console.log('%c🟢 DigitalStark Aachen', 'font-size: 20px; font-weight: bold; color: #4caf50;');
console.log('%c✨ Digitale Stärke für Aachener Vereine', 'font-size: 14px; color: #42a5f5;');
console.log('%c📧 kontakt@digitalstark-aachen.de', 'font-size: 12px; color: #999;');

// ============================================
// PERFORMANCE MONITORING
// ============================================
if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⏱️ Page Load Time: ${pageLoadTime}ms`);
    });
}

// ============================================
// SERVICE WORKER (Optional)
// ============================================
if ('serviceWorker' in navigator) {
    // Uncomment to enable
    // navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Error:', err));
}

// ============================================
// EXPORTS FOR TESTING
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        smoothScrollTo,
        animateCounter,
        expandService,
        expandProject,
        getServiceData,
        getProjectData,
        state,
        config,
    };
}

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // Spacebar to scroll down
    if (e.code === 'Space' && !state.isModalOpen && !state.isProjectModalOpen) {
        e.preventDefault();
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }

    // Tab key focus management
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-focus');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-focus');
});

// Announce to screen readers
function announceToAccessibility(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}

// Initial announcement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        announceToAccessibility('Website geladen. Verwenden Sie Tab zum Navigieren.');
    });
} else {
    announceToAccessibility('Website geladen. Verwenden Sie Tab zum Navigieren.');
}
