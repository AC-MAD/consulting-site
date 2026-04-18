/**
 * DigitalStark Aachen - Internationalization System (i18n)
 * Multi-language support with pluralization and formatting
 */

'use strict';

/**
 * i18n - Internationalization manager
 */
const i18n = {
    currentLanguage: 'de',
    fallbackLanguage: 'de',
    translations: {},
    listeners: new Map(),
    dateFormatter: null,
    numberFormatter: null,

    /**
     * Initialize i18n
     */
    init: (options = {}) => {
        const {
            language = 'de',
            fallbackLanguage = 'de',
            translations = {},
        } = options;

        i18n.currentLanguage = language;
        i18n.fallbackLanguage = fallbackLanguage;
        i18n.translations = translations;

        // Detect language from browser if available
        const browserLang = navigator.language?.split('-')[0];
        if (browserLang && i18n.translations[browserLang]) {
            i18n.setLanguage(browserLang);
        }
    },

    /**
     * Register translations for a language
     */
    register: (language, translations) => {
        i18n.translations[language] = {
            ...i18n.translations[language],
            ...translations,
        };
    },

    /**
     * Set active language
     */
    setLanguage: (language) => {
        if (!i18n.translations[language] && language !== i18n.fallbackLanguage) {
            console.warn(`Language "${language}" not found, using fallback "${i18n.fallbackLanguage}"`);
            return false;
        }

        i18n.currentLanguage = language;
        localStorage.setItem('i18n-language', language);
        document.documentElement.lang = language;

        i18n._notifyListeners();
        return true;
    },

    /**
     * Get current language
     */
    getLanguage: () => {
        return i18n.currentLanguage;
    },

    /**
     * Translate key
     */
    t: (key, options = {}) => {
        const { defaultValue = key, params = {}, count = null } = options;

        let translation = i18n._getTranslation(key);

        // Fallback to default value
        if (!translation) {
            translation = defaultValue;
        }

        // Handle pluralization
        if (count !== null) {
            translation = i18n._pluralize(translation, count);
        }

        // Replace parameters
        if (Object.keys(params).length > 0) {
            Object.entries(params).forEach(([key, value]) => {
                translation = translation.replace(`{${key}}`, value);
            });
        }

        return translation;
    },

    /**
     * Get translation by key
     */
    _getTranslation: (key) => {
        const keys = key.split('.');
        let value = i18n.translations[i18n.currentLanguage];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Try fallback language
                value = i18n.translations[i18n.fallbackLanguage];
                for (const fallbackKey of keys) {
                    if (value && typeof value === 'object' && fallbackKey in value) {
                        value = value[fallbackKey];
                    } else {
                        return null;
                    }
                }
                return value;
            }
        }

        return value;
    },

    /**
     * Handle pluralization
     */
    _pluralize: (translation, count) => {
        if (typeof translation === 'string') {
            return translation;
        }

        if (typeof translation === 'object') {
            const locale = i18n.currentLanguage;

            // Handle different pluralization rules
            if (locale === 'de' || locale === 'en') {
                return count === 1 ? translation.one : translation.other;
            }
            if (locale === 'fr') {
                return count <= 1 ? translation.one : translation.other;
            }

            return translation.other || '';
        }

        return translation;
    },

    /**
     * Format number
     */
    formatNumber: (number, options = {}) => {
        const localeMap = {
            de: 'de-DE',
            en: 'en-US',
            fr: 'fr-FR',
            es: 'es-ES',
            it: 'it-IT',
        };

        const locale = localeMap[i18n.currentLanguage] || 'de-DE';

        return new Intl.NumberFormat(locale, options).format(number);
    },

    /**
     * Format currency
     */
    formatCurrency: (amount, currency = 'EUR') => {
        const localeMap = {
            de: 'de-DE',
            en: 'en-US',
            fr: 'fr-FR',
            es: 'es-ES',
            it: 'it-IT',
        };

        const locale = localeMap[i18n.currentLanguage] || 'de-DE';

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
        }).format(amount);
    },

    /**
     * Format date
     */
    formatDate: (date, options = {}) => {
        const localeMap = {
            de: 'de-DE',
            en: 'en-US',
            fr: 'fr-FR',
            es: 'es-ES',
            it: 'it-IT',
        };

        const locale = localeMap[i18n.currentLanguage] || 'de-DE';
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };

        return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(date));
    },

    /**
     * Format time
     */
    formatTime: (date, options = {}) => {
        const localeMap = {
            de: 'de-DE',
            en: 'en-US',
            fr: 'fr-FR',
            es: 'es-ES',
            it: 'it-IT',
        };

        const locale = localeMap[i18n.currentLanguage] || 'de-DE';
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit',
        };

        return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(date));
    },

    /**
     * Format relative time
     */
    formatRelativeTime: (date) => {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        const rtf = new Intl.RelativeTimeFormat(i18n.currentLanguage, { numeric: 'auto' });

        if (diffMins < 1) return rtf.format(-Math.floor(diffMs / 1000), 'second');
        if (diffHours < 1) return rtf.format(-diffMins, 'minute');
        if (diffDays < 1) return rtf.format(-diffHours, 'hour');

        return rtf.format(-diffDays, 'day');
    },

    /**
     * Subscribe to language changes
     */
    onLanguageChange: (callback) => {
        const id = Math.random();
        i18n.listeners.set(id, callback);

        return () => {
            i18n.listeners.delete(id);
        };
    },

    /**
     * Notify listeners of language change
     */
    _notifyListeners: () => {
        i18n.listeners.forEach(callback => {
            callback(i18n.currentLanguage);
        });
    },

    /**
     * Get available languages
     */
    getAvailableLanguages: () => {
        return Object.keys(i18n.translations);
    },
};

/**
 * Translation Helper - DOM translation utilities
 */
const TranslationHelper = {
    /**
     * Translate all elements with data-i18n attribute
     */
    translatePage: () => {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const attr = element.getAttribute('data-i18n-attr') || 'textContent';
            const count = element.getAttribute('data-i18n-count');

            const text = i18n.t(key, { count: count ? parseInt(count) : null });

            if (attr === 'textContent' || attr === 'innerText') {
                element.textContent = text;
            } else if (attr === 'innerHTML') {
                element.innerHTML = text;
            } else {
                element.setAttribute(attr, text);
            }
        });
    },

    /**
     * Translate element by key
     */
    translateElement: (element, key, options = {}) => {
        const text = i18n.t(key, options);
        element.textContent = text;
    },

    /**
     * Watch for translation changes and re-render
     */
    watchTranslations: () => {
        i18n.onLanguageChange(() => {
            TranslationHelper.translatePage();
        });
    },

    /**
     * Get plural form
     */
    getPlural: (key, count) => {
        return i18n.t(key, { count });
    },
};

/**
 * Default German Translations
 */
const DE_TRANSLATIONS = {
    app: {
        name: 'DigitalStark Aachen',
        description: 'Digitale Stärke für Aachener Vereine',
    },
    nav: {
        services: 'Leistungen',
        projects: 'Projekte',
        about: 'Über uns',
        contact: 'Kontakt',
    },
    common: {
        loading: 'Wird geladen...',
        error: 'Ein Fehler ist aufgetreten',
        success: 'Erfolgreich',
        confirm: 'Bestätigen',
        cancel: 'Abbrechen',
        ok: 'OK',
        yes: 'Ja',
        no: 'Nein',
        close: 'Schließen',
        back: 'Zurück',
        next: 'Weiter',
        previous: 'Zurück',
        search: 'Suchen',
        save: 'Speichern',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        more: 'Mehr',
        less: 'Weniger',
    },
    time: {
        today: 'Heute',
        yesterday: 'Gestern',
        tomorrow: 'Morgen',
        hour: '{count} Stunde | {count} Stunden',
        day: '{count} Tag | {count} Tage',
        week: '{count} Woche | {count} Wochen',
        month: '{count} Monat | {count} Monate',
        year: '{count} Jahr | {count} Jahre',
    },
};

/**
 * Default English Translations
 */
const EN_TRANSLATIONS = {
    app: {
        name: 'DigitalStark Aachen',
        description: 'Digital strength for Aachen clubs',
    },
    nav: {
        services: 'Services',
        projects: 'Projects',
        about: 'About',
        contact: 'Contact',
    },
    common: {
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Success',
        confirm: 'Confirm',
        cancel: 'Cancel',
        ok: 'OK',
        yes: 'Yes',
        no: 'No',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        search: 'Search',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        more: 'More',
        less: 'Less',
    },
    time: {
        today: 'Today',
        yesterday: 'Yesterday',
        tomorrow: 'Tomorrow',
        hour: '{count} hour | {count} hours',
        day: '{count} day | {count} days',
        week: '{count} week | {count} weeks',
        month: '{count} month | {count} months',
        year: '{count} year | {count} years',
    },
};

/**
 * Default French Translations
 */
const FR_TRANSLATIONS = {
    app: {
        name: 'DigitalStark Aachen',
        description: 'Force numérique pour les clubs d\'Aix-la-Chapelle',
    },
    nav: {
        services: 'Services',
        projects: 'Projets',
        about: 'À propos',
        contact: 'Contact',
    },
    common: {
        loading: 'Chargement...',
        error: 'Une erreur s\'est produite',
        success: 'Succès',
        confirm: 'Confirmer',
        cancel: 'Annuler',
        ok: 'OK',
        yes: 'Oui',
        no: 'Non',
        close: 'Fermer',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        search: 'Rechercher',
        save: 'Enregistrer',
        delete: 'Supprimer',
        edit: 'Modifier',
        more: 'Plus',
        less: 'Moins',
    },
};

// Register default translations
i18n.register('de', DE_TRANSLATIONS);
i18n.register('en', EN_TRANSLATIONS);
i18n.register('fr', FR_TRANSLATIONS);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
    TranslationHelper.watchTranslations();
    TranslationHelper.translatePage();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        i18n,
        TranslationHelper,
    };
}

// Make available globally
window.i18n = i18n;
window.TranslationHelper = TranslationHelper;
window.t = i18n.t.bind(i18n); // Shorthand for translations
