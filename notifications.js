/**
 * DigitalStark Aachen - Advanced Notification System
 * Toast, modal alerts, and notification management
 */

'use strict';

/**
 * Notification Manager - Create and manage notifications
 */
const NotificationManager = {
    notifications: new Map(),
    notificationId: 0,
    container: null,
    config: {
        position: 'bottom-right',
        duration: 3000,
        maxNotifications: 5,
        animationDuration: 300,
    },

    /**
     * Initialize notification system
     */
    init: (options = {}) => {
        NotificationManager.config = {
            ...NotificationManager.config,
            ...options,
        };

        // Create container
        NotificationManager.container = document.createElement('div');
        NotificationManager.container.className = 'notification-container';
        NotificationManager.container.setAttribute('data-position', NotificationManager.config.position);
        NotificationManager.container.style.cssText = `
            position: fixed;
            z-index: 9999;
            pointer-events: none;
            ${NotificationManager._getPositionStyles()}
        `;

        document.body.appendChild(NotificationManager.container);

        // Listen for resize to reposition
        window.addEventListener('resize', () => {
            NotificationManager.container.style.cssText = `
                position: fixed;
                z-index: 9999;
                pointer-events: none;
                ${NotificationManager._getPositionStyles()}
            `;
        });
    },

    /**
     * Get position styles based on config
     */
    _getPositionStyles: () => {
        const positions = {
            'top-left': 'top: 20px; left: 20px;',
            'top-right': 'top: 20px; right: 20px;',
            'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
            'bottom-left': 'bottom: 20px; left: 20px;',
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);',
        };

        return positions[NotificationManager.config.position] || positions['bottom-right'];
    },

    /**
     * Show notification
     */
    show: (message, options = {}) => {
        const {
            type = 'info',
            duration = NotificationManager.config.duration,
            actions = [],
            dismissible = true,
            onClose = null,
        } = options;

        // Check max notifications
        if (NotificationManager.notifications.size >= NotificationManager.config.maxNotifications) {
            const firstKey = NotificationManager.notifications.keys().next().value;
            NotificationManager.dismiss(firstKey);
        }

        const id = ++NotificationManager.notificationId;
        const notification = NotificationManager._createNotification(id, message, type, actions, dismissible);

        NotificationManager.notifications.set(id, {
            element: notification,
            timeout: null,
            onClose,
        });

        NotificationManager.container.appendChild(notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto dismiss
        if (duration) {
            NotificationManager.notifications.get(id).timeout = setTimeout(() => {
                NotificationManager.dismiss(id);
            }, duration);
        }

        return id;
    },

    /**
     * Create notification element
     */
    _createNotification: (id, message, type, actions, dismissible) => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('data-id', id);
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

        const typeEmoji = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ⓘ',
        };

        let actionsHTML = '';
        if (actions.length > 0) {
            actionsHTML = '<div class="notification-actions">' +
                actions.map((action, i) => `
                    <button class="notification-action" data-action="${i}">
                        ${action.label}
                    </button>
                `).join('') + '</div>';
        }

        let closeButton = '';
        if (dismissible) {
            closeButton = `<button class="notification-close" aria-label="Close notification">×</button>`;
        }

        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${typeEmoji[type]}</span>
                <div class="notification-message">
                    <p>${message}</p>
                    ${actionsHTML}
                </div>
                ${closeButton}
            </div>
            <div class="notification-progress"></div>
        `;

        // Attach styles
        notification.style.cssText = `
            display: flex;
            flex-direction: column;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin: 8px 0;
            padding: 16px;
            max-width: 400px;
            opacity: 0;
            transform: translateX(400px);
            transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: auto;
        `;

        // Close button handler
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                NotificationManager.dismiss(id);
            });
        }

        // Action buttons handler
        const actionButtons = notification.querySelectorAll('.notification-action');
        actionButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const action = actions[index];
                if (action.onClick) action.onClick();
                NotificationManager.dismiss(id);
            });
        });

        return notification;
    },

    /**
     * Dismiss notification
     */
    dismiss: (id) => {
        const notif = NotificationManager.notifications.get(id);
        if (!notif) return;

        const { element, timeout, onClose } = notif;

        clearTimeout(timeout);

        element.classList.remove('show');
        element.style.opacity = '0';
        element.style.transform = 'translateX(-400px)';

        setTimeout(() => {
            element.remove();
            NotificationManager.notifications.delete(id);
            if (onClose) onClose();
        }, NotificationManager.config.animationDuration);
    },

    /**
     * Dismiss all notifications
     */
    dismissAll: () => {
        const ids = Array.from(NotificationManager.notifications.keys());
        ids.forEach(id => NotificationManager.dismiss(id));
    },

    /**
     * Success notification
     */
    success: (message, options = {}) => {
        return NotificationManager.show(message, { type: 'success', ...options });
    },

    /**
     * Error notification
     */
    error: (message, options = {}) => {
        return NotificationManager.show(message, { type: 'error', ...options });
    },

    /**
     * Warning notification
     */
    warning: (message, options = {}) => {
        return NotificationManager.show(message, { type: 'warning', ...options });
    },

    /**
     * Info notification
     */
    info: (message, options = {}) => {
        return NotificationManager.show(message, { type: 'info', ...options });
    },
};

/**
 * Modal Alert System
 */
const ModalAlert = {
    /**
     * Show alert dialog
     */
    alert: (message, options = {}) => {
        return ModalAlert._show('alert', message, options);
    },

    /**
     * Show confirm dialog
     */
    confirm: (message, options = {}) => {
        return new Promise((resolve) => {
            ModalAlert._show('confirm', message, {
                ...options,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false),
            });
        });
    },

    /**
     * Show prompt dialog
     */
    prompt: (message, options = {}) => {
        return new Promise((resolve) => {
            ModalAlert._show('prompt', message, {
                ...options,
                onConfirm: (value) => resolve(value),
                onCancel: () => resolve(null),
            });
        });
    },

    /**
     * Create and show modal
     */
    _show: (type, message, options = {}) => {
        const {
            title = 'Alert',
            confirmText = 'OK',
            cancelText = 'Cancel',
            onConfirm = null,
            onCancel = null,
            defaultValue = '',
        } = options;

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-alert-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 300ms ease;
        `;

        const modal = document.createElement('div');
        modal.className = 'modal-alert';
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            transform: scale(0.95);
            transition: transform 300ms ease;
        `;

        let inputField = '';
        if (type === 'prompt') {
            inputField = `<input type="text" class="modal-input" value="${defaultValue}" placeholder="Eingabe...">`;
        }

        let buttons = '';
        if (type === 'alert') {
            buttons = `<button class="modal-btn modal-btn-primary" data-action="confirm">${confirmText}</button>`;
        } else {
            buttons = `
                <button class="modal-btn modal-btn-secondary" data-action="cancel">${cancelText}</button>
                <button class="modal-btn modal-btn-primary" data-action="confirm">${confirmText}</button>
            `;
        }

        modal.innerHTML = `
            <h2 class="modal-title">${title}</h2>
            <p class="modal-message">${message}</p>
            ${inputField}
            <div class="modal-buttons">
                ${buttons}
            </div>
        `;

        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        // Show animation
        requestAnimationFrame(() => {
            backdrop.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });

        // Button handlers
        const input = modal.querySelector('.modal-input');
        const confirmBtn = modal.querySelector('[data-action="confirm"]');
        const cancelBtn = modal.querySelector('[data-action="cancel"]');

        const handleConfirm = () => {
            const value = input ? input.value : null;
            ModalAlert._dismiss(backdrop);
            if (onConfirm) onConfirm(value);
        };

        const handleCancel = () => {
            ModalAlert._dismiss(backdrop);
            if (onCancel) onCancel();
        };

        if (confirmBtn) confirmBtn.addEventListener('click', handleConfirm);
        if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
        if (input) input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleConfirm();
        });

        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) handleCancel();
        });

        if (input) input.focus();
    },

    /**
     * Dismiss modal
     */
    _dismiss: (backdrop) => {
        backdrop.style.opacity = '0';
        backdrop.querySelector('.modal-alert').style.transform = 'scale(0.95)';

        setTimeout(() => {
            backdrop.remove();
        }, 300);
    },
};

/**
 * Toast Factory - Convenience methods
 */
const Toast = {
    /**
     * Quick success toast
     */
    success: (message, duration = 3000) => {
        return NotificationManager.success(message, { duration });
    },

    /**
     * Quick error toast
     */
    error: (message, duration = 4000) => {
        return NotificationManager.error(message, { duration });
    },

    /**
     * Quick warning toast
     */
    warning: (message, duration = 3500) => {
        return NotificationManager.warning(message, { duration });
    },

    /**
     * Quick info toast
     */
    info: (message, duration = 3000) => {
        return NotificationManager.info(message, { duration });
    },

    /**
     * Loading toast (no auto-dismiss)
     */
    loading: (message = 'Wird geladen...') => {
        return NotificationManager.info(message, { duration: 0, dismissible: false });
    },
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    NotificationManager.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NotificationManager,
        ModalAlert,
        Toast,
    };
}

// Make available globally
window.NotificationManager = NotificationManager;
window.ModalAlert = ModalAlert;
window.Toast = Toast;
