/**
 * Banken Chat Module - ES6 Entry Point (ES2024)
 * AI Chat for Collections Dashboard
 *
 * This module is now modularized into focused submodules:
 * - _constants.js: Demo data constants
 * - _state.js: State management
 * - _helpers.js: Helper functions
 * - _query-processor.js: Query processing logic
 * - _ui.js: UI manipulation functions
 * - _actions.js: Main action handlers
 * - _init.js: Initialization logic
 */

// Import from submodules
import { DEMO_CUSTOMER_DATA, DEMO_PAYMENTS } from './_constants.js';
import { lastChatQueryResult } from './_state.js';
import { initBankenChat } from './_init.js';
import { sendBankenMessage, showFilteredCustomers, exportChatToExcel, exportChatToPdf } from './_actions.js';

// Re-export all public functions and data for backwards compatibility
export {
    // Constants
    DEMO_CUSTOMER_DATA,
    DEMO_PAYMENTS,

    // Main functions
    initBankenChat,
    sendBankenMessage,
    showFilteredCustomers,
    exportChatToExcel,
    exportChatToPdf
};

// ========================================
// WINDOW EXPORTS
// ========================================

Object.assign(window, {
    initBankenChat,
    sendBankenMessage,
    showFilteredCustomers,
    exportChatToExcel,
    exportChatToPdf,
    get lastChatQueryResult() { return lastChatQueryResult; }
});
