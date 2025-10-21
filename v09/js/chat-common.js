// js/chat-common.js - Shared Chat Functionality

// Common configuration
// IMPORTANT: Replace 'YOUR_OPENAI_API_KEY_HERE' with your actual OpenAI API key
// or set USE_MOCK_MODE to true for testing without API calls
const CHAT_CONFIG = {
    OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
    USE_MOCK_MODE: true, // Set to false when API key is configured
    MODEL: 'gpt-4o',
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7
};

// Get data context for chat (shared between landing and main chat)
function getSharedDataContext() {
    if (!dailyRawData || dailyRawData.length === 0) {
        return {
            hasData: false,
            message: "Keine Daten geladen."
        };
    }

    const agenturen = typeof getAgenturen === 'function' ? getAgenturen() : [];
    const bundeslaender = [...new Set(dailyRawData.map(r => r.bundesland))].filter(Boolean);
    const silos = [...new Set(dailyRawData.map(r => r.silo))].filter(Boolean);
    const segments = [...new Set(dailyRawData.map(r => r.segment))].filter(Boolean);

    // Calculate basic stats from filtered data
    const filteredData = typeof getFilteredData === 'function' ? getFilteredData() : [];

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

    return {
        hasData: true,
        dataCount: dailyRawData.length,
        agentCount: agenturen.length,
        agentList: agentList,
        hasMoreAgents: agenturen.length > 10,
        moreAgentsCount: agenturen.length - 10,
        bundeslaender: bundeslaender.join(', '),
        silos: silos.join(', '),
        segments: segments.join(', '),
        stats: {
            totalNeugeschaeft,
            avgStorno,
            avgNPS,
            totalErgebnis,
            currentBestand,
            monthCount: filteredData.length
        }
    };
}

// Format message content with markdown support
function formatChatMessage(content) {
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

// Create message element
function createMessageElement(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = role === 'user' ? '👤' : '🤖';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = formatChatMessage(content);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);

    return messageDiv;
}

// Create typing indicator
function createTypingIndicator(idPrefix = '') {
    const typingDiv = document.createElement('div');
    typingDiv.className = `${idPrefix}chat-message assistant`;
    typingDiv.id = `${idPrefix}typingIndicator`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = '🤖';

    const typing = document.createElement('div');
    typing.className = `${idPrefix}chat-typing`;
    typing.innerHTML = '<span></span><span></span><span></span>';

    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typing);

    return typingDiv;
}

// Call OpenAI API
async function callOpenAI(messages) {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${CHAT_CONFIG.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: CHAT_CONFIG.MODEL,
                max_tokens: CHAT_CONFIG.MAX_TOKENS,
                temperature: CHAT_CONFIG.TEMPERATURE,
                messages: messages
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', response.status, errorText);
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('❌ OpenAI API Error:', error);
        throw error;
    }
}

// Build system prompt for OpenAI
function buildSystemPrompt() {
    return `Du bist ein KI-Assistent für ein Versicherungs-Dashboard. Du hast Zugriff auf CSV-Daten und kannst Dashboard-Filter steuern.

VERFÜGBARE FUNKTIONEN:
1. setAgenturFilter(vermittler_id) - Filtert Dashboard nach Agentur
   - Verwende IMMER die Vermittler-ID (z.B. 'VM00001'), NIEMALS den Namen!
   - Beispiel: setAgenturFilter('VM00001') für Eike Brenneisen

2. setSiloFilter(silo) - Filtert nach Silo
   - Gültige Werte: 'Ausschließlichkeit', 'Makler', 'Direktvertrieb', 'Banken'

3. setSegmentFilter(segments) - Filtert nach Segmenten
   - Gültige Werte: 'Leben', 'Kranken', 'Schaden', 'Kfz'

4. setBundeslandFilter(bundeslaender) - Filtert nach Bundesländern

5. clearAllFilters() - Setzt alle Filter zurück

WICHTIG:
- Nutze die bereitgestellten Daten aus dem Kontext
- Berechne Summen/Durchschnitte aus den echten Zahlen
- Formatiere große Zahlen lesbar (z.B. "€45.2 Mio")
- Sei präzise und konkret
- Antworte auf Deutsch und sei freundlich`;
}

// Build data context string
function buildDataContextString(context) {
    if (!context.hasData) {
        return `Keine Daten geladen.

Der Nutzer hat noch keine CSV-Datei hochgeladen.

HINWEIS FÜR ASSISTENT:
- Erkläre, dass zuerst Daten hochgeladen werden müssen
- Biete an, beim Upload zu helfen
- Oder schlage vor, zum Dashboard zu gehen und dort Test-Daten zu generieren`;
    }

    return `
Datensatz: ${context.dataCount} Zeilen (Tagesdaten)
Agenturen: ${context.agentCount} verfügbar

WICHTIG - Vermittler-IDs (verwende diese für Filter!):
${context.agentList}
${context.hasMoreAgents ? `  ... und ${context.moreAgentsCount} weitere` : ''}

Bundesländer: ${context.bundeslaender}
Silos: ${context.silos}
Segmente: ${context.segments}

AGGREGIERTE DATEN:
- Gesamt Neugeschäft YTD: €${(context.stats.totalNeugeschaeft / 1000000).toFixed(1)} Mio
- Durchschnitt Stornoquote: ${context.stats.avgStorno.toFixed(2)}%
- Durchschnitt NPS: ${context.stats.avgNPS.toFixed(1)}
- Gesamt Ergebnis: €${(context.stats.totalErgebnis / 1000).toFixed(0)}k
- Aktueller Bestand: €${(context.stats.currentBestand / 1000000).toFixed(1)} Mio
- Anzahl Monate mit Daten: ${context.stats.monthCount}
`;
}

// Make functions globally available
window.CHAT_CONFIG = CHAT_CONFIG;
window.getSharedDataContext = getSharedDataContext;
window.formatChatMessage = formatChatMessage;
window.createMessageElement = createMessageElement;
window.createTypingIndicator = createTypingIndicator;
window.callOpenAI = callOpenAI;
window.buildSystemPrompt = buildSystemPrompt;
window.buildDataContextString = buildDataContextString;

console.log('✅ chat-common.js geladen');
