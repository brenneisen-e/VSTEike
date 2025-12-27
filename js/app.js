/**
 * Main JavaScript Entry Point
 * VSTEike Dashboard - Modular Architecture
 *
 * This file serves as the main entry point and exports all modules
 * for use throughout the application.
 */

// ========================================
// CORE MODULES
// ========================================

// Utility helpers
export * as helpers from './modules/helpers.js';
export * as dateUtils from './modules/date-utils.js';
export * as currency from './modules/currency.js';

// Services
export * as storage from './services/storage.js';
export * as api from './services/api.js';

// ========================================
// UI COMPONENTS
// ========================================

// Core components
export * as Toast from './components/toast.js';
export * as Modal from './components/modal.js';
export * as Dropdown from './components/dropdown.js';
export * as Tabs from './components/tabs.js';
export * as Accordion from './components/accordion.js';

// Data components
export * as DataTable from './components/data-table.js';
export * as Chart from './components/chart.js';

// Form components
export * as FormValidation from './components/form-validation.js';

// Feedback components
export * as Loading from './components/loading.js';

// Navigation components
export * as Navigation from './components/navigation.js';

// ========================================
// GLOBAL INITIALIZATION
// ========================================

/**
 * Initialize core functionality
 */
export function init() {
    // Set up global error handler
    setupErrorHandler();

    // Initialize tooltips
    initTooltips();

    // Initialize copy buttons
    initCopyButtons();

    // Log initialization
    // Application initialized
}

/**
 * Global error handler
 */
function setupErrorHandler() {
    window.addEventListener('error', (event) => {
        console.error('[VSTEike Error]', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('[VSTEike Promise Rejection]', event.reason);
    });
}

/**
 * Initialize tooltips
 */
function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        const text = el.dataset.tooltip;
        const position = el.dataset.tooltipPosition || 'top';

        let tooltip = null;

        el.addEventListener('mouseenter', () => {
            tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = text;
            tooltip.style.cssText = `
                position: fixed;
                background: #0F172A;
                color: white;
                padding: 6px 12px;
                font-size: 12px;
                border-radius: 6px;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.15s ease;
            `;

            document.body.appendChild(tooltip);

            const rect = el.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            let top, left;

            switch (position) {
                case 'bottom':
                    top = rect.bottom + 8;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
                    break;
                case 'left':
                    top = rect.top + (rect.height - tooltipRect.height) / 2;
                    left = rect.left - tooltipRect.width - 8;
                    break;
                case 'right':
                    top = rect.top + (rect.height - tooltipRect.height) / 2;
                    left = rect.right + 8;
                    break;
                default:
                    top = rect.top - tooltipRect.height - 8;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
            }

            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;

            requestAnimationFrame(() => {
                tooltip.style.opacity = '1';
            });
        });

        el.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                    tooltip = null;
                }, 150);
            }
        });
    });
}

/**
 * Initialize copy buttons
 */
function initCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const target = btn.dataset.copy;
            const element = document.querySelector(target);
            const text = element ? element.textContent : target;

            try {
                await navigator.clipboard.writeText(text);

                const originalText = btn.innerHTML;
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                btn.style.color = '#16A34A';

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.color = '';
                }, 2000);
            } catch (err) {
                console.error('Copy failed:', err);
            }
        });
    });
}

// ========================================
// CONVENIENCE FUNCTIONS
// ========================================

/**
 * Show success toast
 */
export function showSuccess(message, options = {}) {
    import('./components/toast.js').then(({ success }) => {
        success(message, options);
    });
}

/**
 * Show error toast
 */
export function showError(message, options = {}) {
    import('./components/toast.js').then(({ error }) => {
        error(message, options);
    });
}

/**
 * Show confirmation dialog
 */
export async function confirm(message, options = {}) {
    const { confirm: confirmFn } = await import('./components/modal.js');
    return confirmFn(message, options);
}

/**
 * Show loading overlay
 */
export function showLoading(text = 'Wird geladen...') {
    return import('./components/loading.js').then(({ overlay }) => {
        const loader = overlay({ text });
        loader.show();
        return loader;
    });
}

// Re-export from helpers for backwards compatibility
export { formatCurrency, formatDate } from './modules/helpers.js';

// ========================================
// AUTO-INIT ON DOM READY
// ========================================

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

// Default export
export default {
    init,
    showSuccess,
    showError,
    confirm,
    showLoading,
    formatCurrency,
    formatDate
};
