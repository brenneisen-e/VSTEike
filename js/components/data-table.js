/**
 * Data Table Component
 * Reusable sortable, filterable data tables
 */

import { formatCurrency, formatNumber, formatDate } from '../modules/helpers.js';

// ========================================
// DATA TABLE
// ========================================

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
    let currentData = [...data];
    let filteredData = [...data];
    let displayData = [];
    let currentPage = 1;
    let currentPageSize = pageSize;
    let sortColumn = null;
    let sortDirection = 'asc';
    let filterValue = '';
    let selectedRows = new Set();

    // Create table structure
    const wrapper = document.createElement('div');
    wrapper.className = 'data-table-wrapper';
    wrapper.style.cssText = `
        background: white;
        border-radius: 8px;
        overflow: hidden;
    `;

    // Toolbar
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
        const filterWrapper = document.createElement('div');
        filterWrapper.style.cssText = `
            position: relative;
            flex: 1;
            max-width: 300px;
        `;

        const filterInput = document.createElement('input');
        filterInput.type = 'text';
        filterInput.placeholder = 'Suchen...';
        filterInput.className = 'data-table-filter';
        filterInput.style.cssText = `
            width: 100%;
            padding: 8px 12px 8px 36px;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.15s ease;
        `;

        const searchIcon = document.createElement('span');
        searchIcon.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
        `;
        searchIcon.style.cssText = `
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #94A3B8;
        `;

        filterWrapper.appendChild(searchIcon);
        filterWrapper.appendChild(filterInput);
        toolbar.appendChild(filterWrapper);

        filterInput.addEventListener('input', (e) => {
            filterValue = e.target.value.toLowerCase();
            instance.filter();
        });
    }

    // Page size selector
    const pageSizeWrapper = document.createElement('div');
    pageSizeWrapper.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    const pageSizeLabel = document.createElement('span');
    pageSizeLabel.textContent = 'Zeigen:';
    pageSizeLabel.style.cssText = `
        font-size: 14px;
        color: #64748B;
    `;

    const pageSizeSelect = document.createElement('select');
    pageSizeSelect.className = 'data-table-page-size';
    pageSizeSelect.style.cssText = `
        padding: 6px 10px;
        border: 1px solid #E2E8F0;
        border-radius: 6px;
        font-size: 14px;
        background: white;
        cursor: pointer;
    `;

    pageSizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        if (size === currentPageSize) option.selected = true;
        pageSizeSelect.appendChild(option);
    });

    pageSizeSelect.addEventListener('change', (e) => {
        currentPageSize = parseInt(e.target.value);
        currentPage = 1;
        instance.render();
    });

    pageSizeWrapper.appendChild(pageSizeLabel);
    pageSizeWrapper.appendChild(pageSizeSelect);
    toolbar.appendChild(pageSizeWrapper);

    wrapper.appendChild(toolbar);

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
        const selectAllTh = document.createElement('th');
        selectAllTh.style.cssText = `
            width: 40px;
            padding: 12px;
            text-align: center;
            background: #F8FAFC;
            border-bottom: 1px solid #E2E8F0;
        `;

        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.style.cssText = `cursor: pointer;`;
        selectAllCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                displayData.forEach((_, i) => selectedRows.add(i));
            } else {
                selectedRows.clear();
            }
            instance.render();
            if (onSelectionChange) onSelectionChange(instance.getSelectedRows());
        });

        selectAllTh.appendChild(selectAllCheckbox);
        headerRow.appendChild(selectAllTh);
    }

    // Column headers
    columns.forEach((col, colIndex) => {
        const th = document.createElement('th');
        th.style.cssText = `
            padding: 12px 16px;
            text-align: ${col.align || 'left'};
            background: #F8FAFC;
            border-bottom: 1px solid #E2E8F0;
            font-weight: 600;
            font-size: 12px;
            color: #64748B;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
            ${col.width ? `width: ${col.width};` : ''}
            ${sortable && col.sortable !== false ? 'cursor: pointer;' : ''}
        `;

        const headerContent = document.createElement('div');
        headerContent.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: ${col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start'};
        `;

        headerContent.textContent = col.label || col.key;

        if (sortable && col.sortable !== false) {
            const sortIcon = document.createElement('span');
            sortIcon.className = 'sort-icon';
            sortIcon.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.3;">
                    <path d="M7 10l5-5 5 5M7 14l5 5 5-5"/>
                </svg>
            `;
            headerContent.appendChild(sortIcon);

            th.addEventListener('click', () => {
                if (sortColumn === col.key) {
                    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    sortColumn = col.key;
                    sortDirection = 'asc';
                }
                instance.sort();
            });
        }

        th.appendChild(headerContent);
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    tableContainer.appendChild(table);
    wrapper.appendChild(tableContainer);

    // Pagination
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
    wrapper.appendChild(pagination);

    containerEl.innerHTML = '';
    containerEl.appendChild(wrapper);

    // Render function
    function renderBody() {
        tbody.innerHTML = '';

        if (displayData.length === 0) {
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

        displayData.forEach((row, rowIndex) => {
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
                const selectTd = document.createElement('td');
                selectTd.style.cssText = `
                    padding: 12px;
                    text-align: center;
                    border-bottom: 1px solid #E2E8F0;
                `;

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = selectedRows.has(rowIndex);
                checkbox.style.cssText = `cursor: pointer;`;
                checkbox.addEventListener('click', (e) => e.stopPropagation());
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        selectedRows.add(rowIndex);
                    } else {
                        selectedRows.delete(rowIndex);
                    }
                    if (onSelectionChange) onSelectionChange(instance.getSelectedRows());
                });

                selectTd.appendChild(checkbox);
                tr.appendChild(selectTd);
            }

            // Data cells
            columns.forEach(col => {
                const td = document.createElement('td');
                td.style.cssText = `
                    padding: 12px 16px;
                    border-bottom: 1px solid #E2E8F0;
                    text-align: ${col.align || 'left'};
                    font-size: 14px;
                    color: #0F172A;
                `;

                let value = row[col.key];

                // Apply formatter
                if (col.formatter) {
                    value = col.formatter(value, row);
                } else if (formatters[col.type]) {
                    value = formatters[col.type](value, row);
                } else if (col.type === 'currency') {
                    value = formatCurrency(value);
                } else if (col.type === 'number') {
                    value = formatNumber(value);
                } else if (col.type === 'date') {
                    value = formatDate(value);
                } else if (col.type === 'boolean') {
                    value = value ? 'Ja' : 'Nein';
                }

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

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredData.length / currentPageSize);
        const start = (currentPage - 1) * currentPageSize + 1;
        const end = Math.min(currentPage * currentPageSize, filteredData.length);

        pagination.innerHTML = `
            <span>Zeige ${filteredData.length > 0 ? start : 0} - ${end} von ${filteredData.length} Einträgen</span>
            <div style="display: flex; gap: 8px; align-items: center;">
                <button class="page-btn page-prev" style="
                    padding: 6px 12px;
                    border: 1px solid #E2E8F0;
                    border-radius: 6px;
                    background: white;
                    cursor: pointer;
                    font-size: 14px;
                    ${currentPage === 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}
                " ${currentPage === 1 ? 'disabled' : ''}>Zurück</button>
                <span>Seite ${currentPage} von ${totalPages || 1}</span>
                <button class="page-btn page-next" style="
                    padding: 6px 12px;
                    border: 1px solid #E2E8F0;
                    border-radius: 6px;
                    background: white;
                    cursor: pointer;
                    font-size: 14px;
                    ${currentPage >= totalPages ? 'opacity: 0.5; cursor: not-allowed;' : ''}
                " ${currentPage >= totalPages ? 'disabled' : ''}>Weiter</button>
            </div>
        `;

        pagination.querySelector('.page-prev')?.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                instance.render();
            }
        });

        pagination.querySelector('.page-next')?.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                instance.render();
            }
        });
    }

    // Instance methods
    const instance = {
        wrapper,
        table,

        render() {
            // Calculate display data
            const start = (currentPage - 1) * currentPageSize;
            displayData = filteredData.slice(start, start + currentPageSize);

            renderBody();
            renderPagination();
        },

        setData(newData) {
            currentData = [...newData];
            filteredData = [...newData];
            currentPage = 1;
            selectedRows.clear();
            this.filter();
        },

        getData() {
            return [...currentData];
        },

        getFilteredData() {
            return [...filteredData];
        },

        filter() {
            if (!filterValue) {
                filteredData = [...currentData];
            } else {
                filteredData = currentData.filter(row => {
                    return columns.some(col => {
                        const value = row[col.key];
                        if (value === null || value === undefined) return false;
                        return String(value).toLowerCase().includes(filterValue);
                    });
                });
            }
            currentPage = 1;
            this.sort(false);
        },

        sort(render = true) {
            if (sortColumn) {
                filteredData.sort((a, b) => {
                    let aVal = a[sortColumn];
                    let bVal = b[sortColumn];

                    // Handle nulls
                    if (aVal === null || aVal === undefined) return 1;
                    if (bVal === null || bVal === undefined) return -1;

                    // Numeric comparison
                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                    }

                    // String comparison
                    aVal = String(aVal).toLowerCase();
                    bVal = String(bVal).toLowerCase();
                    const comparison = aVal.localeCompare(bVal, 'de');
                    return sortDirection === 'asc' ? comparison : -comparison;
                });
            }

            if (render) this.render();
        },

        getSelectedRows() {
            return Array.from(selectedRows).map(i => displayData[i]);
        },

        clearSelection() {
            selectedRows.clear();
            this.render();
        },

        goToPage(page) {
            const totalPages = Math.ceil(filteredData.length / currentPageSize);
            currentPage = Math.max(1, Math.min(page, totalPages));
            this.render();
        },

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
