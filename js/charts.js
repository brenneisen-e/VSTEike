// js/charts.js - Chart Functions

// Generate daily data
function generateDailyData(monthlyData, kpiId, timeRange = 'year', offset = 0) {
    const dailyData = [];
    
    if (!state.timeNavigation[kpiId]) {
        state.timeNavigation[kpiId] = {
            monthOffset: 0,
            weekOffset: 0
        };
    }
    
    if (timeRange === 'month') {
        const targetMonth = Math.max(0, Math.min(monthlyData.length - 1, monthlyData.length - 1 + offset));
        state.timeNavigation[kpiId].monthOffset = offset;
        
        const month = monthlyData[targetMonth];
        if (!month) return dailyData;
        
        const daysInMonth = new Date(2025, month.month, 0).getDate();
        const baseValue = month[kpiId] || 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            dailyData.push({
                date: new Date(2025, month.month - 1, day),
                value: baseValue / daysInMonth * (0.8 + Math.random() * 0.4)
            });
        }
        
        state.timeNavigation[kpiId].currentPeriod = getMonthName(month.month) + ' ' + 2025;
        state.timeNavigation[kpiId].canGoNext = targetMonth < monthlyData.length - 1;
        state.timeNavigation[kpiId].canGoPrev = targetMonth > 0;
        
    } else if (timeRange === 'week') {
        state.timeNavigation[kpiId].weekOffset = offset;
        const totalWeeks = Math.floor(monthlyData.length * 4.3);
        const currentWeek = totalWeeks + offset;
        
        // Generate week data (simplified)
        for (let i = 0; i < 7; i++) {
            const month = monthlyData[Math.floor(monthlyData.length / 2)] || monthlyData[0];
            const baseValue = month[kpiId] || 0;
            dailyData.push({
                date: new Date(2025, month.month - 1, i + 1),
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
                const monthlyGrowth = monthIdx > 0 ? 
                    month.bestand - monthlyData[monthIdx - 1].bestand : 
                    month.bestand * 0.02;
                const dailyGrowth = monthlyGrowth / daysInMonth;
                
                for (let day = 1; day <= daysInMonth; day++) {
                    currentBestand += dailyGrowth * (0.8 + Math.random() * 0.4);
                    dailyData.push({
                        date: new Date(2025, month.month - 1, day),
                        value: currentBestand
                    });
                }
            } else {
                const baseValue = month[kpiId] || 0;
                
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
}

// Create chart
function createChart(kpiId, data, view, kpi, timeRange = 'year', offset = 0) {
    const canvas = document.getElementById(`chart-${kpiId}`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let chartData;
    let chartType = 'line';
    
    if (view === 'month') {
        const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
        chartData = {
            labels: data.map(d => months[d.month - 1]),
            datasets: [{
                label: kpi.title,
                data: data.map(d => d[kpiId]),
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        };
    } else if (view === 'daily') {
        const dailyData = generateDailyData(data, kpiId, timeRange, offset);
        
        let labels;
        if (timeRange === 'week') {
            labels = dailyData.map(d => d.date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' }));
        } else if (timeRange === 'month') {
            labels = dailyData.map(d => d.date.getDate() + '.');
        } else {
            labels = dailyData.map(d => d.date.toLocaleDateString('de-DE'));
        }
        
        chartData = {
            labels: labels,
            datasets: [{
                label: kpi.title,
                data: dailyData.map(d => d.value),
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                borderColor: 'rgba(168, 85, 247, 1)',
                borderWidth: timeRange === 'week' ? 2 : 1,
                fill: true,
                tension: 0.1
            }]
        };
    } else {
        chartType = 'bar';
        const currentValue = data.length > 0 ? data[data.length - 1][kpiId] : 0;
        const distribution = generateAgentDistribution(kpiId, currentValue);
        
        chartData = {
            labels: distribution.map(d => d.range),
            datasets: [{
                label: 'Anzahl Vermittler',
                data: distribution.map(d => d.count),
                backgroundColor: 'rgba(236, 72, 153, 0.8)',
                borderColor: 'rgba(236, 72, 153, 1)',
                borderWidth: 0
            }]
        };
    }

    if (state.charts[kpiId]) {
        state.charts[kpiId].destroy();
    }

    state.charts[kpiId] = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            // ✨ v18.2: Pixelgenaue Ausrichtung aller Charts
            layout: {
                padding: {
                    top: 5,
                    right: 8,
                    bottom: 5,
                    left: 8
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (view === 'distribution') {
                                return `Anzahl Vermittler: ${context.parsed.y}`;
                            }
                            return `${kpi.title}: ${formatValue(context.parsed.y, kpi.unit)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    // ✨ v18.2: Exakt standardisierte X-Achse
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false,
                        lineWidth: 1
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        color: '#64748b',
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 8,
                        padding: 8
                    },
                    offset: true
                },
                y: {
                    // ✨ v18.2: Fixierte Y-Achsen-Breite für perfekte Ausrichtung
                    beginAtZero: view === 'distribution' || kpi.id === 'ergebnis',
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false,
                        lineWidth: 1
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        color: '#64748b',
                        maxTicksLimit: 6,
                        padding: 8,
                        align: 'end',
                        callback: function(value) {
                            if (view === 'distribution') {
                                return Math.round(value);
                            }
                            return formatValue(value, kpi.unit);
                        }
                    },
                    // Fixe Breite für alle Y-Achsen = exakte Chart-Ausrichtung
                    afterFit: function(scaleInstance) {
                        scaleInstance.width = 65;
                    }
                }
            }
        }
    });
}

// Navigate time
function navigateTime(kpiId, direction) {
    const kpi = kpiDefinitions.find(k => k.id === kpiId);
    const activeRange = document.querySelector(`#timeRange-${kpiId} button[data-range].active`);
    const timeRange = activeRange ? activeRange.dataset.range : 'year';
    
    let offset = 0;
    if (timeRange === 'month') {
        offset = (state.timeNavigation[kpiId].monthOffset || 0) + direction;
    } else if (timeRange === 'week') {
        offset = (state.timeNavigation[kpiId].weekOffset || 0) + direction;
    }
    
    const data = getFilteredData();
    createChart(kpiId, data, 'daily', kpi, timeRange, offset);
    updateNavigationButtons(kpiId);
}

// Update navigation buttons
function updateNavigationButtons(kpiId) {
    const navState = state.timeNavigation[kpiId];
    if (!navState) return;
    
    const card = document.getElementById(`kpi-${kpiId}`);
    const prevBtn = card.querySelector('.prev-btn');
    const nextBtn = card.querySelector('.next-btn');
    const periodLabel = card.querySelector('.current-period');
    
    if (prevBtn) prevBtn.disabled = !navState.canGoPrev;
    if (nextBtn) nextBtn.disabled = !navState.canGoNext;
    if (periodLabel) periodLabel.textContent = navState.currentPeriod || '';
}

// Fullscreen functions
let currentFullscreenKpiId = null;

function openFullscreen(kpiId) {
    const kpi = kpiDefinitions.find(k => k.id === kpiId);
    if (!kpi) return;

    currentFullscreenKpiId = kpiId;

    const modal = document.getElementById('fullscreenModal');
    const title = document.getElementById('fullscreenTitle');
    const viewToggle = document.getElementById('fullscreenViewToggle');

    // Get current view from card
    const card = document.getElementById(`kpi-${kpiId}`);
    const activeViewBtn = card.querySelector('.view-toggle button.active');
    const activeView = activeViewBtn ? activeViewBtn.dataset.view : 'month';

    title.textContent = kpi.title;
    modal.classList.add('show');

    // Set active button in fullscreen toggle
    viewToggle.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === activeView);
    });

    setTimeout(() => {
        renderFullscreenChart(kpiId, activeView);
    }, 100);
}

function renderFullscreenChart(kpiId, viewType) {
    const kpi = kpiDefinitions.find(k => k.id === kpiId);
    if (!kpi) return;

    const canvas = document.getElementById('fullscreenChart');
    const ctx = canvas.getContext('2d');
    const data = getFilteredData();

    if (state.fullscreenChart) {
        state.fullscreenChart.destroy();
    }

    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

    let chartConfig;

    if (viewType === 'month') {
        chartConfig = {
            type: 'line',
            data: {
                labels: data.map(d => months[d.month - 1]),
                datasets: [{
                    label: kpi.title,
                    data: data.map(d => d[kpiId]),
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } }
            }
        };
    } else if (viewType === 'distribution') {
        chartConfig = {
            type: 'bar',
            data: {
                labels: data.map(d => months[d.month - 1]),
                datasets: [{
                    label: kpi.title,
                    data: data.map(d => d[kpiId]),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } }
            }
        };
    } else if (viewType === 'daily') {
        // Generate daily data simulation
        const dailyData = [];
        const dailyLabels = [];
        for (let i = 1; i <= 30; i++) {
            dailyLabels.push(`${i}.`);
            const baseValue = data.length > 0 ? data[data.length - 1][kpiId] / 30 : 0;
            dailyData.push(baseValue * (0.7 + Math.random() * 0.6));
        }

        chartConfig = {
            type: 'line',
            data: {
                labels: dailyLabels,
                datasets: [{
                    label: `${kpi.title} (Tagesverlauf)`,
                    data: dailyData,
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } }
            }
        };
    }

    state.fullscreenChart = new Chart(ctx, chartConfig);
}

function closeFullscreen() {
    const modal = document.getElementById('fullscreenModal');
    modal.classList.remove('show');
    currentFullscreenKpiId = null;
    if (state.fullscreenChart) {
        state.fullscreenChart.destroy();
        state.fullscreenChart = null;
    }
}

// Fullscreen view toggle event listener
document.addEventListener('DOMContentLoaded', () => {
    const viewToggle = document.getElementById('fullscreenViewToggle');
    if (viewToggle) {
        viewToggle.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button || !currentFullscreenKpiId) return;

            const viewType = button.dataset.view;

            // Update active button
            viewToggle.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Render new chart
            renderFullscreenChart(currentFullscreenKpiId, viewType);
        });
    }
});

function switchToDaily(kpiId) {
    const viewButtons = document.querySelectorAll(`[data-kpi="${kpiId}"]`);
    const dailyButton = Array.from(viewButtons).find(btn => btn.dataset.view === 'daily');
    if (dailyButton) {
        dailyButton.click();
    }
}

// Make functions global
window.openFullscreen = openFullscreen;
window.closeFullscreen = closeFullscreen;
window.switchToDaily = switchToDaily;
window.navigateTime = navigateTime;