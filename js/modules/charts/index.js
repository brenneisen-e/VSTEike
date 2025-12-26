/**
 * Charts Module - ES6 Entry Point (ES2024)
 * Chart creation and management for KPI Dashboard
 */

// ========================================
// STATE
// ========================================

let currentFullscreenKpiId = null;

// ========================================
// DAILY DATA GENERATION
// ========================================

export const generateDailyData = (monthlyData, kpiId, timeRange = 'year', offset = 0) => {
    const dailyData = [];
    const state = window.state ?? {};

    state.timeNavigation ??= {};
    state.timeNavigation[kpiId] ??= { monthOffset: 0, weekOffset: 0 };

    if (timeRange === 'month') {
        const targetMonth = Math.max(0, Math.min(monthlyData.length - 1, monthlyData.length - 1 + offset));
        state.timeNavigation[kpiId].monthOffset = offset;

        const month = monthlyData[targetMonth];
        if (!month) return dailyData;

        const daysInMonth = new Date(2025, month.month, 0).getDate();
        const baseValue = month[kpiId] ?? 0;

        for (let day = 1; day <= daysInMonth; day++) {
            dailyData.push({
                date: new Date(2025, month.month - 1, day),
                value: baseValue / daysInMonth * (0.8 + Math.random() * 0.4)
            });
        }

        state.timeNavigation[kpiId].currentPeriod = window.getMonthName?.(month.month) + ' 2025';
        state.timeNavigation[kpiId].canGoNext = targetMonth < monthlyData.length - 1;
        state.timeNavigation[kpiId].canGoPrev = targetMonth > 0;

    } else if (timeRange === 'week') {
        state.timeNavigation[kpiId].weekOffset = offset;
        const totalWeeks = Math.floor(monthlyData.length * 4.3);
        const currentWeek = totalWeeks + offset;

        for (let i = 0; i < 7; i++) {
            const month = monthlyData[Math.floor(monthlyData.length / 2)] ?? monthlyData[0];
            const baseValue = month?.[kpiId] ?? 0;
            dailyData.push({
                date: new Date(2025, month?.month - 1 ?? 0, i + 1),
                value: baseValue / 30 * (0.8 + Math.random() * 0.4)
            });
        }

        state.timeNavigation[kpiId].currentPeriod = `KW ${currentWeek}`;
        state.timeNavigation[kpiId].canGoNext = currentWeek < totalWeeks;
        state.timeNavigation[kpiId].canGoPrev = currentWeek > 1;

    } else {
        for (let monthIdx = 0; monthIdx < monthlyData.length; monthIdx++) {
            const month = monthlyData[monthIdx];
            const daysInMonth = new Date(2025, month.month, 0).getDate();

            if (kpiId === 'bestand') {
                let currentBestand = monthIdx === 0 ? month.bestand * 0.98 : monthlyData[monthIdx - 1].bestand;
                const monthlyGrowth = monthIdx > 0 ? month.bestand - monthlyData[monthIdx - 1].bestand : month.bestand * 0.02;
                const dailyGrowth = monthlyGrowth / daysInMonth;

                for (let day = 1; day <= daysInMonth; day++) {
                    currentBestand += dailyGrowth * (0.8 + Math.random() * 0.4);
                    dailyData.push({ date: new Date(2025, month.month - 1, day), value: currentBestand });
                }
            } else {
                const baseValue = month[kpiId] ?? 0;
                for (let day = 1; day <= daysInMonth; day++) {
                    dailyData.push({
                        date: new Date(2025, month.month - 1, day),
                        value: baseValue / daysInMonth * (0.8 + Math.random() * 0.4)
                    });
                }
            }
        }

        state.timeNavigation[kpiId].currentPeriod = '2025 Gesamt';
        state.timeNavigation[kpiId].canGoNext = false;
        state.timeNavigation[kpiId].canGoPrev = false;
    }

    return dailyData;
};

// ========================================
// CHART CREATION
// ========================================

export const createChart = (kpiId, data, view, kpi, timeRange = 'year', offset = 0) => {
    const canvas = document.getElementById(`chart-${kpiId}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const state = window.state ?? { charts: {} };
    state.charts ??= {};

    let chartData;
    let chartType = 'line';
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

    if (view === 'month') {
        chartData = {
            labels: data.map(d => months[d.month - 1]),
            datasets: [{
                label: kpi.title,
                data: data.map(d => d[kpiId]),
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2, fill: true, tension: 0.3, pointRadius: 4, pointHoverRadius: 6
            }]
        };
    } else if (view === 'daily') {
        const dailyData = generateDailyData(data, kpiId, timeRange, offset);
        const labels = timeRange === 'week'
            ? dailyData.map(d => d.date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' }))
            : timeRange === 'month' ? dailyData.map(d => d.date.getDate() + '.') : dailyData.map(d => d.date.toLocaleDateString('de-DE'));

        chartData = {
            labels,
            datasets: [{
                label: kpi.title,
                data: dailyData.map(d => d.value),
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                borderColor: 'rgba(168, 85, 247, 1)',
                borderWidth: timeRange === 'week' ? 2 : 1, fill: true, tension: 0.1
            }]
        };
    } else {
        chartType = 'bar';
        const currentValue = data.length > 0 ? data[data.length - 1][kpiId] : 0;
        const distribution = window.generateAgentDistribution?.(kpiId, currentValue) ?? [];

        chartData = {
            labels: distribution.map(d => d.range),
            datasets: [{
                label: 'Anzahl Vermittler',
                data: distribution.map(d => d.count),
                backgroundColor: 'rgba(236, 72, 153, 0.8)',
                borderColor: 'rgba(236, 72, 153, 1)', borderWidth: 0
            }]
        };
    }

    state.charts[kpiId]?.destroy();

    state.charts[kpiId] = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
            responsive: true, maintainAspectRatio: false,
            layout: { padding: { top: 5, right: 8, bottom: 5, left: 8 } },
            plugins: { legend: { display: false }, tooltip: {
                callbacks: { label: (context) => view === 'distribution' ? `Anzahl Vermittler: ${context.parsed.y}` : `${kpi.title}: ${window.formatValue?.(context.parsed.y, kpi.unit) ?? context.parsed.y}` }
            }},
            scales: {
                x: { grid: { display: true, color: 'rgba(0, 0, 0, 0.05)', drawBorder: false }, ticks: { font: { size: 11 }, color: '#64748b', maxRotation: 0, autoSkip: true, maxTicksLimit: 8, padding: 8 }, offset: true },
                y: { beginAtZero: view === 'distribution' || kpi.id === 'ergebnis', grid: { display: true, color: 'rgba(0, 0, 0, 0.05)', drawBorder: false }, ticks: { font: { size: 11 }, color: '#64748b', maxTicksLimit: 6, padding: 8, align: 'end', callback: (value) => view === 'distribution' ? Math.round(value) : window.formatValue?.(value, kpi.unit) ?? value }, afterFit: (scaleInstance) => { scaleInstance.width = 65; } }
            }
        }
    });
};

// ========================================
// NAVIGATION
// ========================================

export const navigateTime = (kpiId, direction) => {
    const kpi = window.kpiDefinitions?.find(k => k.id === kpiId);
    const activeRange = document.querySelector(`#timeRange-${kpiId} button[data-range].active`);
    const timeRange = activeRange?.dataset?.range ?? 'year';

    const state = window.state ?? { timeNavigation: {} };
    state.timeNavigation ??= {};
    state.timeNavigation[kpiId] ??= {};

    let offset = timeRange === 'month'
        ? (state.timeNavigation[kpiId].monthOffset ?? 0) + direction
        : (state.timeNavigation[kpiId].weekOffset ?? 0) + direction;

    const data = window.getFilteredData?.() ?? [];
    createChart(kpiId, data, 'daily', kpi, timeRange, offset);
    updateNavigationButtons(kpiId);
};

const updateNavigationButtons = (kpiId) => {
    const navState = window.state?.timeNavigation?.[kpiId];
    if (!navState) return;

    const card = document.getElementById(`kpi-${kpiId}`);
    const prevBtn = card?.querySelector('.prev-btn');
    const nextBtn = card?.querySelector('.next-btn');
    const periodLabel = card?.querySelector('.current-period');

    if (prevBtn) prevBtn.disabled = !navState.canGoPrev;
    if (nextBtn) nextBtn.disabled = !navState.canGoNext;
    if (periodLabel) periodLabel.textContent = navState.currentPeriod ?? '';
};

// ========================================
// FULLSCREEN
// ========================================

export const openFullscreen = (kpiId) => {
    const kpi = window.kpiDefinitions?.find(k => k.id === kpiId);
    if (!kpi) return;

    currentFullscreenKpiId = kpiId;
    const modal = document.getElementById('fullscreenModal');
    const title = document.getElementById('fullscreenTitle');
    const viewToggle = document.getElementById('fullscreenViewToggle');

    const card = document.getElementById(`kpi-${kpiId}`);
    const activeView = card?.querySelector('.view-toggle button.active')?.dataset?.view ?? 'month';

    if (title) title.textContent = kpi.title;
    modal?.classList.add('show');

    viewToggle?.querySelectorAll('button').forEach(btn => btn.classList.toggle('active', btn.dataset.view === activeView));

    setTimeout(() => renderFullscreenChart(kpiId, activeView), 100);
};

const renderFullscreenChart = (kpiId, viewType) => {
    const kpi = window.kpiDefinitions?.find(k => k.id === kpiId);
    if (!kpi) return;

    const canvas = document.getElementById('fullscreenChart');
    const ctx = canvas?.getContext('2d');
    const data = window.getFilteredData?.() ?? [];
    const state = window.state ?? {};

    state.fullscreenChart?.destroy();

    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    let chartConfig;

    if (viewType === 'month') {
        chartConfig = { type: 'line', data: { labels: data.map(d => months[d.month - 1]), datasets: [{ label: kpi.title, data: data.map(d => d[kpiId]), backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 1)', borderWidth: 3, fill: true, tension: 0.3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } } };
    } else if (viewType === 'distribution') {
        chartConfig = { type: 'bar', data: { labels: data.map(d => months[d.month - 1]), datasets: [{ label: kpi.title, data: data.map(d => d[kpiId]), backgroundColor: 'rgba(59, 130, 246, 0.7)', borderColor: 'rgba(59, 130, 246, 1)', borderWidth: 1, borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } } };
    } else {
        const dailyData = [], dailyLabels = [];
        for (let i = 1; i <= 30; i++) {
            dailyLabels.push(`${i}.`);
            dailyData.push((data.length > 0 ? data[data.length - 1][kpiId] / 30 : 0) * (0.7 + Math.random() * 0.6));
        }
        chartConfig = { type: 'line', data: { labels: dailyLabels, datasets: [{ label: `${kpi.title} (Tagesverlauf)`, data: dailyData, backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 1)', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } } };
    }

    state.fullscreenChart = new Chart(ctx, chartConfig);
};

export const closeFullscreen = () => {
    document.getElementById('fullscreenModal')?.classList.remove('show');
    currentFullscreenKpiId = null;
    window.state?.fullscreenChart?.destroy();
    if (window.state) window.state.fullscreenChart = null;
};

export const switchToDaily = (kpiId) => {
    const dailyButton = Array.from(document.querySelectorAll(`[data-kpi="${kpiId}"]`)).find(btn => btn.dataset.view === 'daily');
    dailyButton?.click();
};

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fullscreenViewToggle')?.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button || !currentFullscreenKpiId) return;

        document.getElementById('fullscreenViewToggle')?.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        renderFullscreenChart(currentFullscreenKpiId, button.dataset.view);
    });
});

// ========================================
// WINDOW EXPORTS
// ========================================

Object.assign(window, {
    createChart,
    generateDailyData,
    navigateTime,
    openFullscreen,
    closeFullscreen,
    switchToDaily
});

