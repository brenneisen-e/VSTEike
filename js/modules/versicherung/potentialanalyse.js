/**
 * Versicherung Potentialanalyse Module
 * ES6 Module for potential analysis (ES2024)
 */

// ========================================
// STATE
// ========================================

let currentPotentialFilter = null;

// ========================================
// OPEN/CLOSE
// ========================================

export function openPotentialAnalyse() {

    document.getElementById('landingPage')?.style.setProperty('display', 'none');
    document.getElementById('mainApp')?.style.setProperty('display', 'none');
    document.getElementById('agenturOverview')?.style.setProperty('display', 'none');
    document.getElementById('kundenDetailPage')?.style.setProperty('display', 'none');

    document.getElementById('potentialAnalysePage')?.style.setProperty('display', 'block');

    currentPotentialFilter = null;
    updatePotentialFilter();
}

export function openPotentialAnalyseWithFilter(productId, productName) {

    document.getElementById('landingPage')?.style.setProperty('display', 'none');
    document.getElementById('mainApp')?.style.setProperty('display', 'none');
    document.getElementById('agenturOverview')?.style.setProperty('display', 'none');
    document.getElementById('kundenDetailPage')?.style.setProperty('display', 'none');

    document.getElementById('potentialAnalysePage')?.style.setProperty('display', 'block');

    currentPotentialFilter = productId;
    const filterSelect = document.getElementById('potentialProductFilter');
    if (filterSelect) filterSelect.value = productId;
    updatePotentialFilter();
}

export function closePotentialAnalyse() {
    document.getElementById('potentialAnalysePage')?.style.setProperty('display', 'none');
    document.getElementById('landingPage')?.style.setProperty('display', 'flex');
    currentPotentialFilter = null;
}

// ========================================
// DATA TOGGLE
// ========================================

export function showEigeneDaten() {
    document.getElementById('eigeneDatenContainer')?.style.setProperty('display', 'block');
    document.getElementById('fidaContainer')?.style.setProperty('display', 'none');
    document.getElementById('eigeneDatenBtn')?.classList.add('active');
    document.getElementById('fidaBtn')?.classList.remove('active');
}

export function showFidaDaten() {
    document.getElementById('eigeneDatenContainer')?.style.setProperty('display', 'block');
    document.getElementById('fidaContainer')?.style.setProperty('display', 'block');
    document.getElementById('eigeneDatenBtn')?.classList.remove('active');
    document.getElementById('fidaBtn')?.classList.add('active');
}

// ========================================
// FILTER
// ========================================

export function updatePotentialFilter() {
    const filter = currentPotentialFilter;

    if (!filter) {
        renderGroupedPotentials('eigeneDatenTable');
        renderGroupedPotentials('fidaTable');
    } else {
        renderFlatPotentials('eigeneDatenTable', filter);
        renderFlatPotentials('fidaTable', filter);
    }

    document.querySelectorAll('.potential-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
}

export function filterPotentials(productId) {
    currentPotentialFilter = productId === 'alle' ? null : productId;
    updatePotentialFilter();
}

// ========================================
// RENDER
// ========================================

const productToSegment = {
    'bu': 'leben', 'leben': 'leben', 'altersvorsorge': 'leben',
    'pflege': 'kranken', 'kranken': 'kranken',
    'hausrat': 'shu', 'haftpflicht': 'shu', 'unfall': 'shu',
    'rechtsschutz': 'shu', 'sach': 'shu', 'wohngebaeude': 'shu',
    'kfz': 'kfz'
};

const mainSegments = {
    'leben': {
        name: 'Leben', order: 1,
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
    },
    'kranken': {
        name: 'Kranken', order: 2,
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>'
    },
    'shu': {
        name: 'Sach / Haftpflicht / Unfall', order: 3,
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
    },
    'kfz': {
        name: 'Kfz', order: 4,
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"></path><path d="M3 17h2m14 0h2M5 17H3v-4l2-5h10l4 5v4h-2"></path></svg>'
    }
};

export function renderGroupedPotentials(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const thead = table.querySelector('thead');
    if (thead) thead.style.display = 'none';

    const originalRows = Array.from(tbody.querySelectorAll('tr:not(.potential-group-row)'));
    if (originalRows.length === 0) return;

    if (!tbody.dataset.originalHtml) {
        tbody.dataset.originalHtml = tbody.innerHTML;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `<table><tbody>${tbody.dataset.originalHtml}</tbody></table>`;
    const rows = Array.from(tempDiv.querySelectorAll('tr'));

    const groups = {};

    rows.forEach(row => {
        const badge = row.querySelector('.potential-badge');
        if (badge) {
            const classes = Array.from(badge.classList);
            const product = classes.find(c => c !== 'potential-badge') ?? 'sonstige';
            const mainSegment = productToSegment[product] ?? 'shu';

            groups[mainSegment] ??= [];

            const priorityEl = row.querySelector('.priority');
            let priority = 'medium';
            if (priorityEl?.classList.contains('high')) priority = 'high';
            else if (priorityEl?.classList.contains('low')) priority = 'low';

            const firstCell = row.querySelector('td');
            const kundenName = firstCell?.textContent.trim() ?? '';

            groups[mainSegment].push({ html: row.outerHTML, priority, kundenName, product });
        }
    });

    const sortedSegments = Object.keys(groups).sort((a, b) => {
        return (mainSegments[a]?.order ?? 99) - (mainSegments[b]?.order ?? 99);
    });

    const colCount = table.querySelectorAll('thead th').length || 5;
    let newHtml = '';

    sortedSegments.forEach(segment => {
        const items = groups[segment];
        items.sort((a, b) => a.kundenName.localeCompare(b.kundenName));

        const highCount = items.filter(i => i.priority === 'high').length;
        const mediumCount = items.filter(i => i.priority === 'medium').length;
        const lowCount = items.filter(i => i.priority === 'low').length;

        const segmentInfo = mainSegments[segment] ?? { name: segment, icon: '' };

        newHtml += `
            <tr class="potential-group-row" data-segment="${segment}" onclick="togglePotentialGroup(this)">
                <td colspan="${colCount}">
                    <div class="group-toggle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <span class="segment-badge segment-${segment}">${segmentInfo.icon}${segmentInfo.name}</span>
                        <span class="group-count">${items.length}</span>
                        <div class="group-priorities">
                            ${highCount > 0 ? `<span class="priority-count high">${highCount} Hoch</span>` : ''}
                            ${mediumCount > 0 ? `<span class="priority-count medium">${mediumCount} Mittel</span>` : ''}
                            ${lowCount > 0 ? `<span class="priority-count low">${lowCount} Niedrig</span>` : ''}
                        </div>
                    </div>
                </td>
            </tr>
        `;

        items.forEach(item => {
            let rowHtml = item.html;
            if (rowHtml.includes('class="')) {
                rowHtml = rowHtml.replace(/class="([^"]*)"/, `class="$1 potential-detail-row" data-segment="${segment}"`);
            } else {
                rowHtml = rowHtml.replace('<tr', `<tr class="potential-detail-row" data-segment="${segment}"`);
            }
            newHtml += rowHtml;
        });
    });

    tbody.innerHTML = newHtml;
}

export function renderFlatPotentials(tableId, filter) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const thead = table.querySelector('thead');
    if (thead) thead.style.display = '';

    if (tbody.dataset.originalHtml) {
        tbody.innerHTML = tbody.dataset.originalHtml;
    }

    tbody.querySelectorAll('tr').forEach(row => {
        if (!filter) {
            row.style.display = '';
        } else {
            const badge = row.querySelector('.potential-badge');
            row.style.display = badge?.classList.contains(filter) ? '' : 'none';
        }
    });
}

export function togglePotentialGroup(groupRow) {
    const segment = groupRow.dataset.segment;
    const isExpanded = groupRow.classList.contains('expanded');

    groupRow.classList.toggle('expanded');

    const table = groupRow.closest('table');
    table?.querySelectorAll(`.potential-detail-row[data-segment="${segment}"]`).forEach(row => {
        row.classList.toggle('visible', !isExpanded);
    });
}

export function getCurrentPotentialFilter() {
    return currentPotentialFilter;
}

export function setCurrentPotentialFilter(filter) {
    currentPotentialFilter = filter;
}
