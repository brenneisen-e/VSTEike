/**
 * Event Handlers Module - ES2024
 * Centralized event delegation system
 * Replaces inline onclick handlers with data attributes
 */

// ========================================
// EVENT DELEGATION
// ========================================

const handlers = new Map();

/**
 * Register a handler function
 */
export const register = (name, fn) => {
    handlers.set(name, fn);
};

/**
 * Execute handler by name with args
 */
export const execute = (name, ...args) => {
    const handler = handlers.get(name) ?? window[name];
    if (typeof handler === 'function') {
        return handler(...args);
    }
};

/**
 * Navigate to a view based on data-view attribute
 */
const navigateToView = (viewName) => {
    console.log(`[NAV] Navigating to view: ${viewName}`);

    // Update active nav-link styling
    document.querySelectorAll('.nav-link[data-view]').forEach(link => {
        link.classList.toggle('active', link.dataset.view === viewName);
    });

    // Handle different views
    switch (viewName) {
        case 'dashboard':
        case 'gesamtuebersicht':
            window.openDashboard?.();
            break;
        case 'agenturuebersicht':
            window.openAgenturView?.();
            break;
        case 'risikoscoring':
            window.openRisikoscoring?.();
            break;
        case 'bestandsuebertragung':
            window.openBestandsuebertragung?.();
            break;
        case 'finanzplanung':
            window.openFinanzplanung?.();
            break;
        case 'provisionssimulation':
            window.openProvisionssimulation?.();
            break;
        case 'einstellungen':
            window.toggleSettings?.();
            break;
        case 'hilfe':
            window.startDemoTour?.();
            break;
        default:
            console.warn(`[NAV] Unknown view: ${viewName}`);
    }
};

/**
 * Initialize event delegation
 * Handles [data-action] and [data-view] clicks automatically
 */
export const init = () => {
    document.addEventListener('click', (e) => {
        // Handle data-action clicks
        const actionTarget = e.target.closest('[data-action]');
        if (actionTarget) {
            const action = actionTarget.dataset.action;
            const args = actionTarget.dataset.args ? JSON.parse(actionTarget.dataset.args) : [];
            e.preventDefault();
            execute(action, ...args);
            return;
        }

        // Handle data-view clicks (sidebar navigation)
        const viewTarget = e.target.closest('[data-view]');
        if (viewTarget && viewTarget.closest('.sidebar-nav')) {
            e.preventDefault();
            navigateToView(viewTarget.dataset.view);
            return;
        }
    });

    document.addEventListener('change', (e) => {
        const target = e.target.closest('[data-change]');
        if (!target) return;

        const action = target.dataset.change;
        execute(action, e.target.value, e);
    });
};

// ========================================
// COMMON HANDLERS REGISTRATION
// ========================================

// Navigation
register('switchModule', (module) => window.switchModule?.(module));
register('openGesamtuebersicht', () => window.openGesamtuebersicht?.());
register('backToLanding', () => window.backToLanding?.());
register('backFromAgentur', () => window.backFromAgentur?.());

// Views
register('switchView', (view) => window.switchView?.(view));
register('showAgenturTab', (tab) => window.showAgenturTab?.(tab));
register('openFullscreen', (kpiId) => window.openFullscreen?.(kpiId));
register('closeFullscreen', () => window.closeFullscreen?.());

// Filters
register('toggleDropdown', (id) => {
    const dropdown = document.getElementById(id);
    if (dropdown) dropdown.classList.toggle('show');
});

// Agentur
register('showAgenturOverview', (id) => window.showAgenturOverview?.(id));
register('openKundenDetail', (name, id) => window.openKundenDetail?.(name, id));

// Chat
register('sendMessage', () => window.sendMessage?.());
register('askSampleQuestion', (q) => window.askSampleQuestion?.(q));

// Demo
register('startDemoTour', () => window.startDemoTour?.());

// Export/Import
register('exportData', (format) => window.exportData?.(format));

// ========================================
// AUTO-INIT
// ========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Window export
Object.assign(window, { EventHandlers: { register, execute, init } });
