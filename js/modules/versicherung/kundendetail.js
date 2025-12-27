/**
 * Versicherung Kundendetail Module
 * ES6 Module for customer detail page (ES2024)
 */

// ========================================
// STATE
// ========================================

let fidaActiveInPotentialAnalyse = false;
let currentVermittlerMode = 'makler';

// ========================================
// OPEN/CLOSE
// ========================================

export function openKundenDetail(kundenName, vermittlerId) {

    const fidaContainer = document.getElementById('fidaContainer');
    fidaActiveInPotentialAnalyse = fidaContainer?.style.display === 'block';

    document.getElementById('landingPage')?.style.setProperty('display', 'none');
    document.getElementById('mainApp')?.style.setProperty('display', 'none');
    document.getElementById('potentialAnalysePage')?.style.setProperty('display', 'none');
    document.getElementById('agenturOverview')?.style.setProperty('display', 'none');

    const kundenDetail = document.getElementById('kundenDetailPage');
    if (kundenDetail) {
        kundenDetail.style.display = 'block';
        kundenDetail.classList.remove('makler-view', 'ao-view');
        kundenDetail.classList.add(currentVermittlerMode === 'makler' ? 'makler-view' : 'ao-view');
        fillKundenDetail(kundenName, vermittlerId);
        initKundenFidaState();
    }
}

export function closeKundenDetail() {
    document.getElementById('kundenDetailPage')?.style.setProperty('display', 'none');
    document.getElementById('potentialAnalysePage')?.style.setProperty('display', 'block');
}

// ========================================
// FIDA STATE
// ========================================

export function initKundenFidaState() {
    const fidaDaten = document.getElementById('kundenFidaDaten');
    const fidaBtn = document.getElementById('kundenFidaBtn');

    if (fidaActiveInPotentialAnalyse) {
        if (fidaDaten) fidaDaten.style.display = 'block';
        if (fidaBtn) {
            fidaBtn.classList.add('active');
            fidaBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> Open Finance aktiv';
        }
    } else {
        if (fidaDaten) fidaDaten.style.display = 'none';
        if (fidaBtn) {
            fidaBtn.classList.remove('active');
            fidaBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> Open Finance';
        }
    }
}

export function toggleKundenFida() {
    switchKundenTab('fida');
}

// ========================================
// VERMITTLER MODE
// ========================================

export function switchVermittlerMode(mode) {
    currentVermittlerMode = mode;

    document.querySelectorAll('.toggle-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) btn.classList.add('active');
    });

    const label = document.getElementById('produktvorschlaegeLabel');
    if (label) {
        label.textContent = mode === 'makler'
            ? 'Top-Produktvorschläge (Makler-Vergleich)'
            : 'ERGO Produktempfehlung (Ausschließlichkeit)';
    }

    const maklerProdukte = document.getElementById('maklerProdukte');
    const aoProdukte = document.getElementById('aoProdukte');

    if (maklerProdukte && aoProdukte) {
        maklerProdukte.style.display = mode === 'makler' ? 'flex' : 'none';
        aoProdukte.style.display = mode === 'makler' ? 'none' : 'flex';
    }

    updateOpenFinanceTable(mode);

    const kundenDetailPage = document.getElementById('kundenDetailPage');
    if (kundenDetailPage) {
        kundenDetailPage.classList.remove('makler-view', 'ao-view');
        kundenDetailPage.classList.add(`${mode}-view`);
    }
}

export function updateOpenFinanceTable(mode) {

    document.querySelectorAll('tr[data-anbieter="ergo"]').forEach(row => {
        row.style.display = mode === 'ao' ? 'none' : '';
    });

    const sourceTag = document.querySelector('.fida-source-tag');
    if (sourceTag) {
        sourceTag.textContent = mode === 'ao'
            ? 'Allianz, HUK24, ARAG (ohne ERGO)'
            : 'Allianz, ERGO, HUK24, ARAG';
    }
}

// ========================================
// TAB NAVIGATION
// ========================================

export function switchKundenTab(tabName) {
    document.querySelectorAll('.kunden-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.kunden-tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`.kunden-tab[data-tab="${tabName}"]`)?.classList.add('active');

    const tabContent = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    tabContent?.classList.add('active');

}

export function toggleImpulsDetail(impulsId) {
    const detailElement = document.getElementById(impulsId);
    if (detailElement) {
        const isVisible = detailElement.style.display !== 'none';
        detailElement.style.display = isVisible ? 'none' : 'block';

        const parentItem = detailElement.previousElementSibling;
        const expandIcon = parentItem?.querySelector('.impuls-expand');
        if (expandIcon) {
            expandIcon.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }
}

export function viewKommunikation(kommId) {

    const kommunikationen = {
        'email-1': {
            typ: 'E-Mail', datum: '28.11.2025, 09:15',
            betreff: 'Kfz-Versicherung: Ihr Vertrag läuft aus',
            inhalt: 'Ihr Kfz-Vertrag bei der Allianz läuft am 31.12.2025 aus...',
            status: 'Geöffnet am 28.11.2025, 14:32'
        },
        'brief-1': {
            typ: 'Brief', datum: '15.11.2025',
            betreff: 'Open Finance Datenfreigabe: Neue Potentiale erkannt',
            inhalt: 'Vielen Dank für Ihre Open Finance Datenfreigabe...',
            status: 'Versendet'
        },
        'call-1': {
            typ: 'Telefonat', datum: '10.11.2025, 11:20',
            betreff: 'Rückruf wegen Altersvorsorge-Angebot',
            inhalt: 'Kunde rief zurück wegen Brief vom 15.11...',
            status: 'Termin: 12.12.2025'
        }
    };

    const komm = kommunikationen[kommId];
    if (komm) {
        alert(`${komm.typ} vom ${komm.datum}\n\nBetreff: ${komm.betreff}\n\n${komm.inhalt}\n\nStatus: ${komm.status}`);
    }
}

// ========================================
// FILL DETAIL
// ========================================

const mockKunden = {
    'Peter Schmidt': {
        geburtsdatum: '15.03.1985',
        adresse: 'Musterstraße 123, 12345 Musterstadt',
        telefon: '+49 123 456789',
        email: 'peter.schmidt@email.de',
        beruf: 'Angestellter',
        familienstand: 'Verheiratet',
        kinder: [{ name: 'Lena', alter: 8 }, { name: 'Paul', alter: 5 }],
        vertraege: [
            { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.500/Mon.', praemie: '€89/Mon.', beginn: '01.03.2018', status: 'Aktiv' },
            { typ: 'Wohngebäudeversicherung', versicherer: 'VHV', details: 'Vers.-Summe: €450.000', praemie: '€450/Jahr', beginn: '15.06.2019', status: 'Aktiv' }
        ],
        fidaVertraege: [
            { anbieter: 'Sparkasse', typ: 'Girokonto', info: 'Hauptkonto' },
            { anbieter: 'ING DiBa', typ: 'Tagesgeld', info: 'Sparkonto' },
            { anbieter: 'DWS', typ: 'Depot', info: 'Fondssparen' }
        ]
    },
    'Sabine König': {
        geburtsdatum: '08.11.1979',
        adresse: 'Lindenweg 7, 60329 Frankfurt',
        telefon: '+49 69 7654321',
        email: 'sabine.koenig@email.de',
        beruf: 'Lehrerin',
        familienstand: 'Geschieden',
        kinder: [{ name: 'Max', alter: 12 }],
        vertraege: [
            { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.800/Mon.', praemie: '€95/Mon.', beginn: '01.09.2015', status: 'Aktiv' }
        ],
        fidaVertraege: [
            { anbieter: 'Volksbank', typ: 'Girokonto', info: 'Gehaltskonto' },
            { anbieter: 'DKB', typ: 'Tagesgeld', info: 'Notgroschen' }
        ]
    },
    'Thomas Weber': {
        geburtsdatum: '25.04.1990',
        adresse: 'Bergstraße 22, 80331 München',
        telefon: '+49 89 1234567',
        email: 'thomas.weber@email.de',
        beruf: 'Software-Entwickler',
        familienstand: 'Ledig',
        kinder: [],
        vertraege: [
            { typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Single, €50 Mio. Deckung', praemie: '€65/Jahr', beginn: '01.03.2021', status: 'Aktiv' }
        ],
        fidaVertraege: [
            { anbieter: 'N26', typ: 'Girokonto', info: 'Hauptkonto' },
            { anbieter: 'Trade Republic', typ: 'Depot', info: 'ETF-Sparplan' }
        ]
    },
    'Anna Hoffmann': {
        geburtsdatum: '12.07.1988',
        adresse: 'Rosenweg 45, 50678 Köln',
        telefon: '+49 221 9876543',
        email: 'anna.hoffmann@email.de',
        beruf: 'Marketing-Managerin',
        familienstand: 'Verheiratet',
        kinder: [{ name: 'Sophie', alter: 4 }],
        vertraege: [
            { typ: 'Risikolebensversicherung', versicherer: 'ERGO', details: 'Vers.-Summe: €300.000', praemie: '€25/Mon.', beginn: '01.06.2020', status: 'Aktiv' },
            { typ: 'Privathaftpflichtversicherung', versicherer: 'HUK24', details: 'Familie, €50 Mio. Deckung', praemie: '€85/Jahr', beginn: '01.01.2019', status: 'Aktiv' }
        ],
        fidaVertraege: [
            { anbieter: 'Commerzbank', typ: 'Girokonto', info: 'Gehaltskonto' },
            { anbieter: 'Comdirect', typ: 'Depot', info: 'Aktien-Portfolio' }
        ]
    },
    'Christian Bauer': {
        geburtsdatum: '03.09.1975',
        adresse: 'Hauptstraße 112, 70173 Stuttgart',
        telefon: '+49 711 5551234',
        email: 'christian.bauer@email.de',
        beruf: 'Ingenieur',
        familienstand: 'Verheiratet',
        kinder: [{ name: 'Tim', alter: 14 }, { name: 'Jana', alter: 11 }],
        vertraege: [
            { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Allianz', details: 'BU-Rente: €2.500/Mon.', praemie: '€145/Mon.', beginn: '01.04.2012', status: 'Aktiv' },
            { typ: 'Kapitallebensversicherung', versicherer: 'ERGO', details: 'Ablauf 2030, €120.000', praemie: '€200/Mon.', beginn: '01.01.2005', status: 'Aktiv' }
        ],
        fidaVertraege: [
            { anbieter: 'BW-Bank', typ: 'Girokonto', info: 'Hauptkonto' },
            { anbieter: 'Union Investment', typ: 'Depot', info: 'Fondssparplan' },
            { anbieter: 'Bausparkasse Schwäbisch Hall', typ: 'Bausparvertrag', info: '€50.000' }
        ]
    },
    'Eva Hartmann': {
        geburtsdatum: '21.02.1992',
        adresse: 'Gartenstraße 8, 20095 Hamburg',
        telefon: '+49 40 3334567',
        email: 'eva.hartmann@email.de',
        beruf: 'Ärztin',
        familienstand: 'Ledig',
        kinder: [],
        vertraege: [
            { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €3.000/Mon.', praemie: '€180/Mon.', beginn: '01.08.2020', status: 'Aktiv' },
            { typ: 'Private Krankenversicherung', versicherer: 'Debeka', details: 'Vollversicherung Ärzte-Tarif', praemie: '€650/Mon.', beginn: '01.01.2021', status: 'Aktiv' }
        ],
        fidaVertraege: [
            { anbieter: 'Deutsche Bank', typ: 'Girokonto', info: 'Gehaltskonto' },
            { anbieter: 'Scalable Capital', typ: 'Depot', info: 'Vermögensaufbau' }
        ]
    },
    'Klaus Meier': {
        geburtsdatum: '17.11.1968',
        adresse: 'Waldweg 23, 30159 Hannover',
        telefon: '+49 511 7778899',
        email: 'klaus.meier@email.de',
        beruf: 'Geschäftsführer',
        familienstand: 'Verheiratet',
        kinder: [{ name: 'Markus', alter: 22 }, { name: 'Lisa', alter: 19 }],
        vertraege: [
            { typ: 'Kapitallebensversicherung', versicherer: 'ERGO', details: 'Ablauf 2028, €200.000', praemie: '€350/Mon.', beginn: '01.03.2003', status: 'Aktiv' },
            { typ: 'Private Rentenversicherung', versicherer: 'Allianz', details: 'Rentenbeginn 2033', praemie: '€400/Mon.', beginn: '01.06.2010', status: 'Aktiv' }
        ],
        fidaVertraege: [
            { anbieter: 'Sparkasse Hannover', typ: 'Girokonto', info: 'Geschäftskonto' },
            { anbieter: 'Deutsche Bank', typ: 'Depot', info: 'Aktien & Fonds' },
            { anbieter: 'ING', typ: 'Tagesgeld', info: 'Rücklage' }
        ]
    },
    'Lisa Müller': {
        geburtsdatum: '29.05.1995',
        adresse: 'Sonnenscheinweg 15, 40213 Düsseldorf',
        telefon: '+49 211 8889900',
        email: 'lisa.mueller@email.de',
        beruf: 'Grafikdesignerin',
        familienstand: 'Ledig',
        kinder: [],
        vertraege: [
            { typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Single, €50 Mio. Deckung', praemie: '€55/Jahr', beginn: '01.09.2018', status: 'Aktiv' },
            { typ: 'Hausratversicherung', versicherer: 'HUK-Coburg', details: 'Vers.-Summe: €40.000', praemie: '€95/Jahr', beginn: '01.11.2019', status: 'Aktiv' }
        ],
        fidaVertraege: [
            { anbieter: 'N26', typ: 'Girokonto', info: 'Hauptkonto' },
            { anbieter: 'Trade Republic', typ: 'Depot', info: 'ETF-Sparplan' }
        ]
    },
    'Martin Wolf': {
        geburtsdatum: '08.03.1982',
        adresse: 'Industriestraße 77, 90403 Nürnberg',
        telefon: '+49 911 2223344',
        email: 'martin.wolf@email.de',
        beruf: 'Selbstständiger Handwerker',
        familienstand: 'Verheiratet',
        kinder: [{ name: 'Leon', alter: 7 }, { name: 'Mia', alter: 3 }],
        vertraege: [
            { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €2.000/Mon.', praemie: '€125/Mon.', beginn: '01.02.2015', status: 'Aktiv' },
            { typ: 'Betriebshaftpflichtversicherung', versicherer: 'HDI', details: 'Handwerkerbetrieb', praemie: '€480/Jahr', beginn: '01.05.2014', status: 'Aktiv' }
        ],
        fidaVertraege: [
            { anbieter: 'Volksbank', typ: 'Girokonto', info: 'Geschäftskonto' },
            { anbieter: 'Sparkasse', typ: 'Girokonto', info: 'Privatkonto' }
        ]
    },
    'Matthias Engel': {
        geburtsdatum: '14.10.1978',
        adresse: 'Parkallee 33, 04109 Leipzig',
        telefon: '+49 341 5556677',
        email: 'matthias.engel@email.de',
        beruf: 'IT-Consultant',
        familienstand: 'Geschieden',
        kinder: [{ name: 'Felix', alter: 10 }],
        vertraege: [
            { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €2.200/Mon.', praemie: '€135/Mon.', beginn: '01.07.2016', status: 'Aktiv' },
            { typ: 'Risikolebensversicherung', versicherer: 'CosmosDirekt', details: 'Vers.-Summe: €250.000', praemie: '€18/Mon.', beginn: '01.03.2018', status: 'Aktiv' }
        ],
        fidaVertraege: [
            { anbieter: 'Commerzbank', typ: 'Girokonto', info: 'Hauptkonto' },
            { anbieter: 'DekaBank', typ: 'Depot', info: 'Fondssparplan' }
        ]
    },
    'Michael Braun': {
        geburtsdatum: '22.06.1972',
        adresse: 'Am Stadtpark 5, 60322 Frankfurt',
        telefon: '+49 69 1112233',
        email: 'michael.braun@email.de',
        beruf: 'Bankdirektor',
        familienstand: 'Verheiratet',
        kinder: [{ name: 'Alexander', alter: 18 }, { name: 'Victoria', alter: 16 }],
        vertraege: [
            { typ: 'Private Krankenversicherung', versicherer: 'DKV', details: 'Premium-Tarif', praemie: '€850/Mon.', beginn: '01.01.2010', status: 'Aktiv' },
            { typ: 'Private Rentenversicherung', versicherer: 'ERGO', details: 'Rentenbeginn 2037', praemie: '€500/Mon.', beginn: '01.04.2015', status: 'Aktiv' },
            { typ: 'Wohngebäudeversicherung', versicherer: 'AXA', details: 'Vers.-Summe: €850.000', praemie: '€680/Jahr', beginn: '01.08.2012', status: 'Aktiv' }
        ],
        fidaVertraege: [
            { anbieter: 'Deutsche Bank', typ: 'Girokonto', info: 'Premium-Konto' },
            { anbieter: 'DWS', typ: 'Depot', info: 'Vermögensverwaltung' },
            { anbieter: 'Deka', typ: 'Depot', info: 'Fondssparplan' }
        ]
    }
};

export function fillKundenDetail(kundenName, vermittlerId) {
    const kunde = mockKunden[kundenName] ?? mockKunden['Peter Schmidt'];

    const nameEl = document.getElementById('kundenName');
    if (nameEl) nameEl.textContent = kundenName;

    const idEl = document.getElementById('kundenVermittlerId');
    if (idEl) idEl.textContent = vermittlerId;

    document.getElementById('kundenGeburtsdatum')?.replaceChildren(document.createTextNode(kunde.geburtsdatum));
    document.getElementById('kundenAdresse')?.replaceChildren(document.createTextNode(kunde.adresse));
    document.getElementById('kundenTelefon')?.replaceChildren(document.createTextNode(kunde.telefon));
    document.getElementById('kundenEmail')?.replaceChildren(document.createTextNode(kunde.email));
    document.getElementById('kundenBeruf')?.replaceChildren(document.createTextNode(kunde.beruf));
    document.getElementById('kundenFamilienstand')?.replaceChildren(document.createTextNode(kunde.familienstand));

    const kinderList = document.getElementById('kundenKinder');
    if (kinderList) {
        kinderList.innerHTML = kunde.kinder.length > 0
            ? kunde.kinder.map(k => `<span class="kinder-badge">${k.name} (${k.alter} Jahre)</span>`).join('')
            : '<span class="no-children">Keine Kinder</span>';
    }

    const vertraegeBody = document.getElementById('kundenVertraege');
    if (vertraegeBody) {
        vertraegeBody.innerHTML = kunde.vertraege.map(v => `
            <tr>
                <td><strong>${v.typ}</strong></td>
                <td class="makler-only-col">${v.versicherer ?? ''}</td>
                <td>${v.details ?? ''}</td>
                <td>${v.praemie}</td>
                <td>${v.beginn ?? ''}</td>
                <td><span class="status-badge aktiv">${v.status}</span></td>
            </tr>
        `).join('');
    }

    const fidaBody = document.getElementById('kundenFidaVertraege');
    if (fidaBody) {
        fidaBody.innerHTML = kunde.fidaVertraege.map(v => `
            <tr>
                <td>${v.anbieter}</td>
                <td>${v.typ}</td>
                <td>${v.info}</td>
            </tr>
        `).join('');
    }
}
