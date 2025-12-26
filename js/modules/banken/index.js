/**
 * Banken Module - ES6 Entry Point
 * Imports all sub-modules and exposes functions to window for onclick compatibility
 */

// ========================================
// IMPORTS
// ========================================

import * as feedback from './feedback.js';
import * as screenshot from './screenshot.js';

// ========================================
// EXPOSE TO WINDOW (onclick compatibility)
// ========================================

// Feedback functions
window.initFeedbackSystem = feedback.initFeedbackSystem;
window.toggleFeedbackPanel = feedback.toggleFeedbackPanel;
window.setFeedbackType = feedback.setFeedbackType;
window.handleAuthorSelect = feedback.handleAuthorSelect;
window.handleReplyAuthorSelect = feedback.handleReplyAuthorSelect;
window.submitFeedback = feedback.submitFeedback;
window.openFeedbackDetail = feedback.openFeedbackDetail;
window.closeFeedbackDetail = feedback.closeFeedbackDetail;
window.editFeedbackByIndex = feedback.editFeedbackByIndex;
window.editFeedback = feedback.editFeedback;
window.deleteFeedback = feedback.deleteFeedback;
window.showFeedbackNotification = feedback.showFeedbackNotification;
window.refreshFeedbackList = feedback.refreshFeedbackList;
window.exportFeedback = feedback.exportFeedback;
window.removeScreenshot = feedback.removeScreenshot;
window.openScreenshotLightbox = feedback.openScreenshotLightbox;

// Screenshot functions
window.captureScreenshot = screenshot.captureScreenshot;
window.openScreenshotModal = screenshot.openScreenshotModal;
window.closeScreenshotModal = screenshot.closeScreenshotModal;
window.undoDrawing = screenshot.undoDrawing;
window.clearDrawing = screenshot.clearDrawing;
window.setDrawTool = screenshot.setDrawTool;
window.setDrawColor = screenshot.setDrawColor;
window.saveAnnotatedScreenshot = screenshot.saveAnnotatedScreenshot;
window.editScreenshot = screenshot.editScreenshot;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        feedback.initFeedbackSystem();
    }, 500);
});

console.log('✅ Banken ES6 modules loaded');
