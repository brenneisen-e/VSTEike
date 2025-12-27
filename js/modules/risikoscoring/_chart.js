/**
 * Chart Functions for Risikoscoring Module
 * Drawing and interaction handling for distribution charts
 */

import { getElement } from './_helpers.js';
import { distributionData, modifiedDistributionData, currentSilo, measuresActive, selectedMeasures } from './_state.js';
import { calculateStats } from './_statistics.js';

/**
 * Draws the distribution chart on canvas
 */
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

/**
 * Sets up interactive tooltips for the chart
 */
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
