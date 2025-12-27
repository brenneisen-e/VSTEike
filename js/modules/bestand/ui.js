/**
 * Bestand UI Module (ES2024)
 * User Interface Komponenten und Rendering
 *
 * Dieser zentrale UI-Modul importiert und exportiert alle UI-Funktionalitäten
 * aus spezialisierten Submodulen für bessere Wartbarkeit und Organisation.
 */

// Constants
export {
    STATUS_ICONS,
    STATUS_LABELS,
    WORKFLOW_STEPS,
    STATUS_ORDER
} from './_ui-constants.js';

// Helpers
export {
    escapeHtml,
    formatDate,
    parseGermanDate,
    formatDateTime,
    truncateText,
    escapeRegex,
    highlightKeywords,
    convertGermanDateToISO
} from './_ui-helpers.js';

// State & Initialization
export {
    init,
    getElements as elements
} from './_ui-state.js';

// Notifications
export {
    showToast,
    showDropOverlay
} from './_ui-notifications.js';

// Navigation
export {
    updateNavCounts,
    switchView
} from './_ui-navigation.js';

// Dashboard
export {
    renderDashboardKPIs,
    renderSpartenList,
    getActivityFilterValues,
    renderRecentActivity,
    renderImportExportHistory,
    renderDashboardSearchResults
} from './_ui-dashboard.js';

// Tiles
export {
    renderCaseTiles
} from './_ui-tiles.js';

// Tables
export {
    renderMaklerTable,
    renderEmailsTable
} from './_ui-tables.js';

// Modals
export {
    openCaseModal,
    closeCaseModal,
    openMaklerModal,
    closeMaklerModal,
    openExportModal,
    closeExportModal,
    getExporterName
} from './_ui-modals.js';

// Validation Modal
export {
    openValidationModal,
    closeValidationModal,
    nextValidationCase,
    getCurrentValidationCase,
    hasMoreValidationCases,
    getValidationFormData,
    toggleRejectSection,
    hasRejectReason,
    toggleEmailBody
} from './_ui-validation.js';

// Forms
export {
    getCaseFormData,
    getVorgaengeFilterValues,
    getMaklerSearchValue,
    getEmailFilterValues
} from './_ui-forms.js';

// Render Helpers (exported for advanced use cases)
export {
    renderWorkflowTimeline,
    renderKeywords,
    renderLinkedCases,
    renderEmailTimeline,
    highlightMissingFields,
    clearMissingFieldHighlights
} from './_ui-render-helpers.js';
