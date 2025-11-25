// js/agentur-overview.js - Agentur-Übersicht Funktionalität

// ========================================
// AGENTUR OVERVIEW FUNCTIONS
// ========================================

/**
 * Zeigt die Agentur-Übersichts-Seite für eine bestimmte Agentur
 * @param {string} vermittlerId - Die Vermittler-ID (z.B. 'VM00001')
 */
function showAgenturOverview(vermittlerId) {
    console.log('📊 Zeige Agentur-Übersicht für:', vermittlerId);

    // Verstecke alle anderen Pages
    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    const agenturOverview = document.getElementById('agenturOverview');
    const billingCheckPage = document.getElementById('billingCheckPage');

    if (landingPage) landingPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'none';
    if (billingCheckPage) billingCheckPage.style.display = 'none';
    if (agenturOverview) agenturOverview.style.display = 'block';

    // Lade und zeige Agentur-Daten
    loadAgenturData(vermittlerId);
}

/**
 * Lädt die Daten für eine bestimmte Agentur und füllt die UI
 * @param {string} vermittlerId - Die Vermittler-ID
 */
function loadAgenturData(vermittlerId) {
    console.log('📂 Lade Daten für Agentur:', vermittlerId);

    // Hole Agentur-Daten aus den bestehenden Funktionen
    const agenturen = typeof getAgenturen === 'function' ? getAgenturen() : [];
    const agentur = agenturen.find(a => a.id === vermittlerId);

    if (!agentur) {
        console.error('❌ Agentur nicht gefunden:', vermittlerId);
        alert('Agentur nicht gefunden: ' + vermittlerId);
        backFromAgentur();
        return;
    }

    // Hole detaillierte Daten
    const agenturData = typeof getAgenturData === 'function' ? getAgenturData(vermittlerId) : null;

    console.log('✅ Agentur gefunden:', agentur);
    console.log('📊 Agentur Daten:', agenturData);

    // Fülle Stammdaten
    fillStammdaten(agentur, agenturData);

    // Fülle KPIs
    fillKPIs(agenturData);

    // Fülle Verträge
    fillContracts(vermittlerId, agenturData);
}

/**
 * Füllt die Stammdaten-Sektion
 */
function fillStammdaten(agentur, agenturData) {
    document.getElementById('agenturPageTitle').textContent = `Agentur-Übersicht: ${agentur.name || agentur.id}`;
    document.getElementById('agenturId').textContent = agentur.id;
    document.getElementById('agenturName').textContent = agentur.name || '-';

    // Adresse (generiere falls nicht vorhanden)
    const adresse = generateAddress(agenturData?.bundesland || 'Deutschland');
    document.getElementById('agenturAdresse').textContent = adresse;

    // Agenturstufe (basierend auf Neugeschäft)
    const stufe = calculateAgenturstufe(agenturData?.neugeschaeft || 0);
    document.getElementById('agenturStufe').textContent = stufe;

    // Eintrittsdatum (generiere zufällig)
    const eintritt = generateEintrittsdatum();
    document.getElementById('agenturEintritt').textContent = eintritt;

    // Silo
    document.getElementById('agenturSilo').textContent = agenturData?.silo || '-';
}

/**
 * Füllt die KPI-Balken
 */
function fillKPIs(agenturData) {
    const kpisContainer = document.getElementById('agenturKPIs');
    kpisContainer.innerHTML = '';

    if (!agenturData) {
        kpisContainer.innerHTML = '<p style="color: #64748b;">Keine Daten verfügbar</p>';
        return;
    }

    // Definiere KPIs mit Werten und Benchmarks
    const kpis = [
        {
            label: 'Neugeschäft YTD',
            value: agenturData.neugeschaeft || 0,
            formatted: `€${((agenturData.neugeschaeft || 0) / 1000000).toFixed(2)} Mio`,
            benchmark: 2000000, // 2 Mio Benchmark
            type: 'currency'
        },
        {
            label: 'Bestand',
            value: agenturData.bestand || 0,
            formatted: `€${((agenturData.bestand || 0) / 1000000).toFixed(2)} Mio`,
            benchmark: 50000000, // 50 Mio Benchmark
            type: 'currency'
        },
        {
            label: 'Stornoquote',
            value: agenturData.storno || 0,
            formatted: `${(agenturData.storno || 0).toFixed(2)}%`,
            benchmark: 8, // 8% Benchmark (niedrig ist besser)
            type: 'percentage_inverse'
        },
        {
            label: 'NPS Score',
            value: agenturData.nps || 0,
            formatted: `${(agenturData.nps || 0).toFixed(1)}`,
            benchmark: 70, // NPS 70 Benchmark
            type: 'score'
        },
        {
            label: 'Deckungsbeitrag',
            value: agenturData.deckungsbeitrag || 0,
            formatted: `€${((agenturData.deckungsbeitrag || 0) / 1000).toFixed(0)}k`,
            benchmark: 500000, // 500k Benchmark
            type: 'currency'
        }
    ];

    kpis.forEach(kpi => {
        const barItem = createKPIBar(kpi);
        kpisContainer.appendChild(barItem);
    });
}

/**
 * Erstellt einen einzelnen KPI-Balken
 */
function createKPIBar(kpi) {
    const div = document.createElement('div');
    div.className = 'kpi-bar-item';

    // Berechne Prozentsatz basierend auf Benchmark
    let percentage = 0;
    let cssClass = '';

    if (kpi.type === 'percentage_inverse') {
        // Bei Stornoquote: niedrig ist gut
        percentage = Math.min(100, (kpi.benchmark / kpi.value) * 100);
        cssClass = kpi.value < kpi.benchmark ? 'positive' : 'negative';
    } else {
        percentage = Math.min(100, (kpi.value / kpi.benchmark) * 100);
        cssClass = kpi.value >= kpi.benchmark * 0.8 ? 'positive' : '';
    }

    div.innerHTML = `
        <div class="kpi-bar-header">
            <span class="kpi-bar-label">${kpi.label}</span>
            <span class="kpi-bar-value">${kpi.formatted}</span>
        </div>
        <div class="kpi-bar-track">
            <div class="kpi-bar-fill ${cssClass}" style="width: ${percentage}%">
                ${percentage.toFixed(0)}%
            </div>
        </div>
    `;

    return div;
}

/**
 * Füllt die Vertrags-Tabelle
 */
function fillContracts(vermittlerId, agenturData) {
    const tbody = document.querySelector('#agenturContracts tbody');
    tbody.innerHTML = '';

    // Generiere 10 zufällige Verträge
    const contracts = generateContracts(vermittlerId, 10);

    contracts.forEach(contract => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${contract.date}</td>
            <td>${contract.segment}</td>
            <td>€${contract.premium.toLocaleString()}</td>
            <td><span class="contract-status ${contract.status.toLowerCase()}">${contract.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Generiert zufällige Verträge für Demo-Zwecke
 */
function generateContracts(vermittlerId, count) {
    const segments = ['Leben', 'Kranken', 'Schaden', 'Kfz'];
    const statuses = ['Aktiv', 'Aktiv', 'Aktiv', 'Aktiv', 'Storniert']; // 80% aktiv
    const contracts = [];

    for (let i = 0; i < count; i++) {
        const monthsAgo = i;
        const date = new Date();
        date.setMonth(date.getMonth() - monthsAgo);

        contracts.push({
            date: date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            segment: segments[Math.floor(Math.random() * segments.length)],
            premium: Math.floor(Math.random() * 5000) + 500,
            status: statuses[Math.floor(Math.random() * statuses.length)]
        });
    }

    return contracts;
}

/**
 * Hilfs-Funktionen
 */

function calculateAgenturstufe(neugeschaeft) {
    if (neugeschaeft >= 5000000) return 'Gold Plus';
    if (neugeschaeft >= 3000000) return 'Gold';
    if (neugeschaeft >= 2000000) return 'Silber Plus';
    if (neugeschaeft >= 1000000) return 'Silber';
    return 'Bronze';
}

function generateAddress(bundesland) {
    const addresses = {
        'Baden-Württemberg': 'Hauptstraße 42, 79098 Freiburg',
        'Bayern': 'Marienplatz 8, 80331 München',
        'Berlin': 'Unter den Linden 5, 10117 Berlin',
        'Hamburg': 'Reeperbahn 1, 20359 Hamburg',
        'Nordrhein-Westfalen': 'Königsallee 60, 40212 Düsseldorf',
        'Hessen': 'Zeil 106, 60313 Frankfurt am Main'
    };

    return addresses[bundesland] || 'Hauptstraße 1, 10115 Berlin';
}

function generateEintrittsdatum() {
    const yearsAgo = Math.floor(Math.random() * 15) + 1; // 1-15 Jahre
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsAgo);

    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Navigation Functions
 */

function backFromAgentur() {
    console.log('🔙 Zurück vom Agentur-Overview');

    const landingPage = document.getElementById('landingPage');
    const agenturOverview = document.getElementById('agenturOverview');

    if (landingPage) landingPage.style.display = 'flex';
    if (agenturOverview) agenturOverview.style.display = 'none';
}

// ========================================
// BILLING CHECK FUNCTIONS
// ========================================

function openBillingCheck() {
    console.log('💳 Öffne Billing Check');

    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    const agenturOverview = document.getElementById('agenturOverview');
    const billingCheckPage = document.getElementById('billingCheckPage');

    if (landingPage) landingPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'none';
    if (agenturOverview) agenturOverview.style.display = 'none';
    if (billingCheckPage) billingCheckPage.style.display = 'block';
}

function closeBillingCheck() {
    console.log('🔙 Schließe Billing Check');

    const landingPage = document.getElementById('landingPage');
    const billingCheckPage = document.getElementById('billingCheckPage');

    if (landingPage) landingPage.style.display = 'flex';
    if (billingCheckPage) billingCheckPage.style.display = 'none';
}

// ========================================
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// ========================================

window.showAgenturOverview = showAgenturOverview;
window.backFromAgentur = backFromAgentur;
window.openBillingCheck = openBillingCheck;
window.closeBillingCheck = closeBillingCheck;

console.log('✅ agentur-overview.js geladen');
