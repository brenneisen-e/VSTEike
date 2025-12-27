/**
 * Data Table Filtering Module
 * Handles filter UI and filtering logic
 */

/**
 * Create filter input UI
 * @param {object} state - Table state object
 * @param {object} instance - Table instance
 * @returns {HTMLElement} Filter wrapper element
 */
export function createFilterUI(state, instance) {
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

    filterInput.addEventListener('input', (e) => {
        state.filterValue = e.target.value.toLowerCase();
        instance.filter();
    });

    return filterWrapper;
}

/**
 * Filter data based on search term
 * @param {Array} data - Data to filter
 * @param {string} filterValue - Filter search term
 * @param {Array} columns - Column definitions
 * @returns {Array} Filtered data
 */
export function filterData(data, filterValue, columns) {
    if (!filterValue) {
        return [...data];
    }

    return data.filter(row => {
        return columns.some(col => {
            const value = row[col.key];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(filterValue);
        });
    });
}
