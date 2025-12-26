/**
 * Toast Notification Component
 * Displays temporary notification messages
 */

// ========================================
// CONFIGURATION
// ========================================

const TOAST_CONFIG = {
    duration: 4000,
    position: 'bottom-right',
    maxToasts: 5
};

let toastContainer = null;
const activeToasts = [];

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize toast container
 */
function initContainer() {
    if (toastContainer) return;

    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('aria-atomic', 'true');

    // Position classes
    const positionClasses = {
        'top-right': 'top: 20px; right: 20px;',
        'top-left': 'top: 20px; left: 20px;',
        'bottom-right': 'bottom: 20px; right: 20px;',
        'bottom-left': 'bottom: 20px; left: 20px;',
        'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
        'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);'
    };

    toastContainer.style.cssText = `
        position: fixed;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
        ${positionClasses[TOAST_CONFIG.position] || positionClasses['bottom-right']}
    `;

    document.body.appendChild(toastContainer);
}

// ========================================
// TOAST CREATION
// ========================================

/**
 * Create toast element
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {object} options - Additional options
 * @returns {HTMLElement}
 */
function createToastElement(message, type, options = {}) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-left: 4px solid;
        min-width: 280px;
        max-width: 400px;
        pointer-events: auto;
        animation: toastSlideIn 0.3s ease;
    `;

    // Border colors by type
    const borderColors = {
        success: '#16A34A',
        error: '#DC2626',
        warning: '#D97706',
        info: '#2563EB'
    };

    toast.style.borderLeftColor = borderColors[type] || borderColors.info;

    // Icon
    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    const iconColors = {
        success: '#16A34A',
        error: '#DC2626',
        warning: '#D97706',
        info: '#2563EB'
    };

    toast.innerHTML = `
        <span style="color: ${iconColors[type] || iconColors.info}; flex-shrink: 0;">
            ${icons[type] || icons.info}
        </span>
        <span style="flex: 1; font-size: 14px; color: #1E293B; line-height: 1.4;">
            ${message}
        </span>
        ${options.dismissible !== false ? `
            <button class="toast-close" style="
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                color: #94A3B8;
                flex-shrink: 0;
            ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        ` : ''}
    `;

    // Add close button handler
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => dismissToast(toast));
    }

    return toast;
}

// ========================================
// TOAST MANAGEMENT
// ========================================

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type
 * @param {object} options - Options
 * @returns {HTMLElement} Toast element
 */
function showToast(message, type = 'info', options = {}) {
    initContainer();

    // Remove oldest toast if max reached
    while (activeToasts.length >= TOAST_CONFIG.maxToasts) {
        dismissToast(activeToasts[0]);
    }

    const toast = createToastElement(message, type, options);
    toastContainer.appendChild(toast);
    activeToasts.push(toast);

    // Auto-dismiss after duration
    const duration = options.duration || TOAST_CONFIG.duration;
    if (duration > 0) {
        setTimeout(() => dismissToast(toast), duration);
    }

    return toast;
}

/**
 * Dismiss toast
 * @param {HTMLElement} toast - Toast element to dismiss
 */
function dismissToast(toast) {
    if (!toast || !toast.parentNode) return;

    // Animate out
    toast.style.animation = 'toastSlideOut 0.2s ease forwards';

    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }

        const index = activeToasts.indexOf(toast);
        if (index > -1) {
            activeToasts.splice(index, 1);
        }
    }, 200);
}

/**
 * Dismiss all toasts
 */
function dismissAll() {
    [...activeToasts].forEach(dismissToast);
}

// ========================================
// PUBLIC API
// ========================================

/**
 * Show success toast
 * @param {string} message - Toast message
 * @param {object} options - Options
 */
export function success(message, options = {}) {
    return showToast(message, 'success', options);
}

/**
 * Show error toast
 * @param {string} message - Toast message
 * @param {object} options - Options
 */
export function error(message, options = {}) {
    return showToast(message, 'error', { duration: 6000, ...options });
}

/**
 * Show warning toast
 * @param {string} message - Toast message
 * @param {object} options - Options
 */
export function warning(message, options = {}) {
    return showToast(message, 'warning', options);
}

/**
 * Show info toast
 * @param {string} message - Toast message
 * @param {object} options - Options
 */
export function info(message, options = {}) {
    return showToast(message, 'info', options);
}

/**
 * Configure toast defaults
 * @param {object} config - Configuration options
 */
export function configure(config) {
    Object.assign(TOAST_CONFIG, config);
}

// ========================================
// CSS INJECTION
// ========================================

// Inject keyframes if not already present
if (typeof document !== 'undefined' && !document.getElementById('toast-keyframes')) {
    const style = document.createElement('style');
    style.id = 'toast-keyframes';
    style.textContent = `
        @keyframes toastSlideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes toastSlideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Export all as default object
export default {
    success,
    error,
    warning,
    info,
    dismiss: dismissToast,
    dismissAll,
    configure
};
