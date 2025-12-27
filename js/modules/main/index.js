/**
 * Main Application Module - ES6 Entry Point (ES2024)
 * Dashboard KPI Grid and View Management
 */

// ========================================
// KPI CARD CREATION
// ========================================

export const createKPICard = (kpi) => {
    const card = document.createElement('div');
    card.className = 'kpi-card';
    card.id = `kpi-${kpi.id}`;

    const data = window.getFilteredData?.() ?? [];
    const currentValue = data.length > 0 ? data[data.length - 1][kpi.id] : 0;
    const prevValue = data.length > 1 ? data[data.length - 2][kpi.id] : 0;

    let trend = prevValue !== 0 ? ((currentValue - prevValue) / Math.abs(prevValue)) * 100 : 0;
    let trendIsPositive = kpi.id === 'storno' || kpi.id === 'risiko' ? trend <= 0 : trend >= 0;

    const ytdValue = ['storno', 'nps', 'risiko', 'combined', 'underwriting'].includes(kpi.id)
        ? (data.length > 0 ? data.reduce((acc, m) => acc + (m[kpi.id] ?? 0), 0) / data.length : 0)
        : data.reduce((sum, m) => sum + (m[kpi.id] ?? 0), 0);

    const trendIcon = trendIsPositive
        ? '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>'
        : '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline>';

    card.innerHTML = `
        <div class="kpi-header">
            <div class="kpi-header-text">
                <div class="kpi-title-row">
                    <div class="kpi-title-wrapper">
                        <span class="kpi-title">${kpi.title}</span><span class="kpi-icon">${kpi.icon}</span>
                    </div>
                    <div class="kpi-header-actions">
                        <div class="kpi-badge">Aktueller Monat: ${window.formatValue?.(currentValue, kpi.unit) ?? currentValue}</div>
                    </div>
                </div>
                <div class="kpi-description">${kpi.description}</div>
            </div>
        </div>
        <div class="kpi-metrics">
            <div>
                <div class="kpi-value">${window.formatValue?.(ytdValue, kpi.unit) ?? ytdValue}</div>
                <div class="kpi-trend ${trendIsPositive ? 'positive' : 'negative'}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">${trendIcon}</svg>
                    <span>${Math.abs(trend).toFixed(1)}% vs. Vormonat</span>
                </div>
                <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">
                    ${['storno', 'nps', 'risiko', 'combined', 'underwriting'].includes(kpi.id) ? 'Durchschnitt YTD' : 'Summe YTD'}
                </div>
            </div>
            <div class="view-toggle">
                <button class="active" data-view="month" data-kpi="${kpi.id}" title="Monatsansicht">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </button>
                <button data-view="distribution" data-kpi="${kpi.id}" title="Verteilung">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                </button>
                <button data-view="daily" data-kpi="${kpi.id}" title="Tagesansicht">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                </button>
            </div>
        </div>
        <div class="time-range-selector" id="timeRange-${kpi.id}" style="display:none;">
            <button class="prev-btn" onclick="navigateTime('${kpi.id}', -1)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div class="time-navigation">
                <button class="active" data-range="year" data-kpi="${kpi.id}">Jahr</button>
                <button data-range="month" data-kpi="${kpi.id}">Monat</button>
                <button data-range="week" data-kpi="${kpi.id}">Woche</button>
                <span class="current-period"></span>
            </div>
            <button class="next-btn" onclick="navigateTime('${kpi.id}', 1)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
        </div>
        <div class="chart-container clickable">
            <canvas id="chart-${kpi.id}"></canvas>
            <button class="chart-zoom-button" onclick="event.stopPropagation(); openFullscreen('${kpi.id}')" title="Vollbildansicht">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
            </button>
        </div>
    `;

    return card;
};

// ========================================
// KPI UPDATES
// ========================================

export const updateKPICard = (kpi) => {
    const card = document.getElementById(`kpi-${kpi.id}`);
    if (!card) return;

    const activeView = card.querySelector('.view-toggle button.active')?.dataset?.view ?? 'month';
    const data = window.getFilteredData?.() ?? [];

    const currentValue = data.length > 0 ? data[data.length - 1][kpi.id] : 0;
    const prevValue = data.length > 1 ? data[data.length - 2][kpi.id] : 0;

    let trend = prevValue !== 0 ? ((currentValue - prevValue) / Math.abs(prevValue)) * 100 : 0;
    const trendIsPositive = kpi.id === 'storno' || kpi.id === 'risiko' ? trend <= 0 : trend >= 0;

    const ytdValue = ['storno', 'nps', 'risiko', 'combined', 'underwriting'].includes(kpi.id)
        ? (data.length > 0 ? data.reduce((acc, m) => acc + (m[kpi.id] ?? 0), 0) / data.length : 0)
        : data.reduce((sum, m) => sum + (m[kpi.id] ?? 0), 0);

    const kpiValueEl = card.querySelector('.kpi-value');
    if (kpiValueEl) kpiValueEl.textContent = window.formatValue?.(ytdValue, kpi.unit) ?? ytdValue;

    const trendEl = card.querySelector('.kpi-trend');
    if (trendEl) {
        trendEl.className = `kpi-trend ${trendIsPositive ? 'positive' : 'negative'}`;
        const trendIcon = trendIsPositive
            ? '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>'
            : '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline>';
        trendEl.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">${trendIcon}</svg>
            <span>${Math.abs(trend).toFixed(1)}% vs. Vormonat</span>
        `;
    }

    const badge = card.querySelector('.kpi-badge');
    if (badge) badge.textContent = `Aktueller Monat: ${window.formatValue?.(currentValue, kpi.unit) ?? currentValue}`;

    window.createChart?.(kpi.id, data, activeView, kpi);

    const container = card.querySelector('.chart-container');
    if (activeView === 'month') {
        container?.classList.add('clickable');
        container?.setAttribute('onclick', `switchToDaily('${kpi.id}')`);
    } else {
        container?.classList.remove('clickable');
        container?.removeAttribute('onclick');
    }
};

export const updateAllKPIs = () => {
    window.kpiDefinitions?.forEach(kpi => updateKPICard(kpi));
};

// ========================================
// GRID INITIALIZATION
// ========================================

export const initKPIGrid = () => {
    const grid = document.getElementById('kpiGrid');
    if (!grid) return;

    grid.innerHTML = '';
    window.kpiDefinitions?.forEach(kpi => {
        const card = createKPICard(kpi);
        grid.appendChild(card);
        const data = window.getFilteredData?.() ?? [];
        window.createChart?.(kpi.id, data, 'month', kpi);
    });
};

// ========================================
// VIEW SWITCHING
// ========================================

export const switchView = (viewMode) => {
    window.state && (window.state.currentView = viewMode);

    const dashboardView = document.getElementById('dashboardView');
    const tableView = document.getElementById('tableView');

    document.querySelectorAll('.view-mode-toggle button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === viewMode);
    });

    if (viewMode === 'dashboard') {
        if (dashboardView) dashboardView.style.display = 'flex';
        tableView?.classList.remove('active');

        if (window.countyMapHandler?.svg) {
            setTimeout(() => {
                const data = window.getFilteredData?.() ?? [];
                window.countyMapHandler.updateMapData(data);
            }, 100);
        }
    } else {
        if (dashboardView) dashboardView.style.display = 'none';
        tableView?.classList.add('active');
        window.updateAgenturSelector?.();
        window.renderTable?.();
    }
};

// ========================================
// FILTER FUNCTIONS
// ========================================

export const updateSegmentDisplay = () => {
    const button = document.getElementById('segmentButton');
    const text = window.state?.filters?.segments?.includes('alle') ? 'Alle Segmente' : window.state?.filters?.segments?.join(', ');
    const span = button?.querySelector('span');
    if (span) span.textContent = text;

    document.querySelectorAll('#segmentMenu .dropdown-item').forEach(item => {
        const value = item.dataset.value;
        const checkbox = item.querySelector('.checkbox');
        if (window.state?.filters?.segments?.includes(value)) {
            checkbox?.classList.add('checked');
        } else {
            checkbox?.classList.remove('checked');
        }
    });

    updateProductFilter();
};

export const updateProductFilter = () => {
    const productGroup = document.getElementById('productFilterGroup');
    const productMenu = document.getElementById('productMenu');

    if (window.state?.filters?.segments?.includes('alle')) {
        if (productGroup) productGroup.style.display = 'none';
        if (window.state) window.state.filters.products = ['alle'];
    } else {
        const products = new Set();
        window.state?.filters?.segments?.forEach(segment => {
            window.productsBySegment?.[segment]?.forEach(p => products.add(p));
        });

        if (products.size > 0 && productGroup && productMenu) {
            productGroup.style.display = '';
            productMenu.innerHTML = `
                <div class="dropdown-item" data-value="alle">
                    <div class="checkbox ${window.state?.filters?.products?.includes('alle') ? 'checked' : ''}"></div>
                    <span>Alle Produkte</span>
                </div>
                <div class="dropdown-separator"></div>
                ${Array.from(products).sort().map(product => `
                    <div class="dropdown-item" data-value="${product}">
                        <div class="checkbox ${window.state?.filters?.products?.includes(product) ? 'checked' : ''}"></div>
                        <span>${product}</span>
                    </div>
                `).join('')}
            `;

            productMenu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const value = this.dataset.value;

                    if (value === 'alle') {
                        window.state.filters.products = ['alle'];
                    } else {
                        const otherProducts = window.state.filters.products.filter(p => p !== 'alle');
                        if (otherProducts.includes(value)) {
                            const newProducts = otherProducts.filter(p => p !== value);
                            window.state.filters.products = newProducts.length > 0 ? newProducts : ['alle'];
                        } else {
                            window.state.filters.products = [...otherProducts, value];
                        }
                    }

                    updateProductDisplay();
                    updateAllKPIs();
                    if (window.state?.currentView === 'table') window.renderTable?.();
                });
            });
        } else if (productGroup) {
            productGroup.style.display = 'none';
        }
    }

    updateProductDisplay();
};

export const updateProductDisplay = () => {
    const button = document.getElementById('productButton');
    if (button) {
        const text = window.state?.filters?.products?.includes('alle') ? 'Alle Produkte' : window.state?.filters?.products?.join(', ');
        const span = button.querySelector('span');
        if (span) span.textContent = text;
    }

    document.querySelectorAll('#productMenu .dropdown-item').forEach(item => {
        const value = item.dataset.value;
        const checkbox = item.querySelector('.checkbox');
        if (window.state?.filters?.products?.includes(value)) {
            checkbox?.classList.add('checked');
        } else {
            checkbox?.classList.remove('checked');
        }
    });
};

export const updateAgenturFilterDropdown = () => {
    const menu = document.getElementById('agenturFilterMenu');
    if (!menu) return;

    const agenturen = window.getAgenturen?.() ?? [];

    if (agenturen.length === 0) {
        menu.innerHTML = '<div class="dropdown-item" data-value="alle"><span>Alle Agenturen</span></div>';
        return;
    }

    menu.innerHTML = `
        <div class="dropdown-item" data-value="alle"><span>Alle Agenturen</span></div>
        <div class="dropdown-separator"></div>
        ${agenturen.map(agent => {
            const displayText = agent.name ? `${agent.id} - ${agent.name}` : agent.id;
            return `<div class="dropdown-item" data-value="${agent.id}"><span>${displayText}</span></div>`;
        }).join('')}
    `;

    menu.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const value = this.dataset.value;
            if (window.state) window.state.filters.agentur = value;
            window.updateAgenturFilterDisplay?.();
            updateAllKPIs();
            if (window.state?.currentView === 'table') window.renderTable?.();
        });
    });
};

// ========================================
// KPI VIEW TOGGLE EVENT LISTENER
// ========================================

const initKPIViewToggle = () => {
    const kpiGrid = document.getElementById('kpiGrid');
    if (!kpiGrid) return;

    kpiGrid.addEventListener('click', (e) => {
        const button = e.target.closest('.view-toggle button');
        if (!button) return;

        const kpiId = button.dataset.kpi;
        const view = button.dataset.view;
        const kpi = window.kpiDefinitions?.find(k => k.id === kpiId);
        if (!kpi) return;

        const card = document.getElementById(`kpi-${kpiId}`);
        card?.querySelectorAll('.view-toggle button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const timeRangeSelector = document.getElementById(`timeRange-${kpiId}`);
        if (timeRangeSelector) {
            timeRangeSelector.style.display = view === 'daily' ? 'flex' : 'none';
        }

        const data = window.getFilteredData?.() ?? [];
        if (view === 'daily') {
            window.createChart?.(kpiId, data, 'daily', kpi, 'year', 0);
        } else {
            window.createChart?.(kpiId, data, view, kpi);
        }

        const container = card?.querySelector('.chart-container');
        if (view === 'month') {
            container?.classList.add('clickable');
            container?.setAttribute('onclick', `switchToDaily('${kpiId}')`);
        } else {
            container?.classList.remove('clickable');
            container?.removeAttribute('onclick');
        }
    });

    // Time range toggle (Jahr/Monat/Woche)
    kpiGrid.addEventListener('click', (e) => {
        const button = e.target.closest('.time-navigation button[data-range]');
        if (!button) return;

        const kpiId = button.dataset.kpi;
        const range = button.dataset.range;
        const kpi = window.kpiDefinitions?.find(k => k.id === kpiId);
        if (!kpi) return;

        const timeRangeSelector = document.getElementById(`timeRange-${kpiId}`);
        timeRangeSelector?.querySelectorAll('button[data-range]').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const data = window.getFilteredData?.() ?? [];
        window.createChart?.(kpiId, data, 'daily', kpi, range, 0);
    });
};

// ========================================
// VIEW MODE TOGGLE (Dashboard/Tabelle)
// ========================================

const initViewModeToggle = () => {
    const toggle = document.querySelector('.view-mode-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-mode]');
        if (!button) return;

        const mode = button.dataset.mode;
        switchView(mode);
    });
};

// ========================================
// TABLE VIEW TOGGLE (Monat/Agentur)
// ========================================

const initTableViewToggle = () => {
    document.querySelectorAll('.table-view-toggle button').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!window.state) return;

            window.state.currentTableView = this.dataset.tableView;
            window.state.tableSort = { column: null, direction: 'asc' };

            document.querySelectorAll('.table-view-toggle button').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');

            // Zeige Agentur-Mehrfachauswahl bei Agentur-View
            const agenturMultiSelector = document.getElementById('agenturMultiSelector');
            const selectedAgenturen = document.getElementById('selectedAgenturen');

            if (window.state.currentTableView === 'agentur') {
                if (agenturMultiSelector) agenturMultiSelector.style.display = '';
                if (selectedAgenturen) selectedAgenturen.style.display = '';
                // Fülle Agentur-Liste beim ersten Mal
                const checkboxList = document.getElementById('agenturCheckboxList');
                if (checkboxList && checkboxList.children.length === 0) {
                    populateAgenturCheckboxes();
                }
            } else {
                if (agenturMultiSelector) agenturMultiSelector.style.display = 'none';
                if (selectedAgenturen) selectedAgenturen.style.display = 'none';
            }

            window.renderTable?.();
        });
    });
};

// ========================================
// TABLE SORTING
// ========================================

const initTableSorting = () => {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.data-table th.sortable')) {
            const th = e.target.closest('th');
            const column = th.dataset.column;

            if (!window.state) return;

            if (window.state.tableSort.column === column) {
                window.state.tableSort.direction = window.state.tableSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                window.state.tableSort.column = column;
                window.state.tableSort.direction = 'asc';
            }

            window.renderTable?.();
        }
    });
};

// ========================================
// CSV UPLOAD HANDLER
// ========================================

const initCSVUpload = () => {
    const csvUploadElement = document.getElementById('csvUpload');
    if (!csvUploadElement) return;

    csvUploadElement.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const csvText = event.target.result;
                const parsedData = window.parseCSV?.(csvText) ?? [];

                const firstRow = parsedData[0] || {};
                const hasDay = 'day' in firstRow;
                const hasMonth = 'month' in firstRow;
                const hasYear = 'year' in firstRow;
                const hasVermittler = 'vermittler_id' in firstRow;
                const hasLandkreis = 'landkreis' in firstRow || 'kreis' in firstRow;

                if (hasDay && hasVermittler) {
                    window.dailyRawData = parsedData;
                    console.log('Stored', parsedData.length, 'daily records');

                    const monthlyData = window.aggregateDailyToMonthly?.(parsedData) ?? parsedData;
                    if (window.state) window.state.uploadedData = monthlyData;

                    const landkreisInfo = hasLandkreis ? ' mit Landkreisen' : '';
                    const fileStatus = document.getElementById('fileStatus');
                    if (fileStatus) {
                        fileStatus.textContent = `${file.name} geladen (${parsedData.length} Tagesdaten → ${monthlyData.length} Monate${landkreisInfo})`;
                        fileStatus.classList.add('success');
                    }

                    window.activateChat?.();
                } else if (hasMonth && !hasDay) {
                    if (window.state) window.state.uploadedData = parsedData;
                    window.dailyRawData = null;

                    const fileStatus = document.getElementById('fileStatus');
                    if (fileStatus) {
                        fileStatus.textContent = `${file.name} geladen (${parsedData.length} Monatsdaten)`;
                        fileStatus.classList.add('success');
                    }
                } else {
                    if (window.state) window.state.uploadedData = parsedData;
                    window.dailyRawData = null;

                    const fileStatus = document.getElementById('fileStatus');
                    if (fileStatus) {
                        fileStatus.textContent = `${file.name} geladen (${parsedData.length} Zeilen)`;
                        fileStatus.classList.add('warning');
                    }
                }

                if (window.state) window.state.useUploadedData = true;

                if (hasYear && parsedData.length > 0) {
                    const years = [...new Set(parsedData.map(row => row.year))].sort();
                    const yearFilter = document.getElementById('yearFilter');
                    if (yearFilter) {
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
                            if (window.state) window.state.filters.year = String(years[0]);
                        }
                    }
                }

                updateAgenturFilterDropdown();

                if (window.state?.currentView === 'table') {
                    window.updateAgenturSelector?.();
                    window.renderTable?.();
                }

                updateAllKPIs();

                if (window.countyMapHandler) {
                    const data = window.getFilteredData?.() ?? [];
                    window.countyMapHandler.updateMapData(data);
                }

                window.initChat?.();
            } catch (error) {
                const fileStatus = document.getElementById('fileStatus');
                if (fileStatus) {
                    fileStatus.textContent = 'Fehler beim Laden der Datei';
                    fileStatus.classList.add('error');
                }
                console.error('CSV parsing error:', error);
            }
        };
        reader.readAsText(file);
    });
};

// ========================================
// FILTER EVENT LISTENERS
// ========================================

const initFilterListeners = () => {
    // Year filter
    const yearFilter = document.getElementById('yearFilter');
    if (yearFilter) {
        yearFilter.addEventListener('change', function() {
            if (window.state) window.state.filters.year = this.value;
            updateAllKPIs();
            if (window.state?.currentView === 'table') window.renderTable?.();
        });
    }

    // Silo filter
    const siloFilter = document.getElementById('siloFilter');
    if (siloFilter) {
        siloFilter.addEventListener('change', function() {
            if (window.state) window.state.filters.silo = this.value;
            updateAllKPIs();
            if (window.state?.currentView === 'table') window.renderTable?.();
        });
    }

    // Agentur filter button
    const agenturFilterButton = document.getElementById('agenturFilterButton');
    if (agenturFilterButton) {
        agenturFilterButton.addEventListener('click', function(e) {
            e.stopPropagation();
            window.toggleDropdown?.('agenturFilterMenu');
        });
    }

    // Segment button
    const segmentButton = document.getElementById('segmentButton');
    if (segmentButton) {
        segmentButton.addEventListener('click', function(e) {
            e.stopPropagation();
            window.toggleDropdown?.('segmentMenu');
        });
    }

    // Segment menu items
    document.querySelectorAll('#segmentMenu .dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const value = this.dataset.value;

            if (!window.state) return;

            if (value === 'alle') {
                window.state.filters.segments = ['alle'];
            } else {
                const otherSegments = window.state.filters.segments.filter(s => s !== 'alle');
                if (otherSegments.includes(value)) {
                    const newSegments = otherSegments.filter(s => s !== value);
                    window.state.filters.segments = newSegments.length > 0 ? newSegments : ['alle'];
                } else {
                    window.state.filters.segments = [...otherSegments, value];
                }
            }

            updateSegmentDisplay();
            updateAllKPIs();
            if (window.state?.currentView === 'table') window.renderTable?.();
        });
    });

    // Product button
    const productButton = document.getElementById('productButton');
    if (productButton) {
        productButton.addEventListener('click', function(e) {
            e.stopPropagation();
            window.toggleDropdown?.('productMenu');
        });
    }

    // Clear states button
    const clearStatesButton = document.getElementById('clearStates');
    if (clearStatesButton) {
        clearStatesButton.addEventListener('click', function() {
            if (window.countyMapHandler) {
                window.countyMapHandler.clearSelection();
            } else if (window.state) {
                window.state.selectedStates?.clear();
                window.state.selectedCounties?.clear();
                window.updateMapSelection?.();
            }
            updateAllKPIs();
            if (window.state?.currentView === 'table') window.renderTable?.();
        });
    }

    // Close dropdowns on document click
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    });

    // ESC key to close fullscreen
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            window.closeFullscreen?.();
        }
    });
};

// ========================================
// AGENTUR MULTI-SELECT
// ========================================

const initAgenturMultiSelect = () => {
    const agenturMultiButton = document.getElementById('agenturMultiButton');
    const agenturMultiMenu = document.getElementById('agenturMultiMenu');

    if (agenturMultiButton && agenturMultiMenu) {
        agenturMultiButton.addEventListener('click', function(e) {
            e.stopPropagation();
            agenturMultiMenu.classList.toggle('show');
        });

        agenturMultiMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
};

export const populateAgenturCheckboxes = () => {
    const container = document.getElementById('agenturCheckboxList');
    if (!container) return;

    const agenturen = window.getAgenturen?.() ?? [];
    if (agenturen.length === 0) return;

    container.innerHTML = agenturen.map(agentur => {
        const displayName = agentur.name ? `${agentur.id} - ${agentur.name}` : agentur.id;
        return `
            <div class="dropdown-item" data-agentur-id="${agentur.id}">
                <span class="checkbox"></span>
                <span>${displayName}</span>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            const agenturId = this.dataset.agenturId;
            const checkbox = this.querySelector('.checkbox');

            if (!window.state?.selectedAgenturen) return;

            if (window.state.selectedAgenturen.has(agenturId)) {
                window.state.selectedAgenturen.delete(agenturId);
                checkbox?.classList.remove('checked');
            } else {
                window.state.selectedAgenturen.add(agenturId);
                checkbox?.classList.add('checked');
            }

            updateSelectedAgenturenDisplay();
            window.renderTable?.();
        });
    });

    // "Alle" Checkbox
    const alleItem = document.querySelector('.dropdown-item[data-value="alle"]');
    if (alleItem) {
        alleItem.addEventListener('click', function() {
            const checkbox = this.querySelector('.checkbox');
            const isChecked = checkbox?.classList.contains('checked');

            if (!window.state?.selectedAgenturen) return;

            if (isChecked) {
                window.state.selectedAgenturen.clear();
                checkbox?.classList.remove('checked');
                container.querySelectorAll('.checkbox').forEach(cb => cb.classList.remove('checked'));
            } else {
                agenturen.forEach(a => window.state.selectedAgenturen.add(a.id));
                checkbox?.classList.add('checked');
                container.querySelectorAll('.checkbox').forEach(cb => cb.classList.add('checked'));
            }

            updateSelectedAgenturenDisplay();
            window.renderTable?.();
        });
    }
};

export const updateSelectedAgenturenDisplay = () => {
    const container = document.getElementById('selectedAgenturen');
    if (!container) return;

    if (!window.state?.selectedAgenturen || window.state.selectedAgenturen.size === 0) {
        container.innerHTML = '<span class="empty-state">— keine ausgewählt —</span>';
        return;
    }

    const agenturen = window.getAgenturen?.() ?? [];
    const selectedNames = Array.from(window.state.selectedAgenturen).map(id => {
        const agentur = agenturen.find(a => a.id === id);
        if (!agentur) return id;
        const displayName = agentur.name ? `${agentur.id.substring(2)} - ${agentur.name}` : agentur.id;
        return `<span class="selected-tag">${displayName}</span>`;
    }).join('');

    container.innerHTML = selectedNames;
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initKPIViewToggle();
        initViewModeToggle();
        initTableViewToggle();
        initTableSorting();
        initCSVUpload();
        initFilterListeners();
        initAgenturMultiSelect();
        console.log('Main module: All event listeners initialized');
    }, 100);
});

// ========================================
// WINDOW EXPORTS
// ========================================

Object.assign(window, {
    createKPICard,
    updateKPICard,
    updateAllKPIs,
    initKPIGrid,
    switchView,
    updateSegmentDisplay,
    updateProductFilter,
    updateProductDisplay,
    updateAgenturFilterDropdown,
    initKPIViewToggle,
    populateAgenturCheckboxes,
    updateSelectedAgenturenDisplay
});

