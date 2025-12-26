/**
 * App Entry Point - ES2024
 * Central module loader replacing legacy script files
 */

// ========================================
// CORE MODULES
// ========================================

import './logger.js';
import './event-handlers.js';

// ========================================
// FEATURE MODULES
// ========================================

// Charts & Visualization
import './charts/index.js';
import './map-counties/index.js';

// Main Dashboard
import './main/index.js';

// Chat Systems
import './chat/index.js';
import './banken-chat/index.js';

// Feature Modules
import './agentur-overview/index.js';
import './risikoscoring/index.js';
import './provisionssimulation/index.js';
import './guided-tour/index.js';

// Domain Modules
import './versicherung/index.js';
import './banken/index.js';
import './bestand/index.js';

// ========================================
// INITIALIZATION
// ========================================

const initApp = () => {
    // Initialize all modules that need DOM
    window.initChat?.();
    window.initBankenChat?.();
    window.initMap?.();
    window.initKPIGrid?.();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

export { initApp };
