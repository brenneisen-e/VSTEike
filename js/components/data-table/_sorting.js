/**
 * Data Table Sorting Module
 * Handles sortable column headers and sorting logic
 */

/**
 * Create sortable column header
 * @param {object} col - Column definition
 * @param {object} state - Table state object
 * @param {object} instance - Table instance
 * @param {boolean} sortable - Whether table is sortable
 * @returns {HTMLElement} Table header element
 */
export function createSortableHeader(col, state, instance, sortable) {
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
            if (state.sortColumn === col.key) {
                state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortColumn = col.key;
                state.sortDirection = 'asc';
            }
            instance.sort();
        });
    }

    th.appendChild(headerContent);
    return th;
}

/**
 * Sort data by column
 * @param {Array} data - Data to sort
 * @param {string} sortColumn - Column key to sort by
 * @param {string} sortDirection - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted data
 */
export function sortData(data, sortColumn, sortDirection) {
    if (!sortColumn) {
        return data;
    }

    const sortedData = [...data];
    sortedData.sort((a, b) => {
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

    return sortedData;
}
