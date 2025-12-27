/**
 * Bestand UI Navigation (ES2024)
 * Navigations- und View-Switching-Funktionen
 */

import { getElements } from './_ui-state.js';

/**
 * Aktualisiert die Zähler in der Navigation
 * @param {number} vorgaenge - Anzahl Vorgänge
 * @param {number} makler - Anzahl Makler
 * @param {number} emails - Anzahl E-Mails
 * @returns {void}
 */
export const updateNavCounts = (vorgaenge, makler, emails) => {
    const elements = getElements();
    if (elements.vorgaengeCount) elements.vorgaengeCount.textContent = vorgaenge;
    if (elements.maklerNavCount) elements.maklerNavCount.textContent = makler;
    if (elements.emailsNavCount) elements.emailsNavCount.textContent = emails;
};

/**
 * Wechselt die aktive Ansicht
 * @param {string} viewName - Name der Ansicht (dashboard, vorgaenge, makler, emails)
 * @returns {void}
 */
export const switchView = (viewName) => {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewName));
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === `view-${viewName}`));
};
