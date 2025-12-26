/**
 * Tables Module - ES2024
 * Table rendering and Agentur selector
 */

import { kpiDefinitions } from './config.js';
import { formatValue } from './utils.js';
import { state, getAgenturen, getBundeslaenderData, getLandkreiseData, getAgenturenData } from './data.js';

// ========================================
// TABLE RENDERING
// ========================================

export const renderTable = () => {
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');

    if (!tableHead || !tableBody) return;

    if (state.currentTableView === 'bundeslaender') {
        renderBundeslaenderTable(tableHead, tableBody);
    } else if (state.currentTableView === 'landkreise') {
        renderLandkreiseTable(tableHead, tableBody);
    } else {
        renderAgenturenTable(tableHead, tableBody);
    }
};

const renderBundeslaenderTable = (tableHead, tableBody) => {
    const data = getBundeslaenderData();

    tableHead.innerHTML = `
        <tr>
            <th class="sortable" data-column="bundesland">Bundesland</th>
            ${kpiDefinitions.map(kpi => `
                <th class="sortable" data-column="${kpi.id}">${kpi.title}</th>
            `).join('')}
        </tr>
    `;

    applySorting(data, tableHead);

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" class="table-empty">Keine Daten verfügbar - bitte CSV-Datei mit Bundesland-Spalte hochladen</td></tr>';
    } else {
        tableBody.innerHTML = data.map(row => `
            <tr>
                <td class="row-header">${row.bundesland}</td>
                ${kpiDefinitions.map(kpi => {
                    const value = row[kpi.id];
                    const kpiDef = kpiDefinitions.find(k => k.id === kpi.id);
                    let cssClass = 'number';

                    if (kpi.id === 'ergebnis') {
                        cssClass += value >= 0 ? ' positive' : ' negative';
                    }

                    return `<td class="${cssClass}">${formatValue(value, kpiDef.unit)}</td>`;
                }).join('')}
            </tr>
        `).join('');
    }
};

const renderLandkreiseTable = (tableHead, tableBody) => {
    const data = getLandkreiseData();

    tableHead.innerHTML = `
        <tr>
            <th class="sortable" data-column="landkreis">Landkreis</th>
            <th class="sortable" data-column="bundesland">Bundesland</th>
            ${kpiDefinitions.map(kpi => `
                <th class="sortable" data-column="${kpi.id}">${kpi.title}</th>
            `).join('')}
        </tr>
    `;

    applySorting(data, tableHead);

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="11" class="table-empty">Keine Landkreis-Daten verfügbar - bitte CSV-Datei mit Landkreis-Spalte hochladen</td></tr>';
    } else {
        tableBody.innerHTML = data.map(row => `
            <tr>
                <td class="row-header">${row.landkreis}</td>
                <td>${row.bundesland}</td>
                ${kpiDefinitions.map(kpi => {
                    const value = row[kpi.id];
                    const kpiDef = kpiDefinitions.find(k => k.id === kpi.id);
                    let cssClass = 'number';

                    if (kpi.id === 'ergebnis') {
                        cssClass += value >= 0 ? ' positive' : ' negative';
                    }

                    return `<td class="${cssClass}">${formatValue(value, kpiDef.unit)}</td>`;
                }).join('')}
            </tr>
        `).join('');
    }
};

const renderAgenturenTable = (tableHead, tableBody) => {
    const data = getAgenturenData();

    tableHead.innerHTML = `
        <tr>
            <th class="sortable" data-column="agentur">Agentur</th>
            ${kpiDefinitions.map(kpi => `
                <th class="sortable" data-column="${kpi.id}">${kpi.title}</th>
            `).join('')}
        </tr>
    `;

    applySorting(data, tableHead);

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" class="table-empty">Keine Agenturen verfügbar - bitte CSV-Datei hochladen</td></tr>';
    } else {
        tableBody.innerHTML = data.map(row => {
            const displayName = row.agentur_name ?
                `${row.agentur} - ${row.agentur_name}` :
                row.agentur;

            return `
                <tr>
                    <td class="row-header">${displayName}</td>
                    ${kpiDefinitions.map(kpi => {
                        const value = row[kpi.id];
                        const kpiDef = kpiDefinitions.find(k => k.id === kpi.id);
                        let cssClass = 'number';

                        if (kpi.id === 'ergebnis') {
                            cssClass += value >= 0 ? ' positive' : ' negative';
                        }

                        return `<td class="${cssClass}">${formatValue(value, kpiDef.unit)}</td>`;
                    }).join('')}
                </tr>
            `;
        }).join('');
    }
};

// ========================================
// SORTING HELPER
// ========================================

const applySorting = (data, tableHead) => {
    if (state.tableSort.column) {
        data.sort((a, b) => {
            const valA = a[state.tableSort.column];
            const valB = b[state.tableSort.column];

            if (typeof valA === 'string') {
                return state.tableSort.direction === 'asc' ?
                    valA.localeCompare(valB) : valB.localeCompare(valA);
            } else {
                return state.tableSort.direction === 'asc' ?
                    valA - valB : valB - valA;
            }
        });

        const sortedHeader = tableHead.querySelector(`[data-column="${state.tableSort.column}"]`);
        if (sortedHeader) {
            sortedHeader.classList.add(`sorted-${state.tableSort.direction}`);
        }
    }
};

// ========================================
// AGENTUR SELECTOR
// ========================================

export const updateAgenturSelector = () => {
    const selector = document.getElementById('agenturSelect');

    if (!selector) return;

    const agenturen = getAgenturen();

    if (agenturen.length === 0) {
        selector.innerHTML = '<option value="">Keine Agenturen verfügbar (CSV hochladen)</option>';
        selector.disabled = true;
        return;
    }

    selector.disabled = false;
    selector.innerHTML = '<option value="">-- Agentur wählen --</option>' +
        agenturen.map(agent => {
            const displayText = agent.name ?
                `${agent.id} - ${agent.name}` :
                agent.id;
            return `<option value="${agent.id}">${displayText}</option>`;
        }).join('');

    if (state.selectedAgentur) {
        selector.value = state.selectedAgentur;
    }
};

// ========================================
// WINDOW EXPORTS
// ========================================

Object.assign(window, {
    renderTable,
    updateAgenturSelector
});
