/**
 * Provisionssimulation Module - ES6 Entry Point (ES2024)
 * Commission simulation for insurance agents
 */

// ========================================
// CONSTANTS
// ========================================

const COMMISSION_RATES = {
    alpha: {
        leben: { ap: 2.0, bp: 0.3 },
        kranken: { ap: 5.0, bp: 0.5 },
        schaden: { ap: 15.0, bp: 2.0 }
    },
    beta: {
        leben: { ap: 1.5, bp: 0.5 },
        kranken: { ap: 4.0, bp: 0.8 },
        schaden: { ap: 12.0, bp: 3.5 }
    }
};

const REVERS_TIERS = [
    { min: 0, max: 100000, factor: 0.85, label: 'Basis' },
    { min: 100000, max: 250000, factor: 0.95, label: 'Standard' },
    { min: 250000, max: 500000, factor: 1.0, label: 'Premium' },
    { min: 500000, max: Infinity, factor: 1.1, label: 'Top' }
];

const SEGMENT_ICONS = {
    leben: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
    kranken: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>',
    schaden: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>'
};

const SEGMENT_LABELS = {
    leben: { name: 'Leben', icon: 'shield' },
    kranken: { name: 'Kranken', icon: 'heart' },
    schaden: { name: 'Schaden', icon: 'home' }
};

// ========================================
// STATE
// ========================================

const provisionState = {
    currentModel: 'comparison',
    segments: {
        leben: { neugeschaeft: 150000, bestand: 450000, storno: 8 },
        kranken: { neugeschaeft: 80000, bestand: 220000, storno: 5 },
        schaden: { neugeschaeft: 120000, bestand: 380000, storno: 12 }
    },
    years: 3
};

let provisionChart = null;
let companyProjectionChart = null;

// ========================================
// HELPER FUNCTIONS
// ========================================

const formatCurrency = (value, compact = false) => {
    if (compact && Math.abs(value) >= 1000) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
            notation: 'compact'
        }).format(value);
    }
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(value);
};

const updateElement = (id, value) => {
    const el = document.getElementById(id);
    if (el) {
        value.includes?.('<') ? (el.innerHTML = value) : (el.textContent = value);
    }
};

const getSegmentIcon = (segment) => SEGMENT_ICONS[segment] ?? SEGMENT_ICONS.leben;

// ========================================
// CALCULATION FUNCTIONS
// ========================================

const getTotalProduction = () =>
    Object.values(provisionState.segments).reduce((sum, seg) => sum + seg.neugeschaeft + seg.bestand, 0);

const getCurrentReversTier = () => {
    const totalProduction = getTotalProduction();
    return REVERS_TIERS.find(tier => totalProduction >= tier.min && totalProduction < tier.max)
        ?? REVERS_TIERS[REVERS_TIERS.length - 1];
};

export const calculateProvisions = () => {
    const tier = getCurrentReversTier();
    const results = { alpha: {}, beta: {} };

    ['alpha', 'beta'].forEach(model => {
        let totalAP = 0;
        let totalBP = 0;

        Object.keys(provisionState.segments).forEach(segment => {
            const segData = provisionState.segments[segment];
            const rates = COMMISSION_RATES[model][segment];

            const ap = (segData.neugeschaeft * rates.ap / 100) * tier.factor;
            const effectiveBestand = segData.bestand * (1 - segData.storno / 100);
            const bp = (effectiveBestand * rates.bp / 100) * provisionState.years;

            totalAP += ap;
            totalBP += bp;
            results[model][segment] = { ap, bp, total: ap + bp };
        });

        results[model].totalAP = totalAP;
        results[model].totalBP = totalBP;
        results[model].total = totalAP + totalBP;
    });

    results.delta = {
        totalAP: results.beta.totalAP - results.alpha.totalAP,
        totalBP: results.beta.totalBP - results.alpha.totalBP,
        total: results.beta.total - results.alpha.total
    };

    updateProvisionKPIs(results);
    updateProvisionTable(results);
    return results;
};

// ========================================
// UI UPDATE FUNCTIONS
// ========================================

const updateProvisionSliders = () => {
    Object.keys(provisionState.segments).forEach(segment => {
        const data = provisionState.segments[segment];
        updateElement(`${segment}NeugeschaeftValue`, formatCurrency(data.neugeschaeft));
        updateElement(`${segment}BestandValue`, formatCurrency(data.bestand));
        updateElement(`${segment}StornoValue`, `${data.storno}%`);
    });
};

const updateProvisionKPIs = (results) => {
    updateElement('provAlphaTotal', formatCurrency(results.alpha.total));
    updateElement('provBetaTotal', formatCurrency(results.beta.total));

    const delta = results.delta.total;
    updateElement('provDeltaTotal', (delta >= 0 ? '+' : '') + formatCurrency(delta));

    const deltaEl = document.getElementById('provDeltaIndicator');
    if (deltaEl) {
        deltaEl.className = 'provision-kpi-delta ' + (delta >= 0 ? 'positive' : 'negative');
        deltaEl.innerHTML = delta >= 0
            ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg> Mehrertrag'
            : '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg> Minderertrag';
    }

    if (results.alpha.total > 0) {
        const percent = ((results.delta.total / results.alpha.total) * 100).toFixed(1);
        updateElement('provDeltaPercent', (percent >= 0 ? '+' : '') + percent + '%');
    }
};

const updateProvisionTable = (results) => {
    const tbody = document.getElementById('provisionRatesBody');
    if (!tbody) return;

    let html = '';
    Object.keys(provisionState.segments).forEach(segment => {
        const label = SEGMENT_LABELS[segment];
        const alphaRates = COMMISSION_RATES.alpha[segment];
        const betaRates = COMMISSION_RATES.beta[segment];
        const alphaResult = results.alpha[segment];
        const betaResult = results.beta[segment];
        const delta = betaResult.total - alphaResult.total;

        html += `
            <tr>
                <td>
                    <div class="segment-cell">
                        <div class="segment-icon ${segment}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                ${getSegmentIcon(segment)}
                            </svg>
                        </div>
                        ${label.name}
                    </div>
                </td>
                <td class="rate-cell alpha">${alphaRates.ap.toFixed(1)}% AP / ${alphaRates.bp.toFixed(1)}% BP</td>
                <td class="rate-cell beta">${betaRates.ap.toFixed(1)}% AP / ${betaRates.bp.toFixed(1)}% BP</td>
                <td class="rate-cell alpha">${formatCurrency(alphaResult.total)}</td>
                <td class="rate-cell beta">${formatCurrency(betaResult.total)}</td>
                <td class="delta-cell ${delta >= 0 ? 'positive' : 'negative'}">
                    ${delta >= 0 ? '+' : ''}${formatCurrency(delta)}
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
};

export const updateReversTier = () => {
    const totalProduction = getTotalProduction();
    const currentTier = getCurrentReversTier();
    const tierIndex = REVERS_TIERS.indexOf(currentTier);

    document.querySelectorAll('.revers-step').forEach((step, index) => {
        step.classList.remove('active', 'current');
        if (index <= tierIndex) step.classList.add('active');
        if (index === tierIndex) step.classList.add('current');
    });

    updateElement('reversTierInfo', `${currentTier.label} (${(currentTier.factor * 100).toFixed(0)}%)`);
    updateElement('totalProductionValue', formatCurrency(totalProduction));
};

// ========================================
// CHART FUNCTIONS
// ========================================

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

    provisionChart = new Chart(ctx, {
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
};

// ========================================
// COMPANY VIEW FUNCTIONS
// ========================================

export const calculateCompanyCosts = () => {
    const agentCount = parseInt(document.getElementById('companyAgentCount')?.value ?? 150);
    const avgProduction = parseInt(document.getElementById('companyAvgProduction')?.value ?? 800000);
    const migrationRate = parseInt(document.getElementById('companyMigrationRate')?.value ?? 30) / 100;

    const alphaRates = { ap: 0.018, bp: 0.004, bonus: 0.002 };
    const betaRates = { ap: 0.014, bp: 0.008, bonus: 0.003 };

    const totalProduction = agentCount * avgProduction;

    const alphaAP = totalProduction * alphaRates.ap * 0.4;
    const alphaBP = totalProduction * alphaRates.bp * 0.6 * 3;
    const alphaBonus = totalProduction * alphaRates.bonus;
    const alphaTotal = alphaAP + alphaBP + alphaBonus;

    const betaAgents = agentCount * migrationRate;
    const betaProduction = betaAgents * avgProduction;
    const remainingAlphaProduction = totalProduction - betaProduction;

    const betaAP = betaProduction * betaRates.ap * 0.4;
    const betaBP = betaProduction * betaRates.bp * 0.6 * 3;
    const betaBonus = betaProduction * betaRates.bonus;
    const remainingAlphaAP = remainingAlphaProduction * alphaRates.ap * 0.4;
    const remainingAlphaBP = remainingAlphaProduction * alphaRates.bp * 0.6 * 3;
    const remainingAlphaBonus = remainingAlphaProduction * alphaRates.bonus;

    const betaTotalAP = betaAP + remainingAlphaAP;
    const betaTotalBP = betaBP + remainingAlphaBP;
    const betaTotalBonus = betaBonus + remainingAlphaBonus;
    const implementationCost = 250000;
    const betaTotal = betaTotalAP + betaTotalBP + betaTotalBonus + implementationCost;

    const delta = betaTotal - alphaTotal;
    const marginEffect = ((delta / totalProduction) * 100).toFixed(2);

    updateElement('companyAlphaCost', formatCurrency(alphaTotal));
    updateElement('companyBetaCost', formatCurrency(betaTotal));
    updateElement('companyCostDelta', (delta >= 0 ? '+' : '') + formatCurrency(delta));
    updateElement('companyCostDeltaLabel', delta >= 0 ? 'Mehrkosten/Jahr' : 'Einsparung/Jahr');
    updateElement('companyMarginEffect', (marginEffect >= 0 ? '+' : '') + marginEffect + '%');

    updateElement('companyAlphaAP', formatCurrency(alphaAP));
    updateElement('companyBetaAP', formatCurrency(betaTotalAP));
    updateElement('companyDeltaAP', formatCurrency(betaTotalAP - alphaAP));

    updateElement('companyAlphaBP', formatCurrency(alphaBP));
    updateElement('companyBetaBP', formatCurrency(betaTotalBP));
    updateElement('companyDeltaBP', formatCurrency(betaTotalBP - alphaBP));

    updateElement('companyAlphaBonus', formatCurrency(alphaBonus));
    updateElement('companyBetaBonus', formatCurrency(betaTotalBonus));
    updateElement('companyDeltaBonus', formatCurrency(betaTotalBonus - alphaBonus));

    updateElement('companyAlphaTotal', '<strong>' + formatCurrency(alphaTotal) + '</strong>');
    updateElement('companyBetaTotal', '<strong>' + formatCurrency(betaTotal) + '</strong>');
    updateElement('companyTotalDelta', '<strong>' + formatCurrency(delta) + '</strong>');

    const breakEvenGrowth = Math.max(0, (delta / totalProduction) * 100 / 0.02).toFixed(0);
    updateElement('breakEvenGrowth', '+' + breakEvenGrowth + '%');
    updateElement('breakEvenPremium', formatCurrency(delta / 0.05));

    const payback = Math.ceil(implementationCost / (Math.abs(delta) / 12));
    updateElement('paybackPeriod', payback + ' Monate');

    renderCompanyProjectionChart();
};

const renderCompanyProjectionChart = () => {
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

    companyProjectionChart = new Chart(ctx, {
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
};

// ========================================
// MAIN FUNCTIONS
// ========================================

export const handleProvisionSlider = (segment, type, value) => {
    provisionState.segments[segment][type] = parseFloat(value);
    updateProvisionSliders();
    calculateProvisions();
    renderProvisionChart();
    updateReversTier();
};

export const exportProvisionReport = () => {
    const results = calculateProvisions();
    const tier = getCurrentReversTier();

    let report = `PROVISIONSSIMULATION - REPORT\n==============================\n\n`;
    report += `Datum: ${new Date().toLocaleDateString('de-DE')}\n`;
    report += `Simulationszeitraum: ${provisionState.years} Jahre\n`;
    report += `Revers-Stufe: ${tier.label} (${(tier.factor * 100).toFixed(0)}%)\n\n`;

    report += `ERGEBNIS\n--------\n`;
    report += `AlphaProtect: ${formatCurrency(results.alpha.total)}\n`;
    report += `BetaCare: ${formatCurrency(results.beta.total)}\n`;
    report += `Differenz: ${formatCurrency(results.delta.total)}\n\n`;

    report += `DETAILS PRO SEGMENT\n-------------------\n`;
    Object.keys(provisionState.segments).forEach(segment => {
        const data = provisionState.segments[segment];
        report += `${segment.toUpperCase()}:\n`;
        report += `  Neugeschäft: ${formatCurrency(data.neugeschaeft)}\n`;
        report += `  Bestand: ${formatCurrency(data.bestand)}\n`;
        report += `  Stornoquote: ${data.storno}%\n`;
        report += `  Alpha: ${formatCurrency(results.alpha[segment].total)}\n`;
        report += `  Beta: ${formatCurrency(results.beta[segment].total)}\n\n`;
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `provision-simulation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    window.showNotification?.('Report wurde exportiert', 'success');
};

export const resetProvisionSimulation = () => {
    provisionState.segments = {
        leben: { neugeschaeft: 150000, bestand: 450000, storno: 8 },
        kranken: { neugeschaeft: 80000, bestand: 220000, storno: 5 },
        schaden: { neugeschaeft: 120000, bestand: 380000, storno: 12 }
    };

    Object.keys(provisionState.segments).forEach(segment => {
        const data = provisionState.segments[segment];
        const neuSlider = document.getElementById(`${segment}Neugeschaeft`);
        const bestSlider = document.getElementById(`${segment}Bestand`);
        const stornoSlider = document.getElementById(`${segment}Storno`);

        if (neuSlider) neuSlider.value = data.neugeschaeft;
        if (bestSlider) bestSlider.value = data.bestand;
        if (stornoSlider) stornoSlider.value = data.storno;
    });

    updateProvisionSliders();
    calculateProvisions();
    renderProvisionChart();
    updateReversTier();

    window.showNotification?.('Simulation zurückgesetzt', 'info');
};

export const toggleProvisionFullscreen = () => {
    const section = document.getElementById('provisionSimulation');
    if (section) {
        section.classList.toggle('fullscreen');
        setTimeout(() => {
            provisionChart?.resize();
            companyProjectionChart?.resize();
        }, 100);
    }
};

export const switchPerspective = (perspective) => {
    document.querySelectorAll('.perspective-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.perspective-btn[onclick="switchPerspective('${perspective}')"]`)?.classList.add('active');

    document.querySelectorAll('.perspective-content').forEach(content => content.classList.remove('active'));

    if (perspective === 'vermittler') {
        document.getElementById('vermittlerPerspective')?.classList.add('active');
    } else {
        document.getElementById('unternehmenPerspective')?.classList.add('active');
        initCompanyView();
    }
};

export const updateMigrationDisplay = () => {
    const slider = document.getElementById('companyMigrationRate');
    const display = document.getElementById('migrationRateValue');
    if (slider && display) display.textContent = slider.value + '%';
};

export const initCompanyView = () => {
    calculateCompanyCosts();
    renderCompanyProjectionChart();
};

export const initProvisionSimulation = () => {
    updateProvisionSliders();
    calculateProvisions();
    renderProvisionChart();
    updateReversTier();
};

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const section = document.getElementById('provisionSimulation');
        if (section?.classList.contains('fullscreen')) {
            section.classList.remove('fullscreen');
        }
    }
});

// ========================================
// WINDOW EXPORTS
// ========================================

Object.assign(window, {
    initProvisionSimulation,
    handleProvisionSlider,
    calculateProvisions,
    exportProvisionReport,
    resetProvisionSimulation,
    toggleProvisionFullscreen,
    switchPerspective,
    calculateCompanyCosts,
    updateMigrationDisplay,
    initCompanyView
});

// Auto-init hook
const originalShowAgenturTab = window.showAgenturTab;
window.showAgenturTab = function(tabName) {
    originalShowAgenturTab?.(tabName);
    if (tabName === 'provision') {
        setTimeout(initProvisionSimulation, 100);
    }
};


export { provisionState, COMMISSION_RATES, REVERS_TIERS };
