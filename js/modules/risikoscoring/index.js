/**
 * Risikoscoring Module (ES2024)
 * Vermittler-Scoring und Vertriebssteuerung
 */

// ========================================
// STATE
// ========================================

let distributionData = {};
let modifiedDistributionData = {};
let currentSilo = 'alle';
let measuresActive = false;
let selectedMeasures = [];

// ========================================
// CONSTANTS
// ========================================

const vermittlerTypRanges = {
    'ao': { min: 80, max: 95, optimal: 90 },
    'grossmakler': { min: 100, max: 115, optimal: 107 },
    'kleinmakler': { min: 110, max: 125, optimal: 118 },
    'autohaus': { min: 125, max: 145, optimal: 135 }
};

const measureEffects = {
    schulungen: { d: 10, c: 7, b: 4, a: 2 },
    vertragspruefung: { d: 15, c: 0, b: 0, a: 0 },
    digitalisierung: { d: 6, c: 6, b: 6, a: 6 },
    incentive: { d: 3, c: 5, b: 8, a: 0 },
    prozessoptimierung: { d: 4, c: 4, b: 4, a: 4 },
    betreuung: { d: 12, c: 8, b: 0, a: 0 },
    produktkalkulation: { d: 0, c: 0, b: 0, a: 0 },
    underwriting: { d: 5, c: 5, b: 5, a: 5 }
};

// ========================================
// HELPERS
// ========================================

const formatCurrency = (value) => {
    const absValue = Math.abs(value);
    let formatted = absValue >= 1000000000 ? '€' + (absValue / 1000000000).toFixed(1) + 'B' :
                    absValue >= 1000000 ? '€' + (absValue / 1000000).toFixed(0) + 'M' :
                    absValue >= 1000 ? '€' + (absValue / 1000).toFixed(0) + 'k' : '€' + absValue.toFixed(0);
    return value < 0 ? '-' + formatted : formatted;
};

const getElement = (id) => document.getElementById(id);
const getValue = (id) => parseFloat(getElement(id)?.value ?? 0);
const setValue = (id, val) => { const el = getElement(id); if (el) el.value = val; };
const setText = (id, text) => { const el = getElement(id); if (el) el.textContent = text; };

// ========================================
// DISTRIBUTION
// ========================================

const generateDistribution = (total, mean, stdDev) => {
    const distribution = new Array(100).fill(0);
    for (let i = 0; i < total; i++) {
        let score;
        do {
            const u1 = Math.random(), u2 = Math.random();
            const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            score = mean + z0 * stdDev;
            if (Math.random() < 0.05) score += (Math.random() - 0.5) * 20;
        } while (score < 0 || score > 100);
        distribution[Math.min(99, Math.max(0, Math.floor(score)))]++;
    }
    if (mean < 60) {
        for (let i = 20; i < 25; i++) distribution[i] = Math.floor(distribution[i] * 0.7);
        for (let i = 15; i < 20; i++) distribution[i] = Math.floor(distribution[i] * 1.1);
    }
    return distribution;
};

const combineDistributions = (silos) => {
    const combined = new Array(100).fill(0);
    silos.forEach(silo => distributionData[silo]?.forEach((count, index) => { combined[index] += count; }));
    return combined;
};

export const initializeDistributionData = () => {
    distributionData = {
        'ao': generateDistribution(500, 78, 7),
        'grossmakler': generateDistribution(2000, 62, 10),
        'kleinmakler': generateDistribution(11800, 52, 12),
        'autohaus': generateDistribution(100, 35, 13)
    };
    distributionData['makler'] = combineDistributions(['grossmakler', 'kleinmakler']);
    distributionData['alle'] = combineDistributions(['ao', 'grossmakler', 'kleinmakler', 'autohaus']);
};

const applyMeasuresToDistribution = (originalDist) => {
    const newDist = new Array(100).fill(0);
    originalDist.forEach((count, score) => {
        if (count === 0) return;
        const level = score >= 80 ? 'a' : score >= 60 ? 'b' : score >= 40 ? 'c' : 'd';
        let totalImprovement = selectedMeasures.reduce((sum, m) => sum + (measureEffects[m]?.[level] ?? 0), 0);
        if (score >= 80) totalImprovement *= Math.max(0.3, 1 - ((score - 80) / 20) * 0.7);
        const newBin = Math.min(99, Math.max(0, Math.floor(Math.min(95, score + totalImprovement))));
        newDist[newBin] += count;
    });
    return newDist;
};

// ========================================
// STATISTICS
// ========================================

const estimateNeugeschaeft = (score) => score >= 80 ? 1500000 + Math.random() * 500000 : score >= 60 ? 400000 + Math.random() * 400000 : score >= 40 ? 200000 + Math.random() * 200000 : 50000 + Math.random() * 150000;
const estimateBestand = (score) => score >= 80 ? 6000000 + Math.random() * 2000000 : score >= 60 ? 2000000 + Math.random() * 2000000 : score >= 40 ? 1000000 + Math.random() * 1000000 : 500000 + Math.random() * 500000;
const estimateStorno = (score) => score >= 80 ? 3 + Math.random() * 2 : score >= 60 ? 8 + Math.random() * 4 : score >= 40 ? 15 + Math.random() * 5 : 25 + Math.random() * 10;
const estimateCrossSelling = (score) => score >= 80 ? 3 + Math.random() : score >= 60 ? 2 + Math.random() * 0.8 : score >= 40 ? 1.3 + Math.random() * 0.4 : 1 + Math.random() * 0.2;

const estimateCombinedRatio = (score, siloType) => {
    if (siloType === 'ao') return 85 + Math.random() * 10;
    if (siloType === 'grossmakler') return 100 + Math.random() * 14;
    if (siloType === 'kleinmakler') return 111 + Math.random() * 14;
    if (siloType === 'autohaus') return 128 + Math.random() * 14;
    return score >= 80 ? 85 + Math.random() * 10 : score >= 60 ? 100 + Math.random() * 15 : score >= 40 ? 115 + Math.random() * 15 : 130 + Math.random() * 20;
};

const estimateErtrag = (score, siloType) => {
    if (siloType === 'ao') return score >= 80 ? 4500 + Math.random() * 1000 : score >= 60 ? 3500 + Math.random() * 1000 : 2500 + Math.random() * 1000;
    if (siloType === 'grossmakler') return score >= 80 ? -3000 - Math.random() * 1000 : score >= 60 ? -4500 - Math.random() * 1000 : -6000 - Math.random() * 2000;
    if (siloType === 'kleinmakler') return score >= 80 ? -3500 - Math.random() * 1000 : score >= 60 ? -5000 - Math.random() * 1000 : -6500 - Math.random() * 1500;
    if (siloType === 'autohaus') return score >= 80 ? -35000 - Math.random() * 10000 : score >= 60 ? -45000 - Math.random() * 10000 : -55000 - Math.random() * 10000;
    return -5000 - Math.random() * 1000;
};

const calculateStats = (distribution, siloType = null) => {
    if (!distribution?.length) return { total: 0, average: 0, avgNeugeschaeft: 0, avgBestand: 0, avgCombinedRatio: 0, avgErtrag: 0, avgStorno: 0, avgCrossSelling: 0, levels: { a: 0, b: 0, c: 0, d: 0 } };

    let total = 0, weightedSum = 0, neuSum = 0, bestandSum = 0, crSum = 0, ertragSum = 0, stornoSum = 0, csSum = 0;
    const levels = { a: 0, b: 0, c: 0, d: 0 };

    distribution.forEach((count, bin) => {
        total += count;
        weightedSum += count * bin;
        if (bin >= 80) levels.a += count; else if (bin >= 60) levels.b += count; else if (bin >= 40) levels.c += count; else levels.d += count;
        for (let i = 0; i < count; i++) {
            neuSum += estimateNeugeschaeft(bin);
            bestandSum += estimateBestand(bin);
            crSum += estimateCombinedRatio(bin, siloType);
            ertragSum += estimateErtrag(bin, siloType);
            stornoSum += estimateStorno(bin);
            csSum += estimateCrossSelling(bin);
        }
    });

    return { total, average: total > 0 ? weightedSum / total : 0, avgNeugeschaeft: total > 0 ? neuSum / total : 0, avgBestand: total > 0 ? bestandSum / total : 0, avgCombinedRatio: total > 0 ? crSum / total : 0, avgErtrag: total > 0 ? ertragSum / total : 0, avgStorno: total > 0 ? stornoSum / total : 0, avgCrossSelling: total > 0 ? csSum / total : 0, levels };
};

// ========================================
// CHART
// ========================================

export const drawDistributionChart = () => {
    const canvas = getElement('distributionChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const distribution = distributionData[currentSilo];
    if (!distribution) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const padding = 50, chartWidth = canvas.width - 2 * padding, chartHeight = canvas.height - 2 * padding, barWidth = chartWidth / 100;
    let maxValue = Math.max(...distribution);
    if (measuresActive && modifiedDistributionData[currentSilo]) maxValue = Math.max(maxValue, ...modifiedDistributionData[currentSilo]);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    canvas.barPositions = [];
    const showModified = measuresActive && selectedMeasures.length > 0 && modifiedDistributionData[currentSilo];

    const getColor = (score, alpha = 1) => {
        if (score >= 80) return `hsla(140, ${50 + ((score - 80) / 20) * 20}%, ${75 - ((score - 80) / 20) * 10}%, ${alpha})`;
        if (score >= 60) return `hsla(50, ${60 + ((score - 60) / 20) * 20}%, ${80 - ((score - 60) / 20) * 10}%, ${alpha})`;
        if (score >= 40) return `hsla(30, ${65 + ((score - 40) / 20) * 20}%, ${75 - ((score - 40) / 20) * 10}%, ${alpha})`;
        return `hsla(0, ${50 + (score / 40) * 30}%, ${80 - (score / 40) * 15}%, ${alpha})`;
    };

    distribution.forEach((count, score) => {
        const x = padding + score * barWidth, height = count > 0 ? Math.max(2, (count / maxValue) * chartHeight) : 0, y = canvas.height - padding - height;
        ctx.fillStyle = getColor(score, showModified ? 0.3 : 1);
        if (height > 0) ctx.fillRect(x, y, barWidth - 1, height);
    });

    if (showModified) {
        modifiedDistributionData[currentSilo].forEach((count, score) => {
            const x = padding + score * barWidth, height = count > 0 ? Math.max(2, (count / maxValue) * chartHeight) : 0, y = canvas.height - padding - height;
            ctx.fillStyle = getColor(score);
            if (height > 0) ctx.fillRect(x, y, barWidth - 1, height);
            canvas.barPositions[score] = { x, y, width: barWidth - 1, height, count, score, color: getColor(score) };
        });
    } else {
        distribution.forEach((count, score) => {
            const x = padding + score * barWidth, height = count > 0 ? Math.max(2, (count / maxValue) * chartHeight) : 0, y = canvas.height - padding - height;
            canvas.barPositions[score] = { x, y, width: barWidth - 1, height, count, score };
        });
    }

    const stats = calculateStats(distribution, currentSilo);
    const avgX = padding + stats.average * barWidth;
    ctx.strokeStyle = showModified ? '#9ca3af' : '#2563eb';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(avgX, padding);
    ctx.lineTo(avgX, canvas.height - padding);
    ctx.stroke();

    if (showModified) {
        const modStats = calculateStats(modifiedDistributionData[currentSilo], currentSilo);
        const modAvgX = padding + modStats.average * barWidth;
        ctx.strokeStyle = '#059669';
        ctx.beginPath();
        ctx.moveTo(modAvgX, padding);
        ctx.lineTo(modAvgX, canvas.height - padding);
        ctx.stroke();
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Ø ${modStats.average.toFixed(1)}`, modAvgX, padding - 10);
    } else {
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Ø ${stats.average.toFixed(1)}`, avgX, padding - 10);
    }

    ctx.setLineDash([]);
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 100; i += 10) ctx.fillText(i, padding + i * barWidth, canvas.height - padding + 20);

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Score', canvas.width / 2, canvas.height - 10);
};

export const setupChartInteraction = () => {
    const canvas = getElement('distributionChart');
    const tooltip = getElement('chartTooltip');
    if (!canvas || !tooltip) return;

    let hoveredBar = null;
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
        let newHoveredBar = null;
        canvas.barPositions?.forEach(bar => {
            if (bar?.height > 0 && x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height) newHoveredBar = bar;
        });

        if (hoveredBar !== newHoveredBar) {
            hoveredBar = newHoveredBar;
            drawDistributionChart();
            if (hoveredBar) {
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#1e3a8a';
                ctx.fillRect(hoveredBar.x, hoveredBar.y, hoveredBar.width, hoveredBar.height);
            }
        }

        if (hoveredBar) {
            tooltip.innerHTML = `Score: ${hoveredBar.score}<br>Anzahl: ${hoveredBar.count} Vermittler`;
            tooltip.style.display = 'block';
            const tooltipRect = tooltip.getBoundingClientRect(), canvasRect = canvas.getBoundingClientRect();
            const barCenterX = canvasRect.left + hoveredBar.x + (hoveredBar.width / 2);
            let tooltipLeft = barCenterX - (tooltipRect.width / 2), tooltipTop = canvasRect.top + hoveredBar.y - tooltipRect.height - 15;
            if (tooltipLeft < 5) tooltipLeft = 5;
            if (tooltipLeft + tooltipRect.width > window.innerWidth - 5) tooltipLeft = window.innerWidth - tooltipRect.width - 5;
            if (tooltipTop < 5) tooltipTop = canvasRect.top + hoveredBar.y + hoveredBar.height + 15;
            tooltip.style.position = 'fixed';
            tooltip.style.left = tooltipLeft + 'px';
            tooltip.style.top = tooltipTop + 'px';
        } else {
            tooltip.style.display = 'none';
        }
    });

    canvas.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; if (hoveredBar) { hoveredBar = null; drawDistributionChart(); } });
};

// ========================================
// KPIs & TABLES
// ========================================

export const updateKPIs = () => {
    const data = measuresActive && selectedMeasures.length > 0 && modifiedDistributionData[currentSilo] ? modifiedDistributionData[currentSilo] : distributionData[currentSilo];
    if (!data) return;

    const stats = calculateStats(data, currentSilo);
    const originalStats = calculateStats(distributionData[currentSilo], currentSilo);

    const crElement = getElement('kpiCombinedRatio');
    crElement.textContent = stats.avgCombinedRatio.toFixed(1) + '%';
    crElement.classList.remove('combined-ratio-green', 'combined-ratio-yellow', 'combined-ratio-orange', 'combined-ratio-red');
    crElement.classList.add(stats.avgCombinedRatio <= 90 ? 'combined-ratio-green' : stats.avgCombinedRatio <= 100 ? 'combined-ratio-yellow' : stats.avgCombinedRatio <= 105 ? 'combined-ratio-orange' : 'combined-ratio-red');

    const crTrend = getElement('kpiCombinedTrend');
    if (measuresActive && selectedMeasures.length > 0) {
        const diff = stats.avgCombinedRatio - originalStats.avgCombinedRatio;
        crTrend.textContent = diff < 0 ? `↓ ${Math.abs(diff).toFixed(1)}%` : `↑ +${diff.toFixed(1)}%`;
        crTrend.style.display = 'block';
        crTrend.className = diff < 0 ? 'kpi-trend positive' : 'kpi-trend negative';
    } else { crTrend.style.display = 'none'; }

    const gesamtergebnis = stats.total * stats.avgErtrag;
    const ergebnisElement = getElement('kpiGesamtergebnis');
    ergebnisElement.textContent = formatCurrency(gesamtergebnis);
    ergebnisElement.style.color = gesamtergebnis >= 0 ? '#059669' : '#dc2626';

    const ergebnisTrend = getElement('kpiErgebnisTrend');
    if (measuresActive && selectedMeasures.length > 0) {
        const diff = gesamtergebnis - (originalStats.total * originalStats.avgErtrag);
        ergebnisTrend.textContent = diff > 0 ? `↑ +${formatCurrency(diff)}` : `↓ ${formatCurrency(Math.abs(diff))}`;
        ergebnisTrend.style.display = 'block';
        ergebnisTrend.className = diff > 0 ? 'kpi-trend positive' : 'kpi-trend negative';
    } else { ergebnisTrend.style.display = 'none'; }

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

const updateComparison = () => {
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

// ========================================
// SILO & MEASURES
// ========================================

export const selectSilo = (silo) => {
    if (!distributionData?.alle) initializeDistributionData();
    currentSilo = silo;
    document.querySelectorAll('.toggle-button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (measuresActive && selectedMeasures.length > 0) updateMeasures();
    else { drawDistributionChart(); updateStatisticsTable(); updateKPIs(); }
};

export const toggleMeasures = () => {
    const button = event.target.closest('.measures-toggle-button');
    const content = getElement('measuresContent');
    measuresActive = !measuresActive;

    if (measuresActive) {
        button.classList.add('active');
        content.classList.add('active');
        button.innerHTML = '<span>✅</span><span>Maßnahmen aktiv</span>';
        if (selectedMeasures.length > 0) updateMeasures();
    } else {
        button.classList.remove('active');
        content.classList.remove('active');
        button.innerHTML = '<span>🎯</span><span>Maßnahmen aktivieren</span>';
        document.querySelectorAll('.measure-checkbox input').forEach(cb => { cb.checked = false; });
        selectedMeasures = [];
        modifiedDistributionData = {};
        getElement('comparisonContainer').style.display = 'none';
        drawDistributionChart(); updateStatisticsTable(); updateKPIs();
    }
};

export const updateMeasures = () => {
    selectedMeasures = Array.from(document.querySelectorAll('.measure-checkbox input:checked')).map(cb => cb.value);

    if (selectedMeasures.length > 0 && measuresActive) {
        modifiedDistributionData = {};
        Object.keys(distributionData).forEach(silo => { modifiedDistributionData[silo] = applyMeasuresToDistribution(distributionData[silo]); });
        getElement('comparisonContainer').style.display = 'block';
        updateComparison();
    } else {
        getElement('comparisonContainer').style.display = 'none';
        modifiedDistributionData = {};
    }

    drawDistributionChart(); updateStatisticsTable(); updateKPIs();
};

// ========================================
// SCORING FUNCTIONS
// ========================================

const calculatePerformanceScore = () => {
    const neuScore = Math.min(100, (getValue('neugeschaeftSlider') / 1000000) * 50);
    const bestandScore = Math.min(100, (getValue('bestandSlider') / 5000000) * 50);
    const margeScore = getValue('margenSlider');
    const crossScore = Math.min(100, (getValue('crossSellingSlider') - 1) * 25);
    return ((neuScore + bestandScore + margeScore + crossScore) / 4) * 0.2;
};

const calculateRiskScore = () => {
    const schadenquote = getValue('schadenquoteSlider');
    const vermittlerTyp = getElement('vermittlerTypSelect')?.value ?? 'grossmakler';
    const typeRange = vermittlerTypRanges[vermittlerTyp];

    let schadenScore = schadenquote <= typeRange.min ? 100 :
                       schadenquote <= typeRange.optimal ? 100 - ((schadenquote - typeRange.min) / (typeRange.optimal - typeRange.min)) * 10 :
                       schadenquote <= typeRange.max ? 90 - ((schadenquote - typeRange.optimal) / (typeRange.max - typeRange.optimal)) * 40 :
                       Math.max(0, 50 - ((schadenquote - typeRange.max) * 2));

    const grossScore = Math.max(0, 100 - getValue('grossschadenSlider') * 10);
    const underScore = getValue('underwritingSlider');
    return ((schadenScore + grossScore + underScore) / 3) * 0.4;
};

const calculateStabilityScore = () => {
    const stornoScore = Math.max(0, 100 - getValue('stornoSlider') * 2.5);
    const dauerScore = Math.min(100, getValue('dauerSlider') * 5);
    const ausScore = getValue('ausschoepfungSlider');
    return ((stornoScore + dauerScore + ausScore) / 3) * 0.15;
};

const calculateCustomerScore = () => {
    const npsScore = (getValue('npsSlider') + 100) / 2;
    const beratungScore = getValue('beratungSlider');
    const beschwerdenScore = Math.max(0, 100 - getValue('beschwerdenSlider') * 5);
    return ((npsScore + beratungScore + beschwerdenScore) / 3) * 0.1;
};

const calculateProfitScore = () => {
    const dbScore = Math.min(100, (getValue('deckungsbeitragSlider') / 200000) * 100);
    const keScore = Math.max(0, 100 - (getValue('kostenertragSlider') - 50));
    return ((dbScore + keScore) / 2) * 0.15;
};

const updateTrafficLight = (score) => {
    getElement('redLight')?.classList.remove('active');
    getElement('yellowLight')?.classList.remove('active');
    getElement('greenLight')?.classList.remove('active');
    getElement(score >= 80 ? 'greenLight' : score >= 60 ? 'yellowLight' : 'redLight')?.classList.add('active');
};

export const updateScoring = () => {
    const sliders = ['neugeschaeft', 'bestand', 'margen', 'crossSelling', 'schadenquote', 'grossschaden', 'underwriting', 'storno', 'dauer', 'ausschoepfung', 'nps', 'beratung', 'beschwerden', 'deckungsbeitrag', 'kostenertrag'];
    const suffixes = { neugeschaeft: '', bestand: '', margen: '%', crossSelling: '', schadenquote: '%', grossschaden: '%', underwriting: '%', storno: '%', dauer: ' Jahre', ausschoepfung: '%', nps: '', beratung: '%', beschwerden: '%', deckungsbeitrag: '', kostenertrag: '%' };

    sliders.forEach(name => {
        const val = getValue(name + 'Slider');
        setText(name + 'Value', ['neugeschaeft', 'bestand', 'deckungsbeitrag'].includes(name) ? formatCurrency(val) : val + (suffixes[name] ?? ''));
    });

    const totalScore = calculatePerformanceScore() + calculateRiskScore() + calculateStabilityScore() + calculateCustomerScore() + calculateProfitScore();

    setText('performanceScore', calculatePerformanceScore().toFixed(1) + '/20');
    setText('riskScore', calculateRiskScore().toFixed(1) + '/40');
    setText('stabilityScore', calculateStabilityScore().toFixed(1) + '/15');
    setText('customerScore', calculateCustomerScore().toFixed(1) + '/10');
    setText('profitScore', calculateProfitScore().toFixed(1) + '/15');
    setText('totalScore', Math.round(totalScore));

    updateTrafficLight(totalScore);

    const categoryEl = getElement('scoreCategory');
    categoryEl?.classList.remove('a-level', 'b-level', 'c-level', 'd-level');
    const level = totalScore >= 80 ? 'a' : totalScore >= 60 ? 'b' : totalScore >= 40 ? 'c' : 'd';
    const colors = { a: '#059669', b: '#d97706', c: '#ea580c', d: '#dc2626' };
    const labels = { a: 'A-Vermittler', b: 'B-Vermittler', c: 'C-Vermittler', d: 'D-Vermittler' };

    if (categoryEl) { categoryEl.textContent = labels[level]; categoryEl.classList.add(level + '-level'); }
    const totalEl = getElement('totalScore');
    if (totalEl) totalEl.style.color = colors[level];
};

// ========================================
// SLIDERS & SEGMENTS
// ========================================

export const updateMainSlider = (type, userTriggered = false) => {
    const newTotal = getValue(type + 'Slider');
    setText(type + 'Value', formatCurrency(newTotal));

    if (!userTriggered) { updateScoring(); return; }

    const prefix = type === 'neugeschaeft' ? 'neu' : 'bestand';
    const segments = ['Schaden', 'Kranken', 'Leben'];
    const values = segments.map(s => getValue(prefix + s + 'Slider') || 0);
    const currentTotal = values.reduce((a, b) => a + b, 0);

    if (currentTotal > 0) {
        segments.forEach((s, i) => {
            const newVal = Math.round(newTotal * (values[i] / currentTotal));
            setValue(prefix + s + 'Slider', newVal);
            setText(prefix + s + 'Value', formatCurrency(newVal));
            updateProductsProportionally(prefix + s, newVal);
        });
    } else {
        const ratios = [0.4, 0.3, 0.3];
        segments.forEach((s, i) => setValue(prefix + s + 'Slider', Math.round(newTotal * ratios[i])));
    }
    updateScoring();
};

export const updateSegmentValues = (type, fromProductUpdate = false) => {
    const prefix = type === 'neugeschaeft' ? 'neu' : 'bestand';
    const segments = ['Schaden', 'Kranken', 'Leben'];
    let total = 0;

    segments.forEach(s => {
        const val = getValue(prefix + s + 'Slider');
        total += val;
        setText(prefix + s + 'Value', formatCurrency(val));
        if (!fromProductUpdate) updateProductsProportionally(prefix + s, val);
    });

    setValue(type + 'Slider', total);
    setText(type + 'Value', formatCurrency(total));
    updateScoring();
};

const updateProductsProportionally = (segment, newTotal) => {
    const productDefs = {
        'neuSchaden': [['neuHaftpflicht', 0.3], ['neuUnfall', 0.2], ['neuHausrat', 0.15], ['neuRechtsschutz', 0.15], ['neuKfz', 0.2]],
        'neuKranken': [['neuVoll', 0.533], ['neuZusatz', 0.333], ['neuPflege', 0.134]],
        'neuLeben': [['neuRisiko', 0.267], ['neuBu', 0.4], ['neuRente', 0.333]],
        'bestandSchaden': [['bestandHaftpflicht', 0.3], ['bestandUnfall', 0.2], ['bestandHausrat', 0.15], ['bestandRechtsschutz', 0.15], ['bestandKfz', 0.2]],
        'bestandKranken': [['bestandVoll', 0.533], ['bestandZusatz', 0.333], ['bestandPflege', 0.134]],
        'bestandLeben': [['bestandRisiko', 0.267], ['bestandBu', 0.4], ['bestandRente', 0.333]]
    };

    productDefs[segment]?.forEach(([name, ratio]) => {
        const newVal = Math.round(newTotal * ratio);
        setValue(name + 'Slider', newVal);
        setText(name + 'Value', formatCurrency(newVal));
    });
};

export const updateProductValues = (segment) => {
    const productDefs = {
        'neuSchaden': ['neuHaftpflicht', 'neuUnfall', 'neuHausrat', 'neuRechtsschutz', 'neuKfz'],
        'neuKranken': ['neuVoll', 'neuZusatz', 'neuPflege'],
        'neuLeben': ['neuRisiko', 'neuBu', 'neuRente'],
        'bestandSchaden': ['bestandHaftpflicht', 'bestandUnfall', 'bestandHausrat', 'bestandRechtsschutz', 'bestandKfz'],
        'bestandKranken': ['bestandVoll', 'bestandZusatz', 'bestandPflege'],
        'bestandLeben': ['bestandRisiko', 'bestandBu', 'bestandRente']
    };

    const products = productDefs[segment] ?? [];
    let total = 0;
    products.forEach(p => {
        const val = getValue(p + 'Slider');
        total += val;
        setText(p + 'Value', formatCurrency(val));
    });

    const type = segment.startsWith('neu') ? 'neugeschaeft' : 'bestand';
    const segmentSlider = segment + 'Slider';
    setValue(segmentSlider, total);
    updateSegmentValues(type, true);
};

// ========================================
// UI TOGGLES
// ========================================

export const toggleExpand = (section) => {
    const content = getElement(section + 'Content');
    content?.classList.toggle('expanded');
    event.target.classList.toggle('expanded');
};

export const toggleSegment = (segmentId) => {
    const content = getElement(segmentId + 'Content');
    const arrow = event.currentTarget.querySelector('.expand-arrow');
    content?.classList.toggle('expanded');
    if (arrow) arrow.style.transform = content?.classList.contains('expanded') ? 'rotate(90deg)' : 'rotate(0deg)';
};

export const switchRsTab = (event, tabName) => {
    document.querySelectorAll('.rs-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.rs-tab-content').forEach(content => content.classList.remove('active'));
    event.target.classList.add('active');
    getElement('rs-' + tabName)?.classList.add('active');

    if (tabName === 'unternehmen') {
        if (!distributionData?.alle) initializeDistributionData();
        drawDistributionChart();
        updateStatisticsTable();
        updateKPIs();
        const canvas = getElement('distributionChart');
        if (canvas && !canvas.interactionSetup) { setupChartInteraction(); canvas.interactionSetup = true; }
    }
};

// ========================================
// PROFILES
// ========================================

const profiles = {
    'a-ao': { typ: 'ao', neugeschaeft: 1800000, bestand: 7500000, margen: 70, crossSelling: 3.5, schadenquote: 82, grossschaden: 0.8, underwriting: 96, storno: 3, dauer: 15, ausschoepfung: 92, nps: 85, beratung: 95, beschwerden: 0.5, deckungsbeitrag: 350000, kostenertrag: 45, neuSchaden: 720000, neuKranken: 540000, neuLeben: 540000, bestandSchaden: 3000000, bestandKranken: 2250000, bestandLeben: 2250000 },
    'a-makler': { typ: 'grossmakler', neugeschaeft: 1600000, bestand: 7000000, margen: 65, crossSelling: 3.2, schadenquote: 100, grossschaden: 1.0, underwriting: 93, storno: 4, dauer: 14, ausschoepfung: 88, nps: 75, beratung: 92, beschwerden: 0.8, deckungsbeitrag: 320000, kostenertrag: 50, neuSchaden: 640000, neuKranken: 480000, neuLeben: 480000, bestandSchaden: 2800000, bestandKranken: 2100000, bestandLeben: 2100000 },
    'b-ao': { typ: 'ao', neugeschaeft: 600000, bestand: 3000000, margen: 40, crossSelling: 2.0, schadenquote: 88, grossschaden: 2.0, underwriting: 88, storno: 10, dauer: 8, ausschoepfung: 70, nps: 50, beratung: 80, beschwerden: 2.5, deckungsbeitrag: 100000, kostenertrag: 65, neuSchaden: 240000, neuKranken: 180000, neuLeben: 180000, bestandSchaden: 1200000, bestandKranken: 900000, bestandLeben: 900000 },
    'b-makler': { typ: 'grossmakler', neugeschaeft: 500000, bestand: 2500000, margen: 35, crossSelling: 1.8, schadenquote: 105, grossschaden: 2.5, underwriting: 85, storno: 12, dauer: 7.5, ausschoepfung: 65, nps: 40, beratung: 75, beschwerden: 3, deckungsbeitrag: 85000, kostenertrag: 68, neuSchaden: 200000, neuKranken: 150000, neuLeben: 150000, bestandSchaden: 1000000, bestandKranken: 750000, bestandLeben: 750000 },
    'c-makler': { typ: 'kleinmakler', neugeschaeft: 250000, bestand: 1200000, margen: 20, crossSelling: 1.4, schadenquote: 115, grossschaden: 4, underwriting: 72, storno: 20, dauer: 5, ausschoepfung: 45, nps: 10, beratung: 60, beschwerden: 6, deckungsbeitrag: 35000, kostenertrag: 85, neuSchaden: 100000, neuKranken: 75000, neuLeben: 75000, bestandSchaden: 480000, bestandKranken: 360000, bestandLeben: 360000 },
    'd-autohaus': { typ: 'autohaus', neugeschaeft: 150000, bestand: 800000, margen: 10, crossSelling: 1.1, schadenquote: 130, grossschaden: 7, underwriting: 55, storno: 30, dauer: 3, ausschoepfung: 25, nps: -20, beratung: 45, beschwerden: 12, deckungsbeitrag: 15000, kostenertrag: 105, neuSchaden: 60000, neuKranken: 45000, neuLeben: 45000, bestandSchaden: 320000, bestandKranken: 240000, bestandLeben: 240000 }
};

export const loadVermittlerProfile = () => {
    const p = profiles[getElement('vermittlerSelect')?.value];
    if (!p) return;

    setValue('vermittlerTypSelect', p.typ);
    const typeTexts = { 'ao': 'Ausschließlichkeitsorganisation (AO)', 'grossmakler': 'Großmakler', 'kleinmakler': 'Kleinmakler', 'autohaus': 'Autohaus' };
    setText('vermittlerTypDisplay', typeTexts[p.typ] ?? p.typ);

    ['Schaden', 'Kranken', 'Leben'].forEach(s => {
        ['neu', 'bestand'].forEach(prefix => {
            const key = prefix + s;
            setValue(key + 'Slider', p[key]);
            setText(key + 'Value', formatCurrency(p[key]));
            updateProductsProportionally(key, p[key]);
        });
    });

    setValue('neugeschaeftSlider', p.neugeschaeft);
    setValue('bestandSlider', p.bestand);
    setText('neugeschaeftValue', formatCurrency(p.neugeschaeft));
    setText('bestandValue', formatCurrency(p.bestand));

    ['margen', 'crossSelling', 'schadenquote', 'grossschaden', 'underwriting', 'storno', 'dauer', 'ausschoepfung', 'nps', 'beratung', 'beschwerden', 'deckungsbeitrag', 'kostenertrag'].forEach(name => setValue(name + 'Slider', p[name]));

    updateScoring();
};

// ========================================
// INIT
// ========================================

export const initRisikoscoring = () => {
    if (!getElement('neuSchadenSlider')) return;

    setValue('neuSchadenSlider', 200000);
    setValue('neuKrankenSlider', 150000);
    setValue('neuLebenSlider', 150000);
    setValue('bestandSchadenSlider', 1000000);
    setValue('bestandKrankenSlider', 750000);
    setValue('bestandLebenSlider', 750000);
    setValue('vermittlerTypSelect', 'grossmakler');
    setText('vermittlerTypDisplay', 'Großmakler');

    updateScoring();
};

// ========================================
// WINDOW EXPORTS
// ========================================

Object.assign(window, {
    switchRsTab,
    switchTab: switchRsTab,
    loadVermittlerProfile,
    toggleExpand,
    toggleSegment,
    updateMainSlider,
    updateSegmentValues,
    updateProductValues,
    updateScoring,
    selectSilo,
    toggleMeasures,
    updateMeasures,
    initRisikoscoring
});

console.log('✅ Risikoscoring ES6 modules loaded (ES2024)');
