/**
 * Risikoscoring Module (ES2024)
 * Vermittler-Scoring und Vertriebssteuerung
 *
 * Main entry point - imports and re-exports all submodules
 */

// Import state management
import {
    distributionData,
    modifiedDistributionData,
    currentSilo,
    measuresActive,
    selectedMeasures,
    setDistributionData,
    setModifiedDistributionData,
    setCurrentSilo,
    setMeasuresActive,
    setSelectedMeasures
} from './_state.js';

// Import constants
import {
    vermittlerTypRanges,
    measureEffects
} from './_constants.js';

// Import helpers
import {
    formatCurrency,
    getElement,
    getValue,
    setValue,
    setText
} from './_helpers.js';

// Import distribution functions
import {
    generateDistribution,
    combineDistributions,
    initializeDistributionData,
    applyMeasuresToDistribution
} from './_distribution.js';

// Import statistics
import {
    estimateNeugeschaeft,
    estimateBestand,
    estimateStorno,
    estimateCrossSelling,
    estimateCombinedRatio,
    estimateErtrag,
    calculateStats
} from './_statistics.js';

// Import chart functions
import {
    drawDistributionChart,
    setupChartInteraction
} from './_chart.js';

// Import KPI and table functions
import {
    updateKPIs,
    updateStatisticsTable,
    updateComparison
} from './_kpis.js';

// Import silo and measures
import {
    selectSilo,
    toggleMeasures,
    updateMeasures
} from './_silo.js';

// Import scoring functions
import {
    calculatePerformanceScore,
    calculateRiskScore,
    calculateStabilityScore,
    calculateCustomerScore,
    calculateProfitScore,
    updateTrafficLight,
    updateScoring
} from './_scoring.js';

// Import slider functions
import {
    updateProductsProportionally,
    updateMainSlider,
    updateSegmentValues,
    updateProductValues
} from './_sliders.js';

// Import UI functions
import {
    toggleExpand,
    toggleSegment,
    switchRsTab
} from './_ui.js';

// Import profile functions
import {
    loadVermittlerProfile
} from './_profiles.js';

// Import initialization
import {
    initRisikoscoring
} from './_init.js';

// ========================================
// RE-EXPORTS
// ========================================

// Export public API
export {
    // Distribution
    initializeDistributionData,
    drawDistributionChart,
    setupChartInteraction,

    // KPIs and Tables
    updateKPIs,
    updateStatisticsTable,

    // Silo and Measures
    selectSilo,
    toggleMeasures,
    updateMeasures,

    // Scoring
    updateScoring,

    // Sliders
    updateMainSlider,
    updateSegmentValues,
    updateProductValues,

    // UI
    toggleExpand,
    toggleSegment,
    switchRsTab,

    // Profiles
    loadVermittlerProfile,

    // Initialization
    initRisikoscoring
};

// ========================================
// WINDOW EXPORTS (for backwards compatibility)
// ========================================

Object.assign(window, {
    switchRsTab,
    switchTab: switchRsTab,
    loadVermittlerProfile,
    toggleExpand,
    toggleSegment,
    updateMainSlider,
    updateSegmentValues,
    updateProductValues,
    updateScoring,
    selectSilo,
    toggleMeasures,
    updateMeasures,
    initRisikoscoring
});
