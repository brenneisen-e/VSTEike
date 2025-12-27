/**
 * Initialization for Risikoscoring Module
 * Sets up initial state and default values
 */

import { getElement, setValue, setText } from './_helpers.js';
import { updateScoring } from './_scoring.js';

/**
 * Initializes the Risikoscoring module with default values
 */
export const initRisikoscoring = () => {
    if (!getElement('neuSchadenSlider')) return;

    setValue('neuSchadenSlider', 200000);
    setValue('neuKrankenSlider', 150000);
    setValue('neuLebenSlider', 150000);
    setValue('bestandSchadenSlider', 1000000);
    setValue('bestandKrankenSlider', 750000);
    setValue('bestandLebenSlider', 750000);
    setValue('vermittlerTypSelect', 'grossmakler');
    setText('vermittlerTypDisplay', 'Großmakler');

    updateScoring();
};
