/**
 * Banken Chat Module - ES6 Entry Point (ES2024)
 * AI Chat for Collections Dashboard
 */

// ========================================
// CONSTANTS
// ========================================

const DEMO_CUSTOMER_DATA = [
    { id: 'K-2024-0001', name: 'Mueller GmbH', forderung: 125000, dpd: 35, segment: 'eskalation', status: 'Inkasso' },
    { id: 'K-2024-0002', name: 'Schmidt, Peter', forderung: 8450, dpd: 21, segment: 'prioritaet', status: 'Offen' },
    { id: 'K-2024-0003', name: 'Weber KG', forderung: 45780, dpd: 14, segment: 'restrukturierung', status: 'Vereinbarung' },
    { id: 'K-2024-0004', name: 'Braun, Maria', forderung: 3210, dpd: 67, segment: 'abwicklung', status: 'Abschreibung' },
    { id: 'K-2024-0005', name: 'Hoffmann Bau GmbH', forderung: 287500, dpd: 48, segment: 'eskalation', status: 'Inkasso' },
    { id: 'K-2024-0006', name: 'Keller, Thomas', forderung: 15800, dpd: 42, segment: 'eskalation', status: 'Inkasso' },
    { id: 'K-2024-0007', name: 'Autohaus Berger', forderung: 89300, dpd: 55, segment: 'eskalation', status: 'Inkasso' },
    { id: 'K-2024-0008', name: 'Lehmann, Sandra', forderung: 12650, dpd: 18, segment: 'prioritaet', status: 'Offen' },
    { id: 'K-2024-0009', name: 'Meier Elektro OHG', forderung: 34200, dpd: 25, segment: 'prioritaet', status: 'Offen' },
    { id: 'K-2024-0010', name: 'Fischer, Hans', forderung: 6890, dpd: 12, segment: 'prioritaet', status: 'Zusage' },
    { id: 'K-2024-0011', name: 'Bäckerei Schulze', forderung: 67400, dpd: 28, segment: 'restrukturierung', status: 'Vereinbarung' },
    { id: 'K-2024-0012', name: 'Neumann, Klaus', forderung: 156000, dpd: 8, segment: 'restrukturierung', status: 'Vereinbarung' },
    { id: 'K-2024-0013', name: 'Gasthaus zum Löwen', forderung: 112800, dpd: 19, segment: 'restrukturierung', status: 'Vereinbarung' },
    { id: 'K-2024-0014', name: 'Werner, Sabine', forderung: 4560, dpd: 92, segment: 'abwicklung', status: 'Abschreibung' },
    { id: 'K-2024-0015', name: 'Maier Transporte', forderung: 78900, dpd: 78, segment: 'abwicklung', status: 'Abschreibung' },
    { id: 'K-2024-0016', name: 'Zimmermann, Frank', forderung: 2340, dpd: 105, segment: 'abwicklung', status: 'Abschreibung' },
    { id: 'K-2024-8847', name: 'Müller, Hans', forderung: 4230, dpd: 2, segment: 'prioritaet', status: 'Offen' },
    { id: 'K-2024-8846', name: 'Schmidt GmbH', forderung: 12890, dpd: 3, segment: 'prioritaet', status: 'Offen' },
    { id: 'K-2024-8845', name: 'Weber, Anna', forderung: 2150, dpd: 5, segment: 'prioritaet', status: 'Offen' },
    { id: 'K-2024-7234', name: 'Braun, Thomas', forderung: 1890, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
    { id: 'K-2024-6891', name: 'Klein KG', forderung: 8400, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
    { id: 'K-2024-6234', name: 'Fischer, Maria', forderung: 780, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
    { id: 'K-2024-5982', name: 'Meier, Stefan', forderung: 2340, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
    { id: 'K-2024-5876', name: 'Schneider Logistik GmbH', forderung: 15200, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
    { id: 'K-2024-5734', name: 'Fischer, Anna', forderung: 3450, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' },
    { id: 'K-2024-5612', name: 'Bäckerei Müller', forderung: 24800, dpd: 0, segment: 'abgeschlossen', status: 'Bezahlt' }
];

const DEMO_PAYMENTS = [
    { id: 'Z-2024-1234', kundeId: 'K-2024-0010', kunde: 'Fischer, Hans', betrag: 2500, datum: '2025-12-15', art: 'Teilzahlung' },
    { id: 'Z-2024-1235', kundeId: 'K-2024-0003', kunde: 'Weber KG', betrag: 8900, datum: '2025-12-14', art: 'Ratenzahlung' },
    { id: 'Z-2024-1236', kundeId: 'K-2024-0012', kunde: 'Neumann, Klaus', betrag: 15600, datum: '2025-12-14', art: 'Ratenzahlung' },
    { id: 'Z-2024-1237', kundeId: 'K-2024-0002', kunde: 'Schmidt, Peter', betrag: 3200, datum: '2025-12-13', art: 'Teilzahlung' },
    { id: 'Z-2024-1238', kundeId: 'K-2024-0011', kunde: 'Bäckerei Schulze', betrag: 5400, datum: '2025-12-12', art: 'Ratenzahlung' },
    { id: 'Z-2024-1239', kundeId: 'K-2024-0008', kunde: 'Lehmann, Sandra', betrag: 4800, datum: '2025-12-11', art: 'Teilzahlung' },
    { id: 'Z-2024-1240', kundeId: 'K-2024-0013', kunde: 'Gasthaus zum Löwen', betrag: 12100, datum: '2025-12-10', art: 'Ratenzahlung' }
];

// ========================================
// STATE
// ========================================

let bankenChatInitialized = false;
let lastChatQueryResult = null;

// ========================================
// HELPER FUNCTIONS
// ========================================

const formatCurrency = (value) => value.toLocaleString('de-DE');

const getFollowUpSuggestions = () => `
    <div class="chat-followup-suggestions">
        <span class="followup-label">Weitere Abfragen:</span>
        <div class="followup-buttons">
            <button class="example-btn" data-question="Kunden mit höchster Restforderung">Höchste Restforderung</button>
            <button class="example-btn" data-question="Kunden mit höchster Rückzahlungschance">Rückzahlungschance</button>
            <button class="example-btn" data-question="Kunden mit längster Verzugsdauer">Längste Verzugsdauer</button>
            <button class="example-btn" data-question="Neue Fälle dieser Woche">Neue Fälle</button>
            <button class="example-btn" data-question="Vereinbarungen in Bearbeitung">Vereinbarungen</button>
            <button class="example-btn" data-question="Portfolio-Übersicht">Portfolio</button>
        </div>
    </div>
`;

const getExportButtons = (data, title) => {
    lastChatQueryResult = { data, title };
    return `
        <div class="chat-export-buttons">
            <button class="chat-export-btn excel" onclick="exportChatToExcel(lastChatQueryResult.data, '${title}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Excel
            </button>
            <button class="chat-export-btn pdf" onclick="exportChatToPdf(lastChatQueryResult.data, '${title}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                PDF
            </button>
        </div>
    `;
};

// ========================================
// QUERY PROCESSING
// ========================================

const processBankenQuery = (message) => {
    const lower = message.toLowerCase();

    // Customers by highest outstanding amount
    if ((lower.includes('restforderung') || lower.includes('höchste') || lower.includes('größte') || lower.includes('top')) &&
        (lower.includes('forderung') || lower.includes('kunden') || lower.includes('ausstehend'))) {
        const countMatch = message.match(/(\d+)/);
        const count = countMatch ? parseInt(countMatch[1]) : 5;
        const sorted = [...DEMO_CUSTOMER_DATA].sort((a, b) => b.forderung - a.forderung).slice(0, count);

        let response = `<span class="chat-icon chart"></span> **Kunden mit höchster Restforderung:**\n\n`;
        sorted.forEach((c, i) => {
            response += `${i + 1}. <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span> (${c.id})\n`;
            response += `   <span class="chat-icon euro"></span> €${formatCurrency(c.forderung)} · <span class="chat-icon clock"></span> ${c.dpd} DPD · ${c.status}\n\n`;
        });

        const total = sorted.reduce((sum, c) => sum + c.forderung, 0);
        response += `\n<span class="chat-icon trend"></span> **Summe:** €${formatCurrency(total)}`;
        response += `\n\n<button class="chat-action-btn" onclick="showFilteredCustomers('${sorted.map(c => c.id).join(',')}')">`
            + `<span class="chat-icon search"></span> Diese ${count} Kunden in Liste anzeigen</button>`;
        response += getExportButtons({ type: 'customers', items: sorted }, 'Hoechste_Restforderung');
        response += getFollowUpSuggestions();
        return response;
    }

    // Customers with highest repayment chance
    if (lower.includes('rückzahlung') || lower.includes('chance') || lower.includes('wahrscheinlich')) {
        const sorted = [...DEMO_CUSTOMER_DATA]
            .filter(c => c.segment === 'prioritaet' || c.dpd < 30)
            .sort((a, b) => a.dpd - b.dpd)
            .slice(0, 5);

        let response = `<span class="chat-icon check"></span> **Kunden mit höchster Rückzahlungschance:**\n\n`;
        sorted.forEach((c, i) => {
            const chance = Math.max(95 - c.dpd * 2, 45);
            response += `${i + 1}. <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span>\n`;
            response += `   <span class="chat-icon euro"></span> €${formatCurrency(c.forderung)} · <span class="chat-icon clock"></span> ${c.dpd} DPD · <span class="chat-icon percent"></span> ${chance}% Chance\n\n`;
        });

        response += `\n<button class="chat-action-btn" onclick="showFilteredCustomers('${sorted.map(c => c.id).join(',')}')">`
            + `<span class="chat-icon search"></span> Diese Kunden in Liste anzeigen</button>`;
        response += getExportButtons({ type: 'customers', items: sorted }, 'Hoechste_Rueckzahlungschance');
        response += getFollowUpSuggestions();
        return response;
    }

    // Customers with longest overdue
    if (lower.includes('verzug') || lower.includes('längste') || lower.includes('älteste')) {
        const sorted = [...DEMO_CUSTOMER_DATA].sort((a, b) => b.dpd - a.dpd).slice(0, 5);

        let response = `<span class="chat-icon clock"></span> **Kunden mit längster Verzugsdauer:**\n\n`;
        sorted.forEach((c, i) => {
            response += `${i + 1}. <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span>\n`;
            response += `   <span class="chat-icon alert"></span> ${c.dpd} Tage überfällig · <span class="chat-icon euro"></span> €${formatCurrency(c.forderung)} · ${c.status}\n\n`;
        });

        response += `\n<button class="chat-action-btn" onclick="showFilteredCustomers('${sorted.map(c => c.id).join(',')}')">`
            + `<span class="chat-icon search"></span> Diese Kunden in Liste anzeigen</button>`;
        response += getExportButtons({ type: 'customers', items: sorted }, 'Laengste_Verzugsdauer');
        response += getFollowUpSuggestions();
        return response;
    }

    // New cases this week
    if (lower.includes('neue') || lower.includes('neu') || lower.includes('diese woche') || lower.includes('dieser woche')) {
        const newCases = [...DEMO_CUSTOMER_DATA].filter(c => c.dpd <= 14).sort((a, b) => a.dpd - b.dpd);

        let response = `<span class="chat-icon plus"></span> **Neue Fälle dieser Woche:** ${newCases.length}\n\n`;
        newCases.forEach((c, i) => {
            response += `${i + 1}. <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span>\n`;
            response += `   <span class="chat-icon euro"></span> €${formatCurrency(c.forderung)} · Seit ${c.dpd} Tagen · ${c.status}\n\n`;
        });

        const total = newCases.reduce((sum, c) => sum + c.forderung, 0);
        response += `\n<span class="chat-icon trend"></span> **Neue Forderungen gesamt:** €${formatCurrency(total)}`;
        response += `\n\n<button class="chat-action-btn" onclick="showFilteredCustomers('${newCases.map(c => c.id).join(',')}')">`
            + `<span class="chat-icon search"></span> Neue Fälle in Liste anzeigen</button>`;
        response += getExportButtons({ type: 'customers', items: newCases }, 'Neue_Faelle');
        response += getFollowUpSuggestions();
        return response;
    }

    // Active agreements
    if (lower.includes('vereinbarung') || lower.includes('aktive') || lower.includes('bearbeitung')) {
        const agreements = DEMO_CUSTOMER_DATA.filter(c => c.status === 'Vereinbarung' || c.segment === 'restrukturierung');

        let response = `<span class="chat-icon refresh"></span> **Vereinbarungen in Bearbeitung:** ${agreements.length}\n\n`;
        agreements.forEach((c, i) => {
            response += `${i + 1}. <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span>\n`;
            response += `   <span class="chat-icon euro"></span> €${formatCurrency(c.forderung)} · ${c.dpd} DPD · <span class="chat-icon check"></span> ${c.status}\n\n`;
        });

        const total = agreements.reduce((sum, c) => sum + c.forderung, 0);
        response += `\n<span class="chat-icon trend"></span> **Forderungen in Vereinbarung:** €${formatCurrency(total)}`;
        response += `\n\n<button class="chat-action-btn" onclick="showFilteredCustomers('${agreements.map(c => c.id).join(',')}')">`
            + `<span class="chat-icon search"></span> Diese Kunden in Liste anzeigen</button>`;
        response += `\n<button class="chat-action-btn" onclick="filterBySegment('restrukturierung')">`
            + `<span class="chat-icon grid"></span> Restrukturierung-Segment anzeigen</button>`;
        response += getExportButtons({ type: 'customers', items: agreements }, 'Aktive_Vereinbarungen');
        response += getFollowUpSuggestions();
        return response;
    }

    // Payments
    if (lower.includes('zahlung') || lower.includes('eingang') || lower.includes('bezahlt') || lower.includes('ausgeglichen')) {
        const isWeek = lower.includes('woche') || lower.includes('letzte');

        let response = `<span class="chat-icon payment"></span> **Zahlungseingänge${isWeek ? ' der letzten Woche' : ''}:**\n\n`;
        DEMO_PAYMENTS.forEach(p => {
            response += `• <span class="chat-customer-link" onclick="openCustomerDetail('${p.kundeId}')">${p.kunde}</span> - €${formatCurrency(p.betrag)}\n`;
            response += `  ${p.datum} · ${p.art}\n\n`;
        });

        const total = DEMO_PAYMENTS.reduce((sum, p) => sum + p.betrag, 0);
        response += `\n<span class="chat-icon check"></span> **Gesamt:** €${formatCurrency(total)} (${DEMO_PAYMENTS.length} Zahlungen)`;
        response += `\n\n<button class="chat-action-btn" onclick="showFilteredCustomers('${DEMO_PAYMENTS.map(p => p.kundeId).join(',')}')">`
            + `<span class="chat-icon search"></span> Diese Kunden in Liste anzeigen</button>`;
        response += getExportButtons({ type: 'payments', items: DEMO_PAYMENTS }, 'Zahlungseingaenge');
        response += getFollowUpSuggestions();
        return response;
    }

    // Eskalation segment
    if (lower.includes('eskalation') || lower.includes('inkasso')) {
        const filtered = DEMO_CUSTOMER_DATA.filter(c => c.segment === 'eskalation');

        let response = `<span class="chat-icon alert"></span> **Eskalation-Fälle (Inkasso):** ${filtered.length}\n\n`;
        filtered.forEach(c => {
            response += `• <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span> - €${formatCurrency(c.forderung)} (${c.dpd} DPD)\n`;
        });

        response += `\n\n<button class="chat-action-btn" onclick="filterBySegment('eskalation')">`
            + `<span class="chat-icon search"></span> Eskalation-Segment in Matrix anzeigen</button>`;
        response += `\n<button class="chat-action-btn" onclick="showFilteredCustomers('${filtered.map(c => c.id).join(',')}')">`
            + `<span class="chat-icon list"></span> In Liste anzeigen</button>`;
        response += getExportButtons({ type: 'customers', items: filtered }, 'Eskalation_Faelle');
        response += getFollowUpSuggestions();
        return response;
    }

    // Restrukturierung segment
    if (lower.includes('restrukturierung') || lower.includes('stundung')) {
        const filtered = DEMO_CUSTOMER_DATA.filter(c => c.segment === 'restrukturierung');

        let response = `<span class="chat-icon refresh"></span> **Restrukturierung-Fälle:** ${filtered.length}\n\n`;
        filtered.forEach(c => {
            response += `• <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span> - €${formatCurrency(c.forderung)} · ${c.status}\n`;
        });

        response += `\n\n<button class="chat-action-btn" onclick="filterBySegment('restrukturierung')">`
            + `<span class="chat-icon search"></span> Restrukturierung-Segment in Matrix anzeigen</button>`;
        response += `\n<button class="chat-action-btn" onclick="showFilteredCustomers('${filtered.map(c => c.id).join(',')}')">`
            + `<span class="chat-icon list"></span> In Liste anzeigen</button>`;
        response += getExportButtons({ type: 'customers', items: filtered }, 'Restrukturierung_Faelle');
        response += getFollowUpSuggestions();
        return response;
    }

    // DPD filter
    if (lower.includes('dpd') || (lower.includes('überfällig') && !lower.includes('längste'))) {
        const dpdMatch = message.match(/(\d+)\s*(?:dpd|tage)/i);
        const minDpd = dpdMatch ? parseInt(dpdMatch[1]) : 90;
        const filtered = DEMO_CUSTOMER_DATA.filter(c => c.dpd > minDpd);

        let response = `<span class="chat-icon clock"></span> **Fälle mit mehr als ${minDpd} DPD:** ${filtered.length}\n\n`;
        filtered.sort((a, b) => b.dpd - a.dpd).forEach(c => {
            response += `• <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span> - ${c.dpd} Tage überfällig\n`;
            response += `  €${formatCurrency(c.forderung)} · ${c.status}\n\n`;
        });

        const bucket = minDpd >= 90 ? '90+' : (minDpd >= 30 ? '31-90' : '0-30');
        response += `\n<button class="chat-action-btn" onclick="filterByDPDBucket('${bucket}')">`
            + `<span class="chat-icon search"></span> DPD Bucket in Dashboard anzeigen</button>`;
        response += `\n<button class="chat-action-btn" onclick="showFilteredCustomers('${filtered.map(c => c.id).join(',')}')">`
            + `<span class="chat-icon list"></span> ${filtered.length} Kunden in Liste anzeigen</button>`;
        response += getExportButtons({ type: 'customers', items: filtered }, `DPD_ueber_${minDpd}`);
        response += getFollowUpSuggestions();
        return response;
    }

    // Portfolio overview
    if (lower.includes('übersicht') || lower.includes('portfolio') || lower.includes('gesamt')) {
        const total = DEMO_CUSTOMER_DATA.reduce((sum, c) => sum + c.forderung, 0);
        const avgDpd = Math.round(DEMO_CUSTOMER_DATA.reduce((sum, c) => sum + c.dpd, 0) / DEMO_CUSTOMER_DATA.length);

        const segments = {
            eskalation: DEMO_CUSTOMER_DATA.filter(c => c.segment === 'eskalation').length,
            prioritaet: DEMO_CUSTOMER_DATA.filter(c => c.segment === 'prioritaet').length,
            restrukturierung: DEMO_CUSTOMER_DATA.filter(c => c.segment === 'restrukturierung').length,
            abwicklung: DEMO_CUSTOMER_DATA.filter(c => c.segment === 'abwicklung').length
        };

        const exportData = { type: 'portfolio', total, count: DEMO_CUSTOMER_DATA.length, avgDpd, segments };

        return `<span class="chat-icon chart"></span> **Portfolio-Übersicht:**

**Gesamtforderung:** €${formatCurrency(total)}
**Aktive Fälle:** ${DEMO_CUSTOMER_DATA.length}
**Ø DPD:** ${avgDpd} Tage

**Segmente:**
<span class="chat-icon dot red"></span> Eskalation: ${segments.eskalation} Fälle
<span class="chat-icon dot green"></span> Priorität: ${segments.prioritaet} Fälle
<span class="chat-icon dot amber"></span> Restrukturierung: ${segments.restrukturierung} Fälle
<span class="chat-icon dot gray"></span> Abwicklung: ${segments.abwicklung} Fälle

**Letzte Zahlungen:** €${formatCurrency(DEMO_PAYMENTS.reduce((s, p) => s + p.betrag, 0))} (7 Tage)` + getExportButtons(exportData, 'Portfolio_Uebersicht') + getFollowUpSuggestions();
    }

    // Search for specific customer
    if (lower.includes('kunde') || lower.includes('suche') || lower.includes('finde')) {
        const nameMatch = message.match(/(?:kunde|suche|finde)\s+(.+)/i);
        if (nameMatch) {
            const searchTerm = nameMatch[1].trim().toLowerCase();
            const found = DEMO_CUSTOMER_DATA.find(c =>
                c.name.toLowerCase().includes(searchTerm) || c.id.toLowerCase().includes(searchTerm)
            );

            if (found) {
                return `<span class="chat-icon search"></span> **Gefunden: <span class="chat-customer-link" onclick="openCustomerDetail('${found.id}')">${found.name}</span>**

**ID:** ${found.id}
**Forderung:** €${formatCurrency(found.forderung)}
**DPD:** ${found.dpd} Tage
**Segment:** ${found.segment}
**Status:** ${found.status}

<button class="chat-action-btn" onclick="openCustomerDetail('${found.id}')"><span class="chat-icon user"></span> Kundendetail öffnen</button>` + getFollowUpSuggestions();
            }
            return `<span class="chat-icon x"></span> Kein Kunde mit "${nameMatch[1]}" gefunden.\n\nVerfügbare Kunden durchsuchen Sie in der Tabelle unten.` + getFollowUpSuggestions();
        }
    }

    // Default response
    return `Ich verstehe Ihre Anfrage: "${message}"

**Verfügbare Abfragen:**
• "Kunden mit höchster Restforderung"
• "Zahlungseingänge der letzten Woche"
• "Zeige alle Eskalation-Fälle"
• "Fälle mit mehr als 90 DPD"
• "Portfolio-Übersicht"
• "Suche Kunde Mueller"

<span class="chat-icon lightbulb"></span> Stellen Sie Ihre Frage zu Kunden, Forderungen oder dem Portfolio.`;
};

// ========================================
// UI FUNCTIONS
// ========================================

const addBankenChatMessage = (role, content) => {
    const chatBody = document.getElementById('bankenChatBody');
    if (!chatBody) return;

    chatBody.querySelector('.banken-chat-welcome')?.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `banken-chat-message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'banken-chat-avatar';
    avatar.innerHTML = role === 'user'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"></path></svg>';

    const bubble = document.createElement('div');
    bubble.className = 'banken-chat-bubble';
    bubble.innerHTML = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
};

const showBankenTyping = () => {
    const chatBody = document.getElementById('bankenChatBody');
    if (!chatBody) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'banken-chat-message assistant';
    typingDiv.id = 'bankenTypingIndicator';
    typingDiv.innerHTML = `
        <div class="banken-chat-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9"></path>
            </svg>
        </div>
        <div class="banken-chat-typing"><span></span><span></span><span></span></div>
    `;
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
};

const hideBankenTyping = () => document.getElementById('bankenTypingIndicator')?.remove();

// ========================================
// MAIN FUNCTIONS
// ========================================

export const sendBankenMessage = () => {
    const chatInput = document.getElementById('bankenChatInput');
    const message = chatInput?.value?.trim();
    if (!message) return;

    chatInput.value = '';
    addBankenChatMessage('user', message);
    showBankenTyping();

    setTimeout(() => {
        hideBankenTyping();
        const response = processBankenQuery(message);
        addBankenChatMessage('assistant', response);
    }, 800);
};

export const showFilteredCustomers = (customerIdsString) => {
    console.log('🔍 Showing filtered customers:', customerIdsString);
    const customerIds = customerIdsString.split(',').map(id => id.trim());

    const customerListSection = document.querySelector('.customer-list-section');
    if (customerListSection) {
        customerListSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        customerListSection.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
        setTimeout(() => { customerListSection.style.boxShadow = ''; }, 2000);
    }

    const rows = document.querySelectorAll('.customer-table tbody tr');
    let matchCount = 0;
    let firstMatch = null;

    rows.forEach(row => {
        const onclickAttr = row.getAttribute('onclick') ?? '';
        const cellText = row.querySelector('.customer-cell small')?.textContent ?? '';
        const matches = customerIds.some(id => onclickAttr.includes(id) || cellText.includes(id));

        if (matches) {
            matchCount++;
            row.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
            row.style.transition = 'background-color 0.3s ease';
            row.style.boxShadow = 'inset 4px 0 0 #3b82f6';
            firstMatch ??= row;
        } else {
            row.style.backgroundColor = '';
            row.style.boxShadow = '';
        }
    });

    if (firstMatch) setTimeout(() => firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    if (typeof showNotification === 'function') showNotification(`${matchCount} Kunden hervorgehoben`, 'info');

    setTimeout(() => rows.forEach(row => { row.style.backgroundColor = ''; row.style.boxShadow = ''; }), 10000);
};

export const exportChatToExcel = (data, filename) => {
    let csvContent = '';

    if (data.type === 'customers') {
        csvContent = 'ID;Name;Forderung;DPD;Segment;Status\n';
        data.items.forEach(item => {
            csvContent += `${item.id};${item.name};${item.forderung};${item.dpd};${item.segment};${item.status}\n`;
        });
    } else if (data.type === 'payments') {
        csvContent = 'ID;Kunde;Betrag;Datum;Art\n';
        data.items.forEach(item => {
            csvContent += `${item.id};${item.kunde};${item.betrag};${item.datum};${item.art}\n`;
        });
    } else if (data.type === 'portfolio') {
        csvContent = 'Kennzahl;Wert\n';
        csvContent += `Gesamtforderung;${data.total}\nAktive Fälle;${data.count}\nØ DPD;${data.avgDpd}\n`;
        csvContent += `Eskalation;${data.segments.eskalation}\nPriorität;${data.segments.prioritaet}\n`;
        csvContent += `Restrukturierung;${data.segments.restrukturierung}\nAbwicklung;${data.segments.abwicklung}\n`;
    }

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof showNotification === 'function') showNotification('Excel-Export erfolgreich', 'success');
};

export const exportChatToPdf = (data, filename) => {
    const printWindow = window.open('', '_blank');

    let htmlContent = `<!DOCTYPE html><html><head><title>${filename}</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f1f5f9; color: #475569; text-align: left; padding: 12px; border: 1px solid #e2e8f0; }
            td { padding: 10px 12px; border: 1px solid #e2e8f0; }
            tr:nth-child(even) { background: #f8fafc; }
            .summary { background: #f0f9ff; padding: 16px; border-radius: 8px; margin: 20px 0; }
            .summary h3 { margin: 0 0 10px 0; color: #0369a1; }
            .footer { margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style></head><body>
        <h1>Collections Dashboard - ${filename}</h1>
        <p>Erstellt am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}</p>`;

    if (data.type === 'customers') {
        const total = data.items.reduce((sum, c) => sum + c.forderung, 0);
        htmlContent += `<div class="summary"><h3>Zusammenfassung</h3>
            <p><strong>${data.items.length}</strong> Kunden · <strong>€${formatCurrency(total)}</strong> Gesamtforderung</p></div>
            <table><thead><tr><th>ID</th><th>Name</th><th>Forderung</th><th>DPD</th><th>Segment</th><th>Status</th></tr></thead><tbody>`;
        data.items.forEach(item => {
            htmlContent += `<tr><td>${item.id}</td><td>${item.name}</td><td>€${formatCurrency(item.forderung)}</td>
                <td>${item.dpd}</td><td>${item.segment}</td><td>${item.status}</td></tr>`;
        });
        htmlContent += '</tbody></table>';
    } else if (data.type === 'payments') {
        const total = data.items.reduce((sum, p) => sum + p.betrag, 0);
        htmlContent += `<div class="summary"><h3>Zahlungsübersicht</h3>
            <p><strong>${data.items.length}</strong> Zahlungen · <strong>€${formatCurrency(total)}</strong> Gesamtbetrag</p></div>
            <table><thead><tr><th>ID</th><th>Kunde</th><th>Betrag</th><th>Datum</th><th>Art</th></tr></thead><tbody>`;
        data.items.forEach(item => {
            htmlContent += `<tr><td>${item.id}</td><td>${item.kunde}</td><td>€${formatCurrency(item.betrag)}</td>
                <td>${item.datum}</td><td>${item.art}</td></tr>`;
        });
        htmlContent += '</tbody></table>';
    } else if (data.type === 'portfolio') {
        htmlContent += `<div class="summary"><h3>Portfolio-Übersicht</h3>
            <table style="width: auto;"><tr><td><strong>Gesamtforderung:</strong></td><td>€${formatCurrency(data.total)}</td></tr>
            <tr><td><strong>Aktive Fälle:</strong></td><td>${data.count}</td></tr>
            <tr><td><strong>Ø DPD:</strong></td><td>${data.avgDpd} Tage</td></tr></table></div>
            <h3>Segmentverteilung</h3><table><thead><tr><th>Segment</th><th>Anzahl Fälle</th></tr></thead><tbody>
            <tr><td>Eskalation</td><td>${data.segments.eskalation}</td></tr>
            <tr><td>Priorität</td><td>${data.segments.prioritaet}</td></tr>
            <tr><td>Restrukturierung</td><td>${data.segments.restrukturierung}</td></tr>
            <tr><td>Abwicklung</td><td>${data.segments.abwicklung}</td></tr></tbody></table>`;
    }

    htmlContent += `<div class="footer">Dieser Bericht wurde automatisch vom Collections Dashboard generiert.</div></body></html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();

    if (typeof showNotification === 'function') showNotification('PDF-Export wird geöffnet', 'success');
};

export const initBankenChat = () => {
    if (bankenChatInitialized) {
        console.log('⚠️ Banken Chat bereits initialisiert');
        return;
    }

    console.log('🤖 Initialisiere Banken Chat...');

    const chatToggle = document.getElementById('bankenChatToggle');
    const chatWidget = document.getElementById('bankenChatWidget');

    if (!chatToggle || !chatWidget) {
        console.log('ℹ️ Banken Chat Elemente nicht gefunden');
        return;
    }

    const chatClose = chatWidget.querySelector('.banken-chat-close');
    const chatSend = document.getElementById('bankenChatSend');
    const chatInput = document.getElementById('bankenChatInput');
    const chatBody = document.getElementById('bankenChatBody');

    if (!chatSend || !chatInput || !chatBody) {
        console.error('❌ Banken Chat Input-Elemente nicht gefunden');
        return;
    }

    bankenChatInitialized = true;

    chatToggle.addEventListener('click', () => {
        chatWidget.style.display = 'flex';
        chatToggle.style.display = 'none';
        chatInput.focus();
    });

    chatClose?.addEventListener('click', () => {
        chatWidget.style.display = 'none';
        chatToggle.style.display = 'flex';
    });

    chatSend.addEventListener('click', () => sendBankenMessage());

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendBankenMessage();
        }
    });

    chatBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('example-btn')) {
            chatInput.value = e.target.dataset.question;
            sendBankenMessage();
        }
    });

    console.log('✅ Banken Chat initialisiert');
};

// ========================================
// WINDOW EXPORTS
// ========================================

Object.assign(window, {
    initBankenChat,
    sendBankenMessage,
    showFilteredCustomers,
    exportChatToExcel,
    exportChatToPdf,
    get lastChatQueryResult() { return lastChatQueryResult; }
});

console.log('✅ Banken Chat ES6 modules loaded (ES2024)');

export { DEMO_CUSTOMER_DATA, DEMO_PAYMENTS };
