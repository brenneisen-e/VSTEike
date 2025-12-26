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
    askLandingSampleQuestion: chat.askLandingSampleQuestion,
});

// ========================================
// NAVIGATION FUNCTIONS
// ========================================

Object.assign(window, {
    openDashboard: navigation.openDashboard,
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
});

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        api.setupApiTokenInput?.();
        chat.initLandingChat?.();
        navigation.loadUserName?.();
    }, 500);
});

console.log('✅ Versicherung ES6 modules loaded (ES2024)');
