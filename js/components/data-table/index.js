/**
 * Data Table Component
 * Reusable sortable, filterable data tables
 */

import { createWrapper, createToolbar, createTable, createPaginationContainer } from './_dom.js';
import { filterData } from './_filtering.js';
import { sortData } from './_sorting.js';
import { renderPagination, getPaginatedData } from './_pagination.js';
import { renderTableBody } from './_rendering.js';

/**
 * Create data table
 * @param {HTMLElement|string} container - Container element or selector
 * @param {object} options - Table options
 * @returns {object} Table instance
 */
export function create(container, options = {}) {
    const containerEl = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!containerEl) {
        console.error('Table container not found');
        return null;
    }

    const {
        columns = [],
        data = [],
        pageSize = 10,
        pageSizes = [10, 25, 50, 100],
        sortable = true,
        filterable = true,
        selectable = false,
        striped = true,
        hoverable = true,
        emptyMessage = 'Keine Daten vorhanden',
        onRowClick = null,
        onSelectionChange = null,
        formatters = {}
    } = options;

    // State
    const state = {
        currentData: [...data],
        filteredData: [...data],
        displayData: [],
        currentPage: 1,
        currentPageSize: pageSize,
        sortColumn: null,
        sortDirection: 'asc',
        filterValue: '',
        selectedRows: new Set()
    };

    // Create table structure
    const wrapper = createWrapper();
    const toolbar = createToolbar({ filterable, pageSizes }, state, instance);
    wrapper.appendChild(toolbar);

    const { tableContainer, table, tbody } = createTable(
        columns,
        { sortable, selectable, onSelectionChange },
        state,
        instance
    );
    wrapper.appendChild(tableContainer);

    const pagination = createPaginationContainer();
    wrapper.appendChild(pagination);

    containerEl.innerHTML = '';
    containerEl.appendChild(wrapper);

    // Instance methods
    const instance = {
        wrapper,
        table,

        /**
         * Render table with current state
         */
        render() {
            // Calculate display data
            state.displayData = getPaginatedData(
                state.filteredData,
                state.currentPage,
                state.currentPageSize
            );

            const renderOptions = {
                striped,
                hoverable,
                selectable,
                emptyMessage,
                onRowClick,
                onSelectionChange,
                formatters
            };

            renderTableBody(tbody, state, columns, renderOptions, instance);
            renderPagination(pagination, state, instance);
        },

        /**
         * Set new data
         * @param {Array} newData - New data array
         */
        setData(newData) {
            state.currentData = [...newData];
            state.filteredData = [...newData];
            state.currentPage = 1;
            state.selectedRows.clear();
            this.filter();
        },

        /**
         * Get current data
         * @returns {Array} Current data
         */
        getData() {
            return [...state.currentData];
        },

        /**
         * Get filtered data
         * @returns {Array} Filtered data
         */
        getFilteredData() {
            return [...state.filteredData];
        },

        /**
         * Filter data based on current filter value
         */
        filter() {
            state.filteredData = filterData(
                state.currentData,
                state.filterValue,
                columns
            );
            state.currentPage = 1;
            this.sort(false);
        },

        /**
         * Sort filtered data
         * @param {boolean} render - Whether to render after sorting
         */
        sort(render = true) {
            state.filteredData = sortData(
                state.filteredData,
                state.sortColumn,
                state.sortDirection
            );

            if (render) this.render();
        },

        /**
         * Get selected rows
         * @returns {Array} Selected row data
         */
        getSelectedRows() {
            return Array.from(state.selectedRows).map(i => state.displayData[i]);
        },

        /**
         * Clear row selection
         */
        clearSelection() {
            state.selectedRows.clear();
            this.render();
        },

        /**
         * Navigate to specific page
         * @param {number} page - Page number
         */
        goToPage(page) {
            const totalPages = Math.ceil(state.filteredData.length / state.currentPageSize);
            state.currentPage = Math.max(1, Math.min(page, totalPages));
            this.render();
        },

        /**
         * Refresh table display
         */
        refresh() {
            this.render();
        }
    };

    // Initial render
    instance.render();

    return instance;
}

// Export default
export default { create };
