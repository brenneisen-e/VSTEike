/**
 * Provisionssimulation Module - ES6 Entry Point (ES2024)
 * Commission simulation for insurance agents
 *
 * This module has been modularized into focused submodules:
 * - _constants.js: Commission rates, tier definitions, UI configuration
 * - _state.js: Application state and chart instances
 * - _helpers.js: Utility functions for formatting and DOM manipulation
 * - _calculations.js: Core business logic for commission calculations
 * - _ui.js: DOM updates and user interface management
 * - _charts.js: Chart.js rendering and management
 * - _actions.js: User action handlers and main operations
 * - _events.js: Event listeners and window exports
 */

// ========================================
// IMPORTS
// ========================================

// Constants
export {
    COMMISSION_RATES,
    REVERS_TIERS,
    SEGMENT_ICONS,
    SEGMENT_LABELS
} from './_constants.js';

// State
export {
    provisionState,
    provisionChart,
    companyProjectionChart,
    setProvisionChart,
    setCompanyProjectionChart
} from './_state.js';

// Helpers
export {
    formatCurrency,
    updateElement,
    getSegmentIcon
} from './_helpers.js';

// Calculations
export {
    getTotalProduction,
    getCurrentReversTier,
    calculateProvisions,
    calculateCompanyCosts
} from './_calculations.js';

// UI Updates
export {
    updateProvisionSliders,
    updateProvisionKPIs,
    updateProvisionTable,
    updateReversTier,
    updateCompanyCostDisplays
} from './_ui.js';

// Charts
export {
    renderProvisionChart,
    renderCompanyProjectionChart
} from './_charts.js';

// Actions
export {
    handleProvisionSlider,
    exportProvisionReport,
    resetProvisionSimulation,
    toggleProvisionFullscreen,
    switchPerspective,
    updateMigrationDisplay,
    initCompanyView,
    initProvisionSimulation
} from './_actions.js';

// Events
import { setupEventListeners, setupWindowExports } from './_events.js';

// ========================================
// INITIALIZATION
// ========================================

// Setup event listeners and window exports
setupEventListeners();
setupWindowExports();
