/**
 * Bestand App Module (ES2024)
 * Hauptapplikation für Bestandsübertragung Tool
 */

import * as storage from './storage.js';
import * as ui from './ui.js';
import * as exportModule from './export.js';
import * as demoData from './demo-data.js';

// ========================================
// STATE
// ========================================

let currentView = 'dashboard';
let maklerSortField = 'total';
let maklerSortDir = 'desc';

// ========================================
// UTILITIES
// ========================================

const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// ========================================
// INITIALIZATION
// ========================================

export const init = () => {
    console.log('Bestandsübertragung Tool wird initialisiert...');

    ui.init();

    if (demoData.loadDemoData()) {
        console.log('Demo-Daten wurden geladen');
        ui.showToast('26 Demo-Vorgänge wurden geladen', 'success');
    }

    setupEventListeners();
    refreshData();

    console.log('Initialisierung abgeschlossen');
};

// ========================================
// EVENT LISTENERS
// ========================================

const setupEventListeners = () => {
    // Header Buttons
    document.getElementById('fileInput')?.addEventListener('change', handleFileImport);
    document.getElementById('resetDemoBtn')?.addEventListener('click', handleResetDemo);
    document.getElementById('downloadDemoBtn')?.addEventListener('click', handleDownloadDemo);

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentView = btn.dataset.view;
            ui.switchView(currentView);
            refreshCurrentView();
        });
    });

    // Dashboard Buttons
    document.getElementById('showIncompleteBtn')?.addEventListener('click', handleShowIncomplete);
    document.getElementById('validateAllBtn')?.addEventListener('click', handleValidateAll);
    document.getElementById('massValidateBtn')?.addEventListener('click', handleMassValidate);
    document.getElementById('exportReadyBtn')?.addEventListener('click', handleExportReady);
    document.getElementById('exportToRoboticsBtn')?.addEventListener('click', handleExportToRobotics);

    // Dashboard Search & Filters
    document.getElementById('recentActivityBody')?.addEventListener('click', handleActivityRowClick);
    document.getElementById('dashboardSearch')?.addEventListener('input', debounce(handleDashboardSearch, 300));
    document.getElementById('dashboardSearchResults')?.addEventListener('click', handleDashboardSearchClick);
    document.getElementById('activityStatusFilter')?.addEventListener('change', refreshDashboard);
    document.getElementById('activitySort')?.addEventListener('change', refreshDashboard);

    // Vorgänge View
    document.getElementById('newCaseBtn')?.addEventListener('click', () => ui.openCaseModal(null));
    document.getElementById('vorgaengeSearch')?.addEventListener('input', debounce(refreshVorgaengeView, 300));
    document.getElementById('filterSparte')?.addEventListener('change', refreshVorgaengeView);
    document.getElementById('filterExport')?.addEventListener('change', refreshVorgaengeView);
    document.getElementById('casesGroupedContainer')?.addEventListener('click', handleListItemClick);

    // Makler View
    document.getElementById('maklerSearch')?.addEventListener('input', debounce(refreshMaklerView, 300));
    document.querySelectorAll('#view-makler th.sortable').forEach(th => {
        th.addEventListener('click', () => handleMaklerSort(th.dataset.sort));
    });
    document.getElementById('maklerTableBody')?.addEventListener('click', handleMaklerRowClick);

    // Emails View
    document.getElementById('emailSearch')?.addEventListener('input', debounce(refreshEmailsView, 300));
    document.getElementById('emailSort')?.addEventListener('change', refreshEmailsView);
    document.getElementById('emailsTableBody')?.addEventListener('click', handleEmailRowClick);

    // Modals
    document.getElementById('modalClose')?.addEventListener('click', ui.closeCaseModal);
    document.getElementById('cancelCase')?.addEventListener('click', ui.closeCaseModal);
    document.getElementById('saveCase')?.addEventListener('click', handleSaveCase);
    document.getElementById('deleteCase')?.addEventListener('click', handleDeleteCase);
    document.getElementById('validateCaseBtn')?.addEventListener('click', handleValidateSingleCase);

    document.getElementById('maklerModalClose')?.addEventListener('click', ui.closeMaklerModal);
    document.getElementById('closeMaklerModal')?.addEventListener('click', ui.closeMaklerModal);
    document.getElementById('maklerCasesBody')?.addEventListener('click', handleMaklerCaseClick);

    document.getElementById('exportModalClose')?.addEventListener('click', ui.closeExportModal);
    document.getElementById('cancelExport')?.addEventListener('click', ui.closeExportModal);
    document.getElementById('confirmExport')?.addEventListener('click', handleConfirmExport);

    document.getElementById('validationModalClose')?.addEventListener('click', ui.closeValidationModal);
    document.getElementById('validationSkip')?.addEventListener('click', handleValidationSkip);
    document.getElementById('validationConfirm')?.addEventListener('click', handleValidationConfirm);
    document.getElementById('validationReject')?.addEventListener('click', handleValidationReject);
    document.getElementById('validationWiedervorlage')?.addEventListener('click', handleValidationWiedervorlage);

    // Drag & Drop
    setupDragAndDrop();

    // Modal outside click
    ['caseModal', 'maklerModal', 'exportModal', 'validationModal'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', e => {
            if (e.target.id === id) {
                if (id === 'caseModal') ui.closeCaseModal();
                else if (id === 'maklerModal') ui.closeMaklerModal();
                else if (id === 'exportModal') ui.closeExportModal();
                else if (id === 'validationModal') ui.closeValidationModal();
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            ui.closeCaseModal();
            ui.closeMaklerModal();
            ui.closeExportModal();
            ui.closeValidationModal();
        }
    });

    // Linked cases click
    document.getElementById('linkedCasesList')?.addEventListener('click', e => {
        const linkedItem = e.target.closest('.linked-case-item');
        if (linkedItem?.dataset.caseId) {
            const caseData = storage.getCase(linkedItem.dataset.caseId);
            if (caseData) ui.openCaseModal(caseData);
        }
    });
};

const setupDragAndDrop = () => {
    const body = document.body;
    body.addEventListener('dragenter', e => { e.preventDefault(); ui.showDropOverlay(true); });
    body.addEventListener('dragover', e => e.preventDefault());
    body.addEventListener('dragleave', e => { if (e.target === document.getElementById('dropOverlay')) ui.showDropOverlay(false); });
    body.addEventListener('drop', e => {
        e.preventDefault();
        ui.showDropOverlay(false);
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/json') processImportFile(files[0]);
        else ui.showToast('Bitte nur JSON-Dateien importieren', 'warning');
    });
};

// ========================================
// REFRESH FUNCTIONS
// ========================================

export const refreshData = () => {
    const cases = storage.getCasesArray();
    const maklerStats = storage.getMaklerStats();
    const emails = storage.getAllEmails();
    ui.updateNavCounts(cases.length, maklerStats.length, emails.length);
    refreshCurrentView();
};

const refreshCurrentView = () => {
    switch (currentView) {
        case 'dashboard': refreshDashboard(); break;
        case 'vorgaenge': refreshVorgaengeView(); break;
        case 'makler': refreshMaklerView(); break;
        case 'emails': refreshEmailsView(); break;
    }
};

const refreshDashboard = () => {
    const stats = storage.getDetailedStats();
    const spartenStats = storage.getSpartenStats();
    const recentActivity = storage.getRecentActivity(26);
    const importExportHistory = storage.getImportExportHistory();
    const activityFilters = ui.getActivityFilterValues();

    ui.renderDashboardKPIs(stats);
    ui.renderSpartenList(spartenStats);
    ui.renderRecentActivity(recentActivity, activityFilters.status, activityFilters.sort);
    ui.renderImportExportHistory(importExportHistory);

    const massValidateBtn = document.getElementById('massValidateBtn');
    if (massValidateBtn) massValidateBtn.style.display = stats.total >= 100 ? '' : 'none';
};

const refreshVorgaengeView = () => {
    const filters = ui.getVorgaengeFilterValues();
    let cases = storage.getCasesArray().filter(c => {
        if (filters.search) {
            const searchFields = [c.kunde?.name, c.versicherungsnummer?.value, c.makler?.name, c.sparte, c.notes].filter(Boolean).join(' ').toLowerCase();
            if (!searchFields.includes(filters.search)) return false;
        }
        if (filters.sparte && c.sparte !== filters.sparte) return false;
        if (filters.exportFilter === 'exported' && !c.exported?.date) return false;
        if (filters.exportFilter === 'not-exported' && c.exported?.date) return false;
        return true;
    });

    cases.sort((a, b) => {
        const aHasLinked = a.linkedCaseIds?.length > 0 ? 1 : 0;
        const bHasLinked = b.linkedCaseIds?.length > 0 ? 1 : 0;
        if (bHasLinked !== aHasLinked) return bHasLinked - aHasLinked;
        return new Date(b.updatedAt ?? 0) - new Date(a.updatedAt ?? 0);
    });

    ui.renderCaseTiles(cases);
};

const refreshMaklerView = () => {
    const search = ui.getMaklerSearchValue();
    let maklerStats = storage.getMaklerStats();
    if (search) maklerStats = maklerStats.filter(m => m.name.toLowerCase().includes(search) || m.email.toLowerCase().includes(search));

    const multiplier = maklerSortDir === 'desc' ? -1 : 1;
    maklerStats.sort((a, b) => {
        const valueA = maklerSortField === 'name' ? a.name.toLowerCase() : a[maklerSortField];
        const valueB = maklerSortField === 'name' ? b.name.toLowerCase() : b[maklerSortField];
        return valueA < valueB ? -1 * multiplier : valueA > valueB ? 1 * multiplier : 0;
    });

    ui.renderMaklerTable(maklerStats);
};

const refreshEmailsView = () => {
    const filters = ui.getEmailFilterValues();
    let emails = storage.getAllEmails();
    if (filters.search) {
        emails = emails.filter(e => [e.subject, e.senderEmail, e.kundeName, e.bodyPlain].filter(Boolean).join(' ').toLowerCase().includes(filters.search));
    }
    emails.sort((a, b) => filters.sort === 'asc' ? new Date(a.receivedTime) - new Date(b.receivedTime) : new Date(b.receivedTime) - new Date(a.receivedTime));
    ui.renderEmailsTable(emails);
};

// ========================================
// EVENT HANDLERS
// ========================================

const handleActivityRowClick = e => {
    const row = e.target.closest('tr.clickable-row');
    if (!row) return;
    const caseData = storage.getCase(row.dataset.caseId);
    if (caseData) ui.openCaseModal(caseData);
};

const handleDashboardSearch = e => {
    const query = e.target.value.trim();
    if (query.length < 2) { ui.renderDashboardSearchResults([], query); return; }

    const queryLower = query.toLowerCase();
    const matches = storage.getAllCases().filter(c => {
        return [c.kunde?.name, c.versicherungsnummer?.value, c.makler?.name, c.makler?.email, c.sparte]
            .filter(Boolean).some(v => v.toLowerCase().includes(queryLower));
    });
    ui.renderDashboardSearchResults(matches, query);
};

const handleDashboardSearchClick = e => {
    const item = e.target.closest('.search-result-item');
    if (!item) return;
    const caseData = storage.getCase(item.dataset.caseId);
    if (caseData) ui.openCaseModal(caseData);
};

const handleListItemClick = e => {
    const item = e.target.closest('.case-list-item');
    if (!item) return;
    const caseData = storage.getCase(item.dataset.caseId);
    if (caseData) ui.openCaseModal(caseData);
};

const handleMaklerSort = field => {
    if (maklerSortField === field) maklerSortDir = maklerSortDir === 'desc' ? 'asc' : 'desc';
    else { maklerSortField = field; maklerSortDir = 'desc'; }
    refreshMaklerView();
};

const handleMaklerRowClick = e => {
    const row = e.target.closest('tr.clickable-row');
    if (!row) return;
    const maklerStats = storage.getMaklerStats();
    const maklerData = maklerStats.find(m => m.name === row.dataset.maklerName);
    if (maklerData) {
        const cases = storage.findCasesByMakler(row.dataset.maklerName);
        ui.openMaklerModal(maklerData, cases);
    }
};

const handleEmailRowClick = e => {
    const row = e.target.closest('tr.clickable-row');
    if (!row) return;
    const caseData = storage.getCase(row.dataset.caseId);
    if (caseData) ui.openCaseModal(caseData);
};

const handleMaklerCaseClick = e => {
    const row = e.target.closest('tr.clickable-row');
    if (!row) return;
    const caseData = storage.getCase(row.dataset.caseId);
    if (caseData) { ui.closeMaklerModal(); ui.openCaseModal(caseData); }
};

const handleSaveCase = () => {
    const formData = ui.getCaseFormData();
    if (!formData.kunde.name && !formData.versicherungsnummer.value) {
        ui.showToast('Bitte mindestens Kunde oder VS-Nr angeben', 'warning');
        return;
    }

    const isNew = !formData.id;
    let caseData = isNew ? { ...formData, conversationIds: [], messageIds: [], messages: [], statusHistory: [{ date: new Date().toISOString().split('T')[0], from: null, to: formData.status, note: 'Manuell erstellt' }] } : storage.getCase(formData.id);

    if (!isNew) {
        const oldStatus = caseData.status;
        Object.assign(caseData, { kunde: formData.kunde, versicherungsnummer: formData.versicherungsnummer, sparte: formData.sparte, status: formData.status, gueltigkeitsdatum: formData.gueltigkeitsdatum, makler: formData.makler, notes: formData.notes });

        if (oldStatus === 'unvollstaendig' && formData.status === 'unvollstaendig' && formData.kunde?.name?.trim() && formData.versicherungsnummer?.value?.trim()) {
            caseData.status = 'zu-validieren';
            ui.showToast('Daten vollständig - Status auf "Zu Validieren" geändert', 'success');
        }

        if (oldStatus !== caseData.status) {
            caseData.statusHistory ??= [];
            caseData.statusHistory.push({ date: new Date().toISOString().split('T')[0], from: oldStatus, to: caseData.status, note: oldStatus === 'unvollstaendig' ? 'Daten ergänzt' : 'Manuell geändert' });
        }
    }

    const saved = storage.saveCase(caseData);
    if (saved) { ui.showToast(isNew ? 'Vorgang erstellt' : 'Vorgang gespeichert', 'success'); ui.closeCaseModal(); refreshData(); }
    else ui.showToast('Fehler beim Speichern', 'error');
};

const handleDeleteCase = () => {
    const caseId = document.getElementById('caseId')?.value;
    if (!caseId) { ui.closeCaseModal(); return; }
    if (confirm('Vorgang wirklich löschen?')) {
        if (storage.deleteCase(caseId)) { ui.showToast('Vorgang gelöscht', 'success'); ui.closeCaseModal(); refreshData(); }
        else ui.showToast('Fehler beim Löschen', 'error');
    }
};

const handleShowIncomplete = () => {
    const incompleteCases = storage.getIncompleteCases();
    if (!incompleteCases.length) { ui.showToast('Keine unvollständigen Vorgänge', 'info'); return; }
    currentView = 'vorgaenge';
    ui.switchView(currentView);
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) filterStatus.value = 'unvollstaendig';
    refreshVorgaengeView();
    ui.showToast(`${incompleteCases.length} unvollständige Vorgänge`, 'info');
};

const handleValidateAll = () => {
    const pendingCases = storage.getPendingValidationCases();
    if (!pendingCases.length) { ui.showToast('Keine Vorgänge zur Validierung', 'info'); return; }
    ui.openValidationModal(pendingCases);
};

const handleMassValidate = () => {
    const pendingCases = storage.getPendingValidationCases();
    if (!pendingCases.length) { ui.showToast('Keine Vorgänge zur Validierung', 'info'); return; }

    const highConfidenceCases = pendingCases.filter(c => (c.kunde?.confidence ?? 0) >= 0.7 && (c.versicherungsnummer?.confidence ?? 0) >= 0.7);
    if (!highConfidenceCases.length) { ui.showToast('Keine Vorgänge mit hoher Konfidenz gefunden', 'info'); return; }

    const toValidate = highConfidenceCases.slice(0, 400);
    if (!confirm(`Massenvalidierung: ${toValidate.length} Vorgänge mit hoher KI-Konfidenz werden als "Export-Bereit" markiert.\n\nFortfahren?`)) return;

    const now = new Date().toISOString();
    let successCount = 0;
    toValidate.forEach(caseData => {
        try {
            caseData.status = 'export-bereit';
            caseData.workflow ??= {};
            caseData.workflow.pvValidated = now;
            caseData.statusHistory ??= [];
            caseData.statusHistory.push({ date: now, from: 'zu-validieren', to: 'export-bereit', note: 'Massenvalidierung (hohe Konfidenz)' });
            storage.saveCase(caseData);
            successCount++;
        } catch (e) { console.error(`Fehler bei Validierung von ${caseData.id}:`, e); }
    });

    ui.showToast(`${successCount} Vorgänge erfolgreich validiert`, 'success');
    refreshDashboard();
};

const handleValidateSingleCase = () => {
    const caseId = document.getElementById('caseId')?.value;
    if (!caseId) { ui.showToast('Kein Vorgang ausgewählt', 'warning'); return; }
    const caseData = storage.getCase(caseId);
    if (!caseData) { ui.showToast('Vorgang nicht gefunden', 'error'); return; }
    if (caseData.status !== 'zu-validieren') { ui.showToast('Vorgang hat nicht den Status "Zu Validieren"', 'warning'); return; }
    ui.closeCaseModal();
    ui.openValidationModal([caseData]);
};

const handleValidationSkip = () => {
    if (ui.hasMoreValidationCases()) ui.nextValidationCase();
    else { ui.closeValidationModal(); ui.showToast('Validierung abgeschlossen', 'info'); refreshData(); }
};

const handleValidationConfirm = () => {
    const currentCase = ui.getCurrentValidationCase();
    if (currentCase) {
        const formData = ui.getValidationFormData();
        Object.assign(currentCase, {
            kunde: { ...(currentCase.kunde ?? {}), name: formData.kunde },
            versicherungsnummer: { ...(currentCase.versicherungsnummer ?? {}), value: formData.vsNr },
            sparte: formData.sparte,
            gueltigkeitsdatum: { ...(currentCase.gueltigkeitsdatum ?? {}), value: formData.datum },
            makler: { ...(currentCase.makler ?? {}), name: formData.makler },
            status: formData.wiedervorlage ? 'wiedervorlage' : 'export-bereit',
            wiedervorlage: formData.wiedervorlage || null,
            updatedAt: new Date().toISOString()
        });
        currentCase.statusHistory ??= [];
        currentCase.statusHistory.push({ date: new Date().toISOString().split('T')[0], from: 'zu-validieren', to: currentCase.status, note: 'PV-Validierung abgeschlossen' });
        storage.saveCase(currentCase);
        storage.markCasesValidated([currentCase.id]);
    }

    if (ui.hasMoreValidationCases()) { ui.nextValidationCase(); ui.showToast('Vorgang validiert', 'success'); }
    else { ui.closeValidationModal(); ui.showToast('Alle Vorgänge validiert', 'success'); refreshData(); }
};

const handleValidationWiedervorlage = () => {
    const currentCase = ui.getCurrentValidationCase();
    if (currentCase) {
        const formData = ui.getValidationFormData();
        const wiedervorlageDate = formData.wiedervorlage || (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0]; })();
        Object.assign(currentCase, { wiedervorlage: wiedervorlageDate, status: 'wiedervorlage', updatedAt: new Date().toISOString() });
        currentCase.workflow ??= {};
        currentCase.workflow.pvValidated = new Date().toISOString();
        currentCase.statusHistory ??= [];
        currentCase.statusHistory.push({ date: new Date().toISOString().split('T')[0], from: 'zu-validieren', to: 'wiedervorlage', note: 'PV-Validierung: Wiedervorlage bis ' + wiedervorlageDate });
        storage.saveCase(currentCase);
        storage.markCaseValidated(currentCase.id);
    }

    if (ui.hasMoreValidationCases()) { ui.nextValidationCase(); ui.showToast('Wiedervorlage gesetzt', 'success'); }
    else { ui.closeValidationModal(); ui.showToast('Alle Vorgänge validiert', 'success'); refreshData(); }
};

const handleValidationReject = () => {
    const rejectSection = document.getElementById('valRejectSection');
    if (rejectSection?.style.display === 'none') { ui.toggleRejectSection(true); return; }
    if (!ui.hasRejectReason()) { ui.showToast('Bitte Ablehnungsgrund angeben', 'warning'); return; }

    const currentCase = ui.getCurrentValidationCase();
    if (currentCase) {
        const formData = ui.getValidationFormData();
        Object.assign(currentCase, { status: 'abgelehnt', rejectReason: formData.rejectReason, updatedAt: new Date().toISOString() });
        currentCase.workflow ??= {};
        currentCase.workflow.pvValidated = new Date().toISOString();
        currentCase.statusHistory ??= [];
        currentCase.statusHistory.push({ date: new Date().toISOString().split('T')[0], from: 'zu-validieren', to: 'abgelehnt', note: 'Abgelehnt: ' + formData.rejectReason });
        storage.saveCase(currentCase);
    }

    ui.toggleRejectSection(false);
    if (ui.hasMoreValidationCases()) { ui.nextValidationCase(); ui.showToast('Vorgang abgelehnt', 'info'); }
    else { ui.closeValidationModal(); ui.showToast('Validierung abgeschlossen', 'success'); refreshData(); }
};

const handleExportReady = () => {
    const exportReadyCases = storage.getExportReadyCases();
    if (!exportReadyCases.length) { ui.showToast('Keine Vorgänge zum Exportieren', 'info'); return; }
    ui.openExportModal(exportReadyCases.length);
};

const handleExportToRobotics = e => { e.stopPropagation(); handleExportReady(); };

const handleConfirmExport = () => {
    const exporterName = ui.getExporterName();
    if (!exporterName) { ui.showToast('Bitte Namen eingeben', 'warning'); return; }

    const exportReadyCases = storage.getExportReadyCases();
    const caseIds = exportReadyCases.map(c => c.id);
    exportModule.exportToCSV(exportReadyCases, `ergo_robotics_export_${exportModule.formatDateForFilename(new Date())}.csv`);
    const count = storage.markCasesExported(caseIds, exporterName);
    storage.logImportExport('export', count, exporterName);

    ui.closeExportModal();
    ui.showToast(`${count} Vorgänge exportiert und als "exportiert" markiert`, 'success');
    refreshData();
};

const handleDownloadDemo = () => {
    const count = demoData.downloadDemoExportJSON();
    ui.showToast(`Demo-JSON mit ${count} E-Mails heruntergeladen`, 'success');
};

const handleResetDemo = () => {
    if (confirm('Alle Daten zurücksetzen und Demo-Daten neu laden?')) {
        storage.clearAll();
        demoData.loadDemoData(true);
        ui.showToast('Demo-Daten wurden neu geladen', 'success');
        refreshData();
    }
};

const handleFileImport = e => {
    const file = e.target.files[0];
    if (file) processImportFile(file);
    e.target.value = '';
};

const processImportFile = async file => {
    try {
        const result = await exportModule.importFromJSON(file);
        if (result.type === 'backup') {
            storage.logImportExport('import', storage.getCasesArray().length, 'Backup-Import');
            ui.showToast('Backup erfolgreich importiert', 'success');
            refreshData();
        } else if (result.type === 'outlook') {
            const processResult = exportModule.processOutlookExport(result.data);
            let message = `${processResult.processed} E-Mails verarbeitet`;
            if (processResult.created > 0) message += `, ${processResult.created} neue Vorgänge erstellt`;
            if (processResult.matched > 0) message += `, ${processResult.matched} zugeordnet`;
            const importCount = processResult.created + processResult.matched;
            if (importCount > 0) storage.logImportExport('import', importCount, 'Outlook-Import');
            ui.showToast(message, importCount > 0 ? 'success' : 'info');
            refreshData();
        }
    } catch (error) {
        console.error('Import-Fehler:', error);
        ui.showToast(error.message, 'error');
    }
};

// Export for VST integration
export { refreshData };
