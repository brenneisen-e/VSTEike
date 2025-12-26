/**
 * Banken Dashboard Module
 * ES6 Module for dashboard, tabs, filters, charts
 */

// ========================================
// STATE
// ========================================

let currentSelectedSegment = null;

// ========================================
// TAB NAVIGATION
// ========================================

export function showBankenTab(tabName) {
    document.querySelectorAll('.banken-tabs .banken-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.banken-tabs .banken-tab').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr?.includes(`'${tabName}'`)) {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('.banken-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.getElementById(`banken-tab-${tabName}`)?.classList.add('active');
    console.log('Banken tab switched to:', tabName);
}

// ========================================
// SECTION NAVIGATION
// ========================================

export function showBankenSection(sectionName) {
    document.querySelectorAll('.nav-tile').forEach(tile => {
        tile.classList.remove('active');
        const onclickAttr = tile.getAttribute('onclick');
        if (onclickAttr?.includes(`'${sectionName}'`)) {
            tile.classList.add('active');
        }
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
        const onclickAttr = item.getAttribute('onclick');
        if (onclickAttr?.includes(`'${sectionName}'`)) {
            item.classList.add('active');
        }
    });

    document.querySelectorAll('.banken-section').forEach(section => {
        section.classList.remove('active');
    });

    document.getElementById(`section-${sectionName}`)?.classList.add('active');
    console.log('Showing Banken section:', sectionName);
}

// ========================================
// SEGMENT FILTERING
// ========================================

const segmentConfig = {
    'eskalation': { badgeClass: 'escalate', name: 'Eskalation', color: '#ef4444', filterValue: 'escalate' },
    'prioritaet': { badgeClass: 'priority', name: 'Priorität', color: '#22c55e', filterValue: 'priority' },
    'restrukturierung': { badgeClass: 'restructure', name: 'Restrukturierung', color: '#f59e0b', filterValue: 'restructure' },
    'abwicklung': { badgeClass: 'writeoff', name: 'Abwicklung', color: '#64748b', filterValue: 'writeoff' },
    'ehemalige': { badgeClass: 'ehemalige', name: 'Ehemalige Fälle', filterValue: 'ehemalige' }
};

export function filterBySegment(segment) {
    const config = segmentConfig[segment];
    if (!config) {
        console.warn('Unknown segment:', segment);
        return;
    }

    document.querySelectorAll('.matrix-quadrant').forEach(q => q.classList.remove('selected'));
    document.querySelector(`.matrix-quadrant.segment-${segment}`)?.classList.add('selected');

    const table = document.querySelector('.banken-page .customer-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const matchingRows = [];
    const hiddenRows = [];

    rows.forEach(row => {
        const segmentBadge = row.querySelector('.segment-badge');
        if (segmentBadge?.classList.contains(config.badgeClass)) {
            matchingRows.push(row);
            row.style.display = '';
        } else {
            hiddenRows.push(row);
            row.style.display = 'none';
        }
    });

    matchingRows.sort((a, b) => {
        const amountA = parseAmount(a.querySelector('.amount')?.textContent ?? '0');
        const amountB = parseAmount(b.querySelector('.amount')?.textContent ?? '0');
        return amountB - amountA;
    });

    matchingRows.forEach(row => tbody.appendChild(row));
    hiddenRows.forEach(row => tbody.appendChild(row));

    showFilterIndicator(config.name, config.color, matchingRows.length, segment);

    document.querySelector('.banken-page .customer-table-wrapper')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const paginationText = document.querySelector('.table-pagination span');
    if (paginationText) {
        paginationText.textContent = `Zeige ${matchingRows.length} ${config.name}-Fälle (sortiert nach Volumen)`;
    }

    window.showNotification?.(`${matchingRows.length} Fälle im Segment "${config.name}" gefunden`, 'info');
}

export function openSegmentFullscreen(segment) {
    const config = segmentConfig[segment];
    if (!config) return;

    if (currentSelectedSegment === segment) {
        clearSegmentFilter();
        currentSelectedSegment = null;
        window.showNotification?.('Filter aufgehoben', 'info');
        return;
    }

    document.querySelectorAll('.matrix-quadrant').forEach(q => q.classList.remove('selected'));
    document.querySelector(`.segment-${segment}`)?.classList.add('selected');

    currentSelectedSegment = segment;
    filterBySegment(segment);

    const segmentSelect = document.querySelector('.filter-select[onchange*="segment"]');
    if (segmentSelect) segmentSelect.value = config.filterValue;

    document.querySelector('.customer-list-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.showNotification?.(`Gefiltert nach Segment: ${config.name}`, 'info');
}

export function clearSegmentFilter() {
    currentSelectedSegment = null;

    document.querySelector('.segment-filter-indicator')?.remove();
    document.querySelectorAll('.matrix-quadrant').forEach(q => q.classList.remove('selected'));

    const table = document.querySelector('.banken-page .customer-table');
    table?.querySelectorAll('tbody tr').forEach(row => {
        row.style.display = '';
    });

    const paginationText = document.querySelector('.table-pagination span');
    if (paginationText) {
        paginationText.textContent = 'Zeige 1-4 von 10.234 Kunden';
    }

    window.showNotification?.('Filter aufgehoben', 'info');
}

function showFilterIndicator(segmentName, color, count, segmentKey) {
    document.querySelector('.segment-filter-indicator')?.remove();

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

    const tableWrapper = document.querySelector('.banken-page .customer-table-wrapper');
    tableWrapper?.parentNode?.insertBefore(indicator, tableWrapper);
}

// ========================================
// DPD FILTERING
// ========================================

export function filterByDPDBucket(bucket) {
    const bucketConfig = {
        '0-30': { label: '0-30 Tage', minDpd: 0, maxDpd: 30 },
        '31-90': { label: '31-90 Tage', minDpd: 31, maxDpd: 90 },
        '90+': { label: '> 90 Tage', minDpd: 91, maxDpd: 999 }
    };

    const config = bucketConfig[bucket];
    if (!config) return;

    window.showNotification?.(`Filter: DPD ${config.label}`, 'info');

    const table = document.querySelector('.banken-page .customer-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    let matchCount = 0;
    tbody.querySelectorAll('tr').forEach(row => {
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

    const paginationText = document.querySelector('.table-pagination span');
    if (paginationText) {
        paginationText.textContent = `Zeige ${matchCount} Fälle mit DPD ${config.label}`;
    }
}

// ========================================
// COLLAPSIBLE SECTIONS
// ========================================

export function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('collapsed');

        const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
        collapsedSections[sectionId] = section.classList.contains('collapsed');
        localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
    }
}

export function restoreCollapsedSections() {
    const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
    Object.entries(collapsedSections).forEach(([sectionId, isCollapsed]) => {
        if (isCollapsed) {
            document.getElementById(sectionId)?.classList.add('collapsed');
        }
    });
}

// ========================================
// CHART POPUP
// ========================================

const chartData = {
    'aktive-faelle': {
        color: '#3b82f6',
        data: [9800, 9950, 10050, 10100, 10180, 10234],
        labels: ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        suffix: '',
        axisLabel: 'Anzahl Fälle',
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
        secondaryColor: '#22c55e',
        secondaryData: [145, 168, 152, 175, 160, 178],
        secondarySuffix: '',
        secondaryLabel: 'Erledigt'
    }
};

export function showChartPopup(chartId, title) {
    const config = chartData[chartId] ?? chartData['aktive-faelle'];

    const overlay = document.createElement('div');
    overlay.className = 'chart-popup-overlay';
    overlay.onclick = (e) => {
        if (e.target === overlay) closeChartPopup();
    };

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

    renderPopupChart(chartId, config);
}

export function closeChartPopup() {
    document.querySelector('.chart-popup-overlay')?.remove();
}

function renderPopupChart(chartId, config) {
    const container = document.getElementById(`popup-chart-${chartId}`);
    if (!container) return;

    const width = 720, height = 340;
    const padding = { top: 30, right: 90, bottom: 50, left: 90 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const { data, labels, secondaryData } = config;
    const maxVal = Math.max(...data) * 1.1;
    const minVal = Math.min(...data) * 0.9;
    const range = maxVal - minVal;

    const hasSecondary = secondaryData?.length > 0;
    const secondaryMaxVal = hasSecondary ? Math.max(...secondaryData) * 1.1 : 0;
    const secondaryMinVal = hasSecondary ? Math.min(...secondaryData) * 0.9 : 0;
    const secondaryRange = secondaryMaxVal - secondaryMinVal;

    const points = data.map((val, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - ((val - minVal) / range) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    const secondaryPoints = hasSecondary ? secondaryData.map((val, i) => {
        const x = padding.left + (i / (secondaryData.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - ((val - secondaryMinVal) / secondaryRange) * chartHeight;
        return `${x},${y}`;
    }).join(' ') : '';

    const yLabels = Array.from({ length: 5 }, (_, i) => {
        const val = minVal + (range * i / 4);
        const y = padding.top + chartHeight - (i / 4) * chartHeight;
        const formattedVal = config.suffix === '%' ? val.toFixed(1) : Math.round(val).toLocaleString('de-DE');
        return { val: formattedVal + (config.suffix || ''), y };
    });

    container.innerHTML = `
        <svg width="${width}" height="${height}" style="display: block; margin: 0 auto;">
            ${yLabels.map(l => `<line x1="${padding.left}" y1="${l.y}" x2="${width - padding.right}" y2="${l.y}" stroke="#e2e8f0" stroke-dasharray="4,4"/>`).join('')}
            <polyline fill="none" stroke="${config.color}" stroke-width="3" points="${points}" stroke-linecap="round" stroke-linejoin="round"/>
            ${hasSecondary ? `<polyline fill="none" stroke="${config.secondaryColor}" stroke-width="2" stroke-dasharray="6,4" points="${secondaryPoints}" stroke-linecap="round"/>` : ''}
            ${data.map((val, i) => {
                const x = padding.left + (i / (data.length - 1)) * chartWidth;
                const y = padding.top + chartHeight - ((val - minVal) / range) * chartHeight;
                return `<circle cx="${x}" cy="${y}" r="6" fill="white" stroke="${config.color}" stroke-width="3"/>`;
            }).join('')}
            ${labels.map((label, i) => {
                const x = padding.left + (i / (data.length - 1)) * chartWidth;
                return `<text x="${x}" y="${height - 25}" text-anchor="middle" font-size="12" fill="#64748b">${label}</text>`;
            }).join('')}
            ${yLabels.map(l => `<text x="${padding.left - 12}" y="${l.y + 4}" text-anchor="end" font-size="11" fill="${config.color}">${l.val}</text>`).join('')}
        </svg>
        <div style="display: flex; justify-content: center; gap: 24px; margin-top: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="${config.color}" stroke-width="3"/></svg>
                <span style="font-size: 12px; color: #64748b;">${config.axisLabel ?? 'Primär'}</span>
            </div>
            ${hasSecondary ? `
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="${config.secondaryColor}" stroke-width="2" stroke-dasharray="6,4"/></svg>
                <span style="font-size: 12px; color: #64748b;">${config.secondaryLabel ?? 'Sekundär'}</span>
            </div>` : ''}
        </div>
    `;
}

// ========================================
// BULK ACTIONS
// ========================================

export function toggleAllNpl(checkbox) {
    const isChecked = checkbox.checked;
    document.querySelectorAll('.npl-checkbox').forEach(cb => {
        cb.checked = isChecked;
    });
    updateBulkActionState();
}

export function updateBulkActionState() {
    const checkedBoxes = document.querySelectorAll('.npl-checkbox:checked');
    document.querySelectorAll('.btn-bulk').forEach(btn => {
        btn.disabled = checkedBoxes.length === 0;
        btn.style.opacity = checkedBoxes.length === 0 ? '0.5' : '1';
    });
}

export function bulkAction(action) {
    const count = document.querySelectorAll('.npl-checkbox:checked').length;

    if (count === 0) {
        window.showNotification?.('Bitte wählen Sie mindestens einen Fall aus', 'warning');
        return;
    }

    const actions = {
        'assign': `${count} Fälle werden zugewiesen...`,
        'escalate': `${count} Fälle werden eskaliert...`,
        'writeoff': `${count} Fälle zur Abschreibung markiert`
    };

    window.showNotification?.(actions[action] ?? `Aktion "${action}" für ${count} Fälle`, 'success');
}

// ========================================
// QUICK ACTIONS
// ========================================

export function openCase(caseId) {
    window.showNotification?.(`Fall ${caseId} wird geöffnet...`, 'info');
}

export function callCustomer(customerId) {
    window.showNotification?.(`Anruf wird gestartet für Kunde ${customerId}...`, 'success');
}

export function sendReminder(customerId) {
    window.showNotification?.(`Mahnung wird versendet an Kunde ${customerId}...`, 'info');
}

export function scheduleCallback(customerId) {
    window.showNotification?.(`Rückruf geplant für Kunde ${customerId}`, 'success');
}

export function showAllEhemalige() {
    window.showNotification?.('Zeige alle ehemaligen Fälle', 'info');
    document.querySelector('.customer-list-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function exportReport(reportType) {
    window.showNotification?.(`${reportType} Report wird erstellt...`, 'info');
}

// ========================================
// UTILITIES
// ========================================

function parseAmount(amountStr) {
    if (!amountStr) return 0;
    const cleaned = amountStr.replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}
