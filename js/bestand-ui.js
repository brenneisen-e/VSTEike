/**
 * UI Modul - User Interface Komponenten und Rendering
 * Verwaltet DOM-Updates, Modals, Toasts und Interaktionen
 */

const UI = (function() {
    'use strict';

    // Status-Icon Mapping (Workflow-basiert)
    const STATUS_ICONS = {
        'unvollstaendig': '◇',
        'zu-validieren': '◐',
        'export-bereit': '●',
        'abgeschlossen': '✓',
        'abgelehnt': '✕',
        'wiedervorlage': '⟳'
    };

    // Status-Labels (Workflow-basiert)
    const STATUS_LABELS = {
        'unvollstaendig': 'Unvollständig',
        'zu-validieren': 'Zu Validieren',
        'export-bereit': 'Export-Bereit',
        'abgeschlossen': 'Abgeschlossen',
        'abgelehnt': 'Abgelehnt',
        'wiedervorlage': 'Wiedervorlage'
    };

    // Cache für DOM-Elemente
    let elements = {};

    // Workflow-Schritte Definition (monochrome icons)
    // mailReceived = Datum der Original-Mail (aus Outlook)
    // mailUploaded = Datum des JSON-Imports ins Tool
    const WORKFLOW_STEPS = [
        { key: 'mailReceived', label: 'Mail erhalten', icon: '◉' },
        { key: 'mailUploaded', label: 'Importiert', icon: '↑' },
        { key: 'kiRecognized', label: 'Von KI erkannt', icon: '◈' },
        { key: 'pvValidated', label: 'Von PV validiert', icon: '✓' },
        { key: 'exported', label: 'Exportiert', icon: '↗' }
    ];

    /**
     * UI initialisieren - DOM-Elemente cachen
     */
    function init() {
        elements = {
            // Toast & Drop
            toastContainer: document.getElementById('toastContainer'),
            dropOverlay: document.getElementById('dropOverlay'),

            // Navigation Counts
            vorgaengeCount: document.getElementById('vorgaengeCount'),
            maklerNavCount: document.getElementById('maklerNavCount'),
            emailsNavCount: document.getElementById('emailsNavCount'),

            // Dashboard KPIs - Workflow-basiert
            kpiTotal: document.getElementById('kpiTotal'),
            kpiKiRecognized: document.getElementById('kpiKiRecognized'),
            kpiKiRecognizedPct: document.getElementById('kpiKiRecognizedPct'),
            kpiPvValidated: document.getElementById('kpiPvValidated'),
            kpiPvValidatedPct: document.getElementById('kpiPvValidatedPct'),
            kpiExportReady: document.getElementById('kpiExportReady'),
            kpiExportReadyPct: document.getElementById('kpiExportReadyPct'),
            kpiExportiert: document.getElementById('kpiExportiert'),
            kpiExportiertPct: document.getElementById('kpiExportiertPct'),

            // Dashboard Charts
            spartenList: document.getElementById('spartenList'),
            incompleteCount: document.getElementById('incompleteCount'),
            validationPendingCount: document.getElementById('validationPendingCount'),
            recentActivityBody: document.getElementById('recentActivityBody'),

            // Dashboard Search
            dashboardSearch: document.getElementById('dashboardSearch'),
            dashboardSearchResults: document.getElementById('dashboardSearchResults'),

            // Activity Filter & History
            activityStatusFilter: document.getElementById('activityStatusFilter'),
            activitySort: document.getElementById('activitySort'),
            importExportHistory: document.getElementById('importExportHistory'),

            // Vorgänge Tab (Status-gruppierte Liste)
            vorgaengeSearch: document.getElementById('vorgaengeSearch'),
            filterSparte: document.getElementById('filterSparte'),
            filterExport: document.getElementById('filterExport'),
            casesGroupedContainer: document.getElementById('casesGroupedContainer'),
            vorgaengeEmpty: document.getElementById('vorgaengeEmpty'),

            // Makler Tab
            maklerSearch: document.getElementById('maklerSearch'),
            maklerTableBody: document.getElementById('maklerTableBody'),
            maklerEmpty: document.getElementById('maklerEmpty'),

            // E-Mails Tab
            emailSearch: document.getElementById('emailSearch'),
            emailSort: document.getElementById('emailSort'),
            emailsTableBody: document.getElementById('emailsTableBody'),
            emailsEmpty: document.getElementById('emailsEmpty'),

            // Case Modal
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

            // Workflow Steps
            stepMailReceived: document.getElementById('stepMailReceived'),
            stepMailUploaded: document.getElementById('stepMailUploaded'),
            stepKiRecognized: document.getElementById('stepKiRecognized'),
            stepPvValidated: document.getElementById('stepPvValidated'),
            stepExported: document.getElementById('stepExported'),

            // Linked Cases
            linkedCasesCard: document.getElementById('linkedCasesCard'),
            linkedCasesCount: document.getElementById('linkedCasesCount'),
            linkedCasesList: document.getElementById('linkedCasesList'),

            // Makler Modal
            maklerModal: document.getElementById('maklerModal'),
            maklerModalTitle: document.getElementById('maklerModalTitle'),
            maklerInfo: document.getElementById('maklerInfo'),
            maklerCasesBody: document.getElementById('maklerCasesBody'),

            // Export Modal
            exportModal: document.getElementById('exportModal'),
            exportCaseCount: document.getElementById('exportCaseCount'),
            exporterName: document.getElementById('exporterName'),

            // Validation Modal
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
    }

    /**
     * Dashboard KPIs rendern - Workflow-basiert
     */
    function renderDashboardKPIs(stats) {
        if (!stats) return;

        const total = stats.total || 0;
        const wf = stats.byWorkflow || {};

        // KPI Werte - Workflow-Schritte
        if (elements.kpiTotal) elements.kpiTotal.textContent = total;
        if (elements.kpiKiRecognized) elements.kpiKiRecognized.textContent = wf.kiRecognized || 0;
        if (elements.kpiPvValidated) elements.kpiPvValidated.textContent = wf.pvValidated || 0;
        if (elements.kpiExportReady) elements.kpiExportReady.textContent = stats.exportReady || 0;
        if (elements.kpiExportiert) elements.kpiExportiert.textContent = wf.exported || 0;

        // Prozente
        if (total > 0) {
            if (elements.kpiKiRecognizedPct) elements.kpiKiRecognizedPct.textContent = Math.round((wf.kiRecognized || 0) / total * 100) + '%';
            if (elements.kpiPvValidatedPct) elements.kpiPvValidatedPct.textContent = Math.round((wf.pvValidated || 0) / total * 100) + '%';
            if (elements.kpiExportReadyPct) elements.kpiExportReadyPct.textContent = Math.round((stats.exportReady || 0) / total * 100) + '%';
            if (elements.kpiExportiertPct) elements.kpiExportiertPct.textContent = Math.round((wf.exported || 0) / total * 100) + '%';
        }

        // Validation-pending Count (KI erkannt aber nicht validiert, ohne unvollständige)
        if (elements.validationPendingCount) {
            const pendingCases = Storage.getPendingValidationCases();
            elements.validationPendingCount.textContent = pendingCases.length;
        }

        // Incomplete Count (unvollständige Vorgänge)
        if (elements.incompleteCount) {
            const incompleteCases = Storage.getIncompleteCases();
            elements.incompleteCount.textContent = incompleteCases.length;
        }
    }

    /**
     * Sparten-Liste rendern
     */
    function renderSpartenList(spartenStats) {
        if (!elements.spartenList) return;

        if (spartenStats.length === 0) {
            elements.spartenList.innerHTML = '<p class="text-muted">Keine Sparten vorhanden</p>';
            return;
        }

        elements.spartenList.innerHTML = spartenStats.map(s => `
            <span class="sparten-tag">
                ${escapeHtml(s.sparte)}
                <span class="count">${s.count}</span>
            </span>
        `).join('');
    }

    /**
     * Letzte Aktivitäten rendern (nach Datum geclustert)
     */
    function renderRecentActivity(activities, filterStatus, sortOrder) {
        if (!elements.recentActivityBody) return;

        // Filtern nach Status
        let filtered = activities || [];
        if (filterStatus) {
            filtered = filtered.filter(a => a.to === filterStatus);
        }

        // Sortieren
        if (sortOrder === 'asc') {
            filtered = filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else {
            filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        if (filtered.length === 0) {
            elements.recentActivityBody.innerHTML = '<tr><td colspan="4" class="text-muted">Keine Aktivitäten</td></tr>';
            return;
        }

        // Nach Datum gruppieren
        const groupedByDate = {};
        filtered.forEach(a => {
            const dateKey = formatDate(a.date);
            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = [];
            }
            groupedByDate[dateKey].push(a);
        });

        // HTML mit Datums-Headern generieren
        let html = '';
        Object.keys(groupedByDate).forEach(dateKey => {
            const activitiesForDate = groupedByDate[dateKey];

            // Datums-Header-Zeile
            html += `
                <tr class="date-header-row">
                    <td colspan="4" class="date-header">${dateKey}</td>
                </tr>
            `;

            // Aktivitäten für dieses Datum
            activitiesForDate.forEach(a => {
                const statusLabel = STATUS_LABELS[a.to] || a.to;
                const statusIcon = STATUS_ICONS[a.to] || '○';

                // Prüfen ob Aktivität neu ist (letzte 60 Minuten oder isNew Flag)
                const activityDate = parseGermanDate(a.date) || new Date(a.date);
                const isNew = a.isNew || (activityDate && !isNaN(activityDate.getTime()) && (Date.now() - activityDate.getTime() < 60 * 60 * 1000));
                const newClass = isNew ? ' new-activity' : '';

                html += `
                    <tr class="clickable-row${newClass}" data-case-id="${a.caseId}">
                        <td></td>
                        <td>${escapeHtml(a.kundeName)}</td>
                        <td>${escapeHtml(a.maklerName)}</td>
                        <td><span class="status-badge status-${a.to}">${statusIcon} ${statusLabel}</span></td>
                    </tr>
                `;
            });
        });

        elements.recentActivityBody.innerHTML = html;
    }

    /**
     * Import/Export Historie rendern
     */
    function renderImportExportHistory(history) {
        if (!elements.importExportHistory) return;

        if (!history || history.length === 0) {
            elements.importExportHistory.innerHTML = '<tr><td colspan="4" class="text-muted">Keine Historie vorhanden</td></tr>';
            return;
        }

        elements.importExportHistory.innerHTML = history.map(h => {
            const typeLabel = h.type === 'import' ? 'Import' : 'Export';
            const typeClass = h.type === 'import' ? 'status-angefragt' : 'status-exportiert';

            return `
                <tr>
                    <td>${formatDateTime(h.date)}</td>
                    <td><span class="status-badge ${typeClass}">${typeLabel}</span></td>
                    <td>${h.count} Vorgänge</td>
                    <td>${escapeHtml(h.user || 'Unbekannt')}</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Activity Filter Werte auslesen
     */
    function getActivityFilterValues() {
        return {
            status: elements.activityStatusFilter?.value || '',
            sort: elements.activitySort?.value || 'desc'
        };
    }

    /**
     * Dashboard-Suche: Live-Ergebnisse rendern
     */
    function renderDashboardSearchResults(cases, query) {
        if (!elements.dashboardSearchResults) return;

        // Keine Suche aktiv
        if (!query || query.trim().length < 2) {
            elements.dashboardSearchResults.innerHTML = '';
            elements.dashboardSearchResults.classList.remove('has-results');
            return;
        }

        elements.dashboardSearchResults.classList.add('has-results');

        if (!cases || cases.length === 0) {
            elements.dashboardSearchResults.innerHTML = '';
            return;
        }

        // Maximal 10 Ergebnisse anzeigen
        const limited = cases.slice(0, 10);

        elements.dashboardSearchResults.innerHTML = limited.map(c => {
            const kundeName = c.kunde?.name || 'Unbekannt';
            const vsNr = c.versicherungsnummer?.value || '-';
            const sparte = c.sparte || '-';
            const maklerName = c.makler?.name || '-';

            return `
                <div class="search-result-item" data-case-id="${c.id}">
                    <div class="search-result-info">
                        <div class="search-result-kunde">${escapeHtml(kundeName)}</div>
                        <div class="search-result-details">VS-Nr: ${escapeHtml(vsNr)} | ${escapeHtml(sparte)} | Makler: ${escapeHtml(maklerName)}</div>
                    </div>
                    <span class="status-badge status-${c.status}">${STATUS_ICONS[c.status] || ''} ${STATUS_LABELS[c.status] || c.status}</span>
                </div>
            `;
        }).join('');

        // Info wenn mehr Ergebnisse vorhanden
        if (cases.length > 10) {
            elements.dashboardSearchResults.innerHTML += `
                <div class="search-result-more">...und ${cases.length - 10} weitere Ergebnisse</div>
            `;
        }
    }

    /**
     * Navigation Counts aktualisieren
     */
    function updateNavCounts(vorgaenge, makler, emails) {
        if (elements.vorgaengeCount) elements.vorgaengeCount.textContent = vorgaenge;
        if (elements.maklerNavCount) elements.maklerNavCount.textContent = makler;
        if (elements.emailsNavCount) elements.emailsNavCount.textContent = emails;
    }

    /**
     * Vorgänge als Status-gruppierte Liste rendern
     */
    function renderCaseTiles(cases) {
        if (!elements.casesGroupedContainer) return;

        if (!cases || cases.length === 0) {
            elements.casesGroupedContainer.innerHTML = '';
            if (elements.vorgaengeEmpty) elements.vorgaengeEmpty.style.display = 'block';
            return;
        }

        if (elements.vorgaengeEmpty) elements.vorgaengeEmpty.style.display = 'none';

        // Nach Status gruppieren (in definierter Reihenfolge im Workflow)
        const STATUS_ORDER = ['unvollstaendig', 'zu-validieren', 'export-bereit', 'abgeschlossen', 'abgelehnt', 'wiedervorlage'];
        const grouped = {};

        STATUS_ORDER.forEach(status => {
            grouped[status] = cases.filter(c => c.status === status);
        });

        // HTML für jede Gruppe generieren
        let html = '';
        STATUS_ORDER.forEach(status => {
            const group = grouped[status];
            if (group.length === 0) return;

            const statusLabel = STATUS_LABELS[status] || status;
            const statusIcon = STATUS_ICONS[status] || '○';

            html += `
                <div class="status-group status-group-${status}">
                    <div class="status-group-header">
                        <span class="status-badge status-${status}">${statusIcon}</span>
                        <h3>${statusLabel}</h3>
                        <span class="status-group-count">${group.length}</span>
                    </div>
                    <div class="status-group-list">
                        ${group.map(c => renderCaseListItem(c)).join('')}
                    </div>
                </div>
            `;
        });

        elements.casesGroupedContainer.innerHTML = html;
    }

    /**
     * Einzelnes Listenelement rendern
     */
    function renderCaseListItem(c) {
        const kunde = c.kunde?.name || 'Unbekannt';
        const vsNr = c.versicherungsnummer?.value || '-';
        const sparte = c.sparte || '-';
        const makler = c.makler?.name || '-';
        const updatedAt = formatDate(c.updatedAt);

        // Export Badge
        const exportBadge = (c.exported && c.exported.date)
            ? `<span class="list-export-badge">Exportiert</span>`
            : '';

        return `
            <div class="case-list-item" data-case-id="${c.id}">
                <div class="case-list-main">
                    <div class="case-list-kunde">${escapeHtml(kunde)}</div>
                    <div class="case-list-details">
                        <span class="case-list-vsnr">VS-Nr: ${escapeHtml(vsNr)}</span>
                        <span class="case-list-sparte">${escapeHtml(sparte)}</span>
                        <span class="case-list-makler">Makler: ${escapeHtml(makler)}</span>
                    </div>
                </div>
                <div class="case-list-meta">
                    ${exportBadge}
                    <span class="case-list-date">${updatedAt}</span>
                </div>
            </div>
        `;
    }

    /**
     * Aktiven Workflow-Schritt ermitteln
     */
    function getActiveWorkflowStep(workflow) {
        for (const step of WORKFLOW_STEPS) {
            if (!workflow[step.key]) {
                return step.key;
            }
        }
        return null; // Alle abgeschlossen
    }

    /**
     * Makler-Tabelle rendern
     */
    function renderMaklerTable(maklerStats) {
        if (!elements.maklerTableBody) return;

        if (!maklerStats || maklerStats.length === 0) {
            elements.maklerTableBody.innerHTML = '';
            if (elements.maklerEmpty) elements.maklerEmpty.style.display = 'block';
            return;
        }

        if (elements.maklerEmpty) elements.maklerEmpty.style.display = 'none';

        elements.maklerTableBody.innerHTML = maklerStats.map(m => {
            return `
                <tr class="clickable-row" data-makler-name="${escapeHtml(m.name)}">
                    <td class="col-makler-name">${escapeHtml(m.name)}</td>
                    <td class="col-makler-email">${escapeHtml(m.email)}</td>
                    <td class="col-number">${m.total}</td>
                    <td class="col-number"><span class="text-success">${m.bestaetigt}</span></td>
                    <td class="col-number"><span class="text-warning">${m.offen}</span></td>
                    <td class="col-number"><span class="text-danger">${m.abgelehnt}</span></td>
                </tr>
            `;
        }).join('');
    }

    /**
     * E-Mail-Tabelle rendern
     */
    function renderEmailsTable(emails) {
        if (!elements.emailsTableBody) return;

        if (!emails || emails.length === 0) {
            elements.emailsTableBody.innerHTML = '';
            if (elements.emailsEmpty) elements.emailsEmpty.style.display = 'block';
            return;
        }

        if (elements.emailsEmpty) elements.emailsEmpty.style.display = 'none';

        elements.emailsTableBody.innerHTML = emails.map(email => {
            const isSent = email.folder === 'sent';
            const directionIcon = isSent ? '↑' : '↓';
            const directionClass = isSent ? 'direction-sent' : 'direction-inbox';
            const senderOrRecipient = email.senderEmail || '-';
            const subject = email.subject || 'Kein Betreff';
            const date = formatDateTime(email.receivedTime);
            const kunde = email.kundeName || 'Unbekannt';
            const status = email.status || 'neu';

            return `
                <tr class="clickable-row" data-case-id="${email.caseId}">
                    <td class="col-direction"><span class="${directionClass}">${directionIcon}</span></td>
                    <td class="col-datum">${date}</td>
                    <td class="col-sender">${escapeHtml(senderOrRecipient)}</td>
                    <td class="col-subject">${escapeHtml(subject)}</td>
                    <td class="col-kunde">${escapeHtml(kunde)}</td>
                    <td class="col-status">
                        <span class="status-badge status-${status}">${STATUS_ICONS[status] || '○'}</span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * View wechseln
     */
    function switchView(viewName) {
        // Nav-Buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `view-${viewName}`);
        });
    }

    /**
     * Case Modal öffnen
     */
    function openCaseModal(caseData) {
        if (!elements.caseModal) return;

        const isNew = !caseData;
        elements.modalTitle.textContent = isNew ? 'Neuer Vorgang' : 'Vorgang bearbeiten';

        // Formular zurücksetzen
        elements.caseForm.reset();

        if (caseData) {
            elements.caseId.value = caseData.id;
            elements.caseKunde.value = caseData.kunde?.name || '';
            elements.caseVsNr.value = caseData.versicherungsnummer?.value || '';
            elements.caseSparte.value = caseData.sparte || '';
            elements.caseDatum.value = caseData.gueltigkeitsdatum?.value || '';
            elements.caseMaklerName.value = caseData.makler?.name || '';
            elements.caseMaklerEmail.value = caseData.makler?.email || '';
            elements.caseStatus.value = caseData.status || 'neu';
            elements.caseNotes.value = caseData.notes || '';

            // Workflow Timeline rendern
            renderWorkflowTimeline(caseData.workflow || {});

            // Keywords rendern
            renderKeywords(caseData);

            // Verknüpfte Vorgänge rendern
            renderLinkedCases(caseData);

            // E-Mail Timeline mit Highlighting rendern
            renderEmailTimelineWithHighlights(caseData.messages || [], caseData);

            // Bei unvollständigen Vorgängen: fehlende Felder markieren
            highlightMissingFields(caseData);
        } else {
            elements.caseId.value = '';
            renderWorkflowTimeline({});
            renderKeywords(null);
            renderLinkedCases(null);
            renderEmailTimelineWithHighlights([], null);
            clearMissingFieldHighlights();
        }

        // Modal anzeigen
        elements.caseModal.style.display = 'flex';
    }

    /**
     * Fehlende Pflichtfelder bei unvollständigen Vorgängen hervorheben
     */
    function highlightMissingFields(caseData) {
        // Erst alle Markierungen entfernen
        clearMissingFieldHighlights();

        // Nur bei Status "unvollständig" markieren
        if (!caseData || caseData.status !== 'unvollstaendig') return;

        // Kunde prüfen
        if (!caseData.kunde?.name || !caseData.kunde.name.trim()) {
            elements.caseKunde?.closest('.stammdaten-item')?.classList.add('field-missing');
        }

        // VS-Nr prüfen
        if (!caseData.versicherungsnummer?.value || !caseData.versicherungsnummer.value.trim()) {
            elements.caseVsNr?.closest('.stammdaten-item')?.classList.add('field-missing');
        }
    }

    /**
     * Markierungen für fehlende Felder entfernen
     */
    function clearMissingFieldHighlights() {
        document.querySelectorAll('.stammdaten-item.field-missing').forEach(el => {
            el.classList.remove('field-missing');
        });
    }

    /**
     * Verknüpfte Vorgänge rendern (aus Sammelmail)
     */
    function renderLinkedCases(caseData) {
        if (!elements.linkedCasesCard || !elements.linkedCasesList) return;

        // Verknüpfte Vorgänge laden
        const linkedCases = caseData && caseData.id ? Storage.getLinkedCases(caseData.id) : [];

        if (linkedCases.length === 0) {
            elements.linkedCasesCard.style.display = 'none';
            return;
        }

        elements.linkedCasesCard.style.display = 'block';
        elements.linkedCasesCount.textContent = linkedCases.length;

        elements.linkedCasesList.innerHTML = linkedCases.map(c => {
            const kunde = c.kunde?.name || 'Unbekannt';
            const vsNr = c.versicherungsnummer?.value || '-';
            const sparte = c.sparte || '-';

            return `
                <div class="linked-case-item" data-case-id="${c.id}">
                    <div class="linked-case-status">
                        <span class="status-badge status-${c.status}">${STATUS_ICONS[c.status] || '○'}</span>
                    </div>
                    <div class="linked-case-info">
                        <div class="linked-case-kunde">${escapeHtml(kunde)}</div>
                        <div class="linked-case-details">${escapeHtml(vsNr)} · ${escapeHtml(sparte)}</div>
                    </div>
                    <div class="linked-case-arrow">→</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Workflow Timeline im Modal rendern
     */
    function renderWorkflowTimeline(workflow) {
        const stepElements = {
            mailReceived: elements.stepMailReceived,
            mailUploaded: elements.stepMailUploaded,
            kiRecognized: elements.stepKiRecognized,
            pvValidated: elements.stepPvValidated,
            exported: elements.stepExported
        };

        let lastCompletedIndex = -1;

        // Schritt-Daten und Status setzen
        WORKFLOW_STEPS.forEach((step, index) => {
            const stepEl = stepElements[step.key];
            const stepContainer = stepEl?.closest('.workflow-step');
            const connectorAfter = stepContainer?.nextElementSibling;

            if (!stepEl || !stepContainer) return;

            const stepDate = workflow[step.key];

            // Status-Klassen entfernen
            stepContainer.classList.remove('completed', 'active');

            if (stepDate) {
                // Schritt abgeschlossen
                stepContainer.classList.add('completed');
                stepEl.textContent = formatDate(stepDate);
                lastCompletedIndex = index;

                // Connector als completed markieren
                if (connectorAfter?.classList.contains('workflow-connector')) {
                    connectorAfter.classList.add('completed');
                }
            } else {
                stepEl.textContent = '–';
                if (connectorAfter?.classList.contains('workflow-connector')) {
                    connectorAfter.classList.remove('completed');
                }
            }
        });

        // Aktiven Schritt markieren (nächster nach letztem completed)
        const activeIndex = lastCompletedIndex + 1;
        if (activeIndex < WORKFLOW_STEPS.length) {
            const activeStepKey = WORKFLOW_STEPS[activeIndex].key;
            const activeEl = stepElements[activeStepKey]?.closest('.workflow-step');
            if (activeEl) {
                activeEl.classList.add('active');
            }
        }
    }

    /**
     * Erkannte Schlagwörter rendern
     */
    function renderKeywords(caseData) {
        if (!elements.keywordsList) return;

        if (!caseData) {
            elements.keywordsList.innerHTML = '<span class="text-muted">Keine Schlagwörter</span>';
            return;
        }

        const keywords = [];

        // Erkannte Felder als Keywords sammeln
        if (caseData.kunde?.name && caseData.kunde.source !== 'manual') {
            keywords.push({ field: 'Kunde', value: caseData.kunde.name, confidence: caseData.kunde.confidence });
        }
        if (caseData.versicherungsnummer?.value && caseData.versicherungsnummer.source !== 'manual') {
            keywords.push({ field: 'VS-Nr', value: caseData.versicherungsnummer.value, confidence: caseData.versicherungsnummer.confidence });
        }
        if (caseData.gueltigkeitsdatum?.value && caseData.gueltigkeitsdatum.source !== 'manual') {
            keywords.push({ field: 'Datum', value: caseData.gueltigkeitsdatum.value, confidence: caseData.gueltigkeitsdatum.confidence });
        }
        if (caseData.makler?.name && caseData.makler.email) {
            keywords.push({ field: 'Makler', value: caseData.makler.name });
        }
        if (caseData.sparte) {
            keywords.push({ field: 'Sparte', value: caseData.sparte });
        }

        if (keywords.length === 0) {
            elements.keywordsList.innerHTML = '<span class="text-muted">Keine automatisch erkannten Schlagwörter</span>';
            return;
        }

        elements.keywordsList.innerHTML = keywords.map(kw => `
            <span class="keyword-tag">
                <span class="keyword-field">${escapeHtml(kw.field)}:</span>
                <span class="keyword-value">${escapeHtml(kw.value)}</span>
            </span>
        `).join('');
    }

    /**
     * E-Mail Timeline mit Keyword-Highlighting rendern
     */
    function renderEmailTimelineWithHighlights(messages, caseData) {
        if (!elements.emailTimeline) return;

        elements.modalMailCount.textContent = messages.length;

        if (messages.length === 0) {
            elements.emailTimeline.innerHTML = '<p class="empty-message">Keine E-Mails vorhanden</p>';
            return;
        }

        // Keywords zum Highlighten sammeln
        const highlightTerms = [];
        if (caseData) {
            if (caseData.kunde?.name) {
                // Nur Nachname für besseres Matching
                const nameParts = caseData.kunde.name.split(',');
                highlightTerms.push(nameParts[0].trim());
            }
            if (caseData.versicherungsnummer?.value) {
                highlightTerms.push(caseData.versicherungsnummer.value);
            }
            if (caseData.gueltigkeitsdatum?.value) {
                highlightTerms.push(caseData.gueltigkeitsdatum.value);
            }
        }

        // Nach Datum sortieren (neueste zuerst)
        const sorted = [...messages].sort((a, b) => {
            const dateA = parseGermanDate(a.receivedTime) || new Date(0);
            const dateB = parseGermanDate(b.receivedTime) || new Date(0);
            return dateB - dateA;
        });

        elements.emailTimeline.innerHTML = sorted.map((msg, index) => {
            const isSent = msg.folder === 'sent';
            const directionIcon = isSent ? '↑' : '↓';
            const directionClass = isSent ? 'direction-sent' : 'direction-inbox';

            // Body mit Highlighting
            let bodyText = truncateText(msg.bodyPlain || msg.body || '', 800);
            bodyText = highlightKeywords(bodyText, highlightTerms);

            // Kurze Vorschau für den Bookmark
            const preview = truncateText(msg.bodyPlain || msg.body || '', 60);

            return `
                <div class="email-bookmark ${msg.folder}" data-email-index="${index}">
                    <div class="email-bookmark-header" onclick="UI.toggleEmailBody(this)">
                        <span class="email-expand-icon">▶</span>
                        <span class="email-direction ${directionClass}">${directionIcon}</span>
                        <span class="email-date">${formatDateTime(msg.receivedTime)}</span>
                        <span class="email-subject-short">${escapeHtml(msg.subject || 'Kein Betreff')}</span>
                        <span class="email-preview">${escapeHtml(preview)}</span>
                    </div>
                    <div class="email-bookmark-body" style="display: none;">
                        <div class="email-sender"><strong>Von:</strong> ${escapeHtml(msg.senderEmail || '-')}</div>
                        <div class="email-body">${bodyText}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Keywords im Text hervorheben
     */
    function highlightKeywords(text, keywords) {
        if (!keywords || keywords.length === 0) return escapeHtml(text);

        let result = escapeHtml(text);

        keywords.forEach(keyword => {
            if (!keyword) return;
            const escapedKeyword = escapeHtml(keyword);
            const regex = new RegExp(`(${escapeRegex(escapedKeyword)})`, 'gi');
            result = result.replace(regex, '<span class="highlight">$1</span>');
        });

        return result;
    }

    /**
     * Regex-Sonderzeichen escapen
     */
    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Case Modal schließen
     */
    function closeCaseModal() {
        if (elements.caseModal) {
            elements.caseModal.style.display = 'none';
        }
    }

    /**
     * Makler Modal öffnen
     */
    function openMaklerModal(maklerData, cases) {
        if (!elements.maklerModal) return;

        elements.maklerModalTitle.textContent = maklerData.name;

        // Makler Info
        elements.maklerInfo.innerHTML = `
            <div class="makler-detail">
                <span class="label">E-Mail:</span>
                <span class="value">${escapeHtml(maklerData.email)}</span>
            </div>
            <div class="makler-stats">
                <span class="makler-stat">
                    <span class="number">${maklerData.total}</span>
                    <span class="label">Vorgänge</span>
                </span>
                <span class="makler-stat text-success">
                    <span class="number">${maklerData.bestaetigt}</span>
                    <span class="label">Bestätigt</span>
                </span>
                <span class="makler-stat text-warning">
                    <span class="number">${maklerData.offen}</span>
                    <span class="label">Offen</span>
                </span>
                <span class="makler-stat text-danger">
                    <span class="number">${maklerData.abgelehnt}</span>
                    <span class="label">Abgelehnt</span>
                </span>
            </div>
        `;

        // Vorgänge-Tabelle
        elements.maklerCasesBody.innerHTML = cases.map(c => {
            const kunde = c.kunde?.name || 'Unbekannt';
            const vsNr = c.versicherungsnummer?.value || '-';
            const sparte = c.sparte || '-';
            const updatedAt = formatDate(c.updatedAt);

            return `
                <tr class="clickable-row" data-case-id="${c.id}">
                    <td>
                        <span class="status-badge status-${c.status}">${STATUS_ICONS[c.status] || '○'}</span>
                    </td>
                    <td>${escapeHtml(kunde)}</td>
                    <td>${escapeHtml(vsNr)}</td>
                    <td>${escapeHtml(sparte)}</td>
                    <td>${updatedAt}</td>
                </tr>
            `;
        }).join('');

        // Modal anzeigen
        elements.maklerModal.style.display = 'flex';
    }

    /**
     * Makler Modal schließen
     */
    function closeMaklerModal() {
        if (elements.maklerModal) {
            elements.maklerModal.style.display = 'none';
        }
    }

    /**
     * Export Modal öffnen
     */
    function openExportModal(caseCount) {
        if (!elements.exportModal) return;

        elements.exportCaseCount.textContent = caseCount;
        elements.exporterName.value = '';
        elements.exportModal.style.display = 'flex';
    }

    /**
     * Export Modal schließen
     */
    function closeExportModal() {
        if (elements.exportModal) {
            elements.exportModal.style.display = 'none';
        }
    }

    /**
     * Exporter-Name holen
     */
    function getExporterName() {
        return elements.exporterName?.value.trim() || '';
    }

    // Validation Modal State
    let validationState = {
        cases: [],
        currentIndex: 0
    };

    /**
     * Validation Modal öffnen mit Liste der zu validierenden Vorgänge
     */
    function openValidationModal(casesToValidate) {
        if (!elements.validationModal || !casesToValidate || casesToValidate.length === 0) {
            showToast('Keine Vorgänge zur Validierung vorhanden', 'info');
            return;
        }

        validationState.cases = casesToValidate;
        validationState.currentIndex = 0;

        elements.validationTotal.textContent = casesToValidate.length;
        renderValidationCase();
        elements.validationModal.style.display = 'flex';
    }

    /**
     * Validation Modal schließen
     */
    function closeValidationModal() {
        if (elements.validationModal) {
            elements.validationModal.style.display = 'none';
        }
        validationState.cases = [];
        validationState.currentIndex = 0;
    }

    /**
     * Aktuellen Vorgang im Validation Modal rendern
     */
    function renderValidationCase() {
        const caseData = validationState.cases[validationState.currentIndex];
        if (!caseData) return;

        // Progress aktualisieren
        elements.validationCurrent.textContent = validationState.currentIndex + 1;

        // Reject-Section zurücksetzen
        if (elements.valRejectSection) {
            elements.valRejectSection.style.display = 'none';
        }
        if (elements.valRejectReason) {
            elements.valRejectReason.value = '';
        }

        // Extrahierte Werte für Highlighting sammeln
        const extractedValues = [];

        // Export-relevante Felder als Eingabefelder setzen
        const kundeName = caseData.kunde?.name || '';
        if (elements.valKunde) {
            elements.valKunde.value = kundeName;
            if (kundeName) extractedValues.push(kundeName);
        }

        const vsNr = caseData.versicherungsnummer?.value || '';
        if (elements.valVsNr) {
            elements.valVsNr.value = vsNr;
            if (vsNr) extractedValues.push(vsNr);
        }

        const sparte = caseData.sparte || '';
        if (elements.valSparte) {
            elements.valSparte.value = sparte;
            if (sparte) extractedValues.push(sparte);
        }

        // Datum: DD.MM.YYYY → YYYY-MM-DD für HTML date input
        const datumRaw = caseData.gueltigkeitsdatum?.value || '';
        if (elements.valDatum) {
            const datumISO = convertGermanDateToISO(datumRaw);
            elements.valDatum.value = datumISO;
            if (datumRaw) extractedValues.push(datumRaw);
        }

        const maklerName = caseData.makler?.name || '';
        if (elements.valMakler) {
            elements.valMakler.value = maklerName;
            if (maklerName) extractedValues.push(maklerName);
        }

        // Wiedervorlage zurücksetzen (oder aus caseData laden falls vorhanden)
        if (elements.valWiedervorlage) {
            const wiedervorlageRaw = caseData.wiedervorlage || '';
            elements.valWiedervorlage.value = convertGermanDateToISO(wiedervorlageRaw);
        }

        // E-Mail Preview mit Keyword-Highlighting
        const firstMsg = caseData.messages?.[0];
        if (firstMsg) {
            const bodyText = firstMsg.bodyPlain || firstMsg.body || '';
            const bodyPreview = truncateText(bodyText, 500);
            const highlightedBody = highlightKeywords(escapeHtml(bodyPreview), extractedValues);

            elements.valEmailPreview.innerHTML = `
                <div class="email-preview-subject">${escapeHtml(firstMsg.subject || 'Kein Betreff')}</div>
                <div class="email-preview-body">${highlightedBody}</div>
            `;
        } else {
            elements.valEmailPreview.innerHTML = '<span class="text-muted">Keine E-Mail vorhanden</span>';
        }
    }

    /**
     * Deutsches Datum (DD.MM.YYYY) zu ISO (YYYY-MM-DD) konvertieren
     */
    function convertGermanDateToISO(dateStr) {
        if (!dateStr) return '';
        // Prüfen ob bereits ISO-Format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        // DD.MM.YYYY konvertieren
        const match = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (match) {
            const day = match[1].padStart(2, '0');
            const month = match[2].padStart(2, '0');
            const year = match[3];
            return `${year}-${month}-${day}`;
        }
        return '';
    }

    /**
     * ISO-Datum (YYYY-MM-DD) zu deutschem Format (DD.MM.YYYY) konvertieren
     */
    function convertISOToGermanDate(dateStr) {
        if (!dateStr) return '';
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
            return `${match[3]}.${match[2]}.${match[1]}`;
        }
        return dateStr;
    }

    /**
     * Keywords im Text hervorheben
     */
    function highlightKeywords(text, keywords) {
        if (!keywords || keywords.length === 0) return text;

        let result = text;
        keywords.forEach(keyword => {
            if (!keyword || keyword.length < 2) return;
            // Case-insensitive Ersetzung
            const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
            result = result.replace(regex, '<mark>$1</mark>');
        });
        return result;
    }

    /**
     * RegExp-Sonderzeichen escapen
     */
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Validierungsdaten aus Formular lesen
     */
    function getValidationFormData() {
        return {
            kunde: elements.valKunde?.value?.trim() || '',
            vsNr: elements.valVsNr?.value?.trim() || '',
            sparte: elements.valSparte?.value || '',
            datum: elements.valDatum?.value || '',
            makler: elements.valMakler?.value?.trim() || '',
            wiedervorlage: elements.valWiedervorlage?.value || '',
            rejectReason: elements.valRejectReason?.value?.trim() || ''
        };
    }

    /**
     * Ablehnungs-Bereich ein-/ausblenden
     */
    function toggleRejectSection(show) {
        if (elements.valRejectSection) {
            elements.valRejectSection.style.display = show ? 'block' : 'none';
            if (show && elements.valRejectReason) {
                elements.valRejectReason.focus();
            }
        }
    }

    /**
     * Prüfen ob Ablehnungsgrund eingegeben wurde
     */
    function hasRejectReason() {
        return (elements.valRejectReason?.value?.trim() || '').length > 0;
    }

    /**
     * E-Mail Body ein-/ausklappen (Bookmark-Style)
     */
    function toggleEmailBody(headerElement) {
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
    }

    /**
     * Zum nächsten Vorgang in der Validierung springen
     */
    function nextValidationCase() {
        if (validationState.currentIndex < validationState.cases.length - 1) {
            validationState.currentIndex++;
            renderValidationCase();
            return true;
        }
        return false; // Letzter Vorgang erreicht
    }

    /**
     * Aktuellen Vorgang zur Validierung holen
     */
    function getCurrentValidationCase() {
        return validationState.cases[validationState.currentIndex] || null;
    }

    /**
     * Prüfen ob noch weitere Vorgänge vorhanden sind
     */
    function hasMoreValidationCases() {
        return validationState.currentIndex < validationState.cases.length - 1;
    }

    /**
     * Toast-Benachrichtigung anzeigen
     */
    function showToast(message, type = 'info', duration = 4000) {
        if (!elements.toastContainer) return;

        const icons = {
            success: '✔',
            error: '✕',
            warning: '△',
            info: 'ℹ'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${escapeHtml(message)}</span>
        `;

        elements.toastContainer.appendChild(toast);

        // Nach Dauer entfernen
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Drop-Overlay anzeigen/verstecken
     */
    function showDropOverlay(show) {
        if (elements.dropOverlay) {
            elements.dropOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Formular-Daten auslesen
     */
    function getCaseFormData() {
        return {
            id: elements.caseId.value || null,
            kunde: {
                name: elements.caseKunde.value.trim(),
                confidence: 1.0,
                source: 'manual'
            },
            versicherungsnummer: {
                value: elements.caseVsNr.value.trim(),
                confidence: 1.0,
                source: 'manual'
            },
            sparte: elements.caseSparte.value,
            status: elements.caseStatus.value,
            gueltigkeitsdatum: elements.caseDatum.value ? {
                value: elements.caseDatum.value.trim(),
                confidence: 1.0,
                source: 'manual'
            } : null,
            makler: {
                name: elements.caseMaklerName.value.trim(),
                email: elements.caseMaklerEmail.value.trim()
            },
            notes: elements.caseNotes.value.trim()
        };
    }

    /**
     * Filter-Werte auslesen (Vorgänge View)
     */
    function getVorgaengeFilterValues() {
        return {
            search: elements.vorgaengeSearch?.value.trim().toLowerCase() || '',
            sparte: elements.filterSparte?.value || '',
            exportFilter: elements.filterExport?.value || ''
        };
    }

    /**
     * Makler-Suchwert auslesen
     */
    function getMaklerSearchValue() {
        return elements.maklerSearch?.value.trim().toLowerCase() || '';
    }

    /**
     * E-Mail-Filter auslesen
     */
    function getEmailFilterValues() {
        return {
            search: elements.emailSearch?.value.trim().toLowerCase() || '',
            sort: elements.emailSort?.value || 'desc'
        };
    }

    /**
     * Datum formatieren (TT.MM.JJJJ)
     */
    function formatDate(dateStr) {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    }

    /**
     * Deutsches Datumsformat parsen (dd.mm.yyyy hh:nn:ss)
     */
    function parseGermanDate(dateStr) {
        if (!dateStr) return null;

        // Bereits ein Date-Objekt oder ISO-String?
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d;

        // Deutsches Format: "dd.mm.yyyy hh:nn:ss" oder "dd.mm.yyyy"
        const match = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
        if (match) {
            const [, day, month, year, hour = '0', minute = '0', second = '0'] = match;
            return new Date(year, month - 1, day, hour, minute, second);
        }

        return null;
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '-';
        try {
            const date = parseGermanDate(dateStr);
            if (!date || isNaN(date.getTime())) return '-';

            return date.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    }

    /**
     * Text kürzen
     */
    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * HTML-Zeichen escapen
     */
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Öffentliche API
    return {
        init,
        elements,

        // Dashboard
        renderDashboardKPIs,
        renderSpartenList,
        renderRecentActivity,
        renderImportExportHistory,
        renderDashboardSearchResults,
        getActivityFilterValues,

        // Navigation
        updateNavCounts,
        switchView,

        // Rendering
        renderCaseTiles,
        renderMaklerTable,
        renderEmailsTable,

        // Modals
        openCaseModal,
        closeCaseModal,
        openMaklerModal,
        closeMaklerModal,
        openExportModal,
        closeExportModal,
        getExporterName,
        openValidationModal,
        closeValidationModal,
        nextValidationCase,
        getCurrentValidationCase,
        hasMoreValidationCases,
        getValidationFormData,
        toggleRejectSection,
        hasRejectReason,
        toggleEmailBody,

        // Notifications
        showToast,
        showDropOverlay,

        // Formulare
        getCaseFormData,
        getVorgaengeFilterValues,
        getMaklerSearchValue,
        getEmailFilterValues,

        // Hilfsfunktionen
        formatDate,
        formatDateTime,
        parseGermanDate,
        escapeHtml,

        // Konstanten
        STATUS_ICONS,
        STATUS_LABELS,
        WORKFLOW_STEPS
    };
})();
