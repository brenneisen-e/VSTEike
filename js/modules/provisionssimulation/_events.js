/**
 * Provisionssimulation Event Handlers
 * Event listeners and window exports for backwards compatibility
 */

import {
    initProvisionSimulation,
    handleProvisionSlider,
    exportProvisionReport,
    resetProvisionSimulation,
    toggleProvisionFullscreen,
    switchPerspective,
    updateMigrationDisplay,
    initCompanyView
} from './_actions.js';
import { calculateProvisions } from './_calculations.js';

/**
 * Setup event listeners
 */
export const setupEventListeners = () => {
    // Fullscreen escape handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const section = document.getElementById('provisionSimulation');
            if (section?.classList.contains('fullscreen')) {
                section.classList.remove('fullscreen');
            }
        }
    });
};

/**
 * Export functions to window for backwards compatibility
 */
export const setupWindowExports = () => {
    Object.assign(window, {
        initProvisionSimulation,
        handleProvisionSlider,
        calculateProvisions,
        exportProvisionReport,
        resetProvisionSimulation,
        toggleProvisionFullscreen,
        switchPerspective,
        updateMigrationDisplay,
        initCompanyView
    });

    // Auto-init hook for tab switching
    const originalShowAgenturTab = window.showAgenturTab;
    window.showAgenturTab = function(tabName) {
        originalShowAgenturTab?.(tabName);
        if (tabName === 'provision') {
            setTimeout(initProvisionSimulation, 100);
        }
    };
};
