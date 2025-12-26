let risikoscoringLoaded = false;

async function openRisikoscoring() {
    console.log('📊 Risikoscoring öffnen...');

    // Hide landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'none';
    }

    // Hide main app if visible
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.style.display = 'none';
    }

    // Hide banken module if visible
    const bankenModule = document.getElementById('bankenModule');
    if (bankenModule) {
        bankenModule.style.display = 'none';
    }

    // Show risikoscoring module
    const rsModule = document.getElementById('risikoscoringModule');
    if (rsModule) {
        rsModule.style.display = 'block';

        // Load content if not already loaded
        if (!risikoscoringLoaded) {
            try {
                const response = await fetch('partials/risikoscoring-module.html');
                if (response.ok) {
                    const html = await response.text();
                    rsModule.innerHTML = html;
                    risikoscoringLoaded = true;

                    // Initialize the module
                    if (typeof initRisikoscoring === 'function') {
                        initRisikoscoring();
                    }
                    console.log('✅ Risikoscoring Modul geladen');
                } else {
                    rsModule.innerHTML = '<div class="error-message">Fehler beim Laden des Risikoscoring-Moduls</div>';
                }
            } catch (error) {
                console.error('Error loading risikoscoring module:', error);
                rsModule.innerHTML = '<div class="error-message">Fehler beim Laden des Risikoscoring-Moduls</div>';
            }
        }
    }
}

function closeRisikoscoring() {
    console.log('📊 Risikoscoring schließen...');

    // Hide risikoscoring module
    const rsModule = document.getElementById('risikoscoringModule');
    if (rsModule) {
        rsModule.style.display = 'none';
    }

    // Show landing page (use flex for proper centering)
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'flex';
    }
}

// ========================================
// BESTANDSUEBERTRAGUNG MODULE
// ========================================

let bestandsuebertragungLoaded = false;

async function openBestandsuebertragung() {
    console.log('📄 Bestandsübertragung öffnen...');

    // Hide landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'none';
    }

    // Hide main app if visible
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.style.display = 'none';
    }

    // Hide other modules
    const bankenModule = document.getElementById('bankenModule');
    if (bankenModule) {
        bankenModule.style.display = 'none';
    }

    const rsModule = document.getElementById('risikoscoringModule');
    if (rsModule) {
        rsModule.style.display = 'none';
    }

    // Show bestandsuebertragung module
    const bestandModule = document.getElementById('bestandsuebertragungModule');
    if (bestandModule) {
        bestandModule.style.display = 'block';

        // Load content if not already loaded
        if (!bestandsuebertragungLoaded) {
            try {
                const response = await fetch('partials/bestandsuebertragung-module.html');
                if (response.ok) {
                    const html = await response.text();
                    bestandModule.innerHTML = html;
                    bestandsuebertragungLoaded = true;

                    // Initialize the bestandsuebertragung app
                    if (typeof initBestandApp === 'function') {
                        initBestandApp();
                    } else if (typeof BestandApp !== 'undefined' && typeof BestandApp.init === 'function') {
                        BestandApp.init();
                    }
                    console.log('✅ Bestandsübertragung Modul geladen');
                } else {
                    bestandModule.innerHTML = '<div class="error-message">Fehler beim Laden des Bestandsübertragung-Moduls</div>';
                }
            } catch (error) {
                console.error('Error loading bestandsuebertragung module:', error);
                bestandModule.innerHTML = '<div class="error-message">Fehler beim Laden des Bestandsübertragung-Moduls</div>';
            }
        }
    }
}

function closeBestandsuebertragung() {
    console.log('📄 Bestandsübertragung schließen...');

    // Hide bestandsuebertragung module
    const bestandModule = document.getElementById('bestandsuebertragungModule');
    if (bestandModule) {
        bestandModule.style.display = 'none';
    }

    // Show landing page (use flex for proper centering)
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'flex';
    }
}

// ========================================
// AUTO-LOAD CSV MOCK DATA
// ========================================

/**
 * Lädt automatisch die Standard-CSV-Daten beim Start
 */
async function loadDefaultCSVData() {
    console.log('📊 Lade Standard-CSV-Daten...');

    // Start loading animation
    updateMainLoadingProgress(10, 'Initialisiere Anwendung...');
    await sleep(200);

    updateMainLoadingProgress(25, 'Lade Ressourcen...');
    await sleep(300);

    // Lokale CSV-Datei (im data-Ordner)
    const localCsvPath = 'data/mock-data.csv';

    try {
        updateMainLoadingProgress(40, 'Lade Kundendaten...');
        const response = await fetch(localCsvPath);

        if (!response.ok) {
            throw new Error('Lokale CSV nicht gefunden');
        }

        updateMainLoadingProgress(60, 'Verarbeite Datensätze...');
        await sleep(200);
        const csvText = await response.text();

        updateMainLoadingProgress(75, 'Analysiere Daten...');
        await sleep(200);
        processCSVData(csvText);

        updateMainLoadingProgress(80, 'Lade Feedback-Kommentare...');
        await loadFeedbackData();

        updateMainLoadingProgress(95, 'Erstelle Dashboard...');
        await sleep(300);

        updateMainLoadingProgress(100, 'Fertig!');
        await sleep(400);

        console.log('✅ Alle Daten geladen');

    } catch (error) {
        console.warn('⚠️ Fehler beim Laden der CSV-Daten:', error);
        updateMainLoadingProgress(90, 'Lade Feedback-Kommentare...');
        await loadFeedbackData();
        updateMainLoadingProgress(100, 'Bereit');
        await sleep(500);
        console.log('ℹ️ Daten können manuell über Settings > CSV Upload geladen werden');
    }
}

/**
 * Lädt die Feedback-Kommentare von Cloudflare
 */
async function loadFeedbackData() {
    const FEEDBACK_API_URL = 'https://vsteike-feedback.eike-3e2.workers.dev';
    try {
        const response = await fetch(`${FEEDBACK_API_URL}/feedback`);
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                window.preloadedFeedback = result.data;
                console.log(`✅ ${result.data.length} Feedback-Kommentare geladen`);
            }
        }
    } catch (error) {
        console.warn('Feedback konnte nicht vorgeladen werden:', error);
    }
}

// Helper function for delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Aktualisiert den Ladefortschritt (Balken + Text + Prozent)
 */
function updateMainLoadingProgress(percent, text) {
    const progressBar = document.getElementById('mainProgressBar');
    const statusText = document.getElementById('loadingStatus');
    const percentText = document.getElementById('loadingPercent');

    console.log(`📊 Loading: ${percent}% - ${text}`);
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (statusText) statusText.textContent = text;
    if (percentText) percentText.textContent = `${percent}%`;
}

// Legacy function for backwards compatibility
function updateLoadingText(text) {
    const statusText = document.getElementById('loadingStatus');
    if (statusText) {
        statusText.textContent = text;
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

            // Aggregiere zu Monatsdaten für state.uploadedData
            if (typeof aggregateDailyToMonthly === 'function') {
                const monthlyData = aggregateDailyToMonthly(parsedData);
                state.uploadedData = monthlyData;
                state.useUploadedData = true;
            }

            console.log('✅ CSV-Daten geladen:', parsedData.length, 'Datensätze');

            // Aktualisiere Filter-Dropdowns
            if (typeof updateAgenturFilterDropdown === 'function') {
                updateAgenturFilterDropdown();
            }

            // Aktualisiere KPIs und Charts
            if (typeof updateAllKPIs === 'function') {
                updateAllKPIs();
            }

            // Aktualisiere Karte falls vorhanden
            if (typeof countyMapHandler !== 'undefined' && countyMapHandler && typeof getFilteredData === 'function') {
                const data = getFilteredData();
                countyMapHandler.updateMapData(data);
            }

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
• **KI-Analysen** - Stelle Fragen zu deinen Daten (powered by Claude AI)

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

