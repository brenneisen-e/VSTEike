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

    const activeAgentId = window.getActiveAgentId?.();
    if (activeAgentId && typeof window.showAgenturOverview === 'function') {
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
