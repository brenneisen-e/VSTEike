/**
 * Banken Chat Module - Query Processor
 * Processes user queries and generates responses
 */

import { DEMO_CUSTOMER_DATA, DEMO_PAYMENTS } from './_constants.js';
import { formatCurrency, getFollowUpSuggestions, getExportButtons } from './_helpers.js';

/**
 * Process a user query and generate an appropriate response
 * @param {string} message - User's query message
 * @returns {string} HTML formatted response
 */
export const processBankenQuery = (message) => {
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
