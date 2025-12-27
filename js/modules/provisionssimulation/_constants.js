/**
 * Provisionssimulation Constants
 * Commission rates, tier definitions, and UI configuration
 */

/**
 * Commission rates for different insurance companies and segments
 * @constant {Object}
 */
export const COMMISSION_RATES = {
    alpha: {
        leben: { ap: 2.0, bp: 0.3 },
        kranken: { ap: 5.0, bp: 0.5 },
        schaden: { ap: 15.0, bp: 2.0 }
    },
    beta: {
        leben: { ap: 1.5, bp: 0.5 },
        kranken: { ap: 4.0, bp: 0.8 },
        schaden: { ap: 12.0, bp: 3.5 }
    }
};

/**
 * Revers tier levels with production thresholds and commission factors
 * @constant {Array<Object>}
 */
export const REVERS_TIERS = [
    { min: 0, max: 100000, factor: 0.85, label: 'Basis' },
    { min: 100000, max: 250000, factor: 0.95, label: 'Standard' },
    { min: 250000, max: 500000, factor: 1.0, label: 'Premium' },
    { min: 500000, max: Infinity, factor: 1.1, label: 'Top' }
];

/**
 * SVG path data for segment icons
 * @constant {Object}
 */
export const SEGMENT_ICONS = {
    leben: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
    kranken: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>',
    schaden: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>'
};

/**
 * Human-readable labels and icon names for segments
 * @constant {Object}
 */
export const SEGMENT_LABELS = {
    leben: { name: 'Leben', icon: 'shield' },
    kranken: { name: 'Kranken', icon: 'heart' },
    schaden: { name: 'Schaden', icon: 'home' }
};
