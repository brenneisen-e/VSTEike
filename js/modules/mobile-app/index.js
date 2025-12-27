/**
 * Mobile App Experience Module
 * Provides app-like navigation and UI for mobile devices
 */

// ========================================
// STATE
// ========================================

let mobileMenuOpen = false;
let desktopPreviewActive = false;
let touchStartX = 0;
let touchStartY = 0;
let currentView = 'home';

// ========================================
// INITIALIZATION
// ========================================

export function initMobileApp() {
    if (!isMobileDevice()) return;

    createMobileHeader();
    createMobileBottomNav();
    createMobileMenu();
    createDesktopPreviewFab();
    setupSwipeGestures();
    updateActiveNavItem();

    // Listen for view changes
    window.addEventListener('viewchange', updateActiveNavItem);

    console.log('[MobileApp] Initialized');
}

function isMobileDevice() {
    return window.innerWidth <= 768 ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
}

// ========================================
// MOBILE HEADER
// ========================================

function createMobileHeader() {
    if (document.querySelector('.mobile-header')) return;

    const header = document.createElement('div');
    header.className = 'mobile-header';
    header.innerHTML = `
        <div class="mobile-header-inner">
            <button class="mobile-header-btn" onclick="window.toggleMobileMenu()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
            <span class="mobile-header-title">Sales Steering</span>
            <button class="mobile-header-btn" onclick="window.openMobileSearch?.()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </button>
        </div>
    `;

    document.body.insertBefore(header, document.body.firstChild);
}

// ========================================
// MOBILE BOTTOM NAVIGATION
// ========================================

function createMobileBottomNav() {
    if (document.querySelector('.mobile-bottom-nav')) return;

    const nav = document.createElement('nav');
    nav.className = 'mobile-bottom-nav';
    nav.innerHTML = `
        <div class="mobile-bottom-nav-inner">
            <button class="mobile-nav-item active" data-view="home" onclick="window.mobileNavTo('home')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Start</span>
            </button>
            <button class="mobile-nav-item" data-view="dashboard" onclick="window.mobileNavTo('dashboard')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                </svg>
                <span>Dashboard</span>
            </button>
            <button class="mobile-nav-item" data-view="agentur" onclick="window.mobileNavTo('agentur')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Agenturen</span>
            </button>
            <button class="mobile-nav-item" data-view="chat" onclick="window.mobileNavTo('chat')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
                </svg>
                <span>Chat</span>
            </button>
        </div>
    `;

    document.body.appendChild(nav);
}

// ========================================
// MOBILE MENU (HAMBURGER)
// ========================================

function createMobileMenu() {
    if (document.querySelector('.mobile-menu-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.onclick = (e) => {
        if (e.target === overlay) closeMobileMenu();
    };

    const userName = localStorage.getItem('dashboardUserName') || 'Eike Brenneisen';
    const userRole = 'Vertriebssteuerung';

    overlay.innerHTML = `
        <div class="mobile-menu-panel">
            <div class="mobile-menu-header">
                <div class="mobile-menu-user">
                    <div class="mobile-menu-avatar">
                        ${userName.charAt(0)}
                    </div>
                    <div class="mobile-menu-user-info">
                        <h3>${userName}</h3>
                        <span>${userRole}</span>
                    </div>
                </div>
            </div>

            <div class="mobile-menu-items">
                <div class="mobile-menu-section-title">Module</div>

                <button class="mobile-menu-item" onclick="window.switchModule?.('versicherung'); window.closeMobileMenu();">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    Versicherung
                </button>

                <button class="mobile-menu-item" onclick="window.switchModule?.('banken'); window.closeMobileMenu();">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                    Banken
                </button>

                <div class="mobile-menu-divider"></div>
                <div class="mobile-menu-section-title">Ansichten</div>

                <button class="mobile-menu-item" onclick="window.openDashboard?.(); window.closeMobileMenu();">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                        <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                        <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                        <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                    </svg>
                    Gesamtübersicht
                </button>

                <button class="mobile-menu-item" onclick="window.openAgenturView?.(); window.closeMobileMenu();">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Agenturansicht
                </button>

                <button class="mobile-menu-item" onclick="window.openPotentialAnalyse?.(); window.closeMobileMenu();">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path>
                    </svg>
                    Potentialanalyse
                </button>

                <button class="mobile-menu-item" onclick="window.openRisikoscoring?.(); window.closeMobileMenu();">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    Risikoscoring
                </button>

                <button class="mobile-menu-item" onclick="window.openBestandsuebertragung?.(); window.closeMobileMenu();">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    Bestandsübertragung
                </button>

                <div class="mobile-menu-divider"></div>
                <div class="mobile-menu-section-title">Tools</div>

                <button class="mobile-menu-item" onclick="window.location.href='Provisionssimulation.html'">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
                    </svg>
                    Provisionssimulation
                </button>

                <button class="mobile-menu-item" onclick="window.openAbrechnungspruefung?.(); window.closeMobileMenu();">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    Abrechnungsprüfung
                </button>

                <div class="mobile-menu-divider"></div>

                <button class="mobile-menu-item" onclick="window.toggleDesktopPreview(); window.closeMobileMenu();">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                    Desktop-Vorschau (Full HD)
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

export function toggleMobileMenu() {
    mobileMenuOpen ? closeMobileMenu() : openMobileMenu();
}

export function openMobileMenu() {
    const overlay = document.querySelector('.mobile-menu-overlay');
    if (overlay) {
        overlay.classList.add('show');
        mobileMenuOpen = true;
        document.body.style.overflow = 'hidden';
    }
}

export function closeMobileMenu() {
    const overlay = document.querySelector('.mobile-menu-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        mobileMenuOpen = false;
        document.body.style.overflow = '';
    }
}

// ========================================
// DESKTOP PREVIEW TOGGLE (FAB)
// ========================================

function createDesktopPreviewFab() {
    if (document.querySelector('.desktop-preview-fab')) return;

    const fab = document.createElement('button');
    fab.className = 'desktop-preview-fab';
    fab.title = 'Desktop-Vorschau (Full HD 1920px)';
    fab.onclick = toggleDesktopPreview;
    fab.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
    `;

    document.body.appendChild(fab);
}

export function toggleDesktopPreview() {
    desktopPreviewActive = !desktopPreviewActive;

    const fab = document.querySelector('.desktop-preview-fab');
    const viewport = document.querySelector('meta[name="viewport"]');

    if (desktopPreviewActive) {
        // Switch to desktop view
        if (viewport) {
            viewport.content = 'width=1920, initial-scale=0.5, user-scalable=yes';
        }
        document.body.classList.add('desktop-preview-mode');
        fab?.classList.add('active');
        fab.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
        `;
        fab.title = 'Zurück zur mobilen Ansicht';

        showToast('Desktop-Vorschau aktiv (1920px). Zum Zurückschalten erneut tippen.');
    } else {
        // Switch back to mobile view
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0';
        }
        document.body.classList.remove('desktop-preview-mode');
        fab?.classList.remove('active');
        fab.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
        `;
        fab.title = 'Desktop-Vorschau (Full HD 1920px)';

        showToast('Mobile Ansicht wiederhergestellt');
    }
}

// ========================================
// NAVIGATION
// ========================================

export function mobileNavTo(view) {
    currentView = view;

    switch (view) {
        case 'home':
            window.backToLanding?.();
            break;
        case 'dashboard':
            window.openDashboard?.();
            break;
        case 'agentur':
            window.openAgenturView?.();
            break;
        case 'chat':
            if (window.activateChat) {
                window.activateChat();
            } else {
                // Find and click the chat widget button
                const chatBtn = document.querySelector('.chat-toggle-btn, #chatToggleBtn');
                chatBtn?.click();
            }
            break;
    }

    updateActiveNavItem();
}

function updateActiveNavItem() {
    const navItems = document.querySelectorAll('.mobile-nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === currentView) {
            item.classList.add('active');
        }
    });

    // Update header title based on view
    const headerTitle = document.querySelector('.mobile-header-title');
    if (headerTitle) {
        const titles = {
            home: 'Sales Steering',
            dashboard: 'Gesamtübersicht',
            agentur: 'Agenturansicht',
            chat: 'Chat Assistent'
        };
        headerTitle.textContent = titles[currentView] || 'Sales Steering';
    }
}

// ========================================
// SWIPE GESTURES
// ========================================

function setupSwipeGestures() {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Horizontal swipe detection (min 80px, more horizontal than vertical)
    if (Math.abs(diffX) > 80 && Math.abs(diffX) > Math.abs(diffY) * 2) {
        // Swipe right from left edge - open menu
        if (diffX > 0 && touchStartX < 30) {
            openMobileMenu();
        }
        // Swipe left when menu is open - close menu
        if (diffX < 0 && mobileMenuOpen) {
            closeMobileMenu();
        }
    }

    touchStartX = 0;
    touchStartY = 0;
}

// ========================================
// UTILITIES
// ========================================

function showToast(message) {
    const existing = document.querySelector('.mobile-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'mobile-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: calc(var(--mobile-nav-height, 64px) + 80px);
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10003;
        animation: toastIn 0.3s ease;
        max-width: calc(100% - 32px);
        text-align: center;
    `;
    toast.textContent = message;

    // Add animation keyframes
    if (!document.querySelector('#mobile-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'mobile-toast-styles';
        style.textContent = `
            @keyframes toastIn {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// WINDOW EXPORTS
// ========================================

Object.assign(window, {
    initMobileApp,
    toggleMobileMenu,
    openMobileMenu,
    closeMobileMenu,
    toggleDesktopPreview,
    mobileNavTo
});

// ========================================
// AUTO-INIT
// ========================================

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileApp);
    } else {
        initMobileApp();
    }
}
