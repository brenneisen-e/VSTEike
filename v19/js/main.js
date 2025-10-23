// js/main.js - Main Application Logic
// Note: productsBySegment ist in config.js definiert

// Create KPI card
function createKPICard(kpi) {
    const card = document.createElement('div');
    card.className = 'kpi-card';
    card.id = `kpi-${kpi.id}`;

    const data = getFilteredData();
    const currentValue = data.length > 0 ? data[data.length - 1][kpi.id] : 0;
    const prevValue = data.length > 1 ? data[data.length - 2][kpi.id] : 0;
    
    let trend = prevValue !== 0 ? ((currentValue - prevValue) / Math.abs(prevValue)) * 100 : 0;
    let trendIsPositive = trend >= 0;
    
    if (kpi.id === 'storno' || kpi.id === 'risiko') {
        trendIsPositive = trend <= 0;
    }
    
    let ytdValue;
    if (['storno', 'nps', 'risiko', 'combined', 'underwriting'].includes(kpi.id)) {
        const sum = data.reduce((acc, month) => acc + (month[kpi.id] || 0), 0);
        ytdValue = data.length > 0 ? sum / data.length : 0;
    } else {
        ytdValue = data.reduce((sum, month) => sum + (month[kpi.id] || 0), 0);
    }

    card.innerHTML = `
        <div class="kpi-header">
            <div style="flex: 1;">
                <div class="kpi-title">
                    <span class="kpi-icon">${kpi.icon}</span>
                    ${kpi.title}
                </div>
                <div class="kpi-description">${kpi.description}</div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="zoom-button" onclick="openFullscreen('${kpi.id}')" title="Vollbildansicht">🔍</button>
                <div class="kpi-badge">Aktueller Monat: ${formatValue(currentValue, kpi.unit)}</div>
            </div>
        </div>
        <div class="kpi-metrics">
            <div>
                <div class="kpi-value">${formatValue(ytdValue, kpi.unit)}</div>
                <div class="kpi-trend ${trendIsPositive ? 'positive' : 'negative'}">
                    <span>${trendIsPositive ? '📈' : '📉'}</span>
                    <span>${Math.abs(trend).toFixed(1)}% vs. Vormonat</span>
                </div>
                <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">
                    ${['storno', 'nps', 'risiko', 'combined', 'underwriting'].includes(kpi.id) ? 'Durchschnitt YTD' : 'Summe YTD'}
                </div>
            </div>
            <div class="view-toggle">
                <button class="active" data-view="month" data-kpi="${kpi.id}">📅</button>
                <button data-view="distribution" data-kpi="${kpi.id}">📊</button>
                <button data-view="daily" data-kpi="${kpi.id}">📈</button>
            </div>
        </div>
        <div class="time-range-selector" id="timeRange-${kpi.id}" style="display:none;">
            <button class="prev-btn" onclick="navigateTime('${kpi.id}', -1)">◀</button>
            <div class="time-navigation">
                <button class="active" data-range="year" data-kpi="${kpi.id}">Jahr</button>
                <button data-range="month" data-kpi="${kpi.id}">Monat</button>
                <button data-range="week" data-kpi="${kpi.id}">Woche</button>
                <span class="current-period"></span>
            </div>
            <button class="next-btn" onclick="navigateTime('${kpi.id}', 1)">▶</button>
        </div>
        <div class="chart-container clickable" onclick="switchToDaily('${kpi.id}')">
            <canvas id="chart-${kpi.id}"></canvas>
        </div>
    `;

    return card;
}

// Update KPI card
function updateKPICard(kpi) {
    const card = document.getElementById(`kpi-${kpi.id}`);
    if (!card) return;

    const activeView = card.querySelector('.view-toggle button.active').dataset.view;
    const data = getFilteredData();
    
    const currentValue = data.length > 0 ? data[data.length - 1][kpi.id] : 0;
    const prevValue = data.length > 1 ? data[data.length - 2][kpi.id] : 0;
    
    let trend = prevValue !== 0 ? ((currentValue - prevValue) / Math.abs(prevValue)) * 100 : 0;
    let trendIsPositive = trend >= 0;
    
    if (kpi.id === 'storno' || kpi.id === 'risiko') {
        trendIsPositive = trend <= 0;
    }
    
    let ytdValue;
    if (['storno', 'nps', 'risiko', 'combined', 'underwriting'].includes(kpi.id)) {
        const sum = data.reduce((acc, month) => acc + (month[kpi.id] || 0), 0);
        ytdValue = data.length > 0 ? sum / data.length : 0;
    } else {
        ytdValue = data.reduce((sum, month) => sum + (month[kpi.id] || 0), 0);
    }

    card.querySelector('.kpi-value').textContent = formatValue(ytdValue, kpi.unit);
    card.querySelector('.kpi-trend').className = `kpi-trend ${trendIsPositive ? 'positive' : 'negative'}`;
    card.querySelector('.kpi-trend').innerHTML = `
        <span>${trendIsPositive ? '📈' : '📉'}</span>
        <span>${Math.abs(trend).toFixed(1)}% vs. Vormonat</span>
    `;

    const badge = card.querySelector('.kpi-badge');
    if (badge) {
        badge.textContent = `Aktueller Monat: ${formatValue(currentValue, kpi.unit)}`;
    }

    createChart(kpi.id, data, activeView, kpi);
    
    const container = card.querySelector('.chart-container');
    if (activeView === 'month') {
        container.classList.add('clickable');
        container.setAttribute('onclick', `switchToDaily('${kpi.id}')`);
    } else {
        container.classList.remove('clickable');
        container.removeAttribute('onclick');
    }
}

// Update all KPIs
function updateAllKPIs() {
    kpiDefinitions.forEach(kpi => {
        updateKPICard(kpi);
    });
}

// Initialize KPI grid
function initKPIGrid() {
    const grid = document.getElementById('kpiGrid');
    grid.innerHTML = '';
    
    kpiDefinitions.forEach(kpi => {
        const card = createKPICard(kpi);
        grid.appendChild(card);
        
        const data = getFilteredData();
        createChart(kpi.id, data, 'month', kpi);
    });
}

// Update segment display
function updateSegmentDisplay() {
    const button = document.getElementById('segmentButton');
    const text = state.filters.segments.includes('alle') ? 
        'Alle Segmente' : state.filters.segments.join(', ');
    button.querySelector('span').textContent = text;

    document.querySelectorAll('#segmentMenu .dropdown-item').forEach(item => {
        const value = item.dataset.value;
        const checkbox = item.querySelector('.checkbox');
        if (state.filters.segments.includes(value)) {
            checkbox.classList.add('checked');
        } else {
            checkbox.classList.remove('checked');
        }
    });

    updateProductFilter();
}

// Update product filter
function updateProductFilter() {
    const productGroup = document.getElementById('productFilterGroup');
    const productMenu = document.getElementById('productMenu');
    
    if (state.filters.segments.includes('alle')) {
        productGroup.style.display = 'none';
        state.filters.products = ['alle'];
    } else {
        const products = new Set();
        state.filters.segments.forEach(segment => {
            if (productsBySegment[segment]) {
                productsBySegment[segment].forEach(p => products.add(p));
            }
        });
        
        if (products.size > 0) {
            productGroup.style.display = '';
            
            productMenu.innerHTML = `
                <div class="dropdown-item" data-value="alle">
                    <div class="checkbox ${state.filters.products.includes('alle') ? 'checked' : ''}"></div>
                    <span>Alle Produkte</span>
                </div>
                <div class="dropdown-separator"></div>
                ${Array.from(products).sort().map(product => `
                    <div class="dropdown-item" data-value="${product}">
                        <div class="checkbox ${state.filters.products.includes(product) ? 'checked' : ''}"></div>
                        <span>${product}</span>
                    </div>
                `).join('')}
            `;
            
            productMenu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const value = this.dataset.value;
                    
                    if (value === 'alle') {
                        state.filters.products = ['alle'];
                    } else {
                        const otherProducts = state.filters.products.filter(p => p !== 'alle');
                        if (otherProducts.includes(value)) {
                            const newProducts = otherProducts.filter(p => p !== value);
                            state.filters.products = newProducts.length > 0 ? newProducts : ['alle'];
                        } else {
                            state.filters.products = [...otherProducts, value];
                        }
                    }
                    
                    updateProductDisplay();
                    updateAllKPIs();
                    if (state.currentView === 'table') {
                        renderTable();
                    }
                });
            });
        } else {
            productGroup.style.display = 'none';
        }
    }
    
    updateProductDisplay();
}

// ✨ v18: Update product display mit Checkbox-Update
function updateProductDisplay() {
    const button = document.getElementById('productButton');
    if (button) {
        const text = state.filters.products.includes('alle') ?
            'Alle Produkte' : state.filters.products.join(', ');
        button.querySelector('span').textContent = text;
    }

    // Update Checkboxen im productMenu
    document.querySelectorAll('#productMenu .dropdown-item').forEach(item => {
        const value = item.dataset.value;
        const checkbox = item.querySelector('.checkbox');
        if (checkbox) {
            if (state.filters.products.includes(value)) {
                checkbox.classList.add('checked');
            } else {
                checkbox.classList.remove('checked');
            }
        }
    });
}

// Update Agentur filter dropdown
function updateAgenturFilterDropdown() {
    const menu = document.getElementById('agenturFilterMenu');
    if (!menu) return;
    
    const agenturen = getAgenturen();
    
    if (agenturen.length === 0) {
        menu.innerHTML = `
            <div class="dropdown-item" data-value="alle">
                <span>Alle Agenturen</span>
            </div>
        `;
        return;
    }
    
    menu.innerHTML = `
        <div class="dropdown-item" data-value="alle">
            <span>Alle Agenturen</span>
        </div>
        <div class="dropdown-separator"></div>
        ${agenturen.map(agent => {
            const displayText = agent.name ? 
                `${agent.id} - ${agent.name}` : 
                agent.id;
            return `
                <div class="dropdown-item" data-value="${agent.id}">
                    <span>${displayText}</span>
                </div>
            `;
        }).join('')}
    `;
    
    // Add click handlers
    menu.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const value = this.dataset.value;
            state.filters.agentur = value;
            updateAgenturFilterDisplay();
            updateAllKPIs();
            if (state.currentView === 'table') {
                renderTable();
            }
        });
    });
}

// Switch view
function switchView(viewMode) {
    state.currentView = viewMode;
    
    const dashboardView = document.getElementById('dashboardView');
    const tableView = document.getElementById('tableView');
    const viewButtons = document.querySelectorAll('.view-mode-toggle button');
    
    viewButtons.forEach(btn => {
        if (btn.dataset.mode === viewMode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    if (viewMode === 'dashboard') {
        dashboardView.style.display = 'flex';
        tableView.classList.remove('active');
        
        if (countyMapHandler && countyMapHandler.svg) {
            setTimeout(() => {
                const data = getFilteredData();
                countyMapHandler.updateMapData(data);
            }, 100);
        }
    } else {
        dashboardView.style.display = 'none';
        tableView.classList.add('active');
        
        updateAgenturSelector();
        renderTable();
    }
}

// Initialize application
waitForLibraries(function() {
    console.log('Libraries loaded, initializing dashboard...');
    
    initKPIGrid();
    
    setTimeout(() => {
        initMap();
    }, 500);

    // EVENT LISTENERS
    
    // View mode toggle
    document.querySelectorAll('.view-mode-toggle button').forEach(btn => {
        btn.addEventListener('click', function() {
            switchView(this.dataset.mode);
        });
    });
    
    // Table view toggle
    document.querySelectorAll('.table-view-toggle button').forEach(btn => {
        btn.addEventListener('click', function() {
            state.currentTableView = this.dataset.tableView;
            state.tableSort = { column: null, direction: 'asc' };

            document.querySelectorAll('.table-view-toggle button').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');

            // NEU: Zeige Agentur-Mehrfachauswahl bei Agentur-View
            const agenturMultiSelector = document.getElementById('agenturMultiSelector');
            const selectedAgenturen = document.getElementById('selectedAgenturen');

            if (state.currentTableView === 'agentur') {
                agenturMultiSelector.style.display = '';
                selectedAgenturen.style.display = '';
                // Fülle Agentur-Liste beim ersten Mal
                if (document.getElementById('agenturCheckboxList').children.length === 0) {
                    populateAgenturCheckboxes();
                }
            } else {
                agenturMultiSelector.style.display = 'none';
                selectedAgenturen.style.display = 'none';
            }

            renderTable();
        });
    });

    // Agentur select (falls vorhanden - v18.3: wurde durch Multi-Select ersetzt)
    const agenturSelect = document.getElementById('agenturSelect');
    if (agenturSelect) {
        agenturSelect.addEventListener('change', function() {
            state.selectedAgentur = this.value;
            renderTable();
        });
    }

    // Table sorting
    document.addEventListener('click', function(e) {
        if (e.target.closest('.data-table th.sortable')) {
            const th = e.target.closest('th');
            const column = th.dataset.column;
            
            if (state.tableSort.column === column) {
                state.tableSort.direction = state.tableSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                state.tableSort.column = column;
                state.tableSort.direction = 'asc';
            }
            
            renderTable();
        }
    });
    
    // CSV Upload
    document.getElementById('csvUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const csvText = event.target.result;
                    const parsedData = parseCSV(csvText);
                    
                    const firstRow = parsedData[0] || {};
                    const hasDay = 'day' in firstRow;
                    const hasMonth = 'month' in firstRow;
                    const hasYear = 'year' in firstRow;
                    const hasVermittler = 'vermittler_id' in firstRow;
                    const hasLandkreis = 'landkreis' in firstRow || 'kreis' in firstRow;
                    
                    if (hasDay && hasVermittler) {
                        dailyRawData = parsedData;
                        console.log('Stored', dailyRawData.length, 'daily records');

                        const monthlyData = aggregateDailyToMonthly(parsedData);
                        state.uploadedData = monthlyData;

                        const landkreisInfo = hasLandkreis ? ' mit Landkreisen' : '';
                        document.getElementById('fileStatus').textContent =
                            `✅ ${file.name} geladen (${parsedData.length} Tagesdaten → ${monthlyData.length} Monate${landkreisInfo})`;

                        // Activate chat now that data is loaded
                        if (typeof activateChat === 'function') {
                            activateChat();
                        }
                    } else if (hasMonth && !hasDay) {
                        state.uploadedData = parsedData;
                        dailyRawData = null;
                        
                        document.getElementById('fileStatus').textContent = 
                            `✅ ${file.name} geladen (${parsedData.length} Monatsdaten)`;
                    } else {
                        state.uploadedData = parsedData;
                        dailyRawData = null;
                        
                        document.getElementById('fileStatus').textContent = 
                            `⚠️ ${file.name} geladen (${parsedData.length} Zeilen)`;
                    }
                    
                    state.useUploadedData = true;
                    
                    if (hasYear && parsedData.length > 0) {
                        const years = [...new Set(parsedData.map(row => row.year))].sort();
                        const yearFilter = document.getElementById('yearFilter');
                        const currentYear = yearFilter.value;
                        
                        years.forEach(year => {
                            if (!Array.from(yearFilter.options).some(opt => opt.value == year)) {
                                const option = document.createElement('option');
                                option.value = year;
                                option.textContent = year;
                                yearFilter.appendChild(option);
                            }
                        });
                        
                        if (!years.includes(parseInt(currentYear))) {
                            yearFilter.value = years[0];
                            state.filters.year = String(years[0]);
                        }
                    }
                    
                    updateAgenturFilterDropdown();
                    
                    if (state.currentView === 'table') {
                        updateAgenturSelector();
                        renderTable();
                    }
                    
                    updateAllKPIs();
                    
                    // Initialize map with data
                    if (typeof countyMapHandler !== 'undefined' && countyMapHandler) {
                        const data = getFilteredData();
                        countyMapHandler.updateMapData(data);
                    }
                    
                    // Initialize chat after data is loaded
                    if (typeof initChat === 'function') {
                        initChat();
                    }
                    
                } catch (error) {
                    document.getElementById('fileStatus').textContent = '❌ Fehler beim Laden der Datei';
                    console.error('CSV parsing error:', error);
                }
            };
            reader.readAsText(file);
        }
    });

    // Year filter
    document.getElementById('yearFilter').addEventListener('change', function() {
        state.filters.year = this.value;
        updateAllKPIs();
        if (state.currentView === 'table') {
            renderTable();
        }
    });

    // Silo filter
    document.getElementById('siloFilter').addEventListener('change', function() {
        state.filters.silo = this.value;
        updateAllKPIs();
        if (state.currentView === 'table') {
            renderTable();
        }
    });

    // Agentur filter dropdown
    document.getElementById('agenturFilterButton').addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown('agenturFilterMenu');
    });

    // Segment dropdown
    document.getElementById('segmentButton').addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown('segmentMenu');
    });

    // Segment items
    document.querySelectorAll('#segmentMenu .dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const value = this.dataset.value;
            
            if (value === 'alle') {
                state.filters.segments = ['alle'];
            } else {
                const otherSegments = state.filters.segments.filter(s => s !== 'alle');
                if (otherSegments.includes(value)) {
                    const newSegments = otherSegments.filter(s => s !== value);
                    state.filters.segments = newSegments.length > 0 ? newSegments : ['alle'];
                } else {
                    state.filters.segments = [...otherSegments, value];
                }
            }
            
            updateSegmentDisplay();
            updateAllKPIs();
            if (state.currentView === 'table') {
                renderTable();
            }
        });
    });

    // Product dropdown
    document.getElementById('productButton').addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown('productMenu');
    });

    // Clear states/counties button - UPDATED!
    document.getElementById('clearStates').addEventListener('click', function() {
        if (typeof countyMapHandler !== 'undefined' && countyMapHandler) {
            countyMapHandler.clearSelection();
        } else {
            state.selectedStates.clear();
            state.selectedCounties.clear();
            if (typeof updateMapSelection === 'function') {
                updateMapSelection();
            }
        }
        updateAllKPIs();
        if (state.currentView === 'table') {
            renderTable();
        }
    });

    // Close dropdowns
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    });

    // View toggle buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.view-toggle button')) {
            const kpiId = e.target.dataset.kpi;
            const view = e.target.dataset.view;
            const kpi = kpiDefinitions.find(k => k.id === kpiId);
            
            e.target.parentElement.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
            
            if (state.timeNavigation[kpiId]) {
                state.timeNavigation[kpiId].monthOffset = 0;
                state.timeNavigation[kpiId].weekOffset = 0;
            }
            
            const timeRangeSelector = document.getElementById(`timeRange-${kpiId}`);
            if (view === 'daily') {
                timeRangeSelector.style.display = 'flex';
                const activeRange = timeRangeSelector.querySelector('button[data-range].active');
                const timeRange = activeRange ? activeRange.dataset.range : 'year';
                const data = getFilteredData();
                createChart(kpiId, data, view, kpi, timeRange, 0);
            } else {
                timeRangeSelector.style.display = 'none';
                const data = getFilteredData();
                createChart(kpiId, data, view, kpi);
            }
            
            const container = document.querySelector(`#kpi-${kpiId} .chart-container`);
            if (view === 'month') {
                container.classList.add('clickable');
                container.setAttribute('onclick', `switchToDaily('${kpiId}')`);
            } else {
                container.classList.remove('clickable');
                container.removeAttribute('onclick');
            }
        } else if (e.target.matches('.time-range-selector button[data-range]')) {
            const kpiId = e.target.dataset.kpi;
            const range = e.target.dataset.range;
            const kpi = kpiDefinitions.find(k => k.id === kpiId);
            
            e.target.parentElement.querySelectorAll('button[data-range]').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
            
            if (state.timeNavigation[kpiId]) {
                state.timeNavigation[kpiId].monthOffset = 0;
                state.timeNavigation[kpiId].weekOffset = 0;
            }
            
            const data = getFilteredData();
            createChart(kpiId, data, 'daily', kpi, range, 0);
        }
    });

    // Close fullscreen on ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeFullscreen();
        }
    });

    // NEU: Agentur-Mehrfachauswahl Dropdown Toggle
    const agenturMultiButton = document.getElementById('agenturMultiButton');
    const agenturMultiMenu = document.getElementById('agenturMultiMenu');

    if (agenturMultiButton && agenturMultiMenu) {
        agenturMultiButton.addEventListener('click', function(e) {
            e.stopPropagation();
            agenturMultiMenu.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            agenturMultiMenu.classList.remove('show');
        });

        agenturMultiMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    console.log('Dashboard initialized successfully');
});

// NEU: Agentur-Checkboxen füllen
function populateAgenturCheckboxes() {
    const container = document.getElementById('agenturCheckboxList');
    if (!container) return;

    const agenturen = getAgenturen();
    if (agenturen.length === 0) return;

    container.innerHTML = agenturen.map(agentur => {
        const displayName = agentur.name ?
            `${agentur.id} - ${agentur.name}` :
            agentur.id;

        return `
            <div class="dropdown-item" data-agentur-id="${agentur.id}">
                <span class="checkbox"></span>
                <span>${displayName}</span>
            </div>
        `;
    }).join('');

    // Event-Listener für Checkboxen
    container.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            const agenturId = this.dataset.agenturId;
            const checkbox = this.querySelector('.checkbox');

            if (state.selectedAgenturen.has(agenturId)) {
                state.selectedAgenturen.delete(agenturId);
                checkbox.classList.remove('checked');
            } else {
                state.selectedAgenturen.add(agenturId);
                checkbox.classList.add('checked');
            }

            updateSelectedAgenturenDisplay();
            renderTable();
        });
    });

    // "Alle" Checkbox
    const alleItem = document.querySelector('.dropdown-item[data-value="alle"]');
    if (alleItem) {
        alleItem.addEventListener('click', function() {
            const checkbox = this.querySelector('.checkbox');
            const isChecked = checkbox.classList.contains('checked');

            if (isChecked) {
                // Alle abwählen
                state.selectedAgenturen.clear();
                checkbox.classList.remove('checked');
                container.querySelectorAll('.checkbox').forEach(cb => {
                    cb.classList.remove('checked');
                });
            } else {
                // Alle auswählen
                agenturen.forEach(a => state.selectedAgenturen.add(a.id));
                checkbox.classList.add('checked');
                container.querySelectorAll('.checkbox').forEach(cb => {
                    cb.classList.add('checked');
                });
            }

            updateSelectedAgenturenDisplay();
            renderTable();
        });
    }
}

// NEU: Anzeige der ausgewählten Agenturen
function updateSelectedAgenturenDisplay() {
    const container = document.getElementById('selectedAgenturen');
    if (!container) return;

    if (state.selectedAgenturen.size === 0) {
        container.innerHTML = '<span class="empty-state">— keine ausgewählt —</span>';
        return;
    }

    const agenturen = getAgenturen();
    const selectedNames = Array.from(state.selectedAgenturen).map(id => {
        const agentur = agenturen.find(a => a.id === id);
        if (!agentur) return id;

        const displayName = agentur.name ?
            `${agentur.id.substring(2)} - ${agentur.name}` :
            agentur.id;

        return `<span class="selected-tag">${displayName}</span>`;
    }).join('');

    container.innerHTML = selectedNames;
}