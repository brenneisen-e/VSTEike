/**
 * Provisionssimulation Action Functions
 * User action handlers and main operations
 */

import { provisionState, provisionChart, companyProjectionChart } from './_state.js';
import { formatCurrency } from './_helpers.js';
import { calculateProvisions, getCurrentReversTier } from './_calculations.js';
import { updateProvisionSliders, updateReversTier, updateCompanyCostDisplays } from './_ui.js';
import { renderProvisionChart, renderCompanyProjectionChart } from './_charts.js';

/**
 * Handle slider changes for provision segments
 * @param {string} segment - Segment name (leben, kranken, schaden)
 * @param {string} type - Field type (neugeschaeft, bestand, storno)
 * @param {number|string} value - New value
 */
export const handleProvisionSlider = (segment, type, value) => {
    provisionState.segments[segment][type] = parseFloat(value);
    updateProvisionSliders();
    calculateProvisions();
    renderProvisionChart();
    updateReversTier();
};

/**
 * Export provision simulation report as text file
 */
export const exportProvisionReport = () => {
    const results = calculateProvisions();
    const tier = getCurrentReversTier();

    let report = `PROVISIONSSIMULATION - REPORT\n==============================\n\n`;
    report += `Datum: ${new Date().toLocaleDateString('de-DE')}\n`;
    report += `Simulationszeitraum: ${provisionState.years} Jahre\n`;
    report += `Revers-Stufe: ${tier.label} (${(tier.factor * 100).toFixed(0)}%)\n\n`;

    report += `ERGEBNIS\n--------\n`;
    report += `AlphaProtect: ${formatCurrency(results.alpha.total)}\n`;
    report += `BetaCare: ${formatCurrency(results.beta.total)}\n`;
    report += `Differenz: ${formatCurrency(results.delta.total)}\n\n`;

    report += `DETAILS PRO SEGMENT\n-------------------\n`;
    Object.keys(provisionState.segments).forEach(segment => {
        const data = provisionState.segments[segment];
        report += `${segment.toUpperCase()}:\n`;
        report += `  Neugeschäft: ${formatCurrency(data.neugeschaeft)}\n`;
        report += `  Bestand: ${formatCurrency(data.bestand)}\n`;
        report += `  Stornoquote: ${data.storno}%\n`;
        report += `  Alpha: ${formatCurrency(results.alpha[segment].total)}\n`;
        report += `  Beta: ${formatCurrency(results.beta[segment].total)}\n\n`;
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `provision-simulation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    window.showNotification?.('Report wurde exportiert', 'success');
};

/**
 * Reset provision simulation to default values
 */
export const resetProvisionSimulation = () => {
    provisionState.segments = {
        leben: { neugeschaeft: 150000, bestand: 450000, storno: 8 },
        kranken: { neugeschaeft: 80000, bestand: 220000, storno: 5 },
        schaden: { neugeschaeft: 120000, bestand: 380000, storno: 12 }
    };

    Object.keys(provisionState.segments).forEach(segment => {
        const data = provisionState.segments[segment];
        const neuSlider = document.getElementById(`${segment}Neugeschaeft`);
        const bestSlider = document.getElementById(`${segment}Bestand`);
        const stornoSlider = document.getElementById(`${segment}Storno`);

        if (neuSlider) neuSlider.value = data.neugeschaeft;
        if (bestSlider) bestSlider.value = data.bestand;
        if (stornoSlider) stornoSlider.value = data.storno;
    });

    updateProvisionSliders();
    calculateProvisions();
    renderProvisionChart();
    updateReversTier();

    window.showNotification?.('Simulation zurückgesetzt', 'info');
};

/**
 * Toggle fullscreen mode for provision simulation
 */
export const toggleProvisionFullscreen = () => {
    const section = document.getElementById('provisionSimulation');
    if (section) {
        section.classList.toggle('fullscreen');
        setTimeout(() => {
            provisionChart?.resize();
            companyProjectionChart?.resize();
        }, 100);
    }
};

/**
 * Switch between agent and company perspectives
 * @param {string} perspective - 'vermittler' or 'unternehmen'
 */
export const switchPerspective = (perspective) => {
    document.querySelectorAll('.perspective-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.perspective-btn[onclick="switchPerspective('${perspective}')"]`)?.classList.add('active');

    document.querySelectorAll('.perspective-content').forEach(content => content.classList.remove('active'));

    if (perspective === 'vermittler') {
        document.getElementById('vermittlerPerspective')?.classList.add('active');
    } else {
        document.getElementById('unternehmenPerspective')?.classList.add('active');
        initCompanyView();
    }
};

/**
 * Update migration rate slider display
 */
export const updateMigrationDisplay = () => {
    const slider = document.getElementById('companyMigrationRate');
    const display = document.getElementById('migrationRateValue');
    if (slider && display) display.textContent = slider.value + '%';
};

/**
 * Initialize company view with calculations and charts
 */
export const initCompanyView = () => {
    updateCompanyCostDisplays();
    renderCompanyProjectionChart();
};

/**
 * Initialize provision simulation on page load
 */
export const initProvisionSimulation = () => {
    updateProvisionSliders();
    calculateProvisions();
    renderProvisionChart();
    updateReversTier();
};
