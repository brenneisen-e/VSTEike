/**
 * Scoring Functions for Risikoscoring Module
 * Calculates individual and total performance scores
 */

import { getElement, getValue, setText } from './_helpers.js';
import { vermittlerTypRanges } from './_constants.js';
import { formatCurrency } from './_helpers.js';

/**
 * Calculates performance score (20 points max)
 * @returns {number} Performance score
 */
export const calculatePerformanceScore = () => {
    const neuScore = Math.min(100, (getValue('neugeschaeftSlider') / 1000000) * 50);
    const bestandScore = Math.min(100, (getValue('bestandSlider') / 5000000) * 50);
    const margeScore = getValue('margenSlider');
    const crossScore = Math.min(100, (getValue('crossSellingSlider') - 1) * 25);
    return ((neuScore + bestandScore + margeScore + crossScore) / 4) * 0.2;
};

/**
 * Calculates risk score (40 points max)
 * @returns {number} Risk score
 */
export const calculateRiskScore = () => {
    const schadenquote = getValue('schadenquoteSlider');
    const vermittlerTyp = getElement('vermittlerTypSelect')?.value ?? 'grossmakler';
    const typeRange = vermittlerTypRanges[vermittlerTyp];

    let schadenScore = schadenquote <= typeRange.min ? 100 :
                       schadenquote <= typeRange.optimal ? 100 - ((schadenquote - typeRange.min) / (typeRange.optimal - typeRange.min)) * 10 :
                       schadenquote <= typeRange.max ? 90 - ((schadenquote - typeRange.optimal) / (typeRange.max - typeRange.optimal)) * 40 :
                       Math.max(0, 50 - ((schadenquote - typeRange.max) * 2));

    const grossScore = Math.max(0, 100 - getValue('grossschadenSlider') * 10);
    const underScore = getValue('underwritingSlider');
    return ((schadenScore + grossScore + underScore) / 3) * 0.4;
};

/**
 * Calculates stability score (15 points max)
 * @returns {number} Stability score
 */
export const calculateStabilityScore = () => {
    const stornoScore = Math.max(0, 100 - getValue('stornoSlider') * 2.5);
    const dauerScore = Math.min(100, getValue('dauerSlider') * 5);
    const ausScore = getValue('ausschoepfungSlider');
    return ((stornoScore + dauerScore + ausScore) / 3) * 0.15;
};

/**
 * Calculates customer score (10 points max)
 * @returns {number} Customer score
 */
export const calculateCustomerScore = () => {
    const npsScore = (getValue('npsSlider') + 100) / 2;
    const beratungScore = getValue('beratungSlider');
    const beschwerdenScore = Math.max(0, 100 - getValue('beschwerdenSlider') * 5);
    return ((npsScore + beratungScore + beschwerdenScore) / 3) * 0.1;
};

/**
 * Calculates profit score (15 points max)
 * @returns {number} Profit score
 */
export const calculateProfitScore = () => {
    const dbScore = Math.min(100, (getValue('deckungsbeitragSlider') / 200000) * 100);
    const keScore = Math.max(0, 100 - (getValue('kostenertragSlider') - 50));
    return ((dbScore + keScore) / 2) * 0.15;
};

/**
 * Updates the traffic light indicator based on score
 * @param {number} score - Total score
 */
export const updateTrafficLight = (score) => {
    getElement('redLight')?.classList.remove('active');
    getElement('yellowLight')?.classList.remove('active');
    getElement('greenLight')?.classList.remove('active');
    getElement(score >= 80 ? 'greenLight' : score >= 60 ? 'yellowLight' : 'redLight')?.classList.add('active');
};

/**
 * Updates all scoring displays and calculations
 */
export const updateScoring = () => {
    const sliders = ['neugeschaeft', 'bestand', 'margen', 'crossSelling', 'schadenquote', 'grossschaden', 'underwriting', 'storno', 'dauer', 'ausschoepfung', 'nps', 'beratung', 'beschwerden', 'deckungsbeitrag', 'kostenertrag'];
    const suffixes = { neugeschaeft: '', bestand: '', margen: '%', crossSelling: '', schadenquote: '%', grossschaden: '%', underwriting: '%', storno: '%', dauer: ' Jahre', ausschoepfung: '%', nps: '', beratung: '%', beschwerden: '%', deckungsbeitrag: '', kostenertrag: '%' };

    sliders.forEach(name => {
        const val = getValue(name + 'Slider');
        setText(name + 'Value', ['neugeschaeft', 'bestand', 'deckungsbeitrag'].includes(name) ? formatCurrency(val) : val + (suffixes[name] ?? ''));
    });

    const totalScore = calculatePerformanceScore() + calculateRiskScore() + calculateStabilityScore() + calculateCustomerScore() + calculateProfitScore();

    setText('performanceScore', calculatePerformanceScore().toFixed(1) + '/20');
    setText('riskScore', calculateRiskScore().toFixed(1) + '/40');
    setText('stabilityScore', calculateStabilityScore().toFixed(1) + '/15');
    setText('customerScore', calculateCustomerScore().toFixed(1) + '/10');
    setText('profitScore', calculateProfitScore().toFixed(1) + '/15');
    setText('totalScore', Math.round(totalScore));

    updateTrafficLight(totalScore);

    const categoryEl = getElement('scoreCategory');
    categoryEl?.classList.remove('a-level', 'b-level', 'c-level', 'd-level');
    const level = totalScore >= 80 ? 'a' : totalScore >= 60 ? 'b' : totalScore >= 40 ? 'c' : 'd';
    const colors = { a: '#059669', b: '#d97706', c: '#ea580c', d: '#dc2626' };
    const labels = { a: 'A-Vermittler', b: 'B-Vermittler', c: 'C-Vermittler', d: 'D-Vermittler' };

    if (categoryEl) { categoryEl.textContent = labels[level]; categoryEl.classList.add(level + '-level'); }
    const totalEl = getElement('totalScore');
    if (totalEl) totalEl.style.color = colors[level];
};
