/**
 * Bestand UI Notifications (ES2024)
 * Toast-Benachrichtigungen und Overlay-Funktionen
 */

import { escapeHtml } from './_ui-helpers.js';
import { getElements } from './_ui-state.js';

/**
 * Zeigt eine Toast-Benachrichtigung
 * @param {string} message - Nachricht
 * @param {string} type - Typ (success, error, warning, info)
 * @param {number} duration - Anzeigedauer in ms
 * @returns {void}
 */
export const showToast = (message, type = 'info', duration = 4000) => {
    const elements = getElements();
    if (!elements.toastContainer) return;
    const icons = { success: '✔', error: '✕', warning: '△', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] ?? icons.info}</span><span class="toast-message">${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

/**
 * Zeigt oder versteckt das Drop-Overlay
 * @param {boolean} show - Sichtbarkeit
 * @returns {void}
 */
export const showDropOverlay = (show) => {
    const elements = getElements();
    if (elements.dropOverlay) elements.dropOverlay.style.display = show ? 'flex' : 'none';
};
