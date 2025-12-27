/**
 * Bestand UI Tables (ES2024)
 * Tabellen-Rendering für Makler und E-Mails
 */

import { STATUS_ICONS } from './_ui-constants.js';
import { escapeHtml, formatDateTime } from './_ui-helpers.js';
import { getElements } from './_ui-state.js';

/**
 * Rendert Makler-Tabelle
 * @param {Array} maklerStats - Array von Makler-Statistiken
 * @returns {void}
 */
export const renderMaklerTable = (maklerStats) => {
    const elements = getElements();
    if (!elements.maklerTableBody) return;
    if (!maklerStats?.length) {
        elements.maklerTableBody.innerHTML = '';
        if (elements.maklerEmpty) elements.maklerEmpty.style.display = 'block';
        return;
    }
    if (elements.maklerEmpty) elements.maklerEmpty.style.display = 'none';
    elements.maklerTableBody.innerHTML = maklerStats.map(m => `
        <tr class="clickable-row" data-makler-name="${escapeHtml(m.name)}">
            <td class="col-makler-name">${escapeHtml(m.name)}</td>
            <td class="col-makler-email">${escapeHtml(m.email)}</td>
            <td class="col-number">${m.total}</td>
            <td class="col-number"><span class="text-success">${m.bestaetigt}</span></td>
            <td class="col-number"><span class="text-warning">${m.offen}</span></td>
            <td class="col-number"><span class="text-danger">${m.abgelehnt}</span></td>
        </tr>
    `).join('');
};

/**
 * Rendert E-Mails-Tabelle
 * @param {Array} emails - Array von E-Mails
 * @returns {void}
 */
export const renderEmailsTable = (emails) => {
    const elements = getElements();
    if (!elements.emailsTableBody) return;
    if (!emails?.length) {
        elements.emailsTableBody.innerHTML = '';
        if (elements.emailsEmpty) elements.emailsEmpty.style.display = 'block';
        return;
    }
    if (elements.emailsEmpty) elements.emailsEmpty.style.display = 'none';
    elements.emailsTableBody.innerHTML = emails.map(email => {
        const isSent = email.folder === 'sent';
        return `<tr class="clickable-row" data-case-id="${email.caseId}">
            <td class="col-direction"><span class="${isSent ? 'direction-sent' : 'direction-inbox'}">${isSent ? '↑' : '↓'}</span></td>
            <td class="col-datum">${formatDateTime(email.receivedTime)}</td>
            <td class="col-sender">${escapeHtml(email.senderEmail ?? '-')}</td>
            <td class="col-subject">${escapeHtml(email.subject ?? 'Kein Betreff')}</td>
            <td class="col-kunde">${escapeHtml(email.kundeName ?? 'Unbekannt')}</td>
            <td class="col-status"><span class="status-badge status-${email.status ?? 'neu'}">${STATUS_ICONS[email.status] ?? '○'}</span></td>
        </tr>`;
    }).join('');
};
