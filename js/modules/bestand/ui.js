/**
 * Bestand UI Module (ES2024)
 * User Interface Komponenten und Rendering
 */

import * as storage from './storage.js';

// ========================================
// CONSTANTS
// ========================================

export const STATUS_ICONS = {
    'unvollstaendig': '◇', 'zu-validieren': '◐', 'export-bereit': '●',
    'abgeschlossen': '✓', 'abgelehnt': '✕', 'wiedervorlage': '⟳'
};

export const STATUS_LABELS = {
    'unvollstaendig': 'Unvollständig', 'zu-validieren': 'Zu Validieren',
    'export-bereit': 'Export-Bereit', 'abgeschlossen': 'Abgeschlossen',
    'abgelehnt': 'Abgelehnt', 'wiedervorlage': 'Wiedervorlage'
};

export const WORKFLOW_STEPS = [
    { key: 'mailReceived', label: 'Mail erhalten', icon: '◉' },
    { key: 'mailUploaded', label: 'Importiert', icon: '↑' },
    { key: 'kiRecognized', label: 'Von KI erkannt', icon: '◈' },
    { key: 'pvValidated', label: 'Von PV validiert', icon: '✓' },
    { key: 'exported', label: 'Exportiert', icon: '↗' }
];

// ========================================
// STATE
// ========================================

let elements = {};
let validationState = { cases: [], currentIndex: 0 };

// ========================================
// HELPER FUNCTIONS
// ========================================

export const escapeHtml = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

export const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return dateStr; }
};

export const parseGermanDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    const match = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (match) {
        const [, day, month, year, hour = '0', minute = '0', second = '0'] = match;
        return new Date(year, month - 1, day, hour, minute, second);
    }
    return null;
};

export const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = parseGermanDate(dateStr);
    if (!date || isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const truncateText = (text, maxLength) => text?.length > maxLength ? text.substring(0, maxLength) + '...' : (text ?? '');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightKeywords = (text, keywords) => {
    if (!keywords?.length) return escapeHtml(text);
    let result = escapeHtml(text);
    keywords.forEach(keyword => {
        if (!keyword || keyword.length < 2) return;
        const regex = new RegExp(`(${escapeRegex(escapeHtml(keyword))})`, 'gi');
        result = result.replace(regex, '<mark>$1</mark>');
    });
    return result;
};

// ========================================
// INITIALIZATION
// ========================================

export const init = () => {
    elements = {
        toastContainer: document.getElementById('toastContainer'),
        dropOverlay: document.getElementById('dropOverlay'),
        vorgaengeCount: document.getElementById('vorgaengeCount'),
        maklerNavCount: document.getElementById('maklerNavCount'),
        emailsNavCount: document.getElementById('emailsNavCount'),
        kpiTotal: document.getElementById('kpiTotal'),
        kpiKiRecognized: document.getElementById('kpiKiRecognized'),
        kpiKiRecognizedPct: document.getElementById('kpiKiRecognizedPct'),
        kpiPvValidated: document.getElementById('kpiPvValidated'),
        kpiPvValidatedPct: document.getElementById('kpiPvValidatedPct'),
        kpiExportReady: document.getElementById('kpiExportReady'),
        kpiExportReadyPct: document.getElementById('kpiExportReadyPct'),
        kpiExportiert: document.getElementById('kpiExportiert'),
        kpiExportiertPct: document.getElementById('kpiExportiertPct'),
        spartenList: document.getElementById('spartenList'),
        incompleteCount: document.getElementById('incompleteCount'),
        validationPendingCount: document.getElementById('validationPendingCount'),
        recentActivityBody: document.getElementById('recentActivityBody'),
        dashboardSearch: document.getElementById('dashboardSearch'),
        dashboardSearchResults: document.getElementById('dashboardSearchResults'),
        activityStatusFilter: document.getElementById('activityStatusFilter'),
        activitySort: document.getElementById('activitySort'),
        importExportHistory: document.getElementById('importExportHistory'),
        vorgaengeSearch: document.getElementById('vorgaengeSearch'),
        filterSparte: document.getElementById('filterSparte'),
        filterExport: document.getElementById('filterExport'),
        casesGroupedContainer: document.getElementById('casesGroupedContainer'),
        vorgaengeEmpty: document.getElementById('vorgaengeEmpty'),
        maklerSearch: document.getElementById('maklerSearch'),
        maklerTableBody: document.getElementById('maklerTableBody'),
        maklerEmpty: document.getElementById('maklerEmpty'),
        emailSearch: document.getElementById('emailSearch'),
        emailSort: document.getElementById('emailSort'),
        emailsTableBody: document.getElementById('emailsTableBody'),
        emailsEmpty: document.getElementById('emailsEmpty'),
        caseModal: document.getElementById('caseModal'),
        modalTitle: document.getElementById('modalTitle'),
        caseForm: document.getElementById('caseForm'),
        caseId: document.getElementById('caseId'),
        caseKunde: document.getElementById('caseKunde'),
        caseVsNr: document.getElementById('caseVsNr'),
        caseSparte: document.getElementById('caseSparte'),
        caseDatum: document.getElementById('caseDatum'),
        caseMaklerName: document.getElementById('caseMaklerName'),
        caseMaklerEmail: document.getElementById('caseMaklerEmail'),
        caseStatus: document.getElementById('caseStatus'),
        caseNotes: document.getElementById('caseNotes'),
        emailTimeline: document.getElementById('emailTimeline'),
        modalMailCount: document.getElementById('modalMailCount'),
        keywordsList: document.getElementById('keywordsList'),
        stepMailReceived: document.getElementById('stepMailReceived'),
        stepMailUploaded: document.getElementById('stepMailUploaded'),
        stepKiRecognized: document.getElementById('stepKiRecognized'),
        stepPvValidated: document.getElementById('stepPvValidated'),
        stepExported: document.getElementById('stepExported'),
        linkedCasesCard: document.getElementById('linkedCasesCard'),
        linkedCasesCount: document.getElementById('linkedCasesCount'),
        linkedCasesList: document.getElementById('linkedCasesList'),
        maklerModal: document.getElementById('maklerModal'),
        maklerModalTitle: document.getElementById('maklerModalTitle'),
        maklerInfo: document.getElementById('maklerInfo'),
        maklerCasesBody: document.getElementById('maklerCasesBody'),
        exportModal: document.getElementById('exportModal'),
        exportCaseCount: document.getElementById('exportCaseCount'),
        exporterName: document.getElementById('exporterName'),
        validationModal: document.getElementById('validationModal'),
        validationCurrent: document.getElementById('validationCurrent'),
        validationTotal: document.getElementById('validationTotal'),
        valKunde: document.getElementById('valKunde'),
        valVsNr: document.getElementById('valVsNr'),
        valSparte: document.getElementById('valSparte'),
        valDatum: document.getElementById('valDatum'),
        valMakler: document.getElementById('valMakler'),
        valWiedervorlage: document.getElementById('valWiedervorlage'),
        valRejectSection: document.getElementById('valRejectSection'),
        valRejectReason: document.getElementById('valRejectReason'),
        valEmailPreview: document.getElementById('valEmailPreview')
    };
};

export { elements };

// ========================================
// TOAST & OVERLAY
// ========================================

export const showToast = (message, type = 'info', duration = 4000) => {
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

export const showDropOverlay = (show) => {
    if (elements.dropOverlay) elements.dropOverlay.style.display = show ? 'flex' : 'none';
};

// ========================================
// NAVIGATION
// ========================================

export const updateNavCounts = (vorgaenge, makler, emails) => {
    if (elements.vorgaengeCount) elements.vorgaengeCount.textContent = vorgaenge;
    if (elements.maklerNavCount) elements.maklerNavCount.textContent = makler;
    if (elements.emailsNavCount) elements.emailsNavCount.textContent = emails;
};

export const switchView = (viewName) => {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewName));
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === `view-${viewName}`));
};

// ========================================
// DASHBOARD
// ========================================

export const renderDashboardKPIs = (stats) => {
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

export const renderSpartenList = (spartenStats) => {
    if (!elements.spartenList) return;
    if (!spartenStats?.length) {
        elements.spartenList.innerHTML = '<p class="text-muted">Keine Sparten vorhanden</p>';
        return;
    }
    elements.spartenList.innerHTML = spartenStats.map(s => `<span class="sparten-tag">${escapeHtml(s.sparte)}<span class="count">${s.count}</span></span>`).join('');
};

export const getActivityFilterValues = () => ({
    status: elements.activityStatusFilter?.value ?? '',
    sort: elements.activitySort?.value ?? 'desc'
});

export const renderRecentActivity = (activities, filterStatus, sortOrder) => {
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

export const renderImportExportHistory = (history) => {
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

export const renderDashboardSearchResults = (cases, query) => {
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

// ========================================
// CASE TILES
// ========================================

export const renderCaseTiles = (cases) => {
    if (!elements.casesGroupedContainer) return;
    if (!cases?.length) {
        elements.casesGroupedContainer.innerHTML = '';
        if (elements.vorgaengeEmpty) elements.vorgaengeEmpty.style.display = 'block';
        return;
    }
    if (elements.vorgaengeEmpty) elements.vorgaengeEmpty.style.display = 'none';

    const STATUS_ORDER = ['unvollstaendig', 'zu-validieren', 'export-bereit', 'abgeschlossen', 'abgelehnt', 'wiedervorlage'];
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

// ========================================
// TABLES
// ========================================

export const renderMaklerTable = (maklerStats) => {
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

export const renderEmailsTable = (emails) => {
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

// ========================================
// MODALS
// ========================================

export const openCaseModal = (caseData) => {
    if (!elements.caseModal) return;
    const isNew = !caseData;
    elements.modalTitle.textContent = isNew ? 'Neuer Vorgang' : 'Vorgang bearbeiten';
    elements.caseForm?.reset();

    if (caseData) {
        elements.caseId.value = caseData.id;
        elements.caseKunde.value = caseData.kunde?.name ?? '';
        elements.caseVsNr.value = caseData.versicherungsnummer?.value ?? '';
        elements.caseSparte.value = caseData.sparte ?? '';
        elements.caseDatum.value = caseData.gueltigkeitsdatum?.value ?? '';
        elements.caseMaklerName.value = caseData.makler?.name ?? '';
        elements.caseMaklerEmail.value = caseData.makler?.email ?? '';
        elements.caseStatus.value = caseData.status ?? 'neu';
        elements.caseNotes.value = caseData.notes ?? '';
        renderWorkflowTimeline(caseData.workflow ?? {});
        renderKeywords(caseData);
        renderLinkedCases(caseData);
        renderEmailTimeline(caseData.messages ?? [], caseData);
        highlightMissingFields(caseData);
    } else {
        elements.caseId.value = '';
        renderWorkflowTimeline({});
        renderKeywords(null);
        renderLinkedCases(null);
        renderEmailTimeline([], null);
        clearMissingFieldHighlights();
    }
    elements.caseModal.style.display = 'flex';
};

export const closeCaseModal = () => { if (elements.caseModal) elements.caseModal.style.display = 'none'; };
export const openMaklerModal = (maklerData, cases) => { /* Implementation similar to original */ };
export const closeMaklerModal = () => { if (elements.maklerModal) elements.maklerModal.style.display = 'none'; };
export const openExportModal = (caseCount) => {
    if (!elements.exportModal) return;
    elements.exportCaseCount.textContent = caseCount;
    elements.exporterName.value = '';
    elements.exportModal.style.display = 'flex';
};
export const closeExportModal = () => { if (elements.exportModal) elements.exportModal.style.display = 'none'; };
export const getExporterName = () => elements.exporterName?.value.trim() ?? '';

// ========================================
// VALIDATION MODAL
// ========================================

export const openValidationModal = (casesToValidate) => {
    if (!elements.validationModal || !casesToValidate?.length) {
        showToast('Keine Vorgänge zur Validierung vorhanden', 'info');
        return;
    }
    validationState = { cases: casesToValidate, currentIndex: 0 };
    elements.validationTotal.textContent = casesToValidate.length;
    renderValidationCase();
    elements.validationModal.style.display = 'flex';
};

export const closeValidationModal = () => {
    if (elements.validationModal) elements.validationModal.style.display = 'none';
    validationState = { cases: [], currentIndex: 0 };
};

const convertGermanDateToISO = (dateStr) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const match = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    return match ? `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}` : '';
};

const renderValidationCase = () => {
    const caseData = validationState.cases[validationState.currentIndex];
    if (!caseData) return;

    elements.validationCurrent.textContent = validationState.currentIndex + 1;
    if (elements.valRejectSection) elements.valRejectSection.style.display = 'none';
    if (elements.valRejectReason) elements.valRejectReason.value = '';

    const extractedValues = [];
    if (elements.valKunde) { elements.valKunde.value = caseData.kunde?.name ?? ''; if (caseData.kunde?.name) extractedValues.push(caseData.kunde.name); }
    if (elements.valVsNr) { elements.valVsNr.value = caseData.versicherungsnummer?.value ?? ''; if (caseData.versicherungsnummer?.value) extractedValues.push(caseData.versicherungsnummer.value); }
    if (elements.valSparte) { elements.valSparte.value = caseData.sparte ?? ''; }
    if (elements.valDatum) { elements.valDatum.value = convertGermanDateToISO(caseData.gueltigkeitsdatum?.value ?? ''); }
    if (elements.valMakler) { elements.valMakler.value = caseData.makler?.name ?? ''; }
    if (elements.valWiedervorlage) { elements.valWiedervorlage.value = convertGermanDateToISO(caseData.wiedervorlage ?? ''); }

    const firstMsg = caseData.messages?.[0];
    if (firstMsg) {
        const bodyPreview = truncateText(firstMsg.bodyPlain ?? firstMsg.body ?? '', 500);
        elements.valEmailPreview.innerHTML = `<div class="email-preview-subject">${escapeHtml(firstMsg.subject ?? 'Kein Betreff')}</div><div class="email-preview-body">${highlightKeywords(bodyPreview, extractedValues)}</div>`;
    } else {
        elements.valEmailPreview.innerHTML = '<span class="text-muted">Keine E-Mail vorhanden</span>';
    }
};

export const nextValidationCase = () => {
    if (validationState.currentIndex < validationState.cases.length - 1) {
        validationState.currentIndex++;
        renderValidationCase();
        return true;
    }
    return false;
};

export const getCurrentValidationCase = () => validationState.cases[validationState.currentIndex] ?? null;
export const hasMoreValidationCases = () => validationState.currentIndex < validationState.cases.length - 1;

export const getValidationFormData = () => ({
    kunde: elements.valKunde?.value?.trim() ?? '',
    vsNr: elements.valVsNr?.value?.trim() ?? '',
    sparte: elements.valSparte?.value ?? '',
    datum: elements.valDatum?.value ?? '',
    makler: elements.valMakler?.value?.trim() ?? '',
    wiedervorlage: elements.valWiedervorlage?.value ?? '',
    rejectReason: elements.valRejectReason?.value?.trim() ?? ''
});

export const toggleRejectSection = (show) => {
    if (elements.valRejectSection) {
        elements.valRejectSection.style.display = show ? 'block' : 'none';
        if (show) elements.valRejectReason?.focus();
    }
};

export const hasRejectReason = () => (elements.valRejectReason?.value?.trim() ?? '').length > 0;

export const toggleEmailBody = (headerElement) => {
    const bookmark = headerElement.closest('.email-bookmark');
    if (!bookmark) return;
    const body = bookmark.querySelector('.email-bookmark-body');
    const icon = bookmark.querySelector('.email-expand-icon');
    if (body.style.display === 'none') {
        body.style.display = 'block';
        icon.textContent = '▼';
        bookmark.classList.add('expanded');
    } else {
        body.style.display = 'none';
        icon.textContent = '▶';
        bookmark.classList.remove('expanded');
    }
};

// ========================================
// FORM DATA
// ========================================

export const getCaseFormData = () => ({
    id: elements.caseId.value ?? null,
    kunde: { name: elements.caseKunde.value.trim(), confidence: 1.0, source: 'manual' },
    versicherungsnummer: { value: elements.caseVsNr.value.trim(), confidence: 1.0, source: 'manual' },
    sparte: elements.caseSparte.value,
    status: elements.caseStatus.value,
    gueltigkeitsdatum: elements.caseDatum.value ? { value: elements.caseDatum.value.trim(), confidence: 1.0, source: 'manual' } : null,
    makler: { name: elements.caseMaklerName.value.trim(), email: elements.caseMaklerEmail.value.trim() },
    notes: elements.caseNotes.value.trim()
});

export const getVorgaengeFilterValues = () => ({
    search: elements.vorgaengeSearch?.value.trim().toLowerCase() ?? '',
    sparte: elements.filterSparte?.value ?? '',
    exportFilter: elements.filterExport?.value ?? ''
});

export const getMaklerSearchValue = () => elements.maklerSearch?.value.trim().toLowerCase() ?? '';

export const getEmailFilterValues = () => ({
    search: elements.emailSearch?.value.trim().toLowerCase() ?? '',
    sort: elements.emailSort?.value ?? 'desc'
});

// ========================================
// PRIVATE HELPERS
// ========================================

const renderWorkflowTimeline = (workflow) => {
    const stepElements = {
        mailReceived: elements.stepMailReceived,
        mailUploaded: elements.stepMailUploaded,
        kiRecognized: elements.stepKiRecognized,
        pvValidated: elements.stepPvValidated,
        exported: elements.stepExported
    };

    let lastCompletedIndex = -1;
    WORKFLOW_STEPS.forEach((step, index) => {
        const stepEl = stepElements[step.key];
        const stepContainer = stepEl?.closest('.workflow-step');
        const connectorAfter = stepContainer?.nextElementSibling;
        if (!stepEl || !stepContainer) return;

        const stepDate = workflow[step.key];
        stepContainer.classList.remove('completed', 'active');

        if (stepDate) {
            stepContainer.classList.add('completed');
            stepEl.textContent = formatDate(stepDate);
            lastCompletedIndex = index;
            if (connectorAfter?.classList.contains('workflow-connector')) connectorAfter.classList.add('completed');
        } else {
            stepEl.textContent = '–';
            if (connectorAfter?.classList.contains('workflow-connector')) connectorAfter.classList.remove('completed');
        }
    });

    const activeIndex = lastCompletedIndex + 1;
    if (activeIndex < WORKFLOW_STEPS.length) {
        const activeStepKey = WORKFLOW_STEPS[activeIndex].key;
        stepElements[activeStepKey]?.closest('.workflow-step')?.classList.add('active');
    }
};

const renderKeywords = (caseData) => {
    if (!elements.keywordsList) return;
    if (!caseData) { elements.keywordsList.innerHTML = '<span class="text-muted">Keine Schlagwörter</span>'; return; }

    const keywords = [];
    if (caseData.kunde?.name && caseData.kunde.source !== 'manual') keywords.push({ field: 'Kunde', value: caseData.kunde.name });
    if (caseData.versicherungsnummer?.value && caseData.versicherungsnummer.source !== 'manual') keywords.push({ field: 'VS-Nr', value: caseData.versicherungsnummer.value });
    if (caseData.gueltigkeitsdatum?.value && caseData.gueltigkeitsdatum.source !== 'manual') keywords.push({ field: 'Datum', value: caseData.gueltigkeitsdatum.value });
    if (caseData.makler?.name && caseData.makler.email) keywords.push({ field: 'Makler', value: caseData.makler.name });
    if (caseData.sparte) keywords.push({ field: 'Sparte', value: caseData.sparte });

    if (!keywords.length) { elements.keywordsList.innerHTML = '<span class="text-muted">Keine automatisch erkannten Schlagwörter</span>'; return; }
    elements.keywordsList.innerHTML = keywords.map(kw => `<span class="keyword-tag"><span class="keyword-field">${escapeHtml(kw.field)}:</span><span class="keyword-value">${escapeHtml(kw.value)}</span></span>`).join('');
};

const renderLinkedCases = (caseData) => {
    if (!elements.linkedCasesCard || !elements.linkedCasesList) return;
    const linkedCases = caseData?.id ? storage.getLinkedCases(caseData.id) : [];
    if (!linkedCases.length) { elements.linkedCasesCard.style.display = 'none'; return; }

    elements.linkedCasesCard.style.display = 'block';
    elements.linkedCasesCount.textContent = linkedCases.length;
    elements.linkedCasesList.innerHTML = linkedCases.map(c => `
        <div class="linked-case-item" data-case-id="${c.id}">
            <div class="linked-case-status"><span class="status-badge status-${c.status}">${STATUS_ICONS[c.status] ?? '○'}</span></div>
            <div class="linked-case-info">
                <div class="linked-case-kunde">${escapeHtml(c.kunde?.name ?? 'Unbekannt')}</div>
                <div class="linked-case-details">${escapeHtml(c.versicherungsnummer?.value ?? '-')} · ${escapeHtml(c.sparte ?? '-')}</div>
            </div>
            <div class="linked-case-arrow">→</div>
        </div>
    `).join('');
};

const renderEmailTimeline = (messages, caseData) => {
    if (!elements.emailTimeline) return;
    elements.modalMailCount.textContent = messages.length;
    if (!messages.length) { elements.emailTimeline.innerHTML = '<p class="empty-message">Keine E-Mails vorhanden</p>'; return; }

    const highlightTerms = [];
    if (caseData?.kunde?.name) highlightTerms.push(caseData.kunde.name.split(',')[0].trim());
    if (caseData?.versicherungsnummer?.value) highlightTerms.push(caseData.versicherungsnummer.value);
    if (caseData?.gueltigkeitsdatum?.value) highlightTerms.push(caseData.gueltigkeitsdatum.value);

    const sorted = [...messages].sort((a, b) => (parseGermanDate(b.receivedTime) ?? new Date(0)) - (parseGermanDate(a.receivedTime) ?? new Date(0)));
    elements.emailTimeline.innerHTML = sorted.map((msg, index) => {
        const isSent = msg.folder === 'sent';
        const bodyText = highlightKeywords(truncateText(msg.bodyPlain ?? msg.body ?? '', 800), highlightTerms);
        return `<div class="email-bookmark ${msg.folder}" data-email-index="${index}">
            <div class="email-bookmark-header" onclick="UI.toggleEmailBody(this)">
                <span class="email-expand-icon">▶</span>
                <span class="email-direction ${isSent ? 'direction-sent' : 'direction-inbox'}">${isSent ? '↑' : '↓'}</span>
                <span class="email-date">${formatDateTime(msg.receivedTime)}</span>
                <span class="email-subject-short">${escapeHtml(msg.subject ?? 'Kein Betreff')}</span>
                <span class="email-preview">${escapeHtml(truncateText(msg.bodyPlain ?? msg.body ?? '', 60))}</span>
            </div>
            <div class="email-bookmark-body" style="display: none;">
                <div class="email-sender"><strong>Von:</strong> ${escapeHtml(msg.senderEmail ?? '-')}</div>
                <div class="email-body">${bodyText}</div>
            </div>
        </div>`;
    }).join('');
};

const highlightMissingFields = (caseData) => {
    clearMissingFieldHighlights();
    if (!caseData || caseData.status !== 'unvollstaendig') return;
    if (!caseData.kunde?.name?.trim()) elements.caseKunde?.closest('.stammdaten-item')?.classList.add('field-missing');
    if (!caseData.versicherungsnummer?.value?.trim()) elements.caseVsNr?.closest('.stammdaten-item')?.classList.add('field-missing');
};

const clearMissingFieldHighlights = () => {
    document.querySelectorAll('.stammdaten-item.field-missing').forEach(el => el.classList.remove('field-missing'));
};
