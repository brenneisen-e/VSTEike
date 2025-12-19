// ========================================
// MODULE SWITCHING (Versicherung/Banken/Asset Manager)
// ========================================

// Track if Banken module has been loaded
let bankenModuleLoaded = false;

// Component registry for the modular Banken system
const BANKEN_COMPONENTS = [
    'header',
    'section-segmentierung',
    'section-npl',
    'section-stage2',
    'section-aufgaben',
    'modal-customer-detail',
    'modal-document-scanner',
    'crm-profile-view'
];

// Load a single component
async function loadComponent(componentName) {
    try {
        const response = await fetch(`partials/banken/${componentName}.html`);
        if (response.ok) {
            return await response.text();
        }
        console.warn(`Component ${componentName} could not be loaded`);
        return `<!-- Component ${componentName} failed to load -->`;
    } catch (error) {
        console.warn(`Error loading component ${componentName}:`, error);
        return `<!-- Component ${componentName} error -->`;
    }
}

// Load all components and inject into placeholders
async function loadBankenComponents(container) {
    const componentPlaceholders = container.querySelectorAll('[data-component]');

    // Load all components in parallel for better performance
    const loadPromises = Array.from(componentPlaceholders).map(async (placeholder) => {
        const componentName = placeholder.getAttribute('data-component');
        const html = await loadComponent(componentName);
        placeholder.outerHTML = html;
    });

    await Promise.all(loadPromises);
    console.log(`Loaded ${componentPlaceholders.length} components`);
}

// Load Banken module from partial (modular version)
async function loadBankenModule() {
    if (bankenModuleLoaded) return;

    const container = document.getElementById('bankenModule');
    if (!container) return;

    try {
        // First load the main shell template
        const response = await fetch('partials/banken-module.html');
        if (response.ok) {
            const html = await response.text();
            container.innerHTML = html;

            // Then load all components into placeholders
            await loadBankenComponents(container);

            bankenModuleLoaded = true;
            console.log('Banken-Modul modular geladen');

            // Initialize charts after all content is loaded
            setTimeout(() => {
                initBankenCharts();
                // Initialize Banken Chat
                if (typeof initBankenChat === 'function') {
                    initBankenChat();
                }
            }, 100);
        } else {
            throw new Error('Failed to load module');
        }
    } catch (error) {
        console.warn('Banken-Modul konnte nicht geladen werden, verwende Fallback');
        // If fetch fails (e.g., file:// protocol), the module stays with loading state
        container.innerHTML = `
            <div class="module-loading">
                <p style="color: #ef4444;">Modul konnte nicht geladen werden.</p>
                <p style="font-size: 12px;">Bitte starten Sie die Anwendung über einen Webserver.</p>
            </div>
        `;
    }
}

function switchModule(moduleName) {
    // Update module tabs
    document.querySelectorAll('.module-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.module === moduleName) {
            tab.classList.add('active');
        }
    });

    // Update module content
    document.querySelectorAll('.module-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetModule = document.getElementById(moduleName + 'Module');
    if (targetModule) {
        targetModule.classList.add('active');
    }

    // Store current module
    localStorage.setItem('currentModule', moduleName);

    // Load Banken module dynamically when first accessed
    if (moduleName === 'banken') {
        loadBankenModule();
    }

    console.log('Switched to module:', moduleName);
}

// Initialize module on page load
function initModuleSelector() {
    const savedModule = localStorage.getItem('currentModule') || 'versicherung';
    switchModule(savedModule);
}

// ========================================
// BANKEN COLLECTIONS DASHBOARD FUNCTIONS
// ========================================

// Switch between Banken Dashboard tabs
function showBankenTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.banken-tabs .banken-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Find and activate the clicked tab
    const tabButtons = document.querySelectorAll('.banken-tabs .banken-tab');
    tabButtons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(tabName.toLowerCase()) ||
            btn.onclick.toString().includes(tabName)) {
            btn.classList.add('active');
        }
    });

    // Activate by checking onclick attribute
    document.querySelectorAll('.banken-tabs .banken-tab').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabName}'`)) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.banken-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetContent = document.getElementById(`banken-tab-${tabName}`);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    console.log('Banken tab switched to:', tabName);
}

// Filter by segment in 2x2 matrix
function filterBySegment(segment) {
    // Map segment parameter to badge class and display name
    const segmentConfig = {
        'eskalation': { badgeClass: 'escalate', name: 'Eskalation', color: '#ef4444' },
        'prioritaet': { badgeClass: 'priority', name: 'Priorität', color: '#22c55e' },
        'restrukturierung': { badgeClass: 'restructure', name: 'Restrukturierung', color: '#f59e0b' },
        'abwicklung': { badgeClass: 'writeoff', name: 'Abwicklung', color: '#64748b' }
    };

    const config = segmentConfig[segment];
    if (!config) {
        console.warn('Unknown segment:', segment);
        return;
    }

    // Highlight selected quadrant
    document.querySelectorAll('.matrix-quadrant').forEach(q => {
        q.classList.remove('selected');
    });
    const selectedQuadrant = document.querySelector(`.matrix-quadrant.segment-${segment}`);
    if (selectedQuadrant) {
        selectedQuadrant.classList.add('selected');
    }

    // Find the customer table
    const table = document.querySelector('.banken-page .customer-table');
    if (!table) {
        console.warn('Customer table not found');
        return;
    }

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Filter rows by segment
    let matchingRows = [];
    let hiddenRows = [];

    rows.forEach(row => {
        const segmentBadge = row.querySelector('.segment-badge');
        if (segmentBadge && segmentBadge.classList.contains(config.badgeClass)) {
            matchingRows.push(row);
            row.style.display = '';
        } else {
            hiddenRows.push(row);
            row.style.display = 'none';
        }
    });

    // Sort matching rows by volume (Forderung) - highest first
    matchingRows.sort((a, b) => {
        const amountA = parseAmount(a.querySelector('.amount')?.textContent || '0');
        const amountB = parseAmount(b.querySelector('.amount')?.textContent || '0');
        return amountB - amountA; // Descending order
    });

    // Re-append rows in sorted order (matching first, then hidden)
    matchingRows.forEach(row => tbody.appendChild(row));
    hiddenRows.forEach(row => tbody.appendChild(row));

    // Show/update filter indicator
    showFilterIndicator(config.name, config.color, matchingRows.length, segment);

    // Scroll to table
    const tableWrapper = document.querySelector('.banken-page .customer-table-wrapper');
    if (tableWrapper) {
        tableWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Update pagination text
    const paginationText = document.querySelector('.table-pagination span');
    if (paginationText) {
        paginationText.textContent = `Zeige ${matchingRows.length} ${config.name}-Fälle (sortiert nach Volumen)`;
    }

    showNotification(`${matchingRows.length} Fälle im Segment "${config.name}" gefunden`, 'info');
    console.log('Filtered by segment:', segment, '- Found:', matchingRows.length);
}

// Track currently selected segment
let currentSelectedSegment = null;

// Toggle collapsible sections
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('collapsed');

        // Save state to localStorage
        const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
        collapsedSections[sectionId] = section.classList.contains('collapsed');
        localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
    }
}

// Restore collapsed sections state on page load
function restoreCollapsedSections() {
    const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
    Object.keys(collapsedSections).forEach(sectionId => {
        if (collapsedSections[sectionId]) {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('collapsed');
            }
        }
    });
}

// Show all ehemalige (former) cases
function showAllEhemalige() {
    // Filter customer list by ehemalige status
    showNotification('Zeige alle ehemaligen Fälle', 'info');

    // For demo, show notification - in production this would filter/show a dedicated view
    const customerTable = document.querySelector('.customer-table tbody');
    if (customerTable) {
        // Scroll to customer list
        const customerList = document.querySelector('.customer-list-section');
        if (customerList) {
            customerList.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Navigate to customer list with segment filter applied
function openSegmentFullscreen(segment) {
    const segmentConfig = {
        'eskalation': { badgeClass: 'escalate', name: 'Eskalation', filterValue: 'escalate' },
        'prioritaet': { badgeClass: 'priority', name: 'Priorität', filterValue: 'priority' },
        'restrukturierung': { badgeClass: 'restructure', name: 'Restrukturierung', filterValue: 'restructure' },
        'abwicklung': { badgeClass: 'writeoff', name: 'Abwicklung', filterValue: 'writeoff' },
        'ehemalige': { badgeClass: 'ehemalige', name: 'Ehemalige Fälle', filterValue: 'ehemalige' }
    };

    const config = segmentConfig[segment];
    if (!config) return;

    // Toggle: if same segment clicked, deselect
    if (currentSelectedSegment === segment) {
        clearSegmentFilter();
        currentSelectedSegment = null;
        showNotification('Filter aufgehoben', 'info');
        return;
    }

    // Remove selected from all quadrants
    document.querySelectorAll('.matrix-quadrant').forEach(q => {
        q.classList.remove('selected');
    });

    // Add selected to clicked quadrant
    const clickedQuadrant = document.querySelector(`.segment-${segment}`);
    if (clickedQuadrant) {
        clickedQuadrant.classList.add('selected');
    }

    currentSelectedSegment = segment;

    // Apply segment filter to customer list
    filterBySegment(segment);

    // Update segment dropdown to match
    const segmentSelect = document.querySelector('.filter-select[onchange*="segment"]');
    if (segmentSelect) {
        segmentSelect.value = config.filterValue;
    }

    // Scroll to customer list section
    const customerList = document.querySelector('.customer-list-section');
    if (customerList) {
        customerList.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showNotification(`Gefiltert nach Segment: ${config.name}`, 'info');
}

// Parse amount string to number (e.g., "€125.000" -> 125000)
function parseAmount(amountStr) {
    if (!amountStr) return 0;
    // Remove currency symbol and thousands separators, handle decimal
    const cleaned = amountStr.replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}

// Show filter indicator above the table
function showFilterIndicator(segmentName, color, count, segmentKey) {
    // Remove existing indicator
    const existingIndicator = document.querySelector('.segment-filter-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }

    // Create new indicator
    const indicator = document.createElement('div');
    indicator.className = 'segment-filter-indicator';
    indicator.innerHTML = `
        <div class="filter-indicator-content">
            <span class="filter-indicator-badge" style="background: ${color};">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                ${segmentName}
            </span>
            <span class="filter-indicator-count">${count} Fälle · Sortiert nach Volumen (höchstes zuerst)</span>
        </div>
        <button class="filter-indicator-clear" onclick="clearSegmentFilter()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Filter aufheben
        </button>
    `;

    // Insert before table wrapper
    const tableWrapper = document.querySelector('.banken-page .customer-table-wrapper');
    if (tableWrapper) {
        tableWrapper.parentNode.insertBefore(indicator, tableWrapper);
    }
}

// Clear segment filter
function clearSegmentFilter() {
    // Reset selected segment tracker
    currentSelectedSegment = null;

    // Remove indicator
    const indicator = document.querySelector('.segment-filter-indicator');
    if (indicator) {
        indicator.remove();
    }

    // Remove quadrant selection
    document.querySelectorAll('.matrix-quadrant').forEach(q => {
        q.classList.remove('selected');
    });

    // Show all rows
    const table = document.querySelector('.banken-page .customer-table');
    if (table) {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.style.display = '';
        });
    }

    // Reset pagination text
    const paginationText = document.querySelector('.table-pagination span');
    if (paginationText) {
        paginationText.textContent = 'Zeige 1-4 von 10.234 Kunden';
    }

    showNotification('Filter aufgehoben', 'info');
}

// Show chart popup for KPI mini charts
function showChartPopup(chartId, title) {
    // Chart data for different KPIs - with dual Y-axes support
    const chartData = {
        'aktive-faelle': {
            color: '#3b82f6',
            data: [9800, 9950, 10050, 10100, 10180, 10234],
            labels: ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            suffix: '',
            axisLabel: 'Anzahl Fälle',
            // Secondary axis data (amount in millions)
            secondaryColor: '#f97316',
            secondaryData: [42.5, 44.1, 45.2, 46.0, 46.8, 47.8],
            secondarySuffix: ' Mio €',
            secondaryLabel: 'Forderung'
        },
        'offene-forderung': {
            color: '#f97316',
            data: [42.5, 44.1, 45.2, 46.0, 46.8, 47.8],
            labels: ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            suffix: ' Mio €',
            axisLabel: 'Forderung',
            // Secondary: Recovery amount
            secondaryColor: '#22c55e',
            secondaryData: [26.4, 28.0, 29.3, 30.5, 31.4, 32.7],
            secondarySuffix: ' Mio €',
            secondaryLabel: 'Eingezogen'
        },
        'recovery-rate': {
            color: '#22c55e',
            data: [62.1, 63.5, 64.8, 66.2, 67.1, 68.4],
            labels: ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            suffix: '%',
            axisLabel: 'Recovery Rate',
            // Secondary: Absolute recovery in Mio
            secondaryColor: '#3b82f6',
            secondaryData: [26.4, 28.0, 29.3, 30.5, 31.4, 32.7],
            secondarySuffix: ' Mio €',
            secondaryLabel: 'Absolut'
        },
        'dpd': {
            color: '#8b5cf6',
            data: [52, 51, 50, 49, 48, 47],
            labels: ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            suffix: ' Tage',
            axisLabel: 'Ø DPD',
            // Secondary: Number of >90 DPD cases
            secondaryColor: '#ef4444',
            secondaryData: [2500, 2450, 2400, 2380, 2360, 2344],
            secondarySuffix: '',
            secondaryLabel: '>90 DPD Fälle'
        },
        'aufgaben': {
            color: '#ef4444',
            data: [180, 165, 172, 158, 162, 156],
            labels: ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            suffix: '',
            axisLabel: 'Offene Aufgaben',
            // Secondary: Completed tasks
            secondaryColor: '#22c55e',
            secondaryData: [145, 168, 152, 175, 160, 178],
            secondarySuffix: '',
            secondaryLabel: 'Erledigt'
        }
    };

    const config = chartData[chartId] || chartData['aktive-faelle'];

    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.className = 'chart-popup-overlay';
    overlay.onclick = (e) => {
        if (e.target === overlay) closeChartPopup();
    };

    // Create popup content
    const popup = document.createElement('div');
    popup.className = 'chart-popup';
    popup.innerHTML = `
        <div class="chart-popup-header">
            <h3>${title}</h3>
            <button class="chart-popup-close" onclick="closeChartPopup()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <div class="chart-popup-content" id="popup-chart-${chartId}"></div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Render chart using simple SVG
    renderPopupChart(chartId, config);
}

// Render chart in popup with dual Y-axes support
function renderPopupChart(chartId, config) {
    const container = document.getElementById(`popup-chart-${chartId}`);
    if (!container) return;

    const width = 720;
    const height = 340;
    const padding = { top: 30, right: 90, bottom: 50, left: 90 };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Primary data
    const data = config.data;
    const labels = config.labels;
    const maxVal = Math.max(...data) * 1.1;
    const minVal = Math.min(...data) * 0.9;
    const range = maxVal - minVal;

    // Secondary data (for dual Y-axis)
    const hasSecondary = config.secondaryData && config.secondaryData.length > 0;
    let secondaryMaxVal, secondaryMinVal, secondaryRange;
    if (hasSecondary) {
        secondaryMaxVal = Math.max(...config.secondaryData) * 1.1;
        secondaryMinVal = Math.min(...config.secondaryData) * 0.9;
        secondaryRange = secondaryMaxVal - secondaryMinVal;
    }

    // Create primary points
    const points = data.map((val, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - ((val - minVal) / range) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    // Create secondary points
    let secondaryPoints = '';
    if (hasSecondary) {
        secondaryPoints = config.secondaryData.map((val, i) => {
            const x = padding.left + (i / (config.secondaryData.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - ((val - secondaryMinVal) / secondaryRange) * chartHeight;
            return `${x},${y}`;
        }).join(' ');
    }

    // Create area path for primary
    const areaPath = `M ${padding.left},${height - padding.bottom} ` +
        data.map((val, i) => {
            const x = padding.left + (i / (data.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - ((val - minVal) / range) * chartHeight;
            return `L ${x},${y}`;
        }).join(' ') +
        ` L ${width - padding.right},${height - padding.bottom} Z`;

    // Generate primary Y-axis labels (left)
    const yLabels = [];
    for (let i = 0; i <= 4; i++) {
        const val = minVal + (range * i / 4);
        const y = padding.top + chartHeight - (i / 4) * chartHeight;
        const formattedVal = config.suffix === '%' ? val.toFixed(1) : Math.round(val).toLocaleString('de-DE');
        yLabels.push({ val: formattedVal + (config.suffix || ''), y });
    }

    // Generate secondary Y-axis labels (right)
    const yLabelsRight = [];
    if (hasSecondary) {
        for (let i = 0; i <= 4; i++) {
            const val = secondaryMinVal + (secondaryRange * i / 4);
            const y = padding.top + chartHeight - (i / 4) * chartHeight;
            const formattedVal = config.secondarySuffix === '%' ? val.toFixed(1) :
                (config.secondarySuffix.includes('Mio') ? val.toFixed(1) : Math.round(val).toLocaleString('de-DE'));
            yLabelsRight.push({ val: formattedVal + (config.secondarySuffix || ''), y });
        }
    }

    container.innerHTML = `
        <svg width="${width}" height="${height}" style="display: block; margin: 0 auto;">
            <!-- Grid lines -->
            ${yLabels.map(l => `<line x1="${padding.left}" y1="${l.y}" x2="${width - padding.right}" y2="${l.y}" stroke="#e2e8f0" stroke-dasharray="4,4"/>`).join('')}

            <!-- Area fill for primary -->
            <path d="${areaPath}" fill="${config.color}" fill-opacity="0.1"/>

            <!-- Primary Line -->
            <polyline fill="none" stroke="${config.color}" stroke-width="3" points="${points}" stroke-linecap="round" stroke-linejoin="round"/>

            ${hasSecondary ? `
            <!-- Secondary Line (dashed) -->
            <polyline fill="none" stroke="${config.secondaryColor}" stroke-width="2" stroke-dasharray="6,4" points="${secondaryPoints}" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- Secondary Data points -->
            ${config.secondaryData.map((val, i) => {
                const x = padding.left + (i / (config.secondaryData.length - 1)) * chartWidth;
                const y = padding.top + chartHeight - ((val - secondaryMinVal) / secondaryRange) * chartHeight;
                return `<circle cx="${x}" cy="${y}" r="4" fill="${config.secondaryColor}" stroke="white" stroke-width="2"/>`;
            }).join('')}
            ` : ''}

            <!-- Primary Data points -->
            ${data.map((val, i) => {
                const x = padding.left + (i / (data.length - 1)) * chartWidth;
                const y = padding.top + chartHeight - ((val - minVal) / range) * chartHeight;
                return `<circle cx="${x}" cy="${y}" r="6" fill="white" stroke="${config.color}" stroke-width="3"/>`;
            }).join('')}

            <!-- X-axis labels -->
            ${labels.map((label, i) => {
                const x = padding.left + (i / (data.length - 1)) * chartWidth;
                return `<text x="${x}" y="${height - 25}" text-anchor="middle" font-size="12" fill="#64748b">${label}</text>`;
            }).join('')}

            <!-- Left Y-axis labels -->
            ${yLabels.map(l => `<text x="${padding.left - 12}" y="${l.y + 4}" text-anchor="end" font-size="11" fill="${config.color}">${l.val}</text>`).join('')}

            <!-- Left Y-axis title -->
            <text x="20" y="${padding.top + chartHeight / 2}" text-anchor="middle" font-size="11" fill="${config.color}" transform="rotate(-90, 20, ${padding.top + chartHeight / 2})">${config.axisLabel || ''}</text>

            ${hasSecondary ? `
            <!-- Right Y-axis labels -->
            ${yLabelsRight.map(l => `<text x="${width - padding.right + 12}" y="${l.y + 4}" text-anchor="start" font-size="11" fill="${config.secondaryColor}">${l.val}</text>`).join('')}

            <!-- Right Y-axis title -->
            <text x="${width - 20}" y="${padding.top + chartHeight / 2}" text-anchor="middle" font-size="11" fill="${config.secondaryColor}" transform="rotate(90, ${width - 20}, ${padding.top + chartHeight / 2})">${config.secondaryLabel || ''}</text>
            ` : ''}
        </svg>

        <!-- Legend -->
        <div style="display: flex; justify-content: center; gap: 24px; margin-top: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="${config.color}" stroke-width="3"/></svg>
                <span style="font-size: 12px; color: #64748b;">${config.axisLabel || 'Primär'}</span>
            </div>
            ${hasSecondary ? `
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="${config.secondaryColor}" stroke-width="2" stroke-dasharray="6,4"/></svg>
                <span style="font-size: 12px; color: #64748b;">${config.secondaryLabel || 'Sekundär'}</span>
            </div>
            ` : ''}
        </div>
    `;
}

// Close chart popup
function closeChartPopup() {
    const overlay = document.querySelector('.chart-popup-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Filter by DPD bucket
function filterByDPDBucket(bucket) {
    const bucketConfig = {
        '0-30': { label: '0-30 Tage', minDpd: 0, maxDpd: 30 },
        '31-90': { label: '31-90 Tage', minDpd: 31, maxDpd: 90 },
        '90+': { label: '> 90 Tage', minDpd: 91, maxDpd: 999 }
    };

    const config = bucketConfig[bucket];
    if (!config) return;

    showNotification(`Filter: DPD ${config.label}`, 'info');
    console.log('Filtering by DPD bucket:', bucket);

    // Filter table rows by DPD value
    const table = document.querySelector('.banken-page .customer-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    let matchCount = 0;

    rows.forEach(row => {
        const dpdBadge = row.querySelector('.dpd-badge');
        if (dpdBadge) {
            const dpd = parseInt(dpdBadge.textContent) || 0;
            if (dpd >= config.minDpd && dpd <= config.maxDpd) {
                row.style.display = '';
                matchCount++;
            } else {
                row.style.display = 'none';
            }
        }
    });

    // Update pagination
    const paginationText = document.querySelector('.table-pagination span');
    if (paginationText) {
        paginationText.textContent = `Zeige ${matchCount} Fälle mit DPD ${config.label}`;
    }
}

// Toggle all NPL checkboxes
function toggleAllNpl(checkbox) {
    const isChecked = checkbox.checked;
    document.querySelectorAll('.npl-checkbox').forEach(cb => {
        cb.checked = isChecked;
    });
    updateBulkActionState();
}

// Update bulk action buttons state
function updateBulkActionState() {
    const checkedBoxes = document.querySelectorAll('.npl-checkbox:checked');
    const bulkButtons = document.querySelectorAll('.btn-bulk');

    bulkButtons.forEach(btn => {
        btn.disabled = checkedBoxes.length === 0;
        btn.style.opacity = checkedBoxes.length === 0 ? '0.5' : '1';
    });
}

// Bulk action handler
function bulkAction(action) {
    const checkedBoxes = document.querySelectorAll('.npl-checkbox:checked');
    const count = checkedBoxes.length;

    if (count === 0) {
        showNotification('Bitte wählen Sie mindestens einen Fall aus', 'warning');
        return;
    }

    const actions = {
        'assign': `${count} Fälle werden zugewiesen...`,
        'escalate': `${count} Fälle werden eskaliert...`,
        'writeoff': `${count} Fälle zur Abschreibung markiert`
    };

    showNotification(actions[action] || `Aktion "${action}" für ${count} Fälle`, 'success');
    console.log('Bulk action:', action, 'for', count, 'cases');
}

// Open case detail
function openCase(caseId) {
    showNotification(`Fall ${caseId} wird geöffnet...`, 'info');
    console.log('Opening case:', caseId);
    // Here would normally open a modal or navigate to case detail
}

// Call customer
function callCustomer(customerId) {
    showNotification(`Anruf wird gestartet für Kunde ${customerId}...`, 'success');
    console.log('Calling customer:', customerId);
}

// Send reminder
function sendReminder(customerId) {
    showNotification(`Mahnung wird versendet an Kunde ${customerId}...`, 'info');
    console.log('Sending reminder to:', customerId);
}

// Schedule callback
function scheduleCallback(customerId) {
    showNotification(`Rückruf geplant für Kunde ${customerId}`, 'success');
    console.log('Scheduling callback for:', customerId);
}

// Complete task
function completeTask(taskId) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
        taskElement.classList.add('completed');
    }
    showNotification(`Aufgabe ${taskId} abgeschlossen`, 'success');
    console.log('Completing task:', taskId);
}

// Export report
function exportReport(reportType) {
    showNotification(`${reportType} Report wird erstellt...`, 'info');
    console.log('Exporting report:', reportType);
}

// ========================================
// NEW: Section Navigation Functions
// ========================================

// Show Banken Section (Navigation Tiles)
function showBankenSection(sectionName) {
    // Update nav tiles
    document.querySelectorAll('.nav-tile').forEach(tile => {
        tile.classList.remove('active');
    });

    // Find and activate clicked tile
    document.querySelectorAll('.nav-tile').forEach(tile => {
        const onclickAttr = tile.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${sectionName}'`)) {
            tile.classList.add('active');
        }
    });

    // Update section content
    document.querySelectorAll('.banken-section').forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    console.log('Showing Banken section:', sectionName);
}

// Show overdue cases - navigates to Aufgaben section
function showOverdueCases() {
    showBankenSection('aufgaben');
    showNotification('23 überfällige Fälle werden angezeigt', 'warning');
    console.log('Showing overdue cases');
}

// Dismiss alert banner
function dismissAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
        alert.style.display = 'none';
    }
}

// ========================================
// NEW: Customer Detail Modal Functions
// ========================================

// Open customer detail modal
function openCustomerDetail(customerId) {
    const modal = document.getElementById('customerDetailModal');
    if (modal) {
        modal.style.display = 'flex';

        // Get full customer data
        const customer = getFullCustomerData(customerId);

        // Update modal header
        const customerNameEl = document.getElementById('customerName');
        if (customerNameEl) {
            customerNameEl.textContent = customer.name;
        }

        // Update customer ID display
        const customerIdEl = modal.querySelector('.customer-id');
        if (customerIdEl) {
            customerIdEl.textContent = customerId;
        }

        // Update all tabs with customer data
        updateStammdatenFields(modal, customer);
        updateKontenFields(modal, customer);
        updateKommunikationFields(modal, customer);
        updateKiAnalyseFields(modal, customer);

        // Always reset to Stammdaten tab when opening
        showCustomerTab('stammdaten');
        console.log('Opening customer detail:', customerId, customer.name);
    }
}

// Get full customer data for modal display (all tabs)
function getFullCustomerData(customerId) {
    const customers = {
        'K-2024-0001': {
            // Stammdaten
            name: 'Mueller GmbH', type: 'Gewerbe', rechtsform: 'GmbH',
            adresse: 'Musterstraße 123, 38100 Braunschweig', telefon: '+49 531 123456',
            email: 'info@mueller-gmbh.de', ansprechpartner: 'Hans Mueller',
            branche: 'Gastronomie', restschuld: 125000, status: 'Inkasso',
            // Konten & Finanzen
            krediteAnzahl: 5, gesamtforderung: 350500, monatsrate: 2380, ueberfaellig: 15000,
            rueckgabequote: 34, hauptforderung: 110000, zinsen: 8450, mahngebuehren: 350, inkassokosten: 6200,
            dpd: 35,
            // KI-Analyse
            willingness: 25, ability: 60, segment: 'eskalation',
            kernproblem: 'Gewerbekunde mit Liquiditätsengpässen seit Q3 2025. Gastronomie-Branche mit saisonalen Schwankungen. Mehrfache Lastschriftrückgaben trotz grundsätzlicher Zahlungsfähigkeit.',
            // Kommunikation
            workflowStatus: 'Inkasso-Verfahren', mahnstufe: 3
        },
        'K-2024-7234': {
            name: 'Braun, Thomas', type: 'Privat', rechtsform: 'Privatperson',
            adresse: 'Lindenweg 45, 30159 Hannover', telefon: '+49 511 987654',
            email: 't.braun@email.de', ansprechpartner: 'Thomas Braun',
            branche: 'Angestellter', restschuld: 0, status: 'Bezahlt',
            statusBadge: 'success', statusText: 'Vollständig beglichen am 16.12.2025',
            krediteAnzahl: 1, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
            rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
            dpd: 0, willingness: 90, ability: 85, segment: 'abgeschlossen',
            kernproblem: 'Fall abgeschlossen. Kunde hat Ratenkredit vollständig beglichen. Gute Zahlungsmoral nach Vereinbarung.',
            workflowStatus: 'Abgeschlossen', mahnstufe: 0
        },
        'K-2024-6891': {
            name: 'Klein KG', type: 'Gewerbe', rechtsform: 'KG',
            adresse: 'Industriestraße 78, 40210 Düsseldorf', telefon: '+49 211 456789',
            email: 'info@klein-kg.de', ansprechpartner: 'Peter Klein',
            branche: 'Großhandel', restschuld: 0, status: 'Bezahlt',
            statusBadge: 'success', statusText: 'Vollständig beglichen am 14.12.2025',
            krediteAnzahl: 2, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
            rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
            dpd: 0, willingness: 85, ability: 75, segment: 'abgeschlossen',
            kernproblem: 'Fall abgeschlossen. Betriebsmittelkredit nach Ratenvereinbarung vollständig getilgt.',
            workflowStatus: 'Abgeschlossen', mahnstufe: 0
        },
        'K-2024-6234': {
            name: 'Fischer, Maria', type: 'Privat', rechtsform: 'Privatperson',
            adresse: 'Rosenstraße 12, 50667 Köln', telefon: '+49 221 334455',
            email: 'm.fischer@web.de', ansprechpartner: 'Maria Fischer',
            branche: 'Rentnerin', restschuld: 0, status: 'Bezahlt',
            statusBadge: 'success', statusText: 'Teilzahlung abgeschlossen',
            krediteAnzahl: 1, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
            rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
            dpd: 0, willingness: 80, ability: 50, segment: 'abgeschlossen',
            kernproblem: 'Fall abgeschlossen. Rentnerin mit eingeschränkter Zahlungsfähigkeit, aber hoher Kooperationsbereitschaft.',
            workflowStatus: 'Abgeschlossen', mahnstufe: 0
        },
        'K-2024-5982': {
            name: 'Meier, Stefan', type: 'Privat', rechtsform: 'Privatperson',
            adresse: 'Hauptstraße 56, 80331 München', telefon: '+49 89 112233',
            email: 's.meier@gmx.de', ansprechpartner: 'Stefan Meier',
            branche: 'Selbstständig', restschuld: 0, status: 'Bezahlt',
            statusBadge: 'success', statusText: 'Dispo ausgeglichen',
            krediteAnzahl: 1, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
            rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
            dpd: 0, willingness: 75, ability: 70, segment: 'abgeschlossen',
            kernproblem: 'Fall abgeschlossen. Selbstständiger mit Einkommensschwankungen hat Dispo ausgeglichen.',
            workflowStatus: 'Abgeschlossen', mahnstufe: 0
        },
        'K-2024-5876': {
            name: 'Schneider Logistik GmbH', type: 'Gewerbe', rechtsform: 'GmbH',
            adresse: 'Hafenstraße 200, 20457 Hamburg', telefon: '+49 40 778899',
            email: 'info@schneider-logistik.de', ansprechpartner: 'Klaus Schneider',
            branche: 'Transport & Logistik', restschuld: 0, status: 'Bezahlt',
            statusBadge: 'success', statusText: 'Kontokorrent ausgeglichen',
            krediteAnzahl: 3, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
            rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
            dpd: 0, willingness: 80, ability: 85, segment: 'abgeschlossen',
            kernproblem: 'Fall abgeschlossen. Logistikunternehmen hat Kontokorrent nach kurzfristigem Engpass ausgeglichen.',
            workflowStatus: 'Abgeschlossen', mahnstufe: 0
        },
        'K-2024-5734': {
            name: 'Fischer, Anna', type: 'Privat', rechtsform: 'Privatperson',
            adresse: 'Gartenweg 8, 70173 Stuttgart', telefon: '+49 711 223344',
            email: 'a.fischer@outlook.de', ansprechpartner: 'Anna Fischer',
            branche: 'Beamtin', restschuld: 0, status: 'Bezahlt',
            statusBadge: 'success', statusText: 'Kreditkarte beglichen',
            krediteAnzahl: 1, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
            rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
            dpd: 0, willingness: 95, ability: 90, segment: 'abgeschlossen',
            kernproblem: 'Fall abgeschlossen. Beamtin mit sicherem Einkommen hat Kreditkarte vollständig beglichen.',
            workflowStatus: 'Abgeschlossen', mahnstufe: 0
        },
        'K-2024-5612': {
            name: 'Bäckerei Müller', type: 'Gewerbe', rechtsform: 'Einzelunternehmen',
            adresse: 'Marktplatz 3, 60311 Frankfurt', telefon: '+49 69 445566',
            email: 'info@baeckerei-mueller.de', ansprechpartner: 'Werner Müller',
            branche: 'Lebensmittel / Gastronomie', restschuld: 0, status: 'Bezahlt',
            statusBadge: 'success', statusText: 'Investitionskredit vollständig getilgt',
            krediteAnzahl: 1, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
            rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
            dpd: 0, willingness: 85, ability: 80, segment: 'abgeschlossen',
            kernproblem: 'Fall abgeschlossen. Bäckerei hat Investitionskredit nach Restrukturierung vollständig getilgt.',
            workflowStatus: 'Abgeschlossen', mahnstufe: 0
        },
        'K-2024-8847': {
            name: 'Müller, Hans', type: 'Privat', rechtsform: 'Privatperson',
            adresse: 'Waldstraße 22, 38100 Braunschweig', telefon: '+49 531 998877',
            email: 'h.mueller@email.de', ansprechpartner: 'Hans Müller',
            branche: 'Angestellter', restschuld: 4230, status: 'Offen',
            krediteAnzahl: 1, gesamtforderung: 4230, monatsrate: 180, ueberfaellig: 540,
            rueckgabequote: 0, hauptforderung: 4000, zinsen: 180, mahngebuehren: 50, inkassokosten: 0,
            dpd: 2, willingness: 85, ability: 70, segment: 'prioritaet',
            kernproblem: 'Neuer Fall. Angestellter mit stabilem Einkommen. Verzug vermutlich durch Vergessen/Übersehen. Hohe Erfolgswahrscheinlichkeit.',
            workflowStatus: 'Zahlungserinnerung', mahnstufe: 1
        },
        'K-2024-8846': {
            name: 'Schmidt GmbH', type: 'Gewerbe', rechtsform: 'GmbH',
            adresse: 'Berliner Allee 100, 30175 Hannover', telefon: '+49 511 665544',
            email: 'info@schmidt-gmbh.de', ansprechpartner: 'Michael Schmidt',
            branche: 'IT-Dienstleistungen', restschuld: 12890, status: 'Offen',
            krediteAnzahl: 2, gesamtforderung: 12890, monatsrate: 650, ueberfaellig: 1950,
            rueckgabequote: 0, hauptforderung: 12000, zinsen: 640, mahngebuehren: 150, inkassokosten: 100,
            dpd: 3, willingness: 75, ability: 80, segment: 'prioritaet',
            kernproblem: 'Neuer Fall. IT-Dienstleister mit guter Auftragslage. Verzug vermutlich durch verspätete Kundenzahlungen.',
            workflowStatus: 'Zahlungserinnerung', mahnstufe: 1
        },
        'K-2024-8845': {
            name: 'Weber, Anna', type: 'Privat', rechtsform: 'Privatperson',
            adresse: 'Blumenweg 15, 50668 Köln', telefon: '+49 221 887766',
            email: 'a.weber@web.de', ansprechpartner: 'Anna Weber',
            branche: 'Freiberuflerin', restschuld: 2150, status: 'Offen',
            krediteAnzahl: 1, gesamtforderung: 2150, monatsrate: 120, ueberfaellig: 360,
            rueckgabequote: 0, hauptforderung: 2000, zinsen: 100, mahngebuehren: 50, inkassokosten: 0,
            dpd: 5, willingness: 70, ability: 55, segment: 'prioritaet',
            kernproblem: 'Neuer Fall. Freiberuflerin mit schwankendem Einkommen. Kreditkartenschuld durch unerwartete Ausgaben.',
            workflowStatus: 'Zahlungserinnerung', mahnstufe: 1
        }
    };

    // Return customer or generate default data
    const customer = customers[customerId];
    if (customer) return customer;

    // Default fallback for unknown customers
    return {
        name: customerId, type: 'Unbekannt', rechtsform: '-',
        adresse: '-', telefon: '-', email: '-', ansprechpartner: '-',
        branche: '-', restschuld: 0, status: 'Unbekannt',
        krediteAnzahl: 0, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
        rueckgabequote: 0, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
        dpd: 0, willingness: 50, ability: 50, segment: 'unbekannt',
        kernproblem: 'Keine Daten verfügbar.',
        workflowStatus: 'Unbekannt', mahnstufe: 0
    };
}

// Update Stammdaten fields in modal - finds fields by label text
function updateStammdatenFields(modal, customer) {
    const stammdatenTab = modal.querySelector('#tab-stammdaten');
    if (!stammdatenTab) return;

    // Helper function to find and update a field by its label text
    function updateFieldByLabel(labelText, newValue) {
        const rows = stammdatenTab.querySelectorAll('.stammdaten-row');
        for (const row of rows) {
            const label = row.querySelector('.label');
            if (label && label.textContent.trim().toLowerCase().includes(labelText.toLowerCase())) {
                const value = row.querySelector('.value');
                if (value) {
                    value.textContent = newValue;
                    return value;
                }
            }
        }
        return null;
    }

    // Update Unternehmensdaten section
    updateFieldByLabel('Firmenname', customer.name);
    updateFieldByLabel('Rechtsform', customer.rechtsform || customer.type);
    updateFieldByLabel('Branche', customer.branche || '-');

    // Update Kundentyp badge
    const kundentypValue = updateFieldByLabel('Kundentyp', '');
    if (kundentypValue) {
        const isGewerbe = customer.type === 'Gewerbe';
        kundentypValue.innerHTML = isGewerbe
            ? '<span class="badge gewerbe">Gewerbekunde</span>'
            : '<span class="badge privat">Privatkunde</span>';
    }

    // Update Kontaktdaten section
    if (customer.adresse) {
        updateFieldByLabel('Adresse', customer.adresse);
    }
    if (customer.telefon) {
        const telefonValue = updateFieldByLabel('Telefon Zentrale', customer.telefon);
        if (telefonValue) {
            telefonValue.className = 'value clickable';
            telefonValue.setAttribute('onclick', `initiateCall('${customer.telefon}')`);
        }
    }
    if (customer.email) {
        const emailValue = updateFieldByLabel('E-Mail', customer.email);
        if (emailValue) {
            emailValue.className = 'value clickable';
            emailValue.setAttribute('onclick', `sendEmail('${customer.email}')`);
        }
    }

    // Update Geschäftsführung / Ansprechpartner in subsections
    const subsections = stammdatenTab.querySelectorAll('.stammdaten-subsection');
    for (const subsection of subsections) {
        const subsectionText = subsection.textContent.toLowerCase();
        if (subsectionText.includes('geschäftsführung') || subsectionText.includes('ansprechpartner')) {
            const nextRow = subsection.nextElementSibling;
            if (nextRow && nextRow.classList.contains('stammdaten-row')) {
                const nameValue = nextRow.querySelector('.value');
                if (nameValue && customer.ansprechpartner) {
                    nameValue.textContent = customer.ansprechpartner;
                }
            }
        }
    }

    // Update Kreditdetails section
    const restschuldValue = updateFieldByLabel('Restschuld', '');
    if (restschuldValue) {
        if (customer.restschuld === 0) {
            restschuldValue.textContent = '€0';
            restschuldValue.className = 'value highlight-green';
            restschuldValue.style.color = '#22c55e';
        } else {
            restschuldValue.textContent = '€' + customer.restschuld.toLocaleString('de-DE');
            restschuldValue.className = 'value highlight-red';
        }
    }

    // Update Stage based on status
    const stageValue = updateFieldByLabel('Stage', '');
    if (stageValue) {
        if (customer.status === 'Bezahlt') {
            stageValue.innerHTML = '<span class="badge success">Abgeschlossen</span>';
        } else if (customer.status === 'Inkasso') {
            stageValue.innerHTML = '<span class="badge danger">Stage 3 (NPL)</span>';
        } else {
            stageValue.innerHTML = '<span class="badge warning">Stage 2</span>';
        }
    }

    // Show status badge for completed cases
    if (customer.statusBadge === 'success') {
        const headerActions = modal.querySelector('.modal-header-actions');
        let statusIndicator = modal.querySelector('.status-indicator-success');
        if (!statusIndicator && headerActions) {
            statusIndicator = document.createElement('span');
            statusIndicator.className = 'status-indicator-success';
            statusIndicator.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ' + customer.statusText;
            statusIndicator.style.cssText = 'display: flex; align-items: center; gap: 6px; color: #22c55e; font-size: 13px; font-weight: 500; margin-right: 12px;';
            headerActions.insertBefore(statusIndicator, headerActions.firstChild);
        }
    } else {
        const statusIndicator = modal.querySelector('.status-indicator-success');
        if (statusIndicator) statusIndicator.remove();
    }
}

// Update Konten & Finanzen tab
function updateKontenFields(modal, customer) {
    const kontenTab = modal.querySelector('#tab-konten');
    if (!kontenTab) return;

    // Update KPI values
    const kpis = kontenTab.querySelectorAll('.finanzen-kpi');
    if (kpis.length >= 5) {
        kpis[0].querySelector('.kpi-value').textContent = customer.krediteAnzahl || 0;
        kpis[1].querySelector('.kpi-value').textContent = '€' + (customer.gesamtforderung || 0).toLocaleString('de-DE');
        kpis[2].querySelector('.kpi-value').textContent = '€' + (customer.monatsrate || 0).toLocaleString('de-DE');
        kpis[3].querySelector('.kpi-value').textContent = '€' + (customer.ueberfaellig || 0).toLocaleString('de-DE');
        kpis[4].querySelector('.kpi-value').textContent = (customer.rueckgabequote || 0) + '%';
    }

    // Update Forderungen breakdown
    const forderungRows = kontenTab.querySelectorAll('.forderung-breakdown-row');
    if (forderungRows.length >= 4) {
        forderungRows[0].querySelector('.value').textContent = '€' + (customer.hauptforderung || 0).toLocaleString('de-DE');
        forderungRows[1].querySelector('.value').textContent = '€' + (customer.zinsen || 0).toLocaleString('de-DE');
        forderungRows[2].querySelector('.value').textContent = '€' + (customer.mahngebuehren || 0).toLocaleString('de-DE');
        forderungRows[3].querySelector('.value').textContent = '€' + (customer.inkassokosten || 0).toLocaleString('de-DE');
    }

    // Update credit product status badge
    const statusBadge = kontenTab.querySelector('.credit-status-badge');
    if (statusBadge) {
        if (customer.status === 'Bezahlt') {
            statusBadge.textContent = 'Beglichen';
            statusBadge.className = 'credit-status-badge success';
        } else {
            statusBadge.textContent = (customer.dpd || 0) + ' DPD';
            statusBadge.className = 'credit-status-badge ' + (customer.dpd > 30 ? 'danger' : 'warning');
        }
    }
}

// Update Kommunikation tab with KI summary
function updateKommunikationFields(modal, customer) {
    const kommTab = modal.querySelector('#tab-kommunikation');
    if (!kommTab) return;

    // Update workflow status
    const statusValue = kommTab.querySelector('.status-value');
    if (statusValue) {
        statusValue.textContent = customer.workflowStatus || 'Offen';
        statusValue.className = 'status-value ' + (customer.status === 'Bezahlt' ? 'success' :
            customer.status === 'Inkasso' ? 'inkasso' : 'offen');
    }

    // Add or update KI summary at the top of Kommunikation
    let kiSummary = kommTab.querySelector('.kommunikation-ki-summary');
    if (!kiSummary) {
        kiSummary = document.createElement('div');
        kiSummary.className = 'kommunikation-ki-summary';
        const header = kommTab.querySelector('.kommunikation-header');
        if (header) {
            header.after(kiSummary);
        }
    }

    // Generate KI summary based on customer data
    const mahnstufeText = customer.mahnstufe > 0 ? `Mahnstufe ${customer.mahnstufe}` : 'Keine Mahnungen';
    const statusClass = customer.status === 'Bezahlt' ? 'success' :
        customer.status === 'Inkasso' ? 'danger' : 'warning';

    kiSummary.innerHTML = `
        <div class="ki-summary-mini">
            <div class="ki-summary-header-mini">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4"></path>
                </svg>
                <span>KI-Zusammenfassung der Kommunikation</span>
            </div>
            <div class="ki-summary-content-mini">
                <p><strong>${customer.name}</strong> - ${customer.kernproblem || 'Keine Analyse verfügbar.'}</p>
                <div class="ki-summary-stats">
                    <span class="stat-item ${statusClass}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                            <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                        ${customer.workflowStatus || 'Offen'}
                    </span>
                    <span class="stat-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        ${mahnstufeText}
                    </span>
                    <span class="stat-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${customer.dpd || 0} DPD
                    </span>
                </div>
            </div>
        </div>
    `;

    // Update communication items with customer name
    const kommItems = kommTab.querySelectorAll('.komm-preview');
    kommItems.forEach(item => {
        let text = item.innerHTML;
        text = text.replace(/Herr Mueller/g, customer.type === 'Gewerbe' ? 'Firma ' + customer.name : customer.ansprechpartner);
        text = text.replace(/Mueller GmbH/g, customer.name);
        text = text.replace(/mueller-gmbh\.de/g, customer.email ? customer.email.split('@')[1] : 'kunde.de');
        item.innerHTML = text;
    });

    // Update email from field
    const metaFrom = kommTab.querySelector('.komm-item.incoming .komm-meta .meta-item');
    if (metaFrom && customer.email) {
        metaFrom.textContent = 'Von: ' + customer.email;
    }
}

// Update KI-Analyse tab
function updateKiAnalyseFields(modal, customer) {
    const kiTab = modal.querySelector('#tab-ki-analyse');
    if (!kiTab) return;

    // Update Kernproblem text
    const kernproblemP = kiTab.querySelector('.ki-summary-section:first-child p');
    if (kernproblemP) {
        kernproblemP.innerHTML = customer.kernproblem || 'Keine Analyse verfügbar.';
    }

    // Update Willingness/Ability scores
    const scoreBars = kiTab.querySelectorAll('.score-bar-visual .bar-fill');
    const scorePercents = kiTab.querySelectorAll('.score-percent');
    if (scoreBars.length >= 2 && scorePercents.length >= 2) {
        scoreBars[0].style.width = (customer.willingness || 50) + '%';
        scoreBars[1].style.width = (customer.ability || 50) + '%';
        scorePercents[0].textContent = (customer.willingness || 50) + '%';
        scorePercents[1].textContent = (customer.ability || 50) + '%';
    }

    // Update score point position in chart
    const scorePoint = kiTab.querySelector('.score-point');
    if (scorePoint) {
        scorePoint.style.left = (customer.willingness || 50) + '%';
        scorePoint.style.bottom = (customer.ability || 50) + '%';
    }

    // Update segment badge
    const segmentBadge = kiTab.querySelector('.segment-badge.large');
    if (segmentBadge) {
        const segmentNames = {
            'eskalation': 'Eskalation',
            'prioritaet': 'Priorität',
            'restrukturierung': 'Restrukturierung',
            'abwicklung': 'Abwicklung',
            'abgeschlossen': 'Abgeschlossen'
        };
        const segmentClasses = {
            'eskalation': 'escalate',
            'prioritaet': 'priority',
            'restrukturierung': 'restructure',
            'abwicklung': 'writeoff',
            'abgeschlossen': 'success'
        };
        const segment = customer.segment || 'prioritaet';
        segmentBadge.textContent = segmentNames[segment] || segment;
        segmentBadge.className = 'segment-badge large ' + (segmentClasses[segment] || '');
    }

    // Update segment description
    const segmentDesc = kiTab.querySelector('.ki-segment-result p');
    if (segmentDesc) {
        const segmentDescriptions = {
            'eskalation': `Basierend auf der Analyse wird ${customer.name} dem Segment <strong>Eskalation</strong> zugeordnet. Empfehlung: Intensivierung der Inkasso-Maßnahmen.`,
            'prioritaet': `${customer.name} zeigt hohe Kooperationsbereitschaft und Zahlungsfähigkeit. Empfehlung: Schnelle Vereinbarung anstreben.`,
            'restrukturierung': `${customer.name} benötigt eine Restrukturierung der Schulden. Empfehlung: Ratenzahlung oder Stundung vereinbaren.`,
            'abwicklung': `Bei ${customer.name} ist die Rückzahlung unwahrscheinlich. Empfehlung: Forderungsverkauf oder Abschreibung prüfen.`,
            'abgeschlossen': `Der Fall ${customer.name} wurde erfolgreich abgeschlossen. Forderung vollständig beglichen.`
        };
        segmentDesc.innerHTML = segmentDescriptions[customer.segment] ||
            `Basierend auf der Analyse wird ${customer.name} dem entsprechenden Segment zugeordnet.`;
    }

    // Update factors based on customer data
    const factorList = kiTab.querySelector('.factor-list');
    if (factorList && customer.status !== 'Bezahlt') {
        const factors = generateCustomerFactors(customer);
        factorList.innerHTML = factors.map(f => `
            <div class="factor-item ${f.type}">
                <span class="factor-icon">
                    ${f.type === 'positive'
                        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'}
                </span>
                <span class="factor-name">${f.name}</span>
                <span class="factor-impact">${f.impact}</span>
            </div>
        `).join('');
    } else if (factorList && customer.status === 'Bezahlt') {
        factorList.innerHTML = `
            <div class="factor-item positive">
                <span class="factor-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                <span class="factor-name">Forderung vollständig beglichen</span>
                <span class="factor-impact">+100 Punkte</span>
            </div>
            <div class="factor-item positive">
                <span class="factor-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                <span class="factor-name">Fall erfolgreich abgeschlossen</span>
                <span class="factor-impact">Kein Risiko</span>
            </div>
        `;
    }
}

// Generate customer-specific factors
function generateCustomerFactors(customer) {
    const factors = [];

    // Negative factors
    if (customer.dpd > 60) {
        factors.push({ type: 'negative', name: `Hoher Verzug (${customer.dpd} DPD)`, impact: '-30 Punkte' });
    } else if (customer.dpd > 30) {
        factors.push({ type: 'negative', name: `Moderater Verzug (${customer.dpd} DPD)`, impact: '-15 Punkte' });
    }

    if (customer.mahnstufe >= 3) {
        factors.push({ type: 'negative', name: `${customer.mahnstufe} Mahnungen ohne Reaktion`, impact: '-20 Punkte' });
    }

    if (customer.branche && (customer.branche.includes('Gastronomie') || customer.branche.includes('Restaurant'))) {
        factors.push({ type: 'negative', name: 'Branchenrisiko: Gastronomie', impact: '-15 Punkte' });
    }

    if (customer.willingness < 40) {
        factors.push({ type: 'negative', name: 'Geringe Zahlungsbereitschaft erkennbar', impact: '-25 Punkte' });
    }

    // Positive factors
    if (customer.willingness >= 70) {
        factors.push({ type: 'positive', name: 'Hohe Kooperationsbereitschaft', impact: '+20 Punkte' });
    }

    if (customer.ability >= 70) {
        factors.push({ type: 'positive', name: 'Gute Zahlungsfähigkeit', impact: '+15 Punkte' });
    }

    if (customer.type === 'Privat' && customer.branche && customer.branche.includes('Angestellt')) {
        factors.push({ type: 'positive', name: 'Stabiles Einkommen (Angestellter)', impact: '+10 Punkte' });
    }

    if (customer.type === 'Privat' && customer.branche && customer.branche.includes('Beamt')) {
        factors.push({ type: 'positive', name: 'Sichere Einkommensquelle (Beamter)', impact: '+15 Punkte' });
    }

    if (customer.dpd <= 14) {
        factors.push({ type: 'positive', name: 'Neuer Fall mit kurzer Verzugsdauer', impact: '+10 Punkte' });
    }

    return factors.slice(0, 5); // Max 5 factors
}

// Close customer detail modal
function closeCustomerDetail() {
    const modal = document.getElementById('customerDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show customer tab in modal
function showCustomerTab(tabName) {
    const modal = document.getElementById('customerDetailModal');
    if (!modal) return;

    // Update modal tabs (scoped to modal)
    modal.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    modal.querySelectorAll('.modal-tab').forEach(tab => {
        const onclickAttr = tab.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabName}'`)) {
            tab.classList.add('active');
        }
    });

    // Update tab content (scoped to modal)
    modal.querySelectorAll('.customer-tab').forEach(content => {
        content.classList.remove('active');
    });

    // Use modal.querySelector instead of document.getElementById to avoid
    // conflicts with duplicate IDs (e.g., tab-stammdaten exists in both
    // index.html for Agentur and modal-customer-detail.html)
    const targetTab = modal.querySelector(`#tab-${tabName}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    console.log('Customer tab:', tabName);
}

// Toggle between chart and table view for credit products
function toggleCreditView(button, viewType) {
    const card = button.closest('.credit-product-large');
    if (!card) return;

    // Update toggle buttons
    card.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');

    // Update views
    card.querySelectorAll('.credit-view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = card.querySelector(`.${viewType}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }

    console.log('Credit view toggled:', viewType);
}

// ========================================
// NEW: Customer Actions
// ========================================

// Start Mahnprozess
function startMahnprozess(customerId) {
    showNotification(`Mahnprozess für ${customerId} gestartet`, 'info');
    console.log('Starting Mahnprozess:', customerId);
}

// Sell Case
function sellCase(customerId) {
    showNotification(`Fall ${customerId} zum Verkauf markiert`, 'warning');
    console.log('Selling case:', customerId);
}

// Write Off
function writeOff(customerId) {
    showNotification(`Fall ${customerId} zur Abschreibung vorgemerkt`, 'error');
    console.log('Writing off:', customerId);
}

// Schedule Call
function scheduleCall(customerId) {
    showNotification(`Anruf für ${customerId} geplant`, 'success');
    console.log('Scheduling call:', customerId);
}

// Create Agreement
function createAgreement(customerId) {
    showNotification(`Vereinbarung für ${customerId} wird erstellt`, 'info');
    console.log('Creating agreement:', customerId);
}

// View Agreement
function viewAgreement(customerId) {
    showNotification(`Vereinbarung für ${customerId} wird geladen`, 'info');
    console.log('Viewing agreement:', customerId);
}

// Show Full Letter (Kommunikation tab)
function showFullLetter(letterId) {
    // Define letter content based on ID
    const letters = {
        'mahnung-1': {
            title: '1. Mahnung - Freundliche Zahlungserinnerung',
            date: '15.10.2025',
            content: `
                <div class="full-letter-header">
                    <div class="letter-sender">
                        <strong>Musterbank AG</strong><br>
                        Forderungsmanagement<br>
                        Bankstraße 123<br>
                        60311 Frankfurt am Main
                    </div>
                    <div class="letter-recipient">
                        <strong>Mueller GmbH</strong><br>
                        Herr Hans Mueller<br>
                        Musterstraße 123<br>
                        38100 Braunschweig
                    </div>
                </div>
                <div class="letter-date">Frankfurt, 15.10.2025</div>
                <div class="letter-subject"><strong>1. Mahnung - Freundliche Zahlungserinnerung</strong></div>
                <div class="letter-text">
                    <p>Sehr geehrter Herr Mueller,</p>
                    <p>bei der Durchsicht unserer Konten haben wir festgestellt, dass folgende Zahlung noch aussteht:</p>
                    <p><strong>Offener Betrag: € 2.500,00</strong><br>
                    Vertragsnummer: BMK-2018-0456789<br>
                    Fälligkeitsdatum: 01.10.2025</p>
                    <p>Sicher handelt es sich nur um ein Versehen. Bitte überweisen Sie den ausstehenden Betrag bis zum <strong>25.10.2025</strong> auf unser Konto.</p>
                    <p>Sollten Sie die Zahlung bereits veranlasst haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.</p>
                    <p>Bei Fragen stehen wir Ihnen gerne unter der Rufnummer 0800 123 456 zur Verfügung.</p>
                    <p>Mit freundlichen Grüßen<br><br>
                    Ihr Forderungsmanagement<br>
                    Musterbank AG</p>
                </div>
            `
        },
        'mahnung-2': {
            title: '2. Mahnung - Zahlungserinnerung',
            date: '01.11.2025',
            content: `
                <div class="full-letter-header">
                    <div class="letter-sender">
                        <strong>Musterbank AG</strong><br>
                        Forderungsmanagement<br>
                        Bankstraße 123<br>
                        60311 Frankfurt am Main
                    </div>
                    <div class="letter-recipient">
                        <strong>Mueller GmbH</strong><br>
                        Herr Hans Mueller<br>
                        Musterstraße 123<br>
                        38100 Braunschweig
                    </div>
                </div>
                <div class="letter-date">Frankfurt, 01.11.2025</div>
                <div class="letter-subject"><strong>2. Mahnung - Zahlungserinnerung</strong></div>
                <div class="letter-text">
                    <p>Sehr geehrter Herr Mueller,</p>
                    <p>leider haben wir bis heute keinen Zahlungseingang zu unserer 1. Mahnung vom 15.10.2025 feststellen können.</p>
                    <p><strong>Offener Betrag: € 5.000,00</strong> (inkl. Mahngebühren € 15,00)<br>
                    Vertragsnummer: BMK-2018-0456789</p>
                    <p>Wir bitten Sie dringend, den offenen Betrag bis zum <strong>15.11.2025</strong> zu begleichen.</p>
                    <p>Sollte die Zahlung nicht fristgerecht erfolgen, behalten wir uns vor, weitere rechtliche Schritte einzuleiten.</p>
                    <p>Mit freundlichen Grüßen<br><br>
                    Ihr Forderungsmanagement<br>
                    Musterbank AG</p>
                </div>
            `
        },
        'mahnung-3': {
            title: 'Letzte Mahnung - Außergerichtliche Aufforderung',
            date: '15.11.2025',
            content: `
                <div class="full-letter-header">
                    <div class="letter-sender">
                        <strong>Musterbank AG</strong><br>
                        Inkasso-Abteilung<br>
                        Bankstraße 123<br>
                        60311 Frankfurt am Main
                    </div>
                    <div class="letter-recipient">
                        <strong>Mueller GmbH</strong><br>
                        Herr Hans Mueller<br>
                        Musterstraße 123<br>
                        38100 Braunschweig
                    </div>
                </div>
                <div class="letter-date">Frankfurt, 15.11.2025</div>
                <div class="letter-subject"><strong>LETZTE MAHNUNG - Außergerichtliche Zahlungsaufforderung</strong></div>
                <div class="letter-text">
                    <p>Sehr geehrter Herr Mueller,</p>
                    <p>trotz mehrfacher Aufforderung ist die ausstehende Forderung in Höhe von <strong>€ 7.500,00</strong> nicht beglichen worden.</p>
                    <p>Wir fordern Sie hiermit <strong>letztmalig</strong> auf, den offenen Betrag bis zum <strong>25.11.2025</strong> zu begleichen.</p>
                    <p><strong>Forderungsaufstellung:</strong><br>
                    Hauptforderung: € 7.500,00<br>
                    Zinsen (5,75% p.a.): € 145,30<br>
                    Mahngebühren: € 45,00<br>
                    <strong>Gesamtbetrag: € 7.690,30</strong></p>
                    <p>Sollte die Zahlung nicht fristgerecht eingehen, sehen wir uns gezwungen, den Fall <strong>ohne weitere Ankündigung</strong> an ein Inkassounternehmen zu übergeben und gerichtliche Schritte einzuleiten.</p>
                    <p>Mit freundlichen Grüßen<br><br>
                    Inkasso-Abteilung<br>
                    Musterbank AG</p>
                </div>
            `
        },
        'email-kunde-1': {
            title: 'E-Mail vom Kunden',
            date: '20.10.2025',
            content: `
                <div class="email-header">
                    <div class="email-meta">
                        <strong>Von:</strong> h.mueller@mueller-gmbh.de<br>
                        <strong>An:</strong> forderungsmanagement@musterbank.de<br>
                        <strong>Datum:</strong> 20.10.2025, 16:42<br>
                        <strong>Betreff:</strong> Re: Zahlungserinnerung
                    </div>
                </div>
                <div class="letter-text" style="background: #f8fafc; border-left: 3px solid #3b82f6;">
                    <p>Sehr geehrte Damen und Herren,</p>
                    <p>vielen Dank für Ihr Schreiben vom 15.10.2025.</p>
                    <p>Aufgrund von Liquiditätsengpässen in unserem Unternehmen ist es uns derzeit leider nicht möglich, die volle Rate zu begleichen. Wir hatten in den letzten Monaten unvorhergesehene Ausgaben und einen Umsatzrückgang.</p>
                    <p>Wir bitten daher um Verständnis und möchten eine Ratenzahlungsvereinbarung beantragen. Wir können ab dem 15.11.2025 monatlich € 1.500,00 zahlen, bis die offene Forderung beglichen ist.</p>
                    <p>Bitte teilen Sie uns mit, ob dies möglich ist.</p>
                    <p>Mit freundlichen Grüßen<br>
                    Hans Mueller<br>
                    Geschäftsführer<br>
                    Mueller GmbH</p>
                </div>
            `
        }
    };

    const letter = letters[letterId];
    if (!letter) {
        showNotification('Dokument nicht gefunden', 'error');
        return;
    }

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'letter-modal-overlay';
    overlay.innerHTML = `
        <div class="letter-modal">
            <div class="letter-modal-header">
                <h3>${letter.title}</h3>
                <button class="letter-modal-close" onclick="closeLetterModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="letter-modal-body">
                ${letter.content}
            </div>
            <div class="letter-modal-footer">
                <button class="btn-secondary" onclick="closeLetterModal()">Schließen</button>
                <button class="btn-primary" onclick="printLetter('${letterId}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    Drucken
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeLetterModal();
        }
    });

    // Close on ESC
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeLetterModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// Close letter modal
function closeLetterModal() {
    const overlay = document.querySelector('.letter-modal-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Print letter
function printLetter(letterId) {
    showNotification('Dokument wird gedruckt...', 'info');
    // In a real app, this would trigger print
    console.log('Printing letter:', letterId);
}

// Open CRM Profile from customer modal
function openCrmFromModal() {
    // Close the modal first
    closeCustomerDetail();

    // Then open CRM profile
    setTimeout(() => {
        openCrmProfile('K-2024-0001');
    }, 300);
}

// ========================================
// NEW: Task Management
// ========================================

// Filter Aufgaben
function filterAufgaben(filter) {
    // Update active button
    document.querySelectorAll('.aufgaben-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    // Filter task items
    const items = document.querySelectorAll('.aufgabe-item');
    items.forEach(item => {
        const status = item.dataset.status;
        if (filter === 'alle') {
            item.style.display = '';
        } else if (filter === status) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });

    // Update pagination info
    const visibleCount = document.querySelectorAll('.aufgabe-item:not([style*="display: none"])').length;
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `Zeige 1-${visibleCount} von ${visibleCount} Aufgaben`;
    }

    console.log('Filtering tasks:', filter, 'visible:', visibleCount);
}

// Reschedule Task
function rescheduleTask(taskId) {
    showNotification(`Aufgabe ${taskId} wird verschoben`, 'info');
    console.log('Rescheduling task:', taskId);
}

// ========================================
// NEW: Dashboard Functions
// ========================================

// Store chart instances for updates
let scatterPlotChart = null;
let portfolioChart = null;

// Initialize Banken Charts
function initBankenCharts() {
    console.log('Initializing Banken charts...');
    initScatterPlot();
    initPortfolioChart();
}

// Initialize Scatter Plot for Willingness vs. Ability Matrix
function initScatterPlot() {
    const canvas = document.getElementById('scatterPlotCanvas');
    if (!canvas) {
        console.warn('Scatter plot canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Generate sample data points for each quadrant
    const generatePoints = (count, xMin, xMax, yMin, yMax, color) => {
        const points = [];
        for (let i = 0; i < count; i++) {
            points.push({
                x: xMin + Math.random() * (xMax - xMin),
                y: yMin + Math.random() * (yMax - yMin),
            });
        }
        return points;
    };

    // Quadrant data (Willingness = X, Ability = Y)
    // Q1: High Willingness, High Ability (Priorität) - top right
    const prioritaetData = generatePoints(45, 55, 95, 55, 95, '#22c55e');
    // Q2: Low Willingness, High Ability (Restrukturierung) - top left
    const restrukturierungData = generatePoints(60, 5, 45, 55, 95, '#eab308');
    // Q3: Low Willingness, Low Ability (Eskalation) - bottom left
    const eskalationData = generatePoints(35, 5, 45, 5, 45, '#f97316');
    // Q4: High Willingness, Low Ability (Abwicklung) - bottom right
    const abwicklungData = generatePoints(55, 55, 95, 5, 45, '#ef4444');

    // Destroy existing chart if exists
    if (scatterPlotChart) {
        scatterPlotChart.destroy();
    }

    scatterPlotChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Priorität',
                    data: prioritaetData,
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: '#22c55e',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Restrukturierung',
                    data: restrukturierungData,
                    backgroundColor: 'rgba(234, 179, 8, 0.6)',
                    borderColor: '#eab308',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Eskalation',
                    data: eskalationData,
                    backgroundColor: 'rgba(249, 115, 22, 0.6)',
                    borderColor: '#f97316',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Abwicklung',
                    data: abwicklungData,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: '#ef4444',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Legend is shown below the chart
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Willingness: ${context.parsed.x.toFixed(0)}%, Ability: ${context.parsed.y.toFixed(0)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Willingness to Pay (%)',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Ability to Pay (%)',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });

    console.log('Scatter plot initialized');
}

// Initialize Portfolio Evolution Chart
function initPortfolioChart(period = '12m') {
    const canvas = document.getElementById('portfolioEvolutionChart');
    if (!canvas) {
        console.warn('Portfolio chart canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Generate monthly labels based on period
    const months = period === '12m' ? 12 : period === '6m' ? 6 : 3;
    const labels = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }));
    }

    // Generate realistic portfolio data
    let baseValue = 9500;
    const portfolioData = labels.map((_, i) => {
        baseValue += Math.floor(Math.random() * 400) - 150;
        return baseValue;
    });

    // Destroy existing chart if exists
    if (portfolioChart) {
        portfolioChart.destroy();
    }

    portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Portfolio-Bestand',
                data: portfolioData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Fälle: ${context.parsed.y.toLocaleString('de-DE')}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('de-DE');
                        }
                    }
                }
            }
        }
    });

    console.log('Portfolio chart initialized for period:', period);
}

// Refresh Scatter Plot
function refreshScatterPlot() {
    showNotification('Matrix wird aktualisiert...', 'info');
    initScatterPlot();
}

// Export Matrix
function exportMatrix() {
    showNotification('Matrix wird exportiert...', 'info');
    console.log('Exporting matrix');
}

// Update Portfolio Chart
function updatePortfolioChart(period) {
    initPortfolioChart(period);
}

// Show All New Cases
function showAllNewCases() {
    showNotification('Alle neuen Fälle werden geladen...', 'info');
}

// Show All Resolved Cases
function showAllResolvedCases() {
    showNotification('Alle erledigten Fälle werden geladen...', 'info');
}

// Filter Customers
function filterCustomers(filterType, value) {
    console.log('Filtering customers by', filterType, ':', value);
}

// Search Customers
function searchCustomers(query) {
    console.log('Searching customers:', query);
}

// ========================================
// NEW: NPL Actions
// ========================================

// Review for Sale
function reviewForSale() {
    showNotification('Fälle für Verkauf werden geprüft...', 'info');
}

// Review for Write Off
function reviewForWriteOff() {
    showNotification('Fälle für Abschreibung werden geprüft...', 'info');
}

// Review for Restructure
function reviewForRestructure() {
    showNotification('Fälle für Restrukturierung werden geprüft...', 'info');
}

// ========================================
// NEW: Workflow Actions
// ========================================

// Add Note
function addNote() {
    showNotification('Notiz hinzugefügt', 'success');
}

// Write Off Case (from modal)
function writeOffCase() {
    showNotification('Fall zur Abschreibung vorgemerkt', 'warning');
    closeCustomerDetail();
}

// Show notification helper
function showNotification(message, type = 'info') {
    // Check if there's already a notification container
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position: fixed; top: 80px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px;';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    const colors = {
        'info': { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
        'success': { bg: '#dcfce7', color: '#166534', border: '#86efac' },
        'warning': { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
        'error': { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' }
    };
    const style = colors[type] || colors.info;

    notification.style.cssText = `
        padding: 12px 20px;
        background: ${style.bg};
        color: ${style.color};
        border: 1px solid ${style.border};
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    container.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show new cases panel
function showNewCases() {
    // Scroll to and highlight the updates panel
    const updatesPanel = document.querySelector('.updates-panel');
    if (updatesPanel) {
        updatesPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        updatesPanel.classList.add('highlight-pulse');
        setTimeout(() => updatesPanel.classList.remove('highlight-pulse'), 2000);
    }
    showNotification('47 neue Fälle seit letztem Login', 'info');
}

// Show payments panel
function showPayments() {
    // Scroll to and highlight the payments panel
    const paymentsPanel = document.querySelector('.payments-panel');
    if (paymentsPanel) {
        paymentsPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        paymentsPanel.classList.add('highlight-pulse');
        setTimeout(() => paymentsPanel.classList.remove('highlight-pulse'), 2000);
    }
    showNotification('31 Zahlungseingänge heute erfasst', 'success');
}

// Show promises panel
function showPromises() {
    showNotification('18 aktive Zahlungszusagen', 'info');
}

// Add animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes highlightPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3); }
    }
    .highlight-pulse {
        animation: highlightPulse 0.5s ease-in-out 3;
    }
`;
document.head.appendChild(animationStyles);

// Export module functions
window.switchModule = switchModule;
window.initModuleSelector = initModuleSelector;
window.showBankenTab = showBankenTab;
window.showBankenSection = showBankenSection;
window.filterBySegment = filterBySegment;
window.openSegmentFullscreen = openSegmentFullscreen;
window.clearSegmentFilter = clearSegmentFilter;
window.showChartPopup = showChartPopup;
window.closeChartPopup = closeChartPopup;
window.filterByDPDBucket = filterByDPDBucket;
window.toggleAllNpl = toggleAllNpl;
window.bulkAction = bulkAction;
window.openCase = openCase;
window.callCustomer = callCustomer;
window.sendReminder = sendReminder;
window.scheduleCallback = scheduleCallback;
window.completeTask = completeTask;
window.exportReport = exportReport;
window.showNotification = showNotification;
window.showNewCases = showNewCases;
window.showPayments = showPayments;
window.showPromises = showPromises;

// Customer Detail Modal
window.openCustomerDetail = openCustomerDetail;
window.closeCustomerDetail = closeCustomerDetail;
window.showCustomerTab = showCustomerTab;

// Customer Actions
window.startMahnprozess = startMahnprozess;
window.sellCase = sellCase;
window.writeOff = writeOff;
window.scheduleCall = scheduleCall;
window.createAgreement = createAgreement;
window.viewAgreement = viewAgreement;
window.showFullLetter = showFullLetter;
window.closeLetterModal = closeLetterModal;
window.printLetter = printLetter;
window.openCrmFromModal = openCrmFromModal;

// Task Management
window.filterAufgaben = filterAufgaben;
window.rescheduleTask = rescheduleTask;

// Dashboard Functions
window.initBankenCharts = initBankenCharts;
window.initScatterPlot = initScatterPlot;
window.initPortfolioChart = initPortfolioChart;
window.refreshScatterPlot = refreshScatterPlot;
window.exportMatrix = exportMatrix;
window.updatePortfolioChart = updatePortfolioChart;
window.showAllNewCases = showAllNewCases;
window.showAllResolvedCases = showAllResolvedCases;
window.filterCustomers = filterCustomers;
window.searchCustomers = searchCustomers;

// NPL Actions
window.reviewForSale = reviewForSale;
window.reviewForWriteOff = reviewForWriteOff;
window.reviewForRestructure = reviewForRestructure;

// Workflow Actions
window.addNote = addNote;
window.writeOffCase = writeOffCase;

// ========================================
// DOCUMENT SCANNER FUNCTIONS
// ========================================

let uploadedFile = null;
let uploadedFileData = null;

function openDocumentScanner() {
    const modal = document.getElementById('documentScannerModal');
    if (modal) {
        modal.classList.add('active');
        resetScanner();
    }
}

function closeDocumentScanner() {
    const modal = document.getElementById('documentScannerModal');
    if (modal) {
        modal.classList.remove('active');
        resetScanner();
    }
}

function resetScanner() {
    uploadedFile = null;
    uploadedFileData = null;

    // Reset to step 1
    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    const step1 = document.getElementById('scanner-step-1');
    if (step1) step1.classList.add('active');

    // Reset upload area
    const uploadPreview = document.getElementById('uploadPreview');
    const dropZone = document.getElementById('dropZone');
    if (uploadPreview) uploadPreview.style.display = 'none';
    if (dropZone) dropZone.style.display = 'block';
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) dropZone.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) dropZone.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) dropZone.classList.remove('dragover');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Ungültiges Dateiformat. Bitte PDF, JPG, PNG oder TIFF verwenden.', 'error');
        return;
    }

    uploadedFile = file;

    // Show preview
    const dropZone = document.getElementById('dropZone');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImage = document.getElementById('previewImage');
    const fileName = document.getElementById('fileName');

    if (dropZone) dropZone.style.display = 'none';
    if (uploadPreview) uploadPreview.style.display = 'block';
    if (fileName) fileName.textContent = file.name;

    // Create preview based on file type
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedFileData = e.target.result;
            if (previewImage) previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        // PDF - show placeholder
        if (previewImage) previewImage.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjUwIiB2aWV3Qm94PSIwIDAgMjAwIDI1MCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNmOGZhZmMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI0MCIgZmlsbD0iI2RjMjYyNiI+UERG PC90ZXh0Pjwvc3ZnPg==';
        uploadedFileData = 'pdf-placeholder';
    }
}

function removeUpload() {
    uploadedFile = null;
    uploadedFileData = null;

    const dropZone = document.getElementById('dropZone');
    const uploadPreview = document.getElementById('uploadPreview');

    if (dropZone) dropZone.style.display = 'block';
    if (uploadPreview) uploadPreview.style.display = 'none';
}

function openCamera() {
    showNotification('Kamera-Funktion wird in einer zukünftigen Version verfügbar sein.', 'info');
}

function startAIRecognition() {
    if (!uploadedFile) {
        showNotification('Bitte laden Sie zuerst ein Dokument hoch.', 'error');
        return;
    }

    // Move to step 2
    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    const step2 = document.getElementById('scanner-step-2');
    if (step2) step2.classList.add('active');

    // Set recognition image
    const recognitionImage = document.getElementById('recognitionImage');
    if (recognitionImage && uploadedFileData) {
        recognitionImage.src = uploadedFileData !== 'pdf-placeholder' ? uploadedFileData : document.getElementById('previewImage').src;
    }

    // Simulate AI recognition
    setTimeout(() => {
        const recognitionStatus = document.getElementById('recognitionStatus');
        const recognizedFields = document.getElementById('recognizedFields');

        if (recognitionStatus) recognitionStatus.style.display = 'none';
        if (recognizedFields) recognizedFields.style.display = 'block';

        // Fill in sample recognized data
        document.getElementById('rec-name').value = 'Schmidt Elektronik GmbH';
        document.getElementById('rec-address').value = 'Industriestr. 45, 38112 Braunschweig';
        document.getElementById('rec-iban').value = 'DE89 3704 0044 0532 0130 00';
        document.getElementById('rec-amount').value = '€ 8.450,00';
        document.getElementById('rec-due-date').value = '2025-10-15';

        showNotification('Dokumentenanalyse abgeschlossen', 'success');
    }, 2000);
}

function goToStep2() {
    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    const step2 = document.getElementById('scanner-step-2');
    if (step2) step2.classList.add('active');
}

function goToStep3() {
    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    const step3 = document.getElementById('scanner-step-3');
    if (step3) step3.classList.add('active');

    // Pre-fill form with recognized data
    document.getElementById('customer-name').value = document.getElementById('rec-name').value;
    document.getElementById('customer-street').value = document.getElementById('rec-address').value.split(',')[0] || '';
    document.getElementById('customer-iban').value = document.getElementById('rec-iban').value;
    document.getElementById('claim-amount').value = parseFloat(document.getElementById('rec-amount').value.replace(/[€\s.]/g, '').replace(',', '.')) || 0;
    document.getElementById('claim-due-date').value = document.getElementById('rec-due-date').value;

    // Set document preview
    const attachedDocPreview = document.getElementById('attachedDocPreview');
    const attachedDocName = document.getElementById('attachedDocName');
    if (attachedDocPreview) attachedDocPreview.src = document.getElementById('recognitionImage').src;
    if (attachedDocName) attachedDocName.textContent = uploadedFile ? uploadedFile.name : 'Dokument';
}

function createCustomerFromScan() {
    showNotification('Kunde wurde erfolgreich angelegt!', 'success');
    closeDocumentScanner();

    // Refresh the customer list or show new customer
    setTimeout(() => {
        showNotification('Neuer Fall wurde zur Segmentierung hinzugefügt.', 'info');
    }, 1000);
}

function showBulkImport() {
    showNotification('Bulk-Import wird vorbereitet...', 'info');
}

// ========================================
// FULL CRM PROFILE FUNCTIONS
// ========================================

function openCrmProfile(customerId, taskContext = null) {
    const crmView = document.getElementById('crmProfileView');
    if (crmView) {
        crmView.classList.add('active');

        // Get full customer data
        const customer = getFullCustomerData(customerId);

        // Update CRM header with customer name
        const crmHeader = crmView.querySelector('.crm-header h2, .crm-customer-name');
        if (crmHeader) {
            crmHeader.textContent = customer.name;
        }

        // Update CRM customer ID
        const crmCustomerId = crmView.querySelector('.crm-customer-id');
        if (crmCustomerId) {
            crmCustomerId.textContent = customerId;
        }

        // Update CRM fields using the same helper approach
        updateCrmFields(crmView, customer);

        // Show/hide task hint box
        const taskHintBox = document.getElementById('crmTaskHint');
        if (taskHintBox) {
            if (taskContext) {
                taskHintBox.style.display = 'block';
                taskHintBox.innerHTML = `
                    <div class="task-hint-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <strong>Offene Aufgabe:</strong> ${taskContext.title}
                    </div>
                    <div class="task-hint-meta">
                        <span class="task-hint-due ${taskContext.overdue ? 'overdue' : ''}">${taskContext.due}</span>
                        <button class="btn-ai-summary" onclick="showAiSummary('${customerId}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"></path>
                                <path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z"></path>
                            </svg>
                            KI-Zusammenfassung
                        </button>
                    </div>
                `;
            } else {
                taskHintBox.style.display = 'none';
            }
        }

        console.log('Opening CRM profile for customer:', customerId, customer.name, taskContext ? 'with task' : '');
    }
}

// Update CRM view fields with customer data
function updateCrmFields(crmView, customer) {
    // Helper to find and update by label
    function updateByLabel(labelText, newValue) {
        const rows = crmView.querySelectorAll('.crm-row, .info-row, .detail-row');
        for (const row of rows) {
            const label = row.querySelector('.label, .info-label, .detail-label');
            if (label && label.textContent.trim().toLowerCase().includes(labelText.toLowerCase())) {
                const value = row.querySelector('.value, .info-value, .detail-value');
                if (value) {
                    value.textContent = newValue;
                    return value;
                }
            }
        }
        return null;
    }

    // Update main fields
    updateByLabel('Firmenname', customer.name);
    updateByLabel('Name', customer.name);
    updateByLabel('Rechtsform', customer.rechtsform);
    updateByLabel('Branche', customer.branche);
    updateByLabel('Adresse', customer.adresse);
    updateByLabel('Telefon', customer.telefon);
    updateByLabel('E-Mail', customer.email);
    updateByLabel('Ansprechpartner', customer.ansprechpartner);

    // Update financial data
    updateByLabel('Restschuld', '€' + (customer.restschuld || 0).toLocaleString('de-DE'));
    updateByLabel('Gesamtforderung', '€' + (customer.gesamtforderung || 0).toLocaleString('de-DE'));

    // Update status badges
    const statusBadges = crmView.querySelectorAll('.status-badge, .segment-badge');
    statusBadges.forEach(badge => {
        if (customer.status === 'Bezahlt') {
            badge.textContent = 'Abgeschlossen';
            badge.className = badge.className.replace(/danger|warning|inkasso/g, 'success');
        }
    });
}

// Show AI Summary for customer
function showAiSummary(customerId) {
    showNotification('KI-Zusammenfassung wird erstellt...', 'info');

    // Simulate AI loading
    setTimeout(() => {
        const summary = `
            <div class="ai-summary-modal">
                <div class="ai-summary-header">
                    <div class="ai-summary-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        <span>KI-Zusammenfassung für ${customerId}</span>
                    </div>
                    <button onclick="this.closest('.ai-summary-modal').remove()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="ai-summary-content">
                    <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Kundenprofil
                    </h4>
                    <p>Der Kunde zeigt eine <strong>moderate Zahlungsbereitschaft</strong> (Willingness: 45%) bei <strong>eingeschränkter Zahlungsfähigkeit</strong> (Ability: 35%). Die Kommunikation war bisher konstruktiv.</p>

                    <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Aktivitäten (letzte 30 Tage)
                    </h4>
                    <ul>
                        <li>3 Telefonkontakte (2 erfolgreich, 1 nicht erreicht)</li>
                        <li>1 Zahlungsvereinbarung getroffen</li>
                        <li>Teilzahlung i.H.v. €1.200 eingegangen</li>
                    </ul>

                    <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Empfohlene nächste Schritte
                    </h4>
                    <ol>
                        <li><strong>Telefonat führen</strong> - Zahlungsvereinbarung nachfassen</li>
                        <li><strong>Ratenzahlung prüfen</strong> - Kunde hat Interesse signalisiert</li>
                        <li><strong>Dokumentation aktualisieren</strong> - Finanzielle Situation erfassen</li>
                    </ol>
                </div>
            </div>
        `;

        // Add modal to page
        const modalContainer = document.createElement('div');
        modalContainer.className = 'ai-summary-overlay';
        modalContainer.innerHTML = summary;
        modalContainer.onclick = (e) => {
            if (e.target === modalContainer) modalContainer.remove();
        };
        document.body.appendChild(modalContainer);
    }, 1500);
}

function closeCrmProfile() {
    const crmView = document.getElementById('crmProfileView');
    if (crmView) {
        crmView.classList.remove('active');
    }
}

function showCrmSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.crm-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeNav = document.querySelector(`.crm-nav-item[onclick="showCrmSection('${sectionName}')"]`);
    if (activeNav) activeNav.classList.add('active');

    // Update sections
    document.querySelectorAll('.crm-section').forEach(section => {
        section.classList.remove('active');
    });
    const activeSection = document.getElementById('crm-' + sectionName);
    if (activeSection) activeSection.classList.add('active');
}

// Toggle expandable document
function toggleDocument(docId) {
    const docItem = document.getElementById(docId);
    if (docItem) {
        // Toggle expanded class
        docItem.classList.toggle('expanded');

        // Optionally close other expanded documents
        document.querySelectorAll('.document-item.expanded').forEach(item => {
            if (item.id !== docId) {
                item.classList.remove('expanded');
            }
        });
    }
}

// Download document
function downloadDocument(docId) {
    showNotification(`Dokument ${docId} wird heruntergeladen...`, 'info');
    // In production, this would trigger actual file download
}

// Print document
function printDocument(docId) {
    const docItem = document.getElementById(docId);
    if (docItem) {
        const letterPreview = docItem.querySelector('.letter-preview, .contract-summary');
        if (letterPreview) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Dokument drucken</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                        .letter-preview { font-family: Georgia, serif; font-size: 13px; line-height: 1.8; }
                        .letter-header, .letter-recipient { font-size: 12px; margin-bottom: 24px; }
                        .letter-date { text-align: right; font-size: 12px; color: #666; margin-bottom: 24px; }
                        .letter-subject { font-size: 14px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #ccc; }
                        .letter-body p { margin: 0 0 12px 0; }
                        .contract-summary table { width: 100%; border-collapse: collapse; }
                        .contract-summary td { padding: 8px 0; border-bottom: 1px solid #eee; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>${letterPreview.outerHTML}</body>
                </html>
            `);
            printWindow.document.close();
            printWindow.onload = function() {
                printWindow.print();
            };
        }
    }
}

// Upload document
function uploadDocument() {
    showNotification('Dokument-Upload wird geöffnet...', 'info');
}

function crmCall() {
    showNotification('Anruf wird gestartet...', 'info');
}

function crmEmail() {
    showNotification('E-Mail-Vorlage wird geöffnet...', 'info');
}

function crmSchedule() {
    showNotification('Terminplanung wird geöffnet...', 'info');
}

function crmNote() {
    showNotification('Notizfeld wird geöffnet...', 'info');
}

function editStammdaten() {
    showNotification('Bearbeitungsmodus aktiviert', 'info');
}

// Update openCustomerDetail to use full CRM view
const originalOpenCustomerDetail = openCustomerDetail;
function openCustomerDetailCRM(customerId) {
    // Use the full CRM profile instead of the modal
    openCrmProfile(customerId);
}

// ========================================
// DEMO CUSTOMER FILE GENERATOR
// ========================================

function generateDemoCustomerFile() {
    // Random demo data
    const demoCustomers = [
        { name: 'Müller Maschinenbau GmbH', street: 'Industriestraße 45', zip: '70173', city: 'Stuttgart', iban: 'DE89 3704 0044 0532 0130 00', amount: 47850.00, dueDate: '2024-10-15', type: 'Gewerbe' },
        { name: 'Hans Schmidt', street: 'Hauptstraße 12', zip: '80331', city: 'München', iban: 'DE91 1000 0000 0123 4567 89', amount: 3420.50, dueDate: '2024-11-01', type: 'Privat' },
        { name: 'Weber & Söhne KG', street: 'Am Marktplatz 8', zip: '50667', city: 'Köln', iban: 'DE75 3705 0198 0012 3456 78', amount: 125000.00, dueDate: '2024-09-30', type: 'Gewerbe' },
        { name: 'Maria Fischer', street: 'Gartenweg 23', zip: '60311', city: 'Frankfurt', iban: 'DE44 5001 0517 5407 3249 31', amount: 8750.00, dueDate: '2024-10-20', type: 'Privat' },
        { name: 'Autohaus Berger GmbH', street: 'Berliner Allee 100', zip: '40210', city: 'Düsseldorf', iban: 'DE68 2105 0170 0012 3456 78', amount: 89300.00, dueDate: '2024-08-15', type: 'Gewerbe' }
    ];

    const customer = demoCustomers[Math.floor(Math.random() * demoCustomers.length)];
    const today = new Date().toLocaleDateString('de-DE');
    const docNumber = 'INK-' + Date.now().toString().slice(-8);

    // Create canvas for the document
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1130;
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header with bank logo placeholder
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(0, 0, 800, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('MUSTERBANK AG', 40, 55);
    ctx.font = '14px Arial';
    ctx.fillText('Forderungsmanagement', 40, 80);

    // Document title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Mahnung / Zahlungsaufforderung', 40, 160);

    // Document number and date
    ctx.font = '12px Arial';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Dokument-Nr.: ${docNumber}`, 550, 140);
    ctx.fillText(`Datum: ${today}`, 550, 160);

    // Customer data section
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40, 200, 720, 180);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(40, 200, 720, 180);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Kundendaten', 60, 230);

    ctx.font = '13px Arial';
    ctx.fillStyle = '#334155';

    const labels = ['Name / Firma:', 'Adresse:', '', 'Kundentyp:', 'IBAN:'];
    const values = [customer.name, customer.street, `${customer.zip} ${customer.city}`, customer.type, customer.iban];

    let y = 260;
    for (let i = 0; i < labels.length; i++) {
        if (labels[i]) {
            ctx.fillStyle = '#64748b';
            ctx.fillText(labels[i], 60, y);
            ctx.fillStyle = '#1e293b';
            ctx.fillText(values[i], 200, y);
        } else {
            ctx.fillStyle = '#1e293b';
            ctx.fillText(values[i], 200, y);
        }
        y += 25;
    }

    // Claim details section
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(40, 410, 720, 150);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 410, 720, 150);

    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Forderungsdetails', 60, 445);

    ctx.font = '13px Arial';
    ctx.fillStyle = '#78350f';
    ctx.fillText('Offener Betrag:', 60, 480);
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`€ ${customer.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`, 200, 482);

    ctx.font = '13px Arial';
    ctx.fillText('Fälligkeitsdatum:', 60, 515);
    ctx.font = '14px Arial';
    const dueDateFormatted = new Date(customer.dueDate).toLocaleDateString('de-DE');
    ctx.fillText(dueDateFormatted, 200, 515);

    ctx.fillText('Verzugstage:', 400, 515);
    const daysOverdue = Math.floor((new Date() - new Date(customer.dueDate)) / (1000 * 60 * 60 * 24));
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${Math.max(0, daysOverdue)} Tage`, 500, 515);

    // Text content
    ctx.fillStyle = '#334155';
    ctx.font = '12px Arial';
    const textLines = [
        'Sehr geehrte Damen und Herren,',
        '',
        'trotz unserer vorherigen Zahlungserinnerungen ist der oben genannte Betrag',
        'noch nicht auf unserem Konto eingegangen.',
        '',
        'Wir fordern Sie hiermit auf, den ausstehenden Betrag innerhalb von 10 Tagen',
        'auf das folgende Konto zu überweisen:',
        '',
        'Empfänger: Musterbank AG',
        'IBAN: DE12 3456 7890 1234 5678 90',
        'Verwendungszweck: ' + docNumber,
        '',
        'Bei Nichtzahlung behalten wir uns weitere rechtliche Schritte vor.',
        '',
        'Mit freundlichen Grüßen',
        'Ihr Forderungsmanagement-Team'
    ];

    let textY = 600;
    textLines.forEach(line => {
        ctx.fillText(line, 60, textY);
        textY += 20;
    });

    // Footer
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 1050, 800, 80);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Arial';
    ctx.fillText('Musterbank AG | Bankstraße 1 | 10115 Berlin | Tel: +49 30 12345-0 | forderung@musterbank.de', 40, 1080);
    ctx.fillText('Geschäftsführer: Dr. Max Mustermann | Amtsgericht Berlin HRB 12345 | USt-IdNr.: DE123456789', 40, 1095);

    // Add QR code placeholder
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(650, 600, 80, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px Arial';
    ctx.fillText('QR-Code', 670, 645);

    // Download the image
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Demo_Kundenakte_${docNumber}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('Demo-Kundenakte erstellt und heruntergeladen!', 'success');
    }, 'image/png');
}

// Scanner Functions
window.generateDemoCustomerFile = generateDemoCustomerFile;
window.openDocumentScanner = openDocumentScanner;
window.closeDocumentScanner = closeDocumentScanner;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.handleFileSelect = handleFileSelect;
window.removeUpload = removeUpload;
window.openCamera = openCamera;
window.startAIRecognition = startAIRecognition;
window.goToStep2 = goToStep2;
window.goToStep3 = goToStep3;
window.createCustomerFromScan = createCustomerFromScan;
window.showBulkImport = showBulkImport;

// CRM Functions
window.openCrmProfile = openCrmProfile;
window.closeCrmProfile = closeCrmProfile;
window.showCrmSection = showCrmSection;
window.showAiSummary = showAiSummary;
window.openTaskCustomer = openTaskCustomer;

// Open customer from task with task context
function openTaskCustomer(customerId, taskTitle, taskDue, isOverdue) {
    openCrmProfile(customerId, {
        title: taskTitle,
        due: taskDue,
        overdue: isOverdue
    });
}
window.crmCall = crmCall;
window.crmEmail = crmEmail;
window.crmSchedule = crmSchedule;
window.crmNote = crmNote;
window.editStammdaten = editStammdaten;

// ========================================
// DASHBOARD SUMMARY DOWNLOAD
// ========================================

function downloadDashboardSummary() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
    });

    let summary = `
################################################################################
################################################################################
##                                                                            ##
##              COLLECTIONS MANAGEMENT - VOLLSTÄNDIGE DOKUMENTATION           ##
##                    Braunschweiger Sparkasse | Forderungsmanagement         ##
##                                                                            ##
################################################################################
################################################################################

Erstellt am: ${dateStr} um ${timeStr} Uhr
Dokumentversion: 2.1 - Vollständige UI/UX Dokumentation

================================================================================
================================================================================
                        TEIL A: BENUTZEROBERFLÄCHE & NAVIGATION
================================================================================
================================================================================

Diese Dokumentation beschreibt vollständig den Aufbau, die Struktur und alle
Interaktionsmöglichkeiten des Collections Management Dashboards.

================================================================================
                    A1. DASHBOARD-STRUKTUR (Von oben nach unten)
================================================================================

Das Dashboard ist wie folgt aufgebaut (in der Reihenfolge von oben nach unten):

┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. HEADER-BEREICH (Ganz oben)                                               │
│    └── Modul-Tabs: [Versicherung] [Banken] [Asset Manager]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. NAVIGATIONS-KACHELN (4 Stück nebeneinander)                              │
│    └── [Kundensegmentierung] [Bestandskunden] [Offene Leads] [Prozesse]     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. KPI-BOXEN (4 Kennzahlen nebeneinander)                                   │
│    └── [Gesamtkredite] [Forderung] [Schulden/Kunde] [Aufgaben]              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. AKTIONS-LEISTE (Buttons für Hauptaktionen)                               │
│    └── [📷 Dokument scannen] [📥 Bulk-Import] [📄 Zusammenfassung]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. CHART-BEREICH (2 große Grafiken nebeneinander)                           │
│    └── Links: Willingness/Ability Matrix | Rechts: Portfolio-Entwicklung    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. INFO-KARTEN (2 Karten nebeneinander)                                     │
│    └── Links: Neue Fälle (47) | Rechts: Zahlungseingänge (31)               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. KUNDENLISTE (Scrollbare Tabelle)                                         │
│    └── Liste aller Kunden mit Bewertung und Aktionen                        │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                         A2. MODUL-TABS (Header-Bereich)
================================================================================

Position: Ganz oben auf der Seite
Aussehen: 3 Tabs nebeneinander

┌─────────────────────────────────────────────────────────────────────────────┐
│ TAB                │ KLICK-FUNKTION                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Versicherung       │ Zeigt das Versicherungs-Dashboard mit Kundenseg-       │
│                    │ mentierung, Bestandsanalyse und Vertragsverwaltung     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Banken             │ Zeigt das Collections-Dashboard (dieses Dashboard)     │
│ (AKTIV)            │ mit Forderungsmanagement und Schuldenanalyse           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Asset Manager      │ Zeigt das Asset-Management-Dashboard mit Portfolio-    │
│                    │ übersicht und Vermögensverwaltung                      │
└─────────────────────────────────────────────────────────────────────────────┘

KLICK-VERHALTEN:
• Bei Klick auf einen Tab wird die CSS-Klasse "active" gesetzt
• Der entsprechende Modul-Content wird eingeblendet (display: block)
• Alle anderen Module werden ausgeblendet (display: none)
• Der aktive Tab wird visuell hervorgehoben

================================================================================
                      A3. NAVIGATIONS-KACHELN (4 Kacheln)
================================================================================

Position: Direkt unter dem Header
Aussehen: 4 quadratische Kacheln nebeneinander mit Icons

┌─────────────────────────────────────────────────────────────────────────────┐
│ KACHEL                  │ KLICK-FUNKTION                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 Kundensegmentierung  │ Zeigt die Willingness/Ability-Matrix und alle     │
│    (AKTIV)              │ segmentierten Kunden. Hauptansicht für die        │
│                         │ KI-basierte Kundenklassifizierung.                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 👥 Bestandskunden       │ Wechselt zur Bestandskundenübersicht mit          │
│                         │ allen aktiven Kundenbeziehungen und deren         │
│                         │ Vertragshistorie.                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📋 Offene Leads         │ Zeigt potentielle Neukunden und offene            │
│                         │ Vertriebschancen im Forderungsbereich.            │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⚙️ Prozesse             │ Öffnet die Prozessübersicht mit laufenden         │
│                         │ Inkasso-Vorgängen und Mahnverfahren.              │
└─────────────────────────────────────────────────────────────────────────────┘

KLICK-VERHALTEN:
• Bei Klick wird die Kachel visuell als "aktiv" markiert
• Der zugehörige Content-Bereich wird eingeblendet
• Die Breadcrumb-Navigation wird aktualisiert
• Die URL wird ggf. mit einem Hash-Parameter versehen

================================================================================
                          A4. KPI-BOXEN (4 Kennzahlen)
================================================================================

Position: Unter den Navigations-Kacheln
Aussehen: 4 rechteckige Boxen nebeneinander mit großen Zahlen

┌─────────────────────────────────────────────────────────────────────────────┐
│ KPI-BOX                     │ ANGEZEIGTER WERT        │ KLICK-FUNKTION      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💰 Gesamtkredite            │ 10.234                  │ Filtert die Kunden- │
│    (Total Credits)          │ "+127 zur Vorwoche"     │ liste auf alle      │
│                             │                         │ Fälle               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 Ausstehende              │ € 47,8 Mio.             │ Sortiert die Liste  │
│    Gesamtforderung          │ "+€ 1,2 Mio."           │ nach Forderungs-    │
│    (Outstanding)            │                         │ höhe absteigend     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 👤 Schulden pro Kunde       │ € 4.672                 │ Zeigt Durchschnitts-│
│    (Avg. Debt per Customer) │ "-€ 89 (Verbesserung)"  │ berechnung-Details  │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⚠️ Offene Bewertungs-       │ 156                     │ Filtert auf offene  │
│    aufgaben                 │ "23 überfällig"         │ Aufgaben, markiert  │
│    (Pending Tasks)          │                         │ überfällige rot     │
└─────────────────────────────────────────────────────────────────────────────┘

VISUELLES FEEDBACK:
• Hover-Effekt: Box wird leicht angehoben (transform: translateY(-2px))
• Positive Trends: Grüner Pfeil ↑ und grüne Schrift
• Negative Trends: Roter Pfeil ↓ und rote Schrift
• Überfällige Aufgaben: Orange/Rot hervorgehoben

================================================================================
                      A5. AKTIONS-LEISTE (Action Bar)
================================================================================

Position: Unter den KPI-Boxen
Aussehen: Horizontale Leiste mit 3 Buttons

┌─────────────────────────────────────────────────────────────────────────────┐
│ BUTTON                      │ KLICK-FUNKTION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📷 Dokument scannen         │ Öffnet den Document Scanner Modal             │
│    (Scan Document)          │ → Siehe Abschnitt A8 für Details              │
│                             │ JavaScript: openDocumentScanner()             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📥 Bulk-Import              │ Öffnet Datei-Dialog für CSV/Excel-Import      │
│    (Bulk Import)            │ Ermöglicht Massenimport von Kundendaten       │
│                             │ JavaScript: triggerBulkImport()               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📄 Zusammenfassung          │ Lädt diese TXT-Datei herunter                 │
│    (Download Summary)       │ Generiert vollständigen Dashboard-Report      │
│                             │ JavaScript: downloadDashboardSummary()        │
└─────────────────────────────────────────────────────────────────────────────┘

BUTTON-STYLING:
• Primärer Button: Blauer Hintergrund, weißer Text
• Hover: Dunklerer Blauton
• Icons: Font Awesome oder Unicode-Emojis

================================================================================
                     A6. CHART-BEREICH (2 Hauptgrafiken)
================================================================================

Position: Zentral im Dashboard, unter der Aktions-Leiste
Aussehen: 2 große Chart-Container nebeneinander (50%/50%)

┌─────────────────────────────────────────────────────────────────────────────┐
│ CHART                           │ BESCHREIBUNG & INTERAKTIONEN              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 WILLINGNESS vs. ABILITY      │                                           │
│    MATRIX (Links)               │ ANZEIGE:                                  │
│                                 │ • Scatter-Plot mit 4 Quadranten           │
│    X-Achse: Willingness to Pay  │ • Jeder Punkt = 1 Kunde                   │
│    Y-Achse: Ability to Pay      │ • Farben nach Segment (s. unten)          │
│    Größe: Score-Confidence      │                                           │
│                                 │ KLICK-FUNKTIONEN:                         │
│    Quadranten:                  │ • Klick auf Punkt: Öffnet Kunden-Popup    │
│    ┌─────────┬─────────┐        │ • Klick auf Quadrant: Filtert Liste       │
│    │ RESTRUK │ PRIORIT │        │ • Hover: Zeigt Kunden-Kurzinfo            │
│    │ (gelb)  │ (grün)  │        │ • Zoom: Mausrad zum Zoomen               │
│    ├─────────┼─────────┤        │ • Pan: Klicken und Ziehen                │
│    │ ESKALAT │ ABWICK- │        │                                           │
│    │ (orange)│ (rot)   │        │ JavaScript: initScatterPlot()             │
│    └─────────┴─────────┘        │ Bibliothek: Chart.js                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📈 PORTFOLIO-ENTWICKLUNG        │                                           │
│    (Rechts)                     │ ANZEIGE:                                  │
│                                 │ • Linien-Chart mit 12 Monaten             │
│    X-Achse: Monate (12)         │ • 4 farbige Linien (je Segment)           │
│    Y-Achse: Anzahl Fälle        │ • Gesamttrend als gestrichelte Linie      │
│                                 │                                           │
│    Linien:                      │ KLICK-FUNKTIONEN:                         │
│    ── Grün: Priorität           │ • Klick auf Legende: Ein-/Ausblenden      │
│    ── Gelb: Restrukturierung    │ • Hover auf Datenpunkt: Tooltip           │
│    ── Orange: Eskalation        │ • Doppelklick: Zoom auf Zeitraum          │
│    ── Rot: Abwicklung           │                                           │
│    ┄┄ Grau: Gesamt              │ JavaScript: initPortfolioChart()          │
│                                 │ Bibliothek: Chart.js                      │
└─────────────────────────────────────────────────────────────────────────────┘

CHART-INTERAKTIONEN IM DETAIL:

Willingness/Ability Matrix:
• KLICK auf Datenpunkt:
  → Öffnet kleines Popup mit: Name, Score, Segment
  → "Details"-Button im Popup öffnet volles CRM-Profil
• HOVER auf Datenpunkt:
  → Tooltip zeigt: Kundenname, Willingness%, Ability%, Forderung€
• KLICK in Quadrant (freie Fläche):
  → Filtert Kundenliste auf dieses Segment
  → Aktualisiert KPI-Anzeige für das Segment
• ZOOM mit Mausrad:
  → Vergrößert/Verkleinert die Ansicht
• DOPPELKLICK:
  → Setzt Zoom zurück auf Standardansicht

Portfolio-Entwicklung:
• KLICK auf Legende:
  → Blendet entsprechende Linie ein/aus
  → Ermöglicht Fokus auf einzelne Segmente
• HOVER auf Datenpunkt:
  → Zeigt exakten Wert und Monat
  → Zeigt Veränderung zum Vormonat

================================================================================
                       A7. INFO-KARTEN (2 Highlight-Boxen)
================================================================================

Position: Unter den Charts
Aussehen: 2 hervorgehobene Karten mit wichtigen Kennzahlen

┌─────────────────────────────────────────────────────────────────────────────┐
│ KARTE                         │ KLICK-FUNKTION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🆕 NEUE FÄLLE SEIT LETZTEM    │ ANZEIGE:                                    │
│    LOGIN                      │ • Große Zahl: 47                            │
│                               │ • Untertitel: "Fälle"                       │
│    Badge: Blau                │ • KI-Bewertungsstatus                       │
│                               │                                             │
│                               │ KLICK:                                      │
│                               │ → Filtert Kundenliste auf neue Fälle        │
│                               │ → Sortiert nach Erfassungsdatum             │
│                               │ → Hebt neue Einträge gelb hervor            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💳 ZAHLUNGSEINGÄNGE           │ ANZEIGE:                                    │
│                               │ • Große Zahl: 31                            │
│    Badge: Grün                │ • Untertitel: "Zahlungen erhalten"          │
│                               │ • Trend-Indikator                           │
│                               │                                             │
│                               │ KLICK:                                      │
│                               │ → Filtert auf Kunden mit Zahlungen          │
│                               │ → Zeigt Zahlungshistorie                    │
│                               │ → Ermöglicht Segment-Upgrade                │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                    A8. DOCUMENT SCANNER (Modal-Dialog)
================================================================================

Aufruf: Klick auf "📷 Dokument scannen" in der Aktions-Leiste
Aussehen: Overlay-Modal in der Bildschirmmitte

┌─────────────────────────────────────────────────────────────────────────────┐
│                        DOCUMENT SCANNER - 3-SCHRITT-PROZESS                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SCHRITT 1: UPLOAD                                                          │
│  ─────────────────                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │     [📷 Foto aufnehmen]        [📄 PDF hochladen]                   │    │
│  │                                                                     │    │
│  │     ┌─────────────────────────────────────────────────────────┐     │    │
│  │     │                                                         │     │    │
│  │     │          Drag & Drop Zone                               │     │    │
│  │     │          Dokumente hier ablegen                         │     │    │
│  │     │          oder klicken zum Auswählen                     │     │    │
│  │     │                                                         │     │    │
│  │     └─────────────────────────────────────────────────────────┘     │    │
│  │                                                                     │    │
│  │     Unterstützte Formate: JPG, PNG, PDF                             │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  KLICK-FUNKTIONEN SCHRITT 1:                                                │
│  • "Foto aufnehmen": Aktiviert Kamera (falls verfügbar)                     │
│  • "PDF hochladen": Öffnet Datei-Auswahl-Dialog                             │
│  • Drag & Drop: Datei auf Zone ziehen → automatischer Upload                │
│  • Klick auf Zone: Öffnet Datei-Auswahl-Dialog                              │
│                                                                             │
│  JavaScript: handleFileSelect(), handleDragDrop()                           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SCHRITT 2: KI-ERKENNUNG                                                    │
│  ────────────────────────                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │     [Dokumentvorschau]         KI-Analyse läuft...                  │    │
│  │     ┌───────────────┐          ██████████████░░░░ 75%               │    │
│  │     │               │                                               │    │
│  │     │    Bild/PDF   │          Erkannte Daten:                      │    │
│  │     │               │          ✓ Name: Max Mustermann               │    │
│  │     └───────────────┘          ✓ Adresse: Musterstr. 1              │    │
│  │                                ✓ Geburtsdatum: 01.01.1980            │    │
│  │                                ✓ IBAN: DE89...                       │    │
│  │                                ✓ Forderung: € 5.230,00               │    │
│  │                                                                     │    │
│  │     [Erneut scannen]          [Daten übernehmen →]                  │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  AUTOMATISCHE AKTIONEN:                                                     │
│  • OCR-Texterkennung auf Dokument                                           │
│  • KI-Extraktion von: Name, Adresse, Geburtsdatum, IBAN, Beträge            │
│  • Validierung der erkannten Daten                                          │
│  • Confidence-Score für jedes Feld                                          │
│                                                                             │
│  KLICK-FUNKTIONEN SCHRITT 2:                                                │
│  • "Erneut scannen": Zurück zu Schritt 1                                    │
│  • "Daten übernehmen": Weiter zu Schritt 3                                  │
│  • Klick auf Feld: Manuelle Korrektur möglich                               │
│                                                                             │
│  JavaScript: startAIRecognition(), extractDocumentData()                    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SCHRITT 3: KUNDE ANLEGEN                                                   │
│  ─────────────────────────                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │     NEUEN KUNDEN ANLEGEN                                            │    │
│  │                                                                     │    │
│  │     Vorname:     [Max____________]   Nachname: [Mustermann___]      │    │
│  │     Straße:      [Musterstraße 1_]   PLZ/Ort: [12345 Berlin_]       │    │
│  │     Geburtsdatum:[01.01.1980_____]   Telefon: [+49 123 456789]      │    │
│  │     E-Mail:      [max@example.de_]   IBAN:    [DE89...]             │    │
│  │                                                                     │    │
│  │     Forderungsdaten:                                                │    │
│  │     Betrag:      [€ 5.230,00_____]   Fälligkeit: [15.01.2025]       │    │
│  │     Produkt:     [Ratenkredit____▼]  Vertragsnr: [KR-2024-1234]     │    │
│  │                                                                     │    │
│  │     KI-Bewertung (automatisch):                                     │    │
│  │     Willingness: 65%  Ability: 72%  Segment: RESTRUKTURIERUNG       │    │
│  │                                                                     │    │
│  │     [Abbrechen]                           [✓ Kunde anlegen]         │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  KLICK-FUNKTIONEN SCHRITT 3:                                                │
│  • Jedes Feld: Editierbar, vorbefüllt mit KI-Daten                          │
│  • "Abbrechen": Schließt Modal ohne zu speichern                            │
│  • "Kunde anlegen": Erstellt neuen Kundendatensatz                          │
│    → Speichert in Datenbank                                                 │
│    → Fügt zur Kundenliste hinzu                                             │
│    → Zeigt Erfolgs-Notification                                             │
│    → Schließt Modal                                                         │
│                                                                             │
│  JavaScript: createNewCustomer(), saveCustomerData()                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

MODAL-STEUERUNG:
• ESC-Taste: Schließt das Modal
• Klick außerhalb: Schließt das Modal
• X-Button oben rechts: Schließt das Modal
• JavaScript: closeDocumentScanner()

================================================================================
                         A9. KUNDENLISTE (Scrollbare Tabelle)
================================================================================

Position: Unterer Bereich des Dashboards
Aussehen: Scrollbare Tabelle mit allen Kunden

┌─────────────────────────────────────────────────────────────────────────────┐
│                              KUNDENLISTE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SPALTENÜBERSCHRIFTEN (Klickbar zum Sortieren):                             │
│  ┌─────┬──────────────┬─────────────┬───────────┬───────────┬─────────────┐ │
│  │ ☐   │ Name       ↕ │ Segment   ↕ │ Score   ↕ │ Betrag  ↕ │ Aktionen    │ │
│  ├─────┼──────────────┼─────────────┼───────────┼───────────┼─────────────┤ │
│  │ ☐   │ Max Muster   │ 🟢 Priorit. │ 85/72     │ € 4.230   │ [👁][✏][📧] │ │
│  │ ☐   │ Anna Beisp.  │ 🟡 Restruk. │ 45/68     │ € 8.900   │ [👁][✏][📧] │ │
│  │ ☐   │ Peter Test   │ 🟠 Eskalat. │ 32/28     │ € 12.500  │ [👁][✏][📧] │ │
│  │ ☐   │ Maria Demo   │ 🔴 Abwickl. │ 72/15     │ € 3.200   │ [👁][✏][📧] │ │
│  │ ...  weitere Einträge ...                                               │ │
│  └─────┴──────────────┴─────────────┴───────────┴───────────┴─────────────┘ │
│                                                                             │
│  [1] [2] [3] ... [47]                              Zeige 1-20 von 10.234    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

SPALTEN-ERKLÄRUNG:
• ☐ Checkbox: Auswahl für Bulk-Aktionen
• Name: Kundenname (Klick → CRM-Profil)
• Segment: Farbiger Badge mit Segmentname
• Score: Willingness/Ability Score (z.B. 85/72)
• Betrag: Offene Forderung in Euro
• Aktionen: Icon-Buttons (siehe unten)

KLICK-FUNKTIONEN:

Spaltenüberschriften:
• Klick auf "Name": Sortiert alphabetisch A-Z / Z-A
• Klick auf "Segment": Gruppiert nach Segment
• Klick auf "Score": Sortiert nach Gesamt-Score
• Klick auf "Betrag": Sortiert nach Forderungshöhe

Zeilen:
• Klick auf Kundenname: Öffnet volles CRM-Profil (Abschnitt A10)
• Klick auf Zeile (nicht Aktionen): Öffnet kleines Info-Popup

Aktions-Buttons pro Zeile:
┌─────────────────────────────────────────────────────────────────────────────┐
│ ICON    │ FUNKTION                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 👁 View │ Öffnet Kunden-Schnellansicht                                      │
│         │ → Popup mit Kerndaten und letzten Aktivitäten                     │
│         │ JavaScript: showCustomerQuickView(customerId)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✏ Edit  │ Öffnet Bearbeitungsmodus für Kundendaten                          │
│         │ → Inline-Editing oder Modal-Formular                              │
│         │ JavaScript: editCustomer(customerId)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📧 Mail │ Öffnet E-Mail-Composer mit Kundenadresse                          │
│         │ → Vorlagen-Auswahl für Mahnung/Angebot                            │
│         │ JavaScript: sendCustomerEmail(customerId)                         │
└─────────────────────────────────────────────────────────────────────────────┘

Checkbox-Funktionen:
• Einzelne Checkbox: Wählt Kunden für Bulk-Aktion
• Checkbox in Header: Wählt alle sichtbaren Kunden
• Nach Auswahl erscheint Bulk-Aktions-Leiste:
  → "E-Mail an Auswahl senden"
  → "Segment ändern"
  → "Exportieren"
  → "Löschen"

Pagination:
• Klick auf Seitenzahl: Springt zur Seite
• Klick auf "...": Öffnet Seitenauswahl-Input
• "Zeige X von Y": Klick öffnet Dropdown für 20/50/100 pro Seite

================================================================================
                      A10. CRM-PROFIL (Vollbild-Ansicht)
================================================================================

Aufruf: Klick auf Kundennamen in der Liste
Aussehen: Vollbild-Overlay mit Sidebar-Navigation

┌─────────────────────────────────────────────────────────────────────────────┐
│                         CRM KUNDENPROFIL - VOLLBILD                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────────────────────────────────────────────┐   │
│  │  SIDEBAR    │  │  CONTENT-BEREICH                                    │   │
│  │  NAVIGATION │  │                                                     │   │
│  │             │  │  (Wechselt je nach gewähltem Tab)                   │   │
│  │  [Übersicht]│  │                                                     │   │
│  │  [Stammd.]  │  │                                                     │   │
│  │  [Forder.]  │  │                                                     │   │
│  │  [Zahlungen]│  │                                                     │   │
│  │  [Kommunik.]│  │                                                     │   │
│  │  [Dokumente]│  │                                                     │   │
│  │  [Timeline] │  │                                                     │   │
│  │  [Notizen]  │  │                                                     │   │
│  │  [Analyse]  │  │                                                     │   │
│  │             │  │                                                     │   │
│  │  ─────────  │  │                                                     │   │
│  │  [Aktionen] │  │                                                     │   │
│  │  📧 E-Mail  │  │                                                     │   │
│  │  📞 Anrufen │  │                                                     │   │
│  │  📅 Termin  │  │                                                     │   │
│  │  📝 Notiz   │  │                                                     │   │
│  │             │  │                                                     │   │
│  └─────────────┘  └─────────────────────────────────────────────────────┘   │
│                                                                             │
│                                                          [X Schließen]      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

SIDEBAR-TABS UND IHRE INHALTE:

┌─────────────────────────────────────────────────────────────────────────────┐
│ TAB              │ CONTENT                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 Übersicht     │ Dashboard mit KI-Score, Segment-Badge, Key-Metrics       │
│                  │ Risikoampel, letzte Aktivität, Quick-Actions             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 👤 Stammdaten    │ Persönliche Daten: Name, Adresse, Kontakt, Geburtsdatum  │
│                  │ Bankverbindung, Arbeitgeber, Einkommen                   │
│                  │ [Bearbeiten]-Button zum Editieren                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💰 Forderungen   │ Tabelle aller offenen Forderungen                        │
│                  │ Vertragsdetails, Fälligkeiten, Mahnstatus                │
│                  │ IFRS 9 Stage, ECL-Berechnung                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💳 Zahlungen     │ Zahlungshistorie mit allen Ein- und Ausgängen            │
│                  │ Grafik der Zahlungsmuster                                │
│                  │ Ratenzahlungsvereinbarungen                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📧 Kommunikation │ E-Mail-Verlauf, Brief-Historie, Anrufprotokoll           │
│                  │ Versendete Mahnungen mit Datum                           │
│                  │ Schnellversand-Optionen                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📎 Dokumente     │ Vertragsunterlagen, Mahnschreiben, Nachweise             │
│                  │ Upload-Funktion für neue Dokumente                       │
│                  │ Vorschau-Funktion für PDFs                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📅 Timeline      │ Chronologische Übersicht aller Ereignisse                │
│                  │ Farbkodiert nach Typ (Zahlung, Kontakt, Änderung)        │
│                  │ Filter nach Zeitraum und Ereignistyp                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📝 Notizen       │ Interne Notizen und Vermerke                             │
│                  │ Neue Notiz erstellen                                     │
│                  │ Notizen anderer Mitarbeiter sehen                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🤖 KI-Analyse    │ Detaillierte KI-Bewertung                                │
│                  │ Willingness/Ability Breakdown                            │
│                  │ Prognose und Empfehlungen                                │
│                  │ Confidence-Scores pro Faktor                             │
└─────────────────────────────────────────────────────────────────────────────┘

QUICK-ACTION BUTTONS IN SIDEBAR:
• 📧 E-Mail: Öffnet E-Mail-Composer → crmEmail()
• 📞 Anrufen: Zeigt Telefonnummer, Click-to-Call wenn verfügbar → crmCall()
• 📅 Termin: Öffnet Kalender-Integration → crmSchedule()
• 📝 Notiz: Öffnet Notiz-Editor → crmNote()

SCHLIESSEN DES CRM-PROFILS:
• X-Button oben rechts
• ESC-Taste
• Klick außerhalb des Modals
• JavaScript: closeCrmProfile()

================================================================================
                       A11. KEYBOARD-SHORTCUTS (Tastenkürzel)
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ TASTENKÜRZEL      │ FUNKTION                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ ESC               │ Schließt jedes geöffnete Modal/Overlay                  │
│ Ctrl + S          │ Speichert aktuelle Änderungen (wenn im Edit-Modus)      │
│ Ctrl + F          │ Öffnet Schnellsuche in der Kundenliste                  │
│ ↑ / ↓             │ Navigation in der Kundenliste                           │
│ Enter             │ Öffnet ausgewählten Kunden im CRM-Profil                │
│ Tab               │ Springt zum nächsten interaktiven Element               │
│ Ctrl + P          │ Druckt aktuelle Ansicht                                 │
│ ?                 │ Zeigt Hilfe-Overlay mit allen Shortcuts                 │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
================================================================================
                           TEIL B: PORTFOLIO-DATEN & ANALYSE
================================================================================
================================================================================

================================================================================
                              B1. EXECUTIVE SUMMARY
================================================================================

Dieses Dashboard bietet eine umfassende Übersicht über das Forderungsportfolio
der Braunschweiger Sparkasse. Die KI-gestützte Analyse klassifiziert jeden
Kunden anhand von Transaktionsmustern, externen Datenquellen und historischem
Verhalten nach Zahlungsbereitschaft (Willingness to Pay) und Zahlungsfähigkeit
(Ability to Pay).

================================================================================
                           B2. PORTFOLIO-KENNZAHLEN (KPIs)
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ KENNZAHL                      │ AKTUELLER WERT     │ VERÄNDERUNG           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Gesamtkredite                 │ 10.234 Fälle       │ +127 zur Vorwoche     │
│ Ausstehende Gesamtforderung   │ € 47,8 Mio.        │ +€ 1,2 Mio. (Vorwoche)│
│ Ø Schulden pro Kunde          │ € 4.672            │ -€ 89 (Verbesserung)  │
│ Offene Bewertungsaufgaben     │ 156 Aufgaben       │ 23 überfällig         │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                     B3. KUNDENSEGMENTIERUNG (WILLINGNESS/ABILITY MATRIX)
================================================================================

Die Matrix segmentiert Kunden in vier Quadranten basierend auf ihrer
Zahlungsbereitschaft (X-Achse) und Zahlungsfähigkeit (Y-Achse):

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  RESTRUKTURIERUNG (Oben Links)        │  PRIORITÄT (Oben Rechts)            │
│  • Hohe Ability, Niedrige Willingness │  • Hohe Ability, Hohe Willingness   │
│  • Anzahl: 3.120 Fälle                │  • Anzahl: 2.340 Fälle              │
│  • Strategie: Ratenzahlung,           │  • Strategie: Schnelle Vereinbarung │
│    Schuldnerberatung                  │    Zahlungsplan                     │
│                                       │                                     │
├───────────────────────────────────────┼─────────────────────────────────────┤
│                                       │                                     │
│  ESKALATION (Unten Links)             │  ABWICKLUNG (Unten Rechts)          │
│  • Niedrige Ability & Willingness     │  • Niedrige Ability, Hohe Willing.  │
│  • Anzahl: 1.890 Fälle                │  • Anzahl: 2.884 Fälle              │
│  • Strategie: Inkasso, Mahnverfahren, │  • Strategie: Verkauf, Abschreibung,│
│    Gerichtliche Schritte              │    Restrukturierung                 │
│                                       │                                     │
└─────────────────────────────────────────────────────────────────────────────┘

VERTEILUNG GESAMT:
• Priorität (Grün):         2.340 Fälle (22,9%)  - Schnellste Rückzahlung
• Restrukturierung (Gelb):  3.120 Fälle (30,5%)  - Mittleres Risiko
• Eskalation (Orange):      1.890 Fälle (18,5%)  - Hohes Risiko
• Abwicklung (Rot):         2.884 Fälle (28,2%)  - Kritisch

================================================================================
                           B4. PORTFOLIO-ENTWICKLUNG (12 MONATE)
================================================================================

Entwicklung des Forderungsportfolios in den letzten 12 Monaten:

┌─────────────────────────────────────────────────────────────────────────────┐
│ METRIK                        │ WERT                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Neuzugänge (pro Monat)        │ +847 Fälle durchschnittlich                 │
│ Abgänge (regulär)             │ -523 Fälle durchschnittlich                 │
│ Netto-Veränderung             │ +324 Fälle pro Monat                        │
│ Trend                         │ Ansteigend (Portfoliowachstum)              │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                      B5. NEUE FÄLLE SEIT LETZTEM LOGIN
================================================================================

Anzahl neuer Fälle seit dem letzten Dashboard-Aufruf: 47 Fälle

Diese neuen Fälle wurden automatisch durch die KI bewertet und den
entsprechenden Segmenten zugeordnet. Eine manuelle Überprüfung wird
für Fälle mit niedriger Confidence-Score empfohlen.

================================================================================
                           B6. ZAHLUNGSEINGÄNGE
================================================================================

Positive Entwicklungen - Kunden mit erfolgten Zahlungen: 31 Fälle

Diese Fälle zeigen Zahlungsaktivität und sollten ggf. im Segment
nach oben korrigiert werden.

================================================================================
                       B7. SEGMENTSPEZIFISCHE HANDLUNGSEMPFEHLUNGEN
================================================================================

PRIORITÄT (Grüne Zone - 2.340 Fälle):
────────────────────────────────────
✓ Schnelle Kontaktaufnahme für Zahlungsvereinbarung
✓ Flexible Ratenzahlungsangebote
✓ Hohe Erfolgswahrscheinlichkeit bei zeitnaher Bearbeitung
✓ Durchschnittliche Recovery Rate: 85-95%

RESTRUKTURIERUNG (Gelbe Zone - 3.120 Fälle):
────────────────────────────────────────────
✓ Individuelle Schuldnerberatung anbieten
✓ Langfristige Ratenpläne entwickeln
✓ Kontakt zu Sozialberatung bei Bedarf
✓ Durchschnittliche Recovery Rate: 60-75%

ESKALATION (Orange Zone - 1.890 Fälle):
───────────────────────────────────────
! Inkasso-Verfahren einleiten
! Gerichtliches Mahnverfahren prüfen
! Vermögensauskunft einholen
! Durchschnittliche Recovery Rate: 25-40%

ABWICKLUNG (Rote Zone - 2.884 Fälle):
─────────────────────────────────────
✗ Verkauf an Inkasso-Dienstleister prüfen
✗ Abschreibung nach Einzelfallprüfung
✗ Restschuldbefreiung bei Insolvenz
✗ Durchschnittliche Recovery Rate: 5-15%

================================================================================
                           B8. IFRS 9 STAGE KLASSIFIZIERUNG
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE       │ BESCHREIBUNG                  │ FÄLLE    │ VOLUMEN           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Stage 1     │ Performing (< 30 DPD)         │ 5.010    │ € 18,2 Mio.       │
│ Stage 2     │ Underperforming (30-90 DPD)   │ 2.880    │ € 15,4 Mio.       │
│ Stage 3     │ Non-Performing (> 90 DPD)     │ 2.344    │ € 14,2 Mio.       │
└─────────────────────────────────────────────────────────────────────────────┘

DPD = Days Past Due (Tage überfällig)

================================================================================
                           B9. ERWARTETE KREDITVERLUSTE (ECL)
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE       │ ECL-QUOTE      │ RÜCKSTELLUNG                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Stage 1     │ 0,8%           │ € 145.600                                   │
│ Stage 2     │ 8,5%           │ € 1.309.000                                 │
│ Stage 3     │ 45,2%          │ € 6.418.400                                 │
│ GESAMT      │                │ € 7.873.000                                 │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                           B10. KI-MODELL PERFORMANCE
================================================================================

Accuracy der Segmentierung:          94,2%
Precision (Willingness to Pay):      91,8%
Precision (Ability to Pay):          93,5%
F1-Score gesamt:                     92,4%

Datenquellen für KI-Analyse:
• Transaktionshistorie (intern)
• SCHUFA-Score (extern)
• Kontoführungsverhalten (intern)
• Externe Wirtschaftsdaten
• Historisches Zahlungsverhalten

================================================================================
                              B11. OFFENE AUFGABEN
================================================================================

Meine aktuellen Aufgaben im Forderungsmanagement:

┌─────────────────────────────────────────────────────────────────────────────┐
│ PRIORITÄT   │ AUFGABE                                   │ FÄLLIGKEIT       │
├─────────────────────────────────────────────────────────────────────────────┤
│ HOCH        │ 23 überfällige Bewertungsaufgaben         │ Sofort           │
│ MITTEL      │ Neue Fälle prüfen (47 Stück)              │ Heute            │
│ MITTEL      │ Zahlungseingänge verifizieren (31 Stück)  │ Diese Woche      │
│ NIEDRIG     │ Portfolio-Review für Q4                   │ Ende des Monats  │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
================================================================================
                     TEIL C: JAVASCRIPT-FUNKTIONEN REFERENZ
================================================================================
================================================================================

Übersicht aller JavaScript-Funktionen und ihre Aufrufe:

┌─────────────────────────────────────────────────────────────────────────────┐
│ FUNKTION                        │ AUFRUF / TRIGGER                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ MODUL & NAVIGATION                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ initModuleSelector()            │ DOMContentLoaded Event                    │
│ switchModule(moduleId)          │ Klick auf Modul-Tab                       │
│ navigateToTile(tileId)          │ Klick auf Navigations-Kachel              │
├─────────────────────────────────────────────────────────────────────────────┤
│ CHARTS                                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ initBankenCharts()              │ Nach Modul-Wechsel zu Banken              │
│ initScatterPlot()               │ Automatisch durch initBankenCharts        │
│ initPortfolioChart()            │ Automatisch durch initBankenCharts        │
├─────────────────────────────────────────────────────────────────────────────┤
│ DOCUMENT SCANNER                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ openDocumentScanner()           │ Klick auf "Dokument scannen" Button       │
│ closeDocumentScanner()          │ Klick auf X, ESC, oder außerhalb Modal    │
│ handleFileSelect(event)         │ Datei-Auswahl oder Drag & Drop            │
│ startAIRecognition()            │ Nach erfolgreichem Upload                 │
│ showRecognitionResults(data)    │ Nach KI-Analyse                           │
│ createNewCustomer()             │ Klick auf "Kunde anlegen" Button          │
├─────────────────────────────────────────────────────────────────────────────┤
│ CRM PROFIL                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ openCrmProfile(customerId)      │ Klick auf Kundennamen in Liste            │
│ closeCrmProfile()               │ X-Button, ESC, oder außerhalb             │
│ showCrmSection(sectionId)       │ Klick auf Sidebar-Tab                     │
│ crmCall()                       │ Klick auf Anrufen-Button                  │
│ crmEmail()                      │ Klick auf E-Mail-Button                   │
│ crmSchedule()                   │ Klick auf Termin-Button                   │
│ crmNote()                       │ Klick auf Notiz-Button                    │
│ editStammdaten()                │ Klick auf Bearbeiten in Stammdaten        │
├─────────────────────────────────────────────────────────────────────────────┤
│ KUNDENLISTE                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ sortCustomerList(column)        │ Klick auf Spaltenüberschrift              │
│ filterBySegment(segment)        │ Klick auf Quadrant in Matrix              │
│ selectCustomer(customerId)      │ Klick auf Checkbox                        │
│ selectAllCustomers()            │ Klick auf Header-Checkbox                 │
│ showCustomerQuickView(id)       │ Klick auf Auge-Icon                       │
│ editCustomer(id)                │ Klick auf Stift-Icon                      │
│ sendCustomerEmail(id)           │ Klick auf Mail-Icon                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ UTILITIES                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ downloadDashboardSummary()      │ Klick auf "Zusammenfassung" Button        │
│ showNotification(msg, type)     │ Nach jeder wichtigen Aktion               │
│ triggerBulkImport()             │ Klick auf "Bulk-Import" Button            │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
================================================================================
                           TEIL D: SYSTEM-INFORMATIONEN
================================================================================
================================================================================

Dashboard-Version:      Collections Management v2.1
Datenstand:             ${dateStr}, ${timeStr}
Nächste Aktualisierung: Automatisch alle 15 Minuten
Datenquelle:            SAP Banking Core + KI-Modul
Benutzer:               [Aktueller Benutzer]

================================================================================
                              KONTAKT & SUPPORT
================================================================================

Bei Fragen zum Dashboard oder zur Segmentierung:
• IT-Support: support@braunschweiger-sparkasse.de
• Fachliche Fragen: collections@braunschweiger-sparkasse.de
• Notfall-Hotline: +49 531 XXX-XXXX

================================================================================
                                   DISCLAIMER
================================================================================

Dieses Dokument enthält vertrauliche Informationen und ist ausschließlich für
den internen Gebrauch bestimmt. Die KI-gestützten Empfehlungen dienen als
Entscheidungshilfe und ersetzen nicht die fachliche Einzelfallprüfung.

################################################################################
################################################################################
##                                                                            ##
##                    © 2025 Braunschweiger Sparkasse                         ##
##                       Collections Management System                        ##
##                         Vollständige Dokumentation                         ##
##                                                                            ##
################################################################################
################################################################################
`;

    // Create and download file
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collections-dashboard-zusammenfassung-${now.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Dashboard-Zusammenfassung wurde heruntergeladen', 'success');
}

// Export download function
window.downloadDashboardSummary = downloadDashboardSummary;

// Initialize module selector on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initModuleSelector();
    restoreCollapsedSections();
});

console.log('✅ banken.js geladen');
