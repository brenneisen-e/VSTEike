/**
 * Data Table Pagination Module
 * Handles page size selector and pagination controls
 */

/**
 * Create page size selector UI
 * @param {Array} pageSizes - Available page sizes
 * @param {object} state - Table state object
 * @param {object} instance - Table instance
 * @returns {HTMLElement} Page size wrapper element
 */
export function createPageSizeSelector(pageSizes, state, instance) {
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
        if (size === state.currentPageSize) option.selected = true;
        pageSizeSelect.appendChild(option);
    });

    pageSizeSelect.addEventListener('change', (e) => {
        state.currentPageSize = parseInt(e.target.value);
        state.currentPage = 1;
        instance.render();
    });

    pageSizeWrapper.appendChild(pageSizeLabel);
    pageSizeWrapper.appendChild(pageSizeSelect);

    return pageSizeWrapper;
}

/**
 * Render pagination controls
 * @param {HTMLElement} pagination - Pagination container element
 * @param {object} state - Table state object
 * @param {object} instance - Table instance
 */
export function renderPagination(pagination, state, instance) {
    const totalPages = Math.ceil(state.filteredData.length / state.currentPageSize);
    const start = (state.currentPage - 1) * state.currentPageSize + 1;
    const end = Math.min(state.currentPage * state.currentPageSize, state.filteredData.length);

    pagination.innerHTML = `
        <span>Zeige ${state.filteredData.length > 0 ? start : 0} - ${end} von ${state.filteredData.length} Einträgen</span>
        <div style="display: flex; gap: 8px; align-items: center;">
            <button class="page-btn page-prev" style="
                padding: 6px 12px;
                border: 1px solid #E2E8F0;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                font-size: 14px;
                ${state.currentPage === 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}
            " ${state.currentPage === 1 ? 'disabled' : ''}>Zurück</button>
            <span>Seite ${state.currentPage} von ${totalPages || 1}</span>
            <button class="page-btn page-next" style="
                padding: 6px 12px;
                border: 1px solid #E2E8F0;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                font-size: 14px;
                ${state.currentPage >= totalPages ? 'opacity: 0.5; cursor: not-allowed;' : ''}
            " ${state.currentPage >= totalPages ? 'disabled' : ''}>Weiter</button>
        </div>
    `;

    pagination.querySelector('.page-prev')?.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            instance.render();
        }
    });

    pagination.querySelector('.page-next')?.addEventListener('click', () => {
        if (state.currentPage < totalPages) {
            state.currentPage++;
            instance.render();
        }
    });
}

/**
 * Calculate paginated data slice
 * @param {Array} data - Filtered data
 * @param {number} currentPage - Current page number
 * @param {number} pageSize - Number of items per page
 * @returns {Array} Paginated data slice
 */
export function getPaginatedData(data, currentPage, pageSize) {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
}
