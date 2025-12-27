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
import * as charts from './charts.js';

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
    submitReply: feedback.submitReply,
    openFeedbackDetail: feedback.openFeedbackDetail,
    closeFeedbackDetail: feedback.closeFeedbackDetail,
    editFeedbackByIndex: feedback.editFeedbackByIndex,
    editFeedback: feedback.editFeedback,
    cancelEditFeedback: feedback.cancelEditFeedback,
    deleteFeedback: feedback.deleteFeedback,
    showFeedbackNotification: feedback.showFeedbackNotification,
    refreshFeedbackList: feedback.refreshFeedbackList,
    exportFeedback: feedback.exportFeedback,
    openScreenshotLightbox: feedback.openScreenshotLightbox,
    downloadFeedbackJson: feedback.downloadFeedbackJson,
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
    // Section & Navigation
    showBankenTab: dashboard.showBankenTab,
    showBankenSection: dashboard.showBankenSection,
    toggleSection: dashboard.toggleSection,
    restoreCollapsedSections: dashboard.restoreCollapsedSections,
    showCrmSection: dashboard.showCrmSection,

    // Filtering
    filterBySegment: dashboard.filterBySegment,
    filterByDPDBucket: dashboard.filterByDPDBucket,
    filterByDPD: dashboard.filterByDPD,
    filterByAll: dashboard.filterByAll,
    filterByAmount: dashboard.filterByAmount,
    filterAufgaben: dashboard.filterAufgaben,
    openSegmentFullscreen: dashboard.openSegmentFullscreen,
    clearSegmentFilter: dashboard.clearSegmentFilter,

    // Case Views
    showRecoveryDetails: dashboard.showRecoveryDetails,
    showNewCases: dashboard.showNewCases,
    showAllNewCases: dashboard.showAllNewCases,
    showAllResolvedCases: dashboard.showAllResolvedCases,
    showPayments: dashboard.showPayments,
    showPromises: dashboard.showPromises,
    showAlternativeStrategies: dashboard.showAlternativeStrategies,
    showAllEhemalige: dashboard.showAllEhemalige,
    showFullLetter: dashboard.showFullLetter,

    // Charts & Popups
    showChartPopup: dashboard.showChartPopup,
    closeChartPopup: dashboard.closeChartPopup,
    toggleCreditView: dashboard.toggleCreditView,
    toggleDocument: dashboard.toggleDocument,

    // Bulk Actions
    toggleAllNpl: dashboard.toggleAllNpl,
    updateBulkActionState: dashboard.updateBulkActionState,
    bulkAction: dashboard.bulkAction,

    // Quick Actions
    openCase: dashboard.openCase,
    callCustomer: dashboard.callCustomer,
    initiateCall: dashboard.initiateCall,
    scheduleCall: dashboard.scheduleCall,
    sendReminder: dashboard.sendReminder,
    sendEmail: dashboard.sendEmail,
    composeEmail: dashboard.composeEmail,
    scheduleCallback: dashboard.scheduleCallback,

    // AI & Recommendations
    applyAIRecommendation: dashboard.applyAIRecommendation,

    // Workflows
    startMahnprozess: dashboard.startMahnprozess,
    startMahnlauf: dashboard.startMahnlauf,
    createAgreement: dashboard.createAgreement,
    viewAgreement: dashboard.viewAgreement,
    sellCase: dashboard.sellCase,
    writeOff: dashboard.writeOff,
    reviewForSale: dashboard.reviewForSale,
    reviewForWriteOff: dashboard.reviewForWriteOff,

    // Tasks
    rescheduleTask: dashboard.rescheduleTask,
    openTaskCustomer: dashboard.openTaskCustomer,

    // Documents
    uploadDocument: dashboard.uploadDocument,
    downloadDocument: dashboard.downloadDocument,
    printDocument: dashboard.printDocument,
    generateDemoCustomerFile: dashboard.generateDemoCustomerFile,

    // CRM
    editStammdaten: customer.editStammdaten,
    cancelStammdatenEdit: customer.cancelStammdatenEdit,
    crmCall: dashboard.crmCall,
    crmEmail: dashboard.crmEmail,
    crmNote: dashboard.crmNote,
    crmSchedule: dashboard.crmSchedule,
    openCrmFromModal: dashboard.openCrmFromModal,

    // Export
    exportReport: dashboard.exportReport,

    // Letter Modal
    closeLetterModal: dashboard.closeLetterModal,
    printLetter: dashboard.printLetter,
    downloadDashboardSummary: dashboard.downloadDashboardSummary,
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

    // AI & Additional Customer Functions
    showAiSummary: customer.showAiSummary,
    openCustomerDetailCRM: customer.openCustomerDetailCRM,
    writeOffCase: customer.writeOffCase,
    createActivityElement: customer.createActivityElement,
    addActivityModalStyles: customer.addActivityModalStyles,
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
// CHART FUNCTIONS
// ========================================

Object.assign(window, {
    initBankenCharts: charts.initBankenCharts,
    initScatterPlot: charts.initScatterPlot,
    initPortfolioChart: charts.initPortfolioChart,
    refreshScatterPlot: charts.refreshScatterPlot,
    exportMatrix: charts.exportMatrix,
    updatePortfolioChart: charts.updatePortfolioChart,
    filterCustomers: charts.filterCustomers,
    searchCustomers: charts.searchCustomers,
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

