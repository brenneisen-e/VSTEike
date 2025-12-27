/**
 * Provisionssimulation Chart Functions
 * Chart.js rendering and management
 */

import { provisionChart, companyProjectionChart, setProvisionChart, setCompanyProjectionChart } from './_state.js';
import { calculateProvisions } from './_calculations.js';
import { formatCurrency } from './_helpers.js';

/**
 * Render the provision comparison bar chart
 */
export const renderProvisionChart = () => {
    const canvas = document.getElementById('provisionComparisonChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const results = calculateProvisions();

    const labels = ['Leben', 'Kranken', 'Schaden'];
    const alphaData = [
        results.alpha.leben?.total ?? 0,
        results.alpha.kranken?.total ?? 0,
        results.alpha.schaden?.total ?? 0
    ];
    const betaData = [
        results.beta.leben?.total ?? 0,
        results.beta.kranken?.total ?? 0,
        results.beta.schaden?.total ?? 0
    ];

    provisionChart?.destroy();

    const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'AlphaProtect',
                    data: alphaData,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.4
                },
                {
                    label: 'BetaCare',
                    data: betaData,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: '#10b981',
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => context.dataset.label + ': ' + formatCurrency(context.raw)
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    ticks: { callback: (value) => formatCurrency(value, true) }
                }
            }
        }
    });

    setProvisionChart(newChart);
};

/**
 * Render the company projection line chart
 */
export const renderCompanyProjectionChart = () => {
    const canvas = document.getElementById('companyProjectionChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const agentCount = parseInt(document.getElementById('companyAgentCount')?.value ?? 150);
    const avgProduction = parseInt(document.getElementById('companyAvgProduction')?.value ?? 800000);
    const initialMigration = parseInt(document.getElementById('companyMigrationRate')?.value ?? 30) / 100;

    const years = ['Jahr 1', 'Jahr 2', 'Jahr 3', 'Jahr 4', 'Jahr 5'];
    const alphaData = [];
    const betaData = [];
    const totalProduction = agentCount * avgProduction;

    for (let i = 0; i < 5; i++) {
        alphaData.push(totalProduction * 0.022);
        const productionGrowth = 1 + (i * 0.05);
        betaData.push(totalProduction * productionGrowth * 0.020 + (i === 0 ? 250000 : 0));
    }

    companyProjectionChart?.destroy();

    const newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'AlphaProtect (Status Quo)',
                    data: alphaData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4
                },
                {
                    label: 'BetaCare (Migration)',
                    data: betaData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (context) => context.dataset.label + ': ' + formatCurrency(context.raw)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: { callback: (value) => formatCurrency(value, true) }
                }
            }
        }
    });

    setCompanyProjectionChart(newChart);
};
