/**
 * Versicherung Navigation Module
 * ES6 Module for dashboard navigation (ES2024)
 */

// ========================================
// DASHBOARD NAVIGATION
// ========================================

export function openDashboard() {
    const dashboardPage = document.getElementById('dashboard-page');
    const landingPage = document.getElementById('landing-page');
    const sidebar = document.querySelector('.sidebar');

    if (landingPage) landingPage.classList.add('hidden');
    if (dashboardPage) dashboardPage.classList.remove('hidden');
    if (sidebar) sidebar.classList.add('visible');

    setNavigationEnabled(true);
    document.body.classList.add('dashboard-active');

    window.initCharts?.();
    window.initChatBot?.();
    window.setupChatManually?.();

    console.log('📊 Dashboard geöffnet');
}

export function backToLanding() {
    const dashboardPage = document.getElementById('dashboard-page');
    const landingPage = document.getElementById('landing-page');
    const sidebar = document.querySelector('.sidebar');
    const risikoModule = document.getElementById('risikoscoring-module');
    const bestandModule = document.getElementById('bestandsuebertragung-module');

    if (dashboardPage) dashboardPage.classList.add('hidden');
    if (landingPage) landingPage.classList.remove('hidden');
    if (sidebar) sidebar.classList.remove('visible');
    if (risikoModule) risikoModule.style.display = 'none';
    if (bestandModule) bestandModule.style.display = 'none';

    setNavigationEnabled(false);
    document.body.classList.remove('dashboard-active');

    console.log('🏠 Zurück zur Landing Page');
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
    document.getElementById('main-dashboard')?.classList.add('hidden');
    document.getElementById('agentur-overview-page')?.classList.remove('hidden');

    const activeAgentId = window.getActiveAgentId?.();
    if (activeAgentId && typeof window.showAgenturOverview === 'function') {
        window.showAgenturOverview(activeAgentId);
    }

    console.log('👤 Agentursicht geöffnet');
}

export function backToGesamtsicht() {
    document.getElementById('agentur-overview-page')?.classList.add('hidden');
    document.getElementById('main-dashboard')?.classList.remove('hidden');

    console.log('📊 Zurück zur Gesamtsicht');
}

// ========================================
// RISIKOSCORING MODULE
// ========================================

export async function openRisikoscoring() {
    const risikoModule = document.getElementById('risikoscoring-module');
    const mainDashboard = document.getElementById('main-dashboard');
    const agenturPage = document.getElementById('agentur-overview-page');

    if (mainDashboard) mainDashboard.classList.add('hidden');
    if (agenturPage) agenturPage.classList.add('hidden');

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

    console.log('📊 Risikoscoring geöffnet');
}

export function closeRisikoscoring() {
    const risikoModule = document.getElementById('risikoscoring-module');
    const mainDashboard = document.getElementById('main-dashboard');

    if (risikoModule) risikoModule.style.display = 'none';
    if (mainDashboard) mainDashboard.classList.remove('hidden');

    console.log('❌ Risikoscoring geschlossen');
}

// ========================================
// BESTANDSUEBERTRAGUNG MODULE
// ========================================

export async function openBestandsuebertragung() {
    const bestandModule = document.getElementById('bestandsuebertragung-module');
    const mainDashboard = document.getElementById('main-dashboard');
    const agenturPage = document.getElementById('agentur-overview-page');
    const risikoModule = document.getElementById('risikoscoring-module');

    if (mainDashboard) mainDashboard.classList.add('hidden');
    if (agenturPage) agenturPage.classList.add('hidden');
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

    console.log('📦 Bestandsübertragung geöffnet');
}

export function closeBestandsuebertragung() {
    const bestandModule = document.getElementById('bestandsuebertragung-module');
    const mainDashboard = document.getElementById('main-dashboard');

    if (bestandModule) bestandModule.style.display = 'none';
    if (mainDashboard) mainDashboard.classList.remove('hidden');

    console.log('❌ Bestandsübertragung geschlossen');
}

// ========================================
// SETTINGS
// ========================================

export function toggleSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    settingsPanel?.classList.toggle('open');
}

export function saveUserName() {
    const input = document.getElementById('userNameInput');
    const name = input?.value?.trim();

    if (name) {
        localStorage.setItem('dashboardUserName', name);
        updateUserNameDisplay(name);

        const settingsPanel = document.getElementById('settingsPanel');
        settingsPanel?.classList.remove('open');

        console.log('✅ Benutzername gespeichert:', name);
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
