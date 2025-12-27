/**
 * Provisionssimulation Helper Functions
 * Utility functions for formatting and DOM manipulation
 */

import { SEGMENT_ICONS } from './_constants.js';

/**
 * Format a number as currency
 * @param {number} value - The value to format
 * @param {boolean} compact - Whether to use compact notation (e.g., 1.2M)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, compact = false) => {
    if (compact && Math.abs(value) >= 1000) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
            notation: 'compact'
        }).format(value);
    }
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(value);
};

/**
 * Update a DOM element with a value
 * @param {string} id - Element ID
 * @param {string} value - Value to set (HTML if contains tags, otherwise text)
 */
export const updateElement = (id, value) => {
    const el = document.getElementById(id);
    if (el) {
        value.includes?.('<') ? (el.innerHTML = value) : (el.textContent = value);
    }
};

/**
 * Get the SVG icon path for a segment
 * @param {string} segment - Segment name (leben, kranken, schaden)
 * @returns {string} SVG path data
 */
export const getSegmentIcon = (segment) => SEGMENT_ICONS[segment] ?? SEGMENT_ICONS.leben;
