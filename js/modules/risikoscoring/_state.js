/**
 * State Management for Risikoscoring Module
 * Centralized state for distribution data and UI state
 */

/**
 * Distribution data for all silo types
 * @type {Object.<string, number[]>}
 */
export let distributionData = {};

/**
 * Modified distribution data after applying measures
 * @type {Object.<string, number[]>}
 */
export let modifiedDistributionData = {};

/**
 * Currently selected silo type
 * @type {string}
 */
export let currentSilo = 'alle';

/**
 * Whether measures are currently active
 * @type {boolean}
 */
export let measuresActive = false;

/**
 * Currently selected improvement measures
 * @type {string[]}
 */
export let selectedMeasures = [];

/**
 * Updates the distribution data
 * @param {Object.<string, number[]>} data - New distribution data
 */
export const setDistributionData = (data) => {
    distributionData = data;
};

/**
 * Updates the modified distribution data
 * @param {Object.<string, number[]>} data - New modified distribution data
 */
export const setModifiedDistributionData = (data) => {
    modifiedDistributionData = data;
};

/**
 * Updates the current silo selection
 * @param {string} silo - New silo type
 */
export const setCurrentSilo = (silo) => {
    currentSilo = silo;
};

/**
 * Updates the measures active state
 * @param {boolean} active - Whether measures are active
 */
export const setMeasuresActive = (active) => {
    measuresActive = active;
};

/**
 * Updates the selected measures
 * @param {string[]} measures - Array of selected measure names
 */
export const setSelectedMeasures = (measures) => {
    selectedMeasures = measures;
};
