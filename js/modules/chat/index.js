/**
 * Chat Module - ES6 Entry Point (ES2024)
 * AI Chat Logic with Claude API
 */

// ========================================
// CONFIGURATION
// ========================================

const CLAUDE_WORKER_URL = 'https://vst-claude-api.eike-3e2.workers.dev';
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

// ========================================
// STATE
// ========================================

let chatHistory = [];
let isProcessing = false;
let chatInitialized = false;

// ========================================
// HELPERS
// ========================================

const getClaudeApiKey = () => localStorage.getItem('claude_api_token') ?? '';
const shouldUseMockMode = () => !CLAUDE_WORKER_URL && !getClaudeApiKey();

// ========================================
// MOCK RESPONSES
// ========================================

const generateMockResponse = (message) => {
    const lower = message.toLowerCase();

    if ((lower.includes('performance') && (lower.includes('freiburg') || lower.includes('landkreis')))) {
        return `📊 **Performance-Analyse für Freiburg:**\n\n**Neugeschäft:** €4.2 Mio (Rang 3 in BW)\n**Bestand:** €180 Mio\n**Stornoquote:** 6.8%\n**NPS Score:** 78\n\n💡 *Mit einem API-Key würde ich detaillierte Echtzeitdaten analysieren.*`;
    }

    if (lower.includes('10%') || (lower.includes('beste') && lower.includes('kv'))) {
        return `💯 **Top-Performer bei KV (>10% über Durchschnitt):**\n\n1. **VM00042 - Julia Schneider** (+18.3%)\n2. **VM00087 - Thomas Weber** (+15.7%)\n3. **VM00153 - Sandra Hoffmann** (+14.2%)\n\n💡 *Mock-Antwort - echte Daten mit API-Key.*`;
    }

    if (lower.includes('vergleich') || lower.includes('vs')) {
        return `⚖️ **Vergleich Baden-Württemberg vs Bayern:**\n\n**BW:** Storno 7.2%, NPS 79\n**Bayern:** Storno 7.8%, NPS 76\n\n🏆 BW bei Storno & NPS, Bayern bei Volumen`;
    }

    if (lower.includes('top') || lower.includes('beste')) {
        return `📊 **Top 5 Vermittler**\n\n1. VM00001 - Max Mustermann\n2. VM00042 - Julia Schneider\n3. VM00087 - Thomas Weber\n\n💡 *Mock-Antwort*`;
    }

    if (lower.includes('wie viele') || lower.includes('anzahl')) {
        const count = window.dailyRawData?.length ?? 0;
        return `📊 **Datensatz-Übersicht:**\n\n• ${count.toLocaleString()} Zeilen Tagesdaten\n• Jahr: ${window.state?.filters?.year ?? '2024'}\n\n💡 *Mit API-Key: detaillierte Analysen*`;
    }

    return `Ich habe deine Frage verstanden: "${message}"\n\n⚠️ **Mock-Modus aktiv**\n\n**Verfügbare Befehle:**\n• "Top 5 Vermittler"\n• "Performance von Freiburg"\n• "Vergleiche BW vs Bayern"`;
};

// ========================================
// DATA CONTEXT
// ========================================

const getDataContext = () => {
    const rawData = window.dailyRawData;
    if (!rawData?.length) return "Keine Daten geladen.";

    const agenturen = window.getAgenturen?.() ?? [];
    const bundeslaender = [...new Set(rawData.map(r => r.bundesland))].filter(Boolean);
    const silos = [...new Set(rawData.map(r => r.silo))].filter(Boolean);
    const segments = [...new Set(rawData.map(r => r.segment))].filter(Boolean);
    const filteredData = window.getFilteredData?.() ?? [];

    if (!filteredData.length) {
        return `Datensatz: ${rawData.length} Zeilen\nPROBLEM: Keine Daten für aktuelle Filter.`;
    }

    const totalNeugeschaeft = filteredData.reduce((sum, m) => sum + (m.neugeschaeft ?? 0), 0);
    const avgStorno = filteredData.reduce((sum, m) => sum + (m.storno ?? 0), 0) / filteredData.length;
    const avgNPS = filteredData.reduce((sum, m) => sum + (m.nps ?? 0), 0) / filteredData.length;

    const agentList = agenturen.slice(0, 10).map(a => `  - ${a.id}: ${a.name ?? 'Kein Name'}`).join('\n');

    let context = `Datensatz: ${rawData.length} Zeilen\nAgenturen: ${agenturen.length}\n\n`;
    context += `Vermittler-IDs:\n${agentList}\n\n`;
    context += `Bundesländer: ${bundeslaender.join(', ')}\nSilos: ${silos.join(', ')}\nSegmente: ${segments.join(', ')}\n\n`;
    context += `AGGREGIERT:\n- Neugeschäft YTD: €${(totalNeugeschaeft / 1000000).toFixed(1)} Mio\n`;
    context += `- Ø Stornoquote: ${avgStorno.toFixed(2)}%\n- Ø NPS: ${avgNPS.toFixed(1)}`;

    return context;
};

// ========================================
// API FUNCTIONS
// ========================================

const sendToClaude = async (message) => {

    const dataContext = getDataContext();
    const systemPrompt = `Du bist ein KI-Assistent für ein Versicherungs-Dashboard. Du hast Zugriff auf CSV-Daten und kannst Dashboard-Filter steuern.

VERFÜGBARE FUNKTIONEN:
1. setAgenturFilter(vermittler_id) - Filtert nach Agentur
2. setSiloFilter(silo) - Filtert nach Silo
3. setSegmentFilter(segments) - Filtert nach Segmenten
4. clearAllFilters() - Setzt alle Filter zurück
5. showTopAgenturen(anzahl, sortBy) - Zeigt Top N Vermittler
6. showAgenturOverview(vermittler_id) - Zeigt Agentur-Übersicht

Antworte auf Deutsch und sei freundlich. Formatiere große Zahlen lesbar.`;

    const messages = [{ role: 'user', content: `AKTUELLE DATEN:\n${dataContext}\n\nUSER FRAGE: ${message}` }];
    const apiUrl = CLAUDE_WORKER_URL || "https://api.anthropic.com/v1/messages";
    const headers = { "Content-Type": "application/json" };

    if (!CLAUDE_WORKER_URL) {
        headers["x-api-key"] = getClaudeApiKey();
        headers["anthropic-version"] = "2023-06-01";
        headers["anthropic-dangerous-direct-browser-access"] = "true";
    }

    const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 2000, system: systemPrompt, messages })
    });

    if (!response.ok) throw new Error(`API request failed: ${response.status}`);

    const data = await response.json();
    const assistantMessage = data.content[0].text;

    hideTyping();
    addMessage('assistant', assistantMessage);
    processFilterCommands(assistantMessage);

    chatHistory.push({ role: 'user', content: message }, { role: 'assistant', content: assistantMessage });
};

// ========================================
// FILTER PROCESSING
// ========================================

const processFilterCommands = async (message) => {
    let filterWasSet = false;

    // Agentur Overview
    const overviewMatch = message.match(/showAgenturOverview\(['"]([^'"]+)['"]\)/);
    if (overviewMatch) {
        window.showAgenturOverview?.(overviewMatch[1]);
        return true;
    }

    // Agentur Filter
    if (message.includes('setAgenturFilter')) {
        const match = message.match(/setAgenturFilter\(['"](.+?)['"]\)/);
        if (match) {
            window.setAgenturFilter?.(match[1]);
            filterWasSet = true;
        }
    }

    // Silo Filter
    if (message.includes('setSiloFilter')) {
        const match = message.match(/setSiloFilter\(['"](.+?)['"]\)/);
        if (match) {
            window.setSiloFilter?.(match[1]);
            filterWasSet = true;
        }
    }

    // Clear Filters
    if (message.includes('clearAllFilters')) {
        window.clearAllFilters?.();
        filterWasSet = true;
    }

    // Top Agenturen
    const topMatch = message.match(/showTopAgenturen\((\d+)(?:,\s*['"](\w+)['"])?\)/);
    if (topMatch) {
        window.showTopAgenturen?.(parseInt(topMatch[1]), topMatch[2] ?? 'neugeschaeft');
        filterWasSet = true;
    }

    return filterWasSet;
};

// ========================================
// UI FUNCTIONS
// ========================================

const cleanTechnicalContent = (content) => {
    let cleaned = content;
    cleaned = cleaned.replace(/```(?:plaintext|javascript|js)?\s*\n?[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/\b(showTopAgenturen|setAgenturFilter|setSiloFilter|clearAllFilters|showAgenturOverview)\s*\([^)]*\)/g, '');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return cleaned.trim();
};

const addMessage = (role, content) => {
    const chatBody = document.getElementById('chatBody');
    if (!chatBody) return;

    chatBody.querySelector('.chat-welcome')?.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.innerHTML = role === 'user'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9"></path></svg>';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = cleanTechnicalContent(content)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    if (role === 'assistant') showAIResponse(cleanTechnicalContent(content));
};

const showTyping = () => {
    const chatBody = document.getElementById('chatBody');
    if (!chatBody) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message assistant';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="chat-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="3"></circle></svg></div>
        <div class="chat-typing"><span></span><span></span><span></span></div>
    `;
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
};

const hideTyping = () => document.getElementById('typingIndicator')?.remove();

const showAIResponse = (message) => {
    const panel = document.getElementById('aiResponsePanel');
    const content = document.getElementById('aiResponseContent');
    if (!panel || !content) return;

    content.innerHTML = message
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/\n/g, '<br>');

    panel.style.display = 'block';
};

const hideAIResponse = () => {
    document.getElementById('aiResponsePanel')?.style && (document.getElementById('aiResponsePanel').style.display = 'none');
};

// ========================================
// MAIN FUNCTIONS
// ========================================

export const sendMessage = async () => {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput?.value?.trim();

    if (!message || isProcessing) return;

    chatInput.value = '';
    chatInput.style.height = 'auto';
    addMessage('user', message);
    showTyping();
    isProcessing = true;

    try {
        if (shouldUseMockMode()) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            hideTyping();
            addMessage('assistant', generateMockResponse(message));
        } else {
            await sendToClaude(message);
        }
    } catch (error) {
        console.error('❌ Chat Fehler:', error);
        hideTyping();
        addMessage('assistant', '❌ Fehler bei der Verarbeitung. Bitte versuche es erneut.');
    }

    isProcessing = false;
};

export const activateChat = () => {
    const chatToggle = document.getElementById('chatToggle');
    const chatWidget = document.getElementById('chatWidget');

    if (chatToggle && chatWidget) {
        chatToggle.style.display = 'flex';
        chatWidget.style.display = 'flex';
        setTimeout(() => { chatToggle.style.display = 'none'; }, 1000);
    }
};

export const askSampleQuestion = (question) => {
    document.querySelector('.chat-welcome')?.style && (document.querySelector('.chat-welcome').style.display = 'none');
    const chatInput = document.getElementById('chatInput');
    if (chatInput) chatInput.value = question;
    sendMessage();
};

export const initChat = () => {
    if (chatInitialized) return;


    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');

    if (!chatWidget || !chatToggle) {
        return;
    }

    const chatClose = document.getElementById('chatClose');
    const chatMinimize = document.getElementById('chatMinimize');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');

    if (!chatSend || !chatInput || !chatBody) return;

    chatInitialized = true;

    chatToggle.addEventListener('click', () => {
        chatWidget.style.display = 'flex';
        chatToggle.style.display = 'none';
        chatWidget.classList.remove('minimized');
        chatInput.focus();
    });

    chatClose?.addEventListener('click', () => {
        chatWidget.style.display = 'none';
        chatToggle.style.display = 'flex';
        chatWidget.classList.remove('minimized');
    });

    chatMinimize?.addEventListener('click', () => {
        chatWidget.classList.toggle('minimized');
    });

    chatSend.addEventListener('click', () => sendMessage());

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = chatInput.scrollHeight + 'px';
    });

    chatBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('example-btn')) {
            chatInput.value = e.target.dataset.question;
            sendMessage();
        }
    });

    document.getElementById('aiResponseClose')?.addEventListener('click', hideAIResponse);

    const rawData = window.dailyRawData;
    if (rawData?.length > 0) {
        chatToggle.style.display = 'flex';
        chatWidget.style.display = 'flex';
        setTimeout(() => { chatToggle.style.display = 'none'; }, 1000);

        if (shouldUseMockMode()) {
            addMessage('assistant', '⚠️ **Mock-Modus aktiv** - Claude AI ist über den Worker konfiguriert.');
        }
    } else {
        chatToggle.style.display = 'none';
        chatWidget.style.display = 'none';
    }

};

// ========================================
// FILTER FUNCTIONS (for external use)
// ========================================

export const setAgenturFilter = (vermittlerId) => {
    const currentYear = window.state?.filters?.year;
    if (window.state) {
        window.state.filters = {
            year: currentYear,
            agentur: vermittlerId,
            silo: 'alle',
            segments: ['alle'],
            products: ['alle'],
            bundeslaender: []
        };
        window.state.selectedStates?.clear();
    }
    window.updateAgenturFilterDisplay?.();
    window.updateAllKPIs?.();
};

export const setSiloFilter = (silo) => {
    if (window.state) window.state.filters.silo = silo;
    const el = document.getElementById('siloFilter');
    if (el) el.value = silo;
    window.updateAllKPIs?.();
};

export const setSegmentFilter = (segments) => {
    if (window.state) window.state.filters.segments = Array.isArray(segments) ? segments : [segments];
    window.updateSegmentDisplay?.();
    window.updateAllKPIs?.();
};

export const setBundeslandFilter = (bundeslaender) => {
    window.state?.selectedStates?.clear();
    bundeslaender.forEach(land => window.state?.selectedStates?.add(land));
    window.updateMapSelection?.();
    window.updateAllKPIs?.();
};

export const clearAllFilters = () => {
    if (window.state) {
        window.state.filters.agentur = 'alle';
        window.state.filters.silo = 'alle';
        window.state.filters.segments = ['alle'];
        window.state.filters.products = ['alle'];
        window.state.selectedStates?.clear();
    }
    window.updateAgenturFilterDisplay?.();
    window.updateSegmentDisplay?.();
    window.updateMapSelection?.();
    window.updateAllKPIs?.();
};

export const showTopAgenturen = (topN = 5, sortBy = 'neugeschaeft') => {
    window.switchView?.('table');
    if (window.state) {
        window.state.currentTableView = 'agenturen';
        window.state.tableSort = { column: sortBy, direction: 'desc' };
    }

    const allAgenturen = window.getAgenturenData?.() ?? [];
    allAgenturen.sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));
    const topAgenturen = allAgenturen.slice(0, topN);

    window.state?.selectedAgenturen?.clear();
    topAgenturen.forEach(a => window.state?.selectedAgenturen?.add(a.agentur));
    window.renderTable?.();
};

// ========================================
// WINDOW EXPORTS
// ========================================

Object.assign(window, {
    CLAUDE_WORKER_URL,
    CLAUDE_MODEL,
    USE_WORKER: !!CLAUDE_WORKER_URL,
    initChat,
    activateChat,
    sendMessage,
    setAgenturFilter,
    setSiloFilter,
    setSegmentFilter,
    setBundeslandFilter,
    clearAllFilters,
    showTopAgenturen,
    askSampleQuestion,
    showAIResponse,
    hideAIResponse
});

