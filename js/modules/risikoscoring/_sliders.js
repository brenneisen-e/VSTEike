/**
 * Slider and Segment Functions for Risikoscoring Module
 * Handles slider updates and proportional calculations
 */

import { getValue, setValue, setText, formatCurrency } from './_helpers.js';
import { updateScoring } from './_scoring.js';

/**
 * Product definitions for proportional distribution
 */
const productDefs = {
    'neuSchaden': [['neuHaftpflicht', 0.3], ['neuUnfall', 0.2], ['neuHausrat', 0.15], ['neuRechtsschutz', 0.15], ['neuKfz', 0.2]],
    'neuKranken': [['neuVoll', 0.533], ['neuZusatz', 0.333], ['neuPflege', 0.134]],
    'neuLeben': [['neuRisiko', 0.267], ['neuBu', 0.4], ['neuRente', 0.333]],
    'bestandSchaden': [['bestandHaftpflicht', 0.3], ['bestandUnfall', 0.2], ['bestandHausrat', 0.15], ['bestandRechtsschutz', 0.15], ['bestandKfz', 0.2]],
    'bestandKranken': [['bestandVoll', 0.533], ['bestandZusatz', 0.333], ['bestandPflege', 0.134]],
    'bestandLeben': [['bestandRisiko', 0.267], ['bestandBu', 0.4], ['bestandRente', 0.333]]
};

/**
 * Product lists for each segment
 */
const productLists = {
    'neuSchaden': ['neuHaftpflicht', 'neuUnfall', 'neuHausrat', 'neuRechtsschutz', 'neuKfz'],
    'neuKranken': ['neuVoll', 'neuZusatz', 'neuPflege'],
    'neuLeben': ['neuRisiko', 'neuBu', 'neuRente'],
    'bestandSchaden': ['bestandHaftpflicht', 'bestandUnfall', 'bestandHausrat', 'bestandRechtsschutz', 'bestandKfz'],
    'bestandKranken': ['bestandVoll', 'bestandZusatz', 'bestandPflege'],
    'bestandLeben': ['bestandRisiko', 'bestandBu', 'bestandRente']
};

/**
 * Updates products proportionally based on new segment total
 * @param {string} segment - Segment name
 * @param {number} newTotal - New total value
 */
export const updateProductsProportionally = (segment, newTotal) => {
    productDefs[segment]?.forEach(([name, ratio]) => {
        const newVal = Math.round(newTotal * ratio);
        setValue(name + 'Slider', newVal);
        setText(name + 'Value', formatCurrency(newVal));
    });
};

/**
 * Updates the main slider (Neugeschäft or Bestand total)
 * @param {string} type - 'neugeschaeft' or 'bestand'
 * @param {boolean} userTriggered - Whether triggered by user interaction
 */
export const updateMainSlider = (type, userTriggered = false) => {
    const newTotal = getValue(type + 'Slider');
    setText(type + 'Value', formatCurrency(newTotal));

    if (!userTriggered) { updateScoring(); return; }

    const prefix = type === 'neugeschaeft' ? 'neu' : 'bestand';
    const segments = ['Schaden', 'Kranken', 'Leben'];
    const values = segments.map(s => getValue(prefix + s + 'Slider') || 0);
    const currentTotal = values.reduce((a, b) => a + b, 0);

    if (currentTotal > 0) {
        segments.forEach((s, i) => {
            const newVal = Math.round(newTotal * (values[i] / currentTotal));
            setValue(prefix + s + 'Slider', newVal);
            setText(prefix + s + 'Value', formatCurrency(newVal));
            updateProductsProportionally(prefix + s, newVal);
        });
    } else {
        const ratios = [0.4, 0.3, 0.3];
        segments.forEach((s, i) => setValue(prefix + s + 'Slider', Math.round(newTotal * ratios[i])));
    }
    updateScoring();
};

/**
 * Updates segment values and recalculates totals
 * @param {string} type - 'neugeschaeft' or 'bestand'
 * @param {boolean} fromProductUpdate - Whether called from product update
 */
export const updateSegmentValues = (type, fromProductUpdate = false) => {
    const prefix = type === 'neugeschaeft' ? 'neu' : 'bestand';
    const segments = ['Schaden', 'Kranken', 'Leben'];
    let total = 0;

    segments.forEach(s => {
        const val = getValue(prefix + s + 'Slider');
        total += val;
        setText(prefix + s + 'Value', formatCurrency(val));
        if (!fromProductUpdate) updateProductsProportionally(prefix + s, val);
    });

    setValue(type + 'Slider', total);
    setText(type + 'Value', formatCurrency(total));
    updateScoring();
};

/**
 * Updates product values within a segment
 * @param {string} segment - Segment name
 */
export const updateProductValues = (segment) => {
    const products = productLists[segment] ?? [];
    let total = 0;
    products.forEach(p => {
        const val = getValue(p + 'Slider');
        total += val;
        setText(p + 'Value', formatCurrency(val));
    });

    const type = segment.startsWith('neu') ? 'neugeschaeft' : 'bestand';
    const segmentSlider = segment + 'Slider';
    setValue(segmentSlider, total);
    updateSegmentValues(type, true);
};
