/**
 * Bestand UI Render Helpers (ES2024)
 * Private Rendering-Hilfsfunktionen für komplexe UI-Elemente
 */

import * as storage from './storage.js';
import { WORKFLOW_STEPS, STATUS_ICONS } from './_ui-constants.js';
import { escapeHtml, formatDate, formatDateTime, parseGermanDate, highlightKeywords, truncateText } from './_ui-helpers.js';
import { getElements } from './_ui-state.js';

/**
 * Rendert Workflow-Timeline
 * @param {Object} workflow - Workflow-Daten
 * @returns {void}
 */
export const renderWorkflowTimeline = (workflow) => {
    const elements = getElements();
    const stepElements = {
        mailReceived: elements.stepMailReceived,
        mailUploaded: elements.stepMailUploaded,
        kiRecognized: elements.stepKiRecognized,
        pvValidated: elements.stepPvValidated,
        exported: elements.stepExported
    };

    let lastCompletedIndex = -1;
    WORKFLOW_STEPS.forEach((step, index) => {
        const stepEl = stepElements[step.key];
        const stepContainer = stepEl?.closest('.workflow-step');
        const connectorAfter = stepContainer?.nextElementSibling;
        if (!stepEl || !stepContainer) return;

        const stepDate = workflow[step.key];
        stepContainer.classList.remove('completed', 'active');

        if (stepDate) {
            stepContainer.classList.add('completed');
            stepEl.textContent = formatDate(stepDate);
            lastCompletedIndex = index;
            if (connectorAfter?.classList.contains('workflow-connector')) connectorAfter.classList.add('completed');
        } else {
            stepEl.textContent = '–';
            if (connectorAfter?.classList.contains('workflow-connector')) connectorAfter.classList.remove('completed');
        }
    });

    const activeIndex = lastCompletedIndex + 1;
    if (activeIndex < WORKFLOW_STEPS.length) {
        const activeStepKey = WORKFLOW_STEPS[activeIndex].key;
        stepElements[activeStepKey]?.closest('.workflow-step')?.classList.add('active');
    }
};

/**
 * Rendert Keywords
 * @param {Object|null} caseData - Case-Daten
 * @returns {void}
 */
export const renderKeywords = (caseData) => {
    const elements = getElements();
    if (!elements.keywordsList) return;
    if (!caseData) { elements.keywordsList.innerHTML = '<span class="text-muted">Keine Schlagwörter</span>'; return; }

    const keywords = [];
    if (caseData.kunde?.name && caseData.kunde.source !== 'manual') keywords.push({ field: 'Kunde', value: caseData.kunde.name });
    if (caseData.versicherungsnummer?.value && caseData.versicherungsnummer.source !== 'manual') keywords.push({ field: 'VS-Nr', value: caseData.versicherungsnummer.value });
    if (caseData.gueltigkeitsdatum?.value && caseData.gueltigkeitsdatum.source !== 'manual') keywords.push({ field: 'Datum', value: caseData.gueltigkeitsdatum.value });
    if (caseData.makler?.name && caseData.makler.email) keywords.push({ field: 'Makler', value: caseData.makler.name });
    if (caseData.sparte) keywords.push({ field: 'Sparte', value: caseData.sparte });

    if (!keywords.length) { elements.keywordsList.innerHTML = '<span class="text-muted">Keine automatisch erkannten Schlagwörter</span>'; return; }
    elements.keywordsList.innerHTML = keywords.map(kw => `<span class="keyword-tag"><span class="keyword-field">${escapeHtml(kw.field)}:</span><span class="keyword-value">${escapeHtml(kw.value)}</span></span>`).join('');
};

/**
 * Rendert verknüpfte Cases
 * @param {Object|null} caseData - Case-Daten
 * @returns {void}
 */
export const renderLinkedCases = (caseData) => {
    const elements = getElements();
    if (!elements.linkedCasesCard || !elements.linkedCasesList) return;
    const linkedCases = caseData?.id ? storage.getLinkedCases(caseData.id) : [];
    if (!linkedCases.length) { elements.linkedCasesCard.style.display = 'none'; return; }

    elements.linkedCasesCard.style.display = 'block';
    elements.linkedCasesCount.textContent = linkedCases.length;
    elements.linkedCasesList.innerHTML = linkedCases.map(c => `
        <div class="linked-case-item" data-case-id="${c.id}">
            <div class="linked-case-status"><span class="status-badge status-${c.status}">${STATUS_ICONS[c.status] ?? '○'}</span></div>
            <div class="linked-case-info">
                <div class="linked-case-kunde">${escapeHtml(c.kunde?.name ?? 'Unbekannt')}</div>
                <div class="linked-case-details">${escapeHtml(c.versicherungsnummer?.value ?? '-')} · ${escapeHtml(c.sparte ?? '-')}</div>
            </div>
            <div class="linked-case-arrow">→</div>
        </div>
    `).join('');
};

/**
 * Rendert E-Mail-Timeline
 * @param {Array} messages - Array von E-Mails
 * @param {Object|null} caseData - Case-Daten für Highlighting
 * @returns {void}
 */
export const renderEmailTimeline = (messages, caseData) => {
    const elements = getElements();
    if (!elements.emailTimeline) return;
    elements.modalMailCount.textContent = messages.length;
    if (!messages.length) { elements.emailTimeline.innerHTML = '<p class="empty-message">Keine E-Mails vorhanden</p>'; return; }

    const highlightTerms = [];
    if (caseData?.kunde?.name) highlightTerms.push(caseData.kunde.name.split(',')[0].trim());
    if (caseData?.versicherungsnummer?.value) highlightTerms.push(caseData.versicherungsnummer.value);
    if (caseData?.gueltigkeitsdatum?.value) highlightTerms.push(caseData.gueltigkeitsdatum.value);

    const sorted = [...messages].sort((a, b) => (parseGermanDate(b.receivedTime) ?? new Date(0)) - (parseGermanDate(a.receivedTime) ?? new Date(0)));
    elements.emailTimeline.innerHTML = sorted.map((msg, index) => {
        const isSent = msg.folder === 'sent';
        const bodyText = highlightKeywords(truncateText(msg.bodyPlain ?? msg.body ?? '', 800), highlightTerms);
        return `<div class="email-bookmark ${msg.folder}" data-email-index="${index}">
            <div class="email-bookmark-header" onclick="UI.toggleEmailBody(this)">
                <span class="email-expand-icon">▶</span>
                <span class="email-direction ${isSent ? 'direction-sent' : 'direction-inbox'}">${isSent ? '↑' : '↓'}</span>
                <span class="email-date">${formatDateTime(msg.receivedTime)}</span>
                <span class="email-subject-short">${escapeHtml(msg.subject ?? 'Kein Betreff')}</span>
                <span class="email-preview">${escapeHtml(truncateText(msg.bodyPlain ?? msg.body ?? '', 60))}</span>
            </div>
            <div class="email-bookmark-body" style="display: none;">
                <div class="email-sender"><strong>Von:</strong> ${escapeHtml(msg.senderEmail ?? '-')}</div>
                <div class="email-body">${bodyText}</div>
            </div>
        </div>`;
    }).join('');
};

/**
 * Hebt fehlende Felder hervor
 * @param {Object} caseData - Case-Daten
 * @returns {void}
 */
export const highlightMissingFields = (caseData) => {
    const elements = getElements();
    clearMissingFieldHighlights();
    if (!caseData || caseData.status !== 'unvollstaendig') return;
    if (!caseData.kunde?.name?.trim()) elements.caseKunde?.closest('.stammdaten-item')?.classList.add('field-missing');
    if (!caseData.versicherungsnummer?.value?.trim()) elements.caseVsNr?.closest('.stammdaten-item')?.classList.add('field-missing');
};

/**
 * Entfernt Hervorhebungen fehlender Felder
 * @returns {void}
 */
export const clearMissingFieldHighlights = () => {
    document.querySelectorAll('.stammdaten-item.field-missing').forEach(el => el.classList.remove('field-missing'));
};
