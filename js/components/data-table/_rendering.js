/**
 * Data Table Rendering Module
 * Handles rendering of table body and cell formatting
 */

import { formatCurrency, formatNumber, formatDate } from '../../modules/helpers.js';
import { createRowCheckbox } from './_selection.js';

/**
 * Format cell value based on column type and formatters
 * @param {*} value - Raw cell value
 * @param {object} row - Row data object
 * @param {object} col - Column definition
 * @param {object} formatters - Custom formatters
 * @returns {*} Formatted value
 */
export function formatCellValue(value, row, col, formatters) {
    // Apply formatter
    if (col.formatter) {
        return col.formatter(value, row);
    } else if (formatters[col.type]) {
        return formatters[col.type](value, row);
    } else if (col.type === 'currency') {
        return formatCurrency(value);
    } else if (col.type === 'number') {
        return formatNumber(value);
    } else if (col.type === 'date') {
        return formatDate(value);
    } else if (col.type === 'boolean') {
        return value ? 'Ja' : 'Nein';
    }
    return value;
}

/**
 * Create table cell element
 * @param {*} value - Cell value
 * @param {object} row - Row data object
 * @param {number} rowIndex - Row index
 * @param {object} col - Column definition
 * @returns {HTMLElement} Table data cell
 */
export function createTableCell(value, row, rowIndex, col) {
    const td = document.createElement('td');
    td.style.cssText = `
        padding: 12px 16px;
        border-bottom: 1px solid #E2E8F0;
        text-align: ${col.align || 'left'};
        font-size: 14px;
        color: #0F172A;
    `;

    // Render cell
    if (col.render) {
        const content = col.render(value, row, rowIndex);
        if (typeof content === 'string') {
            td.innerHTML = content;
        } else if (content instanceof Element) {
            td.appendChild(content);
        }
    } else {
        td.textContent = value ?? '';
    }

    return td;
}

/**
 * Create table row element
 * @param {object} row - Row data
 * @param {number} rowIndex - Row index
 * @param {Array} columns - Column definitions
 * @param {object} options - Row options (striped, hoverable, selectable, onRowClick, etc.)
 * @param {object} state - Table state object
 * @param {object} instance - Table instance
 * @param {object} formatters - Custom formatters
 * @returns {HTMLElement} Table row element
 */
export function createTableRow(row, rowIndex, columns, options, state, instance, formatters) {
    const { striped, hoverable, selectable, onRowClick, onSelectionChange } = options;

    const tr = document.createElement('tr');
    tr.style.cssText = `
        ${striped && rowIndex % 2 === 1 ? 'background: #F8FAFC;' : ''}
        ${hoverable ? 'transition: background 0.15s ease;' : ''}
        ${onRowClick ? 'cursor: pointer;' : ''}
    `;

    if (hoverable) {
        tr.addEventListener('mouseenter', () => {
            tr.style.background = '#F1F5F9';
        });
        tr.addEventListener('mouseleave', () => {
            tr.style.background = striped && rowIndex % 2 === 1 ? '#F8FAFC' : '';
        });
    }

    if (onRowClick) {
        tr.addEventListener('click', () => onRowClick(row, rowIndex));
    }

    // Selection cell
    if (selectable) {
        const selectTd = createRowCheckbox(rowIndex, state, instance, onSelectionChange);
        tr.appendChild(selectTd);
    }

    // Data cells
    columns.forEach(col => {
        let value = row[col.key];
        value = formatCellValue(value, row, col, formatters);
        const td = createTableCell(value, row, rowIndex, col);
        tr.appendChild(td);
    });

    return tr;
}

/**
 * Render table body
 * @param {HTMLElement} tbody - Table body element
 * @param {object} state - Table state object
 * @param {Array} columns - Column definitions
 * @param {object} options - Table options
 * @param {object} instance - Table instance
 */
export function renderTableBody(tbody, state, columns, options, instance) {
    const { selectable, emptyMessage, formatters } = options;

    tbody.innerHTML = '';

    if (state.displayData.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = columns.length + (selectable ? 1 : 0);
        emptyCell.style.cssText = `
            padding: 48px;
            text-align: center;
            color: #94A3B8;
        `;
        emptyCell.textContent = emptyMessage;
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
        return;
    }

    state.displayData.forEach((row, rowIndex) => {
        const tr = createTableRow(row, rowIndex, columns, options, state, instance, formatters);
        tbody.appendChild(tr);
    });
}
