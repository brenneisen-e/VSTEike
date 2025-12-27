/**
 * Constants and Configuration for Risikoscoring Module
 * Scoring ranges and measure effects
 */

/**
 * Combined ratio ranges by vermittler type
 * Defines min, max, and optimal combined ratios for each type
 * @type {Object.<string, {min: number, max: number, optimal: number}>}
 */
export const vermittlerTypRanges = {
    'ao': { min: 80, max: 95, optimal: 90 },
    'grossmakler': { min: 100, max: 115, optimal: 107 },
    'kleinmakler': { min: 110, max: 125, optimal: 118 },
    'autohaus': { min: 125, max: 145, optimal: 135 }
};

/**
 * Effects of improvement measures on different performance levels
 * Maps measure names to score improvements by level (a, b, c, d)
 * @type {Object.<string, {a: number, b: number, c: number, d: number}>}
 */
export const measureEffects = {
    schulungen: { d: 10, c: 7, b: 4, a: 2 },
    vertragspruefung: { d: 15, c: 0, b: 0, a: 0 },
    digitalisierung: { d: 6, c: 6, b: 6, a: 6 },
    incentive: { d: 3, c: 5, b: 8, a: 0 },
    prozessoptimierung: { d: 4, c: 4, b: 4, a: 4 },
    betreuung: { d: 12, c: 8, b: 0, a: 0 },
    produktkalkulation: { d: 0, c: 0, b: 0, a: 0 },
    underwriting: { d: 5, c: 5, b: 5, a: 5 }
};
