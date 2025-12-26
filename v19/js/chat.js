// js/chat.js - AI Chat Logic with Claude API (mit automatischer Datenanalyse nach Filtern)

let chatHistory = [];
let isProcessing = false;
let chatInitialized = false; // ✨ v15: Flag to prevent multiple initializations

// ⚠️ CONFIGURATION - Claude API Key wird aus localStorage geladen
// User kann den Key auf der Landing Page eingeben
const CLAUDE_API_KEY = localStorage.getItem('claude_api_token') || '';
const CLAUDE_MODEL = 'claude-sonnet-4-5-20250514';
let USE_MOCK_MODE = !CLAUDE_API_KEY;

// Initialize chat widget
function initChat() {
    // ✨ v15: Prevent multiple initializations
    if (chatInitialized) {
        console.log('⚠️ Chat bereits initialisiert, überspringe...');
        return;
    }

    console.log('🤖 initChat() aufgerufen');
    console.log('📊 dailyRawData verfügbar:', dailyRawData ? dailyRawData.length + ' Zeilen' : 'NICHT VERFÜGBAR');

    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');

    if (!chatWidget || !chatToggle) {
        console.error('❌ Chat Elemente nicht gefunden im DOM!');
        console.log('chatWidget:', chatWidget);
        console.log('chatToggle:', chatToggle);
        return;
    }

    const chatClose = document.getElementById('chatClose');
    const chatMinimize = document.getElementById('chatMinimize');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');

    if (!chatSend || !chatInput || !chatBody) {
        console.error('❌ Chat Input-Elemente nicht gefunden!');
        return;
    }

    // ✨ v15: Mark as initialized
    chatInitialized = true;

    // Toggle chat
    chatToggle.addEventListener('click', () => {
        console.log('💬 Chat Toggle geklickt');
        chatWidget.style.display = 'flex';
        chatToggle.style.display = 'none';
        chatWidget.classList.remove('minimized'); // ✨ v15: Ensure not minimized when opened
        chatInput.focus();
    });

    // Close chat
    chatClose.addEventListener('click', () => {
        console.log('❌ Chat geschlossen');
        chatWidget.style.display = 'none';
        chatToggle.style.display = 'flex';
        chatWidget.classList.remove('minimized'); // ✨ v15: Reset minimized state
    });

    // Minimize chat
    chatMinimize.addEventListener('click', () => {
        console.log('➖ Chat minimiert/maximiert');
        const isMinimized = chatWidget.classList.toggle('minimized');
        console.log('📐 Minimized state:', isMinimized);
    });
    
    // Send message
    chatSend.addEventListener('click', () => sendMessage());
    
    // Enter to send (Shift+Enter for new line)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = chatInput.scrollHeight + 'px';
    });
    
    // Example question buttons
    chatBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('example-btn')) {
            const question = e.target.dataset.question;
            chatInput.value = question;
            sendMessage();
        }
    });

    // Show chat if data is already loaded
    const rawData = window.dailyRawData || (typeof dailyRawData !== 'undefined' ? dailyRawData : null);
    if (rawData && rawData.length > 0) {
        console.log('✅ CSV Daten vorhanden - Chat wird aktiviert');
        chatToggle.style.display = 'flex';
        chatWidget.style.display = 'flex';

        // Auto-hide toggle, show widget after 1 second
        setTimeout(() => {
            console.log('🎯 Chat Toggle ausgeblendet, Widget angezeigt');
            chatToggle.style.display = 'none';
        }, 1000);

        // Show welcome message - Claude is always active
        addMessage('assistant', '**Claude AI aktiv** – Bereit für deine Datenanalyse.\n\nStelle mir Fragen zu deinem Dashboard oder nutze die Beispielfragen oben.');
    } else {
        console.log('ℹ️ Keine CSV Daten - Chat bleibt verborgen bis Daten geladen werden');
        // Chat ist initialisiert, aber versteckt
        chatToggle.style.display = 'none';
        chatWidget.style.display = 'none';
    }

    console.log('✅ Chat erfolgreich initialisiert!');
}

// Activate chat when data is loaded (call this after CSV upload)
function activateChat() {
    const chatToggle = document.getElementById('chatToggle');
    const chatWidget = document.getElementById('chatWidget');

    if (chatToggle && chatWidget) {
        console.log('✅ Chat wird aktiviert (Daten wurden geladen)');
        chatToggle.style.display = 'flex';
        chatWidget.style.display = 'flex';

        setTimeout(() => {
            chatToggle.style.display = 'none';
        }, 1000);
    }
}

// Make activateChat globally available
window.activateChat = activateChat;

// Send message to OpenAI (or Mock)
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    console.log('📤 Nachricht senden:', message);
    
    if (!message || isProcessing) {
        console.log('⚠️ Leere Nachricht oder bereits in Verarbeitung');
        return;
    }
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Add user message to chat
    addMessage('user', message);
    
    // Show typing indicator
    showTyping();
    
    isProcessing = true;
    
    try {
        // Real Claude API call - always active
        console.log('🚀 Rufe Claude API auf...');
        await sendToClaude(message);
        
    } catch (error) {
        console.error('❌ Chat Fehler:', error);
        hideTyping();
        addMessage('assistant', '❌ Entschuldigung, es gab einen Fehler bei der Verarbeitung deiner Anfrage. Bitte versuche es erneut.');
    }
    
    isProcessing = false;
}

// Generate mock response for testing
function generateMockResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Performance von Stadt/Landkreis
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
    
    // Top 10%+ bei KV
    if (lowerMessage.includes('10%') || (lowerMessage.includes('beste') && lowerMessage.includes('kv'))) {
        return `💯 **Top-Performer bei Krankenversicherung (>10% über Durchschnitt):**

1. **VM00042 - Julia Schneider** (+18.3%)
   - Neugeschäft KV: €125k | Storno: 4.2%
   
2. **VM00087 - Thomas Weber** (+15.7%)
   - Neugeschäft KV: €118k | Storno: 5.1%
   
3. **VM00153 - Sandra Hoffmann** (+14.2%)
   - Neugeschäft KV: €112k | Storno: 4.8%
   
4. **VM00201 - Michael Klein** (+12.9%)
   - Neugeschäft KV: €108k | Storno: 5.3%
   
5. **VM00312 - Anna Becker** (+11.4%)
   - Neugeschäft KV: €103k | Storno: 5.7%

📈 **Durchschnitt:** €92k Neugeschäft KV
🎯 **Gemeinsame Erfolgsfaktoren:** Niedrige Stornoquoten, Fokus auf Zusatzversicherungen

💡 *Mit einem API-Key würde ich die echten Daten analysieren!*`;
    }
    
    // Vergleich Bundesländer
    if (lowerMessage.includes('vergleich') || lowerMessage.includes('vs')) {
        return `⚖️ **Vergleich Baden-Württemberg vs Bayern:**

**Baden-Württemberg:**
- Stornoquote: 7.2%
- NPS Score: 79
- Neugeschäft: €45.2 Mio
- Bestand: €1.8 Mrd

**Bayern:**
- Stornoquote: 7.8%
- NPS Score: 76
- Neugeschäft: €52.1 Mio
- Bestand: €2.1 Mrd

🏆 **Winner:** BW bei Storno & NPS, Bayern bei Volumen

💡 *Mit einem API-Key würde ich detaillierte Analysen der CSV-Daten machen!*`;
    }
    
    // Bester NPS
    if (lowerMessage.includes('nps') && lowerMessage.includes('beste')) {
        return `⭐ **Bundesländer mit bestem NPS Score:**

1. 🥇 **Hamburg** - NPS: 82
2. 🥈 **Baden-Württemberg** - NPS: 79
3. 🥉 **Bayern** - NPS: 76
4. **Hessen** - NPS: 74
5. **Nordrhein-Westfalen** - NPS: 72

📊 **Bundesweiter Durchschnitt:** NPS 68

🎯 **Insights:** Starke Stadtstaaten performen überdurchschnittlich

💡 *Mit einem API-Key würde ich die echten NPS-Daten aus deiner CSV analysieren!*`;
    }
    
    // Top performers
    if (lowerMessage.includes('top') || lowerMessage.includes('beste')) {
        const agenturen = getAgenturen().slice(0, 5);
        return `📊 Hier sind die Top 5 Vermittler:\n\n${agenturen.map((a, i) => 
            `${i+1}. **${a.name || a.id}**`
        ).join('\n')}\n\n💡 *Dies ist eine Mock-Antwort. Mit einem API-Key würde ich die tatsächlichen Zahlen analysieren.*`;
    }
    
    // Filter commands
    if (lowerMessage.includes('filter') || lowerMessage.includes('zeig')) {
        if (lowerMessage.includes('eike') || lowerMessage.includes('brenneisen')) {
            setAgenturFilter('VM00001');
            return `✅ Filter gesetzt auf **Eike Brenneisen** (VM00001)\n\nDas Dashboard zeigt jetzt nur noch Daten dieser Agentur.`;
        }
        if (lowerMessage.includes('makler')) {
            setSiloFilter('Makler');
            return `✅ Filter gesetzt auf **Makler**\n\nDas Dashboard zeigt jetzt nur noch Makler-Daten.`;
        }
        if (lowerMessage.includes('zurück') || lowerMessage.includes('reset')) {
            clearAllFilters();
            return `✅ Alle Filter wurden zurückgesetzt.\n\nDas Dashboard zeigt wieder alle Daten.`;
        }
    }
    
    // General info
    if (lowerMessage.includes('wie viele') || lowerMessage.includes('anzahl')) {
        const count = dailyRawData ? dailyRawData.length : 0;
        const agentCount = getAgenturen().length;
        return `📊 **Datensatz-Übersicht:**\n\n• ${count.toLocaleString()} Zeilen Tagesdaten\n• ${agentCount} Vermittler\n• Jahr: ${state.filters.year}\n\n💡 *Mit einem API-Key könnte ich detaillierte Analysen durchführen.*`;
    }
    
    // Default response
    return `Ich habe deine Frage verstanden: "${message}"\n\n⚠️ **Mock-Modus aktiv** - Um echte KI-Analyse zu aktivieren:\n\n1. Besorge einen API-Key von [OpenAI](https://platform.openai.com/)\n2. Öffne \`js/chat.js\`\n3. Ersetze \`DEIN_API_KEY_HIER\` mit deinem Key\n4. Setze \`USE_MOCK_MODE = false\`\n\n**Verfügbare Mock-Befehle:**\n• "Zeige Top 5 Vermittler"\n• "Wie ist die Performance von Freiburg?"\n• "Welche Vermittler sind +10% besser bei KV?"\n• "Vergleiche BW vs Bayern"\n• "Welche Bundesländer haben besten NPS?"\n• "Filtere nach Eike Brenneisen"\n• "Wie viele Daten haben wir?"`;
}

// Send to Claude API
async function sendToClaude(message) {
    console.log('🔑 Verwende Claude API-Key:', CLAUDE_API_KEY.substring(0, 20) + '...');

    // Prepare context about current data
    const dataContext = getDataContext();

    // System prompt for Claude
    const systemPrompt = `Du bist ein KI-Assistent für ein Versicherungs-Dashboard. Du hast Zugriff auf CSV-Daten und kannst Dashboard-Filter steuern.

VERFÜGBARE FUNKTIONEN:
1. setAgenturFilter(vermittler_id) - Filtert Dashboard nach Agentur
   - Verwende IMMER die Vermittler-ID (z.B. 'VM00001'), NIEMALS den Namen!
   - Beispiel: setAgenturFilter('VM00001') für Eike Brenneisen
   - Nach dem Filtern erhältst du automatisch die gefilterten Daten zur Analyse

2. setSiloFilter(silo) - Filtert nach Silo
   - Gültige Werte: 'Ausschließlichkeit', 'Makler', 'Direktvertrieb', 'Banken'

3. setSegmentFilter(segments) - Filtert nach Segmenten
   - Gültige Werte: 'Leben', 'Kranken', 'Schaden', 'Kfz'

4. setBundeslandFilter(bundeslaender) - Filtert nach Bundesländern

5. clearAllFilters() - Setzt alle Filter zurück

WICHTIG beim Filtern:
- Nenne die Funktion GENAU so in deiner Antwort: setAgenturFilter('VM00001')
- Verwende für Agenturen IMMER die ID aus der Datenliste
- SAG DEM USER: "Ich setze jetzt den Filter und analysiere dann die Daten..."
- Die Analyse erfolgt dann automatisch mit den gefilterten Daten

WICHTIG bei Analysen:
- Nutze die bereitgestellten Daten aus dem Kontext
- Berechne Summen/Durchschnitte aus den echten Zahlen
- Formatiere große Zahlen lesbar (z.B. "€45.2 Mio")
- Sei präzise und konkret
- Antworte auf Deutsch und sei freundlich`;

    // Build messages array for Claude
    const messages = [
        {
            role: 'user',
            content: `AKTUELLE DATEN:
${dataContext}

USER FRAGE: ${message}`
        }
    ];

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 2000,
            system: systemPrompt,
            messages: messages
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Claude API Fehler:', response.status, errorText);
        throw new Error(`Claude API request failed: ${response.status}`);
    }

    const data = await response.json();
    // Claude returns content as an array of content blocks
    const assistantMessage = data.content[0].text;

    console.log('✅ Claude Antwort erhalten:', assistantMessage.substring(0, 100) + '...');

    hideTyping();
    addMessage('assistant', assistantMessage);

    // Check if response contains filter commands and process them
    const filterWasSet = await processFilterCommands(assistantMessage);

    // Add to history
    chatHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage }
    );
}

// Get context about current data
function getDataContext() {
    if (!dailyRawData || dailyRawData.length === 0) {
        console.error('❌ getDataContext: dailyRawData ist leer oder null!');
        return "Keine Daten geladen.";
    }

    console.log('📊 getDataContext: dailyRawData hat', dailyRawData.length, 'Zeilen');
    console.log('📊 Aktuelle Filter:', JSON.stringify(state.filters));

    const agenturen = getAgenturen();
    const bundeslaender = [...new Set(dailyRawData.map(r => r.bundesland))].filter(Boolean);
    const silos = [...new Set(dailyRawData.map(r => r.silo))].filter(Boolean);
    const segments = [...new Set(dailyRawData.map(r => r.segment))].filter(Boolean);

    // Calculate some basic stats from FILTERED data
    const filteredData = getFilteredData();

    console.log('📊 getFilteredData() lieferte', filteredData.length, 'Monate');

    // WICHTIG: Wenn gefilterte Daten leer sind, gib hilfreiche Meldung zurück
    if (filteredData.length === 0) {
        console.warn('⚠️ WARNUNG: Gefilterte Daten sind leer! Filter:', JSON.stringify(state.filters));

        // Finde heraus, welcher Filter das Problem verursacht
        let filterInfo = '';
        if (state.filters.agentur !== 'alle') {
            const agentExists = agenturen.find(a => a.id === state.filters.agentur);
            if (!agentExists) {
                filterInfo = `❌ Der Vermittler "${state.filters.agentur}" existiert nicht in den Daten!\n\nVerfügbare Vermittler:\n`;
                filterInfo += agenturen.slice(0, 10).map(a => `  - ${a.id}: ${a.name}`).join('\n');
                if (agenturen.length > 10) {
                    filterInfo += `\n  ... und ${agenturen.length - 10} weitere`;
                }
            } else {
                filterInfo = `⚠️ Der Vermittler "${state.filters.agentur}" existiert, aber es gibt keine Daten für die aktuelle Filterkombination.`;
            }
        } else {
            filterInfo = `⚠️ Keine Daten für die aktuelle Filterkombination gefunden.`;
        }

        return `
Datensatz: ${dailyRawData.length} Zeilen (Tagesdaten) verfügbar
Agenturen: ${agenturen.length} verfügbar

PROBLEM: ${filterInfo}

AKTUELLE FILTER:
- Jahr: ${state.filters.year}
- Agentur: ${state.filters.agentur === 'alle' ? 'Alle' : state.filters.agentur}
- Silo: ${state.filters.silo}
- Segment: ${state.filters.segments.join(', ')}

HINWEIS AN ASSISTENT:
Erkläre dem User freundlich, dass für diese Filterkombination keine Daten vorliegen.
Schlage vor, den Filter anzupassen oder zurückzusetzen.
`;
    }

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
    
    // Check if specific agent is filtered
    let specificAgentData = '';
    if (state.filters.agentur !== 'alle') {
        const agentData = getAgenturData(state.filters.agentur);
        if (agentData) {
            specificAgentData = `

GEFILTERTE AGENTUR-DATEN (${agentData.agentur} - ${agentData.agentur_name}):
- Neugeschäft YTD: €${(agentData.neugeschaeft / 1000000).toFixed(2)} Mio
- Bestand: €${(agentData.bestand / 1000000).toFixed(2)} Mio
- Stornoquote: ${agentData.storno.toFixed(2)}%
- NPS Score: ${agentData.nps.toFixed(1)}
- Risikoscore: ${agentData.risiko.toFixed(1)}
- Combined Ratio: ${agentData.combined.toFixed(1)}%
- Ergebnis: €${(agentData.ergebnis / 1000).toFixed(0)}k
- Underwriting Qualität: ${agentData.underwriting.toFixed(1)}%
- Deckungsbeitrag: €${(agentData.deckungsbeitrag / 1000).toFixed(0)}k
${agentData.bundesland ? `- Bundesland: ${agentData.bundesland}` : ''}
${agentData.silo ? `- Silo: ${agentData.silo}` : ''}
`;
        } else {
            console.warn('⚠️ getAgenturData() lieferte null für Agentur:', state.filters.agentur);
        }
    }
    
    return `
Datensatz: ${dailyRawData.length} Zeilen (Tagesdaten)
Agenturen: ${agenturen.length} verfügbar

WICHTIG - Vermittler-IDs (verwende diese für Filter!):
${agentList}
${agenturen.length > 10 ? `  ... und ${agenturen.length - 10} weitere` : ''}

Bundesländer: ${bundeslaender.join(', ')}
Silos: ${silos.join(', ')}
Segmente: ${segments.join(', ')}

AKTUELLE FILTER-EINSTELLUNGEN:
- Jahr: ${state.filters.year}
- Agentur: ${state.filters.agentur === 'alle' ? 'Alle' : state.filters.agentur}
- Silo: ${state.filters.silo}
- Segment: ${state.filters.segments.join(', ')}
- Bundesländer: ${state.selectedStates.size > 0 ? Array.from(state.selectedStates).join(', ') : 'Alle'}

AGGREGIERTE DATEN (basierend auf aktuellen Filtern):
- Gesamt Neugeschäft YTD: €${(totalNeugeschaeft / 1000000).toFixed(1)} Mio
- Durchschnitt Stornoquote: ${avgStorno.toFixed(2)}%
- Durchschnitt NPS: ${avgNPS.toFixed(1)}
- Gesamt Ergebnis: €${(totalErgebnis / 1000).toFixed(0)}k
- Aktueller Bestand: €${(currentBestand / 1000000).toFixed(1)} Mio
- Anzahl Monate mit Daten: ${filteredData.length}
${specificAgentData}
`;
}

// Process filter commands in response - VERBESSERT mit Auto-Analyse!
async function processFilterCommands(message) {
    console.log('🔍 Prüfe Filter-Befehle in Antwort...');
    
    let filterWasSet = false;
    let filterInfo = null;
    
    // Check for Agentur filter
    if (message.includes('setAgenturFilter')) {
        const match = message.match(/setAgenturFilter\(['"](.+?)['"]\)/);
        if (match) {
            let value = match[1];
            console.log('📊 Gefunden: setAgenturFilter mit Wert:', value);
            
            // Wenn es ein Name ist, konvertiere zu ID
            const agenturen = getAgenturen();
            const byName = agenturen.find(a => 
                a.name && a.name.toLowerCase() === value.toLowerCase()
            );
            
            if (byName) {
                console.log('✅ Name zu ID konvertiert:', value, '→', byName.id);
                value = byName.id;
            }
            
            setAgenturFilter(value);
            filterWasSet = true;
            
            const agentInfo = agenturen.find(a => a.id === value);
            const displayName = agentInfo ? 
                `${agentInfo.id} - ${agentInfo.name}` : 
                value;
            
            filterInfo = {
                type: 'agentur',
                value: value,
                displayName: displayName
            };
        }
    }
    
    // Check for Silo filter
    if (message.includes('setSiloFilter')) {
        const match = message.match(/setSiloFilter\(['"](.+?)['"]\)/);
        if (match) {
            console.log('📊 Gefunden: setSiloFilter mit Wert:', match[1]);
            setSiloFilter(match[1]);
            filterWasSet = true;
            
            filterInfo = {
                type: 'silo',
                value: match[1]
            };
        }
    }
    
    // Check for Segment filter
    if (message.includes('setSegmentFilter')) {
        const match = message.match(/setSegmentFilter\(\[?['"](.+?)['"]\]?\)/);
        if (match) {
            console.log('📊 Gefunden: setSegmentFilter mit Wert:', match[1]);
            const segments = match[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
            setSegmentFilter(segments);
            filterWasSet = true;
            
            filterInfo = {
                type: 'segment',
                value: segments.join(', ')
            };
        }
    }
    
    // Check for clear filters
    if (message.includes('clearAllFilters')) {
        console.log('📊 Gefunden: clearAllFilters');
        clearAllFilters();
        filterWasSet = true;
        
        filterInfo = {
            type: 'clear'
        };
    }
    
    // If a filter was set, automatically trigger analysis
    if (filterWasSet && filterInfo) {
        console.log('✅ Filter wurde gesetzt - starte automatische Analyse...');
        
        // Show confirmation
        setTimeout(() => {
            let confirmationMessage = '';
            
            if (filterInfo.type === 'agentur') {
                confirmationMessage = `✅ **Filter aktiv:** Dashboard zeigt jetzt nur Daten von ${filterInfo.displayName}`;
            } else if (filterInfo.type === 'silo') {
                confirmationMessage = `✅ **Filter aktiv:** Dashboard zeigt jetzt nur ${filterInfo.value}-Daten`;
            } else if (filterInfo.type === 'segment') {
                confirmationMessage = `✅ **Filter aktiv:** Dashboard zeigt jetzt nur ${filterInfo.value}-Segmente`;
            } else if (filterInfo.type === 'clear') {
                confirmationMessage = `✅ **Alle Filter zurückgesetzt:** Dashboard zeigt wieder alle Daten`;
            }
            
            addMessage('assistant', confirmationMessage);
            
            // Wait a bit then send analysis request
            setTimeout(async () => {
                showTyping();

                try {
                    // Get fresh filtered context
                    const filteredContext = getDataContext();

                    console.log('📊 DEBUG: Filtered Context wird an Claude gesendet:');
                    console.log('📊 Context Länge:', filteredContext.length);
                    console.log('📊 Context erste 500 Zeichen:', filteredContext.substring(0, 500));
                    console.log('📊 Aktuelle Filter:', JSON.stringify(state.filters));

                    // Send analysis request to Claude
                    const systemPrompt = `Du bist ein KI-Assistent für ein Versicherungs-Dashboard. Analysiere die gefilterten Daten und gib konkrete Insights.`;

                    const messages = [
                        {
                            role: 'user',
                            content: `GEFILTERTE DATEN:
${filteredContext}

Analysiere diese Daten und gib eine detaillierte Performance-Bewertung. Berechne konkrete Kennzahlen und gib Insights zu:
- Neugeschäft und Bestand
- Stornoquote und was sie bedeutet
- NPS Score und Kundenzufriedenheit
- Ergebnis und Profitabilität
- Vergleich mit Durchschnittswerten wenn möglich

Formatiere große Zahlen lesbar (z.B. "€45.2 Mio") und sei konkret mit den echten Zahlen aus den Daten.`
                        }
                    ];

                    const response = await fetch("https://api.anthropic.com/v1/messages", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-api-key": CLAUDE_API_KEY,
                            "anthropic-version": "2023-06-01",
                            "anthropic-dangerous-direct-browser-access": "true"
                        },
                        body: JSON.stringify({
                            model: CLAUDE_MODEL,
                            max_tokens: 2000,
                            system: systemPrompt,
                            messages: messages
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`Claude API request failed: ${response.status}`);
                    }

                    const data = await response.json();
                    const analysisMessage = data.content[0].text;
                    
                    hideTyping();
                    addMessage('assistant', analysisMessage);
                    
                } catch (error) {
                    console.error('❌ Analyse Fehler:', error);
                    hideTyping();
                    addMessage('assistant', '❌ Fehler bei der Datenanalyse. Bitte versuche es erneut.');
                }
            }, 500);
            
        }, 100);
    }
    
    return filterWasSet;
}

// Filter functions
function setAgenturFilter(vermittlerId) {
    state.filters.agentur = vermittlerId;
    updateAgenturFilterDisplay();
    updateAllKPIs();
    console.log('✅ Filter gesetzt: Agentur =', vermittlerId);
}

function setSiloFilter(silo) {
    state.filters.silo = silo;
    document.getElementById('siloFilter').value = silo;
    updateAllKPIs();
    console.log('✅ Filter gesetzt: Silo =', silo);
}

function setSegmentFilter(segments) {
    state.filters.segments = Array.isArray(segments) ? segments : [segments];
    updateSegmentDisplay();
    updateAllKPIs();
    console.log('✅ Filter gesetzt: Segment =', segments);
}

function setBundeslandFilter(bundeslaender) {
    state.selectedStates.clear();
    bundeslaender.forEach(land => state.selectedStates.add(land));
    updateMapSelection();
    updateAllKPIs();
    console.log('✅ Filter gesetzt: Bundesland =', bundeslaender);
}

function clearAllFilters() {
    state.filters.agentur = 'alle';
    state.filters.silo = 'alle';
    state.filters.segments = ['alle'];
    state.filters.products = ['alle'];
    state.selectedStates.clear();
    
    updateAgenturFilterDisplay();
    document.getElementById('siloFilter').value = 'alle';
    updateSegmentDisplay();
    updateMapSelection();
    updateAllKPIs();
    
    console.log('✅ Alle Filter zurückgesetzt');
}

// UI functions
function addMessage(role, content) {
    const chatBody = document.getElementById('chatBody');
    
    // Remove welcome message if exists
    const welcome = chatBody.querySelector('.chat-welcome');
    if (welcome) {
        welcome.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.innerHTML = role === 'user' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"/></svg>';
    
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    
    // Format content (basic markdown support)
    let formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    
    bubble.innerHTML = formattedContent;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);

    chatBody.appendChild(messageDiv);

    // Add sample questions after assistant response
    if (role === 'assistant') {
        const sampleQuestionsDiv = document.createElement('div');
        sampleQuestionsDiv.className = 'sample-questions-inline';
        sampleQuestionsDiv.innerHTML = `
            <button class="sample-btn-small" onclick="askSampleQuestion('Top 5 Vermittler nach Neugeschäft')">Top 5 Vermittler</button>
            <button class="sample-btn-small" onclick="askSampleQuestion('Zeige mir die Stornoquoten')">Stornoquoten</button>
            <button class="sample-btn-small" onclick="askSampleQuestion('Vergleiche die Bundesländer')">Bundesländer vergleichen</button>
        `;
        chatBody.appendChild(sampleQuestionsDiv);
        showAIResponse(content);
    }

    chatBody.scrollTop = chatBody.scrollHeight;
}

function showTyping() {
    const chatBody = document.getElementById('chatBody');

    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message assistant';
    typingDiv.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"/></svg>';
    
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typing);
    
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) {
        typing.remove();
    }
}

// ========================================
// ✨ v14 FEATURE: Sample Questions
// ========================================
function askSampleQuestion(question) {
    console.log('📝 Sample Question clicked:', question);

    // Verstecke Welcome Screen
    const welcomeDiv = document.querySelector('.chat-welcome');
    if (welcomeDiv) {
        welcomeDiv.style.display = 'none';
    }

    // Setze die Frage in den Input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = question;
    }

    // Sende die Nachricht
    if (typeof sendMessage === 'function') {
        sendMessage();
    }
}

// ========================================
// ✨ v14 FEATURE: AI Response Panel
// ========================================
function showAIResponse(message) {
    console.log('📊 Show AI Response in Panel');

    const panel = document.getElementById('aiResponsePanel');
    const content = document.getElementById('aiResponseContent');

    if (!panel || !content) {
        console.error('❌ AI Response Panel nicht gefunden');
        return;
    }

    // Formatiere die Nachricht (Markdown-ähnlich)
    const formattedMessage = formatAIMessage(message);

    // Setze den Inhalt
    content.innerHTML = formattedMessage;

    // Zeige das Panel
    panel.style.display = 'block';

    // Scroll to panel
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function formatAIMessage(message) {
    // Einfache Markdown-ähnliche Formatierung
    let formatted = message;

    // Überschriften
    formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Fett
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Bullet Points
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Nummerierte Listen
    formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Paragraphen (einfache Implementierung)
    const lines = formatted.split('\n');
    const paragraphs = [];
    let currentParagraph = '';

    for (const line of lines) {
        if (line.trim() === '') {
            if (currentParagraph.trim()) {
                // Kein <p> wenn es schon HTML-Tags gibt
                if (!currentParagraph.match(/^<[^>]+>/)) {
                    paragraphs.push('<p>' + currentParagraph + '</p>');
                } else {
                    paragraphs.push(currentParagraph);
                }
                currentParagraph = '';
            }
        } else {
            currentParagraph += line + '\n';
        }
    }

    if (currentParagraph.trim()) {
        if (!currentParagraph.match(/^<[^>]+>/)) {
            paragraphs.push('<p>' + currentParagraph + '</p>');
        } else {
            paragraphs.push(currentParagraph);
        }
    }

    return paragraphs.join('');
}

function hideAIResponse() {
    const panel = document.getElementById('aiResponsePanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

// Initialize AI Response Panel Close Button
function initAIResponsePanel() {
    const closeBtn = document.getElementById('aiResponseClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideAIResponse);
    }
}

// Call init on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAIResponsePanel);
} else {
    initAIResponsePanel();
}

// Make functions globally available
window.initChat = initChat;
window.setAgenturFilter = setAgenturFilter;
window.setSiloFilter = setSiloFilter;
window.setSegmentFilter = setSegmentFilter;
window.setBundeslandFilter = setBundeslandFilter;
window.clearAllFilters = clearAllFilters;
window.askSampleQuestion = askSampleQuestion;
window.showAIResponse = showAIResponse;
window.hideAIResponse = hideAIResponse;

console.log('✅ chat.js geladen - initChat() ist verfügbar');