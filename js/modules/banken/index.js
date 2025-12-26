/**
 * Banken Module - ES6 Entry Point (ES2024)
 * Imports all sub-modules and exposes functions to window for onclick compatibility
 */

// ========================================
// IMPORTS
// ========================================

import * as feedback from './feedback.js';
import * as screenshot from './screenshot.js';
import * as dashboard from './dashboard.js';
import * as ui from './ui.js';
import * as customer from './customer.js';
import * as documents from './documents.js';
import * as tasks from './tasks.js';

// ========================================
// FEEDBACK FUNCTIONS
// ========================================

Object.assign(window, {
    initFeedbackSystem: feedback.initFeedbackSystem,
    toggleFeedbackPanel: feedback.toggleFeedbackPanel,
    setFeedbackType: feedback.setFeedbackType,
    handleAuthorSelect: feedback.handleAuthorSelect,
    handleReplyAuthorSelect: feedback.handleReplyAuthorSelect,
    submitFeedback: feedback.submitFeedback,
    openFeedbackDetail: feedback.openFeedbackDetail,
    closeFeedbackDetail: feedback.closeFeedbackDetail,
    editFeedbackByIndex: feedback.editFeedbackByIndex,
    editFeedback: feedback.editFeedback,
    deleteFeedback: feedback.deleteFeedback,
    showFeedbackNotification: feedback.showFeedbackNotification,
    refreshFeedbackList: feedback.refreshFeedbackList,
    exportFeedback: feedback.exportFeedback,
    openScreenshotLightbox: feedback.openScreenshotLightbox,
});

// ========================================
// SCREENSHOT FUNCTIONS
// ========================================

Object.assign(window, {
    captureScreenshot: screenshot.captureScreenshot,
    openScreenshotModal: screenshot.openScreenshotModal,
    closeScreenshotModal: screenshot.closeScreenshotModal,
    undoDrawing: screenshot.undoDrawing,
    clearDrawing: screenshot.clearDrawing,
    setDrawTool: screenshot.setDrawTool,
    setDrawColor: screenshot.setDrawColor,
    saveAnnotatedScreenshot: screenshot.saveAnnotatedScreenshot,
    editScreenshot: screenshot.editScreenshot,
    removeScreenshot: screenshot.removeScreenshot,
});

// ========================================
// DASHBOARD FUNCTIONS
// ========================================

Object.assign(window, {
    showBankenTab: dashboard.showBankenTab,
    showBankenSection: dashboard.showBankenSection,
    filterBySegment: dashboard.filterBySegment,
    openSegmentFullscreen: dashboard.openSegmentFullscreen,
    clearSegmentFilter: dashboard.clearSegmentFilter,
    filterByDPDBucket: dashboard.filterByDPDBucket,
    toggleSection: dashboard.toggleSection,
    restoreCollapsedSections: dashboard.restoreCollapsedSections,
    showChartPopup: dashboard.showChartPopup,
    closeChartPopup: dashboard.closeChartPopup,
    toggleAllNpl: dashboard.toggleAllNpl,
    updateBulkActionState: dashboard.updateBulkActionState,
    bulkAction: dashboard.bulkAction,
    openCase: dashboard.openCase,
    callCustomer: dashboard.callCustomer,
    sendReminder: dashboard.sendReminder,
    scheduleCallback: dashboard.scheduleCallback,
    showAllEhemalige: dashboard.showAllEhemalige,
    exportReport: dashboard.exportReport,
});

// ========================================
// UI FUNCTIONS
// ========================================

Object.assign(window, {
    toggleHeaderDropdown: ui.toggleHeaderDropdown,
    closeHeaderDropdowns: ui.closeHeaderDropdowns,
    dismissAlert: ui.dismissAlert,
    showOverdueCases: ui.showOverdueCases,
    showNotification: ui.showNotification,
    switchModule: ui.switchModule,
    initModuleSelector: ui.initModuleSelector,
    loadComponent: ui.loadComponent,
    loadBankenComponents: ui.loadBankenComponents,
    loadBankenModule: ui.loadBankenModule,
});

// ========================================
// CUSTOMER FUNCTIONS
// ========================================

Object.assign(window, {
    getFullCustomerData: customer.getFullCustomerData,
    openCustomerDetail: customer.openCustomerDetail,
    closeCustomerDetail: customer.closeCustomerDetail,
    showCustomerTab: customer.showCustomerTab,
    openCrmProfile: customer.openCrmProfile,
    closeCrmProfile: customer.closeCrmProfile,
    getCustomerActivities: customer.getCustomerActivities,
    saveCustomerActivity: customer.saveCustomerActivity,
    renderCustomerActivities: customer.renderCustomerActivities,
    deleteActivity: customer.deleteActivity,
    openActivityModal: customer.openActivityModal,
    closeActivityModal: customer.closeActivityModal,
    submitActivity: customer.submitActivity,
    addNote: customer.addNote,
    getCustomerNotes: customer.getCustomerNotes,
    saveCustomerNote: customer.saveCustomerNote,
    getCustomerStammdaten: customer.getCustomerStammdaten,
    saveCustomerStammdaten: customer.saveCustomerStammdaten,
    escalateCase: customer.escalateCase,
    createRatePlan: customer.createRatePlan,
    reviewForRestructure: customer.reviewForRestructure,
});

// ========================================
// DOCUMENT SCANNER FUNCTIONS
// ========================================

Object.assign(window, {
    openDocumentScanner: documents.openDocumentScanner,
    closeDocumentScanner: documents.closeDocumentScanner,
    handleDragOver: documents.handleDragOver,
    handleDragLeave: documents.handleDragLeave,
    handleDrop: documents.handleDrop,
    handleFileSelect: documents.handleFileSelect,
    removeUpload: documents.removeUpload,
    openCamera: documents.openCamera,
    startAIRecognition: documents.startAIRecognition,
    goToStep2: documents.goToStep2,
    goToStep3: documents.goToStep3,
    createCustomerFromScan: documents.createCustomerFromScan,
    showBulkImport: documents.showBulkImport,
});

// ========================================
// TASK FUNCTIONS
// ========================================

Object.assign(window, {
    completeTask: tasks.completeTask,
    openTaskCompletionDialog: tasks.openTaskCompletionDialog,
    closeTaskCompletionDialog: tasks.closeTaskCompletionDialog,
    submitTaskCompletion: tasks.submitTaskCompletion,
});

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        feedback.initFeedbackSystem?.();
        dashboard.restoreCollapsedSections?.();
    }, 500);
});

console.log('✅ Banken ES6 modules loaded (ES2024)');
