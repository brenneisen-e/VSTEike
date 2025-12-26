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

// Validierung Provisionsberechnung - Opens in new tab
function openValidierungProvision() {
    window.open('https://provisions-analyzer.pages.dev/', '_blank');
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
