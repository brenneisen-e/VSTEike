/**
 * Banken Module - Print/PDF Export
 * Generates a comprehensive PDF overview of the tool
 */

import { DEMO_CUSTOMER_DATA } from '../banken-chat/_constants.js';

/**
 * Generate and print a comprehensive tool overview as PDF
 */
export function printToolOverview() {
    // Show loading indicator
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'printLoadingOverlay';
    loadingOverlay.innerHTML = `
        <div class="print-loading-content">
            <div class="print-loading-spinner"></div>
            <h3>PDF wird erstellt...</h3>
            <p>Bitte warten Sie, während alle Ansichten vorbereitet werden.</p>
        </div>
    `;
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
    `;
    document.body.appendChild(loadingOverlay);

    // Add loading styles
    const loadingStyles = document.createElement('style');
    loadingStyles.textContent = `
        .print-loading-content {
            background: white;
            padding: 40px 60px;
            border-radius: 16px;
            text-align: center;
        }
        .print-loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #e2e8f0;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .print-loading-content h3 {
            margin: 0 0 8px 0;
            color: #1e293b;
        }
        .print-loading-content p {
            margin: 0;
            color: #64748b;
        }
    `;
    document.head.appendChild(loadingStyles);

    // Get a sample customer for demo
    const sampleCustomer = DEMO_CUSTOMER_DATA.find(c => c.segment === 'eskalation') || DEMO_CUSTOMER_DATA[0];

    // Generate the print content
    setTimeout(() => {
        const printContent = generatePrintContent(sampleCustomer);

        // Open print window
        const printWindow = window.open('', '_blank', 'width=1200,height=800');

        if (!printWindow) {
            loadingOverlay.remove();
            loadingStyles.remove();
            alert('Popup wurde blockiert. Bitte erlauben Sie Popups für diese Seite.');
            return;
        }

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
            setTimeout(() => {
                loadingOverlay.remove();
                loadingStyles.remove();
                printWindow.print();
            }, 500);
        };
    }, 100);
}

/**
 * Generate the complete HTML content for printing
 */
function generatePrintContent(customer) {
    const today = new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Collections Management - Tool-Übersicht</title>
    <style>
        ${getPrintStyles()}
    </style>
</head>
<body>
    ${generateTitlePage(today)}
    ${generateDashboardPage()}
    ${generateSegmentPage()}
    ${generateCustomerOverviewPage(customer)}
    ${generateCustomerTabsPage(customer)}
    ${generateKIAnalysePage(customer)}
    ${generateNPLDashboardPage()}
    ${generateStage2Page()}
    ${generateAufgabenPage()}
</body>
</html>
    `;
}

/**
 * Generate print-specific CSS styles
 */
function getPrintStyles() {
    return `
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1e293b;
            background: white;
        }

        .page {
            page-break-after: always;
            padding: 40px;
            min-height: 100vh;
        }

        .page:last-child {
            page-break-after: auto;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
        }

        .page-title {
            font-size: 24pt;
            font-weight: 700;
            color: #0f172a;
        }

        .page-subtitle {
            font-size: 14pt;
            color: #64748b;
            margin-top: 4px;
        }

        .page-number {
            font-size: 10pt;
            color: #94a3b8;
        }

        /* Title Page */
        .title-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }

        .title-page .logo {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 40px;
        }

        .title-page .logo svg {
            width: 60px;
            height: 60px;
            color: white;
        }

        .title-page h1 {
            font-size: 36pt;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 10px;
        }

        .title-page h2 {
            font-size: 18pt;
            font-weight: 400;
            color: #64748b;
            margin-bottom: 60px;
        }

        .title-page .meta {
            font-size: 12pt;
            color: #94a3b8;
        }

        /* KPI Cards */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }

        .kpi-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
        }

        .kpi-card.primary {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-color: #93c5fd;
        }

        .kpi-card.danger {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border-color: #fecaca;
        }

        .kpi-card.warning {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border-color: #fde68a;
        }

        .kpi-card.success {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-color: #bbf7d0;
        }

        .kpi-label {
            font-size: 10pt;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .kpi-value {
            font-size: 24pt;
            font-weight: 700;
            color: #0f172a;
        }

        .kpi-card.danger .kpi-value { color: #dc2626; }
        .kpi-card.warning .kpi-value { color: #d97706; }
        .kpi-card.success .kpi-value { color: #16a34a; }

        .kpi-change {
            font-size: 10pt;
            margin-top: 8px;
        }

        .kpi-change.positive { color: #16a34a; }
        .kpi-change.negative { color: #dc2626; }

        /* Segment Matrix */
        .matrix-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 20px 0;
        }

        .matrix-quadrant {
            padding: 20px;
            border-radius: 12px;
            border: 1px solid;
        }

        .matrix-quadrant.eskalation {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border-color: #fecaca;
        }

        .matrix-quadrant.prioritaet {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border-color: #fde68a;
        }

        .matrix-quadrant.restrukturierung {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-color: #93c5fd;
        }

        .matrix-quadrant.abwicklung {
            background: linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%);
            border-color: #d4d4d8;
        }

        .quadrant-title {
            font-size: 14pt;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .quadrant-stats {
            font-size: 10pt;
            color: #64748b;
        }

        /* Customer Detail */
        .customer-header {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 12px;
        }

        .customer-avatar {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 28pt;
            font-weight: 600;
        }

        .customer-info h3 {
            font-size: 18pt;
            margin-bottom: 4px;
        }

        .customer-info .id {
            font-size: 10pt;
            color: #64748b;
        }

        .customer-badges {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }

        .badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 9pt;
            font-weight: 500;
        }

        .badge.danger {
            background: #fee2e2;
            color: #dc2626;
        }

        .badge.warning {
            background: #fef3c7;
            color: #d97706;
        }

        .badge.info {
            background: #dbeafe;
            color: #2563eb;
        }

        /* Data Grid */
        .data-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 20px 0;
        }

        .data-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
        }

        .data-section h4 {
            font-size: 12pt;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
        }

        .data-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
        }

        .data-row:last-child {
            border-bottom: none;
        }

        .data-label {
            color: #64748b;
            font-size: 10pt;
        }

        .data-value {
            font-weight: 500;
            text-align: right;
        }

        /* AI Summary */
        .ai-summary {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 1px solid #bae6fd;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }

        .ai-summary h4 {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 12pt;
            color: #0369a1;
            margin-bottom: 12px;
        }

        .ai-summary p {
            font-size: 11pt;
            line-height: 1.6;
            color: #334155;
        }

        .ai-highlight {
            margin-top: 12px;
            padding: 12px 15px;
            background: white;
            border-left: 3px solid #f59e0b;
            border-radius: 0 8px 8px 0;
            font-style: italic;
        }

        /* Tables */
        .table-container {
            margin: 20px 0;
            overflow: hidden;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #f1f5f9;
            padding: 12px 15px;
            text-align: left;
            font-size: 10pt;
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        td {
            padding: 12px 15px;
            border-top: 1px solid #e2e8f0;
            font-size: 10pt;
        }

        tr:nth-child(even) {
            background: #f8fafc;
        }

        /* Tab Preview */
        .tabs-preview {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
        }

        .tab-item {
            padding: 10px 20px;
            background: #f1f5f9;
            border-radius: 8px;
            font-size: 10pt;
            font-weight: 500;
            color: #64748b;
        }

        .tab-item.active {
            background: #3b82f6;
            color: white;
        }

        /* Quick Actions */
        .quick-actions {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin: 20px 0;
        }

        .action-btn {
            padding: 15px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            text-align: center;
        }

        .action-btn .icon {
            font-size: 20pt;
            margin-bottom: 8px;
        }

        .action-btn .label {
            font-size: 10pt;
            color: #475569;
        }

        /* Timeline */
        .timeline {
            margin: 20px 0;
        }

        .timeline-item {
            display: flex;
            gap: 15px;
            padding: 15px 0;
            border-bottom: 1px solid #f1f5f9;
        }

        .timeline-dot {
            width: 12px;
            height: 12px;
            background: #3b82f6;
            border-radius: 50%;
            margin-top: 4px;
        }

        .timeline-content {
            flex: 1;
        }

        .timeline-title {
            font-weight: 500;
            margin-bottom: 4px;
        }

        .timeline-meta {
            font-size: 9pt;
            color: #94a3b8;
        }

        /* Section Description */
        .section-desc {
            background: #f8fafc;
            border-left: 4px solid #3b82f6;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }

        .section-desc h5 {
            font-size: 11pt;
            margin-bottom: 8px;
        }

        .section-desc p {
            font-size: 10pt;
            color: #64748b;
            margin: 0;
        }

        /* Print specific */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .page {
                padding: 20mm;
            }
        }
    `;
}

/**
 * Generate title page
 */
function generateTitlePage(today) {
    return `
    <div class="page title-page">
        <div class="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
        </div>
        <h1>Collections Management</h1>
        <h2>Forderungsmanagement mit KI-Unterstützung</h2>
        <div class="meta">
            <p><strong>Tool-Übersicht</strong></p>
            <p>Erstellt am ${today}</p>
            <p>Demo-Version</p>
        </div>
    </div>
    `;
}

/**
 * Generate dashboard overview page
 */
function generateDashboardPage() {
    return `
    <div class="page">
        <div class="page-header">
            <div>
                <div class="page-title">Dashboard Übersicht</div>
                <div class="page-subtitle">Gesamtportfolio auf einen Blick</div>
            </div>
            <div class="page-number">Seite 2</div>
        </div>

        <div class="section-desc">
            <h5>Zentrale Steuerung des Forderungsmanagements</h5>
            <p>Das Dashboard bietet einen Echtzeit-Überblick über alle relevanten KPIs und ermöglicht schnelle Entscheidungen durch KI-gestützte Analysen.</p>
        </div>

        <div class="kpi-grid">
            <div class="kpi-card primary">
                <div class="kpi-label">Gesamtforderungen</div>
                <div class="kpi-value">€ 847,2 Mio</div>
                <div class="kpi-change positive">↑ 2,3% vs. Vormonat</div>
            </div>
            <div class="kpi-card danger">
                <div class="kpi-label">Überfällig >90 Tage</div>
                <div class="kpi-value">€ 12,4 Mio</div>
                <div class="kpi-change negative">↑ 5,1% kritisch</div>
            </div>
            <div class="kpi-card warning">
                <div class="kpi-label">Aktive Fälle</div>
                <div class="kpi-value">2.344</div>
                <div class="kpi-change">187 neue diese Woche</div>
            </div>
            <div class="kpi-card success">
                <div class="kpi-label">Realisierungsquote</div>
                <div class="kpi-value">67,8%</div>
                <div class="kpi-change positive">↑ 3,2% vs. Vorjahr</div>
            </div>
        </div>

        <h3 style="margin: 30px 0 15px;">Portfolio-Entwicklung</h3>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Segment</th>
                        <th>Anzahl Fälle</th>
                        <th>Volumen</th>
                        <th>Ø DPD</th>
                        <th>Trend</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="badge danger">Eskalation</span></td>
                        <td>312</td>
                        <td>€ 8,7 Mio</td>
                        <td>78 Tage</td>
                        <td style="color: #dc2626;">↑ +12%</td>
                    </tr>
                    <tr>
                        <td><span class="badge warning">Priorität</span></td>
                        <td>845</td>
                        <td>€ 21,4 Mio</td>
                        <td>32 Tage</td>
                        <td style="color: #16a34a;">↓ -5%</td>
                    </tr>
                    <tr>
                        <td><span class="badge info">Restrukturierung</span></td>
                        <td>523</td>
                        <td>€ 45,2 Mio</td>
                        <td>54 Tage</td>
                        <td style="color: #d97706;">↔ 0%</td>
                    </tr>
                    <tr>
                        <td>Abwicklung</td>
                        <td>664</td>
                        <td>€ 15,8 Mio</td>
                        <td>124 Tage</td>
                        <td style="color: #dc2626;">↑ +8%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    `;
}

/**
 * Generate segmentation page
 */
function generateSegmentPage() {
    return `
    <div class="page">
        <div class="page-header">
            <div>
                <div class="page-title">KI-Segmentierung</div>
                <div class="page-subtitle">Intelligente Kategorisierung nach Handlungsbedarf</div>
            </div>
            <div class="page-number">Seite 3</div>
        </div>

        <div class="section-desc">
            <h5>Automatische Priorisierung durch Machine Learning</h5>
            <p>Die KI analysiert kontinuierlich alle Fälle und segmentiert sie basierend auf Zahlungswahrscheinlichkeit, Risikoprofil und optimaler Bearbeitungsstrategie.</p>
        </div>

        <div class="matrix-container">
            <div class="matrix-quadrant eskalation">
                <div class="quadrant-title">🔴 Eskalation</div>
                <div class="quadrant-stats">
                    <strong>312 Fälle</strong> · € 8,7 Mio<br>
                    Sofortiger Handlungsbedarf, hohes Risiko
                </div>
            </div>
            <div class="matrix-quadrant prioritaet">
                <div class="quadrant-title">🟡 Priorität</div>
                <div class="quadrant-stats">
                    <strong>845 Fälle</strong> · € 21,4 Mio<br>
                    Zeitnahe Bearbeitung empfohlen
                </div>
            </div>
            <div class="matrix-quadrant restrukturierung">
                <div class="quadrant-title">🔵 Restrukturierung</div>
                <div class="quadrant-stats">
                    <strong>523 Fälle</strong> · € 45,2 Mio<br>
                    Vereinbarungen möglich
                </div>
            </div>
            <div class="matrix-quadrant abwicklung">
                <div class="quadrant-title">⚫ Abwicklung</div>
                <div class="quadrant-stats">
                    <strong>664 Fälle</strong> · € 15,8 Mio<br>
                    Geringe Erfolgsaussicht
                </div>
            </div>
        </div>

        <h3 style="margin: 30px 0 15px;">Neue Fälle diese Woche</h3>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Kunde</th>
                        <th>Forderung</th>
                        <th>DPD</th>
                        <th>Segment</th>
                        <th>KI-Empfehlung</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Müller, Hans</td>
                        <td>€ 84.230</td>
                        <td>2 Tage</td>
                        <td><span class="badge warning">Priorität</span></td>
                        <td>Zahlungserinnerung senden</td>
                    </tr>
                    <tr>
                        <td>Schmidt GmbH</td>
                        <td>€ 142.890</td>
                        <td>3 Tage</td>
                        <td><span class="badge warning">Priorität</span></td>
                        <td>Telefonische Kontaktaufnahme</td>
                    </tr>
                    <tr>
                        <td>Weber, Anna</td>
                        <td>€ 52.150</td>
                        <td>5 Tage</td>
                        <td><span class="badge warning">Priorität</span></td>
                        <td>Ratenzahlung anbieten</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    `;
}

/**
 * Generate customer overview page
 */
function generateCustomerOverviewPage(customer) {
    const initials = customer.name.split(' ').map(n => n[0]).join('').substring(0, 2);

    return `
    <div class="page">
        <div class="page-header">
            <div>
                <div class="page-title">Kundendetail-Ansicht</div>
                <div class="page-subtitle">360° Kundenübersicht mit KI-Analyse</div>
            </div>
            <div class="page-number">Seite 4</div>
        </div>

        <div class="section-desc">
            <h5>Vollständige Kundenhistorie auf einen Blick</h5>
            <p>Alle relevanten Informationen zum Kunden inklusive Zahlungshistorie, Kommunikation und KI-gestützte Handlungsempfehlungen.</p>
        </div>

        <div class="customer-header">
            <div class="customer-avatar">${initials}</div>
            <div class="customer-info">
                <h3>${customer.name}</h3>
                <div class="id">${customer.id}</div>
                <div class="customer-badges">
                    <span class="badge danger">${customer.segment.charAt(0).toUpperCase() + customer.segment.slice(1)}</span>
                    <span class="badge warning">${customer.dpd} Tage überfällig</span>
                    <span class="badge info">${customer.status}</span>
                </div>
            </div>
        </div>

        <div class="ai-summary">
            <h4>🤖 KI-Zusammenfassung</h4>
            <p>
                <strong>${customer.name}</strong> ist ein ${customer.segment === 'eskalation' ? 'kritischer' : 'priorisierter'} Fall mit einer
                offenen Forderung von <strong>€ ${customer.forderung.toLocaleString('de-DE')}</strong>.
                Die Überfälligkeit beträgt <strong>${customer.dpd} Tage</strong>.
                ${customer.dpd > 30 ? 'Aufgrund der langen Überfälligkeit wird eine sofortige Eskalation empfohlen.' : 'Eine zeitnahe Kontaktaufnahme wird empfohlen.'}
            </p>
            <div class="ai-highlight">
                ⚠️ Empfehlung: ${customer.dpd > 60 ? 'Inkasso-Verfahren einleiten oder Forderungsverkauf prüfen' :
                               customer.dpd > 30 ? 'Letzte Mahnung versenden und Telefonat ansetzen' :
                               'Zahlungserinnerung mit Ratenzahlungsangebot versenden'}
            </div>
        </div>

        <div class="data-grid">
            <div class="data-section">
                <h4>Forderungsdaten</h4>
                <div class="data-row">
                    <span class="data-label">Offene Forderung</span>
                    <span class="data-value">€ ${customer.forderung.toLocaleString('de-DE')}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Überfällig seit</span>
                    <span class="data-value">${customer.dpd} Tage</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Status</span>
                    <span class="data-value">${customer.status}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Letzte Zahlung</span>
                    <span class="data-value">${customer.dpd > 60 ? 'Vor 3+ Monaten' : 'Vor 4 Wochen'}</span>
                </div>
            </div>
            <div class="data-section">
                <h4>Kontaktdaten</h4>
                <div class="data-row">
                    <span class="data-label">Telefon</span>
                    <span class="data-value">+49 89 1234567</span>
                </div>
                <div class="data-row">
                    <span class="data-label">E-Mail</span>
                    <span class="data-value">kontakt@${customer.name.toLowerCase().replace(/[^a-z]/g, '')}.de</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Adresse</span>
                    <span class="data-value">Musterstr. 123, 80331 München</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Letzte Erreichbarkeit</span>
                    <span class="data-value">12.12.2025</span>
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Generate customer tabs preview page
 */
function generateCustomerTabsPage(customer) {
    return `
    <div class="page">
        <div class="page-header">
            <div>
                <div class="page-title">Kunden-Detailansichten</div>
                <div class="page-subtitle">Verfügbare Tabs und Funktionen</div>
            </div>
            <div class="page-number">Seite 5</div>
        </div>

        <div class="tabs-preview">
            <div class="tab-item active">Übersicht</div>
            <div class="tab-item">Dokumente</div>
            <div class="tab-item">Kredite</div>
            <div class="tab-item">Transaktionen</div>
            <div class="tab-item">Timeline</div>
        </div>

        <h3 style="margin-bottom: 15px;">Schnellaktionen</h3>
        <div class="quick-actions">
            <div class="action-btn">
                <div class="icon">📞</div>
                <div class="label">Anruf starten</div>
            </div>
            <div class="action-btn">
                <div class="icon">📧</div>
                <div class="label">E-Mail senden</div>
            </div>
            <div class="action-btn">
                <div class="icon">📝</div>
                <div class="label">Mahnung erstellen</div>
            </div>
            <div class="action-btn">
                <div class="icon">💳</div>
                <div class="label">Lastschriftsperre</div>
            </div>
            <div class="action-btn">
                <div class="icon">📅</div>
                <div class="label">Ratenzahlung</div>
            </div>
            <div class="action-btn">
                <div class="icon">⚖️</div>
                <div class="label">Inkasso einleiten</div>
            </div>
        </div>

        <h3 style="margin: 30px 0 15px;">Dokumente</h3>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Dokument</th>
                        <th>Typ</th>
                        <th>Datum</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Mahnung Stufe 2</td>
                        <td>PDF</td>
                        <td>10.12.2025</td>
                        <td><span class="badge warning">Versendet</span></td>
                    </tr>
                    <tr>
                        <td>Zahlungserinnerung</td>
                        <td>PDF</td>
                        <td>25.11.2025</td>
                        <td><span class="badge info">Zugestellt</span></td>
                    </tr>
                    <tr>
                        <td>Kreditvertrag</td>
                        <td>PDF</td>
                        <td>15.03.2024</td>
                        <td>Archiv</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h3 style="margin: 30px 0 15px;">Aktivitäten-Timeline</h3>
        <div class="timeline">
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-title">Mahnung Stufe 2 versendet</div>
                    <div class="timeline-meta">10.12.2025 · System</div>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-dot" style="background: #f59e0b;"></div>
                <div class="timeline-content">
                    <div class="timeline-title">Telefonat - nicht erreicht</div>
                    <div class="timeline-meta">08.12.2025 · M. Schmidt</div>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-dot" style="background: #22c55e;"></div>
                <div class="timeline-content">
                    <div class="timeline-title">Teilzahlung eingegangen: € 2.500</div>
                    <div class="timeline-meta">01.12.2025 · Automatisch</div>
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Generate KI-Analyse page
 */
function generateKIAnalysePage(customer) {
    return `
    <div class="page">
        <div class="page-header">
            <div>
                <div class="page-title">KI-Analyse & Chat</div>
                <div class="page-subtitle">Intelligente Fallanalyse und Empfehlungen</div>
            </div>
            <div class="page-number">Seite 6</div>
        </div>

        <div class="section-desc">
            <h5>Konversationelle KI für Forderungsmanagement</h5>
            <p>Stellen Sie Fragen zu Kunden, erhalten Sie Analysen und lassen Sie sich optimale Handlungsstrategien vorschlagen.</p>
        </div>

        <div class="ai-summary">
            <h4>🤖 KI-Assistent</h4>
            <p>Der KI-Assistent unterstützt bei:</p>
            <ul style="margin: 15px 0 0 20px; color: #334155;">
                <li>Analyse von Zahlungsverhalten und Risikobewertung</li>
                <li>Empfehlungen für optimale Bearbeitungsstrategien</li>
                <li>Automatische Generierung von Mahnschreiben</li>
                <li>Prognose der Zahlungswahrscheinlichkeit</li>
                <li>Identifikation von Restrukturierungspotenzial</li>
            </ul>
        </div>

        <h3 style="margin: 30px 0 15px;">Beispiel-Konversation</h3>
        <div style="background: #f8fafc; border-radius: 12px; padding: 20px;">
            <div style="margin-bottom: 20px;">
                <div style="background: #dbeafe; padding: 12px 16px; border-radius: 12px 12px 12px 0; display: inline-block; max-width: 80%;">
                    <strong>Benutzer:</strong> Analysiere den Fall ${customer.name}
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <div style="background: #e0f2fe; padding: 12px 16px; border-radius: 12px 12px 0 12px; display: inline-block; max-width: 80%; margin-left: auto;">
                    <strong>KI:</strong> ${customer.name} hat eine offene Forderung von € ${customer.forderung.toLocaleString('de-DE')}
                    mit ${customer.dpd} Tagen Überfälligkeit. Basierend auf dem Zahlungsverhalten und vergleichbaren Fällen
                    empfehle ich ${customer.dpd > 60 ? 'eine sofortige Eskalation zum Inkasso' :
                                  customer.dpd > 30 ? 'ein persönliches Telefonat zur Klärung' :
                                  'das Angebot einer Ratenzahlung'}.
                </div>
            </div>
        </div>

        <h3 style="margin: 30px 0 15px;">Risikobewertung</h3>
        <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="kpi-card ${customer.dpd > 60 ? 'danger' : customer.dpd > 30 ? 'warning' : 'success'}">
                <div class="kpi-label">Zahlungswahrscheinlichkeit</div>
                <div class="kpi-value">${customer.dpd > 60 ? '23%' : customer.dpd > 30 ? '47%' : '72%'}</div>
            </div>
            <div class="kpi-card warning">
                <div class="kpi-label">Risiko-Score</div>
                <div class="kpi-value">${Math.min(95, 40 + customer.dpd)}/100</div>
            </div>
            <div class="kpi-card primary">
                <div class="kpi-label">Empfohlene Strategie</div>
                <div class="kpi-value" style="font-size: 14pt;">${customer.dpd > 60 ? 'Inkasso' : customer.dpd > 30 ? 'Eskalation' : 'Standard'}</div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Generate NPL Dashboard page
 */
function generateNPLDashboardPage() {
    return `
    <div class="page">
        <div class="page-header">
            <div>
                <div class="page-title">NPL Dashboard</div>
                <div class="page-subtitle">Non-Performing Loans Übersicht</div>
            </div>
            <div class="page-number">Seite 7</div>
        </div>

        <div class="section-desc">
            <h5>Überwachung kritischer Forderungen</h5>
            <p>Alle Fälle mit DPD > 90 Tage werden hier als Non-Performing Loans geführt und erfordern besondere Aufmerksamkeit.</p>
        </div>

        <div class="kpi-grid">
            <div class="kpi-card danger">
                <div class="kpi-label">NPL-Quote</div>
                <div class="kpi-value">4,8%</div>
                <div class="kpi-change negative">↑ 0,3% vs. Vorquartal</div>
            </div>
            <div class="kpi-card danger">
                <div class="kpi-label">NPL-Volumen</div>
                <div class="kpi-value">€ 12,4 Mio</div>
            </div>
            <div class="kpi-card warning">
                <div class="kpi-label">Anzahl NPL-Fälle</div>
                <div class="kpi-value">847</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Ø Überfälligkeit</div>
                <div class="kpi-value">142 Tage</div>
            </div>
        </div>

        <h3 style="margin: 30px 0 15px;">NPL-Verteilung nach Produkttyp</h3>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Produkttyp</th>
                        <th>Anzahl</th>
                        <th>Volumen</th>
                        <th>Anteil</th>
                        <th>Trend</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Ratenkredite</td>
                        <td>423</td>
                        <td>€ 6,2 Mio</td>
                        <td>50%</td>
                        <td style="color: #dc2626;">↑ +8%</td>
                    </tr>
                    <tr>
                        <td>Dispokredite</td>
                        <td>289</td>
                        <td>€ 3,8 Mio</td>
                        <td>31%</td>
                        <td style="color: #d97706;">↔ 0%</td>
                    </tr>
                    <tr>
                        <td>Kreditkarten</td>
                        <td>135</td>
                        <td>€ 2,4 Mio</td>
                        <td>19%</td>
                        <td style="color: #16a34a;">↓ -3%</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h3 style="margin: 30px 0 15px;">Top 5 NPL-Fälle</h3>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Kunde</th>
                        <th>Forderung</th>
                        <th>DPD</th>
                        <th>Letzter Kontakt</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Hoffmann Bau GmbH</td>
                        <td>€ 387.500</td>
                        <td>48 Tage</td>
                        <td>05.12.2025</td>
                        <td><span class="badge danger">Inkasso</span></td>
                    </tr>
                    <tr>
                        <td>Maier Transporte</td>
                        <td>€ 178.900</td>
                        <td>78 Tage</td>
                        <td>28.11.2025</td>
                        <td><span class="badge danger">Abschreibung</span></td>
                    </tr>
                    <tr>
                        <td>Mueller GmbH</td>
                        <td>€ 125.000</td>
                        <td>35 Tage</td>
                        <td>10.12.2025</td>
                        <td><span class="badge danger">Inkasso</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    `;
}

/**
 * Generate Stage 2 page
 */
function generateStage2Page() {
    return `
    <div class="page">
        <div class="page-header">
            <div>
                <div class="page-title">Stage 2 Monitoring</div>
                <div class="page-subtitle">IFRS 9 Risikoklassifizierung</div>
            </div>
            <div class="page-number">Seite 8</div>
        </div>

        <div class="section-desc">
            <h5>Regulatorische Risikoüberwachung nach IFRS 9</h5>
            <p>Fälle mit signifikant erhöhtem Kreditrisiko (Stage 2) werden hier überwacht. Lifetime Expected Credit Losses müssen gebildet werden.</p>
        </div>

        <div class="kpi-grid">
            <div class="kpi-card warning">
                <div class="kpi-label">Stage 2 Quote</div>
                <div class="kpi-value">7,2%</div>
            </div>
            <div class="kpi-card warning">
                <div class="kpi-label">Stage 2 Volumen</div>
                <div class="kpi-value">€ 61,2 Mio</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">ECL Stage 2</div>
                <div class="kpi-value">€ 4,3 Mio</div>
            </div>
            <div class="kpi-card primary">
                <div class="kpi-label">Coverage Ratio</div>
                <div class="kpi-value">7,0%</div>
            </div>
        </div>

        <h3 style="margin: 30px 0 15px;">Stage-Migration (letztes Quartal)</h3>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Von → Nach</th>
                        <th>Anzahl</th>
                        <th>Volumen</th>
                        <th>Bemerkung</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Stage 1 → Stage 2</td>
                        <td>234</td>
                        <td>€ 12,4 Mio</td>
                        <td style="color: #dc2626;">Verschlechterung</td>
                    </tr>
                    <tr>
                        <td>Stage 2 → Stage 1</td>
                        <td>156</td>
                        <td>€ 8,7 Mio</td>
                        <td style="color: #16a34a;">Verbesserung</td>
                    </tr>
                    <tr>
                        <td>Stage 2 → Stage 3</td>
                        <td>89</td>
                        <td>€ 5,2 Mio</td>
                        <td style="color: #dc2626;">Ausfall</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h3 style="margin: 30px 0 15px;">Frühwarnindikatoren</h3>
        <div class="data-grid">
            <div class="data-section">
                <h4>Quantitative Trigger</h4>
                <div class="data-row">
                    <span class="data-label">30+ DPD Fälle</span>
                    <span class="data-value">1.245</span>
                </div>
                <div class="data-row">
                    <span class="data-label">PD-Verschlechterung >2x</span>
                    <span class="data-value">432</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Rating-Downgrade</span>
                    <span class="data-value">178</span>
                </div>
            </div>
            <div class="data-section">
                <h4>Qualitative Trigger</h4>
                <div class="data-row">
                    <span class="data-label">Restrukturierung</span>
                    <span class="data-value">89</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Finanzielle Schwierigkeiten</span>
                    <span class="data-value">156</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Wirtschaftliche Faktoren</span>
                    <span class="data-value">67</span>
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Generate Aufgaben page
 */
function generateAufgabenPage() {
    return `
    <div class="page">
        <div class="page-header">
            <div>
                <div class="page-title">Aufgaben</div>
                <div class="page-subtitle">Offene Maßnahmen und Wiedervorlagen</div>
            </div>
            <div class="page-number">Seite 9</div>
        </div>

        <div class="section-desc">
            <h5>Zentrale Aufgabenverwaltung</h5>
            <p>Alle offenen Maßnahmen, Rückrufe und Wiedervorlagen werden hier verwaltet und priorisiert.</p>
        </div>

        <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="kpi-card danger">
                <div class="kpi-label">Überfällige Aufgaben</div>
                <div class="kpi-value">23</div>
            </div>
            <div class="kpi-card warning">
                <div class="kpi-label">Heute fällig</div>
                <div class="kpi-value">47</div>
            </div>
            <div class="kpi-card primary">
                <div class="kpi-label">Diese Woche</div>
                <div class="kpi-value">156</div>
            </div>
        </div>

        <h3 style="margin: 30px 0 15px;">Heutige Aufgaben</h3>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Priorität</th>
                        <th>Kunde</th>
                        <th>Aufgabe</th>
                        <th>Fällig</th>
                        <th>Zugewiesen</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="badge danger">Hoch</span></td>
                        <td>Hoffmann Bau GmbH</td>
                        <td>Rückruf wegen Zahlungsvereinbarung</td>
                        <td>10:00</td>
                        <td>M. Schmidt</td>
                    </tr>
                    <tr>
                        <td><span class="badge danger">Hoch</span></td>
                        <td>Mueller GmbH</td>
                        <td>Inkasso-Unterlagen prüfen</td>
                        <td>11:30</td>
                        <td>K. Weber</td>
                    </tr>
                    <tr>
                        <td><span class="badge warning">Mittel</span></td>
                        <td>Schmidt, Peter</td>
                        <td>Ratenzahlungsangebot erstellen</td>
                        <td>14:00</td>
                        <td>A. Bauer</td>
                    </tr>
                    <tr>
                        <td><span class="badge warning">Mittel</span></td>
                        <td>Weber KG</td>
                        <td>Vereinbarung nachverfolgen</td>
                        <td>15:30</td>
                        <td>M. Schmidt</td>
                    </tr>
                    <tr>
                        <td><span class="badge info">Normal</span></td>
                        <td>Lehmann, Sandra</td>
                        <td>Zahlungserinnerung versenden</td>
                        <td>16:00</td>
                        <td>System</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h3 style="margin: 30px 0 15px;">Aufgabentypen-Verteilung</h3>
        <div class="kpi-grid" style="grid-template-columns: repeat(4, 1fr);">
            <div class="kpi-card">
                <div class="kpi-label">Telefonate</div>
                <div class="kpi-value">45</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Mahnungen</div>
                <div class="kpi-value">32</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Prüfungen</div>
                <div class="kpi-value">28</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Eskalationen</div>
                <div class="kpi-value">12</div>
            </div>
        </div>
    </div>
    `;
}
