// ========================================
// FINANZPLANUNG - SIMULATOR & CHART
// ========================================

// Rentenlücken-Simulator
function updateRentenSimulator() {
    const rentenAlter = parseInt(document.getElementById('rentenAlter')?.value || 63);
    const wunschRente = parseInt(document.getElementById('wunschRente')?.value || 2500);
    const rendite = parseFloat(document.getElementById('rendite')?.value || 4);

    // Update slider values
    const rentenAlterValue = document.getElementById('rentenAlterValue');
    const wunschRenteValue = document.getElementById('wunschRenteValue');
    const renditeValue = document.getElementById('renditeValue');

    if (rentenAlterValue) rentenAlterValue.textContent = `${rentenAlter} Jahre`;
    if (wunschRenteValue) wunschRenteValue.textContent = `${wunschRente.toLocaleString('de-DE')} €/Monat`;
    if (renditeValue) renditeValue.textContent = `${rendite.toFixed(1).replace('.', ',')}%`;

    // Berechnungen
    const aktuellesAlter = 39; // Peter Schmidt ist 39
    const jahreBisRente = rentenAlter - aktuellesAlter;
    const gesetzlicheRente = 1650; // Geschätzt
    const luecke = Math.max(0, wunschRente - gesetzlicheRente);

    // Kapitalbedarfberechnung (vereinfacht: 20 Jahre Rentenbezug)
    const rentenJahre = 20;
    const inflationsBereinigt = 0.98; // Vereinfacht
    const kapitalBedarf = Math.round(luecke * 12 * rentenJahre * inflationsBereinigt);

    // Bereits angespart
    const bereitsAngespart = 42000;

    // Noch benötigtes Kapital
    const nochBenötigt = kapitalBedarf - bereitsAngespart;

    // Sparrate berechnen (Annuität)
    const monatlicheRendite = rendite / 100 / 12;
    const monate = jahreBisRente * 12;
    let sparrate;
    if (monatlicheRendite > 0) {
        sparrate = Math.round(nochBenötigt * monatlicheRendite / (Math.pow(1 + monatlicheRendite, monate) - 1));
    } else {
        sparrate = Math.round(nochBenötigt / monate);
    }

    // UI updaten
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

    // Bar height
    if (gesetzlichBar) {
        const percentage = Math.min(100, (gesetzlicheRente / wunschRente) * 100);
        gesetzlichBar.style.height = `${percentage}%`;
    }

    // Update Szenario Chart
    updateSzenarioChart(sparrate, jahreBisRente, bereitsAngespart);
}

// Szenario Chart
let szenarioChart = null;

function updateSzenarioChart(monatlicheSparrate, jahre, startkapital) {
    const canvas = document.getElementById('szenarioChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Berechne Szenarien
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
            kapital = kapital * (1 + szenario.rendite / 12) + monatlicheSparrate;
            kapital = kapital * (1 + szenario.rendite / 12) + monatlicheSparrate;
            kapital = kapital * (1 + szenario.rendite / 12) + monatlicheSparrate;
            kapital = kapital * (1 + szenario.rendite / 12) + monatlicheSparrate;
            kapital = kapital * (1 + szenario.rendite / 12) + monatlicheSparrate;
            kapital = kapital * (1 + szenario.rendite / 12) + monatlicheSparrate;
            kapital = kapital * (1 + szenario.rendite / 12) + monatlicheSparrate;
            kapital = kapital * (1 + szenario.rendite / 12) + monatlicheSparrate;
            kapital = kapital * (1 + szenario.rendite / 12) + monatlicheSparrate;
            kapital = kapital * (1 + szenario.rendite / 12) + monatlicheSparrate;
            kapital = kapital * (1 + szenario.rendite / 12) + monatlicheSparrate;
            kapital = kapital * (1 + szenario.rendite / 12) + monatlicheSparrate;
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

        // Update legend values
        const legendEl = document.getElementById('szenario' + key.charAt(0).toUpperCase() + key.slice(1));
        if (legendEl) {
            legendEl.textContent = `${data[data.length - 1].toLocaleString('de-DE')} €`;
        }
    });

    // Destroy existing chart
    if (szenarioChart) {
        szenarioChart.destroy();
    }

    // Create new chart
    szenarioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw.toLocaleString('de-DE') + ' €';
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
                            return value.toLocaleString('de-DE') + ' €';
                        }
                    }
                }
            }
        }
    });
}

// Rentenlücken-Simulator öffnen
function openRentenSimulator() {
    const card = document.getElementById('rentenSimulatorCard');
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.boxShadow = '0 0 0 3px #3b82f6';
        setTimeout(() => {
            card.style.boxShadow = '';
        }, 2000);
    }
}

// Dummy-Funktionen für Buttons
function openAddGoalModal() {
    alert('Neues Sparziel anlegen – Feature in Entwicklung');
}

function createAngebot(produkt) {
    alert('Angebot erstellen für: ' + produkt + ' – Feature in Entwicklung');
}

function scheduleTermin(thema) {
    alert('Termin vereinbaren: ' + thema + ' – Feature in Entwicklung');
}

function prepareBeratung() {
    alert('Beratungsgespräch vorbereiten – Feature in Entwicklung');
}

function contactKunde() {
    alert('Kunde kontaktieren – Feature in Entwicklung');
}

// Initialize Finanzplanung on tab switch
function initFinanzplanung() {
    // Initial update
    setTimeout(() => {
        updateRentenSimulator();
    }, 100);
}

// Export functions
window.updateRentenSimulator = updateRentenSimulator;
window.openRentenSimulator = openRentenSimulator;
window.openAddGoalModal = openAddGoalModal;
window.createAngebot = createAngebot;
window.scheduleTermin = scheduleTermin;
window.prepareBeratung = prepareBeratung;
window.contactKunde = contactKunde;
window.initFinanzplanung = initFinanzplanung;

// Auto-init when switching to Finanzplanung tab
const originalSwitchKundenTab = window.switchKundenTab;
window.switchKundenTab = function(tabName) {
    if (typeof originalSwitchKundenTab === 'function') {
        originalSwitchKundenTab(tabName);
    }
    if (tabName === 'finanzplanung') {
        initFinanzplanung();
    }
};

console.log('✅ finanzplanung.js geladen');
