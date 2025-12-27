/**
 * Provisionssimulation State Management
 * Manages simulation state and chart instances
 */

/**
 * Main simulation state
 * @type {Object}
 */
export const provisionState = {
    currentModel: 'comparison',
    segments: {
        leben: { neugeschaeft: 150000, bestand: 450000, storno: 8 },
        kranken: { neugeschaeft: 80000, bestand: 220000, storno: 5 },
        schaden: { neugeschaeft: 120000, bestand: 380000, storno: 12 }
    },
    years: 3
};

/**
 * Chart instance for provision comparison
 * @type {Chart|null}
 */
export let provisionChart = null;

/**
 * Chart instance for company projection
 * @type {Chart|null}
 */
export let companyProjectionChart = null;

/**
 * Set the provision chart instance
 * @param {Chart} chart - Chart.js instance
 */
export const setProvisionChart = (chart) => {
    provisionChart = chart;
};

/**
 * Set the company projection chart instance
 * @param {Chart} chart - Chart.js instance
 */
export const setCompanyProjectionChart = (chart) => {
    companyProjectionChart = chart;
};
