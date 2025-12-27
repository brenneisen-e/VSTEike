/**
 * Silo and Measures Management for Risikoscoring Module
 * Handles silo selection and improvement measures
 */

import { getElement } from './_helpers.js';
import { distributionData, modifiedDistributionData, measuresActive, selectedMeasures, setCurrentSilo, setMeasuresActive, setSelectedMeasures, setModifiedDistributionData } from './_state.js';
import { initializeDistributionData, applyMeasuresToDistribution } from './_distribution.js';
import { drawDistributionChart } from './_chart.js';
import { updateStatisticsTable, updateKPIs, updateComparison } from './_kpis.js';

/**
 * Selects a silo for display
 * @param {string} silo - Silo name to select
 */
export const selectSilo = (silo) => {
    if (!distributionData?.alle) initializeDistributionData();
    setCurrentSilo(silo);
    document.querySelectorAll('.toggle-button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (measuresActive && selectedMeasures.length > 0) updateMeasures();
    else { drawDistributionChart(); updateStatisticsTable(); updateKPIs(); }
};

/**
 * Toggles the measures panel on/off
 */
export const toggleMeasures = () => {
    const button = event.target.closest('.measures-toggle-button');
    const content = getElement('measuresContent');
    const active = !measuresActive;
    setMeasuresActive(active);

    if (active) {
        button.classList.add('active');
        content.classList.add('active');
        button.innerHTML = '<span>✅</span><span>Maßnahmen aktiv</span>';
        if (selectedMeasures.length > 0) updateMeasures();
    } else {
        button.classList.remove('active');
        content.classList.remove('active');
        button.innerHTML = '<span>🎯</span><span>Maßnahmen aktivieren</span>';
        document.querySelectorAll('.measure-checkbox input').forEach(cb => { cb.checked = false; });
        setSelectedMeasures([]);
        setModifiedDistributionData({});
        getElement('comparisonContainer').style.display = 'none';
        drawDistributionChart(); updateStatisticsTable(); updateKPIs();
    }
};

/**
 * Updates the distribution based on selected measures
 */
export const updateMeasures = () => {
    const measures = Array.from(document.querySelectorAll('.measure-checkbox input:checked')).map(cb => cb.value);
    setSelectedMeasures(measures);

    if (measures.length > 0 && measuresActive) {
        const modified = {};
        Object.keys(distributionData).forEach(silo => { modified[silo] = applyMeasuresToDistribution(distributionData[silo]); });
        setModifiedDistributionData(modified);
        getElement('comparisonContainer').style.display = 'block';
        updateComparison();
    } else {
        getElement('comparisonContainer').style.display = 'none';
        setModifiedDistributionData({});
    }

    drawDistributionChart(); updateStatisticsTable(); updateKPIs();
};
