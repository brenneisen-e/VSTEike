// NEW: Section Navigation Functions
// ========================================

// Show Banken Section (Navigation Tiles)
function showBankenSection(sectionName) {
    // Update nav tiles
    document.querySelectorAll('.nav-tile').forEach(tile => {
        tile.classList.remove('active');
    });

    // Find and activate clicked tile
    document.querySelectorAll('.nav-tile').forEach(tile => {
        const onclickAttr = tile.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${sectionName}'`)) {
            tile.classList.add('active');
        }
    });

    // Update dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
        const onclickAttr = item.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${sectionName}'`)) {
            item.classList.add('active');
        }
    });

    // Update section content
    document.querySelectorAll('.banken-section').forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    console.log('Showing Banken section:', sectionName);
}

// ========================================
// HEADER DROPDOWN MENU FUNCTIONS
// ========================================

// Toggle dropdown menu
function toggleHeaderDropdown(menuId) {
    const dropdown = document.getElementById(`dropdown-${menuId}`);
    const trigger = dropdown?.previousElementSibling;

    // Close all other dropdowns
    document.querySelectorAll('.header-dropdown-menu').forEach(menu => {
        if (menu.id !== `dropdown-${menuId}`) {
            menu.classList.remove('open');
            menu.previousElementSibling?.classList.remove('active');
        }
    });

    // Toggle current dropdown
    if (dropdown) {
        dropdown.classList.toggle('open');
        trigger?.classList.toggle('active');
    }
}

// Close all header dropdowns
function closeHeaderDropdowns() {
    document.querySelectorAll('.header-dropdown-menu').forEach(menu => {
        menu.classList.remove('open');
        menu.previousElementSibling?.classList.remove('active');
    });
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-dropdown-container')) {
        closeHeaderDropdowns();
    }
});

// Show overdue cases - navigates to Aufgaben section
function showOverdueCases() {
    showBankenSection('aufgaben');
    showNotification('23 überfällige Fälle werden angezeigt', 'warning');
    console.log('Showing overdue cases');
}

// Dismiss alert banner
function dismissAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
        alert.style.display = 'none';
    }
}

// ========================================
// NEW: Customer Detail Modal Functions
// ========================================

// Open customer detail modal
function openCustomerDetail(customerId, options = {}) {
    const modal = document.getElementById('customerDetailModal');
    if (modal) {
        modal.style.display = 'flex';

        // Set current customer ID for activity tracking
        currentCustomerId = customerId;

        // Get full customer data
        const customer = getFullCustomerData(customerId);

        // Update modal header
        const customerNameEl = document.getElementById('customerName');
        if (customerNameEl) {
            customerNameEl.textContent = customer.name;
        }

        // Update customer ID display
        const customerIdEl = modal.querySelector('.customer-id');
        if (customerIdEl) {
            customerIdEl.textContent = customerId;
        }

        // Update all tabs with customer data
        updateStammdatenFields(modal, customer);
        updateKontenFields(modal, customer);
        updateHaushaltFields(modal, customer);
        updateOpenFinanceFields(modal, customer);
        updateKommunikationFields(modal, customer);
        updateKiAnalyseFields(modal, customer);

        // Switch between Haushaltsrechnung (Privat) and GuV (Gewerbe)
        updateHaushaltGuvTab(customer);

        // Render custom activities from localStorage
        setTimeout(() => renderCustomerActivities(customerId), 100);

        // If opened from task completion, switch to Kommunikation tab
        if (options.showKommunikation) {
            showCustomerTab('kommunikation');
        } else {
            // Always reset to Stammdaten tab when opening normally
            showCustomerTab('stammdaten');
        }

        console.log('Opening customer detail:', customerId, customer.name);
    }
}

// Get full customer data for modal display (all tabs)
function getFullCustomerData(customerId) {
    const customers = {
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
        }
    };

    // Return customer or generate default data
    const customer = customers[customerId];
    if (customer) return customer;

    // Default fallback for unknown customers
    return {
        name: customerId, type: 'Unbekannt', rechtsform: '-',
        adresse: '-', telefon: '-', email: '-', ansprechpartner: '-',
        branche: '-', restschuld: 0, status: 'Unbekannt',
        krediteAnzahl: 0, gesamtforderung: 0, monatsrate: 0, ueberfaellig: 0,
        rueckgabequote: 0, hauptforderung: 0, zinsen: 0, mahngebuehren: 0, inkassokosten: 0,
        dpd: 0, willingness: 50, ability: 50, segment: 'unbekannt',
        kernproblem: 'Keine Daten verfügbar.',
        workflowStatus: 'Unbekannt', mahnstufe: 0
    };
}

// Update Stammdaten fields in modal - comprehensive update of all fields
function updateStammdatenFields(modal, customer) {
    const stammdatenTab = modal.querySelector('#tab-stammdaten');
    if (!stammdatenTab) {
        console.log('Stammdaten tab not found');
        return;
    }

    console.log('Updating Stammdaten for:', customer.name, customer);

    // Helper function to find and update a field by its label text
    function updateFieldByLabel(labelText, newValue, useHTML = false) {
        const rows = stammdatenTab.querySelectorAll('.stammdaten-row');
        for (const row of rows) {
            const label = row.querySelector('.label');
            if (label && label.textContent.trim().replace(':', '').toLowerCase() === labelText.toLowerCase()) {
                const value = row.querySelector('.value');
                if (value) {
                    if (useHTML) {
                        value.innerHTML = newValue;
                    } else {
                        value.textContent = newValue;
                    }
                    return value;
                }
            }
        }
        return null;
    }

    // Determine if Privat or Gewerbe customer
    const isPrivat = customer.type === 'Privat';

    // === UNTERNEHMENSDATEN / PERSONENDATEN ===
    updateFieldByLabel('Firmenname', customer.name);
    updateFieldByLabel('Rechtsform', customer.rechtsform || (isPrivat ? 'Privatperson' : '-'));
    updateFieldByLabel('Handelsregister', isPrivat ? '-' : 'HRB ' + Math.floor(Math.random() * 99999) + ' ' + (customer.adresse?.split(',')[1]?.trim() || 'Deutschland'));
    updateFieldByLabel('USt-ID', isPrivat ? '-' : 'DE' + Math.floor(Math.random() * 999999999));
    updateFieldByLabel('Branche', customer.branche || '-');
    updateFieldByLabel('Gründungsjahr', isPrivat ? '-' : (2000 + Math.floor(Math.random() * 20)).toString());
    updateFieldByLabel('Mitarbeiter', isPrivat ? '-' : Math.floor(Math.random() * 50 + 1) + ' (Stand: 2024)');
    updateFieldByLabel('Jahresumsatz', isPrivat ? '-' : '€' + (Math.floor(Math.random() * 5) + 0.5).toFixed(1) + ' Mio (2023)');

    // Kundentyp badge
    const kundentypValue = updateFieldByLabel('Kundentyp', '', true);
    if (kundentypValue) {
        kundentypValue.innerHTML = isPrivat
            ? '<span class="badge privat">Privatkunde</span>'
            : '<span class="badge gewerbe">Gewerbekunde</span>';
    }

    updateFieldByLabel('Kunde seit', customer.kundeSeit || '01.01.2020 (5 Jahre)');
    updateFieldByLabel('Kundenbetreuer', 'Eike Brenneisen');

    // === KONTAKTDATEN ===
    const adresseParts = customer.adresse ? customer.adresse.split(',') : ['-', '-'];
    const adresseFormatted = adresseParts.length > 1
        ? adresseParts[0].trim() + '<br>' + adresseParts[1].trim()
        : customer.adresse || '-';
    updateFieldByLabel('Adresse', adresseFormatted, true);

    updateFieldByLabel('Telefon Zentrale', customer.telefon || '-');
    updateFieldByLabel('Telefon Mobil', customer.telefonMobil || '+49 170 ' + Math.floor(Math.random() * 9999999));

    // Update all E-Mail fields
    const emailRows = stammdatenTab.querySelectorAll('.stammdaten-row');
    let emailCount = 0;
    emailRows.forEach(row => {
        const label = row.querySelector('.label');
        if (label && label.textContent.trim().toLowerCase().includes('e-mail')) {
            const value = row.querySelector('.value');
            if (value && emailCount === 0) {
                value.textContent = customer.email || '-';
                emailCount++;
            }
        }
    });

    updateFieldByLabel('Website', isPrivat ? '-' : 'www.' + customer.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.de');

    // === GESCHÄFTSFÜHRUNG / ANSPRECHPARTNER ===
    const subsections = stammdatenTab.querySelectorAll('.stammdaten-subsection');
    subsections.forEach(subsection => {
        const subsectionText = subsection.textContent.toLowerCase();
        let sibling = subsection.nextElementSibling;

        if (subsectionText.includes('geschäftsführung')) {
            // Update Geschäftsführung section
            while (sibling && sibling.classList.contains('stammdaten-row')) {
                const label = sibling.querySelector('.label');
                const value = sibling.querySelector('.value');
                if (label && value) {
                    const labelText = label.textContent.trim().toLowerCase();
                    if (labelText.includes('name')) {
                        value.textContent = customer.ansprechpartner || customer.name;
                    } else if (labelText.includes('direktwahl')) {
                        value.textContent = customer.telefon ? customer.telefon + '-10' : '-';
                    } else if (labelText.includes('e-mail')) {
                        const emailName = customer.ansprechpartner
                            ? customer.ansprechpartner.split(' ').map(n => n[0]?.toLowerCase()).join('.')
                            : 'kontakt';
                        const domain = customer.email ? customer.email.split('@')[1] : 'email.de';
                        value.textContent = emailName + '@' + domain;
                    }
                }
                sibling = sibling.nextElementSibling;
            }
        } else if (subsectionText.includes('buchhaltung') || subsectionText.includes('ansprechpartner')) {
            // Update Ansprechpartner Buchhaltung section
            while (sibling && sibling.classList.contains('stammdaten-row')) {
                const label = sibling.querySelector('.label');
                const value = sibling.querySelector('.value');
                if (label && value) {
                    const labelText = label.textContent.trim().toLowerCase();
                    if (labelText.includes('name')) {
                        value.textContent = isPrivat ? customer.name : 'Buchhaltung ' + customer.name.split(' ')[0];
                    } else if (labelText.includes('direktwahl')) {
                        value.textContent = customer.telefon ? customer.telefon + '-20' : '-';
                    } else if (labelText.includes('e-mail')) {
                        const domain = customer.email ? customer.email.split('@')[1] : 'email.de';
                        value.textContent = isPrivat ? customer.email : 'buchhaltung@' + domain;
                    }
                }
                sibling = sibling.nextElementSibling;
            }
        }
    });

    // === BANKVERBINDUNG & BONITÄT ===
    // Generate realistic IBAN for demo
    const ibanNumber = 'DE' + Math.floor(Math.random() * 99).toString().padStart(2, '0') + ' ' +
                       Math.floor(Math.random() * 9999).toString().padStart(4, '0') + ' ' +
                       Math.floor(Math.random() * 9999).toString().padStart(4, '0') + ' ' +
                       Math.floor(Math.random() * 9999).toString().padStart(4, '0') + ' ' +
                       Math.floor(Math.random() * 9999).toString().padStart(4, '0') + ' ' +
                       Math.floor(Math.random() * 99).toString().padStart(2, '0');
    updateFieldByLabel('IBAN', ibanNumber);
    updateFieldByLabel('BIC', 'DEUTDEDB' + Math.floor(Math.random() * 999).toString().padStart(3, '0'));
    updateFieldByLabel('Kreditinstitut', ['Deutsche Bank', 'Commerzbank AG', 'Sparkasse', 'Volksbank'][Math.floor(Math.random() * 4)]);

    // SEPA-Mandat based on status
    const sepaValue = updateFieldByLabel('SEPA-Mandat', '', true);
    if (sepaValue) {
        if (customer.status === 'Bezahlt') {
            sepaValue.innerHTML = '<span class="badge success">Aktiv</span>';
        } else if (customer.status === 'Inkasso') {
            sepaValue.innerHTML = '<span class="badge warning">Widerrufen (' + new Date().toLocaleDateString('de-DE') + ')</span>';
        } else {
            sepaValue.innerHTML = '<span class="badge success">Aktiv</span>';
        }
    }

    // Bonitätsinformationen
    const rating = customer.status === 'Bezahlt' ? 'A' : (customer.status === 'Inkasso' ? 'C-' : 'B');
    const ratingClass = customer.status === 'Bezahlt' ? 'rating-good' : (customer.status === 'Inkasso' ? 'rating-bad' : 'rating-medium');
    const ratingValue = updateFieldByLabel('Internes Rating', '', true);
    if (ratingValue) {
        ratingValue.innerHTML = '<span class="' + ratingClass + '">' + rating + '</span>';
    }

    const creditreformScore = customer.status === 'Bezahlt' ? '180 (geringes Risiko)' : (customer.status === 'Inkasso' ? '312 (hohes Risiko)' : '245 (mittleres Risiko)');
    updateFieldByLabel('Creditreform-Index', creditreformScore);

    const schufaScore = customer.status === 'Bezahlt' ? '95 / 100' : (customer.status === 'Inkasso' ? '78 / 100' : '85 / 100');
    updateFieldByLabel('Schufa-Score', schufaScore);
    updateFieldByLabel('Letzte Prüfung', new Date().toLocaleDateString('de-DE'));

    const zahlungsmoral = customer.status === 'Bezahlt' ? 'Gut' : (customer.status === 'Inkasso' ? 'Mangelhaft' : 'Befriedigend');
    const zahlungsmoralClass = customer.status === 'Bezahlt' ? 'rating-good' : (customer.status === 'Inkasso' ? 'rating-bad' : 'rating-medium');
    const zahlungsmoralValue = updateFieldByLabel('Zahlungsmoral', '', true);
    if (zahlungsmoralValue) {
        zahlungsmoralValue.innerHTML = '<span class="' + zahlungsmoralClass + '">' + zahlungsmoral + '</span>';
    }

    const verzug = customer.dpd || 0;
    updateFieldByLabel('Ø Zahlungsverzug', verzug + ' Tage');

    // === KREDITDETAILS ===
    const produktTyp = isPrivat
        ? ['Ratenkredit', 'Dispositionskredit', 'Kreditkarte', 'Autokredit'][Math.floor(Math.random() * 4)]
        : ['Betriebsmittelkredit', 'Investitionskredit', 'Kontokorrent'][Math.floor(Math.random() * 3)];
    updateFieldByLabel('Vertragsart', produktTyp);

    const vertragsnummer = (isPrivat ? 'RK-' : 'BMK-') + '20' + (18 + Math.floor(Math.random() * 6)) + '-' + Math.floor(Math.random() * 9999999).toString().padStart(7, '0');
    updateFieldByLabel('Vertragsnummer', vertragsnummer);

    const ursprungsbetrag = customer.restschuld > 0 ? customer.restschuld * (1 + Math.random() * 0.5) : (Math.random() * 50000 + 5000);
    updateFieldByLabel('Ursprungsbetrag', '€' + Math.round(ursprungsbetrag).toLocaleString('de-DE'));

    // Restschuld with color
    const restschuldValue = updateFieldByLabel('Restschuld', '', true);
    if (restschuldValue) {
        if (customer.restschuld === 0 || customer.status === 'Bezahlt') {
            restschuldValue.innerHTML = '<span class="highlight-green" style="color: #22c55e;">€0</span>';
        } else {
            restschuldValue.innerHTML = '<span class="highlight-red">€' + customer.restschuld.toLocaleString('de-DE') + '</span>';
        }
    }

    updateFieldByLabel('Zinssatz', (3 + Math.random() * 5).toFixed(2) + '% p.a.');
    updateFieldByLabel('Monatsrate', '€' + (customer.monatsrate || Math.floor(customer.restschuld / 24) || 0).toLocaleString('de-DE'));
    updateFieldByLabel('Vertragsbeginn', '01.' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '.20' + (18 + Math.floor(Math.random() * 5)));
    updateFieldByLabel('Vertragslaufzeit', (60 + Math.floor(Math.random() * 60)) + ' Monate');
    updateFieldByLabel('Restlaufzeit', Math.floor(Math.random() * 36) + ' Monate');
    updateFieldByLabel('Sicherheiten', isPrivat ? 'Keine' : 'Bürgschaft GF, Inventar');
    updateFieldByLabel('Sicherheitenwert', isPrivat ? '-' : '€' + Math.floor(customer.restschuld * 0.7).toLocaleString('de-DE') + ' (geschätzt)');

    // Stage based on status
    const stageValue = updateFieldByLabel('Stage', '', true);
    if (stageValue) {
        if (customer.status === 'Bezahlt') {
            stageValue.innerHTML = '<span class="badge success">Abgeschlossen</span>';
        } else if (customer.status === 'Inkasso') {
            stageValue.innerHTML = '<span class="badge danger">Stage 3 (NPL)</span>';
        } else {
            stageValue.innerHTML = '<span class="badge warning">Stage 2</span>';
        }
    }

    // DPD
    const dpdValue = updateFieldByLabel('DPD', '', true);
    if (dpdValue) {
        const dpd = customer.dpd || 0;
        if (dpd === 0) {
            dpdValue.innerHTML = '<span class="highlight-green" style="color: #22c55e;">0 Tage</span>';
        } else {
            dpdValue.innerHTML = '<span class="highlight-red">' + dpd + ' Tage</span>';
        }
    }

    // Show status badge for completed cases
    if (customer.statusBadge === 'success') {
        const headerActions = modal.querySelector('.modal-header-actions');
        let statusIndicator = modal.querySelector('.status-indicator-success');
        if (!statusIndicator && headerActions) {
            statusIndicator = document.createElement('span');
            statusIndicator.className = 'status-indicator-success';
            statusIndicator.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ' + customer.statusText;
            statusIndicator.style.cssText = 'display: flex; align-items: center; gap: 6px; color: #22c55e; font-size: 13px; font-weight: 500; margin-right: 12px;';
            headerActions.insertBefore(statusIndicator, headerActions.firstChild);
        }
    } else {
        const statusIndicator = modal.querySelector('.status-indicator-success');
        if (statusIndicator) statusIndicator.remove();
    }

    console.log('Stammdaten update complete for:', customer.name);
}

// Generate dynamic transaction rows for a specific product
function generateProductTransactions(product, customer) {
    const produktTyp = product.typ.toLowerCase();
    const saldo = product.saldo || 0;
    const rate = product.rate || customer.monatsrate || 0;
    const limit = product.limit || 0;
    const isBeglichen = product.status === 'Beglichen' || product.status === 'Getilgt' || product.status === 'Ausgeglichen';
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

        rows.push(`<tr>
            <td>05.12.2025</td>
            <td>Lastschrift Miete</td>
            <td class="negative">-€${Math.round((customer.ausgabenMonatlich || 2500) * 0.35).toLocaleString('de-DE')},00</td>
            <td>€${(saldo + 285 + Math.round((customer.ausgabenMonatlich || 2500) * 0.35)).toLocaleString('de-DE')}</td>
            <td><span class="tx-badge">Gebucht</span></td>
        </tr>`);

        return rows.join('');
    }

    // For Baufinanzierung: Show monthly mortgage payments
    if (produktTyp.includes('baufinanzierung') || produktTyp.includes('hypothek')) {
        const monatsrate = product.rate || 1450;
        const isAusstehend = product.status && product.status.includes('offen');
        const rows = [];

        rows.push(`<tr ${isAusstehend ? 'class="highlight-row"' : ''}>
            <td>01.12.2025</td>
            <td>Monatsrate Dezember</td>
            <td class="negative">-€${monatsrate.toLocaleString('de-DE')},00</td>
            <td>€${saldo.toLocaleString('de-DE')}</td>
            <td><span class="tx-badge ${isAusstehend ? 'warning' : ''}">${isAusstehend ? 'Ausstehend' : 'Gebucht'}</span></td>
        </tr>`);

        rows.push(`<tr ${isAusstehend ? 'class="highlight-row"' : ''}>
            <td>01.11.2025</td>
            <td>Monatsrate November</td>
            <td class="negative">-€${monatsrate.toLocaleString('de-DE')},00</td>
            <td>€${(saldo + monatsrate).toLocaleString('de-DE')}</td>
            <td><span class="tx-badge ${isAusstehend ? 'warning' : ''}">${isAusstehend ? 'Ausstehend' : 'Gebucht'}</span></td>
        </tr>`);

        rows.push(`<tr>
            <td>01.10.2025</td>
            <td>Monatsrate Oktober</td>
            <td class="negative">-€${monatsrate.toLocaleString('de-DE')},00</td>
            <td>€${(saldo + monatsrate * 2).toLocaleString('de-DE')}</td>
            <td><span class="tx-badge">Gebucht</span></td>
        </tr>`);

        rows.push(`<tr>
            <td>01.09.2025</td>
            <td>Monatsrate September</td>
            <td class="negative">-€${monatsrate.toLocaleString('de-DE')},00</td>
            <td>€${(saldo + monatsrate * 3).toLocaleString('de-DE')}</td>
            <td><span class="tx-badge">Gebucht</span></td>
        </tr>`);

        return rows.join('');
    }

    // For Ratenkredit: Show monthly installments
    if (produktTyp.includes('ratenkredit') || produktTyp.includes('betriebsmittel') || produktTyp.includes('investitions')) {
        const monatsrate = rate || customer.monatsrate || 180;
        const rows = [];

        if (isBeglichen && product.letzteZahlung) {
            rows.push(`<tr>
                <td>${customer.letzteZahlung?.datum || '16.12.2025'}</td>
                <td>Schlusszahlung - Kredit getilgt</td>
                <td class="positive">+€${product.letzteZahlung.toLocaleString('de-DE')}</td>
                <td>€0</td>
                <td><span class="tx-badge success">Abgeschlossen</span></td>
            </tr>`);

            rows.push(`<tr>
                <td>01.12.2025</td>
                <td>Letzte reguläre Rate</td>
                <td class="positive">+€${monatsrate.toLocaleString('de-DE')}</td>
                <td>€${product.letzteZahlung.toLocaleString('de-DE')}</td>
                <td><span class="tx-badge">Gebucht</span></td>
            </tr>`);
        } else {
            const isUeberfaellig = dpd > 0;

            rows.push(`<tr ${isUeberfaellig ? 'class="highlight-row"' : ''}>
                <td>01.12.2025</td>
                <td>Monatliche Rate - Fällig</td>
                <td class="negative">-€${monatsrate.toLocaleString('de-DE')}</td>
                <td>€${saldo.toLocaleString('de-DE')}</td>
                <td><span class="tx-badge ${isUeberfaellig ? 'danger' : ''}">${isUeberfaellig ? 'Überfällig' : 'Gebucht'}</span></td>
            </tr>`);

            rows.push(`<tr>
                <td>01.11.2025</td>
                <td>Monatliche Rate</td>
                <td class="positive">+€${monatsrate.toLocaleString('de-DE')}</td>
                <td>€${(saldo + monatsrate).toLocaleString('de-DE')}</td>
                <td><span class="tx-badge">Gebucht</span></td>
            </tr>`);

            rows.push(`<tr>
                <td>01.10.2025</td>
                <td>Monatliche Rate</td>
                <td class="positive">+€${monatsrate.toLocaleString('de-DE')}</td>
                <td>€${(saldo + monatsrate * 2).toLocaleString('de-DE')}</td>
                <td><span class="tx-badge">Gebucht</span></td>
            </tr>`);
        }

        return rows.join('');
    }

    // For Kreditkarte: Show card transactions
    if (produktTyp.includes('kreditkarte')) {
        const minBetrag = rate || 120;
        const rows = [];

        if (isBeglichen) {
            rows.push(`<tr>
                <td>${customer.letzteZahlung?.datum || '18.12.2025'}</td>
                <td>Vollständige Tilgung</td>
                <td class="positive">+€${(product.letzteZahlung || saldo).toLocaleString('de-DE')}</td>
                <td>€0</td>
                <td><span class="tx-badge success">Abgeschlossen</span></td>
            </tr>`);
        } else {
            const isUeberfaellig = dpd > 0;

            rows.push(`<tr ${isUeberfaellig ? 'class="highlight-row"' : ''}>
                <td>01.12.2025</td>
                <td>Mindestbetrag fällig</td>
                <td class="negative">-€${minBetrag.toLocaleString('de-DE')}</td>
                <td>€${saldo.toLocaleString('de-DE')}</td>
                <td><span class="tx-badge ${isUeberfaellig ? 'danger' : ''}">${isUeberfaellig ? 'Überfällig' : 'Fällig'}</span></td>
            </tr>`);

            rows.push(`<tr>
                <td>28.11.2025</td>
                <td>Einkauf Online-Shop</td>
                <td class="negative">-€89,90</td>
                <td>€${(saldo - 89.9).toLocaleString('de-DE')}</td>
                <td><span class="tx-badge">Gebucht</span></td>
            </tr>`);

            rows.push(`<tr>
                <td>15.11.2025</td>
                <td>Restaurant Zahlung</td>
                <td class="negative">-€45,80</td>
                <td>€${(saldo - 89.9 - 45.8).toLocaleString('de-DE')}</td>
                <td><span class="tx-badge">Gebucht</span></td>
            </tr>`);
        }

        return rows.join('');
    }

    // Default: Generic transactions
    return `<tr>
        <td>01.12.2025</td>
        <td>Transaktion</td>
        <td>€${rate.toLocaleString('de-DE')}</td>
        <td>€${saldo.toLocaleString('de-DE')}</td>
        <td><span class="tx-badge">Gebucht</span></td>
    </tr>`;
}

// Update Konten & Finanzen tab - comprehensive update
function updateKontenFields(modal, customer) {
    const kontenTab = modal.querySelector('#tab-konten');
    if (!kontenTab) return;

    const isPrivat = customer.type === 'Privat';
    const isBezahlt = customer.status === 'Bezahlt';

    // Update KPI values
    const kpis = kontenTab.querySelectorAll('.finanzen-kpi');
    if (kpis.length >= 5) {
        kpis[0].querySelector('.kpi-value').textContent = customer.krediteAnzahl || (isBezahlt ? 0 : 1);
        kpis[1].querySelector('.kpi-value').textContent = '€' + (customer.gesamtforderung || 0).toLocaleString('de-DE');
        kpis[2].querySelector('.kpi-value').textContent = '€' + (customer.monatsrate || 0).toLocaleString('de-DE');
        kpis[3].querySelector('.kpi-value').textContent = '€' + (customer.ueberfaellig || 0).toLocaleString('de-DE');
        kpis[4].querySelector('.kpi-value').textContent = (customer.rueckgabequote || 0) + '%';

        // Color coding for bezahlt
        if (isBezahlt) {
            kpis[1].querySelector('.kpi-value').style.color = '#22c55e';
            kpis[3].querySelector('.kpi-value').style.color = '#22c55e';
            kpis[4].querySelector('.kpi-value').style.color = '#22c55e';
        }
    }

    // Update Forderungen breakdown
    const forderungRows = kontenTab.querySelectorAll('.forderung-breakdown-row');
    if (forderungRows.length >= 4) {
        forderungRows[0].querySelector('.value').textContent = '€' + (customer.hauptforderung || 0).toLocaleString('de-DE');
        forderungRows[1].querySelector('.value').textContent = '€' + (customer.zinsen || 0).toLocaleString('de-DE');
        forderungRows[2].querySelector('.value').textContent = '€' + (customer.mahngebuehren || 0).toLocaleString('de-DE');
        forderungRows[3].querySelector('.value').textContent = '€' + (customer.inkassokosten || 0).toLocaleString('de-DE');
    }

    // Update credit product header and details using customer's actual products
    const productName = kontenTab.querySelector('.credit-product-name');
    const productNumber = kontenTab.querySelector('.credit-product-number');
    const saldoValue = kontenTab.querySelector('.amount-value.danger, .amount-value.success');
    const statusBadge = kontenTab.querySelector('.credit-status-badge');

    // Use customer's actual products if available
    const produkte = customer.produkte || [];
    const hauptProdukt = produkte.length > 0 ? produkte[0] : null;

    if (productName) {
        productName.textContent = hauptProdukt ? hauptProdukt.typ : (isPrivat ? 'Ratenkredit' : 'Betriebsmittelkredit');
    }
    if (productNumber) {
        productNumber.textContent = hauptProdukt ? hauptProdukt.nummer : 'Keine Daten';
    }
    if (saldoValue) {
        const saldo = hauptProdukt ? hauptProdukt.saldo : customer.restschuld;
        saldoValue.textContent = '€' + (saldo || 0).toLocaleString('de-DE');
        saldoValue.className = 'amount-value ' + (saldo === 0 ? 'success' : 'danger');
    }
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

    // Update credit product container class based on first product
    const productContainer = kontenTab.querySelector('.credit-product-large');
    if (productContainer) {
        const containerClass = hauptProdukt ? hauptProdukt.badge : (isBezahlt ? 'success' : (customer.dpd > 30 ? 'danger' : 'warning'));
        productContainer.className = 'credit-product-large ' + containerClass;
    }

    // Update table data based on product type
    const tbody = kontenTab.querySelector('.credit-tx-table tbody');
    if (tbody) {
        const produktTyp = hauptProdukt ? hauptProdukt.typ : '';
        const isKreditkarte = produktTyp.toLowerCase().includes('kreditkarte');
        const isRatenkredit = produktTyp.toLowerCase().includes('ratenkredit') || produktTyp.toLowerCase().includes('baufinanzierung');
        const isDispo = produktTyp.toLowerCase().includes('dispo');
        const rate = customer.monatsrate || 250;
        const saldo = hauptProdukt ? hauptProdukt.saldo : customer.restschuld;

        if (isBezahlt) {
            // Bezahlt: Show final payment - use letzteZahlung if available
            const zahlung = customer.letzteZahlung || {};
            const zahlungsBetrag = zahlung.betrag || rate;
            const zahlungsDatum = zahlung.datum || customer.statusText?.match(/\d{2}\.\d{2}\.\d{4}/)?.[0] || '15.12.2025';
            const zahlungsTyp = zahlung.typ || 'Schlusszahlung';
            tbody.innerHTML = `
                <tr>
                    <td>${zahlungsDatum}</td>
                    <td>${zahlungsTyp} - Kredit getilgt</td>
                    <td class="positive">+€${zahlungsBetrag.toLocaleString('de-DE')}</td>
                    <td>€0</td>
                    <td><span class="tx-badge success">Abgeschlossen</span></td>
                </tr>
                <tr>
                    <td>01.12.2025</td>
                    <td>Reguläre Ratenzahlung</td>
                    <td class="positive">+€${rate.toLocaleString('de-DE')}</td>
                    <td>€${zahlungsBetrag.toLocaleString('de-DE')}</td>
                    <td><span class="tx-badge">Gebucht</span></td>
                </tr>
            `;
        } else if (isRatenkredit) {
            // Ratenkredit: Show monthly rate payments
            const dpd = customer.dpd || 0;
            const ueberfaelligClass = dpd > 0 ? 'highlight-row' : '';
            const ueberfaelligBadge = dpd > 0 ? '<span class="tx-badge danger">Überfällig</span>' : '<span class="tx-badge">Gebucht</span>';
            tbody.innerHTML = `
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
                <tr>
                    <td>01.10.2025</td>
                    <td>Monatliche Rate</td>
                    <td class="positive">+€${rate.toLocaleString('de-DE')}</td>
                    <td>€${(saldo + rate * 2).toLocaleString('de-DE')}</td>
                    <td><span class="tx-badge">Gebucht</span></td>
                </tr>
                <tr>
                    <td>01.09.2025</td>
                    <td>Monatliche Rate</td>
                    <td class="positive">+€${rate.toLocaleString('de-DE')}</td>
                    <td>€${(saldo + rate * 3).toLocaleString('de-DE')}</td>
                    <td><span class="tx-badge">Gebucht</span></td>
                </tr>
            `;
        } else if (isDispo) {
            // Dispo: Show account movements
            tbody.innerHTML = `
                <tr>
                    <td>18.12.2025</td>
                    <td>Abhebung Geldautomat</td>
                    <td class="negative">-€200,00</td>
                    <td>€${saldo.toLocaleString('de-DE')}</td>
                    <td><span class="tx-badge">Gebucht</span></td>
                </tr>
                <tr>
                    <td>15.12.2025</td>
                    <td>Gehaltseingang</td>
                    <td class="positive">+€${(customer.einkommenMonatlich || 2500).toLocaleString('de-DE')}</td>
                    <td>€${(saldo - 200).toLocaleString('de-DE')}</td>
                    <td><span class="tx-badge">Gebucht</span></td>
                </tr>
                <tr>
                    <td>10.12.2025</td>
                    <td>Lastschrift Miete</td>
                    <td class="negative">-€950,00</td>
                    <td>€${(saldo + 2300).toLocaleString('de-DE')}</td>
                    <td><span class="tx-badge">Gebucht</span></td>
                </tr>
            `;
        }
        // Kreditkarte: Keep default HTML content (purchases)
    }

    // Update Einkommen & Ausgaben section - show/hide based on data availability
    const eaSection = kontenTab.querySelector('.einkommen-ausgaben-compact');
    if (eaSection) {
        if (customer.einkommenMonatlich) {
            eaSection.style.display = 'flex';
            const einkommen = customer.einkommenMonatlich || 0;
            const ausgaben = customer.ausgabenMonatlich || 0;
            const differenz = einkommen - ausgaben;
            const differenzClass = differenz >= 0 ? 'positiv' : 'negativ';
            const differenzText = differenz >= 0 ? '+€' + differenz.toLocaleString('de-DE') : '-€' + Math.abs(differenz).toLocaleString('de-DE');

            const eaRows = eaSection.querySelectorAll('.ea-row');
            if (eaRows.length >= 3) {
                eaRows[0].querySelector('.value').textContent = '€' + einkommen.toLocaleString('de-DE');
                eaRows[1].querySelector('.value').textContent = '€' + ausgaben.toLocaleString('de-DE');
                eaRows[2].querySelector('.value').textContent = differenzText;
                eaRows[2].querySelector('.value').className = 'value ' + differenzClass;
            }

            const detailsText = eaSection.querySelector('.details-text');
            if (detailsText && customer.ausgabenDetails) {
                detailsText.textContent = customer.ausgabenDetails;
            }
        } else {
            // Hide section if no income data available
            eaSection.style.display = 'none';
        }
    }

    // Hide/show product sections based on customer's actual products
    const productSections = kontenTab.querySelectorAll('[data-product]');
    const customerProducts = customer.produkte || [];

    // Map product types to data-product attribute values
    const productTypeMap = {
        'kreditkarte': ['kreditkarte', 'credit card'],
        'dispo': ['dispo', 'dispositionskredit', 'kontokorrent', 'kontokorrentkredit'],
        'baufi': ['baufinanzierung', 'baufi', 'hypothek'],
        'ratenkredit-pkw': ['ratenkredit pkw', 'autokredit', 'kfz-kredit', 'kfz kredit'],
        'ratenkredit-moebel': ['ratenkredit möbel', 'möbelkredit']
    };

    // Get list of product types the customer has
    const customerProductTypes = customerProducts.map(p => p.typ.toLowerCase());

    productSections.forEach(section => {
        const dataProduct = section.getAttribute('data-product');
        const matchingTypes = productTypeMap[dataProduct] || [];

        // Check if customer has this product type
        const hasProduct = customerProductTypes.some(customerType =>
            matchingTypes.some(mappedType => customerType.includes(mappedType)) ||
            (dataProduct === 'kreditkarte' && customerType.includes('ratenkredit') && !customerType.includes('pkw') && !customerType.includes('möbel'))
        );

        if (hasProduct) {
            section.style.display = '';
            // Update section with actual product data
            const matchingProduct = customerProducts.find(p => {
                const pType = p.typ.toLowerCase();
                return matchingTypes.some(mt => pType.includes(mt)) ||
                    (dataProduct === 'kreditkarte' && pType.includes('ratenkredit') && !pType.includes('pkw') && !pType.includes('möbel'));
            });
            if (matchingProduct) {
                const nameEl = section.querySelector('.credit-product-name');
                const numberEl = section.querySelector('.credit-product-number');
                const saldoEl = section.querySelector('.amount-value');
                const statusEl = section.querySelector('.credit-status-badge');

                if (nameEl) nameEl.textContent = matchingProduct.typ;
                if (numberEl) numberEl.textContent = matchingProduct.nummer;
                if (saldoEl) saldoEl.textContent = '€' + matchingProduct.saldo.toLocaleString('de-DE');
                if (statusEl) {
                    statusEl.textContent = matchingProduct.status;
                    statusEl.className = 'credit-status-badge ' + (matchingProduct.badge || 'warning');
                }

                // Hide LIMIT for products that don't have limits (Ratenkredit, Baufinanzierung, Investitionskredit, Betriebsmittelkredit)
                const produktTypLower = matchingProduct.typ.toLowerCase();
                const hasLimit = produktTypLower.includes('dispo') ||
                                 produktTypLower.includes('kontokorrent') ||
                                 produktTypLower.includes('kreditkarte');

                const amountItems = section.querySelectorAll('.amount-item');
                amountItems.forEach(item => {
                    const label = item.querySelector('.amount-label');
                    if (label && label.textContent === 'Limit') {
                        item.style.display = hasLimit ? '' : 'none';
                        // Update limit value if product has it
                        if (hasLimit && matchingProduct.limit) {
                            const limitValue = item.querySelector('.amount-value');
                            if (limitValue) limitValue.textContent = '€' + matchingProduct.limit.toLocaleString('de-DE');
                        }
                    }
                    // Update label for non-limit products: "Saldo" -> "Restschuld" for loans
                    if (label && label.textContent === 'Saldo' && !hasLimit) {
                        label.textContent = 'Restschuld';
                    }
                    // For loans with rate, show the rate
                    if (label && label.textContent === 'Rate' && matchingProduct.rate) {
                        const rateValue = item.querySelector('.amount-value');
                        if (rateValue) rateValue.textContent = '€' + matchingProduct.rate.toLocaleString('de-DE') + '/M';
                    }
                });

                // Dynamically populate transaction table for this product
                const tableBody = section.querySelector('.credit-tx-table tbody');
                if (tableBody) {
                    // Filter transactions relevant to this product
                    const productTransactions = generateProductTransactions(matchingProduct, customer);
                    tableBody.innerHTML = productTransactions;
                }

                // Hide chart view, show table view
                const chartView = section.querySelector('.chart-view');
                const tableView = section.querySelector('.table-view');
                if (chartView) chartView.classList.remove('active');
                if (tableView) tableView.classList.add('active');
            }
        } else {
            section.style.display = 'none';
        }
    });

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
            // Bezahlte Kunden: Keine ausstehenden Transaktionen
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

// Update Kommunikation tab with KI summary and dynamic timeline
function updateKommunikationFields(modal, customer) {
    const kommTab = modal.querySelector('#tab-kommunikation');
    if (!kommTab) return;

    const isBezahlt = customer.status === 'Bezahlt';
    const isInkasso = customer.status === 'Inkasso';
    const anrede = customer.type === 'Gewerbe' ? 'Sehr geehrte Damen und Herren' :
                   (customer.ansprechpartner?.includes(',') ? 'Sehr geehrte Frau ' + customer.ansprechpartner.split(',')[0] :
                    'Sehr geehrter Herr ' + (customer.ansprechpartner?.split(' ').pop() || customer.name.split(' ').pop()));

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

    kiSummary.innerHTML = '<div class="ki-summary-mini"><div class="ki-summary-header-mini"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4"></path></svg><span>KI-Zusammenfassung der Kommunikation</span></div><div class="ki-summary-content-mini"><p><strong>' + customer.name + '</strong> - ' + (customer.kernproblem || 'Keine Analyse verfügbar.') + '</p><div class="ki-summary-stats"><span class="stat-item ' + statusClass + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"></circle></svg>' + (customer.workflowStatus || 'Offen') + '</span><span class="stat-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>' + mahnstufeText + '</span><span class="stat-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' + (customer.dpd || 0) + ' DPD</span></div></div></div>';

    // Replace entire timeline based on customer status
    const timeline = kommTab.querySelector('.kommunikation-timeline');
    if (timeline) {
        if (isBezahlt) {
            // Success story timeline
            timeline.innerHTML = '<h4>Kommunikationshistorie</h4>' +
                '<div class="komm-item letter success"><div class="komm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="18" height="18"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div class="komm-content"><div class="komm-header"><span class="komm-type success">Zahlungsbestätigung</span><span class="komm-date">' + (customer.statusText?.match(/\\d{2}\\.\\d{2}\\.\\d{4}/)?.[0] || '16.12.2025') + '</span></div><div class="komm-body"><p><strong>Betreff:</strong> Bestätigung vollständiger Zahlung</p><div class="komm-preview">' + anrede + ',<br><br>wir bestätigen den vollständigen Eingang Ihrer Zahlung. Ihr Konto ist damit ausgeglichen.<br><br>Vielen Dank für die Begleichung der offenen Forderung. Der Fall ist hiermit abgeschlossen.</div></div><div class="komm-meta"><span class="meta-item success">Abgeschlossen</span></div></div></div>' +
                '<div class="komm-item phone success"><div class="komm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></div><div class="komm-content"><div class="komm-header"><span class="komm-type">Telefonat</span><span class="komm-date">' + new Date(Date.now() - 7*24*60*60*1000).toLocaleDateString('de-DE') + '</span></div><div class="komm-body"><p>Erfolgreiches Gespräch - Zahlungsvereinbarung getroffen</p><div class="komm-note"><strong>Notiz:</strong> Kunde hat zugesagt, die offene Forderung bis Ende der Woche vollständig zu begleichen.</div></div><div class="komm-meta"><span class="meta-item success">Vereinbarung erzielt</span><span class="meta-item">Bearbeiter: E. Brenneisen</span></div></div></div>';
        } else if (isInkasso) {
            // Inkasso timeline - keep existing but update names
            const kommItems = kommTab.querySelectorAll('.komm-preview');
            kommItems.forEach(item => {
                let text = item.innerHTML;
                text = text.replace(/Herr Mueller/g, customer.type === 'Gewerbe' ? 'Firma ' + customer.name : customer.ansprechpartner || customer.name);
                text = text.replace(/Mueller GmbH/g, customer.name);
                text = text.replace(/h\.mueller@mueller-gmbh\.de/g, customer.email || 'kunde@email.de');
                text = text.replace(/mueller-gmbh\.de/g, customer.email ? customer.email.split('@')[1] : 'email.de');
                item.innerHTML = text;
            });
        } else if (customer.zahlungszusage) {
            // Case with Zahlungszusage - show promise in timeline
            const zusage = customer.zahlungszusage;
            timeline.innerHTML = '<h4>Kommunikationshistorie</h4>' +
                '<div class="komm-item phone success"><div class="komm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></div><div class="komm-content"><div class="komm-header"><span class="komm-type" style="background: #8b5cf6; color: white;">Zahlungszusage</span><span class="komm-date">' + zusage.vereinbart + '</span></div><div class="komm-body"><p><strong>Vereinbart:</strong> €' + zusage.betrag.toLocaleString('de-DE') + ' bis ' + zusage.datum + '</p><div class="komm-note"><strong>Notiz:</strong> ' + zusage.notiz + '</div></div><div class="komm-meta"><span class="meta-item" style="background: #f3e8ff; color: #7c3aed;">Zusage offen - Fällig am ' + zusage.datum + '</span><span class="meta-item">Bearbeiter: E. Brenneisen</span></div></div></div>' +
                '<div class="komm-item letter"><div class="komm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div><div class="komm-content"><div class="komm-header"><span class="komm-type">2. Mahnung</span><span class="komm-date">' + new Date(Date.now() - 5*24*60*60*1000).toLocaleDateString('de-DE') + '</span></div><div class="komm-body"><p><strong>Betreff:</strong> Zweite Zahlungserinnerung</p><div class="komm-preview">' + anrede + ',<br><br>trotz unserer ersten Erinnerung ist die fällige Zahlung von <strong>€' + (customer.ueberfaellig || customer.restschuld || 0).toLocaleString('de-DE') + '</strong> noch nicht eingegangen. Bitte begleichen Sie den Betrag umgehend.</div></div><div class="komm-meta"><span class="meta-item">Automatisch versendet</span></div></div></div>' +
                '<div class="komm-item system"><div class="komm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div><div class="komm-content"><div class="komm-header"><span class="komm-type">System</span><span class="komm-date">' + (customer.zahlungsziel || '01.12.2025') + '</span></div><div class="komm-body"><p>Fall automatisch erstellt - Zahlung überfällig seit Fälligkeit ' + (customer.zahlungsziel || '01.12.2025') + '</p></div><div class="komm-meta"><span class="meta-item">Automatisch</span></div></div></div>';
        } else {
            // New case timeline without Zahlungszusage
            timeline.innerHTML = '<h4>Kommunikationshistorie</h4>' +
                '<div class="komm-item letter"><div class="komm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div><div class="komm-content"><div class="komm-header"><span class="komm-type">Zahlungserinnerung</span><span class="komm-date">' + new Date().toLocaleDateString('de-DE') + '</span></div><div class="komm-body"><p><strong>Betreff:</strong> Freundliche Zahlungserinnerung</p><div class="komm-preview">' + anrede + ',<br><br>bei Überprüfung unserer Konten haben wir festgestellt, dass die fällige Rate noch nicht eingegangen ist. Wir bitten Sie, den offenen Betrag von <strong>€' + (customer.restschuld || 0).toLocaleString('de-DE') + '</strong> zeitnah zu überweisen.<br><br>Sollte sich Ihre Zahlung mit diesem Schreiben überschneiden, betrachten Sie dieses bitte als gegenstandslos.</div></div><div class="komm-meta"><span class="meta-item">Automatisch versendet</span></div></div></div>' +
                '<div class="komm-item system"><div class="komm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div><div class="komm-content"><div class="komm-header"><span class="komm-type">System</span><span class="komm-date">' + new Date(Date.now() - 3*24*60*60*1000).toLocaleDateString('de-DE') + '</span></div><div class="komm-body"><p>Fall automatisch erstellt - Zahlung überfällig seit ' + (customer.dpd || 0) + ' Tagen</p></div><div class="komm-meta"><span class="meta-item">Automatisch</span></div></div></div>';
        }
    }

    // Update email from field if it exists
    const metaFrom = kommTab.querySelector('.komm-item.incoming .komm-meta .meta-item');
    if (metaFrom && customer.email) {
        metaFrom.textContent = 'Von: ' + customer.email;
    }
}

// Update KI-Analyse tab - comprehensive update
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
                    ul.innerHTML = '<li>Zahlungseingang bestätigt (' + (customer.statusText?.match(/\\d{2}\\.\\d{2}\\.\\d{4}/)?.[0] || '16.12.2025') + ')</li><li>Erfolgreiche Zahlungsvereinbarung</li><li>Fall als abgeschlossen markiert</li>';
                } else if (isInkasso) {
                    ul.innerHTML = '<li>' + customer.mahnstufe + '. Mahnung versendet</li><li>Telefonversuche nicht erreicht</li><li>Inkasso-Verfahren eingeleitet</li><li>Letzte Teilzahlung vor ' + Math.floor(Math.random() * 60 + 30) + ' Tagen</li>';
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

        // Color coding
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
            'eskalation': 'Eskalation',
            'prioritaet': 'Priorität',
            'restrukturierung': 'Restrukturierung',
            'abwicklung': 'Abwicklung',
            'abgeschlossen': 'Abgeschlossen'
        };
        const segmentClasses = {
            'eskalation': 'escalate',
            'prioritaet': 'priority',
            'restrukturierung': 'restructure',
            'abwicklung': 'writeoff',
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

// Update Haushalt/GuV tab based on customer type (Privat vs Gewerbe)
function updateHaushaltGuvTab(customer) {
    const tabButton = document.getElementById('tabHaushaltGuv');
    const haushaltSection = document.getElementById('haushaltSection');
    const guvSection = document.getElementById('guvSection');

    if (!tabButton || !haushaltSection || !guvSection) return;

    // Only show GuV for explicitly marked business customers (type === 'Gewerbe')
    const isGewerbe = customer.type === 'Gewerbe';

    if (isGewerbe) {
        // Show GuV for business customers
        tabButton.textContent = 'GuV';
        haushaltSection.style.display = 'none';
        guvSection.style.display = 'block';

        // Update GuV values based on customer data
        if (customer.guv) {
            updateGuvFields(customer);
        }
    } else {
        // Show Haushaltsrechnung for private customers
        tabButton.textContent = 'Haushaltsrechnung';
        haushaltSection.style.display = 'block';
        guvSection.style.display = 'none';
    }
}

// Update GuV fields with customer data
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

// Helper to format currency
function formatCurrency(amount) {
    if (amount === undefined || amount === null) return '€0';
    const formatted = Math.abs(amount).toLocaleString('de-DE');
    return (amount < 0 ? '-' : '') + '€' + formatted;
}

// Update Haushaltsrechnung tab fields
function updateHaushaltFields(modal, customer) {
    const haushaltTab = modal.querySelector('#tab-haushalt');
    if (!haushaltTab || !customer.haushalt) {
        console.log('Haushalt tab not found or no haushalt data');
        return;
    }

    const h = customer.haushalt;
    const isGewerbe = customer.type === 'Gewerbe';

    // Calculate totals
    const einnahmenGesamt = (h.einnahmen.gehalt || 0) + (h.einnahmen.neben || 0) + (h.einnahmen.sozial || 0) + (h.einnahmen.sonstige || 0);
    const fixkostenGesamt = (h.fixkosten.miete || 0) + (h.fixkosten.nebenkosten || 0) + (h.fixkosten.versicherung || 0) + (h.fixkosten.kredite || 0) + (h.fixkosten.abos || 0);
    const lebenshaltungGesamt = (h.lebenshaltung.essen || 0) + (h.lebenshaltung.mobilitaet || 0) + (h.lebenshaltung.gesundheit || 0) + (h.lebenshaltung.freizeit || 0) + (h.lebenshaltung.sonstige || 0);
    const ausgabenGesamt = fixkostenGesamt + lebenshaltungGesamt;
    const freiVerfuegbar = einnahmenGesamt - ausgabenGesamt;
    const sparquote = einnahmenGesamt > 0 ? Math.round((freiVerfuegbar / einnahmenGesamt) * 100) : 0;

    // Helper to format currency
    const formatEuro = (val) => '€' + val.toLocaleString('de-DE');

    // Update summary cards
    const summaryEinnahmen = haushaltTab.querySelector('#haushaltEinnahmen');
    const summaryAusgaben = haushaltTab.querySelector('#haushaltAusgaben');
    const summaryVerfuegbar = haushaltTab.querySelector('#haushaltVerfuegbar');
    const summarySparquote = haushaltTab.querySelector('#haushaltSparquote');

    if (summaryEinnahmen) summaryEinnahmen.textContent = formatEuro(einnahmenGesamt);
    if (summaryAusgaben) summaryAusgaben.textContent = formatEuro(ausgabenGesamt);
    if (summaryVerfuegbar) {
        summaryVerfuegbar.textContent = formatEuro(freiVerfuegbar);
        summaryVerfuegbar.style.color = freiVerfuegbar >= 0 ? '#22c55e' : '#ef4444';
    }
    if (summarySparquote) {
        summarySparquote.textContent = sparquote + '%';
        summarySparquote.style.color = sparquote >= 10 ? '#22c55e' : (sparquote >= 0 ? '#f59e0b' : '#ef4444');
    }

    // Update summary detail text
    const einnahmenDetail = haushaltTab.querySelector('#haushaltEinnahmenDetail');
    const ausgabenDetail = haushaltTab.querySelector('#haushaltAusgabenDetail');
    if (einnahmenDetail) einnahmenDetail.textContent = isGewerbe ? 'Betriebseinnahmen' : 'Nettoeinkommen';
    if (ausgabenDetail) ausgabenDetail.textContent = 'Fixkosten + Lebenshaltung';

    // Update Einnahmen breakdown
    haushaltTab.querySelector('#einnahmenGehalt').textContent = formatEuro(h.einnahmen.gehalt || 0);
    haushaltTab.querySelector('#einnahmenNeben').textContent = formatEuro(h.einnahmen.neben || 0);
    haushaltTab.querySelector('#einnahmenSozial').textContent = formatEuro(h.einnahmen.sozial || 0);
    haushaltTab.querySelector('#einnahmenSonstige').textContent = formatEuro(h.einnahmen.sonstige || 0);
    haushaltTab.querySelector('#einnahmenGesamt').textContent = formatEuro(einnahmenGesamt);

    // Update Fixkosten breakdown
    haushaltTab.querySelector('#fixkostenMiete').textContent = formatEuro(h.fixkosten.miete || 0);
    haushaltTab.querySelector('#fixkostenNebenkosten').textContent = formatEuro(h.fixkosten.nebenkosten || 0);
    haushaltTab.querySelector('#fixkostenVersicherung').textContent = formatEuro(h.fixkosten.versicherung || 0);
    haushaltTab.querySelector('#fixkostenKredite').textContent = formatEuro(h.fixkosten.kredite || 0);
    haushaltTab.querySelector('#fixkostenAbos').textContent = formatEuro(h.fixkosten.abos || 0);
    haushaltTab.querySelector('#fixkostenGesamt').textContent = formatEuro(fixkostenGesamt);

    // Update Lebenshaltung breakdown
    haushaltTab.querySelector('#lebenshaltungEssen').textContent = formatEuro(h.lebenshaltung.essen || 0);
    haushaltTab.querySelector('#lebenshaltungMobilitaet').textContent = formatEuro(h.lebenshaltung.mobilitaet || 0);
    haushaltTab.querySelector('#lebenshaltungGesundheit').textContent = formatEuro(h.lebenshaltung.gesundheit || 0);
    haushaltTab.querySelector('#lebenshaltungFreizeit').textContent = formatEuro(h.lebenshaltung.freizeit || 0);
    haushaltTab.querySelector('#lebenshaltungSonstige').textContent = formatEuro(h.lebenshaltung.sonstige || 0);
    haushaltTab.querySelector('#lebenshaltungGesamt').textContent = formatEuro(lebenshaltungGesamt);

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

// Update Open Finance tab fields
function updateOpenFinanceFields(modal, customer) {
    const openfinanceTab = modal.querySelector('#tab-openfinance');
    if (!openfinanceTab || !customer.openFinance) {
        console.log('Open Finance tab not found or no openFinance data');
        return;
    }

    const of = customer.openFinance;

    // Update Consent Grid
    const consentGrid = openfinanceTab.querySelector('#consentGrid');
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

    // Update Externe Konten table
    const externeKontenBody = openfinanceTab.querySelector('#externeKontenBody');
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

    // Update Externe Versicherungen table
    const externeVersicherungenBody = openfinanceTab.querySelector('#externeVersicherungenBody');
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

// Generate customer-specific factors
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

// Close customer detail modal
function closeCustomerDetail() {
    const modal = document.getElementById('customerDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show customer tab in modal
function showCustomerTab(tabName) {
    const modal = document.getElementById('customerDetailModal');
    if (!modal) return;

    // Update modal tabs (scoped to modal)
    modal.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    modal.querySelectorAll('.modal-tab').forEach(tab => {
        const onclickAttr = tab.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabName}'`)) {
            tab.classList.add('active');
        }
    });

    // Update tab content (scoped to modal)
    modal.querySelectorAll('.customer-tab').forEach(content => {
        content.classList.remove('active');
    });

    // Use modal.querySelector instead of document.getElementById to avoid
    // conflicts with duplicate IDs (e.g., tab-stammdaten exists in both
    // index.html for Agentur and modal-customer-detail.html)
    const targetTab = modal.querySelector(`#tab-${tabName}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    console.log('Customer tab:', tabName);
}

// Toggle between chart and table view for credit products
function toggleCreditView(button, viewType) {
    const card = button.closest('.credit-product-large');
    if (!card) return;

    // Update toggle buttons
    card.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');

    // Update views
    card.querySelectorAll('.credit-view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = card.querySelector(`.${viewType}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }

    console.log('Credit view toggled:', viewType);
}

// ========================================
