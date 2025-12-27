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
 * Initialize event delegation
 * Handles [data-action] clicks automatically
 */
export const init = () => {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const args = target.dataset.args ? JSON.parse(target.dataset.args) : [];

        e.preventDefault();
        execute(action, ...args);
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
