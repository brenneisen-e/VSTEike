/**
 * Profile Management for Risikoscoring Module
 * Handles loading of predefined vermittler profiles
 */

import { getElement, setValue, setText } from './_helpers.js';
import { formatCurrency } from './_helpers.js';
import { updateScoring } from './_scoring.js';
import { updateProductsProportionally } from './_sliders.js';

/**
 * Predefined vermittler profiles for different types and levels
 */
const profiles = {
    'a-ao': { typ: 'ao', neugeschaeft: 1800000, bestand: 7500000, margen: 70, crossSelling: 3.5, schadenquote: 82, grossschaden: 0.8, underwriting: 96, storno: 3, dauer: 15, ausschoepfung: 92, nps: 85, beratung: 95, beschwerden: 0.5, deckungsbeitrag: 350000, kostenertrag: 45, neuSchaden: 720000, neuKranken: 540000, neuLeben: 540000, bestandSchaden: 3000000, bestandKranken: 2250000, bestandLeben: 2250000 },
    'a-makler': { typ: 'grossmakler', neugeschaeft: 1600000, bestand: 7000000, margen: 65, crossSelling: 3.2, schadenquote: 100, grossschaden: 1.0, underwriting: 93, storno: 4, dauer: 14, ausschoepfung: 88, nps: 75, beratung: 92, beschwerden: 0.8, deckungsbeitrag: 320000, kostenertrag: 50, neuSchaden: 640000, neuKranken: 480000, neuLeben: 480000, bestandSchaden: 2800000, bestandKranken: 2100000, bestandLeben: 2100000 },
    'b-ao': { typ: 'ao', neugeschaeft: 600000, bestand: 3000000, margen: 40, crossSelling: 2.0, schadenquote: 88, grossschaden: 2.0, underwriting: 88, storno: 10, dauer: 8, ausschoepfung: 70, nps: 50, beratung: 80, beschwerden: 2.5, deckungsbeitrag: 100000, kostenertrag: 65, neuSchaden: 240000, neuKranken: 180000, neuLeben: 180000, bestandSchaden: 1200000, bestandKranken: 900000, bestandLeben: 900000 },
    'b-makler': { typ: 'grossmakler', neugeschaeft: 500000, bestand: 2500000, margen: 35, crossSelling: 1.8, schadenquote: 105, grossschaden: 2.5, underwriting: 85, storno: 12, dauer: 7.5, ausschoepfung: 65, nps: 40, beratung: 75, beschwerden: 3, deckungsbeitrag: 85000, kostenertrag: 68, neuSchaden: 200000, neuKranken: 150000, neuLeben: 150000, bestandSchaden: 1000000, bestandKranken: 750000, bestandLeben: 750000 },
    'c-makler': { typ: 'kleinmakler', neugeschaeft: 250000, bestand: 1200000, margen: 20, crossSelling: 1.4, schadenquote: 115, grossschaden: 4, underwriting: 72, storno: 20, dauer: 5, ausschoepfung: 45, nps: 10, beratung: 60, beschwerden: 6, deckungsbeitrag: 35000, kostenertrag: 85, neuSchaden: 100000, neuKranken: 75000, neuLeben: 75000, bestandSchaden: 480000, bestandKranken: 360000, bestandLeben: 360000 },
    'd-autohaus': { typ: 'autohaus', neugeschaeft: 150000, bestand: 800000, margen: 10, crossSelling: 1.1, schadenquote: 130, grossschaden: 7, underwriting: 55, storno: 30, dauer: 3, ausschoepfung: 25, nps: -20, beratung: 45, beschwerden: 12, deckungsbeitrag: 15000, kostenertrag: 105, neuSchaden: 60000, neuKranken: 45000, neuLeben: 45000, bestandSchaden: 320000, bestandKranken: 240000, bestandLeben: 240000 }
};

/**
 * Loads a vermittler profile and updates all inputs
 */
export const loadVermittlerProfile = () => {
    const p = profiles[getElement('vermittlerSelect')?.value];
    if (!p) return;

    setValue('vermittlerTypSelect', p.typ);
    const typeTexts = { 'ao': 'Ausschließlichkeitsorganisation (AO)', 'grossmakler': 'Großmakler', 'kleinmakler': 'Kleinmakler', 'autohaus': 'Autohaus' };
    setText('vermittlerTypDisplay', typeTexts[p.typ] ?? p.typ);

    ['Schaden', 'Kranken', 'Leben'].forEach(s => {
        ['neu', 'bestand'].forEach(prefix => {
            const key = prefix + s;
            setValue(key + 'Slider', p[key]);
            setText(key + 'Value', formatCurrency(p[key]));
            updateProductsProportionally(key, p[key]);
        });
    });

    setValue('neugeschaeftSlider', p.neugeschaeft);
    setValue('bestandSlider', p.bestand);
    setText('neugeschaeftValue', formatCurrency(p.neugeschaeft));
    setText('bestandValue', formatCurrency(p.bestand));

    ['margen', 'crossSelling', 'schadenquote', 'grossschaden', 'underwriting', 'storno', 'dauer', 'ausschoepfung', 'nps', 'beratung', 'beschwerden', 'deckungsbeitrag', 'kostenertrag'].forEach(name => setValue(name + 'Slider', p[name]));

    updateScoring();
};
