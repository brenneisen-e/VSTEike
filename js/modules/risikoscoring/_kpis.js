/**
 * KPI and Table Functions for Risikoscoring Module
 * Updates KPIs, statistics tables, and comparisons
 */

import { getElement, setText, formatCurrency } from './_helpers.js';
import { distributionData, modifiedDistributionData, currentSilo, measuresActive, selectedMeasures } from './_state.js';
import { calculateStats } from './_statistics.js';
import { initializeDistributionData } from './_distribution.js';

/**
 * Updates all KPI displays
 */
export const updateKPIs = () => {
    const data = measuresActive && selectedMeasures.length > 0 && modifiedDistributionData[currentSilo] ? modifiedDistributionData[currentSilo] : distributionData[currentSilo];
    if (!data) return;

    const stats = calculateStats(data, currentSilo);
    const originalStats = calculateStats(distributionData[currentSilo], currentSilo);

    const crElement = getElement('kpiCombinedRatio');
    if (crElement) {
        crElement.textContent = stats.avgCombinedRatio.toFixed(1) + '%';
        crElement.classList.remove('combined-ratio-green', 'combined-ratio-yellow', 'combined-ratio-orange', 'combined-ratio-red');
        crElement.classList.add(stats.avgCombinedRatio <= 90 ? 'combined-ratio-green' : stats.avgCombinedRatio <= 100 ? 'combined-ratio-yellow' : stats.avgCombinedRatio <= 105 ? 'combined-ratio-orange' : 'combined-ratio-red');
    }

    const crTrend = getElement('kpiCombinedTrend');
    if (crTrend) {
        if (measuresActive && selectedMeasures.length > 0) {
            const diff = stats.avgCombinedRatio - originalStats.avgCombinedRatio;
            crTrend.textContent = diff < 0 ? `↓ ${Math.abs(diff).toFixed(1)}%` : `↑ +${diff.toFixed(1)}%`;
            crTrend.style.display = 'block';
            crTrend.className = diff < 0 ? 'kpi-trend positive' : 'kpi-trend negative';
        } else { crTrend.style.display = 'none'; }
    }

    const gesamtergebnis = stats.total * stats.avgErtrag;
    const ergebnisElement = getElement('kpiGesamtergebnis');
    if (ergebnisElement) {
        ergebnisElement.textContent = formatCurrency(gesamtergebnis);
        ergebnisElement.style.color = gesamtergebnis >= 0 ? '#059669' : '#dc2626';
    }

    const ergebnisTrend = getElement('kpiErgebnisTrend');
    if (ergebnisTrend) {
        if (measuresActive && selectedMeasures.length > 0) {
            const diff = gesamtergebnis - (originalStats.total * originalStats.avgErtrag);
            ergebnisTrend.textContent = diff > 0 ? `↑ +${formatCurrency(diff)}` : `↓ ${formatCurrency(Math.abs(diff))}`;
            ergebnisTrend.style.display = 'block';
            ergebnisTrend.className = diff > 0 ? 'kpi-trend positive' : 'kpi-trend negative';
        } else { ergebnisTrend.style.display = 'none'; }
    }

    setText('kpiVmA', stats.levels.a);
    setText('kpiVmB', stats.levels.b);
    setText('kpiVmC', stats.levels.c);
    setText('kpiVmD', stats.levels.d);
    setText('kpiVmTotal', stats.total.toLocaleString('de-DE'));

    if (measuresActive && selectedMeasures.length > 0) {
        ['A', 'B', 'C', 'D'].forEach(l => {
            const el = getElement(`kpiVm${l}Trend`);
            if (el) {
                el.textContent = stats.levels[l.toLowerCase()] > originalStats.levels[l.toLowerCase()] ? '↑' : '↓';
                el.style.display = 'inline';
            }
        });
    } else {
        ['A', 'B', 'C', 'D'].forEach(l => { const el = getElement(`kpiVm${l}Trend`); if (el) el.style.display = 'none'; });
    }
};

/**
 * Updates the statistics table with silo data
 */
export const updateStatisticsTable = () => {
    const tbody = getElement('statisticsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!distributionData?.alle) initializeDistributionData();

    const siloInfo = {
        'ao': { name: 'Ausschließlichkeitsorganisation', data: distributionData.ao },
        'grossmakler': { name: 'Großmakler', data: distributionData.grossmakler },
        'kleinmakler': { name: 'Kleinmakler', data: distributionData.kleinmakler },
        'autohaus': { name: 'Autohäuser', data: distributionData.autohaus }
    };

    const silosToShow = currentSilo === 'alle' || currentSilo === 'makler' ? ['ao', 'grossmakler', 'kleinmakler', 'autohaus'] : [currentSilo];

    silosToShow.forEach(silo => {
        if (!siloInfo[silo]) return;
        const data = measuresActive && selectedMeasures.length > 0 && modifiedDistributionData[silo] ? modifiedDistributionData[silo] : distributionData[silo];
        const stats = calculateStats(data, silo);
        const origStats = calculateStats(distributionData[silo], silo);

        const row = document.createElement('tr');
        row.innerHTML = `<td>${siloInfo[silo].name}</td>
            <td class="stat-value">${stats.total.toLocaleString('de-DE')}</td>
            <td class="stat-value">${stats.average.toFixed(1)}${measuresActive && selectedMeasures.length > 0 && stats.average !== origStats.average ? `<span class="improvement-badge">+${(stats.average - origStats.average).toFixed(1)}</span>` : ''}</td>
            <td class="stat-value">${formatCurrency(stats.avgNeugeschaeft)}</td>
            <td class="stat-value">${formatCurrency(stats.avgBestand)}</td>
            <td class="stat-value">${stats.avgCombinedRatio.toFixed(1)}%</td>
            <td class="stat-value">${formatCurrency(stats.avgErtrag)}</td>
            <td class="stat-value">${stats.avgStorno.toFixed(1)}%</td>
            <td class="stat-value">${stats.avgCrossSelling.toFixed(1)}</td>`;
        tbody.appendChild(row);
    });

    if (currentSilo === 'alle' || currentSilo === 'makler') {
        const data = measuresActive && selectedMeasures.length > 0 && modifiedDistributionData[currentSilo] ? modifiedDistributionData[currentSilo] : distributionData[currentSilo];
        const stats = calculateStats(data, currentSilo);
        const origStats = calculateStats(distributionData[currentSilo], currentSilo);

        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        totalRow.style.background = '#f8fafc';
        totalRow.innerHTML = `<td>Gesamt</td>
            <td class="stat-value">${stats.total.toLocaleString('de-DE')}</td>
            <td class="stat-value">${stats.average.toFixed(1)}${measuresActive && selectedMeasures.length > 0 && stats.average !== origStats.average ? `<span class="improvement-badge">+${(stats.average - origStats.average).toFixed(1)}</span>` : ''}</td>
            <td class="stat-value">${formatCurrency(stats.avgNeugeschaeft)}</td>
            <td class="stat-value">${formatCurrency(stats.avgBestand)}</td>
            <td class="stat-value">${stats.avgCombinedRatio.toFixed(1)}%</td>
            <td class="stat-value">${formatCurrency(stats.avgErtrag)}</td>
            <td class="stat-value">${stats.avgStorno.toFixed(1)}%</td>
            <td class="stat-value">${stats.avgCrossSelling.toFixed(1)}</td>`;
        tbody.appendChild(totalRow);
    }
};

/**
 * Updates the before/after comparison display
 */
export const updateComparison = () => {
    const origStats = calculateStats(distributionData[currentSilo], currentSilo);
    const modStats = calculateStats(modifiedDistributionData[currentSilo], currentSilo);

    setText('beforeAvgScore', origStats.average.toFixed(1));
    setText('beforeA', origStats.levels.a);
    setText('beforeB', origStats.levels.b);
    setText('beforeC', origStats.levels.c);
    setText('beforeD', origStats.levels.d);

    setText('afterAvgScore', modStats.average.toFixed(1));
    setText('afterA', modStats.levels.a);
    setText('afterB', modStats.levels.b);
    setText('afterC', modStats.levels.c);
    setText('afterD', modStats.levels.d);

    const badge = document.querySelector('.improvement-badge');
    if (badge) badge.textContent = `+${(modStats.average - origStats.average).toFixed(1)}`;
};
