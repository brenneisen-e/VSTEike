/**
 * Banken Charts Module
 * ES6 Module for Chart.js visualizations
 */

// ========================================
// STATE
// ========================================

let scatterPlotChart = null;
let portfolioChart = null;

// ========================================
// INITIALIZATION
// ========================================

export function initBankenCharts() {
    console.log('Initializing Banken charts...');
    initScatterPlot();
    initPortfolioChart();
}

// ========================================
// SCATTER PLOT (Willingness vs Ability Matrix)
// ========================================

export function initScatterPlot() {
    const canvas = document.getElementById('scatterPlotCanvas');
    if (!canvas) {
        console.warn('Scatter plot canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Generate sample data points for each quadrant
    const generatePoints = (count, xMin, xMax, yMin, yMax) => {
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
    const prioritaetData = generatePoints(45, 55, 95, 55, 95);
    // Q2: Low Willingness, High Ability (Restrukturierung) - top left
    const restrukturierungData = generatePoints(60, 5, 45, 55, 95);
    // Q3: Low Willingness, Low Ability (Eskalation) - bottom left
    const eskalationData = generatePoints(35, 5, 45, 5, 45);
    // Q4: High Willingness, Low Ability (Abwicklung) - bottom right
    const abwicklungData = generatePoints(55, 55, 95, 5, 45);

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
                    display: false
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

// ========================================
// PORTFOLIO EVOLUTION CHART
// ========================================

export function initPortfolioChart(period = '12m') {
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
    const portfolioData = labels.map(() => {
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

// ========================================
// CHART ACTIONS
// ========================================

export function refreshScatterPlot() {
    window.showNotification?.('Matrix wird aktualisiert...', 'info');
    initScatterPlot();
}

export function exportMatrix() {
    window.showNotification?.('Matrix wird exportiert...', 'info');
    console.log('Exporting matrix');
}

export function updatePortfolioChart(period) {
    initPortfolioChart(period);
}

// ========================================
// SEARCH & FILTER
// ========================================

export function filterCustomers(filterType, value) {
    console.log('Filtering customers by', filterType, ':', value);
}

export function searchCustomers(query) {
    console.log('Searching customers:', query);

    const searchTerm = query.toLowerCase().trim();
    const table = document.querySelector('.customers-table');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        if (!searchTerm) {
            row.style.display = '';
            return;
        }

        const kundenNr = row.querySelector('.customer-id')?.textContent?.toLowerCase() || '';
        const kundenName = row.querySelector('.customer-name')?.textContent?.toLowerCase() || '';
        const cells = row.querySelectorAll('td');
        let rowText = '';
        cells.forEach(cell => rowText += ' ' + cell.textContent.toLowerCase());

        const matches = kundenNr.includes(searchTerm) ||
                       kundenName.includes(searchTerm) ||
                       rowText.includes(searchTerm);

        row.style.display = matches ? '' : 'none';
    });
}
