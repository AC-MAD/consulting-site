/**
 * DigitalStark Aachen - Premium Interactive Website
 * Mobile-first JavaScript with sophisticated interactions
 */

'use strict';

// ============================================
// GLOBAL STATE MANAGEMENT
// ============================================
const AppState = {
    currentService: 0,
    currentProject: 0,
    scrollProgress: 0,
    navVisible: true,
    lastScrollY: 0,
    isTouching: false,
    touchStart: 0,
    isAnimating: false,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for scroll events
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Animate number counter
 */
function animateCounter(element, target, duration = 1500) {
    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

/**
 * Swipe detection utility
 */
function getSwipeDirection(startX, endX) {
    const diff = startX - endX;
    if (Math.abs(diff) > 50) {
        return diff > 0 ? 'left' : 'right';
    }
    return null;
}

/**
 * Smooth scroll to element
 */
function smoothScroll(element) {
    const target = typeof element === 'string' ? document.querySelector(element) : element;
    if (!target) return;

    window.scrollTo({
        top: target.offsetTop - 60,
        behavior: 'smooth'
    });
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeCarousels();
    initializeModals();
    initializeScrollAnimations();
    initializeScrollProgress();
    initializeCounters();
    initializeHeroAnimation();
});

// ============================================
// NAVIGATION
// ============================================
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll detection for navbar visibility
    let lastScroll = 0;
    window.addEventListener('scroll', throttle(() => {
        const scrollY = window.scrollY;

        // Hide navbar on scroll down, show on scroll up
        if (scrollY > lastScroll && scrollY > 200) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        lastScroll = scrollY;

        // Update active nav link
        updateActiveNavLink();
    }, 50), { passive: true });

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            smoothScroll(href);
        });
    });
}

function updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ============================================
// CAROUSEL INTERACTIONS
// ============================================
function initializeCarousels() {
    // Services Carousel
    initializeCarousel({
        carouselId: 'servicesCarousel',
        indicatorSelector: '.carousel-indicator .dot',
        cardSelector: '.service-card',
        onIndexChange: (index) => {
            AppState.currentService = index;
        }
    });

    // Projects Carousel
    initializeCarousel({
        carouselId: 'projectsShowcase',
        indicatorSelector: '.projects-indicator .dot',
        cardSelector: '.project-card',
        onIndexChange: (index) => {
            AppState.currentProject = index;
        }
    });
}

function initializeCarousel(config) {
    const carousel = document.getElementById(config.carouselId);
    const indicators = document.querySelectorAll(config.indicatorSelector);
    const cards = carousel.querySelectorAll(config.cardSelector);

    if (!carousel) return;

    let currentIndex = 0;
    let startX = 0;

    // Touch swipe events
    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const direction = getSwipeDirection(startX, endX);

        if (direction === 'left') {
            scrollToCard(currentIndex + 1);
        } else if (direction === 'right') {
            scrollToCard(currentIndex - 1);
        }
    }, { passive: true });

    // Scroll snap observer
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = Array.from(cards).indexOf(entry.target);
                    if (index !== -1) {
                        currentIndex = index;
                        updateIndicators();
                        if (config.onIndexChange) {
                            config.onIndexChange(index);
                        }
                    }
                }
            });
        }, {
            threshold: 0.5,
            root: carousel
        });

        cards.forEach(card => observer.observe(card));
    }

    // Indicator clicks
    indicators.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            scrollToCard(index);
        });
    });

    function scrollToCard(index) {
        if (index < 0 || index >= cards.length) return;
        currentIndex = index;
        cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        updateIndicators();
    }

    function updateIndicators() {
        indicators.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
}

// ============================================
// MODALS
// ============================================
function initializeModals() {
    // Service cards click to open modal
    document.querySelectorAll('.service-expand').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const serviceIndex = parseInt(btn.dataset.service);
            openServiceModal(serviceIndex);
        });
    });

    // Project cards click to open modal
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const projectIndex = parseInt(card.dataset.project);
            openProjectModal(projectIndex);
        });
    });

    // Close modal buttons and backdrops
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalBackdrop').addEventListener('click', closeModal);

    document.getElementById('projectModalClose').addEventListener('click', closeProjectModal);
    document.getElementById('projectModalBackdrop').addEventListener('click', closeProjectModal);

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeProjectModal();
        }
    });
}

function openServiceModal(index) {
    const serviceData = getServiceData(index);
    const modal = document.getElementById('serviceModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="modal-header">
            <h2>${serviceData.title}</h2>
        </div>
        <div class="modal-body">
            <p>${serviceData.fullDescription}</p>
            <h3>Includes:</h3>
            <ul>
                ${serviceData.fullFeatures.map(f => `<li>• ${f}</li>`).join('')}
            </ul>
            <p style="margin-top: 24px; font-size: 14px; color: #9ca3af;">
                Kostenlos für alle Aachener Vereine.
                <br><a href="mailto:kontakt@digitalstark-aachen.de" style="color: #0f7938; font-weight: 600;">Jetzt anfragen →</a>
            </p>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('serviceModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function openProjectModal(index) {
    const projectData = getProjectData(index);
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('projectModalBody');

    modalBody.innerHTML = `
        <div class="modal-header">
            <h2>${projectData.title}</h2>
            <p style="color: #6b7280; margin-top: 8px;">${projectData.category}</p>
        </div>
        <div class="modal-body">
            <p style="margin-bottom: 16px;">${projectData.fullDescription}</p>
            <h3>Herausforderung</h3>
            <p>${projectData.challenge}</p>
            <h3 style="margin-top: 16px;">Lösung</h3>
            <p>${projectData.solution}</p>
            <h3 style="margin-top: 16px;">Ergebnis</h3>
            <p>${projectData.result}</p>
            <p style="margin-top: 24px; font-size: 14px; color: #9ca3af;">
                ${projectData.year}
            </p>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function getServiceData(index) {
    const data = [
        {
            title: 'Website-Erstellung',
            fullDescription: 'Wir erstellen professionelle, responsive Websites speziell für Vereine und lokale Organisationen. Jede Website ist modular aufgebaut, einfach zu verwalten und vollständig kostenlos.',
            fullFeatures: [
                'Responsive Design für alle Geräte',
                'SEO optimiert für Suchmaschinen',
                'Kostenlos gehostet auf sicheren Servern',
                'Einfache Content-Verwaltung ohne technische Kenntnisse',
                'Mobile-First Design',
                'Unbegrenzte Besucher und Bandbreite',
                'SSL-Verschlüsselung',
                'Automatische Backups'
            ]
        },
        {
            title: 'Cybersecurity-Beratung',
            fullDescription: 'Umfassende Sicherheitsaudits und individuelle Beratung für Ihre Organisation. Wir analysieren Ihre IT-Infrastruktur und geben konkrete, umsetzbare Empfehlungen.',
            fullFeatures: [
                'Vollständiger Sicherheitsaudit',
                'Analyse von Zugriffsrechten und Passwörtern',
                'Bewertung von Cloud-Services',
                'Mitarbeiterschulung zu IT-Sicherheit',
                'Entwicklung von Security-Richtlinien',
                'Laufende Unterstützung und Beratung',
                'Incident Response Planning',
                'Compliance-Überprüfung'
            ]
        },
        {
            title: 'Penetrationstests',
            fullDescription: 'Professionelle Sicherheitstests, die echte Angriffsszenarien simulieren. Wir identifizieren Schwachstellen in Ihren Systemen, bevor Angreifer sie entdecken.',
            fullFeatures: [
                'Realistische Angriffssimulation',
                'Netzwerk-Penetrationstests',
                'Webanwendungs-Sicherheit',
                'Social Engineering Tests',
                'Detaillierter technischer Report',
                'Handlungsempfehlungen priorisiert',
                'Retest nach Fixes kostenlos',
                'Sicherheitsberatung zur Remediation'
            ]
        }
    ];
    return data[index];
}

function getProjectData(index) {
    const data = [
        {
            title: 'Kaiser-Karl-Gymnasium Aachen',
            category: 'Penetrationstest | Schule | 2024',
            fullDescription: 'Umfassender Penetrationstest für die IT-Infrastruktur und Lernplattformen eines der größten Gymnasien in Aachen.',
            challenge: 'Die Schule benötigte eine unabhängige Bewertung ihrer Sicherheit, insbesondere der neuen Lernplattform und des Schülerdatenschutzes. Die Verantwortlichen wollten potenzielle Risiken identifizieren, bevor sie zum Problem werden.',
            solution: 'Wir führten einen umfassenden Pentest durch, der Netzwerk, Webanwendungen, und physische Sicherheit abdeckte. Besonderer Fokus auf DSGVO-Konformität und Schülerdatenschutz.',
            result: 'Identifizierten 23 kritische und mittlere Schwachstellen. Die Schule konnte diese systematisch beheben. Heute vertraut die gesamte Schulgemeinschaft der sicheren IT-Infrastruktur.'
        },
        {
            title: 'Europäischer Verband Aachen',
            category: 'Website | Organisation | 2024',
            fullDescription: 'Entwicklung einer modernen, mehrsprachigen Website für internationale Zusammenarbeit in Aachen.',
            challenge: 'Der Europäische Verband Aachen brauchte eine Website, die Veranstaltungen, Mitgliedschaften und Ressourcen in Deutsch, Englisch und Französisch präsentiert.',
            solution: 'Wir schufen eine mobile-optimierte Website mit integrierten Veranstaltungskalendar, Membership-System und mehrsprachiger Unterstützung. Design nach Premium-Standards.',
            result: 'Die Website zieht monatlich über 5.000 Besucher an und hat zu 45% mehr Mitgliederanmeldungen geführt. Präsenz in ganz Europa gewachsen.'
        },
        {
            title: 'Aachener Sportvereine Netzwerk',
            category: 'IT-Sicherheit | Sport | 2024',
            fullDescription: 'Koordinierter Sicherheitsaudit und Schulungsprogramm für 8 verbundene Aachener Sportvereine.',
            challenge: '8 Sportvereine mit teilweise veralteter IT-Infrastruktur benötigten standardisierte Sicherheitsrichtlinien und Schulung für ihre Vorstände.',
            solution: 'Wir führten individuelle Audits durch, entwickelten einheitliche Sicherheitsrichtlinien und schulten Vorstände in Best Practices. Geschaffen wurde ein Sicherheitsverbund.',
            result: 'Alle 8 Vereine arbeiten jetzt nach standardisierten Security-Richtlinien. Sicherheit ist kein Hindernis mehr für Digitalisierung, sondern Vorteil.'
        }
    ];
    return data[index];
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initializeScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
        // Fallback für ältere Browser
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.service-card, .project-card, .stat-card, .value').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// SCROLL PROGRESS INDICATOR
// ============================================
function initializeScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    if (!progressBar) return;

    window.addEventListener('scroll', throttle(() => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / docHeight) * 100;
        progressBar.style.width = scrolled + '%';
    }, 50), { passive: true });
}

// ============================================
// ANIMATED COUNTERS
// ============================================
function initializeCounters() {
    const counters = document.querySelectorAll('.counter');

    const observerOptions = {
        threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                entry.target.classList.add('counted');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

// ============================================
// HERO ANIMATION
// ============================================
function initializeHeroAnimation() {
    const heroBackground = document.getElementById('heroBackground');
    if (!heroBackground) return;

    // Parallax effect on mouse move (desktop)
    document.addEventListener('mousemove', throttle((e) => {
        const x = (e.clientX / window.innerWidth) * 20;
        const y = (e.clientY / window.innerHeight) * 20;
        heroBackground.style.transform = `translate(${x}px, ${y}px)`;
    }, 50), { passive: true });
}

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

// Preload images
window.addEventListener('load', () => {
    // Images are loaded, you can add preloading logic here
});

// Intersection Observer for lazy animations
if ('IntersectionObserver' in window) {
    const lazyLoad = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        lazyLoad.observe(img);
    });
}

// ============================================
// CONSOLE BRANDING
// ============================================
console.log(
    '%c🟢 DigitalStark Aachen',
    'font-size: 24px; font-weight: bold; color: #0f7938;'
);
console.log(
    '%cDigitale Stärke für Aachener Vereine',
    'font-size: 14px; color: #6b7280;'
);
console.log(
    '%cKontakt: kontakt@digitalstark-aachen.de',
    'font-size: 12px; color: #9ca3af;'
);

// ============================================
// SERVICE WORKER (Optional PWA support)
// ============================================
if ('serviceWorker' in navigator) {
    // Uncomment to enable service worker
    // navigator.serviceWorker.register('/sw.js');
}

// ============================================
// EXPORT FOR TESTING
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        debounce,
        throttle,
        smoothScroll
    };
}
