// js/landing.js - Landing Page Logic

// ========================================
// API TOKEN MANAGEMENT
// ========================================

// Default API Key (Base64 encoded für Demo-Zwecke)
const _k = 'c2stcHJvai1uUDZHcjVlSzc0amoyVzhEc0k4RE9sT2t6emVyQnNQaXdNVFZwd3RyWHlIVVJEaTZaVWp4V2NWZVl3ZXhSa2dGWXVuSWsxY2RXY1QzQmxia0ZKbUNUWVFFWEtYSVlTUE9KYXkxXzF3VzNCbHQxanliVVRuOGJtcURXNFFpZzR3ZGRBNDZCSlRhYU5YTkxEVWV6bnBnLUZOWnoxb0E=';
const DEFAULT_OPENAI_KEY = atob(_k);

// Get API token from localStorage (mit Default-Fallback)
function getApiToken() {
    return localStorage.getItem('openai_api_token') || DEFAULT_OPENAI_KEY;
}

// Save API token to localStorage
function saveApiToken(token) {
    if (token && token.trim()) {
        localStorage.setItem('openai_api_token', token.trim());
        return true;
    }
    return false;
}

// Clear API token from localStorage
function clearApiToken() {
    localStorage.removeItem('openai_api_token');
}

// Check if using mock mode (no token = mock mode)
function isUsingMockMode() {
    const token = getApiToken();
    // Mit Default-Key ist Mock-Mode aus
    if (token === DEFAULT_OPENAI_KEY) return false;
    return !token || token === 'YOUR_OPENAI_API_KEY_HERE';
}

// Setup API Token Input
function setupApiTokenInput() {
    const tokenInput = document.getElementById('apiTokenInput');
    const toggleBtn = document.getElementById('apiTokenToggle');
    const saveBtn = document.getElementById('apiTokenSave');
    const statusDiv = document.getElementById('apiTokenStatus');

    if (!tokenInput || !toggleBtn || !saveBtn) return;

    // Load existing token
    const existingToken = getApiToken();
    if (existingToken && existingToken !== 'YOUR_OPENAI_API_KEY_HERE') {
        tokenInput.value = existingToken;
        statusDiv.className = 'api-token-status success';
        statusDiv.textContent = '✅ API-Key gespeichert (KI-Modus aktiv)';
    } else {
        statusDiv.className = 'api-token-status';
        statusDiv.textContent = 'ℹ️ Mock-Modus aktiv (vorgefertigte Antworten)';
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

            // Update chat.js if already loaded
            if (typeof OPENAI_API_KEY !== 'undefined') {
                window.OPENAI_API_KEY = token;
                window.USE_MOCK_MODE = false;
            }
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
        // Get API token from localStorage
        const OPENAI_API_KEY = getApiToken();
        const USE_MOCK_MODE = isUsingMockMode();

        if (USE_MOCK_MODE) {
            // Mock response
            console.log('🎭 Mock-Modus - Generiere Test-Antwort');
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockResponse = generateLandingMockResponse(message);
            hideLandingChatTyping();
            addLandingChatMessage('assistant', mockResponse);
        } else {
            // Real API call - GLEICHE FUNKTION WIE DASHBOARD
            console.log('🚀 Rufe OpenAI API auf...');
            await sendLandingMessageToOpenAI(message, OPENAI_API_KEY);
        }
        
    } catch (error) {
        console.error('❌ Landing Chat Fehler:', error);
        hideLandingChatTyping();
        addLandingChatMessage('assistant', '❌ Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.');
    }
    
    isLandingChatProcessing = false;
}

// Send to OpenAI API - GLEICHE LOGIK WIE DASHBOARD CHAT
async function sendLandingMessageToOpenAI(message, apiKey) {
    console.log('🔑 Verwende OpenAI API-Key:', apiKey.substring(0, 10) + '...');
    
    // Prepare context about current data - GLEICH WIE DASHBOARD
    const dataContext = getLandingDataContext();
    
    // Build messages array - GLEICHE STRUKTUR WIE DASHBOARD
    const messages = [
        {
            role: 'system',
            content: `Du bist ein KI-Assistent für ein Versicherungs-Dashboard. Du hast Zugriff auf CSV-Daten und kannst Dashboard-Filter steuern.

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
- Wenn keine Daten vorhanden sind, erkläre dass der User zuerst eine CSV hochladen oder zum Dashboard gehen sollte`
        },
        {
            role: 'user',
            content: `AKTUELLE DATEN:
${dataContext}

USER FRAGE: ${message}`
        }
    ];
    
    // Call OpenAI API - GLEICH WIE DASHBOARD
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o",
            max_tokens: 2000,
            temperature: 0.7,
            messages: messages
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Fehler:', response.status, errorText);
        throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;
    
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
    
    return `Ich habe deine Frage verstanden: "${message}"\n\n⚠️ **Mock-Modus aktiv** - Um echte KI-Analyse zu aktivieren:\n\n1. Besorge einen API-Key von OpenAI\n2. Öffne \`js/landing.js\`\n3. Ersetze den API-Key\n4. Setze \`USE_MOCK_MODE = false\`\n\n**Verfügbare Mock-Befehle:**\n• "Wie viele Daten haben wir?"\n• "Zeige Top 5 Vermittler"\n• "Wie ist die Performance von Freiburg?"`;
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

// WICHTIG: Entfernen Sie den ersten DOMContentLoaded von ganz oben!
// Hier ist der einzige DOMContentLoaded Listener:
window.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Landing Page wird geladen...');

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
// AUTO-LOAD CSV MOCK DATA
// ========================================

/**
 * Lädt automatisch die Standard-CSV-Daten beim Start
 */
async function loadDefaultCSVData() {
    console.log('📊 Lade Standard-CSV-Daten...');

    // Update Loading-Text
    updateLoadingText('Lade Daten...');

    // Lokale CSV-Datei (im data-Ordner)
    const localCsvPath = 'data/mock-data.csv';

    try {
        updateLoadingText('Lade CSV-Datei...');
        const response = await fetch(localCsvPath);

        if (!response.ok) {
            throw new Error('Lokale CSV nicht gefunden');
        }

        updateLoadingText('Verarbeite Daten...');
        const csvText = await response.text();
        processCSVData(csvText);

        updateLoadingText('Fertig!');
        console.log('✅ CSV aus lokalem data/-Ordner geladen');

    } catch (error) {
        console.warn('⚠️ Fehler beim Laden der CSV-Daten:', error);
        updateLoadingText('Daten manuell laden');
        console.log('ℹ️ Daten können manuell über Settings > CSV Upload geladen werden');
    }
}

/**
 * Aktualisiert den Text der Ladeanimation
 */
function updateLoadingText(text) {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = text;
    }
}

/**
 * Verarbeitet die CSV-Daten und speichert sie global
 */
function processCSVData(csvText) {
    try {
        const parsedData = parseCSV(csvText);

        if (parsedData && parsedData.length > 0) {
            // Speichere als globale Daten
            window.dailyRawData = parsedData;
            if (typeof dailyRawData !== 'undefined') {
                dailyRawData = parsedData;
            }

            console.log('✅ CSV-Daten geladen:', parsedData.length, 'Datensätze');

            // Optional: Update UI Status
            const statusEl = document.getElementById('quickUploadStatus');
            if (statusEl) {
                statusEl.innerHTML = '<span style="color: #16a34a;">✓ ' + parsedData.length + ' Datensätze geladen</span>';
            }
        }
    } catch (error) {
        console.error('❌ Fehler beim Parsen der CSV:', error);
    }
}

// ========================================
// ✨ v14 FEATURE: KI Filter Commands + Auto-Navigation
// ========================================

// Parse KI-Antwort und führe Filter-Befehle aus
async function parseAndExecuteCommands(message) {
    console.log('🔍 Parse KI-Antwort nach Befehlen...');

    let hasExecutedCommands = false;

    // NEU: Check for Agentur Overview Command
    const overviewMatch = message.match(/showAgenturOverview\(['"]([^'"]+)['"]\)/);
    if (overviewMatch) {
        const vermittlerId = overviewMatch[1];
        console.log('📊 Gefunden: showAgenturOverview für', vermittlerId);

        if (typeof showAgenturOverview === 'function') {
            showAgenturOverview(vermittlerId);
            return true; // Early return
        } else {
            console.error('❌ showAgenturOverview Funktion nicht verfügbar!');
        }
    }

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

    // WICHTIG: Erst alle anderen Filter zurücksetzen!
    if (typeof state !== 'undefined') {
        // Speichere aktuelles Jahr
        const currentYear = state.filters.year;

        // Setze alle Filter zurück (außer Jahr)
        state.filters = {
            year: currentYear,
            agentur: vermittlerId,  // Neuer Agentur-Filter
            silo: 'alle',
            segments: ['alle'],      // WICHTIG: ['alle'] nicht []
            products: ['alle'],      // WICHTIG: Muss gesetzt sein!
            bundeslaender: []
        };

        console.log('✅ Filter zurückgesetzt und Agentur-Filter gesetzt:', state.filters);
    } else {
        // Falls state noch nicht existiert, speichere im localStorage
        localStorage.removeItem('pendingSiloFilter');
        localStorage.removeItem('pendingSegmentFilter');
        localStorage.removeItem('pendingBundeslandFilter');
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

// ✨ v16: Predefined answers for standard questions (no AI needed)
const standardAnswers = {
    'Was kann ich hier machen?': `**Willkommen im Vertriebssteuerungs-Cockpit!** 🎯

Hier kannst du:
• **Dashboard öffnen** - Visualisiere deine Versicherungsdaten mit interaktiven Charts
• **CSV-Daten hochladen** - Lade deine eigenen Daten hoch oder nutze den Generator
• **Daten generieren** - Erstelle realistische Testdaten mit dem CSV-Generator
• **KI-Analysen** - Stelle Fragen zu deinen Daten (mit OpenAI API-Key)

Klicke auf "Zur Gesamtübersicht" um loszulegen!`,

    'Zeige mir ein Beispiel Dashboard': `**So funktioniert das Dashboard:** 📊

1. **Klicke auf "Zur Gesamtübersicht"** oben
2. Das Dashboard lädt automatisch mit Beispieldaten
3. Du siehst:
   - KPI-Kacheln (Neugeschäft, Bestand, etc.)
   - Interaktive Charts
   - Deutschland-Karte mit Regionen
   - Filter-Optionen

**Oder:** Generiere eigene Daten mit dem CSV-Generator!`,

    'Wie lade ich Daten hoch?': `**Daten hochladen - 2 Optionen:** 📤

**Option 1: Direkt hier**
• Ziehe eine CSV-Datei in das Upload-Feld oben
• Oder klicke drauf zum Auswählen

**Option 2: Im Dashboard**
• Öffne das Dashboard
• Nutze den Upload-Button oben
• Wähle deine CSV-Datei

**Oder generiere Testdaten:**
• Klicke auf "Test-Daten generieren"
• Wähle Unternehmensgröße
• Download CSV und lade sie hoch`
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

// ========================================
// UPLOAD MODUS
// ========================================

let uploadModeActive = true; // Standardmäßig aktiviert

function toggleUploadMode() {
    const toggle = document.getElementById('uploadModeToggle');
    const hint = document.getElementById('uploadModeHint');
    const body = document.body;

    uploadModeActive = toggle ? toggle.checked : true;

    if (uploadModeActive) {
        body.classList.add('upload-mode-active');
        if (hint) hint.style.display = 'block';
        console.log('📤 Upload-Modus aktiviert');
    } else {
        body.classList.remove('upload-mode-active');
        if (hint) hint.style.display = 'none';
        console.log('📤 Upload-Modus deaktiviert');
    }
}

// Upload-Modus beim Start aktivieren
function initUploadMode() {
    const toggle = document.getElementById('uploadModeToggle');
    if (toggle) {
        toggle.checked = true;
    }
    document.body.classList.add('upload-mode-active');
    const hint = document.getElementById('uploadModeHint');
    if (hint) hint.style.display = 'block';
    uploadModeActive = true;
    console.log('📤 Upload-Modus standardmäßig aktiviert');
}

// Logo Upload
function triggerLogoUpload() {
    if (!uploadModeActive) {
        console.log('ℹ️ Upload-Modus nicht aktiv');
        return;
    }
    document.getElementById('logoUploadInput').click();
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const logoImg = document.getElementById('uploadedLogo');
        const placeholder = document.getElementById('logoPlaceholder');

        logoImg.src = e.target.result;
        logoImg.style.display = 'block';
        placeholder.style.display = 'none';

        // Speichern im localStorage
        localStorage.setItem('customLogo', e.target.result);
        console.log('✅ Logo hochgeladen und gespeichert');
    };
    reader.readAsDataURL(file);
}

// Profilbild Upload (für Agentur und Kunden)
function triggerProfileUpload(vermittlerId) {
    // Kein uploadModeActive Check - Foto kann immer geändert werden
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        handleProfileUpload(e, vermittlerId);
    };
    input.click();
}

function handleProfileUpload(event, vermittlerId) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        // Speichern im localStorage
        localStorage.setItem('profileImage_' + vermittlerId, e.target.result);

        // Je nach Kontext das richtige Element aktualisieren
        if (vermittlerId === 'kunde') {
            // Kunden-Foto auf der Kundendetail-Seite
            const kundenFoto = document.querySelector('.kunden-foto');
            if (kundenFoto) {
                kundenFoto.innerHTML = `<img src="${e.target.result}" alt="Kundenfoto" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            }
            console.log('✅ Kundenfoto gespeichert');
        } else {
            // Bild in Agenturansicht aktualisieren
            const photoContainer = document.getElementById('agenturPhoto');
            if (photoContainer) {
                photoContainer.innerHTML = `<img src="${e.target.result}" alt="Profilbild">`;
            }
            console.log('✅ Profilbild gespeichert für:', vermittlerId);
        }
    };
    reader.readAsDataURL(file);
}

// Agentur Photo Upload (direkt auf der Agenturübersicht-Seite)
function triggerAgenturPhotoUpload() {
    // Kein uploadModeActive Check - Foto kann immer geändert werden
    document.getElementById('agenturPhotoInput').click();
}

function handleAgenturPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        // Korrekter Element-Name: agenturPhotoImgSmall
        const photoImg = document.getElementById('agenturPhotoImgSmall');
        const placeholder = document.querySelector('.agentur-photo-placeholder-small');

        if (photoImg) {
            photoImg.src = e.target.result;
            photoImg.style.display = 'block';
        }
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        // Speichern im localStorage
        localStorage.setItem('agenturPhoto', e.target.result);
        console.log('✅ Agentur-Foto hochgeladen und gespeichert');
    };
    reader.readAsDataURL(file);
}

// Gespeichertes Logo laden (mit Fallback auf assets/images-config.json)
async function loadSavedImages() {
    // Versuche zuerst, die Konfigurationsdatei zu laden
    let configImages = { logo: null, profile: null };
    try {
        const response = await fetch('assets/images/images-config.json');
        if (response.ok) {
            configImages = await response.json();
        }
    } catch (e) {
        console.log('ℹ️ Keine images-config.json gefunden, nutze Fallbacks');
    }

    // Logo laden: localStorage > config > default SVG
    const savedLogo = localStorage.getItem('customLogo');
    const logoImg = document.getElementById('uploadedLogo');
    const logoPlaceholder = document.getElementById('logoPlaceholder');

    if (logoImg && logoPlaceholder) {
        if (savedLogo) {
            logoImg.src = savedLogo;
            logoImg.style.display = 'block';
            logoPlaceholder.style.display = 'none';
        } else if (configImages.logo) {
            logoImg.src = configImages.logo;
            logoImg.style.display = 'block';
            logoPlaceholder.style.display = 'none';
        } else {
            // Fallback: Standard-Logo aus assets
            logoImg.src = 'assets/images/default-logo.svg';
            logoImg.style.display = 'block';
            logoPlaceholder.style.display = 'none';
        }
    }

    // Agentur Photo laden: localStorage > config > default SVG
    const savedAgenturPhoto = localStorage.getItem('agenturPhoto');
    const photoImg = document.getElementById('agenturPhotoImg');
    const photoPlaceholder = document.querySelector('.agentur-photo-placeholder');

    if (photoImg) {
        if (savedAgenturPhoto) {
            photoImg.src = savedAgenturPhoto;
            photoImg.style.display = 'block';
            if (photoPlaceholder) photoPlaceholder.style.display = 'none';
        } else if (configImages.profile) {
            photoImg.src = configImages.profile;
            photoImg.style.display = 'block';
            if (photoPlaceholder) photoPlaceholder.style.display = 'none';
        } else {
            // Fallback: Standard-Profilbild aus assets
            photoImg.src = 'assets/images/default-profile.svg';
            photoImg.style.display = 'block';
            if (photoPlaceholder) photoPlaceholder.style.display = 'none';
        }
    }

    // AUCH das kleine Agentur-Foto im Header laden
    const photoImgSmall = document.getElementById('agenturPhotoImgSmall');
    const photoPlaceholderSmall = document.querySelector('.agentur-photo-placeholder-small');

    if (photoImgSmall) {
        if (savedAgenturPhoto) {
            photoImgSmall.src = savedAgenturPhoto;
            photoImgSmall.style.display = 'block';
            if (photoPlaceholderSmall) photoPlaceholderSmall.style.display = 'none';
        } else if (configImages.profile) {
            photoImgSmall.src = configImages.profile;
            photoImgSmall.style.display = 'block';
            if (photoPlaceholderSmall) photoPlaceholderSmall.style.display = 'none';
        }
        // Kein SVG-Fallback hier - Placeholder bleibt sichtbar wenn kein Bild vorhanden
    }
}

// Exportiere hochgeladene Bilder für GitHub
function exportImagesForGitHub() {
    const images = {};

    const logo = localStorage.getItem('customLogo');
    if (logo) images.logo = logo;

    const photo = localStorage.getItem('agenturPhoto');
    if (photo) images.photo = photo;

    if (Object.keys(images).length === 0) {
        alert('Keine hochgeladenen Bilder gefunden.');
        return;
    }

    // Download als JSON
    const blob = new Blob([JSON.stringify(images, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uploaded-images.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Bilder exportiert für GitHub');
}

// ========================================
// POTENTIALANALYSE
// ========================================

let currentPotentialFilter = null;

function openPotentialAnalyse() {
    console.log('📊 Potentialanalyse öffnen...');

    // Verstecke alle Seiten
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'none';
    const kundenDetail = document.getElementById('kundenDetailPage');
    if (kundenDetail) kundenDetail.style.display = 'none';

    // Zeige Potentialanalyse
    document.getElementById('potentialAnalysePage').style.display = 'block';

    // Reset Filter
    currentPotentialFilter = null;
    updatePotentialFilter();
}

function openPotentialAnalyseWithFilter(productId, productName) {
    console.log('📊 Potentialanalyse öffnen mit Filter:', productId);

    // Verstecke alle Seiten
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'none';
    const kundenDetail = document.getElementById('kundenDetailPage');
    if (kundenDetail) kundenDetail.style.display = 'none';

    // Zeige Potentialanalyse
    document.getElementById('potentialAnalysePage').style.display = 'block';

    // Setze Filter
    currentPotentialFilter = productId;
    const filterSelect = document.getElementById('potentialProductFilter');
    if (filterSelect) {
        filterSelect.value = productId;
    }
    updatePotentialFilter();
}

function closePotentialAnalyse() {
    document.getElementById('potentialAnalysePage').style.display = 'none';
    document.getElementById('landingPage').style.display = 'flex';
    currentPotentialFilter = null;
}

function showEigeneDaten() {
    document.getElementById('eigeneDatenContainer').style.display = 'block';
    document.getElementById('fidaContainer').style.display = 'none';
    document.getElementById('eigeneDatenBtn').classList.add('active');
    document.getElementById('fidaBtn').classList.remove('active');
}

function showFidaDaten() {
    document.getElementById('eigeneDatenContainer').style.display = 'none';
    document.getElementById('fidaContainer').style.display = 'block';
    document.getElementById('eigeneDatenBtn').classList.remove('active');
    document.getElementById('fidaBtn').classList.add('active');
}

function updatePotentialFilter() {
    const filter = currentPotentialFilter;
    const eigeneDatenRows = document.querySelectorAll('#eigeneDatenTable tbody tr');
    const fidaRows = document.querySelectorAll('#fidaTable tbody tr');

    // Zeige/Verstecke Zeilen basierend auf Filter
    eigeneDatenRows.forEach(row => {
        if (!filter) {
            row.style.display = '';
        } else {
            const badge = row.querySelector('.potential-badge');
            if (badge && badge.classList.contains(filter)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });

    fidaRows.forEach(row => {
        if (!filter) {
            row.style.display = '';
        } else {
            const badge = row.querySelector('.potential-badge');
            if (badge && badge.classList.contains(filter)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });

    // Update aktiven Filter-Button
    const filterBtns = document.querySelectorAll('.potential-filter-btn');
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
}

function filterPotentials(productId) {
    currentPotentialFilter = productId === 'alle' ? null : productId;
    updatePotentialFilter();
}

// ========================================
// KUNDENDETAIL SEITE
// ========================================

// Speichert ob FIDA in der Potentialanalyse aktiv war
let fidaActiveInPotentialAnalyse = false;

function openKundenDetail(kundenName, vermittlerId) {
    console.log('👤 Kundendetail öffnen:', kundenName, vermittlerId);

    // Prüfe ob FIDA in der Potentialanalyse aktiv ist (mehrere Checks für Zuverlässigkeit)
    const fidaBtn = document.getElementById('fidaBtn');
    const fidaContainer = document.getElementById('fidaContainer');

    // FIDA ist aktiv wenn Container sichtbar ist (display: block)
    const fidaContainerDisplay = fidaContainer ? fidaContainer.style.display : 'none';
    fidaActiveInPotentialAnalyse = (fidaContainerDisplay === 'block');
    console.log('📊 FIDA Check - Container display:', fidaContainerDisplay, '| FIDA aktiv:', fidaActiveInPotentialAnalyse);

    // Verstecke alle Seiten
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('potentialAnalysePage').style.display = 'none';
    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'none';

    // Zeige Kundendetail-Seite
    const kundenDetail = document.getElementById('kundenDetailPage');
    if (kundenDetail) {
        kundenDetail.style.display = 'block';

        // Fülle Kundendaten
        fillKundenDetail(kundenName, vermittlerId);

        // Aktiviere FIDA in Kundendetail wenn es in Potentialanalyse aktiv war
        initKundenFidaState();
    }
}

// Initialisiert den FIDA-Status in der Kundendetail-Seite
function initKundenFidaState() {
    const fidaDaten = document.getElementById('kundenFidaDaten');
    const fidaBtn = document.getElementById('kundenFidaBtn');

    if (fidaActiveInPotentialAnalyse) {
        // FIDA aktivieren
        if (fidaDaten) fidaDaten.style.display = 'block';
        if (fidaBtn) {
            fidaBtn.classList.add('active');
            fidaBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> Open Finance aktiv';
        }
        console.log('✅ FIDA in Kundendetail aktiviert');
    } else {
        // FIDA deaktivieren (Standard)
        if (fidaDaten) fidaDaten.style.display = 'none';
        if (fidaBtn) {
            fidaBtn.classList.remove('active');
            fidaBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> Open Finance';
        }
    }
}

function closeKundenDetail() {
    document.getElementById('kundenDetailPage').style.display = 'none';
    document.getElementById('potentialAnalysePage').style.display = 'block';
}

function fillKundenDetail(kundenName, vermittlerId) {
    // Stammdaten füllen
    const nameEl = document.getElementById('kundenName');
    if (nameEl) nameEl.textContent = kundenName;

    const idEl = document.getElementById('kundenVermittlerId');
    if (idEl) idEl.textContent = vermittlerId;

    // Mock-Daten für Demo
    const mockKunden = {
        'Max Mustermann': {
            geburtsdatum: '15.03.1985',
            adresse: 'Musterstraße 123, 12345 Musterstadt',
            telefon: '+49 123 456789',
            email: 'max.mustermann@email.de',
            beruf: 'Angestellter',
            familienstand: 'Verheiratet',
            kinder: [{ name: 'Lena', alter: 8 }, { name: 'Paul', alter: 5 }],
            vertraege: [
                { typ: 'Wohngebäudeversicherung', praemie: '€450/Jahr', status: 'Aktiv' },
                { typ: 'Kfz-Versicherung', praemie: '€680/Jahr', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Sparkasse', typ: 'Girokonto', info: 'Hauptkonto' },
                { anbieter: 'DWS', typ: 'Depot', info: 'Fondssparen' }
            ]
        },
        'Klaus Meier': {
            geburtsdatum: '22.07.1978',
            adresse: 'Hauptstraße 45, 54321 Beispielstadt',
            telefon: '+49 987 654321',
            email: 'klaus.meier@email.de',
            beruf: 'Selbstständig',
            familienstand: 'Ledig',
            kinder: [],
            vertraege: [
                { typ: 'Haftpflichtversicherung', praemie: '€120/Jahr', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Commerzbank', typ: 'Geschäftskonto', info: 'Selbstständigkeit' },
                { anbieter: 'Union Investment', typ: 'Riester', info: 'Altersvorsorge' }
            ]
        }
    };

    const kunde = mockKunden[kundenName] || mockKunden['Max Mustermann'];

    // Stammdaten
    document.getElementById('kundenGeburtsdatum').textContent = kunde.geburtsdatum;
    document.getElementById('kundenAdresse').textContent = kunde.adresse;
    document.getElementById('kundenTelefon').textContent = kunde.telefon;
    document.getElementById('kundenEmail').textContent = kunde.email;
    document.getElementById('kundenBeruf').textContent = kunde.beruf;
    document.getElementById('kundenFamilienstand').textContent = kunde.familienstand;

    // Kinder
    const kinderList = document.getElementById('kundenKinder');
    if (kinderList) {
        if (kunde.kinder.length > 0) {
            kinderList.innerHTML = kunde.kinder.map(k =>
                `<span class="kinder-badge">${k.name} (${k.alter} Jahre)</span>`
            ).join('');
        } else {
            kinderList.innerHTML = '<span class="no-children">Keine Kinder</span>';
        }
    }

    // Verträge
    const vertraegeBody = document.getElementById('kundenVertraege');
    if (vertraegeBody) {
        vertraegeBody.innerHTML = kunde.vertraege.map(v => `
            <tr>
                <td>${v.typ}</td>
                <td>${v.praemie}</td>
                <td><span class="status-badge aktiv">${v.status}</span></td>
            </tr>
        `).join('');
    }

    // FIDA Verträge
    const fidaBody = document.getElementById('kundenFidaVertraege');
    if (fidaBody) {
        fidaBody.innerHTML = kunde.fidaVertraege.map(v => `
            <tr>
                <td>${v.anbieter}</td>
                <td>${v.typ}</td>
                <td>${v.info}</td>
            </tr>
        `).join('');
    }
}

// ========================================
// KUNDEN TAB NAVIGATION
// ========================================

function switchKundenTab(tabName) {
    // Alle Tabs deaktivieren
    document.querySelectorAll('.kunden-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Alle Tab-Inhalte verstecken
    document.querySelectorAll('.kunden-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Aktiven Tab markieren
    const activeTab = document.querySelector(`.kunden-tab[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Tab-Inhalt anzeigen
    const tabContent = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    if (tabContent) {
        tabContent.classList.add('active');
    }

    console.log('Tab gewechselt zu:', tabName);
}

// Kommunikation ansehen
function viewKommunikation(kommId) {
    console.log('Kommunikation ansehen:', kommId);

    // Mock-Daten für Kommunikation
    const kommunikationen = {
        'email-1': {
            typ: 'E-Mail',
            datum: '28.11.2025, 09:15',
            betreff: 'Kfz-Versicherung: Ihr Vertrag läuft aus',
            inhalt: `Sehr geehrter Herr Mustermann,

Ihr Kfz-Vertrag bei der Allianz (Kennzeichen: M-AB 1234) läuft am 31.12.2025 aus.

Basierend auf Ihrer Schadenfreiheitsklasse SF12 und Ihren Fahrzeugdaten haben wir ein attraktives Angebot für Sie:

- Haftpflicht + Vollkasko: €520/Jahr (statt €680 aktuell)
- Ersparnis: €160/Jahr

Interesse? Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an.

Mit freundlichen Grüßen
Ihre Versicherungsagentur`,
            status: 'Geöffnet am 28.11.2025, 14:32'
        },
        'brief-1': {
            typ: 'Brief',
            datum: '15.11.2025',
            betreff: 'Open Finance Datenfreigabe: Neue Potentiale erkannt',
            inhalt: `Sehr geehrter Herr Mustermann,

vielen Dank für Ihre Open Finance Datenfreigabe vom 15.03.2024.

Basierend auf der Analyse Ihrer Finanzdaten haben wir folgende Optimierungsmöglichkeiten identifiziert:

1. Risikolebensversicherung
   Ihre Hypothek (€320.000) ist derzeit nicht abgesichert.

2. Private Altersvorsorge
   Bei Ihrer Sparrate von €800/Monat können wir Ihre Rentenlücke schließen.

Wir würden uns freuen, diese Möglichkeiten in einem persönlichen Gespräch mit Ihnen zu besprechen.

Mit freundlichen Grüßen
Ihre Versicherungsagentur`,
            status: 'Versendet'
        },
        'call-1': {
            typ: 'Telefonat',
            datum: '10.11.2025, 11:20',
            betreff: 'Rückruf wegen Altersvorsorge-Angebot',
            inhalt: `Gesprächsnotiz:

Kunde rief zurück wegen Brief vom 15.11.

- Interesse an fondsgebundener Rentenversicherung
- Möchte Angebot mit verschiedenen Fonds-Optionen
- Bevorzugt nachhaltige ETFs
- Budget: ca. €400/Monat zusätzlich zur bestehenden Sparrate

Termin vereinbart: 12.12.2025, 14:00 Uhr
Ort: Agentur

Vorbereitung:
- 3 Angebote mit unterschiedlichen Risikoprofilen
- ESG-Fonds-Optionen`,
            status: 'Termin: 12.12.2025'
        },
        'email-2': {
            typ: 'E-Mail',
            datum: '01.10.2025, 08:00',
            betreff: 'Willkommen bei Open Finance - Ihre Daten sind jetzt verknüpft',
            inhalt: `Sehr geehrter Herr Mustermann,

vielen Dank für Ihre Open Finance Datenfreigabe!

Ab sofort können wir Ihnen personalisierte Versicherungsempfehlungen basierend auf Ihrer Finanzsituation anbieten.

Was bedeutet das für Sie?
- Wir erkennen automatisch, wenn sich Ihre Lebensumstände ändern
- Sie erhalten nur relevante Angebote
- Ihre Daten sind sicher und DSGVO-konform geschützt

Ihre freigegebenen Datenquellen:
- Sparkasse (Girokonto)
- DWS (Depot)
- Sparkasse (Hypothekendarlehen)
- Allianz (Kfz-Versicherung)

Sie können Ihre Einwilligung jederzeit über das Open Finance Dashboard widerrufen.

Mit freundlichen Grüßen
Ihre Versicherungsagentur`,
            status: 'Geöffnet am 01.10.2025, 19:45'
        }
    };

    const komm = kommunikationen[kommId];
    if (komm) {
        alert(`${komm.typ} vom ${komm.datum}\n\nBetreff: ${komm.betreff}\n\n${komm.inhalt}\n\nStatus: ${komm.status}`);
    }
}

// Legacy-Funktion für Kompatibilität
function toggleKundenFida() {
    switchKundenTab('fida');
}

// ========================================
// CHATBOT AUTOCOMPLETE
// ========================================

const mockAgents = [
    { id: 'VM00001', name: 'Max Mustermann' },
    { id: 'VM00002', name: 'Maria Schmidt' },
    { id: 'VM00003', name: 'Michael Weber' },
    { id: 'VM00004', name: 'Martina Fischer' },
    { id: 'VM00005', name: 'Markus Braun' }
];

const potentialProducts = [
    { id: 'hausrat', name: 'Hausratversicherung' },
    { id: 'haftpflicht', name: 'Haftpflichtversicherung' },
    { id: 'kfz', name: 'Kfz-Versicherung' },
    { id: 'leben', name: 'Lebensversicherung' },
    { id: 'bu', name: 'Berufsunfähigkeitsversicherung' },
    { id: 'unfall', name: 'Unfallversicherung' },
    { id: 'rechtsschutz', name: 'Rechtsschutzversicherung' },
    { id: 'kranken', name: 'Krankenversicherung' },
    { id: 'pflege', name: 'Pflegeversicherung' },
    { id: 'altersvorsorge', name: 'Private Altersvorsorge' },
    { id: 'sach', name: 'Sachversicherung' },
    { id: 'wohngebaeude', name: 'Wohngebäudeversicherung' }
];

let selectedSuggestionIndex = -1;
let currentSuggestionType = null;

// Erweiterte Befehle für Autocomplete
const quickCommands = [
    { pattern: 'gesamtübersicht', label: 'Gesamtübersicht öffnen', action: 'openDashboard', icon: 'grid' },
    { pattern: 'potentialanalyse', label: 'Potentialanalyse öffnen', action: 'openPotentialAnalyse', icon: 'chart' },
    { pattern: 'dashboard', label: 'Dashboard öffnen', action: 'openDashboard', icon: 'grid' },
    { pattern: 'hilfe', label: 'Hilfe anzeigen', action: 'showHelp', icon: 'help' },
    { pattern: 'filter zurücksetzen', label: 'Alle Filter zurücksetzen', action: 'clearFilters', icon: 'x' },
];

function setupAutocomplete() {
    const chatInput = document.getElementById('landingChatInput');
    const suggestionsContainer = document.getElementById('autocompleteSuggestions');

    if (!chatInput || !suggestionsContainer) return;

    chatInput.addEventListener('input', function(e) {
        const value = e.target.value.toLowerCase().trim();

        // Vorschläge erst ab 3 Zeichen anzeigen
        if (value.length < 3) {
            hideSuggestions(suggestionsContainer);
            return;
        }

        // Sammle alle Vorschläge
        let suggestions = [];

        // 1. Prüfe auf Agenten-Befehle
        const agentPatterns = ['agentur ', 'übersicht ', 'zeige ', 'filter ', 'ansicht '];
        for (const pattern of agentPatterns) {
            if (value.includes(pattern)) {
                const searchTerm = value.split(pattern).pop();
                if (searchTerm && searchTerm.length > 0) {
                    const agentMatches = getAgentSuggestions(searchTerm, pattern);
                    suggestions = suggestions.concat(agentMatches);
                }
                break;
            }
        }

        // 2. Prüfe auf Potential-Befehle (mit Leerzeichen = Produktsuche)
        const potentialPatterns = ['potentiale für ', 'potential für ', 'potentiale ', 'potential '];
        for (const pattern of potentialPatterns) {
            if (value.includes(pattern)) {
                const searchTerm = value.split(pattern).pop();
                if (searchTerm && searchTerm.length > 0) {
                    const potentialMatches = getPotentialSuggestions(searchTerm);
                    suggestions = suggestions.concat(potentialMatches);
                }
                break;
            }
        }

        // 2b. Wenn "pot..." eingegeben wird (Beginn von "potential"), zeige alle Potentiale
        if (value.startsWith('pot') && !value.includes(' ')) {
            // Zeige alle Potential-Produkte als Vorschläge
            const allPotentials = potentialProducts.slice(0, 5).map(p => ({
                type: 'potential',
                id: p.id,
                name: p.name,
                label: `Potentiale für ${p.name}`,
                icon: 'chart'
            }));
            suggestions = suggestions.concat(allPotentials);
        }

        // 3. Allgemeine Suche nach Agenten (wenn Name eingegeben wird)
        if (suggestions.length === 0) {
            const agentMatches = getAgentSuggestions(value, '');
            suggestions = suggestions.concat(agentMatches);
        }

        // 4. Quick Commands
        const commandMatches = quickCommands.filter(cmd =>
            cmd.pattern.includes(value) || cmd.label.toLowerCase().includes(value)
        ).map(cmd => ({
            type: 'command',
            label: cmd.label,
            action: cmd.action,
            icon: cmd.icon
        }));
        suggestions = suggestions.concat(commandMatches);

        // 5. Potential-Produkte direkt
        if (suggestions.length < 5) {
            const directPotentials = potentialProducts.filter(p =>
                p.name.toLowerCase().includes(value) || p.id.includes(value)
            ).slice(0, 3).map(p => ({
                type: 'potential',
                id: p.id,
                name: p.name,
                label: `Potentiale für ${p.name}`,
                icon: 'chart'
            }));
            suggestions = suggestions.concat(directPotentials);
        }

        // Zeige Vorschläge (max 8)
        suggestions = suggestions.slice(0, 8);

        if (suggestions.length > 0) {
            showUnifiedSuggestions(suggestions, suggestionsContainer);
        } else {
            hideSuggestions(suggestionsContainer);
        }
    });

    // Keyboard navigation
    chatInput.addEventListener('keydown', function(e) {
        const items = suggestionsContainer.querySelectorAll('.autocomplete-item');

        if (suggestionsContainer.style.display === 'none' || items.length === 0) {
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, items.length - 1);
            updateSuggestionSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, 0);
            updateSuggestionSelection(items);
        } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
            e.preventDefault();
            const selectedItem = items[selectedSuggestionIndex];
            if (selectedItem) {
                executeSuggestion(selectedItem);
            }
        }
    });

    // Click outside to close
    document.addEventListener('click', function(e) {
        if (!suggestionsContainer.contains(e.target) && e.target !== chatInput) {
            hideSuggestions(suggestionsContainer);
        }
    });
}

// Neue Hilfsfunktionen für erweitertes Autocomplete
function getAgentSuggestions(searchTerm, prefix) {
    const agenturen = typeof getAgenturen === 'function' ? getAgenturen() : mockAgents;

    return agenturen.filter(a =>
        (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.id && a.id.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 5).map(agent => ({
        type: 'agent',
        id: agent.id,
        name: agent.name || agent.id,
        label: prefix === 'filter ' ? `Filter auf ${agent.name}` : `Übersicht ${agent.name}`,
        prefix: prefix,
        icon: 'user'
    }));
}

function getPotentialSuggestions(searchTerm) {
    return potentialProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5).map(p => ({
        type: 'potential',
        id: p.id,
        name: p.name,
        label: `Potentiale für ${p.name}`,
        icon: 'chart'
    }));
}

function getIcon(iconType) {
    const icons = {
        user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',
        grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
        help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
    };
    return icons[iconType] || icons.user;
}

function showUnifiedSuggestions(suggestions, container) {
    container.innerHTML = suggestions.map((s, i) => `
        <div class="autocomplete-item"
             data-type="${s.type}"
             data-id="${s.id || ''}"
             data-name="${s.name || ''}"
             data-action="${s.action || ''}"
             data-label="${s.label}"
             onclick="executeSuggestion(this)">
            ${getIcon(s.icon)}
            <span class="suggestion-label">${s.label}</span>
            ${s.id ? `<span class="suggestion-id">(${s.id})</span>` : ''}
        </div>
    `).join('');

    container.style.display = 'block';
    selectedSuggestionIndex = -1;
}

function executeSuggestion(element) {
    const type = element.dataset.type;
    const id = element.dataset.id;
    const name = element.dataset.name;
    const action = element.dataset.action;
    const label = element.dataset.label;
    const container = document.getElementById('autocompleteSuggestions');

    hideSuggestions(container);

    // Chat-Input aktualisieren
    const chatInput = document.getElementById('landingChatInput');
    if (chatInput) chatInput.value = '';

    if (type === 'agent') {
        // Agenturansicht öffnen
        if (typeof showAgenturOverview === 'function') {
            showAgenturOverview(id);
        }
    } else if (type === 'potential') {
        // Potentialanalyse mit Filter öffnen
        if (typeof openPotentialAnalyseWithFilter === 'function') {
            openPotentialAnalyseWithFilter(id, name);
        }
    } else if (type === 'command') {
        // Quick Command ausführen
        if (action === 'openDashboard' && typeof openDashboard === 'function') {
            openDashboard();
        } else if (action === 'openPotentialAnalyse' && typeof openPotentialAnalyse === 'function') {
            openPotentialAnalyse();
        } else if (action === 'clearFilters' && typeof clearAllFilters === 'function') {
            clearAllFilters();
            addLandingChatMessage('assistant', 'Alle Filter wurden zurückgesetzt.');
        } else if (action === 'showHelp') {
            addLandingChatMessage('assistant', '**Verfügbare Befehle:**\n\n• "Übersicht [Name]" - Agenturübersicht öffnen\n• "Potentiale für [Produkt]" - Potentialanalyse filtern\n• "Gesamtübersicht" - Dashboard öffnen\n• "Potentialanalyse" - Potentialanalyse öffnen\n• "Filter zurücksetzen" - Alle Filter entfernen');
        }
    }
}

// Legacy-Funktionen für Rückwärtskompatibilität
function showAgentSuggestions(searchTerm, container) {
    const agenturen = typeof getAgenturen === 'function' ? getAgenturen() : mockAgents;
    const matches = agenturen.filter(a =>
        (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.id && a.id.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 5);

    if (matches.length === 0) {
        hideSuggestions(container);
        return;
    }

    const suggestions = matches.map(agent => ({
        type: 'agent',
        id: agent.id,
        name: agent.name || agent.id,
        label: `Übersicht ${agent.name || agent.id}`,
        icon: 'user'
    }));

    showUnifiedSuggestions(suggestions, container);
}

function showPotentialSuggestions(searchTerm, container) {
    const matches = potentialProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    if (matches.length === 0) {
        hideSuggestions(container);
        return;
    }

    const suggestions = matches.map(p => ({
        type: 'potential',
        id: p.id,
        name: p.name,
        label: `Potentiale für ${p.name}`,
        icon: 'chart'
    }));

    showUnifiedSuggestions(suggestions, container);
}

function hideSuggestions(container) {
    container.style.display = 'none';
    selectedSuggestionIndex = -1;
    currentSuggestionType = null;
}

function updateSuggestionSelection(items) {
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedSuggestionIndex);
    });
}

function selectAgentSuggestion(agentId, agentName) {
    console.log('✅ Agentur ausgewählt:', agentId, agentName);

    // Verstecke Suggestions
    const container = document.getElementById('autocompleteSuggestions');
    if (container) container.style.display = 'none';

    // Leere Input
    const chatInput = document.getElementById('landingChatInput');
    if (chatInput) chatInput.value = '';

    // Öffne Agenturansicht
    if (typeof showAgenturOverview === 'function') {
        showAgenturOverview(agentId);
    } else {
        // Fallback
        setAgenturFilter(agentId);
        openDashboard();
    }
}

function selectPotentialSuggestion(productId, productName) {
    console.log('✅ Potential ausgewählt:', productId, productName);

    // Verstecke Suggestions
    const container = document.getElementById('autocompleteSuggestions');
    if (container) container.style.display = 'none';

    // Leere Input
    const chatInput = document.getElementById('landingChatInput');
    if (chatInput) chatInput.value = '';

    // Setze Filter und öffne Potentialanalyse
    currentPotentialFilter = productId;
    openPotentialAnalyseWithFilter(productId, productName);
}

// Für Rückwärtskompatibilität
function selectSuggestion(id, name) {
    if (currentSuggestionType === 'potential') {
        selectPotentialSuggestion(id, name);
    } else {
        selectAgentSuggestion(id, name);
    }
}

// ========================================
// USER MODE SWITCHING (Vertrieb / PVA)
// ========================================

// Aktueller Modus
let currentUserMode = 'vertrieb'; // 'vertrieb' oder 'pva'

// Toggle Profile Dropdown
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    const arrow = document.getElementById('profileArrow');

    if (dropdown && arrow) {
        dropdown.classList.toggle('show');
        arrow.classList.toggle('open');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const switcher = document.getElementById('userProfileSwitcher');
    const dropdown = document.getElementById('profileDropdown');
    const arrow = document.getElementById('profileArrow');

    if (switcher && dropdown && !switcher.contains(event.target)) {
        dropdown.classList.remove('show');
        if (arrow) arrow.classList.remove('open');
    }
});

// Switch User Mode
function switchUserMode(mode) {
    currentUserMode = mode;

    // Update profile display
    const profileName = document.getElementById('profileName');
    const profileRole = document.getElementById('profileRole');
    const checkVertrieb = document.getElementById('checkVertrieb');
    const checkPva = document.getElementById('checkPva');

    if (mode === 'vertrieb') {
        if (profileName) profileName.textContent = 'Eike Brenneisen';
        if (profileRole) profileRole.textContent = 'Vertriebssteuerung';
        if (checkVertrieb) checkVertrieb.style.display = 'block';
        if (checkPva) checkPva.style.display = 'none';
    } else if (mode === 'pva') {
        if (profileName) profileName.textContent = 'Anja Schneider';
        if (profileRole) profileRole.textContent = 'Sales Operations';
        if (checkVertrieb) checkVertrieb.style.display = 'none';
        if (checkPva) checkPva.style.display = 'block';
    }

    // Update profile avatar based on mode
    updateProfileAvatar(mode);

    // Update navigation boxes
    updateNavigationBoxes(mode);

    // Close dropdown
    const dropdown = document.getElementById('profileDropdown');
    const arrow = document.getElementById('profileArrow');
    if (dropdown) dropdown.classList.remove('show');
    if (arrow) arrow.classList.remove('open');

    // Update welcome message
    updateWelcomeMessage(mode);
}

// Update Navigation Boxes based on mode
function updateNavigationBoxes(mode) {
    const navBoxContainer = document.querySelector('.navigation-boxes');
    if (!navBoxContainer) return;

    if (mode === 'vertrieb') {
        navBoxContainer.innerHTML = `
            <button class="nav-box" onclick="openAgenturView()">
                <svg class="nav-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Agenturansicht</span>
            </button>
            <button class="nav-box" onclick="openDashboard()">
                <svg class="nav-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                </svg>
                <span>Gesamtübersicht</span>
            </button>
            <button class="nav-box" onclick="openPotentialAnalyse()">
                <svg class="nav-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path>
                    <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                    <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                    <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <span>Potentialanalyse</span>
            </button>
        `;
    } else if (mode === 'pva') {
        navBoxContainer.innerHTML = `
            <button class="nav-box" onclick="openOffeneVorgaenge()">
                <svg class="nav-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>Übersicht offene Vorgänge</span>
            </button>
            <button class="nav-box" onclick="openAbrechnungspruefung()">
                <svg class="nav-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                <span>Abrechnungsprüfung</span>
            </button>
            <button class="nav-box" onclick="openValidierungProvision()">
                <svg class="nav-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Validierung Provisionsberechnung</span>
            </button>
        `;
    }
}

// Update Welcome Message based on mode
function updateWelcomeMessage(mode) {
    const chatBubble = document.querySelector('.welcome-message .chat-bubble p strong');
    if (chatBubble) {
        if (mode === 'vertrieb') {
            chatBubble.textContent = 'Willkommen zurück Eike, was kann ich für dich tun?';
        } else if (mode === 'pva') {
            chatBubble.textContent = 'Willkommen zurück Anja, was kann ich für dich tun?';
        }
    }
}

// Update Profile Avatar based on mode
function updateProfileAvatar(mode) {
    console.log('📷 updateProfileAvatar aufgerufen für Modus:', mode);
    const profileAvatarImg = document.getElementById('profileAvatarImg');
    if (!profileAvatarImg) {
        console.error('❌ profileAvatarImg Element nicht gefunden!');
        return;
    }

    const savedImage = localStorage.getItem(`userProfileImage_${mode}`);
    console.log('📷 Gespeichertes Bild vorhanden:', savedImage ? 'JA (' + savedImage.substring(0, 50) + '...)' : 'NEIN');

    if (savedImage) {
        profileAvatarImg.src = savedImage;
        console.log('✅ Haupt-Avatar auf gespeichertes Bild gesetzt');
    } else {
        profileAvatarImg.src = 'assets/images/default-profile.svg';
        console.log('ℹ️ Haupt-Avatar auf Standard-Bild gesetzt');
    }
}

// ========================================
// USER PROFILE IMAGE UPLOAD
// ========================================

let currentUploadTarget = 'vertrieb'; // Which user profile to upload to

// Trigger upload from main profile avatar
function triggerUserProfileUpload(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    currentUploadTarget = currentUserMode;
    console.log('📷 Trigger Upload für:', currentUploadTarget);

    const input = document.getElementById('userProfileUpload');
    if (input) {
        input.click();
    } else {
        console.error('❌ Upload input nicht gefunden');
    }
}

// Trigger upload from dropdown avatar
function triggerUserProfileUploadFor(mode, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    currentUploadTarget = mode;
    console.log('📷 Trigger Upload für (dropdown):', currentUploadTarget);

    const input = document.getElementById('userProfileUploadDropdown');
    if (input) {
        input.click();
    } else {
        console.error('❌ Dropdown Upload input nicht gefunden');
    }
}

// Handle upload from main profile
function handleUserProfileUpload(event) {
    console.log('📷 Handle Upload Event');
    const file = event.target.files[0];
    if (file) {
        console.log('📷 Datei ausgewählt:', file.name);
        processUserProfileImage(file, currentUploadTarget);
    }
    event.target.value = '';
}

// Handle upload from dropdown
function handleUserProfileUploadDropdown(event) {
    console.log('📷 Handle Dropdown Upload Event');
    const file = event.target.files[0];
    if (file) {
        console.log('📷 Datei ausgewählt:', file.name);
        processUserProfileImage(file, currentUploadTarget);
    }
    event.target.value = '';
}

// Process and save user profile image (mit Komprimierung)
function processUserProfileImage(file, mode) {
    const reader = new FileReader();
    reader.onload = function(e) {
        // Komprimiere das Bild bevor es gespeichert wird
        compressImage(e.target.result, 150, 0.8, function(compressedData) {
            try {
                // Save to localStorage
                localStorage.setItem(`userProfileImage_${mode}`, compressedData);

                // Update all relevant images
                updateAllUserProfileImages(mode, compressedData);

                console.log(`✅ Profilbild für ${mode} gespeichert (komprimiert)`);
            } catch (error) {
                console.error('❌ Fehler beim Speichern:', error);
                alert('Das Bild konnte nicht gespeichert werden. Bitte versuche ein kleineres Bild.');
            }
        });
    };
    reader.readAsDataURL(file);
}

// Komprimiert ein Bild auf eine maximale Größe
function compressImage(dataUrl, maxSize, quality, callback) {
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Skaliere auf maxSize (Quadrat für Avatar)
        if (width > height) {
            if (width > maxSize) {
                height = Math.round(height * maxSize / width);
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = Math.round(width * maxSize / height);
                height = maxSize;
            }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Konvertiere zu komprimiertem JPEG
        const compressedData = canvas.toDataURL('image/jpeg', quality);
        console.log(`📷 Bild komprimiert: ${Math.round(dataUrl.length/1024)}KB → ${Math.round(compressedData.length/1024)}KB`);

        callback(compressedData);
    };
    img.src = dataUrl;
}

// Update all profile images for a given mode
function updateAllUserProfileImages(mode, imageData) {
    console.log('📷 Update Bilder für Modus:', mode);

    // Update dropdown option avatar
    const avatarId = mode === 'vertrieb' ? 'optionAvatarVertrieb' : 'optionAvatarPva';
    const optionAvatar = document.getElementById(avatarId);
    console.log('📷 Dropdown Avatar Element:', avatarId, optionAvatar ? 'gefunden' : 'NICHT GEFUNDEN');

    if (optionAvatar) {
        optionAvatar.src = imageData;
        console.log('✅ Dropdown Avatar aktualisiert');
    }

    // Update main profile avatar if this mode is currently active
    if (mode === currentUserMode) {
        const profileAvatarImg = document.getElementById('profileAvatarImg');
        if (profileAvatarImg) {
            profileAvatarImg.src = imageData;
            console.log('✅ Haupt-Avatar aktualisiert');
        }
    } else {
        console.log('ℹ️ Haupt-Avatar nicht aktualisiert (anderer Modus aktiv:', currentUserMode, ')');
    }
}

// Load saved user profile images on page load
function loadUserProfileImages() {
    console.log('📷 loadUserProfileImages aufgerufen');

    // Load Vertrieb profile
    const vertriebImage = localStorage.getItem('userProfileImage_vertrieb');
    console.log('📷 Vertrieb Bild in localStorage:', vertriebImage ? 'JA' : 'NEIN');
    if (vertriebImage) {
        const optionVertrieb = document.getElementById('optionAvatarVertrieb');
        if (optionVertrieb) {
            optionVertrieb.src = vertriebImage;
            console.log('✅ Vertrieb Dropdown-Avatar geladen');
        }
    }

    // Load PVA profile
    const pvaImage = localStorage.getItem('userProfileImage_pva');
    console.log('📷 PVA (Anja) Bild in localStorage:', pvaImage ? 'JA' : 'NEIN');
    if (pvaImage) {
        const optionPva = document.getElementById('optionAvatarPva');
        console.log('📷 optionAvatarPva Element:', optionPva ? 'gefunden' : 'NICHT GEFUNDEN');
        if (optionPva) {
            optionPva.src = pvaImage;
            console.log('✅ PVA (Anja) Dropdown-Avatar geladen');
        }
    }

    // Update main avatar for current mode
    updateProfileAvatar(currentUserMode);
}

// PVA Mode Functions

// Offene Vorgänge (placeholder)
function openOffeneVorgaenge() {
    alert('Übersicht offene Vorgänge - In Entwicklung');
}

// Abrechnungsprüfung - Opens in new tab (iframe blocked by target site)
function openAbrechnungspruefung() {
    window.open('https://billingcheck.pages.dev/app', '_blank');
}

// Validierung Provisionsberechnung (placeholder)
function openValidierungProvision() {
    alert('Validierung Provisionsberechnung - In Entwicklung');
}

// ========================================
// INIT
// ========================================

// Erweitere den DOMContentLoaded
const originalDOMContentLoaded = window.onload;

window.addEventListener('load', function() {
    // Lade gespeicherte Bilder
    loadSavedImages();

    // Upload-Modus standardmäßig aktivieren
    initUploadMode();

    // Setup Autocomplete
    setupAutocomplete();

    // Lade User-Profilbilder
    loadUserProfileImages();
});

// Global verfügbar machen
window.toggleUploadMode = toggleUploadMode;
window.triggerLogoUpload = triggerLogoUpload;
window.handleLogoUpload = handleLogoUpload;
window.triggerProfileUpload = triggerProfileUpload;
window.triggerAgenturPhotoUpload = triggerAgenturPhotoUpload;
window.handleAgenturPhotoUpload = handleAgenturPhotoUpload;
window.openPotentialAnalyse = openPotentialAnalyse;
window.openPotentialAnalyseWithFilter = openPotentialAnalyseWithFilter;
window.closePotentialAnalyse = closePotentialAnalyse;
window.showEigeneDaten = showEigeneDaten;
window.showFidaDaten = showFidaDaten;
window.selectSuggestion = selectSuggestion;
window.selectAgentSuggestion = selectAgentSuggestion;
window.selectPotentialSuggestion = selectPotentialSuggestion;
window.filterPotentials = filterPotentials;
window.openKundenDetail = openKundenDetail;
window.closeKundenDetail = closeKundenDetail;
window.toggleKundenFida = toggleKundenFida;
window.initUploadMode = initUploadMode;
window.exportImagesForGitHub = exportImagesForGitHub;
window.toggleProfileDropdown = toggleProfileDropdown;
window.switchUserMode = switchUserMode;
window.openOffeneVorgaenge = openOffeneVorgaenge;
window.openAbrechnungspruefung = openAbrechnungspruefung;
window.openValidierungProvision = openValidierungProvision;
window.triggerUserProfileUpload = triggerUserProfileUpload;
window.triggerUserProfileUploadFor = triggerUserProfileUploadFor;
window.handleUserProfileUpload = handleUserProfileUpload;
window.handleUserProfileUploadDropdown = handleUserProfileUploadDropdown;
window.loadUserProfileImages = loadUserProfileImages;

console.log('✅ landing.js geladen');