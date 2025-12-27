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
