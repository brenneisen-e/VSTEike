// js/landing.js - Landing Page Logic

// ========================================
// CLAUDE API CONFIGURATION
// ========================================

// Claude API via Cloudflare Worker (nutze window, um Konflikte mit chat.js zu vermeiden)
window.CLAUDE_WORKER_URL = window.CLAUDE_WORKER_URL || 'https://vst-claude-api.eike-3e2.workers.dev';
window.CLAUDE_MODEL = window.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';

// Fallback: API-Key aus localStorage
function getApiToken() {
    return localStorage.getItem('claude_api_token') || '';
}

// Save API token to localStorage
function saveApiToken(token) {
    if (token && token.trim()) {
        localStorage.setItem('claude_api_token', token.trim());
        return true;
    }
    return false;
}

// Clear API token from localStorage
function clearApiToken() {
    localStorage.removeItem('claude_api_token');
}

// Prüfe ob Worker oder API-Key vorhanden
window.USE_WORKER = window.CLAUDE_WORKER_URL !== '';

// Mock-Modus nur wenn weder Worker noch API-Key
function isUsingMockMode() {
    return !window.USE_WORKER && !getApiToken();
}

// Setup API Token Input
function setupApiTokenInput() {
    const tokenInput = document.getElementById('apiTokenInput');
    const toggleBtn = document.getElementById('apiTokenToggle');
    const saveBtn = document.getElementById('apiTokenSave');
    const statusDiv = document.getElementById('apiTokenStatus');

    if (!tokenInput || !toggleBtn || !saveBtn) return;

    // Worker-Modus Status anzeigen
    if (window.USE_WORKER) {
        statusDiv.className = 'api-token-status success';
        statusDiv.textContent = '✅ Claude AI aktiv (via Worker)';
    } else {
        const existingToken = getApiToken();
        if (existingToken) {
            tokenInput.value = existingToken;
            statusDiv.className = 'api-token-status success';
            statusDiv.textContent = '✅ API-Key gespeichert (KI-Modus aktiv)';
        } else {
            statusDiv.className = 'api-token-status';
            statusDiv.textContent = 'ℹ️ Mock-Modus aktiv (vorgefertigte Antworten)';
        }
    }

    // Toggle password visibility
    toggleBtn.addEventListener('click', () => {
        if (tokenInput.type === 'password') {
            tokenInput.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            tokenInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    });

    // Save token
    saveBtn.addEventListener('click', () => {
        const token = tokenInput.value.trim();

        if (!token) {
            // Clear token
            clearApiToken();
            statusDiv.className = 'api-token-status';
            statusDiv.textContent = 'ℹ️ Mock-Modus aktiv (vorgefertigte Antworten)';
            return;
        }

        if (!token.startsWith('sk-')) {
            statusDiv.className = 'api-token-status error';
            statusDiv.textContent = '❌ Ungültiger API-Key (muss mit "sk-" beginnen)';
            return;
        }

        if (saveApiToken(token)) {
            statusDiv.className = 'api-token-status success';
            statusDiv.textContent = '✅ API-Key gespeichert! KI-Modus ist jetzt aktiv.';

            // Update mock mode status
            window.USE_MOCK_MODE = false;
        } else {
            statusDiv.className = 'api-token-status error';
            statusDiv.textContent = '❌ Fehler beim Speichern';
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

// Handle quick upload - IDENTISCH ZUM COCKPIT
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
            const hasMonth = 'month' in firstRow;
            const hasYear = 'year' in firstRow;
            const hasVermittler = 'vermittler_id' in firstRow;
            const hasLandkreis = 'landkreis' in firstRow || 'kreis' in firstRow;

            // EXAKT GLEICHE LOGIK WIE IM COCKPIT (main.js:421-448)
            if (hasDay && hasVermittler) {
                // Tagesdaten
                window.dailyRawData = parsedData;
                dailyRawData = parsedData;
                console.log('Stored', dailyRawData.length, 'daily records');

                const monthlyData = aggregateDailyToMonthly(parsedData);
                state.uploadedData = monthlyData;

                const landkreisInfo = hasLandkreis ? ' mit Landkreisen' : '';
                statusDiv.className = 'upload-status success';
                statusDiv.textContent = `✅ ${file.name} geladen (${parsedData.length} Tagesdaten → ${monthlyData.length} Monate${landkreisInfo})`;
            } else if (hasMonth && !hasDay) {
                // Monatsdaten
                state.uploadedData = parsedData;
                window.dailyRawData = null;
                dailyRawData = null;

                statusDiv.className = 'upload-status success';
                statusDiv.textContent = `✅ ${file.name} geladen (${parsedData.length} Monatsdaten)`;
            } else {
                // Unbekanntes Format
                state.uploadedData = parsedData;
                window.dailyRawData = null;
                dailyRawData = null;

                statusDiv.className = 'upload-status success';
                statusDiv.textContent = `⚠️ ${file.name} geladen (${parsedData.length} Zeilen)`;
            }

            state.useUploadedData = true;

            // Update year filter if years are present
            if (hasYear && parsedData.length > 0) {
                const years = [...new Set(parsedData.map(row => row.year))].sort();
                console.log('📅 Gefundene Jahre:', years);

                // Store years for Dashboard initialization
                state.availableYears = years;

                // Set current year to first available year if not already set
                if (!years.includes(parseInt(state.filters.year))) {
                    state.filters.year = String(years[0]);
                    console.log('📅 Jahr-Filter gesetzt auf:', years[0]);
                }
            }

            console.log('✅ Daten erfolgreich geladen:', parsedData.length, 'Zeilen');

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

                // Update year filter if years were loaded from CSV
                if (state.availableYears && state.availableYears.length > 0) {
                    const yearFilter = document.getElementById('yearFilter');
                    if (yearFilter) {
                        state.availableYears.forEach(year => {
                            if (!Array.from(yearFilter.options).some(opt => opt.value == year)) {
                                const option = document.createElement('option');
                                option.value = year;
                                option.textContent = year;
                                yearFilter.appendChild(option);
                            }
                        });
                        yearFilter.value = state.filters.year;
                        console.log('📅 Jahr-Filter aktualisiert:', state.availableYears);
                    }
                }

                // Update Agentur dropdown with uploaded data
                if (typeof updateAgenturFilterDropdown === 'function') {
                    updateAgenturFilterDropdown();
                    console.log('✅ Agentur-Filter Dropdown aktualisiert');
                }

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

// Back to landing page (ohne Reload)
function backToLanding() {
    console.log('🏠 Zurück zur Landing Page...');

    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    const agenturOverview = document.getElementById('agenturOverview');
    const potentialAnalysePage = document.getElementById('potentialAnalysePage');
    const kundenDetailPage = document.getElementById('kundenDetailPage');
    const billingCheckPage = document.getElementById('billingCheckPage');

    // Alle Seiten verstecken
    if (mainApp) mainApp.style.display = 'none';
    if (agenturOverview) agenturOverview.style.display = 'none';
    if (potentialAnalysePage) potentialAnalysePage.style.display = 'none';
    if (kundenDetailPage) kundenDetailPage.style.display = 'none';
    if (billingCheckPage) billingCheckPage.style.display = 'none';

    // Landing Page anzeigen
    if (landingPage) landingPage.style.display = 'flex';
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

// Send message in landing chat - NUTZT GLEICHE LOGIK WIE DASHBOARD
async function sendLandingChatMessage() {
    const chatInput = document.getElementById('landingChatInput');
    const message = chatInput.value.trim();
    
    console.log('📤 Landing Nachricht senden:', message);
    
    if (!message || isLandingChatProcessing) {
        console.log('⚠️ Leere Nachricht oder bereits in Verarbeitung');
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
            console.log('🎭 Mock-Modus - Generiere Test-Antwort');
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockResponse = generateLandingMockResponse(message);
            hideLandingChatTyping();
            addLandingChatMessage('assistant', mockResponse);
        } else {
            // Real API call via Claude
            console.log('🚀 Rufe Claude API auf...');
            await sendLandingMessageToClaude(message);
        }
        
    } catch (error) {
        console.error('❌ Landing Chat Fehler:', error);
        hideLandingChatTyping();
        addLandingChatMessage('assistant', '❌ Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.');
    }
    
    isLandingChatProcessing = false;
}

// Send to Claude API via Worker
async function sendLandingMessageToClaude(message) {
    console.log('🤖 Sende Anfrage an Claude API...');

    // Prepare context about current data
    const dataContext = getLandingDataContext();

    // System prompt for Claude
    const systemPrompt = `Du bist ein KI-Assistent für ein Versicherungs-Dashboard. Du hast Zugriff auf CSV-Daten und kannst Dashboard-Filter steuern.

VERFÜGBARE FUNKTIONEN:
1. setAgenturFilter(vermittler_id) - Filtert Dashboard nach Agentur
   - Verwende IMMER die Vermittler-ID (z.B. 'VM00001'), NIEMALS den Namen!
   - Beispiel: setAgenturFilter('VM00001') für Max Mustermann

2. setSiloFilter(silo) - Filtert nach Silo
   - Gültige Werte: 'Ausschließlichkeit', 'Makler', 'Direktvertrieb', 'Banken'

3. setSegmentFilter(segments) - Filtert nach Segmenten
   - Gültige Werte: 'Leben', 'Kranken', 'Schaden', 'Kfz'

4. setBundeslandFilter(bundeslaender) - Filtert nach Bundesländern

5. clearAllFilters() - Setzt alle Filter zurück

6. showAgenturOverview(vermittler_id) - Zeigt detaillierte Agentur-Übersichtsseite
   - Beispiel: showAgenturOverview('VM00001') für Max Mustermann
   - Zeigt: Stammdaten, Foto, KPI-Dashboard mit Balken, Vertragshistorie
   - Nutze diese Funktion bei Fragen wie "Übersicht Agentur Max Mustermann"
   - WICHTIG: Verwende IMMER die Vermittler-ID, nicht den Namen!

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

    // API URL (Worker or direct)
    const apiUrl = window.USE_WORKER ? window.CLAUDE_WORKER_URL : "https://api.anthropic.com/v1/messages";

    // Headers
    const headers = { "Content-Type": "application/json" };
    if (!window.USE_WORKER) {
        headers["x-api-key"] = getApiToken();
        headers["anthropic-version"] = "2023-06-01";
        headers["anthropic-dangerous-direct-browser-access"] = "true";
    }

    // Call Claude API
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            model: window.CLAUDE_MODEL,
            max_tokens: 2000,
            system: systemPrompt,
            messages: messages
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Claude API Fehler:', response.status, errorText);
        throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.content[0].text;
    
    console.log('✅ API Antwort erhalten:', assistantMessage.substring(0, 100) + '...');
    
    hideLandingChatTyping();
    addLandingChatMessage('assistant', assistantMessage);

    landingChatHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage }
    );

    // ✨ NEU: Parse und führe Filter-Befehle aus
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
    
    return `Ich habe deine Frage verstanden: "${message}"\n\n⚠️ **Mock-Modus aktiv** - Claude AI wird über den Worker konfiguriert.\n\n**Verfügbare Mock-Befehle:**\n• "Wie viele Daten haben wir?"\n• "Zeige Top 5 Vermittler"\n• "Wie ist die Performance von Freiburg?"`;
}

// Add message to chat - GLEICH WIE DASHBOARD
function addLandingChatMessage(role, content) {
    const chatMessages = document.getElementById('landingChatMessages');

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

    // Format content (basic markdown support)
    let formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');

    bubble.innerHTML = formattedContent;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showLandingChatTyping() {
    const chatMessages = document.getElementById('landingChatMessages');

    const typingDiv = document.createElement('div');
    typingDiv.className = 'landing-chat-message assistant';
    typingDiv.id = 'landingTypingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar-deloitte';
    avatar.innerHTML = '<span class="deloitte-d">D</span>';

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

// Toggle Settings Box
function toggleSettings() {
    const settingsBox = document.querySelector('.settings-collapsible');
    if (settingsBox) {
        settingsBox.classList.toggle('open');
    }
}

// Benutzername speichern und aktualisieren
function saveUserName() {
    const input = document.getElementById('userNameInput');
    const welcomeSpan = document.getElementById('welcomeUserName');

    if (input && input.value.trim()) {
        const newName = input.value.trim();

        // Im localStorage speichern
        localStorage.setItem('userName', newName);

        // Willkommensnachricht aktualisieren
        if (welcomeSpan) {
            welcomeSpan.textContent = newName;
        }

        // Kurze Bestätigung anzeigen
        const saveBtn = document.getElementById('userNameSave');
        if (saveBtn) {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '✓ Gespeichert';
            saveBtn.style.background = '#86BC25';
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = '';
            }, 1500);
        }
    }
}

// Benutzername beim Laden wiederherstellen
function loadUserName() {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
        const input = document.getElementById('userNameInput');
        const welcomeSpan = document.getElementById('welcomeUserName');

        if (input) input.value = savedName;
        if (welcomeSpan) welcomeSpan.textContent = savedName;
    }
}

// Open Agentur View (zeigt Agentur-Auswahl oder direkt die Übersicht)
function openAgenturView() {
    console.log('👤 Agenturansicht öffnen...');

    // Prüfe ob Daten vorhanden sind
    const rawData = window.dailyRawData || (typeof dailyRawData !== 'undefined' ? dailyRawData : null);

    if (!rawData || rawData.length === 0) {
        // Keine Daten - zeige Hinweis
        addLandingChatMessage('assistant', '⚠️ **Bitte lade zuerst Daten hoch.**\n\nUm die Agenturansicht zu nutzen, benötigst du CSV-Daten mit Vermittler-Informationen.\n\nKlicke auf "Settings" und dann auf "CSV Upload" oder "Test-Daten generieren".');
        return;
    }

    // Daten vorhanden - zeige erste Agentur oder lass User wählen
    const agenturen = typeof getAgenturen === 'function' ? getAgenturen() : [];

    if (agenturen.length > 0) {
        // Zeige erste Agentur
        const firstAgentur = agenturen[0];
        if (typeof showAgenturOverview === 'function') {
            showAgenturOverview(firstAgentur.id);
        } else {
            // Fallback: Öffne Dashboard mit Agentur-Filter
            setAgenturFilter(firstAgentur.id);
            openDashboard();
        }
    } else {
        addLandingChatMessage('assistant', '⚠️ Keine Agenturen in den Daten gefunden. Bitte überprüfe deine CSV-Datei.');
    }
}

// Make functions globally available
window.openDashboard = openDashboard;
window.openUploadDialog = openUploadDialog;
window.openGenerator = openGenerator;
window.backToLanding = backToLanding;
window.toggleSettings = toggleSettings;
window.openAgenturView = openAgenturView;
window.openRisikoscoring = openRisikoscoring;
window.closeRisikoscoring = closeRisikoscoring;
window.openBestandsuebertragung = openBestandsuebertragung;
window.closeBestandsuebertragung = closeBestandsuebertragung;
window.saveUserName = saveUserName;
window.loadUserName = loadUserName;

// WICHTIG: Entfernen Sie den ersten DOMContentLoaded von ganz oben!
// Hier ist der einzige DOMContentLoaded Listener:
window.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Landing Page wird geladen...');

    // Benutzername aus localStorage laden
    loadUserName();

    // Navigation initial deaktivieren bis Daten geladen
    setNavigationEnabled(false);

    // Auto-load CSV Mock-Daten beim Start (mit Callback wenn fertig)
    loadDefaultCSVData().then(() => {
        // Daten geladen - Navigation aktivieren
        setNavigationEnabled(true);

        // Loading Animation ausblenden und Welcome Chat zeigen
        const loadingAnim = document.getElementById('loadingAnimation');
        const welcomeChat = document.getElementById('welcomeChat');

        if (loadingAnim) loadingAnim.style.display = 'none';
        if (welcomeChat) welcomeChat.style.display = 'block';

        console.log('✅ Welcome Chat angezeigt');

        // WICHTIG: Initialize landing chat
        initLandingChat();
    });

    // Setup quick upload
    setupQuickUpload();

    // Setup API token input
    setupApiTokenInput();
});

/**
 * Aktiviert/Deaktiviert die Navigation-Buttons
 */
function setNavigationEnabled(enabled) {
    const navBoxes = document.querySelectorAll('.nav-box');
    navBoxes.forEach(box => {
        if (enabled) {
            box.classList.remove('disabled');
            box.style.pointerEvents = 'auto';
            box.style.opacity = '1';
        } else {
            box.classList.add('disabled');
            box.style.pointerEvents = 'none';
            box.style.opacity = '0.5';
        }
    });
}

// ========================================
// RISIKOSCORING MODULE
// ========================================

let risikoscoringLoaded = false;
