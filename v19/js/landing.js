// js/landing.js - Landing Page Logic

// ========================================
// CLAUDE API CONFIGURATION
// ========================================

// Option 1: Cloudflare Worker URL (empfohlen - API Key sicher serverseitig)
const CLAUDE_WORKER_URL = ''; // z.B. 'https://claude-proxy.dein-account.workers.dev'

// Option 2: Direkter API-Zugriff (API Key im localStorage)
let CLAUDE_API_KEY = localStorage.getItem('claude_api_token') || '';
const CLAUDE_MODEL = 'claude-sonnet-4-5-20250514';

// Nutze Worker wenn URL gesetzt
const USE_WORKER = CLAUDE_WORKER_URL !== '';

// Get API token from localStorage
function getApiToken() {
    return localStorage.getItem('claude_api_token') || '';
}

// Save API token to localStorage
function saveApiToken(token) {
    if (token && token.trim()) {
        localStorage.setItem('claude_api_token', token.trim());
        CLAUDE_API_KEY = token.trim();
        return true;
    }
    return false;
}

// Check if using mock mode (no worker and no token = mock mode)
function isUsingMockMode() {
    if (USE_WORKER) return false;
    const token = getApiToken();
    return !token;
}

// Setup API Token Input for Claude
function setupApiTokenInput() {
    const tokenInput = document.getElementById('apiTokenInput');
    const toggleBtn = document.getElementById('apiTokenToggle');
    const saveBtn = document.getElementById('apiTokenSave');
    const statusDiv = document.getElementById('apiTokenStatus');

    if (!tokenInput || !toggleBtn || !saveBtn) return;

    // Load existing token
    const existingToken = getApiToken();
    if (existingToken) {
        tokenInput.value = existingToken;
        statusDiv.className = 'api-token-status success';
        statusDiv.textContent = 'API-Key gespeichert (Claude AI aktiv)';
    } else {
        statusDiv.className = 'api-token-status';
        statusDiv.textContent = 'Mock-Modus aktiv (vorgefertigte Antworten)';
    }

    // Toggle password visibility
    toggleBtn.addEventListener('click', () => {
        if (tokenInput.type === 'password') {
            tokenInput.type = 'text';
            toggleBtn.textContent = 'hide';
        } else {
            tokenInput.type = 'password';
            toggleBtn.textContent = 'show';
        }
    });

    // Save token
    saveBtn.addEventListener('click', () => {
        const token = tokenInput.value.trim();

        if (!token) {
            localStorage.removeItem('claude_api_token');
            CLAUDE_API_KEY = '';
            statusDiv.className = 'api-token-status';
            statusDiv.textContent = 'Mock-Modus aktiv (vorgefertigte Antworten)';
            return;
        }

        if (!token.startsWith('sk-ant-')) {
            statusDiv.className = 'api-token-status error';
            statusDiv.textContent = 'Ungültiger API-Key (muss mit "sk-ant-" beginnen)';
            return;
        }

        if (saveApiToken(token)) {
            statusDiv.className = 'api-token-status success';
            statusDiv.textContent = 'API-Key gespeichert! Claude AI ist jetzt aktiv.';
        } else {
            statusDiv.className = 'api-token-status error';
            statusDiv.textContent = 'Fehler beim Speichern';
        }
    });

    // Save on Enter
    tokenInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    });
}

// ========================================
// CSV UPLOAD
// ========================================

// Setup quick CSV upload on landing page
function setupQuickUpload() {
    const uploadInput = document.getElementById('quickCsvUpload');
    const uploadBox = uploadInput.parentElement;
    const statusDiv = document.getElementById('quickUploadStatus');
    
    uploadInput.addEventListener('change', function(e) {
        handleQuickUpload(e.target.files[0]);
    });
    
    // Drag & Drop
    uploadBox.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadBox.style.borderColor = '#667eea';
        uploadBox.style.background = '#f1f5f9';
    });
    
    uploadBox.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadBox.style.borderColor = '#cbd5e1';
        uploadBox.style.background = '#f8fafc';
    });
    
    uploadBox.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadBox.style.borderColor = '#cbd5e1';
        uploadBox.style.background = '#f8fafc';
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.endsWith('.csv')) {
            handleQuickUpload(files[0]);
        } else {
            statusDiv.className = 'upload-status error';
            statusDiv.textContent = '❌ Bitte nur CSV-Dateien hochladen';
        }
    });
}

// Handle quick upload - OHNE Auto-Navigation
function handleQuickUpload(file) {
    const statusDiv = document.getElementById('quickUploadStatus');
    
    if (!file) return;
    
    statusDiv.className = 'upload-status';
    statusDiv.textContent = '⏳ Lade Datei...';
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const csvText = event.target.result;
            const parsedData = parseCSV(csvText);
            
            const firstRow = parsedData[0] || {};
            const hasDay = 'day' in firstRow;
            const hasVermittler = 'vermittler_id' in firstRow;
            const hasLandkreis = 'landkreis' in firstRow || 'kreis' in firstRow;
            
            // Store data globally - WICHTIG: Beide Variablen setzen!
            if (hasDay && hasVermittler) {
                // Set both window.dailyRawData AND global dailyRawData
                window.dailyRawData = parsedData;
                dailyRawData = parsedData;  // ← FIX: Auch globale Variable setzen!

                const monthlyData = aggregateDailyToMonthly(parsedData);
                state.uploadedData = monthlyData;
                state.useUploadedData = true;

                const landkreisInfo = hasLandkreis ? ' mit Landkreisen' : '';
                statusDiv.className = 'upload-status success';
                statusDiv.textContent = `✅ ${file.name} geladen (${parsedData.length} Tagesdaten → ${monthlyData.length} Monate${landkreisInfo})`;

                console.log('📊 dailyRawData gesetzt:', dailyRawData.length, 'Zeilen');
            } else {
                state.uploadedData = parsedData;
                state.useUploadedData = true;
                window.dailyRawData = null;
                dailyRawData = null;  // ← FIX: Auch globale Variable setzen!

                statusDiv.className = 'upload-status success';
                statusDiv.textContent = `✅ ${file.name} geladen (${parsedData.length} Zeilen)`;
            }
            
            console.log('✅ Daten erfolgreich geladen:', parsedData.length, 'Zeilen');
            
            // KEIN Auto-Navigation mehr!
            
        } catch (error) {
            console.error('Fehler beim Parsen:', error);
            statusDiv.className = 'upload-status error';
            statusDiv.textContent = '❌ Fehler beim Laden der Datei: ' + error.message;
        }
    };
    
    reader.onerror = function() {
        statusDiv.className = 'upload-status error';
        statusDiv.textContent = '❌ Fehler beim Lesen der Datei';
    };
    
    reader.readAsText(file);
}

// Open main dashboard - MIT CHAT!
function openDashboard() {
    console.log('📊 Dashboard öffnen...');
    
    // Hide landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'none';
    }
    
    // Show main app
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.style.display = 'block';
    }
    
    // Initialize dashboard
    setTimeout(function() {
        if (typeof waitForLibraries === 'function') {
            waitForLibraries(function() {
                console.log('📚 Libraries geladen, initialisiere Dashboard...');
                
                if (typeof initKPIGrid === 'function') {
                    initKPIGrid();
                    console.log('✅ KPI Grid initialisiert');
                }
                
                if (typeof updateAllKPIs === 'function') {
                    updateAllKPIs();
                    console.log('✅ KPIs aktualisiert');
                }
                
                setTimeout(() => {
                    if (typeof initMap === 'function') {
                        initMap();
                        console.log('✅ Map initialisiert');
                    }
                }, 500);
                
                // WICHTIG: Chat RICHTIG aktivieren!
                setTimeout(() => {
                    console.log('🤖 Initialisiere Chat...');
                    
                    const chatWidget = document.getElementById('chatWidget');
                    const chatToggle = document.getElementById('chatToggle');
                    
                    if (!chatWidget || !chatToggle) {
                        console.error('❌ Chat Elemente nicht gefunden!');
                        return;
                    }
                    
                    // Chat Widget anzeigen
                    chatWidget.style.display = 'flex';
                    chatToggle.style.display = 'none';
                    
                    // Chat RICHTIG initialisieren (aus chat.js)
                    if (typeof initChat === 'function') {
                        console.log('🔧 Rufe initChat() auf...');
                        initChat();
                    } else {
                        console.error('❌ initChat() Funktion nicht gefunden!');
                        
                        // Fallback: Manuell Event Listeners setzen
                        console.log('🔄 Fallback: Setze Chat Event Listeners manuell...');
                        setupChatManually();
                    }
                }, 1000);
            });
        } else {
            console.error('❌ waitForLibraries nicht gefunden!');
        }
    }, 100);
}

// Fallback: Chat manuell setup falls initChat nicht funktioniert
function setupChatManually() {
    const chatClose = document.getElementById('chatClose');
    const chatMinimize = document.getElementById('chatMinimize');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    const chatToggle = document.getElementById('chatToggle');
    const chatWidget = document.getElementById('chatWidget');
    
    if (!chatSend || !chatInput) {
        console.error('❌ Chat Input/Send Buttons nicht gefunden!');
        return;
    }
    
    console.log('✅ Chat Elemente gefunden, setze Event Listeners...');
    
    // Close chat
    if (chatClose) {
        chatClose.addEventListener('click', () => {
            console.log('❌ Chat geschlossen');
            chatWidget.style.display = 'none';
            chatToggle.style.display = 'flex';
        });
    }
    
    // Minimize chat
    if (chatMinimize) {
        chatMinimize.addEventListener('click', () => {
            console.log('➖ Chat minimiert/maximiert');
            chatWidget.classList.toggle('minimized');
        });
    }
    
    // Send message
    chatSend.addEventListener('click', () => {
        console.log('📤 Send Button geklickt');
        if (typeof sendMessage === 'function') {
            sendMessage();
        } else {
            console.error('❌ sendMessage() nicht gefunden!');
        }
    });
    
    // Enter to send
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            console.log('⌨️ Enter gedrückt');
            if (typeof sendMessage === 'function') {
                sendMessage();
            } else {
                console.error('❌ sendMessage() nicht gefunden!');
            }
        }
    });
    
    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = chatInput.scrollHeight + 'px';
    });
    
    // Toggle chat
    if (chatToggle) {
        chatToggle.addEventListener('click', () => {
            console.log('💬 Chat Toggle geklickt');
            chatWidget.style.display = 'flex';
            chatToggle.style.display = 'none';
            chatInput.focus();
        });
    }
    
    console.log('✅ Chat manuell initialisiert!');
}

// Open upload dialog
function openUploadDialog() {
    console.log('📁 Öffne Upload-Dialog...');
    document.getElementById('quickCsvUpload').click();
}

// Open CSV generator
function openGenerator() {
    console.log('⚙️ Öffne Generator...');
    window.location.href = 'csv-generator.html';
}

// Back to landing page
function backToLanding() {
    console.log('🏠 Zurück zur Landing Page...');
    window.location.reload();
}


// // Landing Page Chat Funktionalität - NUTZT GLEICHE FUNKTIONEN WIE DASHBOARD CHAT
let landingChatHistory = [];
let isLandingChatProcessing = false;

// Initialize landing page chat
function initLandingChat() {
    const chatSend = document.getElementById('landingChatSend');
    const chatInput = document.getElementById('landingChatInput');
    
    if (!chatSend || !chatInput) return;
    
    // Send message on button click
    chatSend.addEventListener('click', () => sendLandingChatMessage());
    
    // Enter to send (Shift+Enter for new line)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendLandingChatMessage();
        }
    });
    
    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = chatInput.scrollHeight + 'px';
    });
    
    console.log('✅ Landing Chat initialisiert');
}

// Send message in landing chat - Uses Claude API
async function sendLandingChatMessage() {
    const chatInput = document.getElementById('landingChatInput');
    const message = chatInput.value.trim();

    console.log('Sending landing message:', message);

    if (!message || isLandingChatProcessing) {
        console.log('Empty message or already processing');
        return;
    }

    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Add user message
    addLandingChatMessage('user', message);

    // Show typing indicator
    showLandingChatTyping();

    isLandingChatProcessing = true;

    try {
        if (isUsingMockMode()) {
            // Mock response
            console.log('Mock mode - generating test response');
            await new Promise(resolve => setTimeout(resolve, 800));
            const mockResponse = generateLandingMockResponse(message);
            hideLandingChatTyping();
            addLandingChatMessage('assistant', mockResponse);
        } else {
            // Real Claude API call
            console.log('Calling Claude API...');
            await sendLandingMessageToClaude(message);
        }

    } catch (error) {
        console.error('Landing Chat Error:', error);
        hideLandingChatTyping();
        addLandingChatMessage('assistant', 'Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.');
    }

    isLandingChatProcessing = false;
}

// Send to Claude API
async function sendLandingMessageToClaude(message) {
    console.log('Using Claude API Key:', CLAUDE_API_KEY.substring(0, 20) + '...');

    // Prepare context about current data
    const dataContext = getLandingDataContext();

    // System prompt for Claude
    const systemPrompt = `Du bist ein KI-Assistent für ein Versicherungs-Dashboard. Du hast Zugriff auf CSV-Daten und kannst Dashboard-Filter steuern.

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
- Antworte auf Deutsch und sei freundlich
- Wenn keine Daten vorhanden sind, erkläre dass der User zuerst eine CSV hochladen oder zum Dashboard gehen sollte`;

    // Build messages array for Claude
    const messages = [
        {
            role: 'user',
            content: `AKTUELLE DATEN:
${dataContext}

USER FRAGE: ${message}`
        }
    ];

    // Call Claude API (via Worker oder direkt)
    const apiUrl = USE_WORKER ? CLAUDE_WORKER_URL : "https://api.anthropic.com/v1/messages";
    const headers = USE_WORKER
        ? { "Content-Type": "application/json" }
        : {
            "Content-Type": "application/json",
            "x-api-key": CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
        };

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 2000,
            system: systemPrompt,
            messages: messages
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API Error:', response.status, errorText);
        throw new Error(`Claude API request failed: ${response.status}`);
    }

    const data = await response.json();
    // Claude returns content as an array of content blocks
    const assistantMessage = data.content[0].text;

    console.log('Claude response received:', assistantMessage.substring(0, 100) + '...');

    hideLandingChatTyping();
    addLandingChatMessage('assistant', assistantMessage);

    landingChatHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage }
    );

    // Parse and execute filter commands
    await parseAndExecuteCommands(assistantMessage);
}

// Get context about current data - GLEICHE FUNKTION WIE DASHBOARD
function getLandingDataContext() {
    // Check both window.dailyRawData and global dailyRawData
    const rawData = window.dailyRawData || (typeof dailyRawData !== 'undefined' ? dailyRawData : null);

    // Prüfe ob Daten geladen sind
    if (!rawData || rawData.length === 0) {
        return `Keine Daten geladen.

Der Nutzer ist auf der Landing Page und hat noch keine CSV-Datei hochgeladen.

HINWEIS FÜR ASSISTENT:
- Erkläre, dass zuerst Daten hochgeladen werden müssen
- Biete an, beim Upload zu helfen
- Oder schlage vor, zum Dashboard zu gehen und dort Test-Daten zu generieren`;
    }
    
    // GLEICHE LOGIK WIE IM DASHBOARD CHAT (getDataContext aus chat.js)
    const agenturen = typeof getAgenturen === 'function' ? getAgenturen() : [];
    const bundeslaender = [...new Set(rawData.map(r => r.bundesland))].filter(Boolean);
    const silos = [...new Set(rawData.map(r => r.silo))].filter(Boolean);
    const segments = [...new Set(rawData.map(r => r.segment))].filter(Boolean);
    
    // Calculate basic stats
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
- Durchschnitt Stornoquote: ${avgStorno.toFixed(2)}%
- Durchschnitt NPS: ${avgNPS.toFixed(1)}
- Gesamt Ergebnis: €${(totalErgebnis / 1000).toFixed(0)}k
- Aktueller Bestand: €${(currentBestand / 1000000).toFixed(1)} Mio
- Anzahl Monate mit Daten: ${filteredData.length}
`;
}

// Generate mock response - VERBESSERT
function generateLandingMockResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Prüfe ob Daten vorhanden sind
    if (!dailyRawData || dailyRawData.length === 0) {
        if (lowerMessage.includes('daten') || lowerMessage.includes('analyse') || lowerMessage.includes('zahlen')) {
            return '📊 **Keine Daten vorhanden**\n\nBitte lade zuerst eine CSV-Datei hoch (unten in der Box) oder gehe zum Dashboard und generiere Test-Daten.\n\nDann kann ich dir bei der Analyse helfen! 🚀';
        }
    }
    
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
    
    // Top performers
    if (lowerMessage.includes('top') || lowerMessage.includes('beste')) {
        if (dailyRawData && dailyRawData.length > 0) {
            const agenturen = typeof getAgenturen === 'function' ? getAgenturen().slice(0, 5) : [];
            if (agenturen.length > 0) {
                return `📊 **Top 5 Vermittler:**\n\n${agenturen.map((a, i) => 
                    `${i+1}. **${a.name || a.id}**`
                ).join('\n')}\n\n💡 *Mit einem API-Key würde ich die tatsächlichen Zahlen analysieren.*`;
            }
        }
        return '📊 Bitte lade zuerst Daten hoch, dann kann ich dir die Top-Performer zeigen!';
    }
    
    // General info
    if (lowerMessage.includes('wie viele') || lowerMessage.includes('anzahl')) {
        const count = dailyRawData ? dailyRawData.length : 0;
        const agentCount = typeof getAgenturen === 'function' ? getAgenturen().length : 0;
        
        if (count > 0) {
            return `📊 **Datensatz-Übersicht:**\n\n• ${count.toLocaleString()} Zeilen Tagesdaten\n• ${agentCount} Vermittler\n\n💡 *Mit einem API-Key könnte ich detaillierte Analysen durchführen.*`;
        }
        return '📊 Noch keine Daten geladen. Lade eine CSV hoch oder gehe zum Dashboard!';
    }
    
    // Default
    if (lowerMessage.includes('hallo') || lowerMessage.includes('hi')) {
        return 'Hallo! 👋 Ich kann dir beim Einstieg ins Dashboard helfen. Möchtest du eine CSV hochladen oder direkt zum Dashboard?';
    }
    
    return `Ich habe deine Frage verstanden: "${message}"\n\n⚠️ **Mock-Modus aktiv** - Um echte KI-Analyse zu aktivieren:\n\n1. Besorge einen API-Key von OpenAI\n2. Öffne \`js/landing.js\`\n3. Ersetze den API-Key\n4. Setze \`USE_MOCK_MODE = false\`\n\n**Verfügbare Mock-Befehle:**\n• "Wie viele Daten haben wir?"\n• "Zeige Top 5 Vermittler"\n• "Wie ist die Performance von Freiburg?"`;
}

// Add message to chat
function addLandingChatMessage(role, content) {
    const chatMessages = document.getElementById('landingChatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `landing-chat-message ${role}`;

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

    chatMessages.appendChild(messageDiv);

    // Add sample questions after assistant response
    if (role === 'assistant') {
        const sampleQuestionsDiv = document.createElement('div');
        sampleQuestionsDiv.className = 'sample-questions-inline';
        sampleQuestionsDiv.innerHTML = `
            <button class="sample-btn-small" onclick="askLandingSampleQuestion('Was kann dieses Tool?')">Tool-Funktionen</button>
            <button class="sample-btn-small" onclick="askLandingSampleQuestion('Welche Module gibt es?')">Alle Module</button>
            <button class="sample-btn-small" onclick="askLandingSampleQuestion('Was zeigt die Banken-Ansicht?')">Banken-Ansicht</button>
            <button class="sample-btn-small" onclick="askLandingSampleQuestion('Wie funktioniert die KI-Analyse?')">KI-Analyse</button>
        `;
        chatMessages.appendChild(sampleQuestionsDiv);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showLandingChatTyping() {
    const chatMessages = document.getElementById('landingChatMessages');

    const typingDiv = document.createElement('div');
    typingDiv.className = 'landing-chat-message assistant';
    typingDiv.id = 'landingTypingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"/></svg>';
    
    const typing = document.createElement('div');
    typing.className = 'landing-chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typing);
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideLandingChatTyping() {
    const typing = document.getElementById('landingTypingIndicator');
    if (typing) {
        typing.remove();
    }
}

// Make functions globally available
window.openDashboard = openDashboard;
window.openUploadDialog = openUploadDialog;
window.openGenerator = openGenerator;
window.backToLanding = backToLanding;

// WICHTIG: Entfernen Sie den ersten DOMContentLoaded von ganz oben!
// Hier ist der einzige DOMContentLoaded Listener:
window.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Landing Page wird geladen...');
    
    // Show loading animation for 1.5 seconds, then show welcome chat
    setTimeout(function() {
        const loadingAnim = document.getElementById('loadingAnimation');
        const welcomeChat = document.getElementById('welcomeChat');
        
        if (loadingAnim) loadingAnim.style.display = 'none';
        if (welcomeChat) welcomeChat.style.display = 'block';
        
        console.log('✅ Welcome Chat angezeigt');
        
        // WICHTIG: Initialize landing chat
        initLandingChat();
    }, 1500);
    
    // Setup quick upload
    setupQuickUpload();

    // Setup API token input
    setupApiTokenInput();
});

// ========================================
// ✨ v14 FEATURE: KI Filter Commands + Auto-Navigation
// ========================================

// Parse KI-Antwort und führe Filter-Befehle aus
async function parseAndExecuteCommands(message) {
    console.log('🔍 Parse KI-Antwort nach Befehlen...');

    let hasExecutedCommands = false;

    // Regex patterns für Befehle
    const patterns = {
        setAgenturFilter: /setAgenturFilter\(['"]([^'"]+)['"]\)/gi,
        setSiloFilter: /setSiloFilter\(['"]([^'"]+)['"]\)/gi,
        setSegmentFilter: /setSegmentFilter\(\[([^\]]+)\]\)/gi,
        setBundeslandFilter: /setBundeslandFilter\(\[([^\]]+)\]\)/gi,
        clearAllFilters: /clearAllFilters\(\)/gi
    };

    // Agentur Filter
    let match;
    while ((match = patterns.setAgenturFilter.exec(message)) !== null) {
        const agenturId = match[1];
        console.log('📌 Setze Agentur-Filter:', agenturId);
        setAgenturFilter(agenturId);
        hasExecutedCommands = true;
    }

    // Silo Filter
    patterns.setSiloFilter.lastIndex = 0;
    while ((match = patterns.setSiloFilter.exec(message)) !== null) {
        const silo = match[1];
        console.log('📌 Setze Silo-Filter:', silo);
        setSiloFilter(silo);
        hasExecutedCommands = true;
    }

    // Segment Filter
    patterns.setSegmentFilter.lastIndex = 0;
    while ((match = patterns.setSegmentFilter.exec(message)) !== null) {
        const segmentsStr = match[1];
        const segments = segmentsStr.split(',').map(s => s.trim().replace(/['"]/g, ''));
        console.log('📌 Setze Segment-Filter:', segments);
        setSegmentFilter(segments);
        hasExecutedCommands = true;
    }

    // Bundesland Filter
    patterns.setBundeslandFilter.lastIndex = 0;
    while ((match = patterns.setBundeslandFilter.exec(message)) !== null) {
        const laenderStr = match[1];
        const laender = laenderStr.split(',').map(s => s.trim().replace(/['"]/g, ''));
        console.log('📌 Setze Bundesland-Filter:', laender);
        setBundeslandFilter(laender);
        hasExecutedCommands = true;
    }

    // Clear Filters
    if (patterns.clearAllFilters.test(message)) {
        console.log('🗑️ Lösche alle Filter');
        clearAllFilters();
        hasExecutedCommands = true;
    }

    // Wenn Befehle ausgeführt wurden, navigiere zum Dashboard
    if (hasExecutedCommands) {
        console.log('✨ Filter wurden gesetzt - navigiere zum Dashboard...');

        // Zeige Bestätigung
        addLandingChatMessage('system', '✅ Filter wurden angewendet. Öffne Dashboard...');

        // Warte kurz, dann navigiere
        setTimeout(() => {
            openDashboard();
        }, 1500);
    }
}

// Filter-Funktionen
function setAgenturFilter(vermittlerId) {
    console.log('🎯 setAgenturFilter:', vermittlerId);

    // Speichere Filter im state (wird beim Dashboard-Load verwendet)
    if (typeof state !== 'undefined') {
        state.filters.agentur = vermittlerId;
        console.log('✅ Filter gespeichert:', state.filters);
    } else {
        // Falls state noch nicht existiert, speichere im localStorage
        localStorage.setItem('pendingAgenturFilter', vermittlerId);
        console.log('✅ Filter im localStorage gespeichert');
    }
}

function setSiloFilter(silo) {
    console.log('🎯 setSiloFilter:', silo);

    if (typeof state !== 'undefined') {
        state.filters.silo = silo;
    } else {
        localStorage.setItem('pendingSiloFilter', silo);
    }
}

function setSegmentFilter(segments) {
    console.log('🎯 setSegmentFilter:', segments);

    if (typeof state !== 'undefined') {
        state.filters.segments = segments;
    } else {
        localStorage.setItem('pendingSegmentFilter', JSON.stringify(segments));
    }
}

function setBundeslandFilter(laender) {
    console.log('🎯 setBundeslandFilter:', laender);

    if (typeof state !== 'undefined') {
        state.filters.bundeslaender = laender;
    } else {
        localStorage.setItem('pendingBundeslandFilter', JSON.stringify(laender));
    }
}

function clearAllFilters() {
    console.log('🗑️ clearAllFilters');

    if (typeof state !== 'undefined') {
        state.filters = {
            year: 2024,
            agentur: 'alle',
            silo: 'alle',
            segments: [],
            bundeslaender: []
        };
    } else {
        localStorage.removeItem('pendingAgenturFilter');
        localStorage.removeItem('pendingSiloFilter');
        localStorage.removeItem('pendingSegmentFilter');
        localStorage.removeItem('pendingBundeslandFilter');
    }
}

// Predefined answers for standard questions (instant response without AI)
const standardAnswers = {
    'Was kann dieses Tool?': `**Vertriebssteuerungs-Cockpit – Komplettübersicht**

Das Tool umfasst mehrere Module:

**KPI-Dashboard (9 Kennzahlen)**
• Neugeschäft, Bestand, Stornoquote, NPS
• Risikoscore, Combined Ratio, Ergebnis
• Underwriting-Qualität, Deckungsbeitrag

**Agenturansicht**
• Individuelle Agentur-Performance
• Vertriebspotentiale je Vermittler
• Vergleich mit Benchmark

**Bestandsübertragung**
• Simulation von Bestandsübertragungen
• Auswirkungsanalyse auf KPIs

**Provisionssimulation**
• Provisionsmodelle berechnen
• Auswirkungen auf Ergebnis simulieren

**Bankkredite-Modul**
• Nicht gezahlte Bankkredite überwachen
• Risikoanalyse für Kreditportfolio

**Geografische Analyse**
• Deutschland-Karte mit Landkreisen
• Regionale Performance-Vergleiche`,

    'Welche Module gibt es?': `**Alle Module im Überblick**

**1. Gesamtübersicht (Dashboard)**
• 9 KPI-Kacheln mit Trend-Charts
• Filterbar nach Silo, Segment, Region

**2. Agenturansicht**
• Einzelne Vermittler analysieren
• Vertriebspotentiale identifizieren
• Ranking und Vergleiche

**3. Bestandsübertragung**
• Bestände zwischen Agenturen übertragen
• Simulationen und Auswirkungen

**4. Provisionssimulation**
• Provisionsmodelle durchrechnen
• Was-wäre-wenn-Szenarien

**5. Bankkredite**
• Überwachung nicht gezahlter Kredite
• Risikobewertung

**6. Tabellenansicht**
• Detaildaten nach Bundesland
• Landkreis-Ebene
• Agentur-Übersicht`,

    'Was zeigt die Banken-Ansicht?': `**Banken-Silo – Spezifische Analyse**

Wenn du nach "Banken" filterst, siehst du:

**Performance-Metriken**
• Neugeschäft und Bestand speziell für Bankvertrieb
• Stornoquoten im Vergleich zu anderen Silos
• NPS der Bankkunden

**Bankkredite-Modul**
• Nicht gezahlte Bankkredite überwachen
• Risikoanalyse für Kreditportfolio
• Frühwarnindikatoren

**Typische Erkenntnisse**
• Banken haben oft höheres Volumen pro Vermittler
• Anderer Produktmix (mehr Leben/Altersvorsorge)
• Unterschiedliche Stornomuster

Nutze den Silo-Filter im Dashboard um die Banken-Daten zu analysieren.`,

    'Wie funktioniert die KI-Analyse?': `**KI-Assistent – So nutzt du ihn**

Der KI-Assistent (Claude AI) kann:

**Daten analysieren**
• "Zeige mir die Top 5 Vermittler"
• "Welches Bundesland performt am besten?"
• "Vergleiche Makler vs. Ausschließlichkeit"

**Filter setzen**
• "Filtere nach Agentur XY"
• "Zeige nur Leben-Segment"
• "Nur Baden-Württemberg"

**Module erkunden**
• Fragen zur Agenturansicht
• Provisionssimulation verstehen
• Bestandsübertragung erklären

Stelle mir einfach deine Frage – ich helfe dir!`
};

// ✨ v16 FEATURE: Landing Page Sample Questions with instant answers
function askLandingSampleQuestion(question) {
    console.log('📝 Landing Sample Question clicked:', question);

    // Verstecke Sample Questions nach erstem Click
    const sampleQuestions = document.getElementById('landingSampleQuestions');
    if (sampleQuestions) {
        sampleQuestions.style.display = 'none';
    }

    // Check if this is a standard question
    if (standardAnswers[question]) {
        console.log('✨ Using predefined answer (no AI)');

        // Add user message
        addLandingChatMessage('user', question);

        // Add instant answer
        setTimeout(() => {
            addLandingChatMessage('assistant', standardAnswers[question]);
        }, 300);

        return;
    }

    // For non-standard questions, use AI
    const chatInput = document.getElementById('landingChatInput');
    if (chatInput) {
        chatInput.value = question;
    }

    if (typeof sendLandingChatMessage === 'function') {
        sendLandingChatMessage();
    }
}

// Make function globally available
window.askLandingSampleQuestion = askLandingSampleQuestion;

console.log('✅ landing.js geladen');