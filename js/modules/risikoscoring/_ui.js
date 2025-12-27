/**
 * UI Toggle Functions for Risikoscoring Module
 * Handles UI interactions like expanding sections and switching tabs
 */

import { getElement } from './_helpers.js';
import { distributionData } from './_state.js';
import { initializeDistributionData } from './_distribution.js';
import { drawDistributionChart, setupChartInteraction } from './_chart.js';
import { updateStatisticsTable, updateKPIs } from './_kpis.js';

/**
 * Toggles expansion of a collapsible section
 * @param {string} section - Section ID
 */
export const toggleExpand = (section) => {
    const content = getElement(section + 'Content');
    content?.classList.toggle('expanded');
    event.target.classList.toggle('expanded');
};

/**
 * Toggles expansion of a segment
 * @param {string} segmentId - Segment ID
 */
export const toggleSegment = (segmentId) => {
    const content = getElement(segmentId + 'Content');
    const arrow = event.currentTarget.querySelector('.expand-arrow');
    content?.classList.toggle('expanded');
    if (arrow) arrow.style.transform = content?.classList.contains('expanded') ? 'rotate(90deg)' : 'rotate(0deg)';
};

/**
 * Switches between Risikoscoring tabs
 * @param {Event} event - Click event
 * @param {string} tabName - Tab name to switch to
 */
export const switchRsTab = (event, tabName) => {
    document.querySelectorAll('.rs-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.rs-tab-content').forEach(content => content.classList.remove('active'));
    event.target.classList.add('active');
    getElement('rs-' + tabName)?.classList.add('active');

    if (tabName === 'unternehmen') {
        if (!distributionData?.alle) initializeDistributionData();
        drawDistributionChart();
        updateStatisticsTable();
        updateKPIs();
        const canvas = getElement('distributionChart');
        if (canvas && !canvas.interactionSetup) { setupChartInteraction(); canvas.interactionSetup = true; }
    }
};
