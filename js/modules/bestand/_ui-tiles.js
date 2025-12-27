/**
 * Bestand UI Tiles (ES2024)
 * Case-Tiles-Rendering für Vorgänge-View
 */

import { STATUS_ICONS, STATUS_LABELS, STATUS_ORDER } from './_ui-constants.js';
import { escapeHtml, formatDate } from './_ui-helpers.js';
import { getElements } from './_ui-state.js';

/**
 * Rendert Case-Tiles gruppiert nach Status
 * @param {Array} cases - Array von Cases
 * @returns {void}
 */
export const renderCaseTiles = (cases) => {
    const elements = getElements();
    if (!elements.casesGroupedContainer) return;
    if (!cases?.length) {
        elements.casesGroupedContainer.innerHTML = '';
        if (elements.vorgaengeEmpty) elements.vorgaengeEmpty.style.display = 'block';
        return;
    }
    if (elements.vorgaengeEmpty) elements.vorgaengeEmpty.style.display = 'none';

    const grouped = Object.fromEntries(STATUS_ORDER.map(s => [s, cases.filter(c => c.status === s)]));

    elements.casesGroupedContainer.innerHTML = STATUS_ORDER.filter(s => grouped[s].length).map(status => `
        <div class="status-group status-group-${status}">
            <div class="status-group-header">
                <span class="status-badge status-${status}">${STATUS_ICONS[status]}</span>
                <h3>${STATUS_LABELS[status]}</h3><span class="status-group-count">${grouped[status].length}</span>
            </div>
            <div class="status-group-list">${grouped[status].map(c => `
                <div class="case-list-item" data-case-id="${c.id}">
                    <div class="case-list-main">
                        <div class="case-list-kunde">${escapeHtml(c.kunde?.name ?? 'Unbekannt')}</div>
                        <div class="case-list-details">
                            <span class="case-list-vsnr">VS-Nr: ${escapeHtml(c.versicherungsnummer?.value ?? '-')}</span>
                            <span class="case-list-sparte">${escapeHtml(c.sparte ?? '-')}</span>
                            <span class="case-list-makler">Makler: ${escapeHtml(c.makler?.name ?? '-')}</span>
                        </div>
                    </div>
                    <div class="case-list-meta">
                        ${c.exported?.date ? '<span class="list-export-badge">Exportiert</span>' : ''}
                        <span class="case-list-date">${formatDate(c.updatedAt)}</span>
                    </div>
                </div>
            `).join('')}</div>
        </div>
    `).join('');
};
