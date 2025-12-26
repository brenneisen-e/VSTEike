    if (crmView) {
        crmView.classList.add('active');

        // Get full customer data
        const customer = getFullCustomerData(customerId);

        // Update CRM header with customer name
        const crmHeader = crmView.querySelector('.crm-header h2, .crm-customer-name');
        if (crmHeader) {
            crmHeader.textContent = customer.name;
        }

        // Update CRM customer ID
        const crmCustomerId = crmView.querySelector('.crm-customer-id');
        if (crmCustomerId) {
            crmCustomerId.textContent = customerId;
        }

        // Update CRM fields using the same helper approach
        updateCrmFields(crmView, customer);

        // Show/hide task hint box
        const taskHintBox = document.getElementById('crmTaskHint');
        if (taskHintBox) {
            if (taskContext) {
                taskHintBox.style.display = 'block';
                taskHintBox.innerHTML = `
                    <div class="task-hint-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <strong>Offene Aufgabe:</strong> ${taskContext.title}
                    </div>
                    <div class="task-hint-meta">
                        <span class="task-hint-due ${taskContext.overdue ? 'overdue' : ''}">${taskContext.due}</span>
                        <button class="btn-ai-summary" onclick="showAiSummary('${customerId}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"></path>
                                <path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z"></path>
                            </svg>
                            KI-Zusammenfassung
                        </button>
                    </div>
                `;
            } else {
                taskHintBox.style.display = 'none';
            }
        }

        console.log('Opening CRM profile for customer:', customerId, customer.name, taskContext ? 'with task' : '');
    }
}

// Update CRM view fields with customer data
function updateCrmFields(crmView, customer) {
    // Helper to find and update by label
    function updateByLabel(labelText, newValue) {
        const rows = crmView.querySelectorAll('.crm-row, .info-row, .detail-row');
        for (const row of rows) {
            const label = row.querySelector('.label, .info-label, .detail-label');
            if (label && label.textContent.trim().toLowerCase().includes(labelText.toLowerCase())) {
                const value = row.querySelector('.value, .info-value, .detail-value');
                if (value) {
                    value.textContent = newValue;
                    return value;
                }
            }
        }
        return null;
    }

    // Update main fields
    updateByLabel('Firmenname', customer.name);
    updateByLabel('Name', customer.name);
    updateByLabel('Rechtsform', customer.rechtsform);
    updateByLabel('Branche', customer.branche);
    updateByLabel('Adresse', customer.adresse);
    updateByLabel('Telefon', customer.telefon);
    updateByLabel('E-Mail', customer.email);
    updateByLabel('Ansprechpartner', customer.ansprechpartner);

    // Update financial data
    updateByLabel('Restschuld', '€' + (customer.restschuld || 0).toLocaleString('de-DE'));
    updateByLabel('Gesamtforderung', '€' + (customer.gesamtforderung || 0).toLocaleString('de-DE'));

    // Update status badges
    const statusBadges = crmView.querySelectorAll('.status-badge, .segment-badge');
    statusBadges.forEach(badge => {
        if (customer.status === 'Bezahlt') {
            badge.textContent = 'Abgeschlossen';
            badge.className = badge.className.replace(/danger|warning|inkasso/g, 'success');
        }
    });
}

// Show AI Summary for customer
function showAiSummary(customerId) {
    showNotification('KI-Zusammenfassung wird erstellt...', 'info');

    // Simulate AI loading
    setTimeout(() => {
        const summary = `
            <div class="ai-summary-modal">
                <div class="ai-summary-header">
                    <div class="ai-summary-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        <span>KI-Zusammenfassung für ${customerId}</span>
                    </div>
                    <button onclick="this.closest('.ai-summary-modal').remove()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="ai-summary-content">
                    <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Kundenprofil
                    </h4>
                    <p>Der Kunde zeigt eine <strong>moderate Zahlungsbereitschaft</strong> (Willingness: 45%) bei <strong>eingeschränkter Zahlungsfähigkeit</strong> (Ability: 35%). Die Kommunikation war bisher konstruktiv.</p>

                    <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Aktivitäten (letzte 30 Tage)
                    </h4>
                    <ul>
                        <li>3 Telefonkontakte (2 erfolgreich, 1 nicht erreicht)</li>
                        <li>1 Zahlungsvereinbarung getroffen</li>
                        <li>Teilzahlung i.H.v. €1.200 eingegangen</li>
                    </ul>

                    <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Empfohlene nächste Schritte
                    </h4>
                    <ol>
                        <li><strong>Telefonat führen</strong> - Zahlungsvereinbarung nachfassen</li>
                        <li><strong>Ratenzahlung prüfen</strong> - Kunde hat Interesse signalisiert</li>
                        <li><strong>Dokumentation aktualisieren</strong> - Finanzielle Situation erfassen</li>
                    </ol>
                </div>
            </div>
        `;

        // Add modal to page
        const modalContainer = document.createElement('div');
        modalContainer.className = 'ai-summary-overlay';
        modalContainer.innerHTML = summary;
        modalContainer.onclick = (e) => {
            if (e.target === modalContainer) modalContainer.remove();
        };
        document.body.appendChild(modalContainer);
    }, 1500);
}

function closeCrmProfile() {
    const crmView = document.getElementById('crmProfileView');
    if (crmView) {
        crmView.classList.remove('active');
    }
}

function showCrmSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.crm-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeNav = document.querySelector(`.crm-nav-item[onclick="showCrmSection('${sectionName}')"]`);
    if (activeNav) activeNav.classList.add('active');

    // Update sections
    document.querySelectorAll('.crm-section').forEach(section => {
        section.classList.remove('active');
    });
    const activeSection = document.getElementById('crm-' + sectionName);
    if (activeSection) activeSection.classList.add('active');
}

// Toggle expandable document
function toggleDocument(docId) {
    const docItem = document.getElementById(docId);
    if (docItem) {
        // Toggle expanded class
        docItem.classList.toggle('expanded');

        // Optionally close other expanded documents
        document.querySelectorAll('.document-item.expanded').forEach(item => {
            if (item.id !== docId) {
                item.classList.remove('expanded');
            }
        });
    }
}

// Download document
function downloadDocument(docId) {
    showNotification(`Dokument ${docId} wird heruntergeladen...`, 'info');
    // In production, this would trigger actual file download
}

// Print document
function printDocument(docId) {
    const docItem = document.getElementById(docId);
    if (docItem) {
        const letterPreview = docItem.querySelector('.letter-preview, .contract-summary');
        if (letterPreview) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Dokument drucken</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                        .letter-preview { font-family: Georgia, serif; font-size: 13px; line-height: 1.8; }
                        .letter-header, .letter-recipient { font-size: 12px; margin-bottom: 24px; }
                        .letter-date { text-align: right; font-size: 12px; color: #666; margin-bottom: 24px; }
                        .letter-subject { font-size: 14px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #ccc; }
                        .letter-body p { margin: 0 0 12px 0; }
                        .contract-summary table { width: 100%; border-collapse: collapse; }
                        .contract-summary td { padding: 8px 0; border-bottom: 1px solid #eee; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>${letterPreview.outerHTML}</body>
                </html>
            `);
            printWindow.document.close();
            printWindow.onload = function() {
                printWindow.print();
            };
        }
    }
}

// Upload document
function uploadDocument() {
    showNotification('Dokument-Upload wird geöffnet...', 'info');
}

function crmCall() {
    showNotification('Anruf wird gestartet...', 'info');
}

function crmEmail() {
    showNotification('E-Mail-Vorlage wird geöffnet...', 'info');
}

function crmSchedule() {
    showNotification('Terminplanung wird geöffnet...', 'info');
}

function crmNote() {
    showNotification('Notizfeld wird geöffnet...', 'info');
}

// ========================================
// EDITABLE STAMMDATEN SYSTEM
// ========================================

let stammdatenEditMode = false;

function editStammdaten() {
    stammdatenEditMode = !stammdatenEditMode;

    const stammdatenTab = document.getElementById('tab-stammdaten');
    if (!stammdatenTab) return;

    if (stammdatenEditMode) {
        // Enable edit mode
        enableStammdatenEditMode(stammdatenTab);
        showNotification('Bearbeitungsmodus aktiviert - Klicken Sie auf Felder zum Bearbeiten', 'info');
    } else {
        // Save and disable edit mode
        saveStammdatenChanges(stammdatenTab);
        disableStammdatenEditMode(stammdatenTab);
        showNotification('Änderungen gespeichert', 'success');
    }
}

function enableStammdatenEditMode(container) {
    // Add edit mode class
    container.classList.add('edit-mode');

    // Make value spans editable
    container.querySelectorAll('.stammdaten-row .value').forEach(valueEl => {
        // Skip badges and special elements
        if (valueEl.querySelector('.badge') || valueEl.classList.contains('badge')) return;

        valueEl.contentEditable = 'true';
        valueEl.classList.add('editable');

        // Get the label for this field
        const labelEl = valueEl.previousElementSibling;
        const fieldName = labelEl ? labelEl.textContent.replace(':', '').trim() : '';

        valueEl.dataset.fieldName = fieldName;

        // Highlight on focus
        valueEl.addEventListener('focus', function() {
            this.classList.add('editing');
        });

        valueEl.addEventListener('blur', function() {
            this.classList.remove('editing');
        });
    });

    // Add save/cancel buttons if not already present
    let editControls = container.querySelector('.stammdaten-edit-controls');
    if (!editControls) {
        editControls = document.createElement('div');
        editControls.className = 'stammdaten-edit-controls';
        editControls.innerHTML = `
            <button class="btn-save-stammdaten" onclick="editStammdaten()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Speichern
            </button>
            <button class="btn-cancel-stammdaten" onclick="cancelStammdatenEdit()">
                Abbrechen
            </button>
        `;
        container.insertBefore(editControls, container.firstChild);
    }
    editControls.style.display = 'flex';

    // Add styles if not present
    addStammdatenEditStyles();
}

function disableStammdatenEditMode(container) {
    container.classList.remove('edit-mode');

    container.querySelectorAll('.stammdaten-row .value.editable').forEach(valueEl => {
        valueEl.contentEditable = 'false';
        valueEl.classList.remove('editable', 'editing');
    });

    const editControls = container.querySelector('.stammdaten-edit-controls');
    if (editControls) {
        editControls.style.display = 'none';
    }

    stammdatenEditMode = false;
}

function cancelStammdatenEdit() {
    const stammdatenTab = document.getElementById('tab-stammdaten');
    if (stammdatenTab) {
        // Reload original data
        if (currentCustomerId) {
            const customer = getFullCustomerData(currentCustomerId);
            const modal = document.getElementById('customerDetailModal');
            if (modal) updateStammdatenFields(modal, customer);
        }
        disableStammdatenEditMode(stammdatenTab);
        showNotification('Bearbeitung abgebrochen', 'info');
    }
}

function saveStammdatenChanges(container) {
    if (!currentCustomerId) return;

    container.querySelectorAll('.stammdaten-row .value.editable').forEach(valueEl => {
        const fieldName = valueEl.dataset.fieldName;
        const value = valueEl.textContent.trim();

        if (fieldName && value) {
            saveCustomerStammdaten(currentCustomerId, fieldName, value);
        }
    });
}

function addStammdatenEditStyles() {
    if (document.getElementById('stammdaten-edit-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'stammdaten-edit-styles';
    styles.textContent = `
        .stammdaten-edit-controls {
            display: none;
            gap: 12px;
            padding: 12px 16px;
            background: #fef3c7;
            border-radius: 8px;
            margin-bottom: 16px;
            align-items: center;
        }
        .stammdaten-edit-controls::before {
            content: 'Bearbeitungsmodus aktiv';
            font-size: 13px;
            font-weight: 500;
            color: #92400e;
            flex: 1;
        }
        .btn-save-stammdaten {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
        }
        .btn-save-stammdaten:hover { background: #059669; }
        .btn-cancel-stammdaten {
            padding: 8px 16px;
            background: white;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
        }
        .btn-cancel-stammdaten:hover { background: #f3f4f6; }
        #tab-stammdaten.edit-mode .value.editable {
            background: #fffbeb;
            border: 1px dashed #fbbf24;
            border-radius: 4px;
            padding: 2px 6px;
            margin: -2px -6px;
            cursor: text;
            transition: all 0.2s;
        }
        #tab-stammdaten.edit-mode .value.editable:hover {
            background: #fef3c7;
            border-color: #f59e0b;
        }
        #tab-stammdaten.edit-mode .value.editable.editing {
            background: white;
            border: 2px solid #3b82f6;
            outline: none;
        }
    `;
    document.head.appendChild(styles);
}

// Export edit functions
window.editStammdaten = editStammdaten;
window.cancelStammdatenEdit = cancelStammdatenEdit;

// Update openCustomerDetail to use full CRM view
const originalOpenCustomerDetail = openCustomerDetail;
function openCustomerDetailCRM(customerId) {
    // Use the full CRM profile instead of the modal
    openCrmProfile(customerId);
}

// ========================================
// DEMO CUSTOMER FILE GENERATOR
// ========================================

function generateDemoCustomerFile() {
    // Random demo data
    const demoCustomers = [
        { name: 'Müller Maschinenbau GmbH', street: 'Industriestraße 45', zip: '70173', city: 'Stuttgart', iban: 'DE89 3704 0044 0532 0130 00', amount: 47850.00, dueDate: '2024-10-15', type: 'Gewerbe' },
        { name: 'Hans Schmidt', street: 'Hauptstraße 12', zip: '80331', city: 'München', iban: 'DE91 1000 0000 0123 4567 89', amount: 3420.50, dueDate: '2024-11-01', type: 'Privat' },
        { name: 'Weber & Söhne KG', street: 'Am Marktplatz 8', zip: '50667', city: 'Köln', iban: 'DE75 3705 0198 0012 3456 78', amount: 125000.00, dueDate: '2024-09-30', type: 'Gewerbe' },
        { name: 'Maria Fischer', street: 'Gartenweg 23', zip: '60311', city: 'Frankfurt', iban: 'DE44 5001 0517 5407 3249 31', amount: 8750.00, dueDate: '2024-10-20', type: 'Privat' },
        { name: 'Autohaus Berger GmbH', street: 'Berliner Allee 100', zip: '40210', city: 'Düsseldorf', iban: 'DE68 2105 0170 0012 3456 78', amount: 89300.00, dueDate: '2024-08-15', type: 'Gewerbe' }
    ];

    const customer = demoCustomers[Math.floor(Math.random() * demoCustomers.length)];
    const today = new Date().toLocaleDateString('de-DE');
    const docNumber = 'INK-' + Date.now().toString().slice(-8);

    // Create canvas for the document
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1130;
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header with bank logo placeholder
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(0, 0, 800, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('MUSTERBANK AG', 40, 55);
    ctx.font = '14px Arial';
    ctx.fillText('Forderungsmanagement', 40, 80);

    // Document title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Mahnung / Zahlungsaufforderung', 40, 160);

    // Document number and date
    ctx.font = '12px Arial';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Dokument-Nr.: ${docNumber}`, 550, 140);
    ctx.fillText(`Datum: ${today}`, 550, 160);

    // Customer data section
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40, 200, 720, 180);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(40, 200, 720, 180);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Kundendaten', 60, 230);

    ctx.font = '13px Arial';
    ctx.fillStyle = '#334155';

    const labels = ['Name / Firma:', 'Adresse:', '', 'Kundentyp:', 'IBAN:'];
    const values = [customer.name, customer.street, `${customer.zip} ${customer.city}`, customer.type, customer.iban];

    let y = 260;
    for (let i = 0; i < labels.length; i++) {
        if (labels[i]) {
            ctx.fillStyle = '#64748b';
            ctx.fillText(labels[i], 60, y);
            ctx.fillStyle = '#1e293b';
            ctx.fillText(values[i], 200, y);
        } else {
            ctx.fillStyle = '#1e293b';
            ctx.fillText(values[i], 200, y);
        }
        y += 25;
    }

    // Claim details section
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(40, 410, 720, 150);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 410, 720, 150);

    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Forderungsdetails', 60, 445);

    ctx.font = '13px Arial';
    ctx.fillStyle = '#78350f';
    ctx.fillText('Offener Betrag:', 60, 480);
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`€ ${customer.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`, 200, 482);

    ctx.font = '13px Arial';
    ctx.fillText('Fälligkeitsdatum:', 60, 515);
    ctx.font = '14px Arial';
    const dueDateFormatted = new Date(customer.dueDate).toLocaleDateString('de-DE');
    ctx.fillText(dueDateFormatted, 200, 515);

    ctx.fillText('Verzugstage:', 400, 515);
    const daysOverdue = Math.floor((new Date() - new Date(customer.dueDate)) / (1000 * 60 * 60 * 24));
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${Math.max(0, daysOverdue)} Tage`, 500, 515);

    // Text content
    ctx.fillStyle = '#334155';
    ctx.font = '12px Arial';
    const textLines = [
        'Sehr geehrte Damen und Herren,',
        '',
        'trotz unserer vorherigen Zahlungserinnerungen ist der oben genannte Betrag',
        'noch nicht auf unserem Konto eingegangen.',
        '',
        'Wir fordern Sie hiermit auf, den ausstehenden Betrag innerhalb von 10 Tagen',
        'auf das folgende Konto zu überweisen:',
        '',
        'Empfänger: Musterbank AG',
        'IBAN: DE12 3456 7890 1234 5678 90',
        'Verwendungszweck: ' + docNumber,
        '',
        'Bei Nichtzahlung behalten wir uns weitere rechtliche Schritte vor.',
        '',
        'Mit freundlichen Grüßen',
        'Ihr Forderungsmanagement-Team'
    ];

    let textY = 600;
    textLines.forEach(line => {
        ctx.fillText(line, 60, textY);
        textY += 20;
    });

    // Footer
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 1050, 800, 80);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Arial';
    ctx.fillText('Musterbank AG | Bankstraße 1 | 10115 Berlin | Tel: +49 30 12345-0 | forderung@musterbank.de', 40, 1080);
    ctx.fillText('Geschäftsführer: Dr. Max Mustermann | Amtsgericht Berlin HRB 12345 | USt-IdNr.: DE123456789', 40, 1095);

    // Add QR code placeholder
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(650, 600, 80, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px Arial';
    ctx.fillText('QR-Code', 670, 645);

    // Download the image
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Demo_Kundenakte_${docNumber}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('Demo-Kundenakte erstellt und heruntergeladen!', 'success');
    }, 'image/png');
}

// Scanner Functions
window.generateDemoCustomerFile = generateDemoCustomerFile;
window.openDocumentScanner = openDocumentScanner;
window.closeDocumentScanner = closeDocumentScanner;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.handleFileSelect = handleFileSelect;
window.removeUpload = removeUpload;
window.openCamera = openCamera;
window.startAIRecognition = startAIRecognition;
window.goToStep2 = goToStep2;
window.goToStep3 = goToStep3;
window.createCustomerFromScan = createCustomerFromScan;
window.showBulkImport = showBulkImport;

// CRM Functions
window.openCrmProfile = openCrmProfile;
window.closeCrmProfile = closeCrmProfile;
window.showCrmSection = showCrmSection;
window.showAiSummary = showAiSummary;
window.openTaskCustomer = openTaskCustomer;

// Open customer from task with task context
function openTaskCustomer(customerId, taskTitle, taskDue, isOverdue) {
    openCrmProfile(customerId, {
        title: taskTitle,
        due: taskDue,
        overdue: isOverdue
    });
}
window.crmCall = crmCall;
window.crmEmail = crmEmail;
window.crmSchedule = crmSchedule;
window.crmNote = crmNote;
window.editStammdaten = editStammdaten;

// ========================================
// DASHBOARD SUMMARY DOWNLOAD
// ========================================

function downloadDashboardSummary() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
    });

    let summary = `
################################################################################
################################################################################
##                                                                            ##
##              COLLECTIONS MANAGEMENT - VOLLSTÄNDIGE DOKUMENTATION           ##
##                    Braunschweiger Sparkasse | Forderungsmanagement         ##
##                                                                            ##
################################################################################
################################################################################

Erstellt am: ${dateStr} um ${timeStr} Uhr
Dokumentversion: 2.1 - Vollständige UI/UX Dokumentation

================================================================================
================================================================================
                        TEIL A: BENUTZEROBERFLÄCHE & NAVIGATION
================================================================================
================================================================================

Diese Dokumentation beschreibt vollständig den Aufbau, die Struktur und alle
Interaktionsmöglichkeiten des Collections Management Dashboards.

================================================================================
                    A1. DASHBOARD-STRUKTUR (Von oben nach unten)
================================================================================

Das Dashboard ist wie folgt aufgebaut (in der Reihenfolge von oben nach unten):

┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. HEADER-BEREICH (Ganz oben)                                               │
│    └── Modul-Tabs: [Versicherung] [Banken] [Asset Manager]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. NAVIGATIONS-KACHELN (4 Stück nebeneinander)                              │
│    └── [Kundensegmentierung] [Bestandskunden] [Offene Leads] [Prozesse]     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. KPI-BOXEN (4 Kennzahlen nebeneinander)                                   │
│    └── [Gesamtkredite] [Forderung] [Schulden/Kunde] [Aufgaben]              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. AKTIONS-LEISTE (Buttons für Hauptaktionen)                               │
│    └── [📷 Dokument scannen] [📥 Bulk-Import] [📄 Zusammenfassung]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. CHART-BEREICH (2 große Grafiken nebeneinander)                           │
│    └── Links: Willingness/Ability Matrix | Rechts: Portfolio-Entwicklung    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. INFO-KARTEN (2 Karten nebeneinander)                                     │
│    └── Links: Neue Fälle (47) | Rechts: Zahlungseingänge (31)               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. KUNDENLISTE (Scrollbare Tabelle)                                         │
│    └── Liste aller Kunden mit Bewertung und Aktionen                        │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                         A2. MODUL-TABS (Header-Bereich)
================================================================================

Position: Ganz oben auf der Seite
Aussehen: 3 Tabs nebeneinander

┌─────────────────────────────────────────────────────────────────────────────┐
│ TAB                │ KLICK-FUNKTION                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Versicherung       │ Zeigt das Versicherungs-Dashboard mit Kundenseg-       │
│                    │ mentierung, Bestandsanalyse und Vertragsverwaltung     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Banken             │ Zeigt das Collections-Dashboard (dieses Dashboard)     │
│ (AKTIV)            │ mit Forderungsmanagement und Schuldenanalyse           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Asset Manager      │ Zeigt das Asset-Management-Dashboard mit Portfolio-    │
│                    │ übersicht und Vermögensverwaltung                      │
└─────────────────────────────────────────────────────────────────────────────┘

KLICK-VERHALTEN:
• Bei Klick auf einen Tab wird die CSS-Klasse "active" gesetzt
• Der entsprechende Modul-Content wird eingeblendet (display: block)
• Alle anderen Module werden ausgeblendet (display: none)
• Der aktive Tab wird visuell hervorgehoben

================================================================================
                      A3. NAVIGATIONS-KACHELN (4 Kacheln)
================================================================================

Position: Direkt unter dem Header
Aussehen: 4 quadratische Kacheln nebeneinander mit Icons

┌─────────────────────────────────────────────────────────────────────────────┐
│ KACHEL                  │ KLICK-FUNKTION                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 Kundensegmentierung  │ Zeigt die Willingness/Ability-Matrix und alle     │
│    (AKTIV)              │ segmentierten Kunden. Hauptansicht für die        │
│                         │ KI-basierte Kundenklassifizierung.                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 👥 Bestandskunden       │ Wechselt zur Bestandskundenübersicht mit          │
│                         │ allen aktiven Kundenbeziehungen und deren         │
│                         │ Vertragshistorie.                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📋 Offene Leads         │ Zeigt potentielle Neukunden und offene            │
│                         │ Vertriebschancen im Forderungsbereich.            │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⚙️ Prozesse             │ Öffnet die Prozessübersicht mit laufenden         │
│                         │ Inkasso-Vorgängen und Mahnverfahren.              │
└─────────────────────────────────────────────────────────────────────────────┘

KLICK-VERHALTEN:
• Bei Klick wird die Kachel visuell als "aktiv" markiert
• Der zugehörige Content-Bereich wird eingeblendet
• Die Breadcrumb-Navigation wird aktualisiert
• Die URL wird ggf. mit einem Hash-Parameter versehen

================================================================================
                          A4. KPI-BOXEN (4 Kennzahlen)
================================================================================

Position: Unter den Navigations-Kacheln
Aussehen: 4 rechteckige Boxen nebeneinander mit großen Zahlen

┌─────────────────────────────────────────────────────────────────────────────┐
│ KPI-BOX                     │ ANGEZEIGTER WERT        │ KLICK-FUNKTION      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💰 Gesamtkredite            │ 10.234                  │ Filtert die Kunden- │
│    (Total Credits)          │ "+127 zur Vorwoche"     │ liste auf alle      │
│                             │                         │ Fälle               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 Ausstehende              │ € 47,8 Mio.             │ Sortiert die Liste  │
│    Gesamtforderung          │ "+€ 1,2 Mio."           │ nach Forderungs-    │
│    (Outstanding)            │                         │ höhe absteigend     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 👤 Schulden pro Kunde       │ € 4.672                 │ Zeigt Durchschnitts-│
│    (Avg. Debt per Customer) │ "-€ 89 (Verbesserung)"  │ berechnung-Details  │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⚠️ Offene Bewertungs-       │ 156                     │ Filtert auf offene  │
│    aufgaben                 │ "23 überfällig"         │ Aufgaben, markiert  │
│    (Pending Tasks)          │                         │ überfällige rot     │
└─────────────────────────────────────────────────────────────────────────────┘

VISUELLES FEEDBACK:
• Hover-Effekt: Box wird leicht angehoben (transform: translateY(-2px))
• Positive Trends: Grüner Pfeil ↑ und grüne Schrift
• Negative Trends: Roter Pfeil ↓ und rote Schrift
• Überfällige Aufgaben: Orange/Rot hervorgehoben

================================================================================
                      A5. AKTIONS-LEISTE (Action Bar)
================================================================================

Position: Unter den KPI-Boxen
Aussehen: Horizontale Leiste mit 3 Buttons

┌─────────────────────────────────────────────────────────────────────────────┐
│ BUTTON                      │ KLICK-FUNKTION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📷 Dokument scannen         │ Öffnet den Document Scanner Modal             │
│    (Scan Document)          │ → Siehe Abschnitt A8 für Details              │
│                             │ JavaScript: openDocumentScanner()             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📥 Bulk-Import              │ Öffnet Datei-Dialog für CSV/Excel-Import      │
│    (Bulk Import)            │ Ermöglicht Massenimport von Kundendaten       │
│                             │ JavaScript: triggerBulkImport()               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📄 Zusammenfassung          │ Lädt diese TXT-Datei herunter                 │
│    (Download Summary)       │ Generiert vollständigen Dashboard-Report      │
│                             │ JavaScript: downloadDashboardSummary()        │
└─────────────────────────────────────────────────────────────────────────────┘

BUTTON-STYLING:
• Primärer Button: Blauer Hintergrund, weißer Text
• Hover: Dunklerer Blauton
• Icons: Font Awesome oder Unicode-Emojis

================================================================================
                     A6. CHART-BEREICH (2 Hauptgrafiken)
================================================================================

Position: Zentral im Dashboard, unter der Aktions-Leiste
Aussehen: 2 große Chart-Container nebeneinander (50%/50%)

┌─────────────────────────────────────────────────────────────────────────────┐
│ CHART                           │ BESCHREIBUNG & INTERAKTIONEN              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 WILLINGNESS vs. ABILITY      │                                           │
│    MATRIX (Links)               │ ANZEIGE:                                  │
│                                 │ • Scatter-Plot mit 4 Quadranten           │
│    X-Achse: Willingness to Pay  │ • Jeder Punkt = 1 Kunde                   │
│    Y-Achse: Ability to Pay      │ • Farben nach Segment (s. unten)          │
│    Größe: Score-Confidence      │                                           │
│                                 │ KLICK-FUNKTIONEN:                         │
│    Quadranten:                  │ • Klick auf Punkt: Öffnet Kunden-Popup    │
│    ┌─────────┬─────────┐        │ • Klick auf Quadrant: Filtert Liste       │
│    │ RESTRUK │ PRIORIT │        │ • Hover: Zeigt Kunden-Kurzinfo            │
│    │ (gelb)  │ (grün)  │        │ • Zoom: Mausrad zum Zoomen               │
│    ├─────────┼─────────┤        │ • Pan: Klicken und Ziehen                │
│    │ ESKALAT │ ABWICK- │        │                                           │
│    │ (orange)│ (rot)   │        │ JavaScript: initScatterPlot()             │
│    └─────────┴─────────┘        │ Bibliothek: Chart.js                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📈 PORTFOLIO-ENTWICKLUNG        │                                           │
│    (Rechts)                     │ ANZEIGE:                                  │
│                                 │ • Linien-Chart mit 12 Monaten             │
│    X-Achse: Monate (12)         │ • 4 farbige Linien (je Segment)           │
│    Y-Achse: Anzahl Fälle        │ • Gesamttrend als gestrichelte Linie      │
│                                 │                                           │
│    Linien:                      │ KLICK-FUNKTIONEN:                         │
│    ── Grün: Priorität           │ • Klick auf Legende: Ein-/Ausblenden      │
│    ── Gelb: Restrukturierung    │ • Hover auf Datenpunkt: Tooltip           │
│    ── Orange: Eskalation        │ • Doppelklick: Zoom auf Zeitraum          │
│    ── Rot: Abwicklung           │                                           │
│    ┄┄ Grau: Gesamt              │ JavaScript: initPortfolioChart()          │
│                                 │ Bibliothek: Chart.js                      │
└─────────────────────────────────────────────────────────────────────────────┘

CHART-INTERAKTIONEN IM DETAIL:

Willingness/Ability Matrix:
• KLICK auf Datenpunkt:
  → Öffnet kleines Popup mit: Name, Score, Segment
  → "Details"-Button im Popup öffnet volles CRM-Profil
• HOVER auf Datenpunkt:
  → Tooltip zeigt: Kundenname, Willingness%, Ability%, Forderung€
• KLICK in Quadrant (freie Fläche):
  → Filtert Kundenliste auf dieses Segment
  → Aktualisiert KPI-Anzeige für das Segment
• ZOOM mit Mausrad:
  → Vergrößert/Verkleinert die Ansicht
• DOPPELKLICK:
  → Setzt Zoom zurück auf Standardansicht

Portfolio-Entwicklung:
• KLICK auf Legende:
  → Blendet entsprechende Linie ein/aus
  → Ermöglicht Fokus auf einzelne Segmente
• HOVER auf Datenpunkt:
  → Zeigt exakten Wert und Monat
  → Zeigt Veränderung zum Vormonat

================================================================================
                       A7. INFO-KARTEN (2 Highlight-Boxen)
================================================================================

Position: Unter den Charts
Aussehen: 2 hervorgehobene Karten mit wichtigen Kennzahlen

┌─────────────────────────────────────────────────────────────────────────────┐
│ KARTE                         │ KLICK-FUNKTION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🆕 NEUE FÄLLE SEIT LETZTEM    │ ANZEIGE:                                    │
│    LOGIN                      │ • Große Zahl: 47                            │
│                               │ • Untertitel: "Fälle"                       │
│    Badge: Blau                │ • KI-Bewertungsstatus                       │
│                               │                                             │
│                               │ KLICK:                                      │
│                               │ → Filtert Kundenliste auf neue Fälle        │
│                               │ → Sortiert nach Erfassungsdatum             │
│                               │ → Hebt neue Einträge gelb hervor            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💳 ZAHLUNGSEINGÄNGE           │ ANZEIGE:                                    │
│                               │ • Große Zahl: 31                            │
│    Badge: Grün                │ • Untertitel: "Zahlungen erhalten"          │
│                               │ • Trend-Indikator                           │
│                               │                                             │
│                               │ KLICK:                                      │
│                               │ → Filtert auf Kunden mit Zahlungen          │
│                               │ → Zeigt Zahlungshistorie                    │
│                               │ → Ermöglicht Segment-Upgrade                │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                    A8. DOCUMENT SCANNER (Modal-Dialog)
================================================================================

Aufruf: Klick auf "📷 Dokument scannen" in der Aktions-Leiste
Aussehen: Overlay-Modal in der Bildschirmmitte

┌─────────────────────────────────────────────────────────────────────────────┐
│                        DOCUMENT SCANNER - 3-SCHRITT-PROZESS                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SCHRITT 1: UPLOAD                                                          │
│  ─────────────────                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │     [📷 Foto aufnehmen]        [📄 PDF hochladen]                   │    │
│  │                                                                     │    │
│  │     ┌─────────────────────────────────────────────────────────┐     │    │
│  │     │                                                         │     │    │
│  │     │          Drag & Drop Zone                               │     │    │
│  │     │          Dokumente hier ablegen                         │     │    │
│  │     │          oder klicken zum Auswählen                     │     │    │
│  │     │                                                         │     │    │
│  │     └─────────────────────────────────────────────────────────┘     │    │
│  │                                                                     │    │
│  │     Unterstützte Formate: JPG, PNG, PDF                             │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  KLICK-FUNKTIONEN SCHRITT 1:                                                │
│  • "Foto aufnehmen": Aktiviert Kamera (falls verfügbar)                     │
│  • "PDF hochladen": Öffnet Datei-Auswahl-Dialog                             │
│  • Drag & Drop: Datei auf Zone ziehen → automatischer Upload                │
│  • Klick auf Zone: Öffnet Datei-Auswahl-Dialog                              │
│                                                                             │
│  JavaScript: handleFileSelect(), handleDragDrop()                           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SCHRITT 2: KI-ERKENNUNG                                                    │
│  ────────────────────────                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │     [Dokumentvorschau]         KI-Analyse läuft...                  │    │
│  │     ┌───────────────┐          ██████████████░░░░ 75%               │    │
│  │     │               │                                               │    │
│  │     │    Bild/PDF   │          Erkannte Daten:                      │    │
│  │     │               │          ✓ Name: Max Mustermann               │    │
│  │     └───────────────┘          ✓ Adresse: Musterstr. 1              │    │
│  │                                ✓ Geburtsdatum: 01.01.1980            │    │
│  │                                ✓ IBAN: DE89...                       │    │
│  │                                ✓ Forderung: € 5.230,00               │    │
│  │                                                                     │    │
│  │     [Erneut scannen]          [Daten übernehmen →]                  │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  AUTOMATISCHE AKTIONEN:                                                     │
│  • OCR-Texterkennung auf Dokument                                           │
│  • KI-Extraktion von: Name, Adresse, Geburtsdatum, IBAN, Beträge            │
│  • Validierung der erkannten Daten                                          │
│  • Confidence-Score für jedes Feld                                          │
│                                                                             │
│  KLICK-FUNKTIONEN SCHRITT 2:                                                │
│  • "Erneut scannen": Zurück zu Schritt 1                                    │
│  • "Daten übernehmen": Weiter zu Schritt 3                                  │
│  • Klick auf Feld: Manuelle Korrektur möglich                               │
│                                                                             │
│  JavaScript: startAIRecognition(), extractDocumentData()                    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SCHRITT 3: KUNDE ANLEGEN                                                   │
│  ─────────────────────────                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │     NEUEN KUNDEN ANLEGEN                                            │    │
│  │                                                                     │    │
│  │     Vorname:     [Max____________]   Nachname: [Mustermann___]      │    │
│  │     Straße:      [Musterstraße 1_]   PLZ/Ort: [12345 Berlin_]       │    │
│  │     Geburtsdatum:[01.01.1980_____]   Telefon: [+49 123 456789]      │    │
│  │     E-Mail:      [max@example.de_]   IBAN:    [DE89...]             │    │
│  │                                                                     │    │
│  │     Forderungsdaten:                                                │    │
│  │     Betrag:      [€ 5.230,00_____]   Fälligkeit: [15.01.2025]       │    │
│  │     Produkt:     [Ratenkredit____▼]  Vertragsnr: [KR-2024-1234]     │    │
│  │                                                                     │    │
│  │     KI-Bewertung (automatisch):                                     │    │
│  │     Willingness: 65%  Ability: 72%  Segment: RESTRUKTURIERUNG       │    │
│  │                                                                     │    │
│  │     [Abbrechen]                           [✓ Kunde anlegen]         │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  KLICK-FUNKTIONEN SCHRITT 3:                                                │
│  • Jedes Feld: Editierbar, vorbefüllt mit KI-Daten                          │
│  • "Abbrechen": Schließt Modal ohne zu speichern                            │
│  • "Kunde anlegen": Erstellt neuen Kundendatensatz                          │
│    → Speichert in Datenbank                                                 │
│    → Fügt zur Kundenliste hinzu                                             │
│    → Zeigt Erfolgs-Notification                                             │
│    → Schließt Modal                                                         │
│                                                                             │
│  JavaScript: createNewCustomer(), saveCustomerData()                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

MODAL-STEUERUNG:
• ESC-Taste: Schließt das Modal
• Klick außerhalb: Schließt das Modal
• X-Button oben rechts: Schließt das Modal
• JavaScript: closeDocumentScanner()

================================================================================
                         A9. KUNDENLISTE (Scrollbare Tabelle)
================================================================================

Position: Unterer Bereich des Dashboards
Aussehen: Scrollbare Tabelle mit allen Kunden

┌─────────────────────────────────────────────────────────────────────────────┐
│                              KUNDENLISTE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SPALTENÜBERSCHRIFTEN (Klickbar zum Sortieren):                             │
│  ┌─────┬──────────────┬─────────────┬───────────┬───────────┬─────────────┐ │
│  │ ☐   │ Name       ↕ │ Segment   ↕ │ Score   ↕ │ Betrag  ↕ │ Aktionen    │ │
│  ├─────┼──────────────┼─────────────┼───────────┼───────────┼─────────────┤ │
│  │ ☐   │ Max Muster   │ 🟢 Priorit. │ 85/72     │ € 4.230   │ [👁][✏][📧] │ │
│  │ ☐   │ Anna Beisp.  │ 🟡 Restruk. │ 45/68     │ € 8.900   │ [👁][✏][📧] │ │
│  │ ☐   │ Peter Test   │ 🟠 Eskalat. │ 32/28     │ € 12.500  │ [👁][✏][📧] │ │
│  │ ☐   │ Maria Demo   │ 🔴 Abwickl. │ 72/15     │ € 3.200   │ [👁][✏][📧] │ │
│  │ ...  weitere Einträge ...                                               │ │
│  └─────┴──────────────┴─────────────┴───────────┴───────────┴─────────────┘ │
│                                                                             │
│  [1] [2] [3] ... [47]                              Zeige 1-20 von 10.234    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

SPALTEN-ERKLÄRUNG:
• ☐ Checkbox: Auswahl für Bulk-Aktionen
• Name: Kundenname (Klick → CRM-Profil)
• Segment: Farbiger Badge mit Segmentname
• Score: Willingness/Ability Score (z.B. 85/72)
• Betrag: Offene Forderung in Euro
• Aktionen: Icon-Buttons (siehe unten)

KLICK-FUNKTIONEN:

Spaltenüberschriften:
• Klick auf "Name": Sortiert alphabetisch A-Z / Z-A
• Klick auf "Segment": Gruppiert nach Segment
• Klick auf "Score": Sortiert nach Gesamt-Score
• Klick auf "Betrag": Sortiert nach Forderungshöhe

Zeilen:
• Klick auf Kundenname: Öffnet volles CRM-Profil (Abschnitt A10)
• Klick auf Zeile (nicht Aktionen): Öffnet kleines Info-Popup

Aktions-Buttons pro Zeile:
┌─────────────────────────────────────────────────────────────────────────────┐
│ ICON    │ FUNKTION                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 👁 View │ Öffnet Kunden-Schnellansicht                                      │
│         │ → Popup mit Kerndaten und letzten Aktivitäten                     │
│         │ JavaScript: showCustomerQuickView(customerId)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✏ Edit  │ Öffnet Bearbeitungsmodus für Kundendaten                          │
│         │ → Inline-Editing oder Modal-Formular                              │
│         │ JavaScript: editCustomer(customerId)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📧 Mail │ Öffnet E-Mail-Composer mit Kundenadresse                          │
│         │ → Vorlagen-Auswahl für Mahnung/Angebot                            │
│         │ JavaScript: sendCustomerEmail(customerId)                         │
└─────────────────────────────────────────────────────────────────────────────┘

Checkbox-Funktionen:
• Einzelne Checkbox: Wählt Kunden für Bulk-Aktion
• Checkbox in Header: Wählt alle sichtbaren Kunden
• Nach Auswahl erscheint Bulk-Aktions-Leiste:
  → "E-Mail an Auswahl senden"
  → "Segment ändern"
  → "Exportieren"
  → "Löschen"

Pagination:
• Klick auf Seitenzahl: Springt zur Seite
• Klick auf "...": Öffnet Seitenauswahl-Input
• "Zeige X von Y": Klick öffnet Dropdown für 20/50/100 pro Seite

================================================================================
                      A10. CRM-PROFIL (Vollbild-Ansicht)
================================================================================

Aufruf: Klick auf Kundennamen in der Liste
Aussehen: Vollbild-Overlay mit Sidebar-Navigation

┌─────────────────────────────────────────────────────────────────────────────┐
│                         CRM KUNDENPROFIL - VOLLBILD                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────────────────────────────────────────────┐   │
│  │  SIDEBAR    │  │  CONTENT-BEREICH                                    │   │
│  │  NAVIGATION │  │                                                     │   │
│  │             │  │  (Wechselt je nach gewähltem Tab)                   │   │
│  │  [Übersicht]│  │                                                     │   │
│  │  [Stammd.]  │  │                                                     │   │
│  │  [Forder.]  │  │                                                     │   │
│  │  [Zahlungen]│  │                                                     │   │
│  │  [Kommunik.]│  │                                                     │   │
│  │  [Dokumente]│  │                                                     │   │
│  │  [Timeline] │  │                                                     │   │
│  │  [Notizen]  │  │                                                     │   │
│  │  [Analyse]  │  │                                                     │   │
│  │             │  │                                                     │   │
│  │  ─────────  │  │                                                     │   │
│  │  [Aktionen] │  │                                                     │   │
│  │  📧 E-Mail  │  │                                                     │   │
│  │  📞 Anrufen │  │                                                     │   │
│  │  📅 Termin  │  │                                                     │   │
│  │  📝 Notiz   │  │                                                     │   │
│  │             │  │                                                     │   │
│  └─────────────┘  └─────────────────────────────────────────────────────┘   │
│                                                                             │
│                                                          [X Schließen]      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

SIDEBAR-TABS UND IHRE INHALTE:

┌─────────────────────────────────────────────────────────────────────────────┐
│ TAB              │ CONTENT                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 Übersicht     │ Dashboard mit KI-Score, Segment-Badge, Key-Metrics       │
│                  │ Risikoampel, letzte Aktivität, Quick-Actions             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 👤 Stammdaten    │ Persönliche Daten: Name, Adresse, Kontakt, Geburtsdatum  │
│                  │ Bankverbindung, Arbeitgeber, Einkommen                   │
│                  │ [Bearbeiten]-Button zum Editieren                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💰 Forderungen   │ Tabelle aller offenen Forderungen                        │
│                  │ Vertragsdetails, Fälligkeiten, Mahnstatus                │
│                  │ IFRS 9 Stage, ECL-Berechnung                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💳 Zahlungen     │ Zahlungshistorie mit allen Ein- und Ausgängen            │
│                  │ Grafik der Zahlungsmuster                                │
│                  │ Ratenzahlungsvereinbarungen                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📧 Kommunikation │ E-Mail-Verlauf, Brief-Historie, Anrufprotokoll           │
│                  │ Versendete Mahnungen mit Datum                           │
│                  │ Schnellversand-Optionen                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📎 Dokumente     │ Vertragsunterlagen, Mahnschreiben, Nachweise             │
│                  │ Upload-Funktion für neue Dokumente                       │
│                  │ Vorschau-Funktion für PDFs                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📅 Timeline      │ Chronologische Übersicht aller Ereignisse                │
│                  │ Farbkodiert nach Typ (Zahlung, Kontakt, Änderung)        │
│                  │ Filter nach Zeitraum und Ereignistyp                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📝 Notizen       │ Interne Notizen und Vermerke                             │
│                  │ Neue Notiz erstellen                                     │
│                  │ Notizen anderer Mitarbeiter sehen                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🤖 KI-Analyse    │ Detaillierte KI-Bewertung                                │
│                  │ Willingness/Ability Breakdown                            │
│                  │ Prognose und Empfehlungen                                │
│                  │ Confidence-Scores pro Faktor                             │
└─────────────────────────────────────────────────────────────────────────────┘

QUICK-ACTION BUTTONS IN SIDEBAR:
• 📧 E-Mail: Öffnet E-Mail-Composer → crmEmail()
• 📞 Anrufen: Zeigt Telefonnummer, Click-to-Call wenn verfügbar → crmCall()
• 📅 Termin: Öffnet Kalender-Integration → crmSchedule()
• 📝 Notiz: Öffnet Notiz-Editor → crmNote()

SCHLIESSEN DES CRM-PROFILS:
• X-Button oben rechts
• ESC-Taste
• Klick außerhalb des Modals
• JavaScript: closeCrmProfile()

================================================================================
                       A11. KEYBOARD-SHORTCUTS (Tastenkürzel)
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ TASTENKÜRZEL      │ FUNKTION                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ ESC               │ Schließt jedes geöffnete Modal/Overlay                  │
│ Ctrl + S          │ Speichert aktuelle Änderungen (wenn im Edit-Modus)      │
│ Ctrl + F          │ Öffnet Schnellsuche in der Kundenliste                  │
│ ↑ / ↓             │ Navigation in der Kundenliste                           │
│ Enter             │ Öffnet ausgewählten Kunden im CRM-Profil                │
│ Tab               │ Springt zum nächsten interaktiven Element               │
│ Ctrl + P          │ Druckt aktuelle Ansicht                                 │
│ ?                 │ Zeigt Hilfe-Overlay mit allen Shortcuts                 │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
================================================================================
                           TEIL B: PORTFOLIO-DATEN & ANALYSE
================================================================================
================================================================================

================================================================================
                              B1. EXECUTIVE SUMMARY
================================================================================

Dieses Dashboard bietet eine umfassende Übersicht über das Forderungsportfolio
der Braunschweiger Sparkasse. Die KI-gestützte Analyse klassifiziert jeden
Kunden anhand von Transaktionsmustern, externen Datenquellen und historischem
Verhalten nach Zahlungsbereitschaft (Willingness to Pay) und Zahlungsfähigkeit
(Ability to Pay).

================================================================================
                           B2. PORTFOLIO-KENNZAHLEN (KPIs)
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ KENNZAHL                      │ AKTUELLER WERT     │ VERÄNDERUNG           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Gesamtkredite                 │ 10.234 Fälle       │ +127 zur Vorwoche     │
│ Ausstehende Gesamtforderung   │ € 47,8 Mio.        │ +€ 1,2 Mio. (Vorwoche)│
│ Ø Schulden pro Kunde          │ € 4.672            │ -€ 89 (Verbesserung)  │
│ Offene Bewertungsaufgaben     │ 156 Aufgaben       │ 23 überfällig         │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                     B3. KUNDENSEGMENTIERUNG (WILLINGNESS/ABILITY MATRIX)
================================================================================

Die Matrix segmentiert Kunden in vier Quadranten basierend auf ihrer
Zahlungsbereitschaft (X-Achse) und Zahlungsfähigkeit (Y-Achse):

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  RESTRUKTURIERUNG (Oben Links)        │  PRIORITÄT (Oben Rechts)            │
│  • Hohe Ability, Niedrige Willingness │  • Hohe Ability, Hohe Willingness   │
│  • Anzahl: 3.120 Fälle                │  • Anzahl: 2.340 Fälle              │
│  • Strategie: Ratenzahlung,           │  • Strategie: Schnelle Vereinbarung │
│    Schuldnerberatung                  │    Zahlungsplan                     │
│                                       │                                     │
├───────────────────────────────────────┼─────────────────────────────────────┤
│                                       │                                     │
│  ESKALATION (Unten Links)             │  ABWICKLUNG (Unten Rechts)          │
│  • Niedrige Ability & Willingness     │  • Niedrige Ability, Hohe Willing.  │
│  • Anzahl: 1.890 Fälle                │  • Anzahl: 2.884 Fälle              │
│  • Strategie: Inkasso, Mahnverfahren, │  • Strategie: Verkauf, Abschreibung,│
│    Gerichtliche Schritte              │    Restrukturierung                 │
│                                       │                                     │
└─────────────────────────────────────────────────────────────────────────────┘

VERTEILUNG GESAMT:
• Priorität (Grün):         2.340 Fälle (22,9%)  - Schnellste Rückzahlung
• Restrukturierung (Gelb):  3.120 Fälle (30,5%)  - Mittleres Risiko
• Eskalation (Orange):      1.890 Fälle (18,5%)  - Hohes Risiko
• Abwicklung (Rot):         2.884 Fälle (28,2%)  - Kritisch

================================================================================
                           B4. PORTFOLIO-ENTWICKLUNG (12 MONATE)
================================================================================

Entwicklung des Forderungsportfolios in den letzten 12 Monaten:

┌─────────────────────────────────────────────────────────────────────────────┐
│ METRIK                        │ WERT                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Neuzugänge (pro Monat)        │ +847 Fälle durchschnittlich                 │
│ Abgänge (regulär)             │ -523 Fälle durchschnittlich                 │
│ Netto-Veränderung             │ +324 Fälle pro Monat                        │
│ Trend                         │ Ansteigend (Portfoliowachstum)              │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                      B5. NEUE FÄLLE SEIT LETZTEM LOGIN
================================================================================

Anzahl neuer Fälle seit dem letzten Dashboard-Aufruf: 47 Fälle

Diese neuen Fälle wurden automatisch durch die KI bewertet und den
entsprechenden Segmenten zugeordnet. Eine manuelle Überprüfung wird
für Fälle mit niedriger Confidence-Score empfohlen.

================================================================================
                           B6. ZAHLUNGSEINGÄNGE
================================================================================

Positive Entwicklungen - Kunden mit erfolgten Zahlungen: 31 Fälle

Diese Fälle zeigen Zahlungsaktivität und sollten ggf. im Segment
nach oben korrigiert werden.

================================================================================
                       B7. SEGMENTSPEZIFISCHE HANDLUNGSEMPFEHLUNGEN
================================================================================

PRIORITÄT (Grüne Zone - 2.340 Fälle):
────────────────────────────────────
✓ Schnelle Kontaktaufnahme für Zahlungsvereinbarung
✓ Flexible Ratenzahlungsangebote
✓ Hohe Erfolgswahrscheinlichkeit bei zeitnaher Bearbeitung
✓ Durchschnittliche Recovery Rate: 85-95%

RESTRUKTURIERUNG (Gelbe Zone - 3.120 Fälle):
────────────────────────────────────────────
✓ Individuelle Schuldnerberatung anbieten
✓ Langfristige Ratenpläne entwickeln
✓ Kontakt zu Sozialberatung bei Bedarf
✓ Durchschnittliche Recovery Rate: 60-75%

ESKALATION (Orange Zone - 1.890 Fälle):
───────────────────────────────────────
! Inkasso-Verfahren einleiten
! Gerichtliches Mahnverfahren prüfen
! Vermögensauskunft einholen
! Durchschnittliche Recovery Rate: 25-40%

ABWICKLUNG (Rote Zone - 2.884 Fälle):
─────────────────────────────────────
✗ Verkauf an Inkasso-Dienstleister prüfen
✗ Abschreibung nach Einzelfallprüfung
✗ Restschuldbefreiung bei Insolvenz
✗ Durchschnittliche Recovery Rate: 5-15%

================================================================================
                           B8. IFRS 9 STAGE KLASSIFIZIERUNG
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE       │ BESCHREIBUNG                  │ FÄLLE    │ VOLUMEN           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Stage 1     │ Performing (< 30 DPD)         │ 5.010    │ € 18,2 Mio.       │
│ Stage 2     │ Underperforming (30-90 DPD)   │ 2.880    │ € 15,4 Mio.       │
│ Stage 3     │ Non-Performing (> 90 DPD)     │ 2.344    │ € 14,2 Mio.       │
└─────────────────────────────────────────────────────────────────────────────┘

DPD = Days Past Due (Tage überfällig)

================================================================================
                           B9. ERWARTETE KREDITVERLUSTE (ECL)
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE       │ ECL-QUOTE      │ RÜCKSTELLUNG                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Stage 1     │ 0,8%           │ € 145.600                                   │
│ Stage 2     │ 8,5%           │ € 1.309.000                                 │
│ Stage 3     │ 45,2%          │ € 6.418.400                                 │
│ GESAMT      │                │ € 7.873.000                                 │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                           B10. KI-MODELL PERFORMANCE
================================================================================

Accuracy der Segmentierung:          94,2%
Precision (Willingness to Pay):      91,8%
Precision (Ability to Pay):          93,5%
F1-Score gesamt:                     92,4%

Datenquellen für KI-Analyse:
• Transaktionshistorie (intern)
• SCHUFA-Score (extern)
• Kontoführungsverhalten (intern)
• Externe Wirtschaftsdaten
• Historisches Zahlungsverhalten

================================================================================
                              B11. OFFENE AUFGABEN
================================================================================

Meine aktuellen Aufgaben im Forderungsmanagement:

┌─────────────────────────────────────────────────────────────────────────────┐
│ PRIORITÄT   │ AUFGABE                                   │ FÄLLIGKEIT       │
├─────────────────────────────────────────────────────────────────────────────┤
│ HOCH        │ 23 überfällige Bewertungsaufgaben         │ Sofort           │
│ MITTEL      │ Neue Fälle prüfen (47 Stück)              │ Heute            │
│ MITTEL      │ Zahlungseingänge verifizieren (31 Stück)  │ Diese Woche      │
│ NIEDRIG     │ Portfolio-Review für Q4                   │ Ende des Monats  │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
================================================================================
                     TEIL C: JAVASCRIPT-FUNKTIONEN REFERENZ
================================================================================
================================================================================

Übersicht aller JavaScript-Funktionen und ihre Aufrufe:

┌─────────────────────────────────────────────────────────────────────────────┐
│ FUNKTION                        │ AUFRUF / TRIGGER                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ MODUL & NAVIGATION                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ initModuleSelector()            │ DOMContentLoaded Event                    │
│ switchModule(moduleId)          │ Klick auf Modul-Tab                       │
│ navigateToTile(tileId)          │ Klick auf Navigations-Kachel              │
├─────────────────────────────────────────────────────────────────────────────┤
│ CHARTS                                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ initBankenCharts()              │ Nach Modul-Wechsel zu Banken              │
│ initScatterPlot()               │ Automatisch durch initBankenCharts        │
│ initPortfolioChart()            │ Automatisch durch initBankenCharts        │
├─────────────────────────────────────────────────────────────────────────────┤
│ DOCUMENT SCANNER                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ openDocumentScanner()           │ Klick auf "Dokument scannen" Button       │
│ closeDocumentScanner()          │ Klick auf X, ESC, oder außerhalb Modal    │
│ handleFileSelect(event)         │ Datei-Auswahl oder Drag & Drop            │
│ startAIRecognition()            │ Nach erfolgreichem Upload                 │
│ showRecognitionResults(data)    │ Nach KI-Analyse                           │
│ createNewCustomer()             │ Klick auf "Kunde anlegen" Button          │
├─────────────────────────────────────────────────────────────────────────────┤
│ CRM PROFIL                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ openCrmProfile(customerId)      │ Klick auf Kundennamen in Liste            │
│ closeCrmProfile()               │ X-Button, ESC, oder außerhalb             │
│ showCrmSection(sectionId)       │ Klick auf Sidebar-Tab                     │
│ crmCall()                       │ Klick auf Anrufen-Button                  │
│ crmEmail()                      │ Klick auf E-Mail-Button                   │
│ crmSchedule()                   │ Klick auf Termin-Button                   │
│ crmNote()                       │ Klick auf Notiz-Button                    │
│ editStammdaten()                │ Klick auf Bearbeiten in Stammdaten        │
├─────────────────────────────────────────────────────────────────────────────┤
│ KUNDENLISTE                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ sortCustomerList(column)        │ Klick auf Spaltenüberschrift              │
│ filterBySegment(segment)        │ Klick auf Quadrant in Matrix              │
│ selectCustomer(customerId)      │ Klick auf Checkbox                        │
│ selectAllCustomers()            │ Klick auf Header-Checkbox                 │
│ showCustomerQuickView(id)       │ Klick auf Auge-Icon                       │
│ editCustomer(id)                │ Klick auf Stift-Icon                      │
│ sendCustomerEmail(id)           │ Klick auf Mail-Icon                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ UTILITIES                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ downloadDashboardSummary()      │ Klick auf "Zusammenfassung" Button        │
│ showNotification(msg, type)     │ Nach jeder wichtigen Aktion               │
│ triggerBulkImport()             │ Klick auf "Bulk-Import" Button            │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
================================================================================
                           TEIL D: SYSTEM-INFORMATIONEN
================================================================================
================================================================================

Dashboard-Version:      Collections Management v2.1
Datenstand:             ${dateStr}, ${timeStr}
Nächste Aktualisierung: Automatisch alle 15 Minuten
Datenquelle:            SAP Banking Core + KI-Modul
Benutzer:               [Aktueller Benutzer]

================================================================================
                              KONTAKT & SUPPORT
================================================================================

Bei Fragen zum Dashboard oder zur Segmentierung:
• IT-Support: support@braunschweiger-sparkasse.de
• Fachliche Fragen: collections@braunschweiger-sparkasse.de
• Notfall-Hotline: +49 531 XXX-XXXX

================================================================================
                                   DISCLAIMER
================================================================================

Dieses Dokument enthält vertrauliche Informationen und ist ausschließlich für
den internen Gebrauch bestimmt. Die KI-gestützten Empfehlungen dienen als
Entscheidungshilfe und ersetzen nicht die fachliche Einzelfallprüfung.

################################################################################
################################################################################
##                                                                            ##
##                    © 2025 Braunschweiger Sparkasse                         ##
##                       Collections Management System                        ##
##                         Vollständige Dokumentation                         ##
##                                                                            ##
################################################################################
################################################################################
`;

    // Create and download file
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collections-dashboard-zusammenfassung-${now.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Dashboard-Zusammenfassung wurde heruntergeladen', 'success');
}

// Export download function
window.downloadDashboardSummary = downloadDashboardSummary;

// Initialize module selector on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initModuleSelector();
    restoreCollapsedSections();
});

console.log('✅ banken.js geladen');
