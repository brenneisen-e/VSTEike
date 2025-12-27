/**
 * Bestand UI Validation (ES2024)
 * Validierungs-Modal-Funktionalität
 */

import { getElements, getValidationState, setValidationState } from './_ui-state.js';
import { convertGermanDateToISO, highlightKeywords, truncateText, escapeHtml } from './_ui-helpers.js';
import { showToast } from './_ui-notifications.js';

/**
 * Rendert den aktuellen Validierungs-Case
 * @returns {void}
 */
const renderValidationCase = () => {
    const elements = getElements();
    const validationState = getValidationState();
    const caseData = validationState.cases[validationState.currentIndex];
    if (!caseData) return;

    elements.validationCurrent.textContent = validationState.currentIndex + 1;
    if (elements.valRejectSection) elements.valRejectSection.style.display = 'none';
    if (elements.valRejectReason) elements.valRejectReason.value = '';

    const extractedValues = [];
    if (elements.valKunde) { elements.valKunde.value = caseData.kunde?.name ?? ''; if (caseData.kunde?.name) extractedValues.push(caseData.kunde.name); }
    if (elements.valVsNr) { elements.valVsNr.value = caseData.versicherungsnummer?.value ?? ''; if (caseData.versicherungsnummer?.value) extractedValues.push(caseData.versicherungsnummer.value); }
    if (elements.valSparte) { elements.valSparte.value = caseData.sparte ?? ''; }
    if (elements.valDatum) { elements.valDatum.value = convertGermanDateToISO(caseData.gueltigkeitsdatum?.value ?? ''); }
    if (elements.valMakler) { elements.valMakler.value = caseData.makler?.name ?? ''; }
    if (elements.valWiedervorlage) { elements.valWiedervorlage.value = convertGermanDateToISO(caseData.wiedervorlage ?? ''); }

    const firstMsg = caseData.messages?.[0];
    if (firstMsg) {
        const bodyPreview = truncateText(firstMsg.bodyPlain ?? firstMsg.body ?? '', 500);
        elements.valEmailPreview.innerHTML = `<div class="email-preview-subject">${escapeHtml(firstMsg.subject ?? 'Kein Betreff')}</div><div class="email-preview-body">${highlightKeywords(bodyPreview, extractedValues)}</div>`;
    } else {
        elements.valEmailPreview.innerHTML = '<span class="text-muted">Keine E-Mail vorhanden</span>';
    }
};

/**
 * Öffnet das Validierungs-Modal
 * @param {Array} casesToValidate - Array von zu validierenden Cases
 * @returns {void}
 */
export const openValidationModal = (casesToValidate) => {
    const elements = getElements();
    if (!elements.validationModal || !casesToValidate?.length) {
        showToast('Keine Vorgänge zur Validierung vorhanden', 'info');
        return;
    }
    setValidationState({ cases: casesToValidate, currentIndex: 0 });
    elements.validationTotal.textContent = casesToValidate.length;
    renderValidationCase();
    elements.validationModal.style.display = 'flex';
};

/**
 * Schließt das Validierungs-Modal
 * @returns {void}
 */
export const closeValidationModal = () => {
    const elements = getElements();
    if (elements.validationModal) elements.validationModal.style.display = 'none';
    setValidationState({ cases: [], currentIndex: 0 });
};

/**
 * Wechselt zum nächsten Validierungs-Case
 * @returns {boolean} True wenn weiterer Case vorhanden
 */
export const nextValidationCase = () => {
    const validationState = getValidationState();
    if (validationState.currentIndex < validationState.cases.length - 1) {
        setValidationState({
            ...validationState,
            currentIndex: validationState.currentIndex + 1
        });
        renderValidationCase();
        return true;
    }
    return false;
};

/**
 * Gibt den aktuellen Validierungs-Case zurück
 * @returns {Object|null} Aktueller Case
 */
export const getCurrentValidationCase = () => {
    const validationState = getValidationState();
    return validationState.cases[validationState.currentIndex] ?? null;
};

/**
 * Prüft ob weitere Validierungs-Cases vorhanden sind
 * @returns {boolean} True wenn weitere Cases vorhanden
 */
export const hasMoreValidationCases = () => {
    const validationState = getValidationState();
    return validationState.currentIndex < validationState.cases.length - 1;
};

/**
 * Gibt Validierungs-Formulardaten zurück
 * @returns {Object} Formulardaten
 */
export const getValidationFormData = () => {
    const elements = getElements();
    return {
        kunde: elements.valKunde?.value?.trim() ?? '',
        vsNr: elements.valVsNr?.value?.trim() ?? '',
        sparte: elements.valSparte?.value ?? '',
        datum: elements.valDatum?.value ?? '',
        makler: elements.valMakler?.value?.trim() ?? '',
        wiedervorlage: elements.valWiedervorlage?.value ?? '',
        rejectReason: elements.valRejectReason?.value?.trim() ?? ''
    };
};

/**
 * Zeigt oder versteckt den Ablehnungs-Bereich
 * @param {boolean} show - Sichtbarkeit
 * @returns {void}
 */
export const toggleRejectSection = (show) => {
    const elements = getElements();
    if (elements.valRejectSection) {
        elements.valRejectSection.style.display = show ? 'block' : 'none';
        if (show) elements.valRejectReason?.focus();
    }
};

/**
 * Prüft ob ein Ablehnungsgrund vorhanden ist
 * @returns {boolean} True wenn Grund vorhanden
 */
export const hasRejectReason = () => {
    const elements = getElements();
    return (elements.valRejectReason?.value?.trim() ?? '').length > 0;
};

/**
 * Togglet die Sichtbarkeit eines E-Mail-Body
 * @param {HTMLElement} headerElement - Header-Element
 * @returns {void}
 */
export const toggleEmailBody = (headerElement) => {
    const bookmark = headerElement.closest('.email-bookmark');
    if (!bookmark) return;
    const body = bookmark.querySelector('.email-bookmark-body');
    const icon = bookmark.querySelector('.email-expand-icon');
    if (body.style.display === 'none') {
        body.style.display = 'block';
        icon.textContent = '▼';
        bookmark.classList.add('expanded');
    } else {
        body.style.display = 'none';
        icon.textContent = '▶';
        bookmark.classList.remove('expanded');
    }
};
