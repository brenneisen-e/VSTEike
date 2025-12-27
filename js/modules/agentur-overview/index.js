/**
 * Agentur Overview Module - ES6 Entry Point (ES2024)
 * Agency profile and detail view
 */

// ========================================
// HELPERS
// ========================================

const setElementText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
};

const formatCurrency = (value) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(2)} Mio`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value.toFixed(0)}`;
};

const calculateAgenturstufe = (neugeschaeft) => {
    if (neugeschaeft >= 5000000) return 'Gold Plus';
    if (neugeschaeft >= 3000000) return 'Gold';
    if (neugeschaeft >= 2000000) return 'Silber Plus';
    if (neugeschaeft >= 1000000) return 'Silber';
    return 'Bronze';
};

const generateAddress = (bundesland) => {
    const addresses = {
        'Baden-Württemberg': 'Hauptstraße 42, 79098 Freiburg',
        'Bayern': 'Marienplatz 8, 80331 München',
        'Berlin': 'Unter den Linden 5, 10117 Berlin',
        'Hamburg': 'Reeperbahn 1, 20359 Hamburg',
        'Nordrhein-Westfalen': 'Königsallee 60, 40212 Düsseldorf',
        'Hessen': 'Zeil 106, 60313 Frankfurt am Main',
        'Sachsen': 'Prager Straße 12, 01069 Dresden',
        'Niedersachsen': 'Georgstraße 36, 30159 Hannover'
    };
    return addresses[bundesland] ?? 'Hauptstraße 1, 10115 Berlin';
};

const generatePhone = () => {
    const prefix = ['089', '030', '040', '069', '0211', '0221'];
    return `${prefix[Math.floor(Math.random() * prefix.length)]} ${Math.floor(Math.random() * 9000000 + 1000000)}`;
};

const generateEmail = (name) => {
    if (!name) return 'kontakt@agentur.de';
    const cleanName = name.toLowerCase().replace(/\s+/g, '.').replace(/[äöü]/g, c => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' })[c] ?? c);
    return `${cleanName}@versicherung.de`;
};

const generateEintrittsdatum = () => {
    const yearsAgo = Math.floor(Math.random() * 15) + 1;
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsAgo);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ========================================
// FILL FUNCTIONS
// ========================================

const fillHeader = (agentur, agenturData) => {
    setElementText('agenturPageTitle', agentur.name ?? agentur.id);
    setElementText('agenturIdHeader', agentur.id);
    setElementText('agenturStatusHeader', 'Aktiv');

    // WARNING: defaultPhoto is 4.8MB - Consider optimizing this image for web use
    // Recommended: Use WebP format and reduce to ~200-300KB
    const defaultPhoto = 'https://raw.githubusercontent.com/brenneisen-e/VSTEike/main/AdobeStock_1091012713.jpeg';
    const savedPhoto = localStorage.getItem('agenturPhoto');
    const photoImgSmall = document.getElementById('agenturPhotoImgSmall');
    const placeholderSmall = document.querySelector('.agentur-photo-placeholder-small');

    if (photoImgSmall) {
        // Lazy loading is handled by HTML attribute
        photoImgSmall.src = savedPhoto ?? defaultPhoto;
        photoImgSmall.style.display = 'block';
        if (placeholderSmall) placeholderSmall.style.display = 'none';
    }
};

const fillCockpitKPIs = (agenturData) => {
    const bestand = agenturData?.bestand ?? 0;
    const neugeschaeft = agenturData?.neugeschaeft ?? 0;
    const storno = agenturData?.storno ?? 0;

    setElementText('cockpitBestand', formatCurrency(bestand));
    const bestandTrend = (Math.random() * 10 - 2).toFixed(1);
    const cockpitBestandTrend = document.getElementById('cockpitBestandTrend');
    if (cockpitBestandTrend) {
        cockpitBestandTrend.textContent = `${bestandTrend > 0 ? '+' : ''}${bestandTrend}%`;
        cockpitBestandTrend.className = `cockpit-kpi-trend ${parseFloat(bestandTrend) >= 0 ? 'positive' : 'negative'}`;
    }

    setElementText('cockpitNeugeschaeft', formatCurrency(neugeschaeft));
    const ngTrend = (Math.random() * 15 + 5).toFixed(1);
    const cockpitNeugeschaeftTrend = document.getElementById('cockpitNeugeschaeftTrend');
    if (cockpitNeugeschaeftTrend) {
        cockpitNeugeschaeftTrend.textContent = `+${ngTrend}%`;
        cockpitNeugeschaeftTrend.className = 'cockpit-kpi-trend positive';
    }

    setElementText('cockpitStorno', `${storno.toFixed(1)}%`);
    const stornoTrend = (Math.random() * 2 - 1).toFixed(1);
    const cockpitStornoTrend = document.getElementById('cockpitStornoTrend');
    if (cockpitStornoTrend) {
        cockpitStornoTrend.textContent = `${stornoTrend > 0 ? '+' : ''}${stornoTrend}%`;
        cockpitStornoTrend.className = `cockpit-kpi-trend ${parseFloat(stornoTrend) <= 0 ? 'positive' : 'negative'}`;
    }

    const zielerfuellung = Math.min(100, Math.floor(50 + Math.random() * 60));
    setElementText('cockpitZiel', `${zielerfuellung}%`);
    const gaugeFill = document.querySelector('#cockpitZielGauge .gauge-fill');
    if (gaugeFill) gaugeFill.style.width = `${zielerfuellung}%`;
};

const fillStammdaten = (agentur, agenturData) => {
    setElementText('agenturId', agentur.id);
    setElementText('agenturName', agentur.name ?? '-');
    setElementText('agenturAdresse', generateAddress(agenturData?.bundesland ?? 'Deutschland'));
    setElementText('agenturTelefon', generatePhone());
    setElementText('agenturEmail', generateEmail(agentur.name));
    setElementText('agenturTyp', 'Einfirmenvertreter');
    setElementText('agenturEintritt', generateEintrittsdatum());

    setElementText('agenturHierarchie', 'OD Süd → RD Bayern → VD München');
    setElementText('agenturVorgesetzter', 'Thomas Schneider (VD)');
    setElementText('agenturRegion', agenturData?.bundesland ?? 'Bayern');
    setElementText('agenturSilo', agenturData?.silo ?? 'Ausschließlichkeit');
    setElementText('agenturStufe', calculateAgenturstufe(agenturData?.neugeschaeft ?? 0));

    const ihkNr = 'D-' + Math.random().toString().substr(2, 8) + '-' + Math.floor(Math.random() * 99);
    setElementText('agenturIHK', ihkNr);
    setElementText('agenturVermittlerStatus', 'Gebundener Vermittler (§34d Abs. 7 GewO)');
    setElementText('agenturProduktfreigaben', 'Leben, Kranken, Schaden, Kfz');

    const weiterbildung = document.getElementById('agenturWeiterbildung');
    if (weiterbildung) {
        const hours = Math.floor(Math.random() * 6) + 12;
        weiterbildung.textContent = hours >= 15 ? 'Erfüllt' : `${hours}/15h`;
        weiterbildung.className = `stammdaten-value status-badge ${hours >= 15 ? 'active' : 'warning'}`;
    }

    setElementText('agenturProvModell', 'Staffelprovision (5-12%)');
    setElementText('agenturBonus', 'Jahresbonus 2025 aktiv');
    setElementText('agenturStornohaftung', '60 Monate (Leben), 36 Monate (Sach)');
    setElementText('agenturExklusiv', '100% Exklusiv');
};

const fillNeugeschaeftTab = (agenturData) => {
    const ng = agenturData?.neugeschaeft ?? 0;
    const antraege = Math.floor(ng / 5000) + Math.floor(Math.random() * 20);
    const policiert = Math.floor(antraege * (0.75 + Math.random() * 0.2));
    const abschlussquote = antraege > 0 ? (policiert / antraege * 100) : 0;
    const durchschnitt = policiert > 0 ? ng / policiert : 0;
    const crossSelling = 20 + Math.floor(Math.random() * 30);

    setElementText('ngAntraege', antraege.toLocaleString('de-DE'));
    setElementText('ngPoliciert', formatCurrency(ng));
    setElementText('ngAPE', formatCurrency(ng * 0.8));
    setElementText('ngAbschlussquote', `${abschlussquote.toFixed(1)}%`);
    setElementText('ngDurchschnitt', formatCurrency(durchschnitt));
    setElementText('ngCrossSelling', `${crossSelling}%`);

    const spartenContainer = document.getElementById('spartenNeugeschaeft');
    if (spartenContainer) {
        const sparten = [
            { name: 'Leben', value: 35 + Math.random() * 15, class: 'leben' },
            { name: 'Kranken', value: 20 + Math.random() * 10, class: 'kranken' },
            { name: 'Schaden', value: 25 + Math.random() * 10, class: 'schaden' },
            { name: 'Kfz', value: 10 + Math.random() * 10, class: 'kfz' }
        ];

        spartenContainer.innerHTML = sparten.map(s => `
            <div class="sparten-bar-item">
                <div class="sparten-bar-label">${s.name}</div>
                <div class="sparten-bar-track">
                    <div class="sparten-bar-fill ${s.class}" style="width: ${s.value}%">${s.value.toFixed(0)}%</div>
                </div>
            </div>
        `).join('');
    }
};

const fillBestandTab = (agenturData) => {
    const bestand = agenturData?.bestand ?? 0;
    const vertraege = Math.floor(bestand / 2000) + Math.floor(Math.random() * 100);
    const kunden = Math.floor(vertraege / 2.3);
    const dichte = vertraege > 0 && kunden > 0 ? (vertraege / kunden).toFixed(1) : '0';
    const wachstum = (Math.random() * 15 - 3).toFixed(1);

    setElementText('bestandGWP', formatCurrency(bestand));
    setElementText('bestandVertraege', vertraege.toLocaleString('de-DE'));
    setElementText('bestandWachstum', `${wachstum > 0 ? '+' : ''}${wachstum}%`);
    setElementText('bestandKunden', kunden.toLocaleString('de-DE'));
    setElementText('bestandDichte', dichte);
};

const fillStornoTab = (agenturData) => {
    const stornoGesamt = agenturData?.storno ?? 8;
    const stornoFrueh = (stornoGesamt * 0.4).toFixed(1);
    const stornoSpaet = (stornoGesamt * 0.6).toFixed(1);
    const nettoEntwicklung = (agenturData?.neugeschaeft ?? 0) - ((agenturData?.bestand ?? 0) * stornoGesamt / 100);

    setElementText('stornoFrueh', `${stornoFrueh}%`);
    setElementText('stornoSpaet', `${stornoSpaet}%`);
    setElementText('stornoNetto', formatCurrency(nettoEntwicklung));

    const gruendeContainer = document.getElementById('stornoGruende');
    if (gruendeContainer) {
        const gruende = [
            { name: 'Preis / zu teuer', count: Math.floor(Math.random() * 30) + 20 },
            { name: 'Wettbewerber', count: Math.floor(Math.random() * 20) + 15 },
            { name: 'Leistung nicht zufrieden', count: Math.floor(Math.random() * 15) + 10 },
            { name: 'Finanzielle Gründe', count: Math.floor(Math.random() * 15) + 8 },
            { name: 'Kein Bedarf mehr', count: Math.floor(Math.random() * 10) + 5 }
        ];

        gruendeContainer.innerHTML = gruende.map(g => `
            <div class="storno-reason-item">
                <span class="storno-reason-name">${g.name}</span>
                <span class="storno-reason-count">${g.count}</span>
            </div>
        `).join('');
    }
};

const fillProvisionTab = (agenturData) => {
    const ng = agenturData?.neugeschaeft ?? 0;
    const provision = ng * 0.08;
    const haftung = ng * 0.02;
    const bonus = Math.floor(40 + Math.random() * 50);
    const deckung = agenturData?.deckungsbeitrag ?? ng * 0.15;

    setElementText('provAnspruch', formatCurrency(provision));
    setElementText('provHaftung', formatCurrency(haftung));
    setElementText('provBonus', `${bonus}%`);
    setElementText('provDeckung', formatCurrency(deckung));
};

const fillQualitaetTab = (agenturData) => {
    const nps = agenturData?.nps ?? 42;
    const beschwerden = (Math.random() * 3).toFixed(1);
    const doku = Math.floor(85 + Math.random() * 13);
    const underwriting = agenturData?.underwriting ?? 86;

    setElementText('qualNPS', nps.toFixed(0));
    setElementText('qualBeschwerden', beschwerden);

    const iddElement = document.getElementById('qualIDD');
    if (iddElement) {
        iddElement.textContent = 'Konform';
        iddElement.className = 'kpi-detail-value status-badge active';
    }

    const schulung = Math.floor(12 + Math.random() * 5);
    setElementText('qualSchulung', `${schulung}/15h`);
    setElementText('qualDoku', `${doku}%`);
    setElementText('qualUnderwriting', `${underwriting.toFixed(0)}%`);
};

// ========================================
// MAIN FUNCTIONS
// ========================================

export const showAgenturTab = (tabName) => {
    document.querySelectorAll('.agentur-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.agentur-tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`.agentur-tab[onclick="showAgenturTab('${tabName}')"]`)?.classList.add('active');
    document.getElementById(`tab-${tabName}`)?.classList.add('active');
};

const loadAgenturData = (vermittlerId) => {

    const agenturen = window.getAgenturen?.() ?? [];
    const agentur = agenturen.find(a => a.id === vermittlerId);

    if (!agentur) {
        console.error('[ERROR] Agentur nicht gefunden:', vermittlerId);
        alert('Agentur nicht gefunden: ' + vermittlerId);
        backFromAgentur();
        return;
    }

    const agenturData = window.getAgenturData?.(vermittlerId) ?? null;

    fillHeader(agentur, agenturData);
    fillCockpitKPIs(agenturData);
    fillStammdaten(agentur, agenturData);
    fillNeugeschaeftTab(agenturData);
    fillBestandTab(agenturData);
    fillStornoTab(agenturData);
    fillProvisionTab(agenturData);
    fillQualitaetTab(agenturData);

    showAgenturTab('stammdaten');
};

export const showAgenturOverview = (vermittlerId) => {

    const pages = ['landingPage', 'mainApp', 'billingCheckPage', 'potentialAnalysePage', 'kundenDetailPage'];
    pages.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'block';

    loadAgenturData(vermittlerId);
};

export const backFromAgentur = () => {
    const landingPage = document.getElementById('landingPage');
    const agenturOverview = document.getElementById('agenturOverview');

    if (landingPage) landingPage.style.display = 'flex';
    if (agenturOverview) agenturOverview.style.display = 'none';
};

// ========================================
// BILLING CHECK
// ========================================

export const openBillingCheck = () => {
    ['landingPage', 'mainApp', 'agenturOverview'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const billingCheckPage = document.getElementById('billingCheckPage');
    if (billingCheckPage) billingCheckPage.style.display = 'block';
};

export const closeBillingCheck = () => {
    const landingPage = document.getElementById('landingPage');
    const billingCheckPage = document.getElementById('billingCheckPage');

    if (landingPage) landingPage.style.display = 'flex';
    if (billingCheckPage) billingCheckPage.style.display = 'none';
};

// ========================================
// FIDA FUNCTIONS
// ========================================

export const filterFidaCases = (status) => {

    document.querySelectorAll('.fida-filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.fida-filter-btn[onclick="filterFidaCases('${status}')"]`)?.classList.add('active');

    const tableBody = document.getElementById('fidaCasesTableBody');
    if (!tableBody) return;

    tableBody.querySelectorAll('tr').forEach(row => {
        const rowStatus = row.getAttribute('data-status');
        row.style.display = (status === 'alle' || rowStatus === status) ? '' : 'none';
    });
};

export const openKundenDetailFromFida = (kundenId) => {
    window.openKundenDetail?.(kundenId);
};

// ========================================
// WINDOW EXPORTS
// ========================================

Object.assign(window, {
    showAgenturOverview,
    showAgenturTab,
    backFromAgentur,
    openBillingCheck,
    closeBillingCheck,
    filterFidaCases,
    openKundenDetailFromFida
});

