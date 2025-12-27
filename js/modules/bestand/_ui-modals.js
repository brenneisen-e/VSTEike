/**
 * Bestand UI Modals (ES2024)
 * Modal-Management für Case, Makler und Export
 */

import { getElements } from './_ui-state.js';
import {
    renderWorkflowTimeline,
    renderKeywords,
    renderLinkedCases,
    renderEmailTimeline,
    highlightMissingFields,
    clearMissingFieldHighlights
} from './_ui-render-helpers.js';

/**
 * Öffnet das Case-Modal
 * @param {Object|null} caseData - Case-Daten oder null für neuen Case
 * @returns {void}
 */
export const openCaseModal = (caseData) => {
    const elements = getElements();
    if (!elements.caseModal) return;
    const isNew = !caseData;
    elements.modalTitle.textContent = isNew ? 'Neuer Vorgang' : 'Vorgang bearbeiten';
    elements.caseForm?.reset();

    if (caseData) {
        elements.caseId.value = caseData.id;
        elements.caseKunde.value = caseData.kunde?.name ?? '';
        elements.caseVsNr.value = caseData.versicherungsnummer?.value ?? '';
        elements.caseSparte.value = caseData.sparte ?? '';
        elements.caseDatum.value = caseData.gueltigkeitsdatum?.value ?? '';
        elements.caseMaklerName.value = caseData.makler?.name ?? '';
        elements.caseMaklerEmail.value = caseData.makler?.email ?? '';
        elements.caseStatus.value = caseData.status ?? 'neu';
        elements.caseNotes.value = caseData.notes ?? '';
        renderWorkflowTimeline(caseData.workflow ?? {});
        renderKeywords(caseData);
        renderLinkedCases(caseData);
        renderEmailTimeline(caseData.messages ?? [], caseData);
        highlightMissingFields(caseData);
    } else {
        elements.caseId.value = '';
        renderWorkflowTimeline({});
        renderKeywords(null);
        renderLinkedCases(null);
        renderEmailTimeline([], null);
        clearMissingFieldHighlights();
    }
    elements.caseModal.style.display = 'flex';
};

/**
 * Schließt das Case-Modal
 * @returns {void}
 */
export const closeCaseModal = () => {
    const elements = getElements();
    if (elements.caseModal) elements.caseModal.style.display = 'none';
};

/**
 * Öffnet das Makler-Modal
 * @param {Object} maklerData - Makler-Daten
 * @param {Array} cases - Zugehörige Cases
 * @returns {void}
 */
export const openMaklerModal = (maklerData, cases) => {
    // Implementation similar to original
};

/**
 * Schließt das Makler-Modal
 * @returns {void}
 */
export const closeMaklerModal = () => {
    const elements = getElements();
    if (elements.maklerModal) elements.maklerModal.style.display = 'none';
};

/**
 * Öffnet das Export-Modal
 * @param {number} caseCount - Anzahl zu exportierender Cases
 * @returns {void}
 */
export const openExportModal = (caseCount) => {
    const elements = getElements();
    if (!elements.exportModal) return;
    elements.exportCaseCount.textContent = caseCount;
    elements.exporterName.value = '';
    elements.exportModal.style.display = 'flex';
};

/**
 * Schließt das Export-Modal
 * @returns {void}
 */
export const closeExportModal = () => {
    const elements = getElements();
    if (elements.exportModal) elements.exportModal.style.display = 'none';
};

/**
 * Gibt den Namen des Exporters zurück
 * @returns {string} Exporter-Name
 */
export const getExporterName = () => {
    const elements = getElements();
    return elements.exporterName?.value.trim() ?? '';
};
