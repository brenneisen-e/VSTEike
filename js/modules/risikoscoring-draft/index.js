/**
 * @file Risikoscoring Draft Module
 * @description Risk scoring and distribution analysis for insurance brokers (Vermittler).
 * This module provides comprehensive scoring, distribution visualization, and KPI tracking
 * for different broker types (AO, Großmakler, Kleinmakler, Autohaus).
 */

// ============================================================================
// State Management
// ============================================================================

/** @type {Object.<string, number[]>} Global distribution data for all broker types */
let distributionData = {};

/** @type {Object.<string, number[]>} Modified distribution data after applying measures */
let modifiedDistributionData = {};

/** @type {string} Currently selected silo/broker type */
let currentSilo = 'alle';

/** @type {boolean} Whether improvement measures are active */
let measuresActive = false;

/** @type {string[]} List of currently selected improvement measures */
let selectedMeasures = [];

// ============================================================================
// Constants
// ============================================================================

/**
 * Vermittlertyp-spezifische Schadenquoten-Bereiche (Updated for new targets)
 * @const {Object.<string, {min: number, max: number, optimal: number}>}
 */
const vermittlerTypRanges = {
    'ao': { min: 80, max: 95, optimal: 90 },
    'grossmakler': { min: 100, max: 115, optimal: 107 },
    'kleinmakler': { min: 110, max: 125, optimal: 118 },
    'autohaus': { min: 125, max: 145, optimal: 135 }
};

/**
 * Measure effects definition - improvement impact by broker level
 * @const {Object.<string, {d: number, c: number, b: number, a: number}>}
 */
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

// ============================================================================
// Distribution Generation
// ============================================================================

/**
 * Initialize distribution data with adjusted Combined Ratios for new targets
 * Generates distributions for each broker type and combined views
 */
function initializeDistributionData() {
    // Generate individual distributions with adjusted means for new CR ranges
    distributionData = {
        'ao': generateDistribution(500, 78, 7),        // Best scores (CR ~90%)
        'grossmakler': generateDistribution(2000, 62, 10), // Medium scores (CR ~107%)
        'kleinmakler': generateDistribution(11800, 52, 12), // Lower scores (CR ~118%)
        'autohaus': generateDistribution(100, 35, 13)    // Worst scores (CR ~135%)
    };

    // Then create combined distributions
    distributionData['makler'] = combineDistributions(['grossmakler', 'kleinmakler']);
    distributionData['alle'] = combineDistributions(['ao', 'grossmakler', 'kleinmakler', 'autohaus']);
}

/**
 * Generate normal-ish distribution with outliers using Box-Muller transform
 * @param {number} total - Total number of data points to generate
 * @param {number} mean - Mean value for the distribution
 * @param {number} stdDev - Standard deviation
 * @returns {number[]} Array of 100 bins with count of values in each bin
 */
function generateDistribution(total, mean, stdDev) {
    const distribution = new Array(100).fill(0);

    for (let i = 0; i < total; i++) {
        let score;
        do {
            const u1 = Math.random();
            const u2 = Math.random();
            const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            score = mean + z0 * stdDev;

            if (Math.random() < 0.05) {
                score += (Math.random() - 0.5) * 20;
            }
        } while (score < 0 || score > 100);

        const bin = Math.min(99, Math.max(0, Math.floor(score)));
        distribution[bin]++;
    }

    if (mean < 60) {
        for (let i = 20; i < 25; i++) {
            distribution[i] = Math.floor(distribution[i] * 0.7);
        }
        for (let i = 15; i < 20; i++) {
            distribution[i] = Math.floor(distribution[i] * 1.1);
        }
    }

    return distribution;
}

/**
 * Combine multiple distributions into one
 * @param {string[]} silos - Array of silo names to combine
 * @returns {number[]} Combined distribution
 */
function combineDistributions(silos) {
    const combined = new Array(100).fill(0);
    silos.forEach(silo => {
        if (distributionData[silo]) {
            distributionData[silo].forEach((count, index) => {
                combined[index] += count;
            });
        }
    });
    return combined;
}

/**
 * Apply improvement measures to a distribution
 * @param {number[]} originalDist - Original distribution to modify
 * @returns {number[]} Modified distribution with measures applied
 */
function applyMeasuresToDistribution(originalDist) {
    const newDist = new Array(100).fill(0);

    originalDist.forEach((count, score) => {
        if (count === 0) return;

        let level;
        if (score >= 80) level = 'a';
        else if (score >= 60) level = 'b';
        else if (score >= 40) level = 'c';
        else level = 'd';

        let totalImprovement = 0;
        selectedMeasures.forEach(measure => {
            if (measureEffects[measure] && measureEffects[measure][level]) {
                totalImprovement += measureEffects[measure][level];
            }
        });

        if (score >= 80) {
            const above80 = score - 80;
            const diminishingFactor = Math.max(0.3, 1 - (above80 / 20) * 0.7);
            totalImprovement *= diminishingFactor;
        }

        let newScore = score + totalImprovement;
        newScore = Math.min(95, newScore);

        const newBin = Math.min(99, Math.max(0, Math.floor(newScore)));
        newDist[newBin] += count;
    });

    return newDist;
}

// ============================================================================
// Statistics & Estimation
// ============================================================================

/**
 * Calculate statistics for a distribution with adjusted Combined Ratios for new targets
 * @param {number[]} distribution - Distribution array
 * @param {string|null} siloType - Broker type for silo-specific calculations
 * @returns {Object} Statistics including totals, averages, and level counts
 */
function calculateStats(distribution, siloType = null) {
    if (!distribution || !Array.isArray(distribution)) {
        return {
            total: 0,
            average: 0,
            avgNeugeschaeft: 0,
            avgBestand: 0,
            avgCombinedRatio: 0,
            avgErtrag: 0,
            avgStorno: 0,
            avgCrossSelling: 0,
            levels: { a: 0, b: 0, c: 0, d: 0 }
        };
    }

    let total = 0;
    let weightedSum = 0;
    let neugeschaeftSum = 0;
    let bestandSum = 0;
    let combinedRatioSum = 0;
    let ertragSum = 0;
    let stornoSum = 0;
    let crossSellingSum = 0;
    let levelCounts = { a: 0, b: 0, c: 0, d: 0 };

    distribution.forEach((count, bin) => {
        const score = bin;
        total += count;
        weightedSum += count * score;

        if (score >= 80) levelCounts.a += count;
        else if (score >= 60) levelCounts.b += count;
        else if (score >= 40) levelCounts.c += count;
        else levelCounts.d += count;

        for (let i = 0; i < count; i++) {
            neugeschaeftSum += estimateNeugeschaeft(score);
            bestandSum += estimateBestand(score);
            combinedRatioSum += estimateCombinedRatio(score, siloType);
            ertragSum += estimateErtrag(score, siloType);
            stornoSum += estimateStorno(score);
            crossSellingSum += estimateCrossSelling(score);
        }
    });

    return {
        total: total,
        average: total > 0 ? weightedSum / total : 0,
        avgNeugeschaeft: total > 0 ? neugeschaeftSum / total : 0,
        avgBestand: total > 0 ? bestandSum / total : 0,
        avgCombinedRatio: total > 0 ? combinedRatioSum / total : 0,
        avgErtrag: total > 0 ? ertragSum / total : 0,
        avgStorno: total > 0 ? stornoSum / total : 0,
        avgCrossSelling: total > 0 ? crossSellingSum / total : 0,
        levels: levelCounts
    };
}

/**
 * Estimate new business volume based on score
 * @param {number} score - Broker score (0-100)
 * @returns {number} Estimated new business volume
 */
function estimateNeugeschaeft(score) {
    if (score >= 80) return 1500000 + Math.random() * 500000;
    if (score >= 60) return 400000 + Math.random() * 400000;
    if (score >= 40) return 200000 + Math.random() * 200000;
    return 50000 + Math.random() * 150000;
}

/**
 * Estimate portfolio value based on score
 * @param {number} score - Broker score (0-100)
 * @returns {number} Estimated portfolio value
 */
function estimateBestand(score) {
    if (score >= 80) return 6000000 + Math.random() * 2000000;
    if (score >= 60) return 2000000 + Math.random() * 2000000;
    if (score >= 40) return 1000000 + Math.random() * 1000000;
    return 500000 + Math.random() * 500000;
}

/**
 * Adjusted Combined Ratio estimation for new targets
 * @param {number} score - Broker score (0-100)
 * @param {string|null} siloType - Broker type for silo-specific ranges
 * @returns {number} Estimated combined ratio percentage
 */
function estimateCombinedRatio(score, siloType = null) {
    // Base estimation from score
    let baseRatio;
    if (score >= 80) baseRatio = 85 + Math.random() * 10;  // 85-95%
    else if (score >= 60) baseRatio = 100 + Math.random() * 15;  // 100-115%
    else if (score >= 40) baseRatio = 115 + Math.random() * 15;  // 115-130%
    else baseRatio = 130 + Math.random() * 20; // 130-150%

    // Adjust based on silo type if specified
    if (siloType === 'ao') {
        baseRatio = 85 + Math.random() * 10; // 85-95%, target 90%
    } else if (siloType === 'grossmakler') {
        baseRatio = 100 + Math.random() * 14; // 100-114%, target 107%
    } else if (siloType === 'kleinmakler') {
        baseRatio = 111 + Math.random() * 14; // 111-125%, target 118%
    } else if (siloType === 'autohaus') {
        baseRatio = 128 + Math.random() * 14; // 128-142%, target 135%
    }

    return baseRatio;
}

/**
 * Adjusted Ertrag (earnings) for target of -77M total
 * @param {number} score - Broker score (0-100)
 * @param {string|null} siloType - Broker type for silo-specific earnings
 * @returns {number} Estimated earnings per broker
 */
function estimateErtrag(score, siloType = null) {
    let baseErtrag;

    // AO is positive (+2M total for 500 VMs = +4k per VM average)
    if (siloType === 'ao') {
        // Positive earnings for AO
        if (score >= 80) baseErtrag = 4500 + Math.random() * 1000;  // 4.5k-5.5k per VM
        else if (score >= 60) baseErtrag = 3500 + Math.random() * 1000;  // 3.5k-4.5k
        else baseErtrag = 2500 + Math.random() * 1000;  // 2.5k-3.5k
    } else if (siloType === 'grossmakler') {
        // Slightly negative for Großmakler (-10M total for 2000 VMs = -5k per VM)
        if (score >= 80) baseErtrag = -3000 - Math.random() * 1000;  // -3k to -4k
        else if (score >= 60) baseErtrag = -4500 - Math.random() * 1000;  // -4.5k to -5.5k
        else baseErtrag = -6000 - Math.random() * 2000;  // -6k to -8k
    } else if (siloType === 'kleinmakler') {
        // More negative for Kleinmakler (-64M total for 11800 VMs = -5.4k per VM)
        if (score >= 80) baseErtrag = -3500 - Math.random() * 1000;  // -3.5k to -4.5k
        else if (score >= 60) baseErtrag = -5000 - Math.random() * 1000;  // -5k to -6k
        else baseErtrag = -6500 - Math.random() * 1500;  // -6.5k to -8k
    } else if (siloType === 'autohaus') {
        // Most negative for Autohaus (-5M total for 100 VMs = -50k per VM)
        if (score >= 80) baseErtrag = -35000 - Math.random() * 10000;  // -35k to -45k
        else if (score >= 60) baseErtrag = -45000 - Math.random() * 10000;  // -45k to -55k
        else baseErtrag = -55000 - Math.random() * 10000;  // -55k to -65k
    } else {
        // Default negative (for combined views)
        baseErtrag = -5000 - Math.random() * 1000;
    }

    return baseErtrag;
}

/**
 * Estimate cancellation rate based on score
 * @param {number} score - Broker score (0-100)
 * @returns {number} Estimated cancellation percentage
 */
function estimateStorno(score) {
    if (score >= 80) return 3 + Math.random() * 2;
    if (score >= 60) return 8 + Math.random() * 4;
    if (score >= 40) return 15 + Math.random() * 5;
    return 25 + Math.random() * 10;
}

/**
 * Estimate cross-selling ratio based on score
 * @param {number} score - Broker score (0-100)
 * @returns {number} Estimated cross-selling ratio
 */
function estimateCrossSelling(score) {
    if (score >= 80) return 3 + Math.random() * 1;
    if (score >= 60) return 2 + Math.random() * 0.8;
    if (score >= 40) return 1.3 + Math.random() * 0.4;
    return 1 + Math.random() * 0.2;
}

// ============================================================================
// UI Update Functions
// ============================================================================

/**
 * Update KPIs display with current or modified data
 */
function updateKPIs() {
    const data = measuresActive && selectedMeasures.length > 0 && modifiedDistributionData[currentSilo] ?
        modifiedDistributionData[currentSilo] : distributionData[currentSilo];

    if (!data) return;

    const stats = calculateStats(data, currentSilo);
    const originalStats = calculateStats(distributionData[currentSilo], currentSilo);

    // Update Combined Ratio with color coding
    const crElement = document.getElementById('kpiCombinedRatio');
    const crValue = stats.avgCombinedRatio;
    crElement.textContent = crValue.toFixed(1) + '%';

    // Remove all color classes
    crElement.classList.remove('combined-ratio-green', 'combined-ratio-yellow', 'combined-ratio-orange', 'combined-ratio-red');

    // Apply color based on ranges
    if (crValue <= 90) {
        crElement.classList.add('combined-ratio-green');
    } else if (crValue <= 100) {
        crElement.classList.add('combined-ratio-yellow');
    } else if (crValue <= 105) {
        crElement.classList.add('combined-ratio-orange');
    } else {
        crElement.classList.add('combined-ratio-red');
    }

    // Show trend if measures active
    const crTrend = document.getElementById('kpiCombinedTrend');
    if (measuresActive && selectedMeasures.length > 0) {
        const diff = crValue - originalStats.avgCombinedRatio;
        crTrend.textContent = diff < 0 ? `↓ ${Math.abs(diff).toFixed(1)}%` : `↑ +${diff.toFixed(1)}%`;
        crTrend.style.display = 'block';
        crTrend.className = diff < 0 ? 'kpi-trend positive' : 'kpi-trend negative';
    } else {
        crTrend.style.display = 'none';
    }

    // Calculate Gesamtergebnis with negative base
    const totalVermittler = stats.total;
    const avgErtragPerVm = stats.avgErtrag;
    const gesamtergebnis = totalVermittler * avgErtragPerVm;

    const ergebnisElement = document.getElementById('kpiGesamtergebnis');
    ergebnisElement.textContent = formatCurrency(gesamtergebnis);

    // Color code based on positive/negative
    if (gesamtergebnis >= 0) {
        ergebnisElement.style.color = '#059669';
    } else {
        ergebnisElement.style.color = '#dc2626';
    }

    // Show trend for Gesamtergebnis
    const ergebnisTrend = document.getElementById('kpiErgebnisTrend');
    if (measuresActive && selectedMeasures.length > 0) {
        const originalErgebnis = originalStats.total * originalStats.avgErtrag;
        const diff = gesamtergebnis - originalErgebnis;

        ergebnisTrend.textContent = diff > 0 ? `↑ +${formatCurrency(diff)}` : `↓ ${formatCurrency(Math.abs(diff))}`;
        ergebnisTrend.style.display = 'block';
        ergebnisTrend.className = diff > 0 ? 'kpi-trend positive' : 'kpi-trend negative';
    } else {
        ergebnisTrend.style.display = 'none';
    }

    // Update VM-Entwicklung
    document.getElementById('kpiVmA').textContent = stats.levels.a;
    document.getElementById('kpiVmB').textContent = stats.levels.b;
    document.getElementById('kpiVmC').textContent = stats.levels.c;
    document.getElementById('kpiVmD').textContent = stats.levels.d;
    document.getElementById('kpiVmTotal').textContent = stats.total.toLocaleString('de-DE');

    // Show trends for VM levels
    if (measuresActive && selectedMeasures.length > 0) {
        document.getElementById('kpiVmATrend').textContent = stats.levels.a > originalStats.levels.a ? '↑' : '↓';
        document.getElementById('kpiVmATrend').style.display = 'inline';
        document.getElementById('kpiVmBTrend').textContent = stats.levels.b > originalStats.levels.b ? '↑' : '↓';
        document.getElementById('kpiVmBTrend').style.display = 'inline';
        document.getElementById('kpiVmCTrend').textContent = stats.levels.c > originalStats.levels.c ? '↑' : '↓';
        document.getElementById('kpiVmCTrend').style.display = 'inline';
        document.getElementById('kpiVmDTrend').textContent = stats.levels.d > originalStats.levels.d ? '↑' : '↓';
        document.getElementById('kpiVmDTrend').style.display = 'inline';
    } else {
        document.getElementById('kpiVmATrend').style.display = 'none';
        document.getElementById('kpiVmBTrend').style.display = 'none';
        document.getElementById('kpiVmCTrend').style.display = 'none';
        document.getElementById('kpiVmDTrend').style.display = 'none';
    }
}

/**
 * Draw distribution chart on canvas
 */
function drawDistributionChart() {
    const canvas = document.getElementById('distributionChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const distribution = distributionData[currentSilo];

    if (!distribution) {
        console.error('No distribution data for', currentSilo);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 50;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = chartWidth / 100;

    let maxValue = Math.max(...distribution);
    if (measuresActive && modifiedDistributionData[currentSilo]) {
        maxValue = Math.max(maxValue, ...modifiedDistributionData[currentSilo]);
    }

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    canvas.barPositions = [];

    const showModified = measuresActive && selectedMeasures.length > 0 && modifiedDistributionData[currentSilo];

    distribution.forEach((count, score) => {
        const x = padding + score * barWidth;
        const height = count > 0 ? Math.max(2, (count / maxValue) * chartHeight) : 0;
        const y = canvas.height - padding - height;

        let color;
        const alpha = showModified ? 0.3 : 1.0;

        if (score >= 80) {
            const intensity = (score - 80) / 20;
            color = `hsla(140, ${50 + intensity * 20}%, ${75 - intensity * 10}%, ${alpha})`;
        } else if (score >= 60) {
            const intensity = (score - 60) / 20;
            color = `hsla(50, ${60 + intensity * 20}%, ${80 - intensity * 10}%, ${alpha})`;
        } else if (score >= 40) {
            const intensity = (score - 40) / 20;
            color = `hsla(30, ${65 + intensity * 20}%, ${75 - intensity * 10}%, ${alpha})`;
        } else {
            const intensity = score / 40;
            color = `hsla(0, ${50 + intensity * 30}%, ${80 - intensity * 15}%, ${alpha})`;
        }

        ctx.fillStyle = color;
        if (height > 0) {
            ctx.fillRect(x, y, barWidth - 1, height);
        }
    });

    if (showModified) {
        modifiedDistributionData[currentSilo].forEach((count, score) => {
            const x = padding + score * barWidth;
            const height = count > 0 ? Math.max(2, (count / maxValue) * chartHeight) : 0;
            const y = canvas.height - padding - height;

            let color;
            if (score >= 80) {
                const intensity = (score - 80) / 20;
                color = `hsl(140, ${50 + intensity * 20}%, ${75 - intensity * 10}%)`;
            } else if (score >= 60) {
                const intensity = (score - 60) / 20;
                color = `hsl(50, ${60 + intensity * 20}%, ${80 - intensity * 10}%)`;
            } else if (score >= 40) {
                const intensity = (score - 40) / 20;
                color = `hsl(30, ${65 + intensity * 20}%, ${75 - intensity * 10}%)`;
            } else {
                const intensity = score / 40;
                color = `hsl(0, ${50 + intensity * 30}%, ${80 - intensity * 15}%)`;
            }

            ctx.fillStyle = color;
            if (height > 0) {
                ctx.fillRect(x, y, barWidth - 1, height);
            }

            canvas.barPositions[score] = {
                x: x,
                y: y,
                width: barWidth - 1,
                height: height,
                count: count,
                score: score,
                color: color
            };
        });
    } else {
        distribution.forEach((count, score) => {
            const x = padding + score * barWidth;
            const height = count > 0 ? Math.max(2, (count / maxValue) * chartHeight) : 0;
            const y = canvas.height - padding - height;

            canvas.barPositions[score] = {
                x: x,
                y: y,
                width: barWidth - 1,
                height: height,
                count: count,
                score: score
            };
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
    for (let i = 0; i <= 100; i += 10) {
        const x = padding + i * barWidth;
        ctx.fillText(i, x, canvas.height - padding + 20);
    }

    ctx.textAlign = 'right';
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
        const y = canvas.height - padding - (i / ySteps) * chartHeight;
        const value = Math.round((i / ySteps) * maxValue);
        ctx.fillText(value, padding - 10, y + 5);
    }

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Score', canvas.width / 2, canvas.height - 10);

    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Anzahl Vermittler', 0, 0);
    ctx.restore();
}

/**
 * Setup chart interaction (hover tooltips)
 */
function setupChartInteraction() {
    const canvas = document.getElementById('distributionChart');
    const tooltip = document.getElementById('chartTooltip');
    let hoveredBar = null;

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let newHoveredBar = null;
        if (canvas.barPositions) {
            canvas.barPositions.forEach(bar => {
                if (bar && bar.height > 0 && x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height) {
                    newHoveredBar = bar;
                }
            });
        }

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

            // Get actual tooltip dimensions after content is set
            const tooltipRect = tooltip.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();

            // Calculate center position of the bar in page coordinates
            const barCenterX = canvasRect.left + hoveredBar.x + (hoveredBar.width / 2);
            const barTopY = canvasRect.top + hoveredBar.y;

            // Position tooltip centered above the bar
            let tooltipLeft = barCenterX - (tooltipRect.width / 2);
            let tooltipTop = barTopY - tooltipRect.height - 15;

            // Keep tooltip within viewport bounds
            if (tooltipLeft < 5) tooltipLeft = 5;
            if (tooltipLeft + tooltipRect.width > window.innerWidth - 5) {
                tooltipLeft = window.innerWidth - tooltipRect.width - 5;
            }

            // If tooltip would go above viewport, show it below the bar
            if (tooltipTop < 5) {
                tooltipTop = canvasRect.top + hoveredBar.y + hoveredBar.height + 15;
            }

            // Position tooltip with fixed positioning
            tooltip.style.position = 'fixed';
            tooltip.style.left = tooltipLeft + 'px';
            tooltip.style.top = tooltipTop + 'px';
        } else {
            tooltip.style.display = 'none';
        }
    });

    canvas.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
        if (hoveredBar) {
            hoveredBar = null;
            drawDistributionChart();
        }
    });
}

/**
 * Select a silo (broker type) for visualization
 * @param {string} silo - Silo name to select
 */
export function selectSilo(silo) {
    if (!distributionData || !distributionData.alle) {
        initializeDistributionData();
    }

    currentSilo = silo;

    document.querySelectorAll('.toggle-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    if (measuresActive && selectedMeasures.length > 0) {
        updateMeasures();
    } else {
        drawDistributionChart();
        updateStatisticsTable();
        updateKPIs();
    }
}

/**
 * Toggle improvement measures on/off
 */
export function toggleMeasures() {
    const button = event.target.closest('.measures-toggle-button');
    const content = document.getElementById('measuresContent');

    measuresActive = !measuresActive;

    if (measuresActive) {
        button.classList.add('active');
        content.classList.add('active');
        button.innerHTML = '<span>✅</span><span>Maßnahmen aktiv</span>';

        if (selectedMeasures.length > 0) {
            updateMeasures();
        }
    } else {
        button.classList.remove('active');
        content.classList.remove('active');
        button.innerHTML = '<span>🎯</span><span>Maßnahmen aktivieren</span>';

        document.querySelectorAll('.measure-checkbox input').forEach(cb => {
            cb.checked = false;
        });
        selectedMeasures = [];
        modifiedDistributionData = {};

        document.getElementById('comparisonContainer').style.display = 'none';

        drawDistributionChart();
        updateStatisticsTable();
        updateKPIs();
    }
}

/**
 * Update measures and recalculate distributions
 */
export function updateMeasures() {
    selectedMeasures = [];
    document.querySelectorAll('.measure-checkbox input:checked').forEach(cb => {
        selectedMeasures.push(cb.value);
    });

    if (selectedMeasures.length > 0 && measuresActive) {
        modifiedDistributionData = {};

        Object.keys(distributionData).forEach(silo => {
            modifiedDistributionData[silo] = applyMeasuresToDistribution(distributionData[silo]);
        });

        document.getElementById('comparisonContainer').style.display = 'block';
        updateComparison();
    } else {
        document.getElementById('comparisonContainer').style.display = 'none';
        modifiedDistributionData = {};
    }

    drawDistributionChart();
    updateStatisticsTable();
    updateKPIs();
}

/**
 * Update comparison display (before/after measures)
 */
function updateComparison() {
    const originalStats = calculateStats(distributionData[currentSilo], currentSilo);
    const modifiedStats = calculateStats(modifiedDistributionData[currentSilo], currentSilo);

    document.getElementById('beforeAvgScore').textContent = originalStats.average.toFixed(1);
    document.getElementById('beforeA').textContent = originalStats.levels.a;
    document.getElementById('beforeB').textContent = originalStats.levels.b;
    document.getElementById('beforeC').textContent = originalStats.levels.c;
    document.getElementById('beforeD').textContent = originalStats.levels.d;

    document.getElementById('afterAvgScore').textContent = modifiedStats.average.toFixed(1);
    document.getElementById('afterA').textContent = modifiedStats.levels.a;
    document.getElementById('afterB').textContent = modifiedStats.levels.b;
    document.getElementById('afterC').textContent = modifiedStats.levels.c;
    document.getElementById('afterD').textContent = modifiedStats.levels.d;

    const improvement = modifiedStats.average - originalStats.average;
    const badge = document.querySelector('.improvement-badge');
    if (badge) {
        badge.textContent = `+${improvement.toFixed(1)}`;
    }
}

/**
 * Update statistics table with current data
 */
function updateStatisticsTable() {
    const tbody = document.getElementById('statisticsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!distributionData || !distributionData.alle) {
        initializeDistributionData();
    }

    const siloInfo = {
        'ao': { name: 'Ausschließlichkeitsorganisation', data: distributionData.ao },
        'grossmakler': { name: 'Großmakler', data: distributionData.grossmakler },
        'kleinmakler': { name: 'Kleinmakler', data: distributionData.kleinmakler },
        'autohaus': { name: 'Autohäuser', data: distributionData.autohaus }
    };

    const silosToShow = currentSilo === 'alle' || currentSilo === 'makler' ?
        ['ao', 'grossmakler', 'kleinmakler', 'autohaus'] : [currentSilo];

    silosToShow.forEach(silo => {
        if (siloInfo[silo]) {
            const data = measuresActive && selectedMeasures.length > 0 && modifiedDistributionData[silo] ?
                modifiedDistributionData[silo] : distributionData[silo];
            const stats = calculateStats(data, silo);
            const originalStats = calculateStats(distributionData[silo], silo);

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${siloInfo[silo].name}</td>
                <td class="stat-value">${stats.total.toLocaleString('de-DE')}</td>
                <td class="stat-value">
                    ${stats.average.toFixed(1)}
                    ${measuresActive && selectedMeasures.length > 0 && stats.average !== originalStats.average ?
                        `<span class="improvement-badge">+${(stats.average - originalStats.average).toFixed(1)}</span>` : ''}
                </td>
                <td class="stat-value">${formatCurrency(stats.avgNeugeschaeft)}</td>
                <td class="stat-value">${formatCurrency(stats.avgBestand)}</td>
                <td class="stat-value">${stats.avgCombinedRatio.toFixed(1)}%</td>
                <td class="stat-value">${formatCurrency(stats.avgErtrag)}</td>
                <td class="stat-value">${stats.avgStorno.toFixed(1)}%</td>
                <td class="stat-value">${stats.avgCrossSelling.toFixed(1)}</td>
            `;

            tbody.appendChild(row);
        }
    });

    if (currentSilo === 'alle' || currentSilo === 'makler') {
        const data = measuresActive && selectedMeasures.length > 0 && modifiedDistributionData[currentSilo] ?
            modifiedDistributionData[currentSilo] : distributionData[currentSilo];
        const totalStats = calculateStats(data, currentSilo);
        const originalTotalStats = calculateStats(distributionData[currentSilo], currentSilo);

        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        totalRow.style.background = '#f8fafc';

        totalRow.innerHTML = `
            <td>Gesamt</td>
            <td class="stat-value">${totalStats.total.toLocaleString('de-DE')}</td>
            <td class="stat-value">
                ${totalStats.average.toFixed(1)}
                ${measuresActive && selectedMeasures.length > 0 && totalStats.average !== originalTotalStats.average ?
                    `<span class="improvement-badge">+${(totalStats.average - originalTotalStats.average).toFixed(1)}</span>` : ''}
            </td>
            <td class="stat-value">${formatCurrency(totalStats.avgNeugeschaeft)}</td>
            <td class="stat-value">${formatCurrency(totalStats.avgBestand)}</td>
            <td class="stat-value">${totalStats.avgCombinedRatio.toFixed(1)}%</td>
            <td class="stat-value">${formatCurrency(totalStats.avgErtrag)}</td>
            <td class="stat-value">${totalStats.avgStorno.toFixed(1)}%</td>
            <td class="stat-value">${totalStats.avgCrossSelling.toFixed(1)}</td>
        `;

        tbody.appendChild(totalRow);
    }
}

// ============================================================================
// Broker Profile Management
// ============================================================================

/**
 * Load a predefined broker profile
 */
export function loadVermittlerProfile() {
    const selectedProfile = document.getElementById('vermittlerSelect').value;

    const profiles = {
        'a-ao': {
            typ: 'ao',
            neugeschaeft: 1800000,
            bestand: 7500000,
            margen: 70,
            crossSelling: 3.5,
            schadenquote: 82,
            grossschaden: 0.8,
            underwriting: 96,
            storno: 3,
            dauer: 15,
            ausschoepfung: 92,
            nps: 85,
            beratung: 95,
            beschwerden: 0.5,
            deckungsbeitrag: 350000,
            kostenertrag: 45,
            neuSchaden: 720000,
            neuKranken: 540000,
            neuLeben: 540000,
            bestandSchaden: 3000000,
            bestandKranken: 2250000,
            bestandLeben: 2250000
        },
        'a-makler': {
            typ: 'grossmakler',
            neugeschaeft: 1600000,
            bestand: 7000000,
            margen: 65,
            crossSelling: 3.2,
            schadenquote: 100,
            grossschaden: 1.0,
            underwriting: 93,
            storno: 4,
            dauer: 14,
            ausschoepfung: 88,
            nps: 75,
            beratung: 92,
            beschwerden: 0.8,
            deckungsbeitrag: 320000,
            kostenertrag: 50,
            neuSchaden: 640000,
            neuKranken: 480000,
            neuLeben: 480000,
            bestandSchaden: 2800000,
            bestandKranken: 2100000,
            bestandLeben: 2100000
        },
        'b-ao': {
            typ: 'ao',
            neugeschaeft: 600000,
            bestand: 3000000,
            margen: 40,
            crossSelling: 2.0,
            schadenquote: 88,
            grossschaden: 2.0,
            underwriting: 88,
            storno: 10,
            dauer: 8,
            ausschoepfung: 70,
            nps: 50,
            beratung: 80,
            beschwerden: 2.5,
            deckungsbeitrag: 100000,
            kostenertrag: 65,
            neuSchaden: 240000,
            neuKranken: 180000,
            neuLeben: 180000,
            bestandSchaden: 1200000,
            bestandKranken: 900000,
            bestandLeben: 900000
        },
        'b-makler': {
            typ: 'grossmakler',
            neugeschaeft: 500000,
            bestand: 2500000,
            margen: 35,
            crossSelling: 1.8,
            schadenquote: 105,
            grossschaden: 2.5,
            underwriting: 85,
            storno: 12,
            dauer: 7.5,
            ausschoepfung: 65,
            nps: 40,
            beratung: 75,
            beschwerden: 3,
            deckungsbeitrag: 85000,
            kostenertrag: 68,
            neuSchaden: 200000,
            neuKranken: 150000,
            neuLeben: 150000,
            bestandSchaden: 1000000,
            bestandKranken: 750000,
            bestandLeben: 750000
        },
        'c-makler': {
            typ: 'kleinmakler',
            neugeschaeft: 250000,
            bestand: 1200000,
            margen: 20,
            crossSelling: 1.4,
            schadenquote: 115,
            grossschaden: 4,
            underwriting: 72,
            storno: 20,
            dauer: 5,
            ausschoepfung: 45,
            nps: 10,
            beratung: 60,
            beschwerden: 6,
            deckungsbeitrag: 35000,
            kostenertrag: 85,
            neuSchaden: 100000,
            neuKranken: 75000,
            neuLeben: 75000,
            bestandSchaden: 480000,
            bestandKranken: 360000,
            bestandLeben: 360000
        },
        'd-autohaus': {
            typ: 'autohaus',
            neugeschaeft: 150000,
            bestand: 800000,
            margen: 10,
            crossSelling: 1.1,
            schadenquote: 130,
            grossschaden: 7,
            underwriting: 55,
            storno: 30,
            dauer: 3,
            ausschoepfung: 25,
            nps: -20,
            beratung: 45,
            beschwerden: 12,
            deckungsbeitrag: 15000,
            kostenertrag: 105,
            neuSchaden: 60000,
            neuKranken: 45000,
            neuLeben: 45000,
            bestandSchaden: 320000,
            bestandKranken: 240000,
            bestandLeben: 240000
        }
    };

    const profile = profiles[selectedProfile];
    if (!profile) return;

    // Set vermittler type display
    document.getElementById('vermittlerTypSelect').value = profile.typ;
    const typeDisplay = document.getElementById('vermittlerTypDisplay');
    const typeTexts = {
        'ao': 'Ausschließlichkeitsorganisation (AO)',
        'grossmakler': 'Großmakler',
        'kleinmakler': 'Kleinmakler',
        'autohaus': 'Autohaus'
    };
    typeDisplay.textContent = typeTexts[profile.typ] || profile.typ;

    // Set segment values FIRST
    document.getElementById('neuSchadenSlider').value = profile.neuSchaden;
    document.getElementById('neuKrankenSlider').value = profile.neuKranken;
    document.getElementById('neuLebenSlider').value = profile.neuLeben;
    document.getElementById('bestandSchadenSlider').value = profile.bestandSchaden;
    document.getElementById('bestandKrankenSlider').value = profile.bestandKranken;
    document.getElementById('bestandLebenSlider').value = profile.bestandLeben;

    // Update segment display values
    document.getElementById('neuSchadenValue').textContent = formatCurrency(profile.neuSchaden);
    document.getElementById('neuKrankenValue').textContent = formatCurrency(profile.neuKranken);
    document.getElementById('neuLebenValue').textContent = formatCurrency(profile.neuLeben);
    document.getElementById('bestandSchadenValue').textContent = formatCurrency(profile.bestandSchaden);
    document.getElementById('bestandKrankenValue').textContent = formatCurrency(profile.bestandKranken);
    document.getElementById('bestandLebenValue').textContent = formatCurrency(profile.bestandLeben);

    // Update products proportionally
    updateProductsProportionally('neuSchaden', profile.neuSchaden);
    updateProductsProportionally('neuKranken', profile.neuKranken);
    updateProductsProportionally('neuLeben', profile.neuLeben);
    updateProductsProportionally('bestandSchaden', profile.bestandSchaden);
    updateProductsProportionally('bestandKranken', profile.bestandKranken);
    updateProductsProportionally('bestandLeben', profile.bestandLeben);

    // Set main values (without triggering proportional distribution)
    document.getElementById('neugeschaeftSlider').value = profile.neugeschaeft;
    document.getElementById('bestandSlider').value = profile.bestand;
    document.getElementById('neugeschaeftValue').textContent = formatCurrency(profile.neugeschaeft);
    document.getElementById('bestandValue').textContent = formatCurrency(profile.bestand);

    // Set all other values
    document.getElementById('margenSlider').value = profile.margen;
    document.getElementById('crossSellingSlider').value = profile.crossSelling;
    document.getElementById('schadenquoteSlider').value = profile.schadenquote;
    document.getElementById('grossschadenSlider').value = profile.grossschaden;
    document.getElementById('underwritingSlider').value = profile.underwriting;
    document.getElementById('stornoSlider').value = profile.storno;
    document.getElementById('dauerSlider').value = profile.dauer;
    document.getElementById('ausschoepfungSlider').value = profile.ausschoepfung;
    document.getElementById('npsSlider').value = profile.nps;
    document.getElementById('beratungSlider').value = profile.beratung;
    document.getElementById('beschwerdenSlider').value = profile.beschwerden;
    document.getElementById('deckungsbeitragSlider').value = profile.deckungsbeitrag;
    document.getElementById('kostenertragSlider').value = profile.kostenertrag;

    // Update all displays
    updateScoring();
}

// ============================================================================
// Tab & UI Interaction
// ============================================================================

/**
 * Switch between tabs (individual broker vs enterprise view)
 * @param {Event} event - Click event
 * @param {string} tabName - Name of tab to switch to
 */
export function switchTab(event, tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');

    // Initialize enterprise view if switching to it
    if (tabName === 'unternehmen') {
        if (!distributionData || !distributionData.alle) {
            initializeDistributionData();
        }
        drawDistributionChart();
        updateStatisticsTable();
        updateKPIs();

        // Setup interaction only once
        const canvas = document.getElementById('distributionChart');
        if (canvas && !canvas.interactionSetup) {
            setupChartInteraction();
            canvas.interactionSetup = true;
        }
    }
}

/**
 * Update main slider and distribute proportionally
 * @param {string} type - Type of slider (neugeschaeft or bestand)
 * @param {boolean} userTriggered - Whether user manually changed the slider
 */
export function updateMainSlider(type, userTriggered = false) {
    const newTotal = parseFloat(document.getElementById(type + 'Slider').value);

    // Update display value
    document.getElementById(type + 'Value').textContent = formatCurrency(newTotal);

    // Only redistribute segments if user manually changed the slider
    if (!userTriggered) {
        updateScoring();
        return;
    }

    if (type === 'neugeschaeft') {
        // Get current segment values
        const schaden = parseFloat(document.getElementById('neuSchadenSlider').value) || 0;
        const kranken = parseFloat(document.getElementById('neuKrankenSlider').value) || 0;
        const leben = parseFloat(document.getElementById('neuLebenSlider').value) || 0;
        const currentTotal = schaden + kranken + leben;

        if (currentTotal > 0) {
            // Calculate proportions
            const schadenRatio = schaden / currentTotal;
            const krankenRatio = kranken / currentTotal;
            const lebenRatio = leben / currentTotal;

            // Apply new total proportionally
            document.getElementById('neuSchadenSlider').value = Math.round(newTotal * schadenRatio);
            document.getElementById('neuKrankenSlider').value = Math.round(newTotal * krankenRatio);
            document.getElementById('neuLebenSlider').value = Math.round(newTotal * lebenRatio);

            // Update segment display values
            document.getElementById('neuSchadenValue').textContent = formatCurrency(document.getElementById('neuSchadenSlider').value);
            document.getElementById('neuKrankenValue').textContent = formatCurrency(document.getElementById('neuKrankenSlider').value);
            document.getElementById('neuLebenValue').textContent = formatCurrency(document.getElementById('neuLebenSlider').value);

            // Update products proportionally
            updateProductsProportionally('neuSchaden', document.getElementById('neuSchadenSlider').value);
            updateProductsProportionally('neuKranken', document.getElementById('neuKrankenSlider').value);
            updateProductsProportionally('neuLeben', document.getElementById('neuLebenSlider').value);
        } else {
            // Default distribution if no current values
            document.getElementById('neuSchadenSlider').value = Math.round(newTotal * 0.4);
            document.getElementById('neuKrankenSlider').value = Math.round(newTotal * 0.3);
            document.getElementById('neuLebenSlider').value = Math.round(newTotal * 0.3);
        }
    } else if (type === 'bestand') {
        // Get current segment values
        const schaden = parseFloat(document.getElementById('bestandSchadenSlider').value) || 0;
        const kranken = parseFloat(document.getElementById('bestandKrankenSlider').value) || 0;
        const leben = parseFloat(document.getElementById('bestandLebenSlider').value) || 0;
        const currentTotal = schaden + kranken + leben;

        if (currentTotal > 0) {
            // Calculate proportions
            const schadenRatio = schaden / currentTotal;
            const krankenRatio = kranken / currentTotal;
            const lebenRatio = leben / currentTotal;

            // Apply new total proportionally
            document.getElementById('bestandSchadenSlider').value = Math.round(newTotal * schadenRatio);
            document.getElementById('bestandKrankenSlider').value = Math.round(newTotal * krankenRatio);
            document.getElementById('bestandLebenSlider').value = Math.round(newTotal * lebenRatio);

            // Update segment display values
            document.getElementById('bestandSchadenValue').textContent = formatCurrency(document.getElementById('bestandSchadenSlider').value);
            document.getElementById('bestandKrankenValue').textContent = formatCurrency(document.getElementById('bestandKrankenSlider').value);
            document.getElementById('bestandLebenValue').textContent = formatCurrency(document.getElementById('bestandLebenSlider').value);

            // Update products proportionally
            updateProductsProportionally('bestandSchaden', document.getElementById('bestandSchadenSlider').value);
            updateProductsProportionally('bestandKranken', document.getElementById('bestandKrankenSlider').value);
            updateProductsProportionally('bestandLeben', document.getElementById('bestandLebenSlider').value);
        } else {
            // Default distribution if no current values
            document.getElementById('bestandSchadenSlider').value = Math.round(newTotal * 0.4);
            document.getElementById('bestandKrankenSlider').value = Math.round(newTotal * 0.3);
            document.getElementById('bestandLebenSlider').value = Math.round(newTotal * 0.3);
        }
    }

    // Update scoring
    updateScoring();
}

/**
 * Toggle expandable content section
 * @param {string} section - Section ID to toggle
 */
export function toggleExpand(section) {
    const content = document.getElementById(section + 'Content');
    const arrow = event.target;

    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        arrow.classList.remove('expanded');
    } else {
        content.classList.add('expanded');
        arrow.classList.add('expanded');
    }
}

/**
 * Toggle segment expansion
 * @param {string} segmentId - Segment ID to toggle
 */
export function toggleSegment(segmentId) {
    const content = document.getElementById(segmentId + 'Content');
    const header = event.currentTarget;
    const arrow = header.querySelector('.expand-arrow');

    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        arrow.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('expanded');
        arrow.style.transform = 'rotate(90deg)';
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format currency with proper negative handling
 * @param {number} value - Value to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
    const absValue = Math.abs(value);
    let formatted = '';

    if (absValue >= 1000000000) {
        formatted = '€' + (absValue / 1000000000).toFixed(1) + 'B';
    } else if (absValue >= 1000000) {
        formatted = '€' + (absValue / 1000000).toFixed(0) + 'M';
    } else if (absValue >= 1000) {
        formatted = '€' + (absValue / 1000).toFixed(0) + 'k';
    } else {
        formatted = '€' + absValue.toFixed(0);
    }

    return value < 0 ? '-' + formatted : formatted;
}

/**
 * Update segment values (combines individual products into segment total)
 * @param {string} type - Type of segment (neugeschaeft or bestand)
 * @param {boolean} fromProductUpdate - Whether called from product update
 */
export function updateSegmentValues(type, fromProductUpdate = false) {
    if (type === 'neugeschaeft') {
        const schaden = parseFloat(document.getElementById('neuSchadenSlider').value);
        const kranken = parseFloat(document.getElementById('neuKrankenSlider').value);
        const leben = parseFloat(document.getElementById('neuLebenSlider').value);
        const total = schaden + kranken + leben;

        document.getElementById('neuSchadenValue').textContent = formatCurrency(schaden);
        document.getElementById('neuKrankenValue').textContent = formatCurrency(kranken);
        document.getElementById('neuLebenValue').textContent = formatCurrency(leben);
        document.getElementById('neugeschaeftSlider').value = total;
        document.getElementById('neugeschaeftValue').textContent = formatCurrency(total);

        // Update products proportionally if segment was changed directly
        if (!fromProductUpdate) {
            updateProductsProportionally('neuSchaden', schaden);
            updateProductsProportionally('neuKranken', kranken);
            updateProductsProportionally('neuLeben', leben);
        }
    } else if (type === 'bestand') {
        const schaden = parseFloat(document.getElementById('bestandSchadenSlider').value);
        const kranken = parseFloat(document.getElementById('bestandKrankenSlider').value);
        const leben = parseFloat(document.getElementById('bestandLebenSlider').value);
        const total = schaden + kranken + leben;

        document.getElementById('bestandSchadenValue').textContent = formatCurrency(schaden);
        document.getElementById('bestandKrankenValue').textContent = formatCurrency(kranken);
        document.getElementById('bestandLebenValue').textContent = formatCurrency(leben);
        document.getElementById('bestandSlider').value = total;
        document.getElementById('bestandValue').textContent = formatCurrency(total);

        // Update products proportionally if segment was changed directly
        if (!fromProductUpdate) {
            updateProductsProportionally('bestandSchaden', schaden);
            updateProductsProportionally('bestandKranken', kranken);
            updateProductsProportionally('bestandLeben', leben);
        }
    }

    updateScoring();
}

/**
 * Update products proportionally when segment value changes
 * @param {string} segment - Segment name
 * @param {number} newTotal - New total value for segment
 */
function updateProductsProportionally(segment, newTotal) {
    let products = [];

    // Define products for each segment
    if (segment === 'neuSchaden') {
        products = [
            { slider: 'neuHaftpflichtSlider', value: 'neuHaftpflichtValue', ratio: 0.3 },
            { slider: 'neuUnfallSlider', value: 'neuUnfallValue', ratio: 0.2 },
            { slider: 'neuHausratSlider', value: 'neuHausratValue', ratio: 0.15 },
            { slider: 'neuRechtsschutzSlider', value: 'neuRechtsschutzValue', ratio: 0.15 },
            { slider: 'neuKfzSlider', value: 'neuKfzValue', ratio: 0.2 }
        ];
    } else if (segment === 'neuKranken') {
        products = [
            { slider: 'neuVollSlider', value: 'neuVollValue', ratio: 0.533 },
            { slider: 'neuZusatzSlider', value: 'neuZusatzValue', ratio: 0.333 },
            { slider: 'neuPflegeSlider', value: 'neuPflegeValue', ratio: 0.134 }
        ];
    } else if (segment === 'neuLeben') {
        products = [
            { slider: 'neuRisikoSlider', value: 'neuRisikoValue', ratio: 0.267 },
            { slider: 'neuBuSlider', value: 'neuBuValue', ratio: 0.4 },
            { slider: 'neuRenteSlider', value: 'neuRenteValue', ratio: 0.333 }
        ];
    } else if (segment === 'bestandSchaden') {
        products = [
            { slider: 'bestandHaftpflichtSlider', value: 'bestandHaftpflichtValue', ratio: 0.3 },
            { slider: 'bestandUnfallSlider', value: 'bestandUnfallValue', ratio: 0.2 },
            { slider: 'bestandHausratSlider', value: 'bestandHausratValue', ratio: 0.15 },
            { slider: 'bestandRechtsschutzSlider', value: 'bestandRechtsschutzValue', ratio: 0.15 },
            { slider: 'bestandKfzSlider', value: 'bestandKfzValue', ratio: 0.2 }
        ];
    } else if (segment === 'bestandKranken') {
        products = [
            { slider: 'bestandVollSlider', value: 'bestandVollValue', ratio: 0.533 },
            { slider: 'bestandZusatzSlider', value: 'bestandZusatzValue', ratio: 0.333 },
            { slider: 'bestandPflegeSlider', value: 'bestandPflegeValue', ratio: 0.134 }
        ];
    } else if (segment === 'bestandLeben') {
        products = [
            { slider: 'bestandRisikoSlider', value: 'bestandRisikoValue', ratio: 0.267 },
            { slider: 'bestandBuSlider', value: 'bestandBuValue', ratio: 0.4 },
            { slider: 'bestandRenteSlider', value: 'bestandRenteValue', ratio: 0.333 }
        ];
    }

    // Update each product proportionally
    products.forEach(product => {
        const newValue = Math.round(newTotal * product.ratio);
        const sliderEl = document.getElementById(product.slider);
        const valueEl = document.getElementById(product.value);
        if (sliderEl && valueEl) {
            sliderEl.value = newValue;
            valueEl.textContent = formatCurrency(newValue);
        }
    });
}

/**
 * Update product values and recalculate segment total
 * @param {string} segment - Segment name
 */
export function updateProductValues(segment) {
    let total = 0;
    let segmentSlider = '';
    let type = '';

    // Determine which segment and type we're working with
    if (segment === 'neuSchaden') {
        total += parseFloat(document.getElementById('neuHaftpflichtSlider')?.value || 0);
        total += parseFloat(document.getElementById('neuUnfallSlider')?.value || 0);
        total += parseFloat(document.getElementById('neuHausratSlider')?.value || 0);
        total += parseFloat(document.getElementById('neuRechtsschutzSlider')?.value || 0);
        total += parseFloat(document.getElementById('neuKfzSlider')?.value || 0);
        segmentSlider = 'neuSchadenSlider';
        type = 'neugeschaeft';

        // Update display values
        document.getElementById('neuHaftpflichtValue').textContent = formatCurrency(document.getElementById('neuHaftpflichtSlider').value);
        document.getElementById('neuUnfallValue').textContent = formatCurrency(document.getElementById('neuUnfallSlider').value);
        document.getElementById('neuHausratValue').textContent = formatCurrency(document.getElementById('neuHausratSlider').value);
        document.getElementById('neuRechtsschutzValue').textContent = formatCurrency(document.getElementById('neuRechtsschutzSlider').value);
        document.getElementById('neuKfzValue').textContent = formatCurrency(document.getElementById('neuKfzSlider').value);
    } else if (segment === 'neuKranken') {
        total += parseFloat(document.getElementById('neuVollSlider')?.value || 0);
        total += parseFloat(document.getElementById('neuZusatzSlider')?.value || 0);
        total += parseFloat(document.getElementById('neuPflegeSlider')?.value || 0);
        segmentSlider = 'neuKrankenSlider';
        type = 'neugeschaeft';

        document.getElementById('neuVollValue').textContent = formatCurrency(document.getElementById('neuVollSlider').value);
        document.getElementById('neuZusatzValue').textContent = formatCurrency(document.getElementById('neuZusatzSlider').value);
        document.getElementById('neuPflegeValue').textContent = formatCurrency(document.getElementById('neuPflegeSlider').value);
    } else if (segment === 'neuLeben') {
        total += parseFloat(document.getElementById('neuRisikoSlider')?.value || 0);
        total += parseFloat(document.getElementById('neuBuSlider')?.value || 0);
        total += parseFloat(document.getElementById('neuRenteSlider')?.value || 0);
        segmentSlider = 'neuLebenSlider';
        type = 'neugeschaeft';

        document.getElementById('neuRisikoValue').textContent = formatCurrency(document.getElementById('neuRisikoSlider').value);
        document.getElementById('neuBuValue').textContent = formatCurrency(document.getElementById('neuBuSlider').value);
        document.getElementById('neuRenteValue').textContent = formatCurrency(document.getElementById('neuRenteSlider').value);
    } else if (segment === 'bestandSchaden') {
        total += parseFloat(document.getElementById('bestandHaftpflichtSlider')?.value || 0);
        total += parseFloat(document.getElementById('bestandUnfallSlider')?.value || 0);
        total += parseFloat(document.getElementById('bestandHausratSlider')?.value || 0);
        total += parseFloat(document.getElementById('bestandRechtsschutzSlider')?.value || 0);
        total += parseFloat(document.getElementById('bestandKfzSlider')?.value || 0);
        segmentSlider = 'bestandSchadenSlider';
        type = 'bestand';

        document.getElementById('bestandHaftpflichtValue').textContent = formatCurrency(document.getElementById('bestandHaftpflichtSlider').value);
        document.getElementById('bestandUnfallValue').textContent = formatCurrency(document.getElementById('bestandUnfallSlider').value);
        document.getElementById('bestandHausratValue').textContent = formatCurrency(document.getElementById('bestandHausratSlider').value);
        document.getElementById('bestandRechtsschutzValue').textContent = formatCurrency(document.getElementById('bestandRechtsschutzSlider').value);
        document.getElementById('bestandKfzValue').textContent = formatCurrency(document.getElementById('bestandKfzSlider').value);
    } else if (segment === 'bestandKranken') {
        total += parseFloat(document.getElementById('bestandVollSlider')?.value || 0);
        total += parseFloat(document.getElementById('bestandZusatzSlider')?.value || 0);
        total += parseFloat(document.getElementById('bestandPflegeSlider')?.value || 0);
        segmentSlider = 'bestandKrankenSlider';
        type = 'bestand';

        document.getElementById('bestandVollValue').textContent = formatCurrency(document.getElementById('bestandVollSlider').value);
        document.getElementById('bestandZusatzValue').textContent = formatCurrency(document.getElementById('bestandZusatzSlider').value);
        document.getElementById('bestandPflegeValue').textContent = formatCurrency(document.getElementById('bestandPflegeSlider').value);
    } else if (segment === 'bestandLeben') {
        total += parseFloat(document.getElementById('bestandRisikoSlider')?.value || 0);
        total += parseFloat(document.getElementById('bestandBuSlider')?.value || 0);
        total += parseFloat(document.getElementById('bestandRenteSlider')?.value || 0);
        segmentSlider = 'bestandLebenSlider';
        type = 'bestand';

        document.getElementById('bestandRisikoValue').textContent = formatCurrency(document.getElementById('bestandRisikoSlider').value);
        document.getElementById('bestandBuValue').textContent = formatCurrency(document.getElementById('bestandBuSlider').value);
        document.getElementById('bestandRenteValue').textContent = formatCurrency(document.getElementById('bestandRenteSlider').value);
    }

    // Update segment slider with new total
    if (segmentSlider && document.getElementById(segmentSlider)) {
        document.getElementById(segmentSlider).value = total;
        // Update segment values with flag to prevent circular updates
        updateSegmentValues(type, true);
    }
}

// ============================================================================
// Scoring Calculations
// ============================================================================

/**
 * Calculate performance score (20 points max)
 * @returns {number} Performance score
 */
function calculatePerformanceScore() {
    const neugeschaeft = parseFloat(document.getElementById('neugeschaeftSlider').value);
    const bestand = parseFloat(document.getElementById('bestandSlider').value);
    const marge = parseFloat(document.getElementById('margenSlider').value);
    const crossSelling = parseFloat(document.getElementById('crossSellingSlider').value);

    // Normalize values (0-100)
    const neuScore = Math.min(100, (neugeschaeft / 1000000) * 50);
    const bestandScore = Math.min(100, (bestand / 5000000) * 50);
    const margeScore = marge;
    const crossScore = Math.min(100, (crossSelling - 1) * 25);

    return ((neuScore + bestandScore + margeScore + crossScore) / 4) * 0.2;
}

/**
 * Calculate risk score with type-specific adjustments (40 points max)
 * @returns {number} Risk score
 */
function calculateRiskScore() {
    const schadenquote = parseFloat(document.getElementById('schadenquoteSlider').value);
    const grossschaden = parseFloat(document.getElementById('grossschadenSlider').value);
    const underwriting = parseFloat(document.getElementById('underwritingSlider').value);
    const vermittlerTyp = document.getElementById('vermittlerTypSelect').value;

    // Get type-specific optimal range
    const typeRange = vermittlerTypRanges[vermittlerTyp];

    // Adjust scoring based on vermittler type
    let schadenScore;
    if (schadenquote <= typeRange.min) {
        schadenScore = 100; // Perfect score if at or below minimum
    } else if (schadenquote <= typeRange.optimal) {
        // Linear interpolation between min and optimal
        schadenScore = 100 - ((schadenquote - typeRange.min) / (typeRange.optimal - typeRange.min)) * 10;
    } else if (schadenquote <= typeRange.max) {
        // Linear interpolation between optimal and max
        schadenScore = 90 - ((schadenquote - typeRange.optimal) / (typeRange.max - typeRange.optimal)) * 40;
    } else {
        // Above max is bad
        schadenScore = Math.max(0, 50 - ((schadenquote - typeRange.max) * 2));
    }

    const grossScore = Math.max(0, 100 - (grossschaden * 10));
    const underScore = underwriting;

    return ((schadenScore + grossScore + underScore) / 3) * 0.4;
}

/**
 * Calculate stability score (15 points max)
 * @returns {number} Stability score
 */
function calculateStabilityScore() {
    const storno = parseFloat(document.getElementById('stornoSlider').value);
    const dauer = parseFloat(document.getElementById('dauerSlider').value);
    const ausschoepfung = parseFloat(document.getElementById('ausschoepfungSlider').value);

    // Lower is better for Storno
    const stornoScore = Math.max(0, 100 - (storno * 2.5));
    const dauerScore = Math.min(100, dauer * 5);
    const ausScore = ausschoepfung;

    return ((stornoScore + dauerScore + ausScore) / 3) * 0.15;
}

/**
 * Calculate customer satisfaction score (10 points max)
 * @returns {number} Customer score
 */
function calculateCustomerScore() {
    const nps = parseFloat(document.getElementById('npsSlider').value);
    const beratung = parseFloat(document.getElementById('beratungSlider').value);
    const beschwerden = parseFloat(document.getElementById('beschwerdenSlider').value);

    // Normalize NPS (-100 to +100) to 0-100
    const npsScore = (nps + 100) / 2;
    const beratungScore = beratung;
    // Lower is better for Beschwerden
    const beschwerdenScore = Math.max(0, 100 - (beschwerden * 5));

    return ((npsScore + beratungScore + beschwerdenScore) / 3) * 0.1;
}

/**
 * Calculate profit score (15 points max)
 * @returns {number} Profit score
 */
function calculateProfitScore() {
    const deckungsbeitrag = parseFloat(document.getElementById('deckungsbeitragSlider').value);
    const kostenertrag = parseFloat(document.getElementById('kostenertragSlider').value);

    const dbScore = Math.min(100, (deckungsbeitrag / 200000) * 100);
    // Lower is better for Kosten-Ertrag
    const keScore = Math.max(0, 100 - (kostenertrag - 50));

    return ((dbScore + keScore) / 2) * 0.15;
}

/**
 * Update traffic light with 3 lights based on score
 * @param {number} score - Total broker score
 * @param {number} combinedRatio - Combined ratio (not used in current logic)
 */
function updateTrafficLight(score, combinedRatio) {
    // Reset all lights
    document.getElementById('redLight').classList.remove('active');
    document.getElementById('yellowLight').classList.remove('active');
    document.getElementById('greenLight').classList.remove('active');

    // Use Score for traffic light, not Combined Ratio
    if (score >= 80) {
        // A-Vermittler: Green
        document.getElementById('greenLight').classList.add('active');
    } else if (score >= 60) {
        // B-Vermittler: Yellow
        document.getElementById('yellowLight').classList.add('active');
    } else {
        // C/D-Vermittler: Red
        document.getElementById('redLight').classList.add('active');
    }
}

/**
 * Main update function - recalculates and updates all scoring displays
 */
export function updateScoring() {
    // Update display values
    document.getElementById('neugeschaeftValue').textContent = formatCurrency(document.getElementById('neugeschaeftSlider').value);
    document.getElementById('bestandValue').textContent = formatCurrency(document.getElementById('bestandSlider').value);
    document.getElementById('margenValue').textContent = document.getElementById('margenSlider').value + '%';
    document.getElementById('crossSellingValue').textContent = document.getElementById('crossSellingSlider').value;
    document.getElementById('schadenquoteValue').textContent = document.getElementById('schadenquoteSlider').value + '%';
    document.getElementById('grossschadenValue').textContent = document.getElementById('grossschadenSlider').value + '%';
    document.getElementById('underwritingValue').textContent = document.getElementById('underwritingSlider').value + '%';
    document.getElementById('stornoValue').textContent = document.getElementById('stornoSlider').value + '%';
    document.getElementById('dauerValue').textContent = document.getElementById('dauerSlider').value + ' Jahre';
    document.getElementById('ausschoepfungValue').textContent = document.getElementById('ausschoepfungSlider').value + '%';
    document.getElementById('npsValue').textContent = document.getElementById('npsSlider').value;
    document.getElementById('beratungValue').textContent = document.getElementById('beratungSlider').value + '%';
    document.getElementById('beschwerdenValue').textContent = document.getElementById('beschwerdenSlider').value + '%';
    document.getElementById('deckungsbeitragValue').textContent = formatCurrency(document.getElementById('deckungsbeitragSlider').value);
    document.getElementById('kostenertragValue').textContent = document.getElementById('kostenertragSlider').value + '%';

    // Calculate scores
    const performanceScore = calculatePerformanceScore();
    const riskScore = calculateRiskScore();
    const stabilityScore = calculateStabilityScore();
    const customerScore = calculateCustomerScore();
    const profitScore = calculateProfitScore();

    const totalScore = performanceScore + riskScore + stabilityScore + customerScore + profitScore;

    // Update score displays
    document.getElementById('performanceScore').textContent = performanceScore.toFixed(1) + '/20';
    document.getElementById('riskScore').textContent = riskScore.toFixed(1) + '/40';
    document.getElementById('stabilityScore').textContent = stabilityScore.toFixed(1) + '/15';
    document.getElementById('customerScore').textContent = customerScore.toFixed(1) + '/10';
    document.getElementById('profitScore').textContent = profitScore.toFixed(1) + '/15';
    document.getElementById('totalScore').textContent = Math.round(totalScore);

    // Get Combined Ratio for traffic light
    const combinedRatio = parseFloat(document.getElementById('schadenquoteSlider').value);

    // Update traffic light
    updateTrafficLight(totalScore, combinedRatio);

    // Update category
    const categoryEl = document.getElementById('scoreCategory');
    categoryEl.classList.remove('a-level', 'b-level', 'c-level', 'd-level');

    if (totalScore >= 80) {
        categoryEl.textContent = 'A-Vermittler';
        categoryEl.classList.add('a-level');
        document.getElementById('totalScore').style.color = '#059669';
    } else if (totalScore >= 60) {
        categoryEl.textContent = 'B-Vermittler';
        categoryEl.classList.add('b-level');
        document.getElementById('totalScore').style.color = '#d97706';
    } else if (totalScore >= 40) {
        categoryEl.textContent = 'C-Vermittler';
        categoryEl.classList.add('c-level');
        document.getElementById('totalScore').style.color = '#ea580c';
    } else {
        categoryEl.textContent = 'D-Vermittler';
        categoryEl.classList.add('d-level');
        document.getElementById('totalScore').style.color = '#dc2626';
    }
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the module on DOM load
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set initial segment values that match the product sums
    document.getElementById('neuSchadenSlider').value = 200000;
    document.getElementById('neuKrankenSlider').value = 150000;
    document.getElementById('neuLebenSlider').value = 150000;
    document.getElementById('bestandSchadenSlider').value = 1000000;
    document.getElementById('bestandKrankenSlider').value = 750000;
    document.getElementById('bestandLebenSlider').value = 750000;

    // Set default vermittler type
    document.getElementById('vermittlerTypSelect').value = 'grossmakler';
    document.getElementById('vermittlerTypDisplay').textContent = 'Großmakler';

    updateScoring();
});

// ============================================================================
// Window Exports (for backwards compatibility with inline HTML event handlers)
// ============================================================================

window.selectSilo = selectSilo;
window.toggleMeasures = toggleMeasures;
window.updateMeasures = updateMeasures;
window.switchTab = switchTab;
window.updateMainSlider = updateMainSlider;
window.toggleExpand = toggleExpand;
window.toggleSegment = toggleSegment;
window.loadVermittlerProfile = loadVermittlerProfile;
window.updateSegmentValues = updateSegmentValues;
window.updateProductValues = updateProductValues;
window.updateScoring = updateScoring;
