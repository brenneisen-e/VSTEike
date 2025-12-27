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

    // Create instance object first (to avoid temporal dead zone)
    const instance = {
        wrapper: null,
        table: null,
        render: null,
        setData: null,
        getData: null,
        getFilteredData: null,
        filter: null,
        sort: null,
        getSelectedRows: null,
        clearSelection: null,
        goToPage: null,
        refresh: null
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

    // Populate instance methods
    instance.wrapper = wrapper;
    instance.table = table;

    instance.render = function() {
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
    };

    instance.setData = function(newData) {
        state.currentData = [...newData];
        state.filteredData = [...newData];
        state.currentPage = 1;
        state.selectedRows.clear();
        this.filter();
    };

    instance.getData = function() {
        return [...state.currentData];
    };

    instance.getFilteredData = function() {
        return [...state.filteredData];
    };

    instance.filter = function() {
        state.filteredData = filterData(
            state.currentData,
            state.filterValue,
            columns
        );
        state.currentPage = 1;
        this.sort(false);
    };

    instance.sort = function(render = true) {
        state.filteredData = sortData(
            state.filteredData,
            state.sortColumn,
            state.sortDirection
        );

        if (render) this.render();
    };

    instance.getSelectedRows = function() {
        return Array.from(state.selectedRows).map(i => state.displayData[i]);
    };

    instance.clearSelection = function() {
        state.selectedRows.clear();
        this.render();
    };

    instance.goToPage = function(page) {
        const totalPages = Math.ceil(state.filteredData.length / state.currentPageSize);
        state.currentPage = Math.max(1, Math.min(page, totalPages));
        this.render();
    };

    instance.refresh = function() {
        this.render();
    };

    // Initial render
    instance.render();

    return instance;
}

// Export default
export default { create };
