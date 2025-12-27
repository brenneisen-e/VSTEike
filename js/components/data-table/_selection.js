/**
 * Data Table Selection Module
 * Handles row selection and checkboxes
 */

/**
 * Create select all header checkbox
 * @param {object} state - Table state object
 * @param {object} instance - Table instance
 * @param {Function} onSelectionChange - Selection change callback
 * @returns {HTMLElement} Table header cell with checkbox
 */
export function createSelectAllHeader(state, instance, onSelectionChange) {
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
            state.displayData.forEach((_, i) => state.selectedRows.add(i));
        } else {
            state.selectedRows.clear();
        }
        instance.render();
        if (onSelectionChange) onSelectionChange(instance.getSelectedRows());
    });

    selectAllTh.appendChild(selectAllCheckbox);
    return selectAllTh;
}

/**
 * Create row selection checkbox
 * @param {number} rowIndex - Row index
 * @param {object} state - Table state object
 * @param {object} instance - Table instance
 * @param {Function} onSelectionChange - Selection change callback
 * @returns {HTMLElement} Table data cell with checkbox
 */
export function createRowCheckbox(rowIndex, state, instance, onSelectionChange) {
    const selectTd = document.createElement('td');
    selectTd.style.cssText = `
        padding: 12px;
        text-align: center;
        border-bottom: 1px solid #E2E8F0;
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = state.selectedRows.has(rowIndex);
    checkbox.style.cssText = `cursor: pointer;`;
    checkbox.addEventListener('click', (e) => e.stopPropagation());
    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            state.selectedRows.add(rowIndex);
        } else {
            state.selectedRows.delete(rowIndex);
        }
        if (onSelectionChange) onSelectionChange(instance.getSelectedRows());
    });

    selectTd.appendChild(checkbox);
    return selectTd;
}
