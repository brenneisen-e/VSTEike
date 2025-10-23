// js/tables.js - Table Functions

// Render table
function renderTable() {
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');
    
    if (state.currentTableView === 'bundeslaender') {
        // Get aggregated data by Bundesland
        const data = getBundeslaenderData();
        
        tableHead.innerHTML = `
            <tr>
                <th class="sortable" data-column="bundesland">Bundesland</th>
                ${kpiDefinitions.map(kpi => `
                    <th class="sortable" data-column="${kpi.id}">${kpi.title}</th>
                `).join('')}
            </tr>
        `;
        
        // Apply sorting if set
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
        
    } else if (state.currentTableView === 'landkreise') {
        // NEU: Landkreis view
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
        
        // Apply sorting if set
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
        
    } else {
        // Agentur view - NEU: Mehrfachauswahl möglich!
        const data = getAgenturenData();

        tableHead.innerHTML = `
            <tr>
                <th class="sortable" data-column="agentur">Agentur</th>
                ${kpiDefinitions.map(kpi => `
                    <th class="sortable" data-column="${kpi.id}">${kpi.title}</th>
                `).join('')}
            </tr>
        `;

        // Apply sorting if set
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
    }
}

// Update Agentur selector with names
function updateAgenturSelector() {
    const selector = document.getElementById('agenturSelect');
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
}