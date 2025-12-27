/**
 * Helper Functions for Risikoscoring Module
 * Utility functions for DOM manipulation and formatting
 */

/**
 * Formats a numeric value as currency with appropriate suffix (k, M, B)
 * @param {number} value - The numeric value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
    const absValue = Math.abs(value);
    let formatted = absValue >= 1000000000 ? '€' + (absValue / 1000000000).toFixed(1) + 'B' :
                    absValue >= 1000000 ? '€' + (absValue / 1000000).toFixed(0) + 'M' :
                    absValue >= 1000 ? '€' + (absValue / 1000).toFixed(0) + 'k' : '€' + absValue.toFixed(0);
    return value < 0 ? '-' + formatted : formatted;
};

/**
 * Gets a DOM element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} The DOM element or null
 */
export const getElement = (id) => document.getElementById(id);

/**
 * Gets the numeric value from an input element
 * @param {string} id - Element ID
 * @returns {number} Parsed float value or 0
 */
export const getValue = (id) => parseFloat(getElement(id)?.value ?? 0);

/**
 * Sets the value of an input element
 * @param {string} id - Element ID
 * @param {number} val - Value to set
 */
export const setValue = (id, val) => { const el = getElement(id); if (el) el.value = val; };

/**
 * Sets the text content of an element
 * @param {string} id - Element ID
 * @param {string} text - Text to set
 */
export const setText = (id, text) => { const el = getElement(id); if (el) el.textContent = text; };
