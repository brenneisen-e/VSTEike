/**
 * Modal Component
 * Reusable modal dialog system
 */

// ========================================
// MODAL STATE
// ========================================

let activeModals = [];
let modalIdCounter = 0;

// ========================================
// MODAL CREATION
// ========================================

/**
 * Create modal element
 * @param {object} options - Modal options
 * @returns {object} Modal instance
 */
export function create(options = {}) {
    const id = `modal-${++modalIdCounter}`;

    const {
        title = '',
        content = '',
        size = 'default', // 'sm', 'default', 'lg', 'xl', 'full'
        closable = true,
        closeOnBackdrop = true,
        closeOnEscape = true,
        footer = null,
        className = '',
        onOpen = null,
        onClose = null
    } = options;

    // Size classes
    const sizeClasses = {
        sm: 'max-width: 400px;',
        default: 'max-width: 560px;',
        lg: 'max-width: 720px;',
        xl: 'max-width: 960px;',
        full: 'max-width: calc(100vw - 40px); max-height: calc(100vh - 40px);'
    };

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = `modal-overlay ${className}`;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', `${id}-title`);

    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease;
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
        width: 100%;
        ${sizeClasses[size] || sizeClasses.default}
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        transform: scale(0.95) translateY(20px);
        transition: transform 0.2s ease;
    `;

    // Build modal HTML
    let html = '';

    // Header
    if (title || closable) {
        html += `
            <div class="modal-header" style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                border-bottom: 1px solid #E2E8F0;
            ">
                <h3 id="${id}-title" class="modal-title" style="
                    font-size: 18px;
                    font-weight: 600;
                    color: #0F172A;
                    margin: 0;
                ">${title}</h3>
                ${closable ? `
                    <button class="modal-close" aria-label="Schließen" style="
                        background: none;
                        border: none;
                        cursor: pointer;
                        padding: 8px;
                        margin: -8px -8px -8px 8px;
                        border-radius: 6px;
                        color: #64748B;
                        transition: all 0.15s ease;
                    ">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                ` : ''}
            </div>
        `;
    }

    // Body
    html += `
        <div class="modal-body" style="
            padding: 20px;
            overflow-y: auto;
            flex: 1;
        ">${typeof content === 'string' ? content : ''}</div>
    `;

    // Footer
    if (footer) {
        html += `
            <div class="modal-footer" style="
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 12px;
                padding: 16px 20px;
                border-top: 1px solid #E2E8F0;
                background: #F8FAFC;
            ">${footer}</div>
        `;
    }

    modal.innerHTML = html;

    // If content is an element, append it
    if (content instanceof Element) {
        modal.querySelector('.modal-body').innerHTML = '';
        modal.querySelector('.modal-body').appendChild(content);
    }

    overlay.appendChild(modal);

    // Modal instance
    const instance = {
        id,
        element: overlay,
        modal,
        isOpen: false,

        open() {
            if (this.isOpen) return;

            document.body.appendChild(overlay);

            // Prevent body scroll
            document.body.style.overflow = 'hidden';

            // Animate in
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                overlay.style.visibility = 'visible';
                modal.style.transform = 'scale(1) translateY(0)';
            });

            this.isOpen = true;
            activeModals.push(this);

            // Focus first focusable element
            const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();

            if (onOpen) onOpen(this);
        },

        close() {
            if (!this.isOpen) return;

            // Animate out
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.95) translateY(20px)';

            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }

                // Restore body scroll if no more modals
                const index = activeModals.indexOf(this);
                if (index > -1) activeModals.splice(index, 1);

                if (activeModals.length === 0) {
                    document.body.style.overflow = '';
                }

                this.isOpen = false;

                if (onClose) onClose(this);
            }, 200);
        },

        setContent(newContent) {
            const body = modal.querySelector('.modal-body');
            if (typeof newContent === 'string') {
                body.innerHTML = newContent;
            } else if (newContent instanceof Element) {
                body.innerHTML = '';
                body.appendChild(newContent);
            }
        },

        setTitle(newTitle) {
            const titleEl = modal.querySelector('.modal-title');
            if (titleEl) titleEl.textContent = newTitle;
        }
    };

    // Event listeners
    if (closable) {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => instance.close());
        }
    }

    if (closeOnBackdrop) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) instance.close();
        });
    }

    if (closeOnEscape) {
        const escHandler = (e) => {
            if (e.key === 'Escape' && instance.isOpen) {
                instance.close();
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    return instance;
}

// ========================================
// PRESET MODALS
// ========================================

/**
 * Show confirmation dialog
 * @param {string} message - Confirmation message
 * @param {object} options - Options
 * @returns {Promise<boolean>}
 */
export function confirm(message, options = {}) {
    return new Promise((resolve) => {
        const {
            title = 'Bestätigung',
            confirmText = 'Bestätigen',
            cancelText = 'Abbrechen',
            type = 'warning' // 'warning', 'danger', 'info'
        } = options;

        const iconColors = {
            warning: '#D97706',
            danger: '#DC2626',
            info: '#2563EB'
        };

        const icons = {
            warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            danger: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };

        const buttonColors = {
            warning: 'background: #D97706;',
            danger: 'background: #DC2626;',
            info: 'background: #2563EB;'
        };

        const modal = create({
            title,
            size: 'sm',
            content: `
                <div style="text-align: center;">
                    <div style="
                        width: 48px;
                        height: 48px;
                        border-radius: 50%;
                        background: ${iconColors[type]}15;
                        color: ${iconColors[type]};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 16px;
                    ">${icons[type]}</div>
                    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0;">
                        ${message}
                    </p>
                </div>
            `,
            footer: `
                <button class="modal-cancel" style="
                    padding: 10px 20px;
                    background: white;
                    border: 1px solid #E2E8F0;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    color: #475569;
                ">${cancelText}</button>
                <button class="modal-confirm" style="
                    padding: 10px 20px;
                    ${buttonColors[type]}
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    color: white;
                ">${confirmText}</button>
            `,
            onClose: () => resolve(false)
        });

        modal.open();

        modal.modal.querySelector('.modal-cancel').addEventListener('click', () => {
            modal.close();
            resolve(false);
        });

        modal.modal.querySelector('.modal-confirm').addEventListener('click', () => {
            modal.close();
            resolve(true);
        });
    });
}

/**
 * Show alert dialog
 * @param {string} message - Alert message
 * @param {object} options - Options
 * @returns {Promise<void>}
 */
export function alert(message, options = {}) {
    return new Promise((resolve) => {
        const { title = 'Hinweis', buttonText = 'OK' } = options;

        const modal = create({
            title,
            size: 'sm',
            content: `<p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0;">${message}</p>`,
            footer: `
                <button class="modal-ok" style="
                    padding: 10px 24px;
                    background: #0F172A;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    color: white;
                ">${buttonText}</button>
            `,
            onClose: () => resolve()
        });

        modal.open();

        modal.modal.querySelector('.modal-ok').addEventListener('click', () => {
            modal.close();
            resolve();
        });
    });
}

/**
 * Close all open modals
 */
export function closeAll() {
    [...activeModals].forEach(modal => modal.close());
}

/**
 * Get active modal count
 * @returns {number}
 */
export function getActiveCount() {
    return activeModals.length;
}

// Export all as default object
export default {
    create,
    confirm,
    alert,
    closeAll,
    getActiveCount
};
