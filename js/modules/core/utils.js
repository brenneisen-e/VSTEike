/**
 * Utilities Module - ES2024
 * Formatting, parsing, and helper functions
 */

import { agentDistributions, bundeslandFactors } from './config.js';

// ========================================
// VALUE FORMATTING
// ========================================

export const formatValue = (value, unit) => {
    if (value === null || typeof value === 'undefined' || isNaN(value)) return '--';
    const numValue = Number(value);

    switch (unit) {
        case 'currency': {
            const absValue = Math.abs(numValue);
            let formatted = '';
            if (absValue >= 1000000000) {
                formatted = '€' + (absValue / 1000000000).toFixed(2) + ' Mrd';
            } else if (absValue >= 1000000) {
                formatted = '€' + (absValue / 1000000).toFixed(1) + ' Mio';
            } else if (absValue >= 1000) {
                formatted = '€' + (absValue / 1000).toFixed(0) + 'k';
            } else {
                formatted = '€' + absValue.toFixed(0);
            }
            return numValue < 0 ? '-' + formatted : formatted;
        }
        case 'percent':
            return numValue.toFixed(1) + '%';
        case 'score':
            return (numValue > 0 ? '+' : '') + Math.round(numValue);
        default:
            return numValue.toFixed(0);
    }
};

// ========================================
// DATE & TIME
// ========================================

const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export const getMonthName = (monthNum) => monthNames[monthNum - 1] ?? '';

// ========================================
// CSV PARSING
// ========================================

export const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];

    const headerMapping = {
        'vermittler_id': 'vermittler_id',
        'vermittlerid': 'vermittler_id',
        'agent_id': 'vermittler_id',
        'agentid': 'vermittler_id'
    };

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
            const value = values[index];
            const normalizedHeader = headerMapping[header] ?? header;

            if (!isNaN(value) && value !== '') {
                row[normalizedHeader] = parseFloat(value);
            } else {
                row[normalizedHeader] = value;
            }
        });
        data.push(row);
    }

    return data;
};

// ========================================
// UI HELPERS
// ========================================

export const toggleDropdown = (dropdownId) => {
    const menu = document.getElementById(dropdownId);
    const allMenus = document.querySelectorAll('.dropdown-menu');

    allMenus.forEach(m => {
        if (m.id !== dropdownId) {
            m.classList.remove('show');
        }
    });

    menu?.classList.toggle('show');
};

// ========================================
// LIBRARY LOADING
// ========================================

export const waitForLibraries = (callback) => {
    const checkInterval = setInterval(() => {
        if (typeof L !== 'undefined' && typeof Chart !== 'undefined') {
            clearInterval(checkInterval);
            callback();
        }
    }, 100);

    setTimeout(() => {
        clearInterval(checkInterval);
        if (typeof L === 'undefined') {
            console.error('Failed to load Leaflet');
            const mapEl = document.getElementById('map');
            if (mapEl) {
                mapEl.innerHTML = '<div style="padding: 2rem; text-align: center; color: #64748b;">Karte konnte nicht geladen werden</div>';
            }
        }
    }, 5000);
};

// ========================================
// AGENT DISTRIBUTION
// ========================================

export const generateAgentDistribution = (kpiId, currentValue) => {
    const state = window.state ?? { selectedStates: new Set(), filters: { silo: 'alle' } };
    let baseDistribution = agentDistributions[kpiId] ?? agentDistributions['neugeschaeft'];

    // Adjust based on selected states
    if (state.selectedStates?.size > 0) {
        const allStatesTotal = Object.values(bundeslandFactors).reduce((sum, f) => sum + f, 0);
        let selectedTotal = 0;
        state.selectedStates.forEach(land => {
            selectedTotal += (bundeslandFactors[land] ?? 1.0);
        });
        const proportion = selectedTotal / allStatesTotal;

        baseDistribution = baseDistribution.map(item => ({
            ...item,
            count: Math.round(item.count * proportion)
        }));
    }

    // Adjust based on silo filter
    if (state.filters?.silo !== 'alle') {
        const siloMultiplier = {
            'Ausschließlichkeit': 1.2,
            'Makler': 0.9,
            'Direktvertrieb': 0.6,
            'Banken': 0.3
        }[state.filters.silo] ?? 1;

        baseDistribution = baseDistribution.map(item => ({
            ...item,
            count: Math.round(item.count * siloMultiplier)
        }));
    }

    return baseDistribution;
};

// ========================================
// WINDOW EXPORTS
// ========================================

Object.assign(window, {
    formatValue,
    getMonthName,
    parseCSV,
    toggleDropdown,
    waitForLibraries,
    generateAgentDistribution
});
