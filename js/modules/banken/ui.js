/**
 * Banken UI Module
 * ES6 Module for header dropdowns, alerts, notifications
 */

// ========================================
// HEADER DROPDOWNS
// ========================================

export function toggleHeaderDropdown(menuId) {
    const dropdown = document.getElementById(`dropdown-${menuId}`);
    const trigger = dropdown?.previousElementSibling;

    document.querySelectorAll('.header-dropdown-menu').forEach(menu => {
        if (menu.id !== `dropdown-${menuId}`) {
            menu.classList.remove('open');
            menu.previousElementSibling?.classList.remove('active');
        }
    });

    dropdown?.classList.toggle('open');
    trigger?.classList.toggle('active');
}

export function closeHeaderDropdowns() {
    document.querySelectorAll('.header-dropdown-menu').forEach(menu => {
        menu.classList.remove('open');
        menu.previousElementSibling?.classList.remove('active');
    });
}

// Auto-close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-dropdown-container')) {
        closeHeaderDropdowns();
    }
});

// ========================================
// ALERTS
// ========================================

export function dismissAlert(alertId) {
    document.getElementById(alertId)?.style.setProperty('display', 'none');
}

export function showOverdueCases() {
    window.showBankenSection?.('aufgaben');
    window.showNotification?.('23 überfällige Fälle werden angezeigt', 'warning');
}

// ========================================
// NOTIFICATIONS
// ========================================

export function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification-toast');
    existingNotification?.remove();

    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;

    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    notification.innerHTML = `
        <div class="notification-icon">${icons[type] ?? icons.info}</div>
        <div class="notification-content">${message}</div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    document.body.appendChild(notification);

    requestAnimationFrame(() => notification.classList.add('show'));

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ========================================
// MODULE SWITCHING
// ========================================

let bankenModuleLoaded = false;

export function switchModule(moduleName) {
    console.log(`[MODULE] Switching to: ${moduleName}`);

    document.querySelectorAll('.module-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.module === moduleName);
    });

    document.querySelectorAll('.module-content').forEach(content => {
        const isTarget = content.id === `${moduleName}Module`;
        content.classList.toggle('active', isTarget);
        if (isTarget) {
            console.log(`[MODULE] Activated: ${content.id}`);
        }
    });

    localStorage.setItem('currentModule', moduleName);

    if (moduleName === 'banken' && !bankenModuleLoaded) {
        console.log('[MODULE] Loading Banken module for first time...');
        window.loadBankenModule?.();
        bankenModuleLoaded = true;
    }
}

export function initModuleSelector() {
    const savedModule = localStorage.getItem('currentModule') ?? 'versicherung';
    switchModule(savedModule);
}

// ========================================
// COMPONENT LOADING
// ========================================

const BANKEN_COMPONENTS = [
    'header', 'section-segmentierung', 'section-npl', 'section-stage2',
    'section-aufgaben', 'modal-customer-detail', 'modal-document-scanner', 'crm-profile-view',
    'chat-widget'
];

export async function loadComponent(componentName) {
    try {
        console.log(`[BANKEN] Loading component: ${componentName}`);
        const response = await fetch(`partials/banken/${componentName}.html`);
        if (!response.ok) {
            console.warn(`[BANKEN] Failed to load ${componentName}: ${response.status}`);
            return `<!-- Component ${componentName} failed: ${response.status} -->`;
        }
        const html = await response.text();
        console.log(`[BANKEN] Loaded ${componentName} (${html.length} bytes)`);
        return html;
    } catch (error) {
        console.error(`[BANKEN] Error loading ${componentName}:`, error);
        return `<!-- Component ${componentName} error: ${error.message} -->`;
    }
}

export async function loadBankenComponents(container) {
    console.log('[BANKEN] Starting component loading...');
    showLoadingProgress(container);

    const htmlParts = [];
    for (let i = 0; i < BANKEN_COMPONENTS.length; i++) {
        const name = BANKEN_COMPONENTS[i];
        updateBankenLoadingProgress((i / BANKEN_COMPONENTS.length) * 100, `Lädt ${name}...`);
        const html = await loadComponent(name);
        htmlParts.push(html);
    }

    console.log('[BANKEN] All components loaded, rendering...');
    updateBankenLoadingProgress(100, 'Rendering...');
    container.innerHTML = htmlParts.join('');

    console.log('[BANKEN] Components rendered successfully');
    window.restoreCollapsedSections?.();
}

function showLoadingProgress(container) {
    container.innerHTML = `
        <div class="banken-loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">Banken-Modul wird geladen...</div>
            <div class="loading-progress"><div class="loading-progress-bar" style="width: 0%"></div></div>
        </div>
    `;
}

function updateBankenLoadingProgress(percent, text) {
    const bar = document.querySelector('.loading-progress-bar');
    const textEl = document.querySelector('.loading-text');
    if (bar) bar.style.width = `${percent}%`;
    if (textEl) textEl.textContent = text;
}

export async function loadBankenModule() {
    const container = document.getElementById('bankenModule');
    if (!container) {
        console.error('[BANKEN] Container #bankenModule nicht gefunden');
        return;
    }

    await loadBankenComponents(container);

    // Initialize Banken Chat after components are loaded
    window.initBankenChat?.();

    window.showNotification?.('Banken-Modul geladen', 'success');
}
