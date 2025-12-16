// ========================================
// PROVISIONSSIMULATION - VST Board Integration
// ========================================

// Global State
const provisionState = {
    currentModel: 'comparison', // 'alpha', 'beta', 'comparison'
    segments: {
        leben: { neugeschaeft: 150000, bestand: 450000, storno: 8 },
        kranken: { neugeschaeft: 80000, bestand: 220000, storno: 5 },
        schaden: { neugeschaeft: 120000, bestand: 380000, storno: 12 }
    },
    years: 3
};

// Commission Rates Configuration
const commissionRates = {
    alpha: {
        leben: { ap: 2.0, bp: 0.3 },      // Abschluss- und Bestandsprovision
        kranken: { ap: 5.0, bp: 0.5 },     // In Monatsbeiträgen
        schaden: { ap: 15.0, bp: 2.0 }     // In Prozent
    },
    beta: {
        leben: { ap: 1.5, bp: 0.5 },
        kranken: { ap: 4.0, bp: 0.8 },
        schaden: { ap: 12.0, bp: 3.5 }
    }
};

// Revers Tiers (Staffelung nach Produktionsvolumen)
const reversTiers = [
    { min: 0, max: 100000, factor: 0.85, label: 'Basis' },
    { min: 100000, max: 250000, factor: 0.95, label: 'Standard' },
    { min: 250000, max: 500000, factor: 1.0, label: 'Premium' },
    { min: 500000, max: Infinity, factor: 1.1, label: 'Top' }
];

// Initialize Provision Simulation
function initProvisionSimulation() {
    updateProvisionSliders();
    calculateProvisions();
    renderProvisionChart();
    updateReversTier();
}

// Update Slider Values Display
function updateProvisionSliders() {
    Object.keys(provisionState.segments).forEach(segment => {
        const data = provisionState.segments[segment];

        // Update display values
        const neugeschaeftEl = document.getElementById(`${segment}NeugeschaeftValue`);
        const bestandEl = document.getElementById(`${segment}BestandValue`);
        const stornoEl = document.getElementById(`${segment}StornoValue`);

        if (neugeschaeftEl) neugeschaeftEl.textContent = formatCurrency(data.neugeschaeft);
        if (bestandEl) bestandEl.textContent = formatCurrency(data.bestand);
        if (stornoEl) stornoEl.textContent = `${data.storno}%`;
    });
}

// Handle Slider Change
function handleProvisionSlider(segment, type, value) {
    provisionState.segments[segment][type] = parseFloat(value);
    updateProvisionSliders();
    calculateProvisions();
    renderProvisionChart();
    updateReversTier();
}

// Calculate Total Production Volume
function getTotalProduction() {
    return Object.values(provisionState.segments).reduce((sum, seg) => {
        return sum + seg.neugeschaeft + seg.bestand;
    }, 0);
}

// Get Current Revers Tier
function getCurrentReversTier() {
    const totalProduction = getTotalProduction();
    return reversTiers.find(tier =>
        totalProduction >= tier.min && totalProduction < tier.max
    ) || reversTiers[reversTiers.length - 1];
}

// Calculate Provisions for both models
function calculateProvisions() {
    const tier = getCurrentReversTier();
    const results = { alpha: {}, beta: {} };

    ['alpha', 'beta'].forEach(model => {
        let totalAP = 0;
        let totalBP = 0;

        Object.keys(provisionState.segments).forEach(segment => {
            const segData = provisionState.segments[segment];
            const rates = commissionRates[model][segment];

            // Abschlussprovision (auf Neugeschäft)
            const ap = (segData.neugeschaeft * rates.ap / 100) * tier.factor;

            // Bestandsprovision (auf Bestand, abzgl. Storno)
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

    // Calculate Delta
    results.delta = {
        totalAP: results.beta.totalAP - results.alpha.totalAP,
        totalBP: results.beta.totalBP - results.alpha.totalBP,
        total: results.beta.total - results.alpha.total
    };

    // Update UI
    updateProvisionKPIs(results);
    updateProvisionTable(results);

    return results;
}

// Update KPI Cards
function updateProvisionKPIs(results) {
    // Alpha Total
    const alphaTotal = document.getElementById('provAlphaTotal');
    if (alphaTotal) alphaTotal.textContent = formatCurrency(results.alpha.total);

    // Beta Total
    const betaTotal = document.getElementById('provBetaTotal');
    if (betaTotal) betaTotal.textContent = formatCurrency(results.beta.total);

    // Delta
    const deltaTotal = document.getElementById('provDeltaTotal');
    const deltaEl = document.getElementById('provDeltaIndicator');
    if (deltaTotal) {
        const delta = results.delta.total;
        deltaTotal.textContent = (delta >= 0 ? '+' : '') + formatCurrency(delta);

        if (deltaEl) {
            deltaEl.className = 'provision-kpi-delta ' + (delta >= 0 ? 'positive' : 'negative');
            deltaEl.innerHTML = delta >= 0
                ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg> Mehrertrag'
                : '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg> Minderertrag';
        }
    }

    // Percentage Change
    const deltaPercent = document.getElementById('provDeltaPercent');
    if (deltaPercent && results.alpha.total > 0) {
        const percent = ((results.delta.total / results.alpha.total) * 100).toFixed(1);
        deltaPercent.textContent = (percent >= 0 ? '+' : '') + percent + '%';
    }
}

// Update Provision Rates Table
function updateProvisionTable(results) {
    const tbody = document.getElementById('provisionRatesBody');
    if (!tbody) return;

    const segmentLabels = {
        leben: { name: 'Leben', icon: 'shield' },
        kranken: { name: 'Kranken', icon: 'heart' },
        schaden: { name: 'Schaden', icon: 'home' }
    };

    let html = '';

    Object.keys(provisionState.segments).forEach(segment => {
        const label = segmentLabels[segment];
        const alphaRates = commissionRates.alpha[segment];
        const betaRates = commissionRates.beta[segment];
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
}

// Render Provision Chart
let provisionChart = null;

function renderProvisionChart() {
    const canvas = document.getElementById('provisionComparisonChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const results = calculateProvisions();

    const labels = ['Leben', 'Kranken', 'Schaden'];
    const alphaData = [
        results.alpha.leben?.total || 0,
        results.alpha.kranken?.total || 0,
        results.alpha.schaden?.total || 0
    ];
    const betaData = [
        results.beta.leben?.total || 0,
        results.beta.kranken?.total || 0,
        results.beta.schaden?.total || 0
    ];

    if (provisionChart) {
        provisionChart.destroy();
    }

    provisionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
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
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
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
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value, true);
                        }
                    }
                }
            }
        }
    });
}

// Update Revers Tier Display
function updateReversTier() {
    const totalProduction = getTotalProduction();
    const currentTier = getCurrentReversTier();
    const tierIndex = reversTiers.indexOf(currentTier);

    // Update tier progress
    const steps = document.querySelectorAll('.revers-step');
    steps.forEach((step, index) => {
        step.classList.remove('active', 'current');
        if (index <= tierIndex) {
            step.classList.add('active');
        }
        if (index === tierIndex) {
            step.classList.add('current');
        }
    });

    // Update info badge
    const tierInfo = document.getElementById('reversTierInfo');
    if (tierInfo) {
        tierInfo.textContent = `${currentTier.label} (${(currentTier.factor * 100).toFixed(0)}%)`;
    }

    // Update production display
    const prodDisplay = document.getElementById('totalProductionValue');
    if (prodDisplay) {
        prodDisplay.textContent = formatCurrency(totalProduction);
    }
}

// Get Segment SVG Icon Path
function getSegmentIcon(segment) {
    const icons = {
        leben: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
        kranken: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>',
        schaden: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>'
    };
    return icons[segment] || icons.leben;
}

// Format Currency
function formatCurrency(value, compact = false) {
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
}

// Export Report
function exportProvisionReport() {
    const results = calculateProvisions();
    const tier = getCurrentReversTier();

    let report = `PROVISIONSSIMULATION - REPORT\n`;
    report += `==============================\n\n`;
    report += `Datum: ${new Date().toLocaleDateString('de-DE')}\n`;
    report += `Simulationszeitraum: ${provisionState.years} Jahre\n`;
    report += `Revers-Stufe: ${tier.label} (${(tier.factor * 100).toFixed(0)}%)\n\n`;

    report += `ERGEBNIS\n`;
    report += `--------\n`;
    report += `AlphaProtect: ${formatCurrency(results.alpha.total)}\n`;
    report += `BetaCare: ${formatCurrency(results.beta.total)}\n`;
    report += `Differenz: ${formatCurrency(results.delta.total)}\n\n`;

    report += `DETAILS PRO SEGMENT\n`;
    report += `-------------------\n`;
    Object.keys(provisionState.segments).forEach(segment => {
        const data = provisionState.segments[segment];
        report += `${segment.toUpperCase()}:\n`;
        report += `  Neugeschäft: ${formatCurrency(data.neugeschaeft)}\n`;
        report += `  Bestand: ${formatCurrency(data.bestand)}\n`;
        report += `  Stornoquote: ${data.storno}%\n`;
        report += `  Alpha: ${formatCurrency(results.alpha[segment].total)}\n`;
        report += `  Beta: ${formatCurrency(results.beta[segment].total)}\n\n`;
    });

    // Download as text file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `provision-simulation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Report wurde exportiert', 'success');
}

// Reset to Defaults
function resetProvisionSimulation() {
    provisionState.segments = {
        leben: { neugeschaeft: 150000, bestand: 450000, storno: 8 },
        kranken: { neugeschaeft: 80000, bestand: 220000, storno: 5 },
        schaden: { neugeschaeft: 120000, bestand: 380000, storno: 12 }
    };

    // Reset slider values
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

    showNotification('Simulation zurückgesetzt', 'info');
}

// Export Functions
window.initProvisionSimulation = initProvisionSimulation;
window.handleProvisionSlider = handleProvisionSlider;
window.calculateProvisions = calculateProvisions;
window.exportProvisionReport = exportProvisionReport;
window.resetProvisionSimulation = resetProvisionSimulation;

// Auto-init when Vergütung tab is shown
const originalShowAgenturTab = window.showAgenturTab;
window.showAgenturTab = function(tabName) {
    if (typeof originalShowAgenturTab === 'function') {
        originalShowAgenturTab(tabName);
    }
    if (tabName === 'provision') {
        setTimeout(initProvisionSimulation, 100);
    }
};

console.log('Provisionssimulation.js geladen');
