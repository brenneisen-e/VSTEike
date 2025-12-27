/**
 * Banken Customer Module
 * ES6 Module for customer details, CRM, activities
 */

// ========================================
// STATE
// ========================================

let currentCustomerId = null;

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
    // Eskalation-Segment
    'K-2024-0001': {
        name: 'Mueller GmbH', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Musterstraße 123, 38100 Braunschweig', telefon: '+49 531 123456',
        email: 'info@mueller-gmbh.de', ansprechpartner: 'Hans Mueller',
        branche: 'Gastronomie', restschuld: 125000, status: 'Inkasso',
        dpd: 35, willingness: 25, ability: 60, segment: 'eskalation',
        kernproblem: 'Gewerbekunde mit Liquiditätsengpässen seit Q3 2025. Zahlungen bleiben regelmäßig aus trotz nachgewiesener Zahlungsfähigkeit.'
    },
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
    // Priorität-Segment
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
    // Restrukturierung-Segment
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
    // Abwicklung-Segment
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
    // Zusätzliche Kunden aus News-Bereich
    'K-2024-7234': {
        name: 'Braun, Thomas', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Lindenweg 45, 30159 Hannover', telefon: '+49 511 987654',
        email: 't.braun@email.de', ansprechpartner: 'Thomas Braun',
        branche: 'Angestellter', restschuld: 0, status: 'Aktiv',
        dpd: 0, willingness: 90, ability: 85, segment: 'stabil',
        kernproblem: 'Ratenkredit vollständig beglichen. Kunde als zuverlässig eingestuft.'
    },
    'K-2024-8847': {
        name: 'Müller, Hans', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Waldstraße 22, 38100 Braunschweig', telefon: '+49 531 998877',
        email: 'h.mueller@email.de', ansprechpartner: 'Hans Müller',
        branche: 'Angestellter', restschuld: 4230, status: 'Offen',
        dpd: 18, willingness: 85, ability: 70, segment: 'prioritaet',
        kernproblem: 'Dezember-Rate 18 Tage überfällig. Kunde hat Gehaltsverspätung gemeldet.'
    },
    'K-2024-8846': {
        name: 'Schmidt GmbH', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Gewerbepark 12, 30159 Hannover', telefon: '+49 511 334455',
        email: 'info@schmidt-gmbh.de', ansprechpartner: 'Klaus Schmidt',
        branche: 'Handel', restschuld: 12890, status: 'Offen',
        dpd: 18, willingness: 70, ability: 60, segment: 'prioritaet',
        kernproblem: 'Kontokorrent überzogen. Saisonale Flaute, Zahlung erwartet.'
    },
    'K-2024-8845': {
        name: 'Weber, Anna', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Blumenweg 8, 38100 Braunschweig', telefon: '+49 531 556677',
        email: 'a.weber@email.de', ansprechpartner: 'Anna Weber',
        branche: 'Angestellte', restschuld: 2150, status: 'Offen',
        dpd: 18, willingness: 80, ability: 65, segment: 'prioritaet',
        kernproblem: 'Kreditkartenschuld. Kurzzeitiger Engpass, Zahlung zugesagt.'
    },
    'K-2024-6891': {
        name: 'Klein KG', type: 'Gewerbe', rechtsform: 'KG',
        adresse: 'Industrieweg 55, 30159 Hannover', telefon: '+49 511 778899',
        email: 'info@klein-kg.de', ansprechpartner: 'Herbert Klein',
        branche: 'Produktion', restschuld: 0, status: 'Abgeschlossen',
        dpd: 0, willingness: 95, ability: 90, segment: 'stabil',
        kernproblem: 'Betriebsmittelkredit. Vollständige Tilgung nach Ratenvereinbarung.'
    },
    'K-2024-6234': {
        name: 'Fischer, Maria', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Seestraße 34, 38100 Braunschweig', telefon: '+49 531 112233',
        email: 'm.fischer@email.de', ansprechpartner: 'Maria Fischer',
        branche: 'Selbstständig', restschuld: 1500, status: 'Teilzahlung',
        dpd: 5, willingness: 85, ability: 70, segment: 'prioritaet',
        kernproblem: 'Teilzahlung erfolgt, Restzahlung nächste Woche erwartet.'
    },
    'K-2024-5982': {
        name: 'Meier, Stefan', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Gartenweg 22, 30159 Hannover', telefon: '+49 511 445566',
        email: 's.meier@email.de', ansprechpartner: 'Stefan Meier',
        branche: 'Angestellter', restschuld: 0, status: 'Abgeschlossen',
        dpd: 0, willingness: 90, ability: 85, segment: 'stabil',
        kernproblem: 'Dispositionskredit vollständig ausgeglichen.'
    },
    'K-2024-5876': {
        name: 'Schneider Logistik', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Frachtstraße 88, 38100 Braunschweig', telefon: '+49 531 889900',
        email: 'info@schneider-logistik.de', ansprechpartner: 'Thomas Schneider',
        branche: 'Logistik', restschuld: 0, status: 'Abgeschlossen',
        dpd: 0, willingness: 95, ability: 90, segment: 'stabil',
        kernproblem: 'Kontokorrent erfolgreich restrukturiert und beglichen.'
    },
    // Aufgaben-Kunden (aus section-aufgaben.html)
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
    const kontenTab = modal.querySelector('#tab-konten');
    if (!kontenTab) return;

    const isBezahlt = customer.status === 'Bezahlt';

    // Update KPI values
    const kpis = kontenTab.querySelectorAll('.finanzen-kpi');
    if (kpis.length >= 5) {
        const kpiValues = kpis[0]?.querySelector('.kpi-value');
        if (kpiValues) kpiValues.textContent = customer.krediteAnzahl || (isBezahlt ? 0 : 1);

        const kpi1 = kpis[1]?.querySelector('.kpi-value');
        if (kpi1) kpi1.textContent = '€' + (customer.gesamtforderung || 0).toLocaleString('de-DE');

        const kpi2 = kpis[2]?.querySelector('.kpi-value');
        if (kpi2) kpi2.textContent = '€' + (customer.monatsrate || 0).toLocaleString('de-DE');

        const kpi3 = kpis[3]?.querySelector('.kpi-value');
        if (kpi3) kpi3.textContent = '€' + (customer.ueberfaellig || 0).toLocaleString('de-DE');

        const kpi4 = kpis[4]?.querySelector('.kpi-value');
        if (kpi4) kpi4.textContent = (customer.rueckgabequote || 0) + '%';

        if (isBezahlt) {
            kpis[1]?.querySelector('.kpi-value')?.setAttribute('style', 'color: #22c55e');
            kpis[3]?.querySelector('.kpi-value')?.setAttribute('style', 'color: #22c55e');
        }
    }

    // Update Forderungen breakdown
    const forderungRows = kontenTab.querySelectorAll('.forderung-breakdown-row');
    if (forderungRows.length >= 4) {
        const v0 = forderungRows[0]?.querySelector('.value');
        if (v0) v0.textContent = '€' + (customer.hauptforderung || 0).toLocaleString('de-DE');
        const v1 = forderungRows[1]?.querySelector('.value');
        if (v1) v1.textContent = '€' + (customer.zinsen || 0).toLocaleString('de-DE');
        const v2 = forderungRows[2]?.querySelector('.value');
        if (v2) v2.textContent = '€' + (customer.mahngebuehren || 0).toLocaleString('de-DE');
        const v3 = forderungRows[3]?.querySelector('.value');
        if (v3) v3.textContent = '€' + (customer.inkassokosten || 0).toLocaleString('de-DE');
    }

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

function updateKommunikationFields(modal, customer) {
    // Update KI-Analyse Kernproblem
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

// Export current customer ID getter/setter
export const getCurrentCustomerId = () => currentCustomerId;
export const setCurrentCustomerId = (id) => { currentCustomerId = id; };
