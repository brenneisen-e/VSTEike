// js/banken-chat.js - AI Chat for Collections Dashboard
// Handles queries about customers, claims, and portfolio data

let bankenChatInitialized = false;

// Demo customer data for the chat - synchronized with table data
const demoCustomerData = [
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
    { id: 'K-2024-0016', name: 'Zimmermann, Frank', forderung: 2340, dpd: 105, segment: 'abwicklung', status: 'Abschreibung' }
];

// Demo payment data - linked to actual customer IDs
const demoPayments = [
    { id: 'Z-2024-1234', kundeId: 'K-2024-0010', kunde: 'Fischer, Hans', betrag: 2500, datum: '2025-12-15', art: 'Teilzahlung' },
    { id: 'Z-2024-1235', kundeId: 'K-2024-0003', kunde: 'Weber KG', betrag: 8900, datum: '2025-12-14', art: 'Ratenzahlung' },
    { id: 'Z-2024-1236', kundeId: 'K-2024-0012', kunde: 'Neumann, Klaus', betrag: 15600, datum: '2025-12-14', art: 'Ratenzahlung' },
    { id: 'Z-2024-1237', kundeId: 'K-2024-0002', kunde: 'Schmidt, Peter', betrag: 3200, datum: '2025-12-13', art: 'Teilzahlung' },
    { id: 'Z-2024-1238', kundeId: 'K-2024-0011', kunde: 'Bäckerei Schulze', betrag: 5400, datum: '2025-12-12', art: 'Ratenzahlung' },
    { id: 'Z-2024-1239', kundeId: 'K-2024-0008', kunde: 'Lehmann, Sandra', betrag: 4800, datum: '2025-12-11', art: 'Teilzahlung' },
    { id: 'Z-2024-1240', kundeId: 'K-2024-0013', kunde: 'Gasthaus zum Löwen', betrag: 12100, datum: '2025-12-10', art: 'Ratenzahlung' }
];

// Initialize Banken Chat
function initBankenChat() {
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

    // Toggle chat
    chatToggle.addEventListener('click', () => {
        chatWidget.style.display = 'flex';
        chatToggle.style.display = 'none';
        chatInput.focus();
    });

    // Close chat
    if (chatClose) {
        chatClose.addEventListener('click', () => {
            chatWidget.style.display = 'none';
            chatToggle.style.display = 'flex';
        });
    }

    // Send message
    chatSend.addEventListener('click', () => sendBankenMessage());

    // Enter to send
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendBankenMessage();
        }
    });

    // Example questions
    chatBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('example-btn')) {
            const question = e.target.dataset.question;
            chatInput.value = question;
            sendBankenMessage();
        }
    });

    console.log('✅ Banken Chat initialisiert');
}

// Send message and get response
function sendBankenMessage() {
    const chatInput = document.getElementById('bankenChatInput');
    const message = chatInput.value.trim();

    if (!message) return;

    // Clear input
    chatInput.value = '';

    // Add user message
    addBankenChatMessage('user', message);

    // Show typing
    showBankenTyping();

    // Process after delay
    setTimeout(() => {
        hideBankenTyping();
        const response = processBankenQuery(message);
        addBankenChatMessage('assistant', response);
    }, 800);
}

// Process query and generate response
function processBankenQuery(message) {
    const lower = message.toLowerCase();

    // Customers by highest outstanding amount (Restforderung)
    if ((lower.includes('restforderung') || lower.includes('höchste') || lower.includes('größte') || lower.includes('top')) &&
        (lower.includes('forderung') || lower.includes('kunden') || lower.includes('ausstehend'))) {

        const countMatch = message.match(/(\d+)/);
        const count = countMatch ? parseInt(countMatch[1]) : 5;

        const sorted = [...demoCustomerData].sort((a, b) => b.forderung - a.forderung).slice(0, count);

        let response = `<span class="chat-icon chart"></span> **Kunden mit höchster Restforderung:**\n\n`;
        sorted.forEach((c, i) => {
            response += `${i + 1}. <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span> (${c.id})\n`;
            response += `   <span class="chat-icon euro"></span> €${c.forderung.toLocaleString('de-DE')} · <span class="chat-icon clock"></span> ${c.dpd} DPD · ${c.status}\n\n`;
        });

        const total = sorted.reduce((sum, c) => sum + c.forderung, 0);
        response += `\n<span class="chat-icon trend"></span> **Summe:** €${total.toLocaleString('de-DE')}`;

        // Add navigation button
        const customerIds = sorted.map(c => c.id).join(',');
        response += `\n\n<button class="chat-action-btn" onclick="showFilteredCustomers('${customerIds}')"><span class="chat-icon search"></span> Diese ${count} Kunden in Liste anzeigen</button>`;

        // Add export buttons
        const exportData = { type: 'customers', items: sorted };
        response += getExportButtons(exportData, `Hoechste_Restforderung`);
        response += getFollowUpSuggestions();

        return response;
    }

    // Customers with highest repayment chance
    if (lower.includes('rückzahlung') || lower.includes('chance') || lower.includes('wahrscheinlich')) {
        // Sort by low DPD and prioritaet segment (higher chance of repayment)
        const sorted = [...demoCustomerData]
            .filter(c => c.segment === 'prioritaet' || c.dpd < 30)
            .sort((a, b) => a.dpd - b.dpd)
            .slice(0, 5);

        let response = `<span class="chat-icon check"></span> **Kunden mit höchster Rückzahlungschance:**\n\n`;
        sorted.forEach((c, i) => {
            const chance = Math.max(95 - c.dpd * 2, 45);
            response += `${i + 1}. <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span>\n`;
            response += `   <span class="chat-icon euro"></span> €${c.forderung.toLocaleString('de-DE')} · <span class="chat-icon clock"></span> ${c.dpd} DPD · <span class="chat-icon percent"></span> ${chance}% Chance\n\n`;
        });

        const customerIds = sorted.map(c => c.id).join(',');
        response += `\n<button class="chat-action-btn" onclick="showFilteredCustomers('${customerIds}')"><span class="chat-icon search"></span> Diese Kunden in Liste anzeigen</button>`;

        const exportData = { type: 'customers', items: sorted };
        response += getExportButtons(exportData, `Hoechste_Rueckzahlungschance`);
        response += getFollowUpSuggestions();

        return response;
    }

    // Customers with longest overdue (Verzugsdauer)
    if (lower.includes('verzug') || lower.includes('längste') || lower.includes('älteste')) {
        const sorted = [...demoCustomerData].sort((a, b) => b.dpd - a.dpd).slice(0, 5);

        let response = `<span class="chat-icon clock"></span> **Kunden mit längster Verzugsdauer:**\n\n`;
        sorted.forEach((c, i) => {
            response += `${i + 1}. <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span>\n`;
            response += `   <span class="chat-icon alert"></span> ${c.dpd} Tage überfällig · <span class="chat-icon euro"></span> €${c.forderung.toLocaleString('de-DE')} · ${c.status}\n\n`;
        });

        const customerIds = sorted.map(c => c.id).join(',');
        response += `\n<button class="chat-action-btn" onclick="showFilteredCustomers('${customerIds}')"><span class="chat-icon search"></span> Diese Kunden in Liste anzeigen</button>`;

        const exportData = { type: 'customers', items: sorted };
        response += getExportButtons(exportData, `Laengste_Verzugsdauer`);
        response += getFollowUpSuggestions();

        return response;
    }

    // New cases this week
    if (lower.includes('neue') || lower.includes('neu') || lower.includes('diese woche') || lower.includes('dieser woche')) {
        // Simulate new cases (low DPD)
        const newCases = [...demoCustomerData]
            .filter(c => c.dpd <= 14)
            .sort((a, b) => a.dpd - b.dpd);

        let response = `<span class="chat-icon plus"></span> **Neue Fälle dieser Woche:** ${newCases.length}\n\n`;
        newCases.forEach((c, i) => {
            response += `${i + 1}. <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span>\n`;
            response += `   <span class="chat-icon euro"></span> €${c.forderung.toLocaleString('de-DE')} · Seit ${c.dpd} Tagen · ${c.status}\n\n`;
        });

        const total = newCases.reduce((sum, c) => sum + c.forderung, 0);
        response += `\n<span class="chat-icon trend"></span> **Neue Forderungen gesamt:** €${total.toLocaleString('de-DE')}`;

        const customerIds = newCases.map(c => c.id).join(',');
        response += `\n\n<button class="chat-action-btn" onclick="showFilteredCustomers('${customerIds}')"><span class="chat-icon search"></span> Neue Fälle in Liste anzeigen</button>`;

        const exportData = { type: 'customers', items: newCases };
        response += getExportButtons(exportData, `Neue_Faelle`);
        response += getFollowUpSuggestions();

        return response;
    }

    // Active agreements (Vereinbarungen)
    if (lower.includes('vereinbarung') || lower.includes('aktive') || lower.includes('bearbeitung')) {
        const agreements = demoCustomerData.filter(c => c.status === 'Vereinbarung' || c.segment === 'restrukturierung');

        let response = `<span class="chat-icon refresh"></span> **Vereinbarungen in Bearbeitung:** ${agreements.length}\n\n`;
        agreements.forEach((c, i) => {
            response += `${i + 1}. <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span>\n`;
            response += `   <span class="chat-icon euro"></span> €${c.forderung.toLocaleString('de-DE')} · ${c.dpd} DPD · <span class="chat-icon check"></span> ${c.status}\n\n`;
        });

        const total = agreements.reduce((sum, c) => sum + c.forderung, 0);
        response += `\n<span class="chat-icon trend"></span> **Forderungen in Vereinbarung:** €${total.toLocaleString('de-DE')}`;

        const customerIds = agreements.map(c => c.id).join(',');
        response += `\n\n<button class="chat-action-btn" onclick="showFilteredCustomers('${customerIds}')"><span class="chat-icon search"></span> Diese Kunden in Liste anzeigen</button>`;
        response += `\n<button class="chat-action-btn" onclick="filterBySegment('restrukturierung')"><span class="chat-icon grid"></span> Restrukturierung-Segment anzeigen</button>`;

        const exportData = { type: 'customers', items: agreements };
        response += getExportButtons(exportData, `Aktive_Vereinbarungen`);
        response += getFollowUpSuggestions();

        return response;
    }

    // Payments / Zahlungseingänge
    if (lower.includes('zahlung') || lower.includes('eingang') || lower.includes('bezahlt') || lower.includes('ausgeglichen')) {
        const isWeek = lower.includes('woche') || lower.includes('letzte');

        let response = `<span class="chat-icon payment"></span> **Zahlungseingänge${isWeek ? ' der letzten Woche' : ''}:**\n\n`;
        demoPayments.forEach(p => {
            response += `• <span class="chat-customer-link" onclick="openCustomerDetail('${p.kundeId}')">${p.kunde}</span> - €${p.betrag.toLocaleString('de-DE')}\n`;
            response += `  ${p.datum} · ${p.art}\n\n`;
        });

        const total = demoPayments.reduce((sum, p) => sum + p.betrag, 0);
        response += `\n<span class="chat-icon check"></span> **Gesamt:** €${total.toLocaleString('de-DE')} (${demoPayments.length} Zahlungen)`;

        // Add navigation button
        const customerIds = demoPayments.map(p => p.kundeId).join(',');
        response += `\n\n<button class="chat-action-btn" onclick="showFilteredCustomers('${customerIds}')"><span class="chat-icon search"></span> Diese Kunden in Liste anzeigen</button>`;

        // Add export buttons
        const exportData = { type: 'payments', items: demoPayments };
        response += getExportButtons(exportData, 'Zahlungseingaenge');
        response += getFollowUpSuggestions();

        return response;
    }

    // Filter by segment
    if (lower.includes('eskalation') || lower.includes('inkasso')) {
        const filtered = demoCustomerData.filter(c => c.segment === 'eskalation');

        let response = `<span class="chat-icon alert"></span> **Eskalation-Fälle (Inkasso):** ${filtered.length}\n\n`;
        filtered.forEach(c => {
            response += `• <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span> - €${c.forderung.toLocaleString('de-DE')} (${c.dpd} DPD)\n`;
        });

        const customerIds = filtered.map(c => c.id).join(',');
        response += `\n\n<button class="chat-action-btn" onclick="filterBySegment('eskalation')"><span class="chat-icon search"></span> Eskalation-Segment in Matrix anzeigen</button>`;
        response += `\n<button class="chat-action-btn" onclick="showFilteredCustomers('${customerIds}')"><span class="chat-icon list"></span> In Liste anzeigen</button>`;

        const exportData = { type: 'customers', items: filtered };
        response += getExportButtons(exportData, 'Eskalation_Faelle');
        response += getFollowUpSuggestions();

        return response;
    }

    if (lower.includes('restrukturierung') || lower.includes('stundung')) {
        const filtered = demoCustomerData.filter(c => c.segment === 'restrukturierung');

        let response = `<span class="chat-icon refresh"></span> **Restrukturierung-Fälle:** ${filtered.length}\n\n`;
        filtered.forEach(c => {
            response += `• <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span> - €${c.forderung.toLocaleString('de-DE')} · ${c.status}\n`;
        });

        const customerIds = filtered.map(c => c.id).join(',');
        response += `\n\n<button class="chat-action-btn" onclick="filterBySegment('restrukturierung')"><span class="chat-icon search"></span> Restrukturierung-Segment in Matrix anzeigen</button>`;
        response += `\n<button class="chat-action-btn" onclick="showFilteredCustomers('${customerIds}')"><span class="chat-icon list"></span> In Liste anzeigen</button>`;

        const exportData = { type: 'customers', items: filtered };
        response += getExportButtons(exportData, 'Restrukturierung_Faelle');
        response += getFollowUpSuggestions();

        return response;
    }

    // DPD filter
    if (lower.includes('dpd') || (lower.includes('überfällig') && !lower.includes('längste'))) {
        const dpdMatch = message.match(/(\d+)\s*(?:dpd|tage)/i);
        const minDpd = dpdMatch ? parseInt(dpdMatch[1]) : 90;

        const filtered = demoCustomerData.filter(c => c.dpd > minDpd);

        let response = `<span class="chat-icon clock"></span> **Fälle mit mehr als ${minDpd} DPD:** ${filtered.length}\n\n`;
        filtered.sort((a, b) => b.dpd - a.dpd).forEach(c => {
            response += `• <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span> - ${c.dpd} Tage überfällig\n`;
            response += `  €${c.forderung.toLocaleString('de-DE')} · ${c.status}\n\n`;
        });

        // Add navigation button for DPD bucket
        const bucket = minDpd >= 90 ? '90+' : (minDpd >= 30 ? '31-90' : '0-30');
        const customerIds = filtered.map(c => c.id).join(',');
        response += `\n<button class="chat-action-btn" onclick="filterByDPDBucket('${bucket}')"><span class="chat-icon search"></span> DPD Bucket in Dashboard anzeigen</button>`;
        response += `\n<button class="chat-action-btn" onclick="showFilteredCustomers('${customerIds}')"><span class="chat-icon list"></span> ${filtered.length} Kunden in Liste anzeigen</button>`;

        const exportData = { type: 'customers', items: filtered };
        response += getExportButtons(exportData, `DPD_ueber_${minDpd}`);
        response += getFollowUpSuggestions();

        return response;
    }

    // Portfolio overview
    if (lower.includes('übersicht') || lower.includes('portfolio') || lower.includes('gesamt')) {
        const total = demoCustomerData.reduce((sum, c) => sum + c.forderung, 0);
        const avgDpd = Math.round(demoCustomerData.reduce((sum, c) => sum + c.dpd, 0) / demoCustomerData.length);

        const segments = {
            eskalation: demoCustomerData.filter(c => c.segment === 'eskalation').length,
            prioritaet: demoCustomerData.filter(c => c.segment === 'prioritaet').length,
            restrukturierung: demoCustomerData.filter(c => c.segment === 'restrukturierung').length,
            abwicklung: demoCustomerData.filter(c => c.segment === 'abwicklung').length
        };

        // Add export buttons
        const exportData = {
            type: 'portfolio',
            total: total,
            count: demoCustomerData.length,
            avgDpd: avgDpd,
            segments: segments
        };

        return `<span class="chat-icon chart"></span> **Portfolio-Übersicht:**

**Gesamtforderung:** €${total.toLocaleString('de-DE')}
**Aktive Fälle:** ${demoCustomerData.length}
**Ø DPD:** ${avgDpd} Tage

**Segmente:**
<span class="chat-icon dot red"></span> Eskalation: ${segments.eskalation} Fälle
<span class="chat-icon dot green"></span> Priorität: ${segments.prioritaet} Fälle
<span class="chat-icon dot amber"></span> Restrukturierung: ${segments.restrukturierung} Fälle
<span class="chat-icon dot gray"></span> Abwicklung: ${segments.abwicklung} Fälle

**Letzte Zahlungen:** €${demoPayments.reduce((s, p) => s + p.betrag, 0).toLocaleString('de-DE')} (7 Tage)` + getExportButtons(exportData, 'Portfolio_Uebersicht') + getFollowUpSuggestions();
    }

    // Search for specific customer
    if (lower.includes('kunde') || lower.includes('suche') || lower.includes('finde')) {
        const nameMatch = message.match(/(?:kunde|suche|finde)\s+(.+)/i);
        if (nameMatch) {
            const searchTerm = nameMatch[1].trim().toLowerCase();
            const found = demoCustomerData.find(c =>
                c.name.toLowerCase().includes(searchTerm) ||
                c.id.toLowerCase().includes(searchTerm)
            );

            if (found) {
                return `<span class="chat-icon search"></span> **Gefunden: <span class="chat-customer-link" onclick="openCustomerDetail('${found.id}')">${found.name}</span>**

**ID:** ${found.id}
**Forderung:** €${found.forderung.toLocaleString('de-DE')}
**DPD:** ${found.dpd} Tage
**Segment:** ${found.segment}
**Status:** ${found.status}

<button class="chat-action-btn" onclick="openCustomerDetail('${found.id}')"><span class="chat-icon user"></span> Kundendetail öffnen</button>` + getFollowUpSuggestions();
            } else {
                return `<span class="chat-icon x"></span> Kein Kunde mit "${nameMatch[1]}" gefunden.\n\nVerfügbare Kunden durchsuchen Sie in der Tabelle unten.` + getFollowUpSuggestions();
            }
        }
    }

    // Default response with suggestions
    return `Ich verstehe Ihre Anfrage: "${message}"

**Verfügbare Abfragen:**
• "Kunden mit höchster Restforderung"
• "Zahlungseingänge der letzten Woche"
• "Zeige alle Eskalation-Fälle"
• "Fälle mit mehr als 90 DPD"
• "Portfolio-Übersicht"
• "Suche Kunde Mueller"

<span class="chat-icon lightbulb"></span> Stellen Sie Ihre Frage zu Kunden, Forderungen oder dem Portfolio.`;
}

// Add message to chat
function addBankenChatMessage(role, content) {
    const chatBody = document.getElementById('bankenChatBody');

    // Remove welcome if exists
    const welcome = chatBody.querySelector('.banken-chat-welcome');
    if (welcome) welcome.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `banken-chat-message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'banken-chat-avatar';
    avatar.innerHTML = role === 'user'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"></path></svg>';

    const bubble = document.createElement('div');
    bubble.className = 'banken-chat-bubble';

    // Format content
    let formatted = content
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    bubble.innerHTML = formatted;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Typing indicator
function showBankenTyping() {
    const chatBody = document.getElementById('bankenChatBody');

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
        <div class="banken-chat-typing">
            <span></span><span></span><span></span>
        </div>
    `;

    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function hideBankenTyping() {
    const typing = document.getElementById('bankenTypingIndicator');
    if (typing) typing.remove();
}

// Show filtered customers in the list
function showFilteredCustomers(customerIdsString) {
    console.log('🔍 Showing filtered customers:', customerIdsString);

    const customerIds = customerIdsString.split(',').map(id => id.trim());

    // Scroll to customer list section
    const customerListSection = document.querySelector('.customer-list-section');
    if (customerListSection) {
        customerListSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Flash the section to indicate it's been updated
        customerListSection.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
        setTimeout(() => {
            customerListSection.style.boxShadow = '';
        }, 2000);
    }

    // Find and highlight matching rows in the table
    const rows = document.querySelectorAll('.customer-table tbody tr');
    let matchCount = 0;
    let firstMatch = null;

    rows.forEach(row => {
        // Check if row onclick contains one of the customer IDs
        const onclickAttr = row.getAttribute('onclick') || '';
        const customerCell = row.querySelector('.customer-cell small');
        const cellText = customerCell ? customerCell.textContent : '';

        const matches = customerIds.some(id =>
            onclickAttr.includes(id) || cellText.includes(id)
        );

        if (matches) {
            matchCount++;
            row.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
            row.style.transition = 'background-color 0.3s ease';
            row.style.boxShadow = 'inset 4px 0 0 #3b82f6';

            // Remember first match to scroll to
            if (!firstMatch) {
                firstMatch = row;
            }
        } else {
            row.style.backgroundColor = '';
            row.style.boxShadow = '';
        }
    });

    // Scroll to first matching row after a short delay
    if (firstMatch) {
        setTimeout(() => {
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
    }

    // Show notification
    if (typeof showNotification === 'function') {
        showNotification(`${matchCount} Kunden hervorgehoben`, 'info');
    }

    // Clear highlight after 10 seconds
    setTimeout(() => {
        rows.forEach(row => {
            row.style.backgroundColor = '';
            row.style.boxShadow = '';
        });
    }, 10000);
}

// Export chat response as Excel (CSV)
function exportChatToExcel(data, filename) {
    let csvContent = '';

    // Determine data type and format accordingly
    if (data.type === 'customers') {
        // Header row
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
        csvContent += `Gesamtforderung;${data.total}\n`;
        csvContent += `Aktive Fälle;${data.count}\n`;
        csvContent += `Ø DPD;${data.avgDpd}\n`;
        csvContent += `Eskalation;${data.segments.eskalation}\n`;
        csvContent += `Priorität;${data.segments.prioritaet}\n`;
        csvContent += `Restrukturierung;${data.segments.restrukturierung}\n`;
        csvContent += `Abwicklung;${data.segments.abwicklung}\n`;
    }

    // Add BOM for Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof showNotification === 'function') {
        showNotification('Excel-Export erfolgreich', 'success');
    }
}

// Export chat response as PDF
function exportChatToPdf(data, filename) {
    // Create printable content
    const printWindow = window.open('', '_blank');

    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${filename}</title>
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
                @media print { body { padding: 20px; } }
            </style>
        </head>
        <body>
            <h1>Collections Dashboard - ${filename}</h1>
            <p>Erstellt am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}</p>
    `;

    if (data.type === 'customers') {
        const total = data.items.reduce((sum, c) => sum + c.forderung, 0);
        htmlContent += `
            <div class="summary">
                <h3>Zusammenfassung</h3>
                <p><strong>${data.items.length}</strong> Kunden · <strong>€${total.toLocaleString('de-DE')}</strong> Gesamtforderung</p>
            </div>
            <table>
                <thead>
                    <tr><th>ID</th><th>Name</th><th>Forderung</th><th>DPD</th><th>Segment</th><th>Status</th></tr>
                </thead>
                <tbody>
        `;
        data.items.forEach(item => {
            htmlContent += `<tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>€${item.forderung.toLocaleString('de-DE')}</td>
                <td>${item.dpd}</td>
                <td>${item.segment}</td>
                <td>${item.status}</td>
            </tr>`;
        });
        htmlContent += '</tbody></table>';
    } else if (data.type === 'payments') {
        const total = data.items.reduce((sum, p) => sum + p.betrag, 0);
        htmlContent += `
            <div class="summary">
                <h3>Zahlungsübersicht</h3>
                <p><strong>${data.items.length}</strong> Zahlungen · <strong>€${total.toLocaleString('de-DE')}</strong> Gesamtbetrag</p>
            </div>
            <table>
                <thead>
                    <tr><th>ID</th><th>Kunde</th><th>Betrag</th><th>Datum</th><th>Art</th></tr>
                </thead>
                <tbody>
        `;
        data.items.forEach(item => {
            htmlContent += `<tr>
                <td>${item.id}</td>
                <td>${item.kunde}</td>
                <td>€${item.betrag.toLocaleString('de-DE')}</td>
                <td>${item.datum}</td>
                <td>${item.art}</td>
            </tr>`;
        });
        htmlContent += '</tbody></table>';
    } else if (data.type === 'portfolio') {
        htmlContent += `
            <div class="summary">
                <h3>Portfolio-Übersicht</h3>
                <table style="width: auto;">
                    <tr><td><strong>Gesamtforderung:</strong></td><td>€${data.total.toLocaleString('de-DE')}</td></tr>
                    <tr><td><strong>Aktive Fälle:</strong></td><td>${data.count}</td></tr>
                    <tr><td><strong>Ø DPD:</strong></td><td>${data.avgDpd} Tage</td></tr>
                </table>
            </div>
            <h3>Segmentverteilung</h3>
            <table>
                <thead><tr><th>Segment</th><th>Anzahl Fälle</th></tr></thead>
                <tbody>
                    <tr><td>Eskalation</td><td>${data.segments.eskalation}</td></tr>
                    <tr><td>Priorität</td><td>${data.segments.prioritaet}</td></tr>
                    <tr><td>Restrukturierung</td><td>${data.segments.restrukturierung}</td></tr>
                    <tr><td>Abwicklung</td><td>${data.segments.abwicklung}</td></tr>
                </tbody>
            </table>
        `;
    }

    htmlContent += `
            <div class="footer">
                Dieser Bericht wurde automatisch vom Collections Dashboard generiert.
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = function() {
        printWindow.print();
    };

    if (typeof showNotification === 'function') {
        showNotification('PDF-Export wird geöffnet', 'success');
    }
}

// Store last query result for export
let lastChatQueryResult = null;

// Generate follow-up suggestion buttons
function getFollowUpSuggestions() {
    return `
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
}

// Update the processBankenQuery to store results for export
function getExportButtons(data, title) {
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
}

// Export functions
window.initBankenChat = initBankenChat;
window.sendBankenMessage = sendBankenMessage;
window.showFilteredCustomers = showFilteredCustomers;
window.exportChatToExcel = exportChatToExcel;
window.exportChatToPdf = exportChatToPdf;
window.lastChatQueryResult = null;

console.log('✅ banken-chat.js geladen');
