/**
 * Versicherung Navigation Module
 * ES6 Module for dashboard navigation (ES2024)
 */

// ========================================
// DASHBOARD NAVIGATION
// ========================================

// Note: openDashboard is exported from data.js (uses landingPage, mainApp correctly)
// This function is kept for compatibility but data.js version is preferred

export function backToLanding() {
    const mainApp = document.getElementById('mainApp');
    const landingPage = document.getElementById('landingPage');
    const risikoModule = document.getElementById('risikoscoringModule');
    const bestandModule = document.getElementById('bestandsuebertragungModule');
    const agenturOverview = document.getElementById('agenturOverview');

    if (mainApp) mainApp.style.display = 'none';
    if (landingPage) landingPage.style.display = 'flex';
    if (risikoModule) risikoModule.style.display = 'none';
    if (bestandModule) bestandModule.style.display = 'none';
    if (agenturOverview) agenturOverview.style.display = 'none';

    setNavigationEnabled(false);
    document.body.classList.remove('dashboard-active');
}

export function setNavigationEnabled(enabled) {
    const navItems = document.querySelectorAll('.sidebar .nav-item, .sidebar .dropdown-header');
    navItems.forEach(item => {
        if (enabled) {
            item.classList.remove('disabled');
            item.removeAttribute('tabindex');
        } else {
            item.classList.add('disabled');
            item.setAttribute('tabindex', '-1');
        }
    });
}

// ========================================
// AGENTUR VIEW
// ========================================

export function openAgenturView() {
    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    const agenturOverview = document.getElementById('agenturOverview');

    if (landingPage) landingPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'none';
    if (agenturOverview) agenturOverview.style.display = 'block';

    // Get active agent ID - getActiveAgentId returns first agent or default if none selected
    const activeAgentId = window.getActiveAgentId?.() ?? 'VM-2024-0001';
    if (typeof window.showAgenturOverview === 'function') {
        window.showAgenturOverview(activeAgentId);
    }
}

export function backToGesamtsicht() {
    const mainApp = document.getElementById('mainApp');
    const agenturOverview = document.getElementById('agenturOverview');

    if (agenturOverview) agenturOverview.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
}

// ========================================
// RISIKOSCORING MODULE
// ========================================

export async function openRisikoscoring() {
    const landingPage = document.getElementById('landingPage');
    const risikoModule = document.getElementById('risikoscoringModule');
    const mainApp = document.getElementById('mainApp');
    const agenturOverview = document.getElementById('agenturOverview');

    if (landingPage) landingPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'none';
    if (agenturOverview) agenturOverview.style.display = 'none';

    if (risikoModule) {
        if (!risikoModule.innerHTML.trim() || risikoModule.innerHTML.includes('Lädt')) {
            risikoModule.innerHTML = '<div class="loading-module">Lädt Risikoscoring...</div>';

            try {
                const response = await fetch('partials/risikoscoring-module.html');
                if (response.ok) {
                    risikoModule.innerHTML = await response.text();
                    window.initRisikoscoring?.();
                } else {
                    risikoModule.innerHTML = '<div class="error-module">Fehler beim Laden des Risikoscoring-Moduls</div>';
                }
            } catch (error) {
                console.error('Risikoscoring loading error:', error);
                risikoModule.innerHTML = '<div class="error-module">Fehler beim Laden</div>';
            }
        }

        risikoModule.style.display = 'block';
    }
}

export function closeRisikoscoring() {
    const risikoModule = document.getElementById('risikoscoringModule');
    const mainApp = document.getElementById('mainApp');

    if (risikoModule) risikoModule.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
}

// ========================================
// BESTANDSUEBERTRAGUNG MODULE
// ========================================

export async function openBestandsuebertragung() {
    const landingPage = document.getElementById('landingPage');
    const bestandModule = document.getElementById('bestandsuebertragungModule');
    const mainApp = document.getElementById('mainApp');
    const agenturOverview = document.getElementById('agenturOverview');
    const risikoModule = document.getElementById('risikoscoringModule');

    if (landingPage) landingPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'none';
    if (agenturOverview) agenturOverview.style.display = 'none';
    if (risikoModule) risikoModule.style.display = 'none';

    if (bestandModule) {
        if (!bestandModule.innerHTML.trim() || bestandModule.innerHTML.includes('Lädt')) {
            bestandModule.innerHTML = '<div class="loading-module">Lädt Bestandsübertragung...</div>';

            try {
                const response = await fetch('partials/bestandsuebertragung-module.html');
                if (response.ok) {
                    bestandModule.innerHTML = await response.text();
                    window.initBestandsuebertragung?.();
                } else {
                    bestandModule.innerHTML = '<div class="error-module">Fehler beim Laden</div>';
                }
            } catch (error) {
                console.error('Bestandsuebertragung loading error:', error);
                bestandModule.innerHTML = '<div class="error-module">Fehler beim Laden</div>';
            }
        }

        bestandModule.style.display = 'block';
    }
}

export function closeBestandsuebertragung() {
    const bestandModule = document.getElementById('bestandsuebertragungModule');
    const mainApp = document.getElementById('mainApp');

    if (bestandModule) bestandModule.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
}

// ========================================
// SETTINGS
// ========================================

export function toggleSettings() {
    const settingsContent = document.getElementById('settingsContent');
    settingsContent?.classList.toggle('open');
}

export function saveUserName() {
    const input = document.getElementById('userNameInput');
    const name = input?.value?.trim();

    if (name) {
        localStorage.setItem('dashboardUserName', name);
        updateUserNameDisplay(name);

        const settingsContent = document.getElementById('settingsContent');
        settingsContent?.classList.remove('open');
    }
}

export function loadUserName() {
    const savedName = localStorage.getItem('dashboardUserName');
    if (savedName) {
        updateUserNameDisplay(savedName);
        const input = document.getElementById('userNameInput');
        if (input) input.value = savedName;
    }
}

function updateUserNameDisplay(name) {
    const displayEls = document.querySelectorAll('.user-name-display, #headerUserName');
    displayEls.forEach(el => {
        if (el) el.textContent = name;
    });
}

// ========================================
// EXTERNAL TOOLS
// ========================================

export function openAbrechnungspruefung() {
    window.open('https://billingcheck.pages.dev/', '_blank');
}

export function openValidierungProvision() {
    window.open('https://vstboard.pages.dev/provision-validation.html', '_blank');
}

// ========================================
// FINANZPLANUNG & PROVISIONSSIMULATION
// ========================================

export function openFinanzplanung() {
    // Finanzplanung is a tab within customer detail view
    // Show an info message that a customer needs to be selected first
    const kundenDetailPage = document.getElementById('kundenDetailPage');
    if (kundenDetailPage && kundenDetailPage.style.display !== 'none') {
        // If already in customer detail, switch to finanzplanung tab
        window.switchKundenTab?.('finanzplanung');
    } else {
        alert('Bitte wählen Sie zuerst einen Kunden aus, um die Finanzplanung zu öffnen.');
    }
}

export function openProvisionssimulation() {
    // Navigate to the standalone Provisionssimulation page
    window.location.href = 'Provisionssimulation.html';
}

// ========================================
// OFFENE VORGÄNGE
// ========================================

export function openOffeneVorgaenge() {
    alert('Übersicht offene Vorgänge - In Entwicklung');
}

// ========================================
// PROFILE DROPDOWN
// ========================================

let currentUserMode = 'vertrieb';

export function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    const arrow = document.getElementById('profileArrow');

    if (dropdown && arrow) {
        dropdown.classList.toggle('show');
        arrow.classList.toggle('open');
    }
}

export function switchUserMode(mode) {
    currentUserMode = mode;

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

    updateProfileAvatar(mode);
    updateNavigationBoxes(mode);

    const dropdown = document.getElementById('profileDropdown');
    const arrowEl = document.getElementById('profileArrow');
    if (dropdown) dropdown.classList.remove('show');
    if (arrowEl) arrowEl.classList.remove('open');

    updateWelcomeMessage(mode);
}

export function updateNavigationBoxes(mode) {
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

export function updateWelcomeMessage(mode) {
    const chatBubble = document.querySelector('.welcome-message .chat-bubble p strong');
    if (chatBubble) {
        if (mode === 'vertrieb') {
            chatBubble.textContent = 'Willkommen zurück Eike, was kann ich für dich tun?';
        } else if (mode === 'pva') {
            chatBubble.textContent = 'Willkommen zurück Anja, was kann ich für dich tun?';
        }
    }
}

export function updateProfileAvatar(mode) {
    const profileAvatarImg = document.getElementById('profileAvatarImg');
    if (!profileAvatarImg) return;

    const savedImage = localStorage.getItem(`userProfileImage_${mode}`);
    if (savedImage) {
        profileAvatarImg.src = savedImage;
    } else {
        profileAvatarImg.src = 'assets/images/default-profile.svg';
    }
}

// ========================================
// USER PROFILE IMAGE UPLOAD
// ========================================

let currentUploadTarget = 'vertrieb';

export function triggerUserProfileUpload(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    currentUploadTarget = currentUserMode;

    const input = document.getElementById('userProfileUpload');
    if (input) input.click();
}

export function triggerUserProfileUploadFor(mode, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    currentUploadTarget = mode;

    const input = document.getElementById('userProfileUploadDropdown');
    if (input) input.click();
}

export function handleUserProfileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        processUserProfileImage(file, currentUploadTarget);
    }
    event.target.value = '';
}

export function handleUserProfileUploadDropdown(event) {
    const file = event.target.files[0];
    if (file) {
        processUserProfileImage(file, currentUploadTarget);
    }
    event.target.value = '';
}

export function processUserProfileImage(file, mode) {
    const reader = new FileReader();
    reader.onload = function(e) {
        compressImage(e.target.result, 150, 0.8, function(compressedData) {
            try {
                localStorage.setItem(`userProfileImage_${mode}`, compressedData);
                updateAllUserProfileImages(mode, compressedData);
            } catch (error) {
                console.error('Fehler beim Speichern:', error);
                alert('Bild konnte nicht gespeichert werden (zu groß)');
            }
        });
    };
    reader.readAsDataURL(file);
}

export function compressImage(dataUrl, maxSize, quality, callback) {
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > maxSize) {
                height = Math.round((height * maxSize) / width);
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = Math.round((width * maxSize) / height);
                height = maxSize;
            }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        callback(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
}

export function updateAllUserProfileImages(mode, imageData) {
    if (mode === currentUserMode) {
        const mainAvatar = document.getElementById('profileAvatarImg');
        if (mainAvatar) mainAvatar.src = imageData;
    }

    const dropdownAvatar = document.getElementById(`dropdownAvatar${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
    if (dropdownAvatar) dropdownAvatar.src = imageData;
}

export function loadUserProfileImages() {
    ['vertrieb', 'pva'].forEach(mode => {
        const savedImage = localStorage.getItem(`userProfileImage_${mode}`);
        if (savedImage) {
            const dropdownAvatar = document.getElementById(`dropdownAvatar${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
            if (dropdownAvatar) dropdownAvatar.src = savedImage;
        }
    });
    updateProfileAvatar(currentUserMode);
}

// ========================================
// UTILITIES
// ========================================

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getCurrentUserMode() {
    return currentUserMode;
}
