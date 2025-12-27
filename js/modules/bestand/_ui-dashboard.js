/**
 * Bestand UI Dashboard (ES2024)
 * Dashboard-Rendering-Funktionen (KPIs, Sparten, Activities, Search)
 */

import * as storage from './storage.js';
import { STATUS_ICONS, STATUS_LABELS } from './_ui-constants.js';
import { escapeHtml, formatDate, formatDateTime, parseGermanDate } from './_ui-helpers.js';
import { getElements } from './_ui-state.js';

/**
 * Rendert Dashboard KPIs
 * @param {Object} stats - Statistik-Objekt
 * @returns {void}
 */
export const renderDashboardKPIs = (stats) => {
    const elements = getElements();
    if (!stats) return;
    const total = stats.total ?? 0;
    const wf = stats.byWorkflow ?? {};

    if (elements.kpiTotal) elements.kpiTotal.textContent = total;
    if (elements.kpiKiRecognized) elements.kpiKiRecognized.textContent = wf.kiRecognized ?? 0;
    if (elements.kpiPvValidated) elements.kpiPvValidated.textContent = wf.pvValidated ?? 0;
    if (elements.kpiExportReady) elements.kpiExportReady.textContent = stats.exportReady ?? 0;
    if (elements.kpiExportiert) elements.kpiExportiert.textContent = wf.exported ?? 0;

    if (total > 0) {
        if (elements.kpiKiRecognizedPct) elements.kpiKiRecognizedPct.textContent = Math.round((wf.kiRecognized ?? 0) / total * 100) + '%';
        if (elements.kpiPvValidatedPct) elements.kpiPvValidatedPct.textContent = Math.round((wf.pvValidated ?? 0) / total * 100) + '%';
        if (elements.kpiExportReadyPct) elements.kpiExportReadyPct.textContent = Math.round((stats.exportReady ?? 0) / total * 100) + '%';
        if (elements.kpiExportiertPct) elements.kpiExportiertPct.textContent = Math.round((wf.exported ?? 0) / total * 100) + '%';
    }

    if (elements.validationPendingCount) {
        elements.validationPendingCount.textContent = storage.getPendingValidationCases().length;
    }
    if (elements.incompleteCount) {
        elements.incompleteCount.textContent = storage.getIncompleteCases().length;
    }
};

/**
 * Rendert Sparten-Liste
 * @param {Array} spartenStats - Array von Sparten-Statistiken
 * @returns {void}
 */
export const renderSpartenList = (spartenStats) => {
    const elements = getElements();
    if (!elements.spartenList) return;
    if (!spartenStats?.length) {
        elements.spartenList.innerHTML = '<p class="text-muted">Keine Sparten vorhanden</p>';
        return;
    }
    elements.spartenList.innerHTML = spartenStats.map(s => `<span class="sparten-tag">${escapeHtml(s.sparte)}<span class="count">${s.count}</span></span>`).join('');
};

/**
 * Gibt aktuelle Filter-Werte für Activities zurück
 * @returns {Object} Filter-Werte {status, sort}
 */
export const getActivityFilterValues = () => {
    const elements = getElements();
    return {
        status: elements.activityStatusFilter?.value ?? '',
        sort: elements.activitySort?.value ?? 'desc'
    };
};

/**
 * Rendert kürzliche Aktivitäten
 * @param {Array} activities - Array von Aktivitäten
 * @param {string} filterStatus - Status-Filter
 * @param {string} sortOrder - Sortierreihenfolge (asc/desc)
 * @returns {void}
 */
export const renderRecentActivity = (activities, filterStatus, sortOrder) => {
    const elements = getElements();
    if (!elements.recentActivityBody) return;

    let filtered = activities ?? [];
    if (filterStatus) filtered = filtered.filter(a => a.to === filterStatus);
    filtered.sort((a, b) => sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));

    if (!filtered.length) {
        elements.recentActivityBody.innerHTML = '<tr><td colspan="4" class="text-muted">Keine Aktivitäten</td></tr>';
        return;
    }

    const groupedByDate = {};
    filtered.forEach(a => {
        const dateKey = formatDate(a.date);
        (groupedByDate[dateKey] ??= []).push(a);
    });

    let html = '';
    Object.entries(groupedByDate).forEach(([dateKey, activitiesForDate]) => {
        html += `<tr class="date-header-row"><td colspan="4" class="date-header">${dateKey}</td></tr>`;
        activitiesForDate.forEach(a => {
            const activityDate = parseGermanDate(a.date);
            const isNew = a.isNew || (activityDate && !isNaN(activityDate.getTime()) && (Date.now() - activityDate.getTime() < 60 * 60 * 1000));
            html += `<tr class="clickable-row${isNew ? ' new-activity' : ''}" data-case-id="${a.caseId}">
                <td></td><td>${escapeHtml(a.kundeName)}</td><td>${escapeHtml(a.maklerName)}</td>
                <td><span class="status-badge status-${a.to}">${STATUS_ICONS[a.to] ?? '○'} ${STATUS_LABELS[a.to] ?? a.to}</span></td>
            </tr>`;
        });
    });
    elements.recentActivityBody.innerHTML = html;
};

/**
 * Rendert Import/Export-Historie
 * @param {Array} history - Array von Import/Export-Einträgen
 * @returns {void}
 */
export const renderImportExportHistory = (history) => {
    const elements = getElements();
    if (!elements.importExportHistory) return;
    if (!history?.length) {
        elements.importExportHistory.innerHTML = '<tr><td colspan="4" class="text-muted">Keine Historie vorhanden</td></tr>';
        return;
    }
    elements.importExportHistory.innerHTML = history.map(h => `
        <tr><td>${formatDateTime(h.date)}</td>
        <td><span class="status-badge ${h.type === 'import' ? 'status-angefragt' : 'status-exportiert'}">${h.type === 'import' ? 'Import' : 'Export'}</span></td>
        <td>${h.count} Vorgänge</td><td>${escapeHtml(h.user ?? 'Unbekannt')}</td></tr>
    `).join('');
};

/**
 * Rendert Dashboard-Suchergebnisse
 * @param {Array} cases - Array von gefundenen Cases
 * @param {string} query - Suchbegriff
 * @returns {void}
 */
export const renderDashboardSearchResults = (cases, query) => {
    const elements = getElements();
    if (!elements.dashboardSearchResults) return;
    if (!query?.trim() || query.trim().length < 2) {
        elements.dashboardSearchResults.innerHTML = '';
        elements.dashboardSearchResults.classList.remove('has-results');
        return;
    }

    elements.dashboardSearchResults.classList.add('has-results');
    if (!cases?.length) { elements.dashboardSearchResults.innerHTML = ''; return; }

    const limited = cases.slice(0, 10);
    elements.dashboardSearchResults.innerHTML = limited.map(c => `
        <div class="search-result-item" data-case-id="${c.id}">
            <div class="search-result-info">
                <div class="search-result-kunde">${escapeHtml(c.kunde?.name ?? 'Unbekannt')}</div>
                <div class="search-result-details">VS-Nr: ${escapeHtml(c.versicherungsnummer?.value ?? '-')} | ${escapeHtml(c.sparte ?? '-')} | Makler: ${escapeHtml(c.makler?.name ?? '-')}</div>
            </div>
            <span class="status-badge status-${c.status}">${STATUS_ICONS[c.status] ?? ''} ${STATUS_LABELS[c.status] ?? c.status}</span>
        </div>
    `).join('') + (cases.length > 10 ? `<div class="search-result-more">...und ${cases.length - 10} weitere Ergebnisse</div>` : '');
};
