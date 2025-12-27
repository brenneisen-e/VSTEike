/**
 * Banken Customer Module
 * ES6 Module for customer details, CRM, activities
 */

// ========================================
// STATE
// ========================================

let currentCustomerId = null;
let stammdatenEditMode = false;

// ========================================
// HELPER FUNCTIONS
// ========================================

function generateCustomerFactors(customer) {
    const factors = [];

    // Negative factors
    if (customer.dpd > 60) {
        factors.push({ type: 'negative', name: `Hoher Verzug (${customer.dpd} DPD)`, impact: '-30 Punkte' });
    } else if (customer.dpd > 30) {
        factors.push({ type: 'negative', name: `Moderater Verzug (${customer.dpd} DPD)`, impact: '-15 Punkte' });
    }

    if (customer.mahnstufe >= 3) {
        factors.push({ type: 'negative', name: `${customer.mahnstufe} Mahnungen ohne Reaktion`, impact: '-20 Punkte' });
    }

    if (customer.branche && (customer.branche.includes('Gastronomie') || customer.branche.includes('Restaurant'))) {
        factors.push({ type: 'negative', name: 'Branchenrisiko: Gastronomie', impact: '-15 Punkte' });
    }

    if (customer.willingness < 40) {
        factors.push({ type: 'negative', name: 'Geringe Zahlungsbereitschaft erkennbar', impact: '-25 Punkte' });
    }

    // Positive factors
    if (customer.willingness >= 70) {
        factors.push({ type: 'positive', name: 'Hohe Kooperationsbereitschaft', impact: '+20 Punkte' });
    }

    if (customer.ability >= 70) {
        factors.push({ type: 'positive', name: 'Gute Zahlungsfähigkeit', impact: '+15 Punkte' });
    }

    if (customer.type === 'Privat' && customer.branche && customer.branche.includes('Angestellt')) {
        factors.push({ type: 'positive', name: 'Stabiles Einkommen (Angestellter)', impact: '+10 Punkte' });
    }

    if (customer.type === 'Privat' && customer.branche && customer.branche.includes('Beamt')) {
        factors.push({ type: 'positive', name: 'Sichere Einkommensquelle (Beamter)', impact: '+15 Punkte' });
    }

    if (customer.dpd <= 14) {
        factors.push({ type: 'positive', name: 'Neuer Fall mit kurzer Verzugsdauer', impact: '+10 Punkte' });
    }

    return factors.slice(0, 5); // Max 5 factors
}

function generateProductTransactions(product, customer) {
    const produktTyp = product.typ.toLowerCase();
    const saldo = product.saldo || 0;
    const rate = product.rate || customer.monatsrate || 0;
    const limit = product.limit || 0;
    const dpd = customer.dpd || 0;

    // For Dispo/Kontokorrent: Show account movements
    if (produktTyp.includes('dispo') || produktTyp.includes('kontokorrent')) {
        const istUeberLimit = saldo > limit;
        const ueberLimitBetrag = istUeberLimit ? saldo - limit : 0;
        const rows = [];

        if (istUeberLimit) {
            rows.push(`<tr class="highlight-row">
                <td>16.12.2025</td>
                <td>Überschreitung Dispolimit</td>
                <td class="negative">-€${ueberLimitBetrag.toLocaleString('de-DE')}</td>
                <td class="negative">€${saldo.toLocaleString('de-DE')}</td>
                <td><span class="tx-badge danger">Über Limit</span></td>
            </tr>`);
        }

        rows.push(`<tr>
            <td>15.12.2025</td>
            <td>Gehaltseingang</td>
            <td class="positive">+€${(customer.einkommenMonatlich || 3200).toLocaleString('de-DE')}</td>
            <td>€${(saldo - (customer.einkommenMonatlich || 3200) + 500).toLocaleString('de-DE')}</td>
            <td><span class="tx-badge success">Eingang</span></td>
        </tr>`);

        rows.push(`<tr>
            <td>10.12.2025</td>
            <td>Lastschrift Stadtwerke</td>
            <td class="negative">-€285,00</td>
            <td>€${(saldo + 285).toLocaleString('de-DE')}</td>
            <td><span class="tx-badge">Gebucht</span></td>
        </tr>`);

        return rows.join('');
    }

    // For Ratenkredit: Show monthly payments
    if (produktTyp.includes('ratenkredit') || produktTyp.includes('baufinanzierung')) {
        const ueberfaelligClass = dpd > 0 ? 'highlight-row' : '';
        const ueberfaelligBadge = dpd > 0 ? '<span class="tx-badge danger">Überfällig</span>' : '<span class="tx-badge">Gebucht</span>';
        return `
            <tr class="${ueberfaelligClass}">
                <td>01.12.2025</td>
                <td>Monatliche Rate - Fällig</td>
                <td class="negative">-€${rate.toLocaleString('de-DE')}</td>
                <td>€${saldo.toLocaleString('de-DE')}</td>
                <td>${ueberfaelligBadge}</td>
            </tr>
            <tr>
                <td>01.11.2025</td>
                <td>Monatliche Rate</td>
                <td class="positive">+€${rate.toLocaleString('de-DE')}</td>
                <td>€${(saldo + rate).toLocaleString('de-DE')}</td>
                <td><span class="tx-badge">Gebucht</span></td>
            </tr>
        `;
    }

    // Default: Keep existing
    return '';
}

// ========================================
// CUSTOMER DATA (Demo)
// ========================================

const customerDatabase = {
    // ========================================
    // VOLLSTÄNDIGE KUNDENDATEN (Zahlungseingänge, News-Bereich)
    // Mit transaktionen[], produkte[], haushalt{}, openFinance{}
    // ========================================
    'K-2024-0001': {
        // Stammdaten
        name: 'Mueller GmbH', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Musterstraße 123, 38100 Braunschweig', telefon: '+49 531 123456',
        email: 'info@mueller-gmbh.de', ansprechpartner: 'Hans Mueller',
        branche: 'Gastronomie', restschuld: 125000, status: 'Inkasso',
        // Konten & Finanzen
        krediteAnzahl: 3, gesamtforderung: 350500, monatsrate: 2380, ueberfaellig: 4760,
        rueckgabequote: 34, hauptforderung: 110000, zinsen: 8450, mahngebuehren: 350, inkassokosten: 6200,
        dpd: 35,
        // Einkommen & Ausgaben (Gewerbe)
        einkommenMonatlich: 45000, ausgabenMonatlich: 52000, ausgabenDetails: 'Personal: €28.000, Miete: €8.500, Wareneinkauf: €12.000, Sonstiges: €3.500',
        // KI-Analyse
        willingness: 25, ability: 60, segment: 'eskalation',
        kernproblem: 'Gewerbekunde mit Liquiditätsengpässen seit Q3 2025. Gastronomie-Branche mit saisonalen Schwankungen. Monatliche Ausgaben (€52.000) übersteigen Einnahmen (€45.000) um €7.000. Mehrfache Lastschriftrückgaben trotz grundsätzlicher Zahlungsfähigkeit.',
        // Kommunikation
        workflowStatus: 'Inkasso-Verfahren', mahnstufe: 3,
        // Transaktionshistorie für diesen Kunden (Inkasso)
        transaktionen: [
            { datum: '14.11.2025', beschreibung: 'Monatliche Rate - Fällig', betrag: -2380, status: 'ueberfaellig' },
            { datum: '14.10.2025', beschreibung: 'Monatliche Rate - Fällig', betrag: -2380, status: 'ueberfaellig' },
            { datum: '18.09.2025', beschreibung: 'Lastschrift zurückgebucht', betrag: -2380, status: 'rueckgabe' },
            { datum: '01.09.2025', beschreibung: 'Teilzahlung', betrag: 1500, status: 'gebucht' },
            { datum: '15.08.2025', beschreibung: 'Lastschrift zurückgebucht', betrag: -2380, status: 'rueckgabe' }
        ],
        produkte: [
            { typ: 'Betriebsmittelkredit', nummer: 'BMK-2023-1001', saldo: 125000, status: '35 DPD', badge: 'danger' },
            { typ: 'Kontokorrentkredit', nummer: 'KKK-2024-2345', saldo: 85000, status: 'Überzogen', badge: 'danger' },
            { typ: 'Investitionskredit', nummer: 'IK-2022-0891', saldo: 140500, status: '28 DPD', badge: 'warning' }
        ],
        // Haushaltsrechnung (Gewerbe)
        haushalt: {
            einnahmen: { gehalt: 45000, neben: 0, sozial: 0, sonstige: 0 },
            fixkosten: { miete: 8500, nebenkosten: 2200, versicherung: 1800, kredite: 2380, abos: 450 },
            lebenshaltung: { essen: 0, mobilitaet: 3500, gesundheit: 0, freizeit: 0, sonstige: 33170 }
        },
        // Open Finance Daten
        openFinance: {
            consent: { psd2: true, psd2Bis: '15.03.2026', versicherungen: false, investments: false },
            externeKonten: [
                { institut: 'Sparkasse Braunschweig', produkt: 'Geschäftskonto', saldo: -12500, rate: 0, status: 'Überzogen' },
                { institut: 'Deutsche Bank', produkt: 'Leasing Küchengeräte', saldo: 28000, rate: 850, status: 'Aktiv' }
            ],
            externeVersicherungen: [
                { anbieter: 'Allianz', produkt: 'Betriebshaftpflicht', beitrag: 320, beginn: '01.01.2020', hinweis: '' },
                { anbieter: 'Signal Iduna', produkt: 'Inhaltsversicherung', beitrag: 180, beginn: '15.06.2018', hinweis: '' }
            ]
        }
    },
    'K-2024-7234': {
        name: 'Braun, Thomas', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Lindenweg 45, 30159 Hannover', telefon: '+49 511 987654',
        email: 't.braun@email.de', ansprechpartner: 'Thomas Braun',
        branche: 'Angestellter', restschuld: 289350, status: 'Aktiv',
        statusBadge: 'warning', statusText: 'Überfällige Forderung beglichen am 16.12.2025',
        krediteAnzahl: 3, gesamtforderung: 289350, monatsrate: 1765, ueberfaellig: 0,
        rueckgabequote: 0, hauptforderung: 289350, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
        dpd: 0, willingness: 90, ability: 85, segment: 'stabil',
        // Letzte Zahlung (für Zahlungseingänge-Widget)
        letzteZahlung: { betrag: 1890, datum: '16.12.2025', typ: 'Ratenkredit Tilgung' },
        // Einkommen & Ausgaben (Privat)
        einkommenMonatlich: 4200, ausgabenMonatlich: 3800, ausgabenDetails: 'Miete: €0 (Eigentum), Baufi-Rate: €1.450, Auto: €650, Versicherungen: €380, Lebensmittel: €520, Sonstiges: €800',
        kernproblem: 'Ratenkredit vollständig beglichen (€1.890 am 16.12.). Nettoeinkommen €4.200, Ausgaben €3.800. Baufinanzierung €285.000 Restschuld mit €1.450/M Rate. Dispo €4.500 ausgeschöpft.',
        workflowStatus: 'Monitoring', mahnstufe: 0,
        // Transaktionshistorie - passend zu den Produkten
        transaktionen: [
            { datum: '16.12.2025', beschreibung: 'Ratenkredit vollständig getilgt', betrag: 1890, status: 'gebucht' },
            { datum: '01.12.2025', beschreibung: 'Baufinanzierung Monatsrate', betrag: 1450, status: 'gebucht' },
            { datum: '01.11.2025', beschreibung: 'Baufinanzierung Monatsrate', betrag: 1450, status: 'gebucht' },
            { datum: '01.10.2025', beschreibung: 'Ratenkredit Rate', betrag: 315, status: 'gebucht' }
        ],
        produkte: [
            { typ: 'Ratenkredit', nummer: 'RK-2023-8841', saldo: 0, status: 'Beglichen', badge: 'success', letzteZahlung: 1890 },
            { typ: 'Dispositionskredit', nummer: 'DK-2024-1122', saldo: 4500, limit: 10000, status: 'Aktiv', badge: 'warning' },
            { typ: 'Baufinanzierung', nummer: 'BF-2021-5567', saldo: 285000, rate: 1450, status: 'Aktiv', badge: 'info' }
        ],
        // Haushaltsrechnung (Privat - Angestellter)
        haushalt: {
            einnahmen: { gehalt: 4200, neben: 0, sozial: 0, sonstige: 0 },
            fixkosten: { miete: 0, nebenkosten: 380, versicherung: 380, kredite: 1450, abos: 85 },
            lebenshaltung: { essen: 520, mobilitaet: 650, gesundheit: 45, freizeit: 180, sonstige: 110 }
        },
        // Open Finance Daten
        openFinance: {
            consent: { psd2: true, psd2Bis: '15.12.2026', versicherungen: true, investments: false },
            externeKonten: [
                { institut: 'ING DiBa', produkt: 'Extra-Konto (Tagesgeld)', saldo: 8500, rate: 0, status: 'Aktiv' }
            ],
            externeVersicherungen: [
                { anbieter: 'HUK-Coburg', produkt: 'KFZ-Versicherung', beitrag: 68, beginn: '01.03.2022', hinweis: '' },
                { anbieter: 'ERGO', produkt: 'Hausratversicherung', beitrag: 18, beginn: '01.07.2021', hinweis: '' },
                { anbieter: 'Debeka', produkt: 'Risikolebensversicherung', beitrag: 35, beginn: '15.01.2020', hinweis: 'Zur Baufinanzierung' }
            ]
        }
    },
    'K-2024-6891': {
        name: 'Klein KG', type: 'Gewerbe', rechtsform: 'KG',
        adresse: 'Industriestraße 78, 40210 Düsseldorf', telefon: '+49 211 456789',
        email: 'info@klein-kg.de', ansprechpartner: 'Peter Klein',
        branche: 'Großhandel', restschuld: 0, status: 'Bezahlt',
        statusBadge: 'success', statusText: 'Ratenvereinbarung erfüllt am 19.12.2025',
        krediteAnzahl: 2, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
        rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
        dpd: 0, willingness: 85, ability: 75, segment: 'abgeschlossen',
        // Letzte Zahlung (für Zahlungseingänge-Widget)
        letzteZahlung: { betrag: 3400, datum: '19.12.2025', typ: 'Ratenvereinbarung' },
        // Einkommen & Ausgaben (Gewerbe)
        einkommenMonatlich: 125000, ausgabenMonatlich: 98000, ausgabenDetails: 'Personal: €42.000, Lager: €15.000, Transport: €28.000, Verwaltung: €8.000, Sonstiges: €5.000',
        kernproblem: 'Fall abgeschlossen. Letzte Rate €3.400 heute eingegangen (Ratenvereinbarung). Beide Kredite vollständig getilgt. Gute Bonität für Folgegeschäft.',
        workflowStatus: 'Abgeschlossen', mahnstufe: 0,
        produkte: [
            { typ: 'Betriebsmittelkredit', nummer: 'BMK-2022-4456', saldo: 0, status: 'Beglichen', badge: 'success', letzteZahlung: 3400 },
            { typ: 'Investitionskredit', nummer: 'IK-2021-7823', saldo: 0, status: 'Beglichen', badge: 'success' }
        ],
        // Haushaltsrechnung (Gewerbe - Großhandel)
        haushalt: {
            einnahmen: { gehalt: 125000, neben: 0, sozial: 0, sonstige: 0 },
            fixkosten: { miete: 15000, nebenkosten: 3500, versicherung: 4200, kredite: 0, abos: 1800 },
            lebenshaltung: { essen: 0, mobilitaet: 28000, gesundheit: 0, freizeit: 0, sonstige: 45500 }
        },
        // Open Finance Daten
        openFinance: {
            consent: { psd2: true, psd2Bis: '01.06.2026', versicherungen: true, investments: false },
            externeKonten: [
                { institut: 'Volksbank Düsseldorf', produkt: 'Geschäftskonto', saldo: 45000, rate: 0, status: 'Aktiv' }
            ],
            externeVersicherungen: [
                { anbieter: 'Gothaer', produkt: 'Geschäftsinhaltsvers.', beitrag: 450, beginn: '01.04.2019', hinweis: '' },
                { anbieter: 'AXA', produkt: 'Transportversicherung', beitrag: 680, beginn: '15.02.2020', hinweis: '' }
            ]
        }
    },
    'K-2024-6234': {
        name: 'Fischer, Maria', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Rosenstraße 12, 50667 Köln', telefon: '+49 221 334455',
        email: 'm.fischer@web.de', ansprechpartner: 'Maria Fischer',
        branche: 'Rentnerin', restschuld: 3200, status: 'Aktiv',
        statusBadge: 'warning', statusText: 'Teilzahlung €780 eingegangen am 18.12.2025',
        krediteAnzahl: 2, gesamtforderung: 3200, monatsrate: 180, ueberfaellig: 0,
        rueckgabequote: 75, hauptforderung: 3200, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
        dpd: 0, willingness: 80, ability: 50, segment: 'stabil',
        // Letzte Zahlung (für Zahlungseingänge-Widget)
        letzteZahlung: { betrag: 780, datum: '18.12.2025', typ: 'Teilzahlung' },
        // Einkommen & Ausgaben (Privat - Rentnerin)
        einkommenMonatlich: 1450, ausgabenMonatlich: 1380, ausgabenDetails: 'Miete: €520, Lebensmittel: €280, Medikamente: €95, Versicherungen: €145, Enkel-Geschenke: €120, Sonstiges: €220',
        kernproblem: 'Teilzahlung €780 gestern eingegangen. Kreditkartenschuld beglichen. Ratenkredit (€3.200) noch offen mit €180/Monat Rate. Knappe Rente €1.450, Ausgaben €1.380. Hohe Kooperationsbereitschaft.',
        // Transaktionshistorie
        transaktionen: [
            { datum: '18.12.2025', beschreibung: 'Kreditkarte vollständig beglichen', betrag: 780, status: 'gebucht' },
            { datum: '01.12.2025', beschreibung: 'Ratenkredit Rate', betrag: 180, status: 'gebucht' },
            { datum: '01.11.2025', beschreibung: 'Ratenkredit Rate', betrag: 180, status: 'gebucht' },
            { datum: '01.10.2025', beschreibung: 'Ratenkredit Rate', betrag: 180, status: 'gebucht' }
        ],
        workflowStatus: 'Monitoring', mahnstufe: 0,
        produkte: [
            { typ: 'Kreditkarte', nummer: 'KK-2023-6678', saldo: 0, status: 'Beglichen', badge: 'success', letzteZahlung: 780 },
            { typ: 'Ratenkredit', nummer: 'RK-2024-1234', saldo: 3200, status: 'Aktiv', badge: 'warning' }
        ],
        // Haushaltsrechnung (Privat - Rentnerin)
        haushalt: {
            einnahmen: { gehalt: 1450, neben: 0, sozial: 0, sonstige: 0 },
            fixkosten: { miete: 520, nebenkosten: 85, versicherung: 145, kredite: 180, abos: 35 },
            lebenshaltung: { essen: 280, mobilitaet: 45, gesundheit: 95, freizeit: 25, sonstige: 40 }
        },
        // Open Finance Daten
        openFinance: {
            consent: { psd2: true, psd2Bis: '01.09.2026', versicherungen: false, investments: false },
            externeKonten: [
                { institut: 'Sparkasse Köln', produkt: 'Sparkonto', saldo: 3200, rate: 0, status: 'Aktiv' }
            ],
            externeVersicherungen: []
        }
    },
    'K-2024-5982': {
        name: 'Meier, Stefan', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Hauptstraße 56, 80331 München', telefon: '+49 89 112233',
        email: 's.meier@gmx.de', ansprechpartner: 'Stefan Meier',
        branche: 'Selbstständig', restschuld: 0, status: 'Bezahlt',
        statusBadge: 'success', statusText: 'Dispo vollständig ausgeglichen',
        krediteAnzahl: 1, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
        rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
        dpd: 0, willingness: 75, ability: 70, segment: 'abgeschlossen',
        // Einkommen & Ausgaben (Selbstständig)
        einkommenMonatlich: 5800, ausgabenMonatlich: 4200, ausgabenDetails: 'Miete Büro: €800, Miete Wohnung: €1.400, Lebensmittel: €350, Betriebskosten: €650, Auto: €580, Sonstiges: €420',
        kernproblem: 'Fall vollständig abgeschlossen. Dispo ausgeglichen. Selbstständiger Grafiker mit variabler Auftragslage. Einkommen Ø €5.800, Ausgaben €4.200. Finanzpuffer jetzt wieder aufgebaut.',
        workflowStatus: 'Abgeschlossen', mahnstufe: 0,
        produkte: [
            { typ: 'Dispositionskredit', nummer: 'DK-2024-3321', saldo: 0, status: 'Ausgeglichen', badge: 'success' }
        ],
        // Haushaltsrechnung (Privat - Selbstständig)
        haushalt: {
            einnahmen: { gehalt: 5800, neben: 0, sozial: 0, sonstige: 0 },
            fixkosten: { miete: 2200, nebenkosten: 280, versicherung: 480, kredite: 0, abos: 120 },
            lebenshaltung: { essen: 350, mobilitaet: 580, gesundheit: 65, freizeit: 220, sonstige: 105 }
        },
        // Open Finance Daten
        openFinance: {
            consent: { psd2: true, psd2Bis: '15.11.2026', versicherungen: true, investments: true },
            externeKonten: [
                { institut: 'N26', produkt: 'Geschäftskonto', saldo: 4200, rate: 0, status: 'Aktiv' },
                { institut: 'Trade Republic', produkt: 'Depot', saldo: 12500, rate: 0, status: 'Aktiv' }
            ],
            externeVersicherungen: [
                { anbieter: 'Hiscox', produkt: 'Berufshaftpflicht', beitrag: 45, beginn: '01.01.2022', hinweis: '' }
            ]
        }
    },
    'K-2024-5876': {
        name: 'Schneider Logistik GmbH', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Hafenstraße 200, 20457 Hamburg', telefon: '+49 40 778899',
        email: 'info@schneider-logistik.de', ansprechpartner: 'Klaus Schneider',
        branche: 'Transport & Logistik', restschuld: 0, status: 'Bezahlt',
        statusBadge: 'success', statusText: 'Alle Kredite vollständig beglichen',
        krediteAnzahl: 3, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
        rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
        dpd: 0, willingness: 80, ability: 85, segment: 'abgeschlossen',
        // Einkommen & Ausgaben (Gewerbe)
        einkommenMonatlich: 890000, ausgabenMonatlich: 795000, ausgabenDetails: 'Personal: €320.000, Fahrzeugkosten: €185.000, Treibstoff: €142.000, Versicherungen: €78.000, Verwaltung: €45.000, Sonstiges: €25.000',
        kernproblem: 'Fall vollständig abgeschlossen. Alle 3 Kredite beglichen. Gesunde Finanzsituation: Umsatz €890.000/Monat, Kosten €795.000 = Gewinnmarge ~11%.',
        workflowStatus: 'Abgeschlossen', mahnstufe: 0,
        produkte: [
            { typ: 'Kontokorrentkredit', nummer: 'KKK-2023-5544', saldo: 0, status: 'Beglichen', badge: 'success' },
            { typ: 'Betriebsmittelkredit', nummer: 'BMK-2022-1123', saldo: 0, status: 'Beglichen', badge: 'success' },
            { typ: 'Leasing LKW-Flotte', nummer: 'LK-2021-8890', saldo: 0, status: 'Beglichen', badge: 'success' }
        ],
        // Haushaltsrechnung (Gewerbe - Transport & Logistik)
        haushalt: {
            einnahmen: { gehalt: 890000, neben: 0, sozial: 0, sonstige: 0 },
            fixkosten: { miete: 45000, nebenkosten: 18000, versicherung: 78000, kredite: 0, abos: 8500 },
            lebenshaltung: { essen: 0, mobilitaet: 327000, gesundheit: 0, freizeit: 0, sonstige: 318500 }
        },
        // Open Finance Daten
        openFinance: {
            consent: { psd2: true, psd2Bis: '01.08.2026', versicherungen: true, investments: false },
            externeKonten: [
                { institut: 'Deutsche Bank', produkt: 'Firmenkonto', saldo: 185000, rate: 0, status: 'Aktiv' },
                { institut: 'Commerzbank', produkt: 'Kreditlinie', saldo: 0, rate: 0, status: 'Ungenutzt' }
            ],
            externeVersicherungen: [
                { anbieter: 'Zurich', produkt: 'Flottenversicherung', beitrag: 4500, beginn: '01.01.2019', hinweis: '45 Fahrzeuge' },
                { anbieter: 'HDI', produkt: 'Betriebshaftpflicht', beitrag: 1200, beginn: '15.03.2018', hinweis: '' }
            ]
        }
    },
    'K-2024-5734': {
        name: 'Fischer, Anna', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Gartenweg 8, 70173 Stuttgart', telefon: '+49 711 223344',
        email: 'a.fischer@outlook.de', ansprechpartner: 'Anna Fischer',
        branche: 'Beamtin', restschuld: 0, status: 'Bezahlt',
        statusBadge: 'success', statusText: 'Kreditkarte beglichen',
        krediteAnzahl: 1, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
        rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
        dpd: 0, willingness: 95, ability: 90, segment: 'abgeschlossen',
        // Einkommen & Ausgaben (Beamtin A12)
        einkommenMonatlich: 3450, ausgabenMonatlich: 2680, ausgabenDetails: 'Miete: €950, Lebensmittel: €380, Auto: €420, Versicherungen: €280, Sparen: €400, Sonstiges: €250',
        kernproblem: 'Fall abgeschlossen. Beamtin mit sicherem Einkommen (€3.450 netto) hat Kreditkarte vollständig beglichen. Solide Finanzführung mit €770 monatl. Überschuss.',
        workflowStatus: 'Abgeschlossen', mahnstufe: 0,
        produkte: [
            { typ: 'Kreditkarte', nummer: 'KK-2024-4421', saldo: 0, status: 'Beglichen', badge: 'success' }
        ],
        // Haushaltsrechnung (Privat - Beamtin)
        haushalt: {
            einnahmen: { gehalt: 3450, neben: 0, sozial: 0, sonstige: 0 },
            fixkosten: { miete: 950, nebenkosten: 120, versicherung: 280, kredite: 0, abos: 65 },
            lebenshaltung: { essen: 380, mobilitaet: 420, gesundheit: 35, freizeit: 180, sonstige: 250 }
        },
        // Open Finance Daten
        openFinance: {
            consent: { psd2: true, psd2Bis: '01.10.2026', versicherungen: true, investments: true },
            externeKonten: [
                { institut: 'BW-Bank', produkt: 'Sparkonto', saldo: 18500, rate: 0, status: 'Aktiv' },
                { institut: 'DKB', produkt: 'Tagesgeld', saldo: 5200, rate: 0, status: 'Aktiv' }
            ],
            externeVersicherungen: [
                { anbieter: 'Debeka', produkt: 'Private Krankenvers.', beitrag: 180, beginn: '01.01.2018', hinweis: 'Beihilfeergänzung' },
                { anbieter: 'R+V', produkt: 'Hausratversicherung', beitrag: 12, beginn: '01.05.2020', hinweis: '' }
            ]
        }
    },
    'K-2024-5612': {
        name: 'Bäckerei Müller', type: 'Gewerbe', rechtsform: 'Einzelunternehmen',
        adresse: 'Marktplatz 3, 60311 Frankfurt', telefon: '+49 69 445566',
        email: 'info@baeckerei-mueller.de', ansprechpartner: 'Werner Müller',
        branche: 'Lebensmittel / Gastronomie', restschuld: 0, status: 'Bezahlt',
        statusBadge: 'success', statusText: 'Investitionskredit vollständig getilgt',
        krediteAnzahl: 1, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
        rueckgabequote: 100, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
        dpd: 0, willingness: 85, ability: 80, segment: 'abgeschlossen',
        // Einkommen & Ausgaben (Bäckerei)
        einkommenMonatlich: 38000, ausgabenMonatlich: 34500, ausgabenDetails: 'Personal: €14.000, Rohstoffe: €9.500, Miete: €3.200, Energie: €2.800, Sonstiges: €5.000',
        kernproblem: 'Fall abgeschlossen. Bäckerei mit stabilem Umsatz (€38.000/Monat) hat Investitionskredit nach Restrukturierung vollständig getilgt. Gewinnmarge ~9%.',
        workflowStatus: 'Abgeschlossen', mahnstufe: 0,
        produkte: [
            { typ: 'Investitionskredit', nummer: 'IK-2022-3345', saldo: 0, status: 'Getilgt', badge: 'success' }
        ],
        // Haushaltsrechnung (Gewerbe - Bäckerei)
        haushalt: {
            einnahmen: { gehalt: 38000, neben: 0, sozial: 0, sonstige: 0 },
            fixkosten: { miete: 3200, nebenkosten: 2800, versicherung: 580, kredite: 0, abos: 320 },
            lebenshaltung: { essen: 9500, mobilitaet: 850, gesundheit: 0, freizeit: 0, sonstige: 17250 }
        },
        // Open Finance Daten
        openFinance: {
            consent: { psd2: true, psd2Bis: '15.07.2026', versicherungen: false, investments: false },
            externeKonten: [
                { institut: 'Frankfurter Sparkasse', produkt: 'Geschäftskonto', saldo: 12400, rate: 0, status: 'Aktiv' }
            ],
            externeVersicherungen: []
        }
    },
    'K-2024-8847': {
        name: 'Müller, Hans', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Waldstraße 22, 38100 Braunschweig', telefon: '+49 531 998877',
        email: 'h.mueller@email.de', ansprechpartner: 'Hans Müller',
        branche: 'Angestellter', restschuld: 4230, status: 'Offen',
        krediteAnzahl: 1, gesamtforderung: 4230, monatsrate: 180, ueberfaellig: 180,
        rueckgabequote: 0, hauptforderung: 4000, zinsen: 180, mahngebuehren: 50, inkassokosten: 0,
        dpd: 18, willingness: 85, ability: 70, segment: 'prioritaet',
        zahlungsziel: '01.12.2025',
        // Zahlungszusage aus Telefonat
        zahlungszusage: { betrag: 180, datum: '23.12.2025', status: 'offen', vereinbart: '17.12.2025', notiz: 'Kunde zahlt überfällige Dezember-Rate (€180) nach Gehaltseingang am 23.12.' },
        // Einkommen & Ausgaben (Angestellter)
        einkommenMonatlich: 2850, ausgabenMonatlich: 2680, ausgabenDetails: 'Miete: €780, Lebensmittel: €320, Auto: €380, Versicherungen: €190, Kinder: €450, Sonstiges: €560',
        kernproblem: 'Neuer Fall - Dezember-Rate (€180) 18 Tage überfällig. Angestellter mit stabilem Einkommen €2.850. Nach Telefonat: Zahlung vergessen wegen Umzug. Zahlungszusage für 23.12.',
        workflowStatus: 'Zahlungszusage', mahnstufe: 1,
        // Transaktionshistorie für diesen Kunden
        transaktionen: [
            { datum: '01.12.2025', beschreibung: 'Monatliche Rate - Fällig', betrag: -180, status: 'ueberfaellig' },
            { datum: '01.11.2025', beschreibung: 'Monatliche Rate', betrag: 180, status: 'gebucht' },
            { datum: '01.10.2025', beschreibung: 'Monatliche Rate', betrag: 180, status: 'gebucht' },
            { datum: '01.09.2025', beschreibung: 'Monatliche Rate', betrag: 180, status: 'gebucht' }
        ],
        produkte: [
            { typ: 'Ratenkredit', nummer: 'RK-2024-7782', saldo: 4230, status: '18 DPD', badge: 'warning' }
        ],
        // Haushaltsrechnung (Privat - Angestellter)
        haushalt: {
            einnahmen: { gehalt: 2850, neben: 0, sozial: 450, sonstige: 0 },
            fixkosten: { miete: 780, nebenkosten: 145, versicherung: 190, kredite: 180, abos: 55 },
            lebenshaltung: { essen: 320, mobilitaet: 380, gesundheit: 40, freizeit: 120, sonstige: 640 }
        },
        // Open Finance Daten
        openFinance: {
            consent: { psd2: true, psd2Bis: '01.11.2026', versicherungen: false, investments: false },
            externeKonten: [
                { institut: 'Sparkasse Braunschweig', produkt: 'Girokonto', saldo: 450, rate: 0, status: 'Aktiv' }
            ],
            externeVersicherungen: []
        }
    },
    'K-2024-8846': {
        name: 'Schmidt GmbH', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Berliner Allee 100, 30175 Hannover', telefon: '+49 511 665544',
        email: 'info@schmidt-gmbh.de', ansprechpartner: 'Michael Schmidt',
        branche: 'IT-Dienstleistungen', restschuld: 12890, status: 'Offen',
        krediteAnzahl: 2, gesamtforderung: 12890, monatsrate: 650, ueberfaellig: 650,
        rueckgabequote: 0, hauptforderung: 12000, zinsen: 640, mahngebuehren: 150, inkassokosten: 100,
        dpd: 18, willingness: 75, ability: 80, segment: 'prioritaet',
        zahlungsziel: '01.12.2025',
        // Zahlungszusage nach Kundenkontakt
        zahlungszusage: { betrag: 650, datum: '27.12.2025', status: 'offen', vereinbart: '16.12.2025', notiz: 'GF Schmidt: Großprojekt wird am 23.12. abgerechnet, überfällige Rate (€650) wird nach Zahlungseingang vom Kunden beglichen.' },
        // Einkommen & Ausgaben (IT-Dienstleister)
        einkommenMonatlich: 95000, ausgabenMonatlich: 82000, ausgabenDetails: 'Personal: €52.000, Miete/Büro: €8.500, Software-Lizenzen: €6.500, Marketing: €4.000, Sonstiges: €11.000',
        kernproblem: 'Aktiver Fall seit 01.12. - Dezember-Rate (€650) 18 Tage überfällig. Zahlungszusage bis 27.12. (nach Projektabrechnung). IT-Dienstleister mit gutem Umsatz. Gute Bonität.',
        workflowStatus: 'Zahlungszusage', mahnstufe: 2,
        // Transaktionshistorie für diesen Kunden
        transaktionen: [
            { datum: '01.12.2025', beschreibung: 'Monatliche Rate KKK - Fällig', betrag: -650, status: 'ueberfaellig' },
            { datum: '01.11.2025', beschreibung: 'Monatliche Rate KKK', betrag: 650, status: 'gebucht' },
            { datum: '15.10.2025', beschreibung: 'Tilgung Betriebsmittelkredit', betrag: 800, status: 'gebucht' },
            { datum: '01.10.2025', beschreibung: 'Monatliche Rate KKK', betrag: 650, status: 'gebucht' }
        ],
        produkte: [
            { typ: 'Kontokorrentkredit', nummer: 'KKK-2024-1123', saldo: 8500, status: '18 DPD', badge: 'warning' },
            { typ: 'Betriebsmittelkredit', nummer: 'BMK-2023-9945', saldo: 4390, status: 'Aktiv', badge: 'info' }
        ],
        // Haushaltsrechnung (Gewerbe - IT-Dienstleister)
        haushalt: {
            einnahmen: { gehalt: 95000, neben: 0, sozial: 0, sonstige: 0 },
            fixkosten: { miete: 8500, nebenkosten: 1200, versicherung: 2800, kredite: 650, abos: 6500 },
            lebenshaltung: { essen: 0, mobilitaet: 4000, gesundheit: 0, freizeit: 0, sonstige: 58350 }
        },
        // Open Finance Daten
        openFinance: {
            consent: { psd2: true, psd2Bis: '01.05.2026', versicherungen: true, investments: false },
            externeKonten: [
                { institut: 'Commerzbank', produkt: 'Firmenkonto', saldo: 28500, rate: 0, status: 'Aktiv' },
                { institut: 'ING', produkt: 'Tagesgeld Geschäft', saldo: 45000, rate: 0, status: 'Aktiv' }
            ],
            externeVersicherungen: [
                { anbieter: 'Hiscox', produkt: 'IT-Haftpflicht', beitrag: 380, beginn: '01.06.2020', hinweis: 'Cyber-Zusatz' },
                { anbieter: 'Allianz', produkt: 'D&O Versicherung', beitrag: 520, beginn: '01.01.2021', hinweis: '' }
            ]
        }
    },
    'K-2024-8845': {
        name: 'Weber, Anna', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Blumenweg 15, 50668 Köln', telefon: '+49 221 887766',
        email: 'a.weber@web.de', ansprechpartner: 'Anna Weber',
        branche: 'Freiberuflerin', restschuld: 2150, status: 'Offen',
        krediteAnzahl: 1, gesamtforderung: 2150, monatsrate: 120, ueberfaellig: 120,
        rueckgabequote: 0, hauptforderung: 2000, zinsen: 100, mahngebuehren: 50, inkassokosten: 0,
        dpd: 18, willingness: 70, ability: 55, segment: 'prioritaet',
        zahlungsziel: '01.12.2025',
        // Zahlungszusage - überfällige Rate
        zahlungszusage: { betrag: 120, datum: '28.12.2025', status: 'offen', vereinbart: '18.12.2025', notiz: 'Kundin zahlt überfällige Dezember-Rate (€120) am 28.12. nach Honorareingang.' },
        // Einkommen & Ausgaben (Freiberuflerin - variabel)
        einkommenMonatlich: 2400, ausgabenMonatlich: 2350, ausgabenDetails: 'Miete: €720, Lebensmittel: €290, Krankenversicherung: €420, Büro/Material: €380, Sonstiges: €540',
        kernproblem: 'Aktiver Fall seit 01.12. - Dezember-Rate (€120) 18 Tage überfällig. Zahlungszusage für 28.12. Freiberuflerin mit knappem Budget, aber kooperativ.',
        workflowStatus: 'Zahlungszusage', mahnstufe: 2,
        // Transaktionshistorie für diesen Kunden
        transaktionen: [
            { datum: '01.12.2025', beschreibung: 'Kreditkarten-Mindestbetrag - Fällig', betrag: -120, status: 'ueberfaellig' },
            { datum: '01.11.2025', beschreibung: 'Kreditkarten-Zahlung', betrag: 120, status: 'gebucht' },
            { datum: '01.10.2025', beschreibung: 'Kreditkarten-Zahlung', betrag: 120, status: 'gebucht' },
            { datum: '01.09.2025', beschreibung: 'Kreditkarten-Zahlung', betrag: 120, status: 'gebucht' }
        ],
        produkte: [
            { typ: 'Kreditkarte', nummer: 'KK-2024-5567', saldo: 2150, status: '18 DPD', badge: 'warning' }
        ],
        // Haushaltsrechnung (Privat - Freiberuflerin)
        haushalt: {
            einnahmen: { gehalt: 2400, neben: 0, sozial: 0, sonstige: 0 },
            fixkosten: { miete: 720, nebenkosten: 95, versicherung: 420, kredite: 120, abos: 45 },
            lebenshaltung: { essen: 290, mobilitaet: 180, gesundheit: 85, freizeit: 120, sonstige: 275 }
        },
        // Open Finance Daten
        openFinance: {
            consent: { psd2: true, psd2Bis: '01.12.2026', versicherungen: false, investments: false },
            externeKonten: [
                { institut: 'GLS Bank', produkt: 'Girokonto', saldo: 850, rate: 0, status: 'Aktiv' }
            ],
            externeVersicherungen: []
        }
    },

    // ========================================
    // SEGMENT-KUNDEN (für Scatter Plot, Matrix)
    // Vereinfachte Daten ohne transaktionen/produkte
    // ========================================
    'K-2024-0005': {
        name: 'Hoffmann Bau GmbH', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Industriestraße 45, 30159 Hannover', telefon: '+49 511 445566',
        email: 'info@hoffmann-bau.de', ansprechpartner: 'Werner Hoffmann',
        branche: 'Baugewerbe', restschuld: 287500, status: 'Inkasso',
        dpd: 48, willingness: 20, ability: 45, segment: 'eskalation',
        kernproblem: 'Investitionskredit für Baumaschinen. Zahlungsverweigerung trotz laufender Projekte.'
    },
    'K-2024-0006': {
        name: 'Keller, Thomas', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Bergweg 12, 38100 Braunschweig', telefon: '+49 531 776655',
        email: 't.keller@email.de', ansprechpartner: 'Thomas Keller',
        branche: 'Selbstständig', restschuld: 15800, status: 'Inkasso',
        dpd: 42, willingness: 15, ability: 55, segment: 'eskalation',
        kernproblem: 'Dispositionskredit überzogen. Kunde reagiert nicht auf Kontaktversuche.'
    },
    'K-2024-0007': {
        name: 'Autohaus Berger', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Autobahnstraße 88, 30159 Hannover', telefon: '+49 511 889900',
        email: 'info@autohaus-berger.de', ansprechpartner: 'Martin Berger',
        branche: 'Automobilhandel', restschuld: 89300, status: 'Inkasso',
        dpd: 55, willingness: 30, ability: 40, segment: 'eskalation',
        kernproblem: 'Betriebsmittelkredit. Geschäftsaufgabe droht, Zwangsvollstreckung eingeleitet.'
    },
    'K-2024-0002': {
        name: 'Schmidt, Peter', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Hauptstraße 78, 30159 Hannover', telefon: '+49 511 223344',
        email: 'p.schmidt@email.de', ansprechpartner: 'Peter Schmidt',
        branche: 'Angestellter', restschuld: 8450, status: 'Offen',
        dpd: 21, willingness: 85, ability: 70, segment: 'prioritaet',
        kernproblem: 'Ratenkredit. Kunde ist kooperativ und hat Zahlungsbereitschaft signalisiert.'
    },
    'K-2024-0008': {
        name: 'Lehmann, Sandra', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Sonnenweg 33, 38100 Braunschweig', telefon: '+49 531 334455',
        email: 's.lehmann@email.de', ansprechpartner: 'Sandra Lehmann',
        branche: 'Angestellte', restschuld: 12650, status: 'Offen',
        dpd: 18, willingness: 90, ability: 75, segment: 'prioritaet',
        kernproblem: 'Autokredit. Kurzzeitige finanzielle Engpässe, Gehaltszahlung verspätet.'
    },
    'K-2024-0009': {
        name: 'Meier Elektro OHG', type: 'Gewerbe', rechtsform: 'OHG',
        adresse: 'Elektrostraße 10, 30159 Hannover', telefon: '+49 511 556677',
        email: 'info@meier-elektro.de', ansprechpartner: 'Klaus Meier',
        branche: 'Elektrohandwerk', restschuld: 34200, status: 'Offen',
        dpd: 25, willingness: 80, ability: 65, segment: 'prioritaet',
        kernproblem: 'Kontokorrent. Saisonale Schwankungen, Zahlungszusage für nächste Woche.'
    },
    'K-2024-0010': {
        name: 'Fischer, Hans', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Talstraße 56, 38100 Braunschweig', telefon: '+49 531 445566',
        email: 'h.fischer@email.de', ansprechpartner: 'Hans Fischer',
        branche: 'Beamter', restschuld: 6890, status: 'Zusage',
        dpd: 12, willingness: 95, ability: 80, segment: 'prioritaet',
        kernproblem: 'Ratenkredit. Zahlungszusage erteilt, wartet auf Gehaltseingang.'
    },
    'K-2024-0003': {
        name: 'Weber KG', type: 'Gewerbe', rechtsform: 'KG',
        adresse: 'Fabrikweg 9, 30159 Hannover', telefon: '+49 511 998877',
        email: 'info@weber-kg.de', ansprechpartner: 'Michael Weber',
        branche: 'Maschinenbau', restschuld: 45780, status: 'Vereinbarung',
        dpd: 14, willingness: 70, ability: 35, segment: 'restrukturierung',
        kernproblem: 'Kontokorrent. Liquiditätsengpass durch Forderungsausfälle, Ratenzahlung vereinbart.'
    },
    'K-2024-0011': {
        name: 'Bäckerei Schulze', type: 'Gewerbe', rechtsform: 'e.K.',
        adresse: 'Brotgasse 5, 38100 Braunschweig', telefon: '+49 531 667788',
        email: 'info@baeckerei-schulze.de', ansprechpartner: 'Gerhard Schulze',
        branche: 'Bäckerei', restschuld: 67400, status: 'Vereinbarung',
        dpd: 28, willingness: 75, ability: 30, segment: 'restrukturierung',
        kernproblem: 'Betriebsmittelkredit. Steigende Energiekosten, Stundungsvereinbarung aktiv.'
    },
    'K-2024-0012': {
        name: 'Neumann, Klaus', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Parkstraße 100, 30159 Hannover', telefon: '+49 511 112233',
        email: 'k.neumann@email.de', ansprechpartner: 'Klaus Neumann',
        branche: 'Angestellter', restschuld: 156000, status: 'Vereinbarung',
        dpd: 8, willingness: 85, ability: 25, segment: 'restrukturierung',
        kernproblem: 'Baufinanzierung. Jobverlust, Ratenpause für 6 Monate genehmigt.'
    },
    'K-2024-0013': {
        name: 'Gasthaus zum Löwen', type: 'Gewerbe', rechtsform: 'GmbH & Co. KG',
        adresse: 'Marktplatz 1, 38100 Braunschweig', telefon: '+49 531 223344',
        email: 'info@gasthaus-loewen.de', ansprechpartner: 'Ernst Löwe',
        branche: 'Gastronomie', restschuld: 112800, status: 'Vereinbarung',
        dpd: 19, willingness: 65, ability: 40, segment: 'restrukturierung',
        kernproblem: 'Investitionskredit. Post-Corona-Erholung, Tilgungsstreckung vereinbart.'
    },
    'K-2024-0004': {
        name: 'Braun, Maria', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Waldweg 23, 30159 Hannover', telefon: '+49 511 445566',
        email: 'm.braun@email.de', ansprechpartner: 'Maria Braun',
        branche: 'Arbeitslos', restschuld: 3210, status: 'Abschreibung',
        dpd: 67, willingness: 15, ability: 10, segment: 'abwicklung',
        kernproblem: 'Kreditkartenschuld. Privatinsolvenz beantragt, keine Zahlungsfähigkeit.'
    },
    'K-2024-0014': {
        name: 'Werner, Sabine', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Rosenweg 45, 30159 Hannover', telefon: '+49 511 778899',
        email: 's.werner@email.de', ansprechpartner: 'Sabine Werner',
        branche: 'Rentnerin', restschuld: 4560, status: 'Abschreibung',
        dpd: 92, willingness: 10, ability: 5, segment: 'abwicklung',
        kernproblem: 'Ratenkredit. Forderungsverkauf an Inkassobüro vorbereitet.'
    },
    'K-2024-0015': {
        name: 'Maier Transporte', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Logistikweg 100, 38100 Braunschweig', telefon: '+49 531 990011',
        email: 'info@maier-transporte.de', ansprechpartner: 'Josef Maier',
        branche: 'Spedition', restschuld: 78900, status: 'Abschreibung',
        dpd: 78, willingness: 20, ability: 15, segment: 'abwicklung',
        kernproblem: 'Leasingvertrag. Insolvenzverfahren eröffnet, Verwertung der Fahrzeuge.'
    },
    'K-2024-0016': {
        name: 'Zimmermann, Frank', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Eichenstraße 77, 30159 Hannover', telefon: '+49 511 223355',
        email: 'f.zimmermann@email.de', ansprechpartner: 'Frank Zimmermann',
        branche: 'Arbeitslos', restschuld: 2340, status: 'Abschreibung',
        dpd: 105, willingness: 5, ability: 5, segment: 'abwicklung',
        kernproblem: 'Kreditkarte. Unbekannt verzogen, keine Kontaktmöglichkeit.'
    },

    // ========================================
    // AUFGABEN-KUNDEN (aus section-aufgaben.html)
    // ========================================
    'K-2024-0022': {
        name: 'Huber Metallbau', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Werkstraße 15, 38100 Braunschweig', telefon: '+49 531 112244',
        email: 'info@huber-metallbau.de', ansprechpartner: 'Karl Huber',
        branche: 'Metallverarbeitung', restschuld: 34500, status: 'Offen',
        dpd: 28, willingness: 65, ability: 55, segment: 'restrukturierung',
        kernproblem: 'Betriebsmittelkredit. Telefonat zur Ratenzahlung geplant.'
    },
    'K-2024-0031': {
        name: 'Becker, Ursula', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Ahornweg 8, 30159 Hannover', telefon: '+49 511 334466',
        email: 'u.becker@email.de', ansprechpartner: 'Ursula Becker',
        branche: 'Rentnerin', restschuld: 5670, status: 'Offen',
        dpd: 45, willingness: 40, ability: 30, segment: 'restrukturierung',
        kernproblem: 'Ratenkredit. 2. Mahnung versenden erforderlich.'
    },
    'K-2024-0044': {
        name: 'Krause Transport', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Speditionsweg 22, 38100 Braunschweig', telefon: '+49 531 556699',
        email: 'info@krause-transport.de', ansprechpartner: 'Heinz Krause',
        branche: 'Spedition', restschuld: 89000, status: 'Inkasso',
        dpd: 62, willingness: 20, ability: 35, segment: 'eskalation',
        kernproblem: 'Leasingvertrag. Dokumente zur Zwangsvollstreckung prüfen.'
    },
    'K-2024-0052': {
        name: 'Scholz, Marion', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Birkenstraße 44, 30159 Hannover', telefon: '+49 511 778822',
        email: 'm.scholz@email.de', ansprechpartner: 'Marion Scholz',
        branche: 'Selbstständig', restschuld: 12300, status: 'Vereinbarung',
        dpd: 15, willingness: 80, ability: 45, segment: 'restrukturierung',
        kernproblem: 'Dispositionskredit. Stundungsvereinbarung verlängern.'
    },
    'K-2024-0067': {
        name: 'Autoservice Lange', type: 'Gewerbe', rechtsform: 'e.K.',
        adresse: 'Werkstattstr. 5, 38100 Braunschweig', telefon: '+49 531 998811',
        email: 'info@autoservice-lange.de', ansprechpartner: 'Werner Lange',
        branche: 'Kfz-Werkstatt', restschuld: 45600, status: 'Offen',
        dpd: 33, willingness: 55, ability: 50, segment: 'restrukturierung',
        kernproblem: 'Investitionskredit. Rückruf des Kunden ausstehend.'
    },
    'K-2024-0078': {
        name: 'Friedrich, Klaus', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Ulmenweg 12, 30159 Hannover', telefon: '+49 511 443355',
        email: 'k.friedrich@email.de', ansprechpartner: 'Klaus Friedrich',
        branche: 'Angestellter', restschuld: 7890, status: 'Zusage',
        dpd: 22, willingness: 85, ability: 70, segment: 'prioritaet',
        kernproblem: 'Ratenkredit. Zahlungszusage für nächste Woche dokumentieren.'
    },
    'K-2024-0085': {
        name: 'Gaststätte Zum Anker', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Hafenstraße 1, 38100 Braunschweig', telefon: '+49 531 667799',
        email: 'info@zum-anker.de', ansprechpartner: 'Rolf Ankermann',
        branche: 'Gastronomie', restschuld: 78500, status: 'Vereinbarung',
        dpd: 41, willingness: 60, ability: 35, segment: 'restrukturierung',
        kernproblem: 'Betriebsmittelkredit. Tilgungsplan aktualisieren.'
    },
    'K-2024-0091': {
        name: 'Vogel, Ingrid', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Finkenweg 7, 30159 Hannover', telefon: '+49 511 889944',
        email: 'i.vogel@email.de', ansprechpartner: 'Ingrid Vogel',
        branche: 'Beamtin', restschuld: 3450, status: 'Offen',
        dpd: 18, willingness: 90, ability: 85, segment: 'prioritaet',
        kernproblem: 'Kreditkarte. Erinnerungsanruf durchführen.'
    },
    'K-2024-0103': {
        name: 'Hartmann Elektro', type: 'Gewerbe', rechtsform: 'OHG',
        adresse: 'Stromweg 33, 38100 Braunschweig', telefon: '+49 531 223366',
        email: 'info@hartmann-elektro.de', ansprechpartner: 'Georg Hartmann',
        branche: 'Elektrohandwerk', restschuld: 56700, status: 'Inkasso',
        dpd: 55, willingness: 25, ability: 40, segment: 'eskalation',
        kernproblem: 'Kontokorrent. Inkasso-Übergabe vorbereiten.'
    },
    'K-2024-0112': {
        name: 'Schröder, Helmut', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Kastanienallee 19, 30159 Hannover', telefon: '+49 511 556688',
        email: 'h.schroeder@email.de', ansprechpartner: 'Helmut Schröder',
        branche: 'Rentner', restschuld: 8900, status: 'Offen',
        dpd: 35, willingness: 50, ability: 40, segment: 'restrukturierung',
        kernproblem: 'Ratenkredit. Restrukturierungsangebot erstellen.'
    },
    'K-2024-0119': {
        name: 'Druckerei Sommer', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Druckweg 8, 38100 Braunschweig', telefon: '+49 531 778899',
        email: 'info@druckerei-sommer.de', ansprechpartner: 'Rita Sommer',
        branche: 'Druckerei', restschuld: 123000, status: 'Inkasso',
        dpd: 78, willingness: 15, ability: 25, segment: 'abwicklung',
        kernproblem: 'Investitionskredit. Forderungsverkauf prüfen.'
    },
    'K-2024-0127': {
        name: 'Wendt, Sabrina', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Rosenweg 23, 30159 Hannover', telefon: '+49 511 112277',
        email: 's.wendt@email.de', ansprechpartner: 'Sabrina Wendt',
        branche: 'Angestellte', restschuld: 4560, status: 'Zusage',
        dpd: 12, willingness: 95, ability: 80, segment: 'prioritaet',
        kernproblem: 'Autokredit. Zahlungseingang überwachen.'
    },
    'K-2024-0134': {
        name: 'Sanitär König', type: 'Gewerbe', rechtsform: 'e.K.',
        adresse: 'Rohrweg 11, 38100 Braunschweig', telefon: '+49 531 334488',
        email: 'info@sanitaer-koenig.de', ansprechpartner: 'Franz König',
        branche: 'Sanitär', restschuld: 34500, status: 'Vereinbarung',
        dpd: 25, willingness: 70, ability: 50, segment: 'restrukturierung',
        kernproblem: 'Betriebsmittelkredit. Ratenzahlung überwachen.'
    },
    'K-2024-0142': {
        name: 'Jansen, Petra', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Lilienstraße 5, 30159 Hannover', telefon: '+49 511 998866',
        email: 'p.jansen@email.de', ansprechpartner: 'Petra Jansen',
        branche: 'Selbstständig', restschuld: 15600, status: 'Offen',
        dpd: 42, willingness: 45, ability: 35, segment: 'restrukturierung',
        kernproblem: 'Dispositionskredit. Restrukturierung anbieten.'
    },
    'K-2024-0155': {
        name: 'Maler Stein', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Farbweg 7, 38100 Braunschweig', telefon: '+49 531 665544',
        email: 'info@maler-stein.de', ansprechpartner: 'Otto Stein',
        branche: 'Malereibetrieb', restschuld: 28900, status: 'Offen',
        dpd: 38, willingness: 55, ability: 45, segment: 'restrukturierung',
        kernproblem: 'Kontokorrent. Termin für Gespräch vereinbaren.'
    },
    'K-2024-0168': {
        name: 'Berger, Wolfgang', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Eichenplatz 3, 30159 Hannover', telefon: '+49 511 776655',
        email: 'w.berger@email.de', ansprechpartner: 'Wolfgang Berger',
        branche: 'Angestellter', restschuld: 6780, status: 'Zusage',
        dpd: 15, willingness: 90, ability: 75, segment: 'prioritaet',
        kernproblem: 'Ratenkredit. Teilzahlung bestätigen.'
    },
    'K-2024-0176': {
        name: 'Gärtnerei Blume', type: 'Gewerbe', rechtsform: 'e.K.',
        adresse: 'Blumenweg 22, 38100 Braunschweig', telefon: '+49 531 443322',
        email: 'info@gaertnerei-blume.de', ansprechpartner: 'Rosa Blume',
        branche: 'Gärtnerei', restschuld: 45000, status: 'Vereinbarung',
        dpd: 30, willingness: 65, ability: 40, segment: 'restrukturierung',
        kernproblem: 'Investitionskredit. Stundung dokumentieren.'
    },
    'K-2024-0188': {
        name: 'Koch, Andrea', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Lindenstraße 18, 30159 Hannover', telefon: '+49 511 889933',
        email: 'a.koch@email.de', ansprechpartner: 'Andrea Koch',
        branche: 'Ärztin', restschuld: 23400, status: 'Offen',
        dpd: 28, willingness: 75, ability: 65, segment: 'prioritaet',
        kernproblem: 'Praxiskredit. Kontaktaufnahme wegen Ratenzahlung.'
    }
};

export function getFullCustomerData(customerId) {
    return customerDatabase[customerId] ?? {
        name: 'Unbekannter Kunde', type: 'Unbekannt',
        adresse: '-', telefon: '-', email: '-', ansprechpartner: '-',
        branche: '-', restschuld: 0, status: '-',
        dpd: 0, willingness: 0, ability: 0, segment: 'unbekannt',
        kernproblem: 'Keine Daten verfügbar.'
    };
}

// ========================================
// CUSTOMER DETAIL MODAL
// ========================================

export function openCustomerDetail(customerId, options = {}) {
    const modal = document.getElementById('customerDetailModal');
    if (!modal) return;

    modal.style.display = 'flex';
    currentCustomerId = customerId;

    const customer = getFullCustomerData(customerId);

    const customerNameEl = document.getElementById('customerName');
    if (customerNameEl) customerNameEl.textContent = customer.name;

    const customerIdEl = modal.querySelector('.customer-id');
    if (customerIdEl) customerIdEl.textContent = customerId;

    // Update all tabs
    updateStammdatenFields(modal, customer);
    updateKontenFields(modal, customer);
    updateKommunikationFields(modal, customer);
    updateKiAnalyseFields(modal, customer);
    updateOpenFinanceFields(modal, customer);
    updateHaushaltGuvTab(customer);
    updateHaushaltFields(modal, customer);

    setTimeout(() => renderCustomerActivities(customerId), 100);

    if (options.showKommunikation) {
        showCustomerTab('kommunikation');
    } else {
        showCustomerTab('stammdaten');
    }

}

export function closeCustomerDetail() {
    const modal = document.getElementById('customerDetailModal');
    if (modal) modal.style.display = 'none';
    currentCustomerId = null;
}

export function showCustomerTab(tabName) {
    const modal = document.getElementById('customerDetailModal');
    if (!modal) return;

    // Tab buttons use .modal-tab class - match by onclick attribute content
    modal.querySelectorAll('.modal-tab').forEach(tab => {
        const onclick = tab.getAttribute('onclick') ?? '';
        const isMatch = onclick.includes(`'${tabName}'`);
        tab.classList.toggle('active', isMatch);
    });

    // Tab content uses .customer-tab class with id="tab-{name}"
    modal.querySelectorAll('.customer-tab').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabName}`);
    });
}

function updateStammdatenFields(modal, customer) {
    // Map label text to customer data fields
    const labelMapping = {
        'Firmenname:': customer.name,
        'Rechtsform:': customer.rechtsform,
        'Branche:': customer.branche,
        'Kundentyp:': customer.type,
        'Adresse:': customer.adresse,
        'Telefon Zentrale:': customer.telefon,
        'E-Mail:': customer.email,
        'Name:': customer.ansprechpartner, // Geschäftsführung
    };

    // Find all stammdaten rows and update values by label
    modal.querySelectorAll('.stammdaten-row').forEach(row => {
        const labelEl = row.querySelector('.label');
        const valueEl = row.querySelector('.value');
        if (!labelEl || !valueEl) return;

        const labelText = labelEl.textContent.trim();
        if (labelMapping[labelText] !== undefined) {
            valueEl.textContent = labelMapping[labelText] ?? '-';
        }
    });

    // Update Kundentyp badge if present
    const typeBadge = modal.querySelector('.value.badge');
    if (typeBadge && customer.type) {
        typeBadge.textContent = customer.type === 'Gewerbe' ? 'Gewerbekunde' : 'Privatkunde';
        typeBadge.classList.remove('gewerbe', 'privat');
        typeBadge.classList.add(customer.type === 'Gewerbe' ? 'gewerbe' : 'privat');
    }
}

function updateKontenFields(modal, customer) {
    const kontenTab = document.getElementById('tab-konten');
    if (!kontenTab) {
        console.warn('[KONTEN] tab-konten element not found');
        return;
    }

    console.log('[KONTEN] Updating fields for customer:', customer.name);

    const isBezahlt = customer.status === 'Bezahlt';
    const formatEuro = (val) => '€' + (val || 0).toLocaleString('de-DE');

    // Helper to safely update element
    const updateEl = (id, value, style = null) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value;
            if (style) el.style.color = style;
        }
        return el;
    };

    // Update KPI values using IDs
    updateEl('kontenKrediteAnzahl', customer.krediteAnzahl || (isBezahlt ? 0 : 1));
    updateEl('kontenGesamtforderung', formatEuro(customer.gesamtforderung), isBezahlt ? '#22c55e' : null);
    updateEl('kontenMonatsrate', formatEuro(customer.monatsrate));
    updateEl('kontenUeberfaellig', formatEuro(customer.ueberfaellig), isBezahlt ? '#22c55e' : null);
    updateEl('kontenRueckgabequote', (customer.rueckgabequote || 0) + '%');

    // Update Forderungen breakdown
    updateEl('kontenHauptforderung', formatEuro(customer.hauptforderung));
    updateEl('kontenZinsen', formatEuro(customer.zinsen));
    updateEl('kontenMahngebuehren', formatEuro(customer.mahngebuehren));
    updateEl('kontenInkassokosten', formatEuro(customer.inkassokosten));

    // Update Einkommen & Ausgaben
    const einkommen = customer.einkommenMonatlich || 0;
    const ausgaben = customer.ausgabenMonatlich || 0;
    const differenz = einkommen - ausgaben;

    updateEl('kontenEinkommen', formatEuro(einkommen));
    updateEl('kontenAusgaben', formatEuro(ausgaben));
    updateEl('kontenDifferenz', (differenz >= 0 ? '' : '-') + formatEuro(Math.abs(differenz)),
        differenz >= 0 ? '#22c55e' : '#ef4444');
    updateEl('kontenAusgabenDetails', customer.ausgabenDetails || '-');

    // Update credit product info
    const produkte = customer.produkte || [];
    const hauptProdukt = produkte.length > 0 ? produkte[0] : null;

    const productName = kontenTab.querySelector('.credit-product-name');
    if (productName) {
        productName.textContent = hauptProdukt?.typ || (customer.type === 'Privat' ? 'Ratenkredit' : 'Betriebsmittelkredit');
    }

    const productNumber = kontenTab.querySelector('.credit-product-number');
    if (productNumber) {
        productNumber.textContent = hauptProdukt?.nummer || 'Keine Daten';
    }

    const saldoValue = kontenTab.querySelector('.amount-value.danger, .amount-value.success');
    if (saldoValue) {
        const saldo = hauptProdukt?.saldo ?? customer.restschuld ?? 0;
        saldoValue.textContent = '€' + saldo.toLocaleString('de-DE');
        saldoValue.className = 'amount-value ' + (saldo === 0 ? 'success' : 'danger');
    }

    const statusBadge = kontenTab.querySelector('.credit-status-badge');
    if (statusBadge) {
        if (hauptProdukt) {
            statusBadge.textContent = hauptProdukt.status;
            statusBadge.className = 'credit-status-badge ' + (hauptProdukt.badge || 'info');
        } else if (isBezahlt) {
            statusBadge.textContent = 'Beglichen';
            statusBadge.className = 'credit-status-badge success';
        } else {
            statusBadge.textContent = (customer.dpd || 0) + ' DPD';
            statusBadge.className = 'credit-status-badge ' + (customer.dpd > 30 ? 'danger' : 'warning');
        }
    }

    // Update Einkommen & Ausgaben section
    const eaSection = kontenTab.querySelector('.einkommen-ausgaben-compact');
    if (eaSection && customer.einkommenMonatlich) {
        eaSection.style.display = 'flex';
        const einkommen = customer.einkommenMonatlich || 0;
        const ausgaben = customer.ausgabenMonatlich || 0;
        const differenz = einkommen - ausgaben;

        const eaRows = eaSection.querySelectorAll('.ea-row');
        if (eaRows.length >= 3) {
            const v0 = eaRows[0]?.querySelector('.value');
            if (v0) v0.textContent = '€' + einkommen.toLocaleString('de-DE');
            const v1 = eaRows[1]?.querySelector('.value');
            if (v1) v1.textContent = '€' + ausgaben.toLocaleString('de-DE');
            const v2 = eaRows[2]?.querySelector('.value');
            if (v2) {
                v2.textContent = (differenz >= 0 ? '+' : '') + '€' + differenz.toLocaleString('de-DE');
                v2.className = 'value ' + (differenz >= 0 ? 'positiv' : 'negativ');
            }
        }
    }

    // Populate "Letzte Transaktionen" from customer.transaktionen
    const txCompactList = kontenTab.querySelector('#tx-compact-list');
    if (txCompactList) {
        if (customer.transaktionen && customer.transaktionen.length > 0) {
            txCompactList.innerHTML = customer.transaktionen.map(tx => {
                const statusClass = tx.status === 'ueberfaellig' ? 'failed' :
                                   tx.status === 'rueckgabe' ? 'failed' :
                                   tx.status === 'gebucht' ? 'success' : '';
                const statusBadge = tx.status === 'ueberfaellig' ? 'Überfällig' :
                                   tx.status === 'rueckgabe' ? 'Rückgabe' :
                                   tx.status === 'gebucht' ? 'Gebucht' : tx.status;
                const amountClass = tx.betrag < 0 ? 'negative' : 'positive';
                const amountSign = tx.betrag < 0 ? '-' : '+';
                const amountValue = Math.abs(tx.betrag).toLocaleString('de-DE');

                return `
                    <div class="tx-compact-item ${statusClass}">
                        <span class="tx-date">${tx.datum}</span>
                        <span class="tx-desc">${tx.beschreibung}</span>
                        <span class="tx-amount ${amountClass}">${amountSign}€${amountValue}</span>
                        <span class="tx-status-badge ${statusClass}">${statusBadge}</span>
                    </div>
                `;
            }).join('');
        } else if (isBezahlt) {
            // Bezahlte Kunden: Erfolgreiche Schlusszahlung
            txCompactList.innerHTML = `
                <div class="tx-compact-item success">
                    <span class="tx-date">${customer.letzteZahlung?.datum || '15.12.2025'}</span>
                    <span class="tx-desc">${customer.letzteZahlung?.typ || 'Schlusszahlung'}</span>
                    <span class="tx-amount positive">+€${(customer.letzteZahlung?.betrag || customer.monatsrate || 0).toLocaleString('de-DE')}</span>
                    <span class="tx-status-badge success">Gebucht</span>
                </div>
            `;
        } else {
            // Fallback: Generic transaction based on customer data
            txCompactList.innerHTML = `
                <div class="tx-compact-item ${customer.dpd > 0 ? 'failed' : 'success'}">
                    <span class="tx-date">01.12.2025</span>
                    <span class="tx-desc">Monatliche Zahlung</span>
                    <span class="tx-amount ${customer.dpd > 0 ? 'negative' : 'positive'}">${customer.dpd > 0 ? '-' : '+'}€${(customer.monatsrate || 0).toLocaleString('de-DE')}</span>
                    <span class="tx-status-badge ${customer.dpd > 0 ? 'failed' : 'success'}">${customer.dpd > 0 ? 'Überfällig' : 'Gebucht'}</span>
                </div>
            `;
        }
    }
}

function updateKiAnalyseFields(modal, customer) {
    const kiTab = modal.querySelector('#tab-ki-analyse');
    if (!kiTab) return;

    const isBezahlt = customer.status === 'Bezahlt';
    const isInkasso = customer.status === 'Inkasso';

    // Update all KI summary sections
    const summaryContent = kiTab.querySelector('.ki-summary-content');
    if (summaryContent) {
        const sections = summaryContent.querySelectorAll('.ki-summary-section');

        // Kernproblem section
        if (sections[0]) {
            const p = sections[0].querySelector('p');
            if (p) {
                if (isBezahlt) {
                    p.innerHTML = '<strong>Fall abgeschlossen.</strong> ' + customer.name + ' hat die Forderung vollständig beglichen. Gute Kooperationsbereitschaft nach Kontaktaufnahme.';
                } else {
                    p.innerHTML = customer.kernproblem || 'Keine Analyse verfügbar.';
                }
            }
        }

        // Letzte Aktivitäten section
        if (sections[1]) {
            const ul = sections[1].querySelector('ul');
            if (ul) {
                if (isBezahlt) {
                    ul.innerHTML = '<li>Zahlungseingang bestätigt (' + (customer.statusText?.match(/\d{2}\.\d{2}\.\d{4}/)?.[0] || '16.12.2025') + ')</li><li>Erfolgreiche Zahlungsvereinbarung</li><li>Fall als abgeschlossen markiert</li>';
                } else if (isInkasso) {
                    ul.innerHTML = '<li>' + customer.mahnstufe + '. Mahnung versendet</li><li>Telefonversuche nicht erreicht</li><li>Inkasso-Verfahren eingeleitet</li>';
                } else {
                    ul.innerHTML = '<li>Zahlungserinnerung versendet (' + new Date().toLocaleDateString('de-DE') + ')</li><li>Fall automatisch erstellt</li><li>Wartet auf Zahlungseingang oder Kundenkontakt</li>';
                }
            }
        }

        // Aktuelle Schritte section
        if (sections[2]) {
            const ul = sections[2].querySelector('ul');
            if (ul) {
                if (isBezahlt) {
                    ul.innerHTML = '<li><strong>Erledigt:</strong> Keine weiteren Maßnahmen erforderlich</li><li><strong>Optional:</strong> Kundenfeedback einholen</li>';
                } else if (isInkasso) {
                    ul.innerHTML = '<li><strong>Sofort:</strong> Gerichtliches Mahnverfahren prüfen</li><li><strong>Diese Woche:</strong> Letzte telefonische Kontaktaufnahme</li><li><strong>Bei Ablehnung:</strong> Forderungsverkauf oder Abschreibung</li>';
                } else {
                    ul.innerHTML = '<li><strong>Sofort:</strong> Telefonischen Kontakt herstellen</li><li><strong>Diese Woche:</strong> Zahlungsvereinbarung anbieten</li><li><strong>Bei Erfolg:</strong> Ratenzahlung dokumentieren</li>';
                }
            }
        }
    }

    // Update Willingness/Ability scores
    const scoreBars = kiTab.querySelectorAll('.score-bar-visual .bar-fill');
    const scorePercents = kiTab.querySelectorAll('.score-percent');
    if (scoreBars.length >= 2 && scorePercents.length >= 2) {
        const willingness = isBezahlt ? 95 : (customer.willingness || 50);
        const ability = isBezahlt ? 90 : (customer.ability || 50);
        scoreBars[0].style.width = willingness + '%';
        scoreBars[1].style.width = ability + '%';
        scorePercents[0].textContent = willingness + '%';
        scorePercents[1].textContent = ability + '%';

        scoreBars[0].style.background = willingness >= 70 ? '#22c55e' : (willingness >= 40 ? '#f59e0b' : '#ef4444');
        scoreBars[1].style.background = ability >= 70 ? '#22c55e' : (ability >= 40 ? '#f59e0b' : '#ef4444');
    }

    // Update score point position in chart
    const scorePoint = kiTab.querySelector('.score-point');
    if (scorePoint) {
        const willingness = isBezahlt ? 95 : (customer.willingness || 50);
        const ability = isBezahlt ? 90 : (customer.ability || 50);
        scorePoint.style.left = willingness + '%';
        scorePoint.style.bottom = ability + '%';
    }

    // Update segment badge
    const segmentBadge = kiTab.querySelector('.segment-badge.large');
    if (segmentBadge) {
        const segmentNames = {
            'eskalation': 'Eskalation', 'prioritaet': 'Priorität',
            'restrukturierung': 'Restrukturierung', 'abwicklung': 'Abwicklung',
            'abgeschlossen': 'Abgeschlossen'
        };
        const segmentClasses = {
            'eskalation': 'escalate', 'prioritaet': 'priority',
            'restrukturierung': 'restructure', 'abwicklung': 'writeoff',
            'abgeschlossen': 'success'
        };
        const segment = isBezahlt ? 'abgeschlossen' : (customer.segment || 'prioritaet');
        segmentBadge.textContent = segmentNames[segment] || segment;
        segmentBadge.className = 'segment-badge large ' + (segmentClasses[segment] || '');
    }

    // Update segment description
    const segmentDesc = kiTab.querySelector('.ki-segment-result p');
    if (segmentDesc) {
        if (isBezahlt) {
            segmentDesc.innerHTML = 'Der Fall <strong>' + customer.name + '</strong> wurde erfolgreich abgeschlossen. Die Forderung wurde vollständig beglichen. Keine weiteren Maßnahmen erforderlich.';
        } else {
            const segmentDescriptions = {
                'eskalation': 'Basierend auf der Analyse wird <strong>' + customer.name + '</strong> dem Segment <strong>Eskalation</strong> zugeordnet. Empfehlung: Intensivierung der Inkasso-Maßnahmen.',
                'prioritaet': '<strong>' + customer.name + '</strong> zeigt Kooperationsbereitschaft und ausreichende Zahlungsfähigkeit. Empfehlung: Schnelle Vereinbarung anstreben.',
                'restrukturierung': '<strong>' + customer.name + '</strong> benötigt eine Restrukturierung der Schulden. Empfehlung: Ratenzahlung oder Stundung vereinbaren.',
                'abwicklung': 'Bei <strong>' + customer.name + '</strong> ist die Rückzahlung unwahrscheinlich. Empfehlung: Forderungsverkauf oder Abschreibung prüfen.'
            };
            segmentDesc.innerHTML = segmentDescriptions[customer.segment] ||
                'Basierend auf der Analyse wird <strong>' + customer.name + '</strong> dem entsprechenden Segment zugeordnet.';
        }
    }

    // Update factors based on customer data
    const factorList = kiTab.querySelector('.factor-list');
    if (factorList && customer.status !== 'Bezahlt') {
        const factors = generateCustomerFactors(customer);
        factorList.innerHTML = factors.map(f => `
            <div class="factor-item ${f.type}">
                <span class="factor-icon">
                    ${f.type === 'positive'
                        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'}
                </span>
                <span class="factor-name">${f.name}</span>
                <span class="factor-impact">${f.impact}</span>
            </div>
        `).join('');
    } else if (factorList && customer.status === 'Bezahlt') {
        factorList.innerHTML = `
            <div class="factor-item positive">
                <span class="factor-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                <span class="factor-name">Forderung vollständig beglichen</span>
                <span class="factor-impact">+100 Punkte</span>
            </div>
            <div class="factor-item positive">
                <span class="factor-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                <span class="factor-name">Fall erfolgreich abgeschlossen</span>
                <span class="factor-impact">Kein Risiko</span>
            </div>
        `;
    }
}

function updateOpenFinanceFields(modal, customer) {
    const openfinanceTab = document.getElementById('tab-openfinance');
    if (!openfinanceTab) {
        console.warn('[OPENFINANCE] tab-openfinance element not found');
        return;
    }

    if (!customer.openFinance) {
        console.warn('[OPENFINANCE] No openFinance data for customer:', customer.name);
        return;
    }

    console.log('[OPENFINANCE] Updating fields for customer:', customer.name, customer.openFinance);

    const of = customer.openFinance;

    // Update Consent Grid - use document.getElementById for reliability
    const consentGrid = document.getElementById('consentGrid');
    if (consentGrid && of.consent) {
        const psd2Status = of.consent.psd2 ? 'active' : 'inactive';
        const versicherungenStatus = of.consent.versicherungen ? 'active' : 'pending';
        const investmentsStatus = of.consent.investments ? 'active' : 'inactive';

        const psd2Icon = of.consent.psd2
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';

        const versicherungenIcon = of.consent.versicherungen
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';

        const investmentsIcon = of.consent.investments
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';

        consentGrid.innerHTML = `
            <div class="consent-item ${psd2Status}">
                <span class="consent-status">${psd2Icon} ${of.consent.psd2 ? 'Aktiv' : 'Nicht erteilt'}</span>
                <span class="consent-label">Konten (PSD2)</span>
                <span class="consent-detail">${of.consent.psd2 ? 'Gültig bis ' + of.consent.psd2Bis : 'Keine Freigabe'}</span>
            </div>
            <div class="consent-item ${versicherungenStatus}">
                <span class="consent-status">${versicherungenIcon} ${of.consent.versicherungen ? 'Aktiv' : 'Ausstehend'}</span>
                <span class="consent-label">Versicherungen</span>
                <span class="consent-detail">${of.consent.versicherungen ? 'Freigabe erteilt' : 'Einwilligung angefragt'}</span>
            </div>
            <div class="consent-item ${investmentsStatus}">
                <span class="consent-status">${investmentsIcon} ${of.consent.investments ? 'Aktiv' : 'Nicht erteilt'}</span>
                <span class="consent-label">Investments</span>
                <span class="consent-detail">${of.consent.investments ? 'Freigabe erteilt' : 'Keine Freigabe'}</span>
            </div>
        `;
    }

    // Update Externe Konten table - use document.getElementById for reliability
    const externeKontenBody = document.getElementById('externeKontenBody');
    if (externeKontenBody && of.externeKonten) {
        if (of.externeKonten.length === 0) {
            externeKontenBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 20px;">Keine externen Konten gefunden</td></tr>';
        } else {
            externeKontenBody.innerHTML = of.externeKonten.map(konto => {
                const saldoClass = konto.saldo < 0 ? 'negative' : (konto.saldo > 0 ? 'positive' : '');
                const statusBadge = konto.status === 'Aktiv' ? 'success' : (konto.status === 'Überzogen' ? 'danger' : 'warning');
                return `
                    <tr>
                        <td>${konto.institut}</td>
                        <td>${konto.produkt}</td>
                        <td class="${saldoClass}">€${Math.abs(konto.saldo).toLocaleString('de-DE')}</td>
                        <td>${konto.rate > 0 ? '€' + konto.rate.toLocaleString('de-DE') : '-'}</td>
                        <td><span class="status-badge ${statusBadge}">${konto.status}</span></td>
                    </tr>
                `;
            }).join('');
        }
    }

    // Update Externe Versicherungen table - use document.getElementById for reliability
    const externeVersicherungenBody = document.getElementById('externeVersicherungenBody');
    if (externeVersicherungenBody && of.externeVersicherungen) {
        if (of.externeVersicherungen.length === 0) {
            externeVersicherungenBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 20px;">Keine externen Versicherungen erkannt (kein Consent oder keine Daten)</td></tr>';
        } else {
            externeVersicherungenBody.innerHTML = of.externeVersicherungen.map(vers => `
                <tr>
                    <td>${vers.anbieter}</td>
                    <td>${vers.produkt}</td>
                    <td>€${vers.beitrag.toLocaleString('de-DE')}/M</td>
                    <td>${vers.beginn}</td>
                    <td>${vers.hinweis || '-'}</td>
                </tr>
            `).join('');
        }
    }

    // Calculate and update Gesamtverschuldung
    const produkteSaldo = customer.produkte ? customer.produkte.reduce((sum, p) => sum + (p.saldo || 0), 0) : 0;
    const externeSaldo = of.externeKonten ? of.externeKonten.filter(k => k.saldo < 0 || k.produkt.toLowerCase().includes('kredit') || k.produkt.toLowerCase().includes('leasing'))
        .reduce((sum, k) => sum + Math.abs(k.saldo), 0) : 0;
    const gesamtVerschuldung = produkteSaldo + externeSaldo;

    // Calculate DTI (Debt-to-Income Ratio) based on monthly income
    const monatlichesEinkommen = customer.haushalt ?
        (customer.haushalt.einnahmen.gehalt || 0) + (customer.haushalt.einnahmen.neben || 0) +
        (customer.haushalt.einnahmen.sozial || 0) + (customer.haushalt.einnahmen.sonstige || 0) :
        (customer.einkommenMonatlich || 1);
    const dtiRatio = monatlichesEinkommen > 0 ? Math.round((gesamtVerschuldung / (monatlichesEinkommen * 12)) * 100) : 0;

    const debtEigeneBank = openfinanceTab.querySelector('#debtEigeneBank');
    const debtExtern = openfinanceTab.querySelector('#debtExtern');
    const debtGesamt = openfinanceTab.querySelector('#debtGesamt');
    const debtRatio = openfinanceTab.querySelector('#debtRatio');

    if (debtEigeneBank) debtEigeneBank.textContent = '€' + produkteSaldo.toLocaleString('de-DE');
    if (debtExtern) debtExtern.textContent = '€' + externeSaldo.toLocaleString('de-DE');
    if (debtGesamt) debtGesamt.textContent = '€' + gesamtVerschuldung.toLocaleString('de-DE');
    if (debtRatio) {
        debtRatio.textContent = dtiRatio + '%';
        debtRatio.style.color = dtiRatio <= 35 ? '#22c55e' : (dtiRatio <= 50 ? '#f59e0b' : '#ef4444');
    }

    console.log('Open Finance fields updated for:', customer.name);
}

// Helper to format currency
function formatCurrency(amount) {
    if (amount === undefined || amount === null) return '€0';
    const formatted = Math.abs(amount).toLocaleString('de-DE');
    return (amount < 0 ? '-' : '') + '€' + formatted;
}

// Update GuV fields with customer data (for Gewerbe customers)
function updateGuvFields(customer) {
    const guv = customer.guv || {};

    // Update summary cards
    const umsatzEl = document.getElementById('guvUmsatz');
    const aufwendungenEl = document.getElementById('guvAufwendungen');
    const gewinnEl = document.getElementById('guvGewinn');
    const ebitdaEl = document.getElementById('guvEbitda');

    if (umsatzEl && guv.umsatz) {
        umsatzEl.textContent = formatCurrency(guv.umsatz);
    }
    if (aufwendungenEl && guv.aufwendungen) {
        aufwendungenEl.textContent = formatCurrency(guv.aufwendungen);
    }
    if (gewinnEl && guv.gewinn !== undefined) {
        gewinnEl.textContent = formatCurrency(guv.gewinn);
        gewinnEl.classList.toggle('negative', guv.gewinn < 0);
    }
    if (ebitdaEl && guv.ebitda) {
        ebitdaEl.textContent = guv.ebitda + '%';
    }

    // Update detail fields
    const guvUmsatzDetail = document.getElementById('guvUmsatzDetail');
    const guvGewinnDetail = document.getElementById('guvGewinnDetail');
    if (guvUmsatzDetail && guv.umsatzChange) {
        guvUmsatzDetail.textContent = guv.umsatzChange;
    }
    if (guvGewinnDetail && guv.gewinnText) {
        guvGewinnDetail.textContent = guv.gewinnText;
    }
}

// Update Haushalt/GuV tab based on customer type (Privat vs Gewerbe)
function updateHaushaltGuvTab(customer) {
    const tabButton = document.getElementById('tabHaushaltGuv');
    const haushaltSection = document.getElementById('haushaltSection');
    const guvSection = document.getElementById('guvSection');

    if (!haushaltSection || !guvSection) return;

    // Only show GuV for explicitly marked business customers (type === 'Gewerbe')
    const isGewerbe = customer.type === 'Gewerbe';

    if (isGewerbe) {
        // Show GuV for business customers
        if (tabButton) tabButton.textContent = 'GuV';
        haushaltSection.style.display = 'none';
        guvSection.style.display = 'block';

        // Update GuV values based on customer data
        if (customer.guv) {
            updateGuvFields(customer);
        }
    } else {
        // Show Haushaltsrechnung for private customers
        if (tabButton) tabButton.textContent = 'Haushaltsrechnung';
        haushaltSection.style.display = 'block';
        guvSection.style.display = 'none';
    }
}

// Update Haushaltsrechnung tab fields (for Privat customers)
function updateHaushaltFields(modal, customer) {
    // Use document.getElementById for more reliable element lookup
    const haushaltTab = document.getElementById('tab-haushalt');

    if (!haushaltTab) {
        console.warn('[HAUSHALT] tab-haushalt element not found');
        return;
    }

    if (!customer.haushalt) {
        console.warn('[HAUSHALT] No haushalt data for customer:', customer.name);
        return;
    }

    console.log('[HAUSHALT] Updating fields for customer:', customer.name, customer.haushalt);

    const h = customer.haushalt;
    const isGewerbe = customer.type === 'Gewerbe';

    // Calculate totals
    const einnahmenGesamt = (h.einnahmen?.gehalt || 0) + (h.einnahmen?.neben || 0) + (h.einnahmen?.sozial || 0) + (h.einnahmen?.sonstige || 0);
    const fixkostenGesamt = (h.fixkosten?.miete || 0) + (h.fixkosten?.nebenkosten || 0) + (h.fixkosten?.versicherung || 0) + (h.fixkosten?.kredite || 0) + (h.fixkosten?.abos || 0);
    const lebenshaltungGesamt = (h.lebenshaltung?.essen || 0) + (h.lebenshaltung?.mobilitaet || 0) + (h.lebenshaltung?.gesundheit || 0) + (h.lebenshaltung?.freizeit || 0) + (h.lebenshaltung?.sonstige || 0);
    const ausgabenGesamt = fixkostenGesamt + lebenshaltungGesamt;
    const freiVerfuegbar = einnahmenGesamt - ausgabenGesamt;
    const sparquote = einnahmenGesamt > 0 ? Math.round((freiVerfuegbar / einnahmenGesamt) * 100) : 0;

    console.log('[HAUSHALT] Calculated totals:', { einnahmenGesamt, ausgabenGesamt, freiVerfuegbar, sparquote });

    // Helper to format currency
    const formatEuro = (val) => '€' + val.toLocaleString('de-DE');

    // Helper to safely update element text
    const updateEl = (id, value) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value;
        } else {
            console.warn(`[HAUSHALT] Element #${id} not found`);
        }
        return el;
    };

    // Update summary cards
    updateEl('haushaltEinnahmen', formatEuro(einnahmenGesamt));
    updateEl('haushaltAusgaben', formatEuro(ausgabenGesamt));

    const verfuegbarEl = updateEl('haushaltVerfuegbar', formatEuro(freiVerfuegbar));
    if (verfuegbarEl) verfuegbarEl.style.color = freiVerfuegbar >= 0 ? '#22c55e' : '#ef4444';

    const sparquoteEl = updateEl('haushaltSparquote', sparquote + '%');
    if (sparquoteEl) sparquoteEl.style.color = sparquote >= 10 ? '#22c55e' : (sparquote >= 0 ? '#f59e0b' : '#ef4444');

    // Update summary detail text
    updateEl('haushaltEinnahmenDetail', isGewerbe ? 'Betriebseinnahmen' : 'Nettoeinkommen');
    updateEl('haushaltAusgabenDetail', 'Fixkosten + Lebenshaltung');

    // Update Einnahmen breakdown
    updateEl('einnahmenGehalt', formatEuro(h.einnahmen?.gehalt || 0));
    updateEl('einnahmenNeben', formatEuro(h.einnahmen?.neben || 0));
    updateEl('einnahmenSozial', formatEuro(h.einnahmen?.sozial || 0));
    updateEl('einnahmenSonstige', formatEuro(h.einnahmen?.sonstige || 0));
    updateEl('einnahmenGesamt', formatEuro(einnahmenGesamt));

    // Update Fixkosten breakdown
    updateEl('fixkostenMiete', formatEuro(h.fixkosten?.miete || 0));
    updateEl('fixkostenNebenkosten', formatEuro(h.fixkosten?.nebenkosten || 0));
    updateEl('fixkostenVersicherung', formatEuro(h.fixkosten?.versicherung || 0));
    updateEl('fixkostenKredite', formatEuro(h.fixkosten?.kredite || 0));
    updateEl('fixkostenAbos', formatEuro(h.fixkosten?.abos || 0));
    updateEl('fixkostenGesamt', formatEuro(fixkostenGesamt));

    // Update Lebenshaltung breakdown
    updateEl('lebenshaltungEssen', formatEuro(h.lebenshaltung?.essen || 0));
    updateEl('lebenshaltungMobilitaet', formatEuro(h.lebenshaltung?.mobilitaet || 0));
    updateEl('lebenshaltungGesundheit', formatEuro(h.lebenshaltung?.gesundheit || 0));
    updateEl('lebenshaltungFreizeit', formatEuro(h.lebenshaltung?.freizeit || 0));
    updateEl('lebenshaltungSonstige', formatEuro(h.lebenshaltung?.sonstige || 0));
    updateEl('lebenshaltungGesamt', formatEuro(lebenshaltungGesamt));

    // Update Zahlungsfähigkeitsbewertung
    const assessmentFill = haushaltTab.querySelector('#assessmentFill');
    const assessmentText = haushaltTab.querySelector('#assessmentText');

    let assessmentLevel = 0;
    let assessmentMessage = '';
    let assessmentColor = '';

    if (sparquote >= 20) {
        assessmentLevel = 90;
        assessmentMessage = `<strong>Gut:</strong> ${customer.name} verfügt über einen soliden finanziellen Spielraum (${sparquote}% Sparquote). Ratenzahlungen können problemlos bedient werden.`;
        assessmentColor = '#22c55e';
    } else if (sparquote >= 10) {
        assessmentLevel = 70;
        assessmentMessage = `<strong>Stabil:</strong> ${customer.name} hat ausreichend frei verfügbares Einkommen (${formatEuro(freiVerfuegbar)}/Monat). Moderate Raten sind tragbar.`;
        assessmentColor = '#3b82f6';
    } else if (sparquote >= 0) {
        assessmentLevel = 45;
        assessmentMessage = `<strong>Eingeschränkt:</strong> ${customer.name} hat nur ${formatEuro(freiVerfuegbar)} frei verfügbar. Niedrige Raten oder Stundung empfohlen.`;
        assessmentColor = '#f59e0b';
    } else {
        assessmentLevel = 20;
        assessmentMessage = `<strong>Kritisch:</strong> ${customer.name} hat ein monatliches Defizit von ${formatEuro(Math.abs(freiVerfuegbar))}. Restrukturierung oder Härtefallprüfung erforderlich.`;
        assessmentColor = '#ef4444';
    }

    if (assessmentFill) {
        assessmentFill.style.width = assessmentLevel + '%';
        assessmentFill.style.background = `linear-gradient(90deg, ${assessmentColor}, ${assessmentColor}80)`;
    }
    if (assessmentText) {
        assessmentText.innerHTML = assessmentMessage;
    }

    console.log('Haushalt fields updated for:', customer.name);
}

// Update CRM fields with customer data
function updateCrmFields(crmView, customer) {
    // Helper to find and update by label
    function updateByLabel(labelText, newValue) {
        const rows = crmView.querySelectorAll('.crm-row, .info-row, .detail-row');
        for (const row of rows) {
            const label = row.querySelector('.label, .info-label, .detail-label');
            if (label && label.textContent.trim().toLowerCase().includes(labelText.toLowerCase())) {
                const value = row.querySelector('.value, .info-value, .detail-value');
                if (value) {
                    value.textContent = newValue;
                    return value;
                }
            }
        }
        return null;
    }

    // Update main fields
    updateByLabel('Firmenname', customer.name);
    updateByLabel('Name', customer.name);
    updateByLabel('Rechtsform', customer.rechtsform);
    updateByLabel('Branche', customer.branche);
    updateByLabel('Adresse', customer.adresse);
    updateByLabel('Telefon', customer.telefon);
    updateByLabel('E-Mail', customer.email);
    updateByLabel('Ansprechpartner', customer.ansprechpartner);

    // Update financial data
    updateByLabel('Restschuld', '€' + (customer.restschuld || 0).toLocaleString('de-DE'));
    updateByLabel('Gesamtforderung', '€' + (customer.gesamtforderung || 0).toLocaleString('de-DE'));

    // Update status badges
    const statusBadges = crmView.querySelectorAll('.status-badge, .segment-badge');
    statusBadges.forEach(badge => {
        if (customer.status === 'Bezahlt') {
            badge.textContent = 'Abgeschlossen';
            badge.className = badge.className.replace(/danger|warning|inkasso/g, 'success');
        }
    });
}

function updateKommunikationFields(modal, customer) {
    const kommTab = modal.querySelector('#tab-kommunikation');
    if (!kommTab) return;

    const isBezahlt = customer.status === 'Bezahlt';
    const isInkasso = customer.status === 'Inkasso';

    // Update workflow status
    const statusValue = kommTab.querySelector('.status-value');
    if (statusValue) {
        statusValue.textContent = customer.workflowStatus || 'Offen';
        statusValue.className = 'status-value ' + (isBezahlt ? 'success' : isInkasso ? 'inkasso' : 'offen');
    }

    // Add or update KI summary at the top of Kommunikation
    let kiSummary = kommTab.querySelector('.kommunikation-ki-summary');
    if (!kiSummary) {
        kiSummary = document.createElement('div');
        kiSummary.className = 'kommunikation-ki-summary';
        const header = kommTab.querySelector('.kommunikation-header');
        if (header) {
            header.after(kiSummary);
        }
    }

    const mahnstufeText = customer.mahnstufe > 0 ? 'Mahnstufe ' + customer.mahnstufe : 'Keine Mahnungen';
    const statusClass = isBezahlt ? 'success' : isInkasso ? 'danger' : 'warning';

    kiSummary.innerHTML = `
        <div class="ki-summary-mini">
            <div class="ki-summary-header-mini">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33"></path>
                </svg>
                <span>KI-Zusammenfassung der Kommunikation</span>
            </div>
            <div class="ki-summary-content-mini">
                <p><strong>${customer.name}</strong> - ${customer.kernproblem || 'Keine Analyse verfügbar.'}</p>
                <div class="ki-summary-stats">
                    <span class="stat-item ${statusClass}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"></circle></svg>
                        ${customer.workflowStatus || 'Offen'}
                    </span>
                    <span class="stat-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        ${mahnstufeText}
                    </span>
                    <span class="stat-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        ${customer.dpd || 0} DPD
                    </span>
                </div>
            </div>
        </div>
    `;

    // Update KI-Analyse Kernproblem (for KI tab)
    const kiSummaryContent = modal.querySelector('#tab-ki-analyse .ki-summary-section p');
    if (kiSummaryContent && customer.kernproblem) {
        kiSummaryContent.innerHTML = customer.kernproblem;
    }

    // Update Willingness/Ability scores
    const willingnessBar = modal.querySelector('.score-item:first-child .bar-fill');
    const willingnessPercent = modal.querySelector('.score-item:first-child .score-percent');
    if (willingnessBar && customer.willingness !== undefined) {
        willingnessBar.style.width = `${customer.willingness}%`;
        if (willingnessPercent) willingnessPercent.textContent = `${customer.willingness}%`;
    }

    const abilityBar = modal.querySelector('.score-item:nth-child(2) .bar-fill');
    const abilityPercent = modal.querySelector('.score-item:nth-child(2) .score-percent');
    if (abilityBar && customer.ability !== undefined) {
        abilityBar.style.width = `${customer.ability}%`;
        if (abilityPercent) abilityPercent.textContent = `${customer.ability}%`;
    }

    // Update score point position (Willingness = X, Ability = Y)
    const scorePoint = modal.querySelector('.score-point');
    if (scorePoint && customer.willingness !== undefined && customer.ability !== undefined) {
        scorePoint.style.left = `${customer.willingness}%`;
        scorePoint.style.bottom = `${customer.ability}%`;
    }

    // Update DPD and Restschuld in summary if elements exist
    const dpdEl = modal.querySelector('.dpd-value, [data-field="dpd"]');
    if (dpdEl) dpdEl.textContent = customer.dpd ?? '0';

    const restschuldEl = modal.querySelector('.restschuld-value, [data-field="restschuld"]');
    if (restschuldEl) restschuldEl.textContent = customer.restschuld ? `€${customer.restschuld.toLocaleString('de-DE')}` : '€0';
}

// ========================================
// CRM PROFILE
// ========================================

export function openCrmProfile(customerId, taskContext = null) {
    const crmView = document.getElementById('crmProfileView');
    if (!crmView) return;

    crmView.classList.add('active');
    currentCustomerId = customerId;

    const customer = getFullCustomerData(customerId);

    const crmHeader = crmView.querySelector('.crm-header h2, .crm-customer-name');
    if (crmHeader) crmHeader.textContent = customer.name;

    const crmCustomerId = crmView.querySelector('.crm-customer-id');
    if (crmCustomerId) crmCustomerId.textContent = customerId;

    // Update CRM fields using the same helper approach
    updateCrmFields(crmView, customer);

    // Show/hide task hint box
    const taskHintBox = document.getElementById('crmTaskHint');
    if (taskHintBox) {
        if (taskContext) {
            taskHintBox.style.display = 'block';
            taskHintBox.innerHTML = `
                <div class="task-hint-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <strong>Offene Aufgabe:</strong> ${taskContext.title}
                </div>
                <div class="task-hint-meta">
                    <span class="task-hint-due ${taskContext.overdue ? 'overdue' : ''}">${taskContext.due}</span>
                </div>
            `;
        } else {
            taskHintBox.style.display = 'none';
        }
    }
}

export function closeCrmProfile() {
    document.getElementById('crmProfileView')?.classList.remove('active');
}

// ========================================
// CUSTOMER ACTIVITIES
// ========================================

export function getCustomerActivities(customerId) {
    const activities = JSON.parse(localStorage.getItem('customerActivities') ?? '{}');
    return activities[customerId] ?? [];
}

export function saveCustomerActivity(customerId, activity) {
    const activities = JSON.parse(localStorage.getItem('customerActivities') ?? '{}');
    activities[customerId] ??= [];
    activities[customerId].unshift(activity);
    localStorage.setItem('customerActivities', JSON.stringify(activities));
    return activity;
}

export function renderCustomerActivities(customerId) {
    const container = document.querySelector('.komm-timeline, #aktivitaetenListe');
    if (!container) return;

    const activities = getCustomerActivities(customerId);

    if (activities.length === 0) return;

    const activityHtml = activities.map(activity => `
        <div class="komm-item ${activity.type} custom-activity" data-id="${activity.id}">
            <div class="komm-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
            </div>
            <div class="komm-body">
                <div class="komm-meta">
                    <span class="komm-type">${activity.typeLabel ?? activity.type}</span>
                    <span class="komm-time">${formatRelativeTime(activity.timestamp)}</span>
                    <span class="komm-author">${activity.author}</span>
                </div>
                <p>${activity.text}</p>
            </div>
            <button class="komm-delete" onclick="deleteActivity('${customerId}', '${activity.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `).join('');

    container.insertAdjacentHTML('afterbegin', activityHtml);
}

export function deleteActivity(customerId, activityId) {
    const activities = JSON.parse(localStorage.getItem('customerActivities') ?? '{}');
    if (activities[customerId]) {
        activities[customerId] = activities[customerId].filter(a => a.id !== activityId);
        localStorage.setItem('customerActivities', JSON.stringify(activities));
    }

    document.querySelector(`.custom-activity[data-id="${activityId}"]`)?.remove();
    window.showNotification?.('Aktivität gelöscht', 'info');
}

// ========================================
// ACTIVITY MODAL
// ========================================

export function openActivityModal(type = 'notiz') {
    let modal = document.getElementById('activityModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'activityModal';
        modal.className = 'activity-modal';
        modal.innerHTML = `
            <div class="activity-modal-content">
                <div class="activity-modal-header">
                    <h3>Aktivität hinzufügen</h3>
                    <button class="activity-modal-close" onclick="closeActivityModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="activity-modal-body">
                    <div class="activity-form-group">
                        <label>Typ</label>
                        <select id="activityType">
                            <option value="notiz">Notiz</option>
                            <option value="anruf">Telefonat</option>
                            <option value="email">E-Mail</option>
                            <option value="termin">Termin</option>
                        </select>
                    </div>
                    <div class="activity-form-group">
                        <label>Beschreibung</label>
                        <textarea id="activityText" placeholder="Aktivität beschreiben..."></textarea>
                    </div>
                </div>
                <div class="activity-modal-footer">
                    <button class="btn-cancel" onclick="closeActivityModal()">Abbrechen</button>
                    <button class="btn-submit" onclick="submitActivity()">Speichern</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('activityType').value = type;
    document.getElementById('activityText').value = '';
    modal.style.display = 'flex';
}

export function closeActivityModal() {
    const modal = document.getElementById('activityModal');
    if (modal) modal.style.display = 'none';
}

export function submitActivity() {
    const type = document.getElementById('activityType')?.value ?? 'notiz';
    const text = document.getElementById('activityText')?.value?.trim() ?? '';

    if (!text) {
        window.showNotification?.('Bitte Beschreibung eingeben', 'error');
        return;
    }

    if (!currentCustomerId) {
        window.showNotification?.('Kein Kunde ausgewählt', 'error');
        return;
    }

    const typeLabels = {
        notiz: 'Notiz', anruf: 'Telefonat', email: 'E-Mail', termin: 'Termin', aufgabe: 'Aufgabe'
    };

    const activity = {
        id: Date.now().toString(),
        type,
        typeLabel: typeLabels[type] ?? type,
        text,
        author: localStorage.getItem('feedbackAuthor') ?? 'Eike',
        timestamp: new Date().toISOString()
    };

    saveCustomerActivity(currentCustomerId, activity);
    closeActivityModal();
    renderCustomerActivities(currentCustomerId);
    window.showNotification?.('Aktivität gespeichert', 'success');
}

export function addNote() {
    openActivityModal('notiz');
}

// ========================================
// CUSTOMER NOTES & STAMMDATEN
// ========================================

export function getCustomerNotes(customerId) {
    const notes = JSON.parse(localStorage.getItem('customerNotes') ?? '{}');
    return notes[customerId] ?? [];
}

export function saveCustomerNote(customerId, note) {
    const notes = JSON.parse(localStorage.getItem('customerNotes') ?? '{}');
    notes[customerId] ??= [];
    notes[customerId].unshift(note);
    localStorage.setItem('customerNotes', JSON.stringify(notes));
    return note;
}

export function getCustomerStammdaten(customerId) {
    const stammdaten = JSON.parse(localStorage.getItem('customerStammdaten') ?? '{}');
    return stammdaten[customerId] ?? {};
}

export function saveCustomerStammdaten(customerId, field, value) {
    const stammdaten = JSON.parse(localStorage.getItem('customerStammdaten') ?? '{}');
    stammdaten[customerId] ??= {};
    stammdaten[customerId][field] = value;
    localStorage.setItem('customerStammdaten', JSON.stringify(stammdaten));
}

// ========================================
// STAMMDATEN EDIT MODE
// ========================================

export function editStammdaten() {
    stammdatenEditMode = !stammdatenEditMode;

    const stammdatenTab = document.getElementById('tab-stammdaten');
    if (!stammdatenTab) return;

    if (stammdatenEditMode) {
        enableStammdatenEditMode(stammdatenTab);
        window.showNotification?.('Bearbeitungsmodus aktiviert - Klicken Sie auf Felder zum Bearbeiten', 'info');
    } else {
        saveStammdatenChanges(stammdatenTab);
        disableStammdatenEditMode(stammdatenTab);
        window.showNotification?.('Änderungen gespeichert', 'success');
    }
}

function enableStammdatenEditMode(container) {
    container.classList.add('edit-mode');

    container.querySelectorAll('.stammdaten-row .value').forEach(valueEl => {
        if (valueEl.querySelector('.badge') || valueEl.classList.contains('badge')) return;

        valueEl.contentEditable = 'true';
        valueEl.classList.add('editable');

        const labelEl = valueEl.previousElementSibling;
        const fieldName = labelEl ? labelEl.textContent.replace(':', '').trim() : '';
        valueEl.dataset.fieldName = fieldName;

        valueEl.addEventListener('focus', function() {
            this.classList.add('editing');
        });
        valueEl.addEventListener('blur', function() {
            this.classList.remove('editing');
        });
    });

    let editControls = container.querySelector('.stammdaten-edit-controls');
    if (!editControls) {
        editControls = document.createElement('div');
        editControls.className = 'stammdaten-edit-controls';
        editControls.innerHTML = `
            <button class="btn-save-stammdaten" onclick="editStammdaten()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Speichern
            </button>
            <button class="btn-cancel-stammdaten" onclick="cancelStammdatenEdit()">
                Abbrechen
            </button>
        `;
        container.insertBefore(editControls, container.firstChild);
    }
    editControls.style.display = 'flex';

    addStammdatenEditStyles();
}

function disableStammdatenEditMode(container) {
    container.classList.remove('edit-mode');

    container.querySelectorAll('.stammdaten-row .value.editable').forEach(valueEl => {
        valueEl.contentEditable = 'false';
        valueEl.classList.remove('editable', 'editing');
    });

    const editControls = container.querySelector('.stammdaten-edit-controls');
    if (editControls) {
        editControls.style.display = 'none';
    }

    stammdatenEditMode = false;
}

export function cancelStammdatenEdit() {
    const stammdatenTab = document.getElementById('tab-stammdaten');
    if (stammdatenTab) {
        if (currentCustomerId) {
            const customer = getFullCustomerData(currentCustomerId);
            const modal = document.getElementById('customerDetailModal');
            if (modal) updateStammdatenFields(modal, customer);
        }
        disableStammdatenEditMode(stammdatenTab);
        window.showNotification?.('Bearbeitung abgebrochen', 'info');
    }
}

function saveStammdatenChanges(container) {
    if (!currentCustomerId) return;

    container.querySelectorAll('.stammdaten-row .value.editable').forEach(valueEl => {
        const fieldName = valueEl.dataset.fieldName;
        const value = valueEl.textContent.trim();

        if (fieldName && value) {
            saveCustomerStammdaten(currentCustomerId, fieldName, value);
        }
    });
}

function addStammdatenEditStyles() {
    if (document.getElementById('stammdaten-edit-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'stammdaten-edit-styles';
    styles.textContent = `
        .stammdaten-edit-controls {
            display: none;
            gap: 12px;
            padding: 12px 16px;
            background: #fef3c7;
            border-radius: 8px;
            margin-bottom: 16px;
            align-items: center;
        }
        .stammdaten-edit-controls::before {
            content: 'Bearbeitungsmodus aktiv';
            font-size: 13px;
            font-weight: 500;
            color: #92400e;
            flex: 1;
        }
        .btn-save-stammdaten {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
        }
        .btn-save-stammdaten:hover { background: #059669; }
        .btn-cancel-stammdaten {
            padding: 8px 16px;
            background: white;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
        }
        .btn-cancel-stammdaten:hover { background: #f3f4f6; }
        #tab-stammdaten.edit-mode .value.editable {
            background: #fffbeb;
            border: 1px dashed #fbbf24;
            border-radius: 4px;
            padding: 2px 6px;
            margin: -2px -6px;
            cursor: text;
            transition: all 0.2s;
        }
        #tab-stammdaten.edit-mode .value.editable:hover {
            background: #fef3c7;
            border-color: #f59e0b;
        }
        #tab-stammdaten.edit-mode .value.editable.editing {
            background: white;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
    `;
    document.head.appendChild(styles);
}

// ========================================
// NPL ACTIONS
// ========================================

export function escalateCase(caseId) {
    window.showNotification?.(`Fall ${caseId} wird eskaliert...`, 'warning');
}

export function createRatePlan(customerId) {
    window.showNotification?.(`Ratenplan für ${customerId} wird erstellt...`, 'info');
}

export function reviewForRestructure() {
    window.showNotification?.('Fälle für Restrukturierung werden geprüft...', 'info');
}

// ========================================
// UTILITIES
// ========================================

function formatRelativeTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tagen`;
    return date.toLocaleDateString('de-DE');
}

// ========================================
// AI SUMMARY
// ========================================

export function showAiSummary(customerId) {
    window.showNotification?.('KI-Zusammenfassung wird erstellt...', 'info');

    // Simulate AI loading
    setTimeout(() => {
        const summary = `
            <div class="ai-summary-modal">
                <div class="ai-summary-header">
                    <div class="ai-summary-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        <span>KI-Zusammenfassung für ${customerId}</span>
                    </div>
                    <button onclick="this.closest('.ai-summary-modal').remove()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="ai-summary-content">
                    <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Kundenprofil
                    </h4>
                    <p>Der Kunde zeigt eine <strong>moderate Zahlungsbereitschaft</strong> (Willingness: 45%) bei <strong>eingeschränkter Zahlungsfähigkeit</strong> (Ability: 35%). Die Kommunikation war bisher konstruktiv.</p>

                    <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Aktivitäten (letzte 30 Tage)
                    </h4>
                    <ul>
                        <li>3 Telefonkontakte (2 erfolgreich, 1 nicht erreicht)</li>
                        <li>1 Zahlungsvereinbarung getroffen</li>
                        <li>Teilzahlung i.H.v. €1.200 eingegangen</li>
                    </ul>

                    <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Empfohlene nächste Schritte
                    </h4>
                    <ol>
                        <li><strong>Telefonat führen</strong> - Zahlungsvereinbarung nachfassen</li>
                        <li><strong>Ratenzahlung prüfen</strong> - Kunde hat Interesse signalisiert</li>
                        <li><strong>Dokumentation aktualisieren</strong> - Finanzielle Situation erfassen</li>
                    </ol>
                </div>
            </div>
        `;

        // Add modal to page
        const modalContainer = document.createElement('div');
        modalContainer.className = 'ai-summary-overlay';
        modalContainer.innerHTML = summary;
        modalContainer.onclick = (e) => {
            if (e.target === modalContainer) modalContainer.remove();
        };
        document.body.appendChild(modalContainer);
    }, 1500);
}

// ========================================
// OPEN CUSTOMER CRM DIRECTLY
// ========================================

export function openCustomerDetailCRM(customerId) {
    // Use the full CRM profile instead of the modal
    openCrmProfile(customerId);
}

// ========================================
// WRITE OFF CASE
// ========================================

export function writeOffCase() {
    window.showNotification?.('Fall zur Abschreibung vorgemerkt', 'warning');
    closeCustomerDetail();
}

// ========================================
// ACTIVITY ELEMENT CREATION
// ========================================

export function createActivityElement(activity) {
    const div = document.createElement('div');
    div.className = `komm-item ${activity.type} custom-activity`;
    div.dataset.activityId = activity.id;

    const iconMap = {
        'notiz': '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',
        'anruf': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',
        'email': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
        'brief': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
        'termin': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
        'aufgabe': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
    };

    const date = new Date(activity.timestamp);
    const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
        <div class="komm-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                ${iconMap[activity.type] || iconMap['notiz']}
            </svg>
        </div>
        <div class="komm-content">
            <div class="komm-header">
                <span class="komm-type">${activity.typeLabel || activity.type}</span>
                <span class="komm-date">${dateStr}, ${timeStr}</span>
            </div>
            <div class="komm-body">
                <p>${activity.text}</p>
            </div>
            <div class="komm-meta">
                <span class="meta-item">Bearbeiter: ${activity.author}</span>
                <button class="btn-delete-activity" onclick="deleteActivity('${activity.id}')" title="Löschen">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;

    return div;
}

// ========================================
// ACTIVITY MODAL STYLES
// ========================================

export function addActivityModalStyles() {
    if (document.getElementById('activity-modal-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'activity-modal-styles';
    styles.textContent = `
        .activity-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            align-items: center;
            justify-content: center;
        }
        .activity-modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .activity-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #e2e8f0;
        }
        .activity-modal-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
        }
        .activity-modal-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #64748b;
        }
        .activity-modal-close:hover { color: #1e293b; }
        .activity-modal-body {
            padding: 20px;
        }
        .activity-form-group {
            margin-bottom: 16px;
        }
        .activity-form-group label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
        }
        .activity-form-group select,
        .activity-form-group textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
        }
        .activity-form-group textarea {
            min-height: 120px;
            resize: vertical;
        }
        .activity-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 20px;
            border-top: 1px solid #e2e8f0;
        }
        .activity-cancel-btn {
            padding: 10px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: white;
            color: #374151;
            font-size: 14px;
            cursor: pointer;
        }
        .activity-submit-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            background: #3b82f6;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
        }
        .activity-submit-btn:hover { background: #2563eb; }
        .btn-delete-activity {
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 4px;
        }
        .btn-delete-activity:hover { color: #ef4444; }
    `;
    document.head.appendChild(styles);
}

// Export current customer ID getter/setter
export const getCurrentCustomerId = () => currentCustomerId;
export const setCurrentCustomerId = (id) => { currentCustomerId = id; };
