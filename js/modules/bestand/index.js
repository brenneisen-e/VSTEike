/**
 * Bestand Module - ES6 Entry Point (ES2024)
 * Imports all sub-modules and exposes to window for backward compatibility
 */

import * as storage from './storage.js';
import * as extractor from './extractor.js';
import * as matcher from './matcher.js';
import * as ui from './ui.js';
import * as exportModule from './export.js';
import * as demoData from './demo-data.js';
import * as app from './app.js';

// ========================================
// STORAGE - Expose to window
// ========================================

const Storage = {
    // Cases
    getCases: storage.getCases,
    saveCases: storage.saveCases,
    getCase: storage.getCase,
    saveCase: storage.saveCase,
    deleteCase: storage.deleteCase,
    getCasesArray: storage.getCasesArray,
    getAllCases: storage.getCasesArray, // Alias
    findCaseByConversationId: storage.findCaseByConversationId,
    findCaseByVsNr: storage.findCaseByVsNr,
    findCasesByKunde: storage.findCasesByKunde,
    findCasesByMakler: storage.findCasesByMakler,
    addMessagesToCase: storage.addMessagesToCase,
    addStatusHistory: storage.addStatusHistory,

    // Messages
    getProcessedMessageIds: storage.getProcessedMessageIds,
    markMessageProcessed: storage.markMessageProcessed,
    markMessagesProcessed: storage.markMessagesProcessed,
    isMessageProcessed: storage.isMessageProcessed,

    // Unassigned
    getUnassignedMails: storage.getUnassignedMails,
    addUnassignedMail: storage.addUnassignedMail,
    removeUnassignedMail: storage.removeUnassignedMail,
    clearUnassignedMails: storage.clearUnassignedMails,

    // Settings
    getSettings: storage.getSettings,
    saveSettings: storage.saveSettings,

    // Stats
    getStats: storage.getStats,
    getDetailedStats: storage.getDetailedStats,
    getMaklerStats: storage.getMaklerStats,
    getSpartenStats: storage.getSpartenStats,
    getAllEmails: storage.getAllEmails,
    getRecentActivity: storage.getRecentActivity,
    getImportExportHistory: storage.getImportExportHistory,
    logImportExport: storage.logImportExport,

    // Validation
    getPendingValidationCases: storage.getPendingValidationCases,
    getIncompleteCases: storage.getIncompleteCases,
    markCaseValidated: storage.markCaseValidated,
    markCasesValidated: storage.markCasesValidated,

    // Export
    getExportReadyCases: storage.getExportReadyCases,
    markCasesExported: storage.markCasesExported,

    // Links
    getLinkedCases: storage.getLinkedCases,
    hasLinkedCases: storage.hasLinkedCases,

    // Duplicates
    findDuplicates: storage.findDuplicates,
    mergeDuplicates: storage.mergeDuplicates,

    // Utils
    generateId: storage.generateId,
    clearAll: storage.clearAll,
    getStorageInfo: storage.getStorageInfo,
    exportData: storage.exportData,
    importData: storage.importData
};

// ========================================
// EXTRACTOR - Expose to window
// ========================================

const Extractor = {
    extractVersicherungsnummer: extractor.extractVersicherungsnummer,
    extractKundenname: extractor.extractKundenname,
    extractDatum: extractor.extractDatum,
    extractStatus: extractor.extractStatus,
    extractSparte: extractor.extractSparte,
    extractVersichererFromEmail: extractor.extractVersichererFromEmail,
    extractMaklerFromBody: extractor.extractMaklerFromBody,
    extractFromEmail: extractor.extractFromEmail,
    extractFromConversation: extractor.extractFromConversation,
    extractFromSubject: extractor.extractFromSubject,
    normalizeName: extractor.normalizeName,
    normalizeDatum: extractor.normalizeDatum,
    VERSICHERER_DOMAINS: extractor.VERSICHERER_DOMAINS
};

// ========================================
// MATCHER - Expose to window
// ========================================

const Matcher = {
    findMatches: matcher.findMatches,
    batchMatch: matcher.batchMatch,
    autoAssign: matcher.autoAssign,
    createCaseFromEmail: matcher.createCaseFromEmail,
    updateStatusFromEmail: matcher.updateStatusFromEmail,
    normalizeVsNr: matcher.normalizeVsNr,
    normalizeKunde: matcher.normalizeKunde,
    calculateSimilarity: matcher.calculateSimilarity,
    MATCH_CONFIDENCE: matcher.MATCH_CONFIDENCE,
    AUTO_ASSIGN_THRESHOLD: matcher.AUTO_ASSIGN_THRESHOLD
};

// ========================================
// UI - Expose to window
// ========================================

const UI = {
    init: ui.init,
    showToast: ui.showToast,
    showDropOverlay: ui.showDropOverlay,
    updateNavCounts: ui.updateNavCounts,
    switchView: ui.switchView,
    renderDashboardKPIs: ui.renderDashboardKPIs,
    renderSpartenList: ui.renderSpartenList,
    getActivityFilterValues: ui.getActivityFilterValues,
    renderRecentActivity: ui.renderRecentActivity,
    renderImportExportHistory: ui.renderImportExportHistory,
    renderDashboardSearchResults: ui.renderDashboardSearchResults,
    renderCaseTiles: ui.renderCaseTiles,
    renderMaklerTable: ui.renderMaklerTable,
    renderEmailsTable: ui.renderEmailsTable,
    openCaseModal: ui.openCaseModal,
    closeCaseModal: ui.closeCaseModal,
    openMaklerModal: ui.openMaklerModal,
    closeMaklerModal: ui.closeMaklerModal,
    openExportModal: ui.openExportModal,
    closeExportModal: ui.closeExportModal,
    getExporterName: ui.getExporterName,
    openValidationModal: ui.openValidationModal,
    closeValidationModal: ui.closeValidationModal,
    nextValidationCase: ui.nextValidationCase,
    getCurrentValidationCase: ui.getCurrentValidationCase,
    hasMoreValidationCases: ui.hasMoreValidationCases,
    getValidationFormData: ui.getValidationFormData,
    toggleRejectSection: ui.toggleRejectSection,
    hasRejectReason: ui.hasRejectReason,
    toggleEmailBody: ui.toggleEmailBody,
    getCaseFormData: ui.getCaseFormData,
    getVorgaengeFilterValues: ui.getVorgaengeFilterValues,
    getMaklerSearchValue: ui.getMaklerSearchValue,
    getEmailFilterValues: ui.getEmailFilterValues,
    escapeHtml: ui.escapeHtml,
    formatDate: ui.formatDate,
    formatDateTime: ui.formatDateTime,
    STATUS_ICONS: ui.STATUS_ICONS,
    STATUS_LABELS: ui.STATUS_LABELS,
    WORKFLOW_STEPS: ui.WORKFLOW_STEPS
};

// ========================================
// EXPORT - Expose to window
// ========================================

const Export = {
    exportToCSV: exportModule.exportToCSV,
    exportToJSON: exportModule.exportToJSON,
    importFromJSON: exportModule.importFromJSON,
    processOutlookExport: exportModule.processOutlookExport,
    generateReport: exportModule.generateReport,
    exportReport: exportModule.exportReport,
    formatDateForFilename: exportModule.formatDateForFilename,
    downloadBlob: exportModule.downloadBlob
};

// ========================================
// DEMO DATA - Expose to window
// ========================================

const DemoData = {
    generateDemoCases: demoData.generateDemoCases,
    loadDemoData: demoData.loadDemoData,
    generateMassEmails: demoData.generateMassEmails,
    downloadDemoExportJSON: demoData.downloadDemoExportJSON
};

// ========================================
// APP - Expose to window
// ========================================

const App = {
    init: app.init,
    refreshData: app.refreshData
};

// ========================================
// ASSIGN TO WINDOW
// ========================================

Object.assign(window, {
    Storage,
    Extractor,
    Matcher,
    UI,
    Export,
    DemoData,
    App,
    BestandApp: App,
    initBestandApp: app.init
});

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // App initialization is handled by app.js
    // This is just for backward compatibility
    console.log('✅ Bestand ES6 modules loaded (ES2024)');
});

export { Storage, Extractor, Matcher, UI, Export, DemoData, App };
