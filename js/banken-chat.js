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

// Demo payment data
const demoPayments = [
    { id: 'Z-2024-1234', kunde: 'Maier Technik', betrag: 12500, datum: '2025-12-15', art: 'Vollzahlung' },
    { id: 'Z-2024-1235', kunde: 'Huber GmbH', betrag: 8900, datum: '2025-12-14', art: 'Teilzahlung' },
    { id: 'Z-2024-1236', kunde: 'Krause AG', betrag: 5600, datum: '2025-12-14', art: 'Ratenzahlung' },
    { id: 'Z-2024-1237', kunde: 'Schmitt Bau', betrag: 15200, datum: '2025-12-13', art: 'Vollzahlung' },
    { id: 'Z-2024-1238', kunde: 'Wolf & Söhne', betrag: 3400, datum: '2025-12-12', art: 'Ratenzahlung' },
    { id: 'Z-2024-1239', kunde: 'Bauer Logistik', betrag: 7800, datum: '2025-12-11', art: 'Teilzahlung' },
    { id: 'Z-2024-1240', kunde: 'Fuchs Elektro', betrag: 22100, datum: '2025-12-10', art: 'Vollzahlung' }
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

    // Top customers by amount
    if ((lower.includes('top') || lower.includes('höchste') || lower.includes('größte')) &&
        (lower.includes('forderung') || lower.includes('kunden') || lower.includes('ausstehend'))) {

        const countMatch = message.match(/(\d+)/);
        const count = countMatch ? parseInt(countMatch[1]) : 5;

        const sorted = [...demoCustomerData].sort((a, b) => b.forderung - a.forderung).slice(0, count);

        let response = `<span class="chat-icon chart"></span> **Top ${count} Kunden nach Forderungshöhe:**\n\n`;
        sorted.forEach((c, i) => {
            response += `${i + 1}. <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span> (${c.id})\n`;
            response += `   <span class="chat-icon euro"></span> €${c.forderung.toLocaleString('de-DE')} · <span class="chat-icon clock"></span> ${c.dpd} DPD · ${c.status}\n\n`;
        });

        const total = sorted.reduce((sum, c) => sum + c.forderung, 0);
        response += `\n<span class="chat-icon trend"></span> **Summe Top ${count}:** €${total.toLocaleString('de-DE')}`;

        // Add navigation button
        const customerIds = sorted.map(c => c.id).join(',');
        response += `\n\n<button class="chat-action-btn" onclick="showFilteredCustomers('${customerIds}')"><span class="chat-icon search"></span> Diese ${count} Kunden in Liste anzeigen</button>`;

        return response;
    }

    // Payments / Zahlungseingänge
    if (lower.includes('zahlung') || lower.includes('eingang') || lower.includes('bezahlt') || lower.includes('ausgeglichen')) {
        const isWeek = lower.includes('woche') || lower.includes('letzte');

        let response = `<span class="chat-icon payment"></span> **Zahlungseingänge${isWeek ? ' der letzten Woche' : ''}:**\n\n`;
        demoPayments.forEach(p => {
            response += `• **${p.kunde}** - €${p.betrag.toLocaleString('de-DE')}\n`;
            response += `  ${p.datum} · ${p.art}\n\n`;
        });

        const total = demoPayments.reduce((sum, p) => sum + p.betrag, 0);
        response += `\n<span class="chat-icon check"></span> **Gesamt:** €${total.toLocaleString('de-DE')} (${demoPayments.length} Zahlungen)`;

        return response;
    }

    // Filter by segment
    if (lower.includes('eskalation') || lower.includes('inkasso')) {
        const filtered = demoCustomerData.filter(c => c.segment === 'eskalation');

        let response = `<span class="chat-icon alert"></span> **Eskalation-Fälle (Inkasso):** ${filtered.length}\n\n`;
        filtered.forEach(c => {
            response += `• <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span> - €${c.forderung.toLocaleString('de-DE')} (${c.dpd} DPD)\n`;
        });

        response += `\n\n<button class="chat-action-btn" onclick="filterBySegment('eskalation')"><span class="chat-icon search"></span> Eskalation-Segment in Matrix anzeigen</button>`;

        return response;
    }

    if (lower.includes('restrukturierung') || lower.includes('stundung')) {
        const filtered = demoCustomerData.filter(c => c.segment === 'restrukturierung');

        let response = `<span class="chat-icon refresh"></span> **Restrukturierung-Fälle:** ${filtered.length}\n\n`;
        filtered.forEach(c => {
            response += `• <span class="chat-customer-link" onclick="openCustomerDetail('${c.id}')">${c.name}</span> - €${c.forderung.toLocaleString('de-DE')} · ${c.status}\n`;
        });

        response += `\n\n<button class="chat-action-btn" onclick="filterBySegment('restrukturierung')"><span class="chat-icon search"></span> Restrukturierung-Segment in Matrix anzeigen</button>`;

        return response;
    }

    // DPD filter
    if (lower.includes('dpd') || lower.includes('überfällig') || lower.includes('verzug')) {
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

        return `<span class="chat-icon chart"></span> **Portfolio-Übersicht:**

**Gesamtforderung:** €${total.toLocaleString('de-DE')}
**Aktive Fälle:** ${demoCustomerData.length}
**Ø DPD:** ${avgDpd} Tage

**Segmente:**
<span class="chat-icon dot red"></span> Eskalation: ${segments.eskalation} Fälle
<span class="chat-icon dot green"></span> Priorität: ${segments.prioritaet} Fälle
<span class="chat-icon dot amber"></span> Restrukturierung: ${segments.restrukturierung} Fälle
<span class="chat-icon dot gray"></span> Abwicklung: ${segments.abwicklung} Fälle

**Letzte Zahlungen:** €${demoPayments.reduce((s, p) => s + p.betrag, 0).toLocaleString('de-DE')} (7 Tage)`;
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

<button class="chat-action-btn" onclick="openCustomerDetail('${found.id}')"><span class="chat-icon user"></span> Kundendetail öffnen</button>`;
            } else {
                return `<span class="chat-icon x"></span> Kein Kunde mit "${nameMatch[1]}" gefunden.\n\nVerfügbare Kunden durchsuchen Sie in der Tabelle unten.`;
            }
        }
    }

    // Default response with suggestions
    return `Ich verstehe Ihre Anfrage: "${message}"

**Verfügbare Abfragen:**
• "Top 5 Kunden mit höchsten Forderungen"
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

// Export functions
window.initBankenChat = initBankenChat;
window.sendBankenMessage = sendBankenMessage;
window.showFilteredCustomers = showFilteredCustomers;

console.log('✅ banken-chat.js geladen');
