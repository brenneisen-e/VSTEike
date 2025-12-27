/**
 * Versicherung Module - ES6 Entry Point (ES2024)
 * Imports all sub-modules and exposes functions to window
 */

// ========================================
// IMPORTS
// ========================================

import * as api from './api.js';
import * as chat from './chat.js';
import * as navigation from './navigation.js';
import * as upload from './upload.js';
import * as data from './data.js';
import * as filters from './filters.js';
import * as potentialanalyse from './potentialanalyse.js';
import * as kundendetail from './kundendetail.js';
import * as images from './images.js';
import * as autocomplete from './autocomplete.js';

// ========================================
// API FUNCTIONS
// ========================================

Object.assign(window, {
    getApiToken: api.getApiToken,
    saveApiToken: api.saveApiToken,
    clearApiToken: api.clearApiToken,
    isUsingMockMode: api.isUsingMockMode,
    setupApiTokenInput: api.setupApiTokenInput,
    callClaudeAPI: api.callClaudeAPI,
});

// ========================================
// CHAT FUNCTIONS
// ========================================

Object.assign(window, {
    initLandingChat: chat.initLandingChat,
    sendLandingChatMessage: chat.sendLandingChatMessage,
    addLandingChatMessage: chat.addLandingChatMessage,
    showLandingChatTyping: chat.showLandingChatTyping,
    hideLandingChatTyping: chat.hideLandingChatTyping,
    askLandingSampleQuestion: filters.askLandingSampleQuestion,
    getLandingDataContext: chat.getLandingDataContext,
    generateLandingMockResponse: chat.generateLandingMockResponse,
    updateSuggestionSelection: chat.updateSuggestionSelection,
});

// ========================================
// NAVIGATION FUNCTIONS
// ========================================

Object.assign(window, {
    openDashboard: data.openDashboard,
    backToLanding: navigation.backToLanding,
    setNavigationEnabled: navigation.setNavigationEnabled,
    openAgenturView: navigation.openAgenturView,
    backToGesamtsicht: navigation.backToGesamtsicht,
    openRisikoscoring: navigation.openRisikoscoring,
    closeRisikoscoring: navigation.closeRisikoscoring,
    openBestandsuebertragung: navigation.openBestandsuebertragung,
    closeBestandsuebertragung: navigation.closeBestandsuebertragung,
    toggleSettings: navigation.toggleSettings,
    saveUserName: navigation.saveUserName,
    loadUserName: navigation.loadUserName,
    openAbrechnungspruefung: navigation.openAbrechnungspruefung,
    openValidierungProvision: navigation.openValidierungProvision,
    openFinanzplanung: navigation.openFinanzplanung,
    openProvisionssimulation: navigation.openProvisionssimulation,
    openOffeneVorgaenge: navigation.openOffeneVorgaenge,

    // Profile & User Mode
    toggleProfileDropdown: navigation.toggleProfileDropdown,
    switchUserMode: navigation.switchUserMode,
    updateNavigationBoxes: navigation.updateNavigationBoxes,
    updateWelcomeMessage: navigation.updateWelcomeMessage,
    updateProfileAvatar: navigation.updateProfileAvatar,
    getCurrentUserMode: navigation.getCurrentUserMode,

    // User Profile Image Upload
    triggerUserProfileUpload: navigation.triggerUserProfileUpload,
    triggerUserProfileUploadFor: navigation.triggerUserProfileUploadFor,
    handleUserProfileUpload: navigation.handleUserProfileUpload,
    handleUserProfileUploadDropdown: navigation.handleUserProfileUploadDropdown,
    processUserProfileImage: navigation.processUserProfileImage,
    compressImage: navigation.compressImage,
    updateAllUserProfileImages: navigation.updateAllUserProfileImages,
    loadUserProfileImages: navigation.loadUserProfileImages,

    // Utilities
    sleep: navigation.sleep,
});

// ========================================
// UPLOAD FUNCTIONS
// ========================================

Object.assign(window, {
    setupQuickUpload: upload.setupQuickUpload,
    handleQuickUpload: upload.handleQuickUpload,
    openUploadDialog: upload.openUploadDialog,
    openGenerator: upload.openGenerator,
    toggleUploadMode: images.toggleUploadMode,
    initUploadMode: images.initUploadMode,
    triggerLogoUpload: images.triggerLogoUpload,
    handleLogoUpload: images.handleLogoUpload,
    loadCustomLogo: upload.loadCustomLogo,
});

// ========================================
// DATA FUNCTIONS
// ========================================

Object.assign(window, {
    loadDefaultCSVData: data.loadDefaultCSVData,
    loadFeedbackData: data.loadFeedbackData,
    processCSVData: data.processCSVData,
    updateMainLoadingProgress: data.updateMainLoadingProgress,
    updateLoadingText: data.updateLoadingText,
    setupChatManually: data.setupChatManually,
});

// ========================================
// FILTER FUNCTIONS
// ========================================

Object.assign(window, {
    parseAndExecuteCommands: filters.parseAndExecuteCommands,
    setAgenturFilter: filters.setAgenturFilter,
    setSiloFilter: filters.setSiloFilter,
    setSegmentFilter: filters.setSegmentFilter,
    setBundeslandFilter: filters.setBundeslandFilter,
    clearAllFilters: filters.clearAllFilters,
});

// ========================================
// POTENTIALANALYSE FUNCTIONS
// ========================================

Object.assign(window, {
    openPotentialAnalyse: potentialanalyse.openPotentialAnalyse,
    openPotentialAnalyseWithFilter: potentialanalyse.openPotentialAnalyseWithFilter,
    closePotentialAnalyse: potentialanalyse.closePotentialAnalyse,
    showEigeneDaten: potentialanalyse.showEigeneDaten,
    showFidaDaten: potentialanalyse.showFidaDaten,
    updatePotentialFilter: potentialanalyse.updatePotentialFilter,
    filterPotentials: potentialanalyse.filterPotentials,
    togglePotentialGroup: potentialanalyse.togglePotentialGroup,
    renderGroupedPotentials: potentialanalyse.renderGroupedPotentials,
    renderFlatPotentials: potentialanalyse.renderFlatPotentials,
});

// ========================================
// KUNDENDETAIL FUNCTIONS
// ========================================

Object.assign(window, {
    openKundenDetail: kundendetail.openKundenDetail,
    closeKundenDetail: kundendetail.closeKundenDetail,
    fillKundenDetail: kundendetail.fillKundenDetail,
    switchKundenTab: kundendetail.switchKundenTab,
    toggleImpulsDetail: kundendetail.toggleImpulsDetail,
    viewKommunikation: kundendetail.viewKommunikation,
    toggleKundenFida: kundendetail.toggleKundenFida,
    switchVermittlerMode: kundendetail.switchVermittlerMode,
    updateOpenFinanceTable: kundendetail.updateOpenFinanceTable,
    initKundenFidaState: kundendetail.initKundenFidaState,
});

// ========================================
// IMAGE FUNCTIONS
// ========================================

Object.assign(window, {
    triggerProfileUpload: images.triggerProfileUpload,
    handleProfileUpload: images.handleProfileUpload,
    triggerAgenturPhotoUpload: images.triggerAgenturPhotoUpload,
    handleAgenturPhotoUpload: images.handleAgenturPhotoUpload,
    loadSavedImages: images.loadSavedImages,
    exportImagesForGitHub: images.exportImagesForGitHub,
});

// ========================================
// AUTOCOMPLETE FUNCTIONS
// ========================================

Object.assign(window, {
    setupAutocomplete: autocomplete.setupAutocomplete,
    executeSuggestion: autocomplete.executeSuggestion,
    selectAgentSuggestion: autocomplete.selectAgentSuggestion,
    selectPotentialSuggestion: autocomplete.selectPotentialSuggestion,
    selectSuggestion: autocomplete.selectSuggestion,
    showAgentSuggestions: autocomplete.showAgentSuggestions,
    showPotentialSuggestions: autocomplete.showPotentialSuggestions,
    getIcon: autocomplete.getIcon,
});

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        api.setupApiTokenInput?.();
        chat.initLandingChat?.();
        navigation.loadUserName?.();
        navigation.loadUserProfileImages?.();
        upload.setupQuickUpload?.();
        autocomplete.setupAutocomplete?.();
        images.initUploadMode?.();

        // Auto-load CSV data
        data.loadDefaultCSVData?.().then(() => {
            navigation.setNavigationEnabled?.(true);

            const loadingAnim = document.getElementById('loadingAnimation');
            const welcomeChat = document.getElementById('welcomeChat');

            if (loadingAnim) loadingAnim.style.display = 'none';
            if (welcomeChat) welcomeChat.style.display = 'block';

        });
    }, 500);
});

// Close profile dropdown when clicking outside
document.addEventListener('click', function(event) {
    const switcher = document.getElementById('userProfileSwitcher');
    const dropdown = document.getElementById('profileDropdown');
    const arrow = document.getElementById('profileArrow');

    if (switcher && dropdown && !switcher.contains(event.target)) {
        dropdown.classList.remove('show');
        if (arrow) arrow.classList.remove('open');
    }
});

