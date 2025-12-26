/**
 * Bestand Module - ES6 Entry Point (ES2024)
 * Imports storage module and exposes to window for backward compatibility
 */

import * as storage from './storage.js';

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

// Assign to window for backward compatibility
window.Storage = Storage;

console.log('Bestand ES6 modules loaded (ES2024)');

export { Storage };
