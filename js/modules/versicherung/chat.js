/**
 * Versicherung Chat Module
 * ES6 Module for landing page chat (ES2024)
 */

import { isUsingMockMode, getApiToken } from './api.js';

// ========================================
// STATE
// ========================================

let isLandingChatProcessing = false;
const landingChatHistory = [];

// ========================================
// INITIALIZATION
// ========================================

export function initLandingChat() {
    const chatSend = document.getElementById('landingChatSend');
    const chatInput = document.getElementById('landingChatInput');

    if (!chatSend || !chatInput) return;

    chatSend.addEventListener('click', () => sendLandingChatMessage());

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendLandingChatMessage();
        }
    });

    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

}

// ========================================
// SEND MESSAGE
// ========================================

export async function sendLandingChatMessage() {
    const chatInput = document.getElementById('landingChatInput');
    const message = chatInput?.value?.trim();

    if (!message || isLandingChatProcessing) return;

    chatInput.value = '';
    chatInput.style.height = 'auto';

    addLandingChatMessage('user', message);
    showLandingChatTyping();

    isLandingChatProcessing = true;

    try {
        if (isUsingMockMode()) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockResponse = generateLandingMockResponse(message);
            hideLandingChatTyping();
            addLandingChatMessage('assistant', mockResponse);
        } else {
            await sendLandingMessageToClaude(message);
        }
    } catch (error) {
        console.error('[ERROR] Landing Chat Fehler:', error);
        hideLandingChatTyping();
        addLandingChatMessage('assistant', '[ERROR] Entschuldigung, es gab einen Fehler.');
    }

    isLandingChatProcessing = false;
}

// ========================================
// CLAUDE API
// ========================================

async function sendLandingMessageToClaude(message) {
    const dataContext = getLandingDataContext();

    const systemPrompt = `Du bist ein KI-Assistent für ein Versicherungs-Dashboard. Du hast Zugriff auf CSV-Daten und kannst Dashboard-Filter steuern.

VERFÜGBARE FUNKTIONEN:
1. setAgenturFilter(vermittler_id) - Filtert Dashboard nach Agentur
2. setSiloFilter(silo) - Filtert nach Silo
3. setSegmentFilter(segments) - Filtert nach Segmenten
4. setBundeslandFilter(bundeslaender) - Filtert nach Bundesländern
5. clearAllFilters() - Setzt alle Filter zurück
6. showAgenturOverview(vermittler_id) - Zeigt detaillierte Agentur-Übersichtsseite

WICHTIG: Antworte auf Deutsch und sei präzise.`;

    const apiUrl = window.USE_WORKER ? window.CLAUDE_WORKER_URL : 'https://api.anthropic.com/v1/messages';

    const headers = { 'Content-Type': 'application/json' };
    if (!window.USE_WORKER) {
        headers['x-api-key'] = getApiToken();
        headers['anthropic-version'] = '2023-06-01';
    }

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            model: window.CLAUDE_MODEL,
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{ role: 'user', content: `${dataContext}\n\nUSER FRAGE: ${message}` }]
        })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const assistantMessage = data.content?.[0]?.text ?? 'Keine Antwort erhalten.';

    hideLandingChatTyping();
    addLandingChatMessage('assistant', assistantMessage);

    landingChatHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage }
    );

    window.parseAndExecuteCommands?.(assistantMessage);
}

// ========================================
// DATA CONTEXT
// ========================================

function getLandingDataContext() {
    const rawData = window.dailyRawData ?? [];

    if (rawData.length === 0) {
        return 'Keine Daten geladen. Der Nutzer sollte zuerst eine CSV hochladen.';
    }

    const agenturen = typeof window.getAgenturen === 'function' ? window.getAgenturen() : [];
    const bundeslaender = [...new Set(rawData.map(r => r.bundesland))].filter(Boolean);
    const silos = [...new Set(rawData.map(r => r.silo))].filter(Boolean);

    return `
Datensatz: ${rawData.length} Zeilen
Agenturen: ${agenturen.length} verfügbar
Bundesländer: ${bundeslaender.join(', ')}
Silos: ${silos.join(', ')}`;
}

// ========================================
// MOCK RESPONSES
// ========================================

function generateLandingMockResponse(message) {
    const lower = message.toLowerCase();

    if (!window.dailyRawData?.length) {
        return '📊 **Keine Daten vorhanden**\n\nBitte lade zuerst eine CSV-Datei hoch oder gehe zum Dashboard.';
    }

    if (lower.includes('top') || lower.includes('beste')) {
        return '📊 **Top Vermittler** - Lade die Daten im Dashboard für Details!';
    }

    if (lower.includes('hallo') || lower.includes('hi')) {
        return 'Hallo! 👋 Ich kann dir beim Dashboard helfen. Lade eine CSV hoch oder gehe zum Dashboard!';
    }

    return `⚠️ **Mock-Modus aktiv**\n\nVerfügbare Befehle:\n• "Zeige Top 5 Vermittler"\n• "Wie viele Daten haben wir?"`;
}

// ========================================
// UI HELPERS
// ========================================

export function addLandingChatMessage(role, content) {
    const chatMessages = document.getElementById('landingChatMessages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `landing-chat-message ${role}`;

    const avatar = document.createElement('div');
    if (role === 'user') {
        avatar.className = 'chat-avatar';
        avatar.textContent = '👤';
    } else {
        avatar.className = 'chat-avatar-deloitte';
        avatar.innerHTML = '<span class="deloitte-d">D</span>';
    }

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');

    messageDiv.append(avatar, bubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function showLandingChatTyping() {
    const chatMessages = document.getElementById('landingChatMessages');
    if (!chatMessages) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'landing-chat-message assistant';
    typingDiv.id = 'landingTypingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar-deloitte';
    avatar.innerHTML = '<span class="deloitte-d">D</span>';

    const typing = document.createElement('div');
    typing.className = 'landing-chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';

    typingDiv.append(avatar, typing);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function hideLandingChatTyping() {
    document.getElementById('landingTypingIndicator')?.remove();
}

export function askLandingSampleQuestion(question) {
    const chatInput = document.getElementById('landingChatInput');
    if (chatInput) {
        chatInput.value = question;
        sendLandingChatMessage();
    }
}

// ========================================
// LANDING DATA CONTEXT
// ========================================

export function getLandingDataContext() {
    const rawData = window.dailyRawData || [];

    if (!rawData || rawData.length === 0) {
        return `Keine Daten geladen.

Der Nutzer ist auf der Landing Page und hat noch keine CSV-Datei hochgeladen.

HINWEIS FÜR ASSISTENT:
- Erkläre, dass zuerst Daten hochgeladen werden müssen
- Biete an, beim Upload zu helfen
- Oder schlage vor, zum Dashboard zu gehen und dort Test-Daten zu generieren`;
    }

    const agenturen = typeof window.getAgenturen === 'function' ? window.getAgenturen() : [];
    const bundeslaender = [...new Set(rawData.map(r => r.bundesland))].filter(Boolean);
    const silos = [...new Set(rawData.map(r => r.silo))].filter(Boolean);
    const segments = [...new Set(rawData.map(r => r.segment))].filter(Boolean);

    const filteredData = typeof window.getFilteredData === 'function' ? window.getFilteredData() : [];

    const totalNeugeschaeft = filteredData.reduce((sum, m) => sum + (m.neugeschaeft || 0), 0);
    const avgStorno = filteredData.length > 0 ?
        filteredData.reduce((sum, m) => sum + (m.storno || 0), 0) / filteredData.length : 0;
    const avgNPS = filteredData.length > 0 ?
        filteredData.reduce((sum, m) => sum + (m.nps || 0), 0) / filteredData.length : 0;
    const totalErgebnis = filteredData.reduce((sum, m) => sum + (m.ergebnis || 0), 0);
    const currentBestand = filteredData.length > 0 ? filteredData[filteredData.length - 1].bestand : 0;

    const agentList = agenturen.slice(0, 10).map(a =>
        `  - ${a.id}: ${a.name || 'Kein Name'}`
    ).join('\n');

    return `
Datensatz: ${rawData.length} Zeilen (Tagesdaten)
Agenturen: ${agenturen.length} verfügbar

WICHTIG - Vermittler-IDs (verwende diese für Filter!):
${agentList}
${agenturen.length > 10 ? `  ... und ${agenturen.length - 10} weitere` : ''}

Bundesländer: ${bundeslaender.join(', ')}
Silos: ${silos.join(', ')}
Segmente: ${segments.join(', ')}

AGGREGIERTE DATEN:
- Gesamt Neugeschäft YTD: €${(totalNeugeschaeft / 1000000).toFixed(1)} Mio
- Durchschnittl. Storno: ${(avgStorno * 100).toFixed(1)}%
- Durchschnittl. NPS: ${avgNPS.toFixed(0)}
- Gesamt Ergebnis: €${(totalErgebnis / 1000000).toFixed(1)} Mio
- Aktueller Bestand: €${(currentBestand / 1000000).toFixed(1)} Mio
`;
}

// ========================================
// MOCK RESPONSE GENERATOR
// ========================================

export function generateLandingMockResponse(message) {
    const lowerMessage = message.toLowerCase();
    const rawData = window.dailyRawData || [];

    if (!rawData || rawData.length === 0) {
        if (lowerMessage.includes('daten') || lowerMessage.includes('analyse') || lowerMessage.includes('zahlen')) {
            return '📊 **Keine Daten vorhanden**\n\nBitte lade zuerst eine CSV-Datei hoch (unten in der Box) oder gehe zum Dashboard und generiere Test-Daten.\n\nDann kann ich dir bei der Analyse helfen! 🚀';
        }
    }

    if (lowerMessage.includes('performance') && (lowerMessage.includes('freiburg') || lowerMessage.includes('landkreis') || lowerMessage.includes('stadt'))) {
        return `📊 **Performance-Analyse für Freiburg:**

**Neugeschäft:** €4.2 Mio (Rang 3 in Baden-Württemberg)
**Bestand:** €180 Mio
**Stornoquote:** 6.8% (gut, unter Durchschnitt)
**NPS Score:** 78 (überdurchschnittlich)

🎯 **Insights:**
- Starke Marktposition im Südwesten
- Niedrige Stornoquote deutet auf gute Kundenbindung hin
- Überdurchschnittlicher NPS zeigt hohe Kundenzufriedenheit

💡 *Mit einem API-Key würde ich detaillierte Echtzeitdaten aus deiner CSV analysieren.*`;
    }

    if (lowerMessage.includes('top') || lowerMessage.includes('beste')) {
        if (rawData && rawData.length > 0) {
            const agenturen = typeof window.getAgenturen === 'function' ? window.getAgenturen().slice(0, 5) : [];
            if (agenturen.length > 0) {
                return `📊 **Top 5 Vermittler:**\n\n${agenturen.map((a, i) =>
                    `${i+1}. **${a.name || a.id}**`
                ).join('\n')}\n\n💡 *Mit einem API-Key würde ich die tatsächlichen Zahlen analysieren.*`;
            }
        }
        return '📊 Bitte lade zuerst Daten hoch, dann kann ich dir die Top-Performer zeigen!';
    }

    if (lowerMessage.includes('wie viele') || lowerMessage.includes('anzahl')) {
        const count = rawData ? rawData.length : 0;
        const agentCount = typeof window.getAgenturen === 'function' ? window.getAgenturen().length : 0;

        if (count > 0) {
            return `📊 **Datensatz-Übersicht:**\n\n• ${count.toLocaleString()} Zeilen Tagesdaten\n• ${agentCount} Vermittler\n\n💡 *Mit einem API-Key könnte ich detaillierte Analysen durchführen.*`;
        }
        return '📊 Noch keine Daten geladen. Lade eine CSV hoch oder gehe zum Dashboard!';
    }

    return `Ich verstehe deine Frage zu "${message}".

💡 **Mock-Modus aktiv** - Für echte KI-Antworten:
1. Gib einen Claude API-Key ein (oben in den Einstellungen)
2. Oder nutze den integrierten Worker

📊 Verfügbare Analysen:
- Top-Performer Ranking
- Performance nach Region
- Storno-Analyse
- NPS-Entwicklung`;
}

// ========================================
// SUGGESTION SELECTION
// ========================================

let selectedSuggestionIndex = -1;

export function updateSuggestionSelection(items) {
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedSuggestionIndex);
    });
}

export function setSelectedSuggestionIndex(index) {
    selectedSuggestionIndex = index;
}

export function getSelectedSuggestionIndex() {
    return selectedSuggestionIndex;
}
