/**
 * Banken Chat Module - Helper Functions
 * Utility functions for formatting and UI generation
 */

import { setLastChatQueryResult } from './_state.js';

/**
 * Format a number as German currency
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => value.toLocaleString('de-DE');

/**
 * Generate HTML for follow-up suggestion buttons
 * @returns {string} HTML string with follow-up suggestions
 */
export const getFollowUpSuggestions = () => `
    <div class="chat-followup-suggestions">
        <span class="followup-label">Weitere Abfragen:</span>
        <div class="followup-buttons">
            <button class="example-btn" data-question="Kunden mit höchster Restforderung">Höchste Restforderung</button>
            <button class="example-btn" data-question="Kunden mit höchster Rückzahlungschance">Rückzahlungschance</button>
            <button class="example-btn" data-question="Kunden mit längster Verzugsdauer">Längste Verzugsdauer</button>
            <button class="example-btn" data-question="Neue Fälle dieser Woche">Neue Fälle</button>
            <button class="example-btn" data-question="Vereinbarungen in Bearbeitung">Vereinbarungen</button>
            <button class="example-btn" data-question="Portfolio-Übersicht">Portfolio</button>
        </div>
    </div>
`;

/**
 * Generate HTML for export buttons (Excel and PDF)
 * @param {Object} data - Data to export
 * @param {string} title - Title for the export
 * @returns {string} HTML string with export buttons
 */
export const getExportButtons = (data, title) => {
    setLastChatQueryResult({ data, title });
    return `
        <div class="chat-export-buttons">
            <button class="chat-export-btn excel" onclick="exportChatToExcel(lastChatQueryResult.data, '${title}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Excel
            </button>
            <button class="chat-export-btn pdf" onclick="exportChatToPdf(lastChatQueryResult.data, '${title}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                PDF
            </button>
        </div>
    `;
};
