/**
 * Bestand UI Forms (ES2024)
 * Formular-Datenextraktion
 */

import { getElements } from './_ui-state.js';

/**
 * Gibt Case-Formulardaten zurück
 * @returns {Object} Case-Formulardaten
 */
export const getCaseFormData = () => {
    const elements = getElements();
    return {
        id: elements.caseId.value ?? null,
        kunde: { name: elements.caseKunde.value.trim(), confidence: 1.0, source: 'manual' },
        versicherungsnummer: { value: elements.caseVsNr.value.trim(), confidence: 1.0, source: 'manual' },
        sparte: elements.caseSparte.value,
        status: elements.caseStatus.value,
        gueltigkeitsdatum: elements.caseDatum.value ? { value: elements.caseDatum.value.trim(), confidence: 1.0, source: 'manual' } : null,
        makler: { name: elements.caseMaklerName.value.trim(), email: elements.caseMaklerEmail.value.trim() },
        notes: elements.caseNotes.value.trim()
    };
};

/**
 * Gibt Vorgänge-Filter-Werte zurück
 * @returns {Object} Filter-Werte {search, sparte, exportFilter}
 */
export const getVorgaengeFilterValues = () => {
    const elements = getElements();
    return {
        search: elements.vorgaengeSearch?.value.trim().toLowerCase() ?? '',
        sparte: elements.filterSparte?.value ?? '',
        exportFilter: elements.filterExport?.value ?? ''
    };
};

/**
 * Gibt Makler-Suchwert zurück
 * @returns {string} Suchwert
 */
export const getMaklerSearchValue = () => {
    const elements = getElements();
    return elements.maklerSearch?.value.trim().toLowerCase() ?? '';
};

/**
 * Gibt E-Mail-Filter-Werte zurück
 * @returns {Object} Filter-Werte {search, sort}
 */
export const getEmailFilterValues = () => {
    const elements = getElements();
    return {
        search: elements.emailSearch?.value.trim().toLowerCase() ?? '',
        sort: elements.emailSort?.value ?? 'desc'
    };
};
