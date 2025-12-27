/**
 * Data Table DOM Module
 * Handles creation of table structure and DOM elements
 */

import { createFilterUI } from './_filtering.js';
import { createPageSizeSelector } from './_pagination.js';
import { createSortableHeader } from './_sorting.js';
import { createSelectAllHeader } from './_selection.js';

/**
 * Create main table wrapper
 * @returns {HTMLElement} Wrapper element
 */
export function createWrapper() {
    const wrapper = document.createElement('div');
    wrapper.className = 'data-table-wrapper';
    wrapper.style.cssText = `
        background: white;
        border-radius: 8px;
        overflow: hidden;
    `;
    return wrapper;
}

/**
 * Create toolbar with filter and page size controls
 * @param {object} options - Table options
 * @param {object} state - Table state object
 * @param {object} instance - Table instance
 * @returns {HTMLElement} Toolbar element
 */
export function createToolbar(options, state, instance) {
    const { filterable, pageSizes } = options;

    const toolbar = document.createElement('div');
    toolbar.className = 'data-table-toolbar';
    toolbar.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid #E2E8F0;
        gap: 16px;
        flex-wrap: wrap;
    `;

    // Filter input
    if (filterable) {
        const filterWrapper = createFilterUI(state, instance);
        toolbar.appendChild(filterWrapper);
    }

    // Page size selector
    const pageSizeWrapper = createPageSizeSelector(pageSizes, state, instance);
    toolbar.appendChild(pageSizeWrapper);

    return toolbar;
}

/**
 * Create table element with header
 * @param {Array} columns - Column definitions
 * @param {object} options - Table options
 * @param {object} state - Table state object
 * @param {object} instance - Table instance
 * @returns {object} Table elements (container, table, tbody)
 */
export function createTable(columns, options, state, instance) {
    const { sortable, selectable, onSelectionChange } = options;

    // Table container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'data-table-container';
    tableContainer.style.cssText = `
        overflow-x: auto;
    `;

    // Table
    const table = document.createElement('table');
    table.className = 'data-table';
    table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
    `;

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Selection column
    if (selectable) {
        const selectAllTh = createSelectAllHeader(state, instance, onSelectionChange);
        headerRow.appendChild(selectAllTh);
    }

    // Column headers
    columns.forEach((col) => {
        const th = createSortableHeader(col, state, instance, sortable);
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    tableContainer.appendChild(table);

    return { tableContainer, table, tbody };
}

/**
 * Create pagination container
 * @returns {HTMLElement} Pagination element
 */
export function createPaginationContainer() {
    const pagination = document.createElement('div');
    pagination.className = 'data-table-pagination';
    pagination.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-top: 1px solid #E2E8F0;
        font-size: 14px;
        color: #64748B;
    `;
    return pagination;
}
