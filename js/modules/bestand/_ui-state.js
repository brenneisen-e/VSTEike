/**
 * Bestand UI State (ES2024)
 * State-Management und Element-Initialisierung
 */

/**
 * UI-Elemente-Referenzen
 */
let elements = {};

/**
 * Validierungs-State
 */
let validationState = { cases: [], currentIndex: 0 };

/**
 * Initialisiert UI-Elemente-Referenzen
 * @returns {void}
 */
export const init = () => {
    elements = {
        toastContainer: document.getElementById('toastContainer'),
        dropOverlay: document.getElementById('dropOverlay'),
        vorgaengeCount: document.getElementById('vorgaengeCount'),
        maklerNavCount: document.getElementById('maklerNavCount'),
        emailsNavCount: document.getElementById('emailsNavCount'),
        kpiTotal: document.getElementById('kpiTotal'),
        kpiKiRecognized: document.getElementById('kpiKiRecognized'),
        kpiKiRecognizedPct: document.getElementById('kpiKiRecognizedPct'),
        kpiPvValidated: document.getElementById('kpiPvValidated'),
        kpiPvValidatedPct: document.getElementById('kpiPvValidatedPct'),
        kpiExportReady: document.getElementById('kpiExportReady'),
        kpiExportReadyPct: document.getElementById('kpiExportReadyPct'),
        kpiExportiert: document.getElementById('kpiExportiert'),
        kpiExportiertPct: document.getElementById('kpiExportiertPct'),
        spartenList: document.getElementById('spartenList'),
        incompleteCount: document.getElementById('incompleteCount'),
        validationPendingCount: document.getElementById('validationPendingCount'),
        recentActivityBody: document.getElementById('recentActivityBody'),
        dashboardSearch: document.getElementById('dashboardSearch'),
        dashboardSearchResults: document.getElementById('dashboardSearchResults'),
        activityStatusFilter: document.getElementById('activityStatusFilter'),
        activitySort: document.getElementById('activitySort'),
        importExportHistory: document.getElementById('importExportHistory'),
        vorgaengeSearch: document.getElementById('vorgaengeSearch'),
        filterSparte: document.getElementById('filterSparte'),
        filterExport: document.getElementById('filterExport'),
        casesGroupedContainer: document.getElementById('casesGroupedContainer'),
        vorgaengeEmpty: document.getElementById('vorgaengeEmpty'),
        maklerSearch: document.getElementById('maklerSearch'),
        maklerTableBody: document.getElementById('maklerTableBody'),
        maklerEmpty: document.getElementById('maklerEmpty'),
        emailSearch: document.getElementById('emailSearch'),
        emailSort: document.getElementById('emailSort'),
        emailsTableBody: document.getElementById('emailsTableBody'),
        emailsEmpty: document.getElementById('emailsEmpty'),
        caseModal: document.getElementById('caseModal'),
        modalTitle: document.getElementById('modalTitle'),
        caseForm: document.getElementById('caseForm'),
        caseId: document.getElementById('caseId'),
        caseKunde: document.getElementById('caseKunde'),
        caseVsNr: document.getElementById('caseVsNr'),
        caseSparte: document.getElementById('caseSparte'),
        caseDatum: document.getElementById('caseDatum'),
        caseMaklerName: document.getElementById('caseMaklerName'),
        caseMaklerEmail: document.getElementById('caseMaklerEmail'),
        caseStatus: document.getElementById('caseStatus'),
        caseNotes: document.getElementById('caseNotes'),
        emailTimeline: document.getElementById('emailTimeline'),
        modalMailCount: document.getElementById('modalMailCount'),
        keywordsList: document.getElementById('keywordsList'),
        stepMailReceived: document.getElementById('stepMailReceived'),
        stepMailUploaded: document.getElementById('stepMailUploaded'),
        stepKiRecognized: document.getElementById('stepKiRecognized'),
        stepPvValidated: document.getElementById('stepPvValidated'),
        stepExported: document.getElementById('stepExported'),
        linkedCasesCard: document.getElementById('linkedCasesCard'),
        linkedCasesCount: document.getElementById('linkedCasesCount'),
        linkedCasesList: document.getElementById('linkedCasesList'),
        maklerModal: document.getElementById('maklerModal'),
        maklerModalTitle: document.getElementById('maklerModalTitle'),
        maklerInfo: document.getElementById('maklerInfo'),
        maklerCasesBody: document.getElementById('maklerCasesBody'),
        exportModal: document.getElementById('exportModal'),
        exportCaseCount: document.getElementById('exportCaseCount'),
        exporterName: document.getElementById('exporterName'),
        validationModal: document.getElementById('validationModal'),
        validationCurrent: document.getElementById('validationCurrent'),
        validationTotal: document.getElementById('validationTotal'),
        valKunde: document.getElementById('valKunde'),
        valVsNr: document.getElementById('valVsNr'),
        valSparte: document.getElementById('valSparte'),
        valDatum: document.getElementById('valDatum'),
        valMakler: document.getElementById('valMakler'),
        valWiedervorlage: document.getElementById('valWiedervorlage'),
        valRejectSection: document.getElementById('valRejectSection'),
        valRejectReason: document.getElementById('valRejectReason'),
        valEmailPreview: document.getElementById('valEmailPreview')
    };
};

/**
 * Getter für UI-Elemente
 */
export const getElements = () => elements;

/**
 * Getter für Validierungs-State
 */
export const getValidationState = () => validationState;

/**
 * Setter für Validierungs-State
 */
export const setValidationState = (newState) => {
    validationState = newState;
};
