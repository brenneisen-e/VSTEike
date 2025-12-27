/**
 * Finanzplanung Module - ES2024
 * Retirement simulator and scenario chart
 */

// ========================================
// STATE
// ========================================

let szenarioChart = null;

// ========================================
// RENTEN SIMULATOR
// ========================================

export const updateRentenSimulator = () => {
    const rentenAlter = parseInt(document.getElementById('rentenAlter')?.value ?? 63);
    const wunschRente = parseInt(document.getElementById('wunschRente')?.value ?? 2500);
    const rendite = parseFloat(document.getElementById('rendite')?.value ?? 4);

    // Update slider values
    const rentenAlterValue = document.getElementById('rentenAlterValue');
    const wunschRenteValue = document.getElementById('wunschRenteValue');
    const renditeValue = document.getElementById('renditeValue');

    if (rentenAlterValue) rentenAlterValue.textContent = `${rentenAlter} Jahre`;
    if (wunschRenteValue) wunschRenteValue.textContent = `${wunschRente.toLocaleString('de-DE')} €/Monat`;
    if (renditeValue) renditeValue.textContent = `${rendite.toFixed(1).replace('.', ',')}%`;

    // Calculations
    const aktuellesAlter = 39;
    const jahreBisRente = rentenAlter - aktuellesAlter;
    const gesetzlicheRente = 1650;
    const luecke = Math.max(0, wunschRente - gesetzlicheRente);

    // Capital calculation
    const rentenJahre = 20;
    const inflationsBereinigt = 0.98;
    const kapitalBedarf = Math.round(luecke * 12 * rentenJahre * inflationsBereinigt);

    const bereitsAngespart = 42000;
    const nochBenötigt = kapitalBedarf - bereitsAngespart;

    // Savings rate calculation
    const monatlicheRendite = rendite / 100 / 12;
    const monate = jahreBisRente * 12;
    let sparrate;
    if (monatlicheRendite > 0) {
        sparrate = Math.round(nochBenötigt * monatlicheRendite / (Math.pow(1 + monatlicheRendite, monate) - 1));
    } else {
        sparrate = Math.round(nochBenötigt / monate);
    }

    // Update UI
    const gesetzlichValue = document.getElementById('gesetzlichValue');
    const wunschValue = document.getElementById('wunschValue');
    const lueckeValue = document.getElementById('lueckeValue');
    const kapitalBedarfEl = document.getElementById('kapitalBedarf');
    const bereitsAngespartEl = document.getElementById('bereitsAngespart');
    const sparrateBedarfEl = document.getElementById('sparrateBedarf');
    const gesetzlichBar = document.getElementById('gesetzlichBar');

    if (gesetzlichValue) gesetzlichValue.textContent = `${gesetzlicheRente.toLocaleString('de-DE')} €`;
    if (wunschValue) wunschValue.textContent = `${wunschRente.toLocaleString('de-DE')} €`;
    if (lueckeValue) lueckeValue.textContent = `${luecke.toLocaleString('de-DE')} €/Monat`;
    if (kapitalBedarfEl) kapitalBedarfEl.textContent = `${kapitalBedarf.toLocaleString('de-DE')} €`;
    if (bereitsAngespartEl) bereitsAngespartEl.textContent = `${bereitsAngespart.toLocaleString('de-DE')} €`;
    if (sparrateBedarfEl) sparrateBedarfEl.textContent = `${Math.max(0, sparrate).toLocaleString('de-DE')} €/Monat`;

    if (gesetzlichBar) {
        const percentage = Math.min(100, (gesetzlicheRente / wunschRente) * 100);
        gesetzlichBar.style.height = `${percentage}%`;
    }

    updateSzenarioChart(sparrate, jahreBisRente, bereitsAngespart);
};

// ========================================
// SCENARIO CHART
// ========================================

const updateSzenarioChart = (monatlicheSparrate, jahre, startkapital) => {
    const canvas = document.getElementById('szenarioChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const szenarien = {
        konservativ: { rendite: 0.03, color: '#94a3b8', label: 'Konservativ (3%)' },
        moderat: { rendite: 0.05, color: '#3b82f6', label: 'Moderat (5%)' },
        optimistisch: { rendite: 0.07, color: '#10b981', label: 'Optimistisch (7%)' }
    };

    const labels = [];
    const datasets = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i <= jahre; i++) {
        labels.push(currentYear + i);
    }

    Object.keys(szenarien).forEach(key => {
        const szenario = szenarien[key];
        const data = [];
        let kapital = startkapital;

        for (let i = 0; i <= jahre; i++) {
            data.push(Math.round(kapital));
            // 12 months of growth
            for (let m = 0; m < 12; m++) {
                kapital = kapital * (1 + szenario.rendite / 12) + monatlicheSparrate;
            }
        }

        datasets.push({
            label: szenario.label,
            data: data,
            borderColor: szenario.color,
            backgroundColor: szenario.color + '20',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6
        });

        const legendEl = document.getElementById('szenario' + key.charAt(0).toUpperCase() + key.slice(1));
        if (legendEl) {
            legendEl.textContent = `${data[data.length - 1].toLocaleString('de-DE')} €`;
        }
    });

    szenarioChart?.destroy();

    szenarioChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => context.dataset.label + ': ' + context.raw.toLocaleString('de-DE') + ' €'
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => value.toLocaleString('de-DE') + ' €'
                    }
                }
            }
        }
    });
};

// ========================================
// UI ACTIONS
// ========================================

export const openRentenSimulator = () => {
    const card = document.getElementById('rentenSimulatorCard');
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.boxShadow = '0 0 0 3px #3b82f6';
        setTimeout(() => {
            card.style.boxShadow = '';
        }, 2000);
    }
};

export const openAddGoalModal = () => {
    alert('Neues Sparziel anlegen – Feature in Entwicklung');
};

export const createAngebot = (produkt) => {
    alert('Angebot erstellen für: ' + produkt + ' – Feature in Entwicklung');
};

export const scheduleTermin = (thema) => {
    alert('Termin vereinbaren: ' + thema + ' – Feature in Entwicklung');
};

export const prepareBeratung = () => {
    alert('Beratungsgespräch vorbereiten – Feature in Entwicklung');
};

export const contactKunde = () => {
    alert('Kunde kontaktieren – Feature in Entwicklung');
};

// ========================================
// INITIALIZATION
// ========================================

export const initFinanzplanung = () => {
    setTimeout(() => {
        updateRentenSimulator();
    }, 100);
};

// ========================================
// TAB SWITCH HOOK
// ========================================

const originalSwitchKundenTab = window.switchKundenTab;
window.switchKundenTab = (tabName) => {
    if (typeof originalSwitchKundenTab === 'function') {
        originalSwitchKundenTab(tabName);
    }
    if (tabName === 'finanzplanung') {
        initFinanzplanung();
    }
};

// ========================================
// WINDOW EXPORTS
// ========================================

Object.assign(window, {
    updateRentenSimulator,
    openRentenSimulator,
    openAddGoalModal,
    createAngebot,
    scheduleTermin,
    prepareBeratung,
    contactKunde,
    initFinanzplanung
});
