// ========================================
// NEW: Customer Actions
// ========================================

// Start Mahnprozess
function startMahnprozess(customerId) {
    showNotification(`Mahnprozess für ${customerId} gestartet`, 'info');
    console.log('Starting Mahnprozess:', customerId);
}

// Sell Case
function sellCase(customerId) {
    showNotification(`Fall ${customerId} zum Verkauf markiert`, 'warning');
    console.log('Selling case:', customerId);
}

// Write Off
function writeOff(customerId) {
    showNotification(`Fall ${customerId} zur Abschreibung vorgemerkt`, 'error');
    console.log('Writing off:', customerId);
}

// Schedule Call
function scheduleCall(customerId) {
    showNotification(`Anruf für ${customerId} geplant`, 'success');
    console.log('Scheduling call:', customerId);
}

// Create Agreement
function createAgreement(customerId) {
    showNotification(`Vereinbarung für ${customerId} wird erstellt`, 'info');
    console.log('Creating agreement:', customerId);
}

// View Agreement
function viewAgreement(customerId) {
    showNotification(`Vereinbarung für ${customerId} wird geladen`, 'info');
    console.log('Viewing agreement:', customerId);
}

// Show Full Letter (Kommunikation tab)
function showFullLetter(letterId) {
    // Define letter content based on ID
    const letters = {
        'mahnung-1': {
            title: '1. Mahnung - Freundliche Zahlungserinnerung',
            date: '15.10.2025',
            content: `
                <div class="full-letter-header">
                    <div class="letter-sender">
                        <strong>Musterbank AG</strong><br>
                        Forderungsmanagement<br>
                        Bankstraße 123<br>
                        60311 Frankfurt am Main
                    </div>
                    <div class="letter-recipient">
                        <strong>Mueller GmbH</strong><br>
                        Herr Hans Mueller<br>
                        Musterstraße 123<br>
                        38100 Braunschweig
                    </div>
                </div>
                <div class="letter-date">Frankfurt, 15.10.2025</div>
                <div class="letter-subject"><strong>1. Mahnung - Freundliche Zahlungserinnerung</strong></div>
                <div class="letter-text">
                    <p>Sehr geehrter Herr Mueller,</p>
                    <p>bei der Durchsicht unserer Konten haben wir festgestellt, dass folgende Zahlung noch aussteht:</p>
                    <p><strong>Offener Betrag: € 2.500,00</strong><br>
                    Vertragsnummer: BMK-2018-0456789<br>
                    Fälligkeitsdatum: 01.10.2025</p>
                    <p>Sicher handelt es sich nur um ein Versehen. Bitte überweisen Sie den ausstehenden Betrag bis zum <strong>25.10.2025</strong> auf unser Konto.</p>
                    <p>Sollten Sie die Zahlung bereits veranlasst haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.</p>
                    <p>Bei Fragen stehen wir Ihnen gerne unter der Rufnummer 0800 123 456 zur Verfügung.</p>
                    <p>Mit freundlichen Grüßen<br><br>
                    Ihr Forderungsmanagement<br>
                    Musterbank AG</p>
                </div>
            `
        },
        'mahnung-2': {
            title: '2. Mahnung - Zahlungserinnerung',
            date: '01.11.2025',
            content: `
                <div class="full-letter-header">
                    <div class="letter-sender">
                        <strong>Musterbank AG</strong><br>
                        Forderungsmanagement<br>
                        Bankstraße 123<br>
                        60311 Frankfurt am Main
                    </div>
                    <div class="letter-recipient">
                        <strong>Mueller GmbH</strong><br>
                        Herr Hans Mueller<br>
                        Musterstraße 123<br>
                        38100 Braunschweig
                    </div>
                </div>
                <div class="letter-date">Frankfurt, 01.11.2025</div>
                <div class="letter-subject"><strong>2. Mahnung - Zahlungserinnerung</strong></div>
                <div class="letter-text">
                    <p>Sehr geehrter Herr Mueller,</p>
                    <p>leider haben wir bis heute keinen Zahlungseingang zu unserer 1. Mahnung vom 15.10.2025 feststellen können.</p>
                    <p><strong>Offener Betrag: € 5.000,00</strong> (inkl. Mahngebühren € 15,00)<br>
                    Vertragsnummer: BMK-2018-0456789</p>
                    <p>Wir bitten Sie dringend, den offenen Betrag bis zum <strong>15.11.2025</strong> zu begleichen.</p>
                    <p>Sollte die Zahlung nicht fristgerecht erfolgen, behalten wir uns vor, weitere rechtliche Schritte einzuleiten.</p>
                    <p>Mit freundlichen Grüßen<br><br>
                    Ihr Forderungsmanagement<br>
                    Musterbank AG</p>
                </div>
            `
        },
        'mahnung-3': {
            title: 'Letzte Mahnung - Außergerichtliche Aufforderung',
            date: '15.11.2025',
            content: `
                <div class="full-letter-header">
                    <div class="letter-sender">
                        <strong>Musterbank AG</strong><br>
                        Inkasso-Abteilung<br>
                        Bankstraße 123<br>
                        60311 Frankfurt am Main
                    </div>
                    <div class="letter-recipient">
                        <strong>Mueller GmbH</strong><br>
                        Herr Hans Mueller<br>
                        Musterstraße 123<br>
                        38100 Braunschweig
                    </div>
                </div>
                <div class="letter-date">Frankfurt, 15.11.2025</div>
                <div class="letter-subject"><strong>LETZTE MAHNUNG - Außergerichtliche Zahlungsaufforderung</strong></div>
                <div class="letter-text">
                    <p>Sehr geehrter Herr Mueller,</p>
                    <p>trotz mehrfacher Aufforderung ist die ausstehende Forderung in Höhe von <strong>€ 7.500,00</strong> nicht beglichen worden.</p>
                    <p>Wir fordern Sie hiermit <strong>letztmalig</strong> auf, den offenen Betrag bis zum <strong>25.11.2025</strong> zu begleichen.</p>
                    <p><strong>Forderungsaufstellung:</strong><br>
                    Hauptforderung: € 7.500,00<br>
                    Zinsen (5,75% p.a.): € 145,30<br>
                    Mahngebühren: € 45,00<br>
                    <strong>Gesamtbetrag: € 7.690,30</strong></p>
                    <p>Sollte die Zahlung nicht fristgerecht eingehen, sehen wir uns gezwungen, den Fall <strong>ohne weitere Ankündigung</strong> an ein Inkassounternehmen zu übergeben und gerichtliche Schritte einzuleiten.</p>
                    <p>Mit freundlichen Grüßen<br><br>
                    Inkasso-Abteilung<br>
                    Musterbank AG</p>
                </div>
            `
        },
        'email-kunde-1': {
            title: 'E-Mail vom Kunden',
            date: '20.10.2025',
            content: `
                <div class="email-header">
                    <div class="email-meta">
                        <strong>Von:</strong> h.mueller@mueller-gmbh.de<br>
                        <strong>An:</strong> forderungsmanagement@musterbank.de<br>
                        <strong>Datum:</strong> 20.10.2025, 16:42<br>
                        <strong>Betreff:</strong> Re: Zahlungserinnerung
                    </div>
                </div>
                <div class="letter-text" style="background: #f8fafc; border-left: 3px solid #3b82f6;">
                    <p>Sehr geehrte Damen und Herren,</p>
                    <p>vielen Dank für Ihr Schreiben vom 15.10.2025.</p>
                    <p>Aufgrund von Liquiditätsengpässen in unserem Unternehmen ist es uns derzeit leider nicht möglich, die volle Rate zu begleichen. Wir hatten in den letzten Monaten unvorhergesehene Ausgaben und einen Umsatzrückgang.</p>
                    <p>Wir bitten daher um Verständnis und möchten eine Ratenzahlungsvereinbarung beantragen. Wir können ab dem 15.11.2025 monatlich € 1.500,00 zahlen, bis die offene Forderung beglichen ist.</p>
                    <p>Bitte teilen Sie uns mit, ob dies möglich ist.</p>
                    <p>Mit freundlichen Grüßen<br>
                    Hans Mueller<br>
                    Geschäftsführer<br>
                    Mueller GmbH</p>
                </div>
            `
        }
    };

    const letter = letters[letterId];
    if (!letter) {
        showNotification('Dokument nicht gefunden', 'error');
        return;
    }

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'letter-modal-overlay';
    overlay.innerHTML = `
        <div class="letter-modal">
            <div class="letter-modal-header">
                <h3>${letter.title}</h3>
                <button class="letter-modal-close" onclick="closeLetterModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="letter-modal-body">
                ${letter.content}
            </div>
            <div class="letter-modal-footer">
                <button class="btn-secondary" onclick="closeLetterModal()">Schließen</button>
                <button class="btn-primary" onclick="printLetter('${letterId}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    Drucken
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeLetterModal();
        }
    });

    // Close on ESC
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeLetterModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// Close letter modal
function closeLetterModal() {
    const overlay = document.querySelector('.letter-modal-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Print letter
function printLetter(letterId) {
    showNotification('Dokument wird gedruckt...', 'info');
    // In a real app, this would trigger print
    console.log('Printing letter:', letterId);
}

// Open CRM Profile from customer modal
function openCrmFromModal() {
    // Close the modal first
    closeCustomerDetail();

    // Then open CRM profile
    setTimeout(() => {
        openCrmProfile('K-2024-0001');
    }, 300);
}

// ========================================
// NEW: Task Management
// ========================================

// Filter Aufgaben
function filterAufgaben(filter) {
    // Update active button
    document.querySelectorAll('.aufgaben-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    // Filter task items
    const items = document.querySelectorAll('.aufgabe-item');
    items.forEach(item => {
        const status = item.dataset.status;
        if (filter === 'alle') {
            item.style.display = '';
        } else if (filter === status) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });

    // Update pagination info
    const visibleCount = document.querySelectorAll('.aufgabe-item:not([style*="display: none"])').length;
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `Zeige 1-${visibleCount} von ${visibleCount} Aufgaben`;
    }

    console.log('Filtering tasks:', filter, 'visible:', visibleCount);
}

// Reschedule Task
function rescheduleTask(taskId) {
    showNotification(`Aufgabe ${taskId} wird verschoben`, 'info');
    console.log('Rescheduling task:', taskId);
}

// ========================================
// NEW: Dashboard Functions
// ========================================

// Store chart instances for updates
let scatterPlotChart = null;
let portfolioChart = null;

// Initialize Banken Charts
function initBankenCharts() {
    console.log('Initializing Banken charts...');
    initScatterPlot();
    initPortfolioChart();
}

// Initialize Scatter Plot for Willingness vs. Ability Matrix
function initScatterPlot() {
    const canvas = document.getElementById('scatterPlotCanvas');
    if (!canvas) {
        console.warn('Scatter plot canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Generate sample data points for each quadrant
    const generatePoints = (count, xMin, xMax, yMin, yMax, color) => {
        const points = [];
        for (let i = 0; i < count; i++) {
            points.push({
                x: xMin + Math.random() * (xMax - xMin),
                y: yMin + Math.random() * (yMax - yMin),
            });
        }
        return points;
    };

    // Quadrant data (Willingness = X, Ability = Y)
    // Q1: High Willingness, High Ability (Priorität) - top right
    const prioritaetData = generatePoints(45, 55, 95, 55, 95, '#22c55e');
    // Q2: Low Willingness, High Ability (Restrukturierung) - top left
    const restrukturierungData = generatePoints(60, 5, 45, 55, 95, '#eab308');
    // Q3: Low Willingness, Low Ability (Eskalation) - bottom left
    const eskalationData = generatePoints(35, 5, 45, 5, 45, '#f97316');
    // Q4: High Willingness, Low Ability (Abwicklung) - bottom right
    const abwicklungData = generatePoints(55, 55, 95, 5, 45, '#ef4444');

    // Destroy existing chart if exists
    if (scatterPlotChart) {
        scatterPlotChart.destroy();
    }

    scatterPlotChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Priorität',
                    data: prioritaetData,
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: '#22c55e',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Restrukturierung',
                    data: restrukturierungData,
                    backgroundColor: 'rgba(234, 179, 8, 0.6)',
                    borderColor: '#eab308',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Eskalation',
                    data: eskalationData,
                    backgroundColor: 'rgba(249, 115, 22, 0.6)',
                    borderColor: '#f97316',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Abwicklung',
                    data: abwicklungData,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: '#ef4444',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Legend is shown below the chart
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Willingness: ${context.parsed.x.toFixed(0)}%, Ability: ${context.parsed.y.toFixed(0)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Willingness to Pay (%)',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Ability to Pay (%)',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });

    console.log('Scatter plot initialized');
}

// Initialize Portfolio Evolution Chart
function initPortfolioChart(period = '12m') {
    const canvas = document.getElementById('portfolioEvolutionChart');
    if (!canvas) {
        console.warn('Portfolio chart canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Generate monthly labels based on period
    const months = period === '12m' ? 12 : period === '6m' ? 6 : 3;
    const labels = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }));
    }

    // Generate realistic portfolio data
    let baseValue = 9500;
    const portfolioData = labels.map((_, i) => {
        baseValue += Math.floor(Math.random() * 400) - 150;
        return baseValue;
    });

    // Destroy existing chart if exists
    if (portfolioChart) {
        portfolioChart.destroy();
    }

    portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Portfolio-Bestand',
                data: portfolioData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Fälle: ${context.parsed.y.toLocaleString('de-DE')}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('de-DE');
                        }
                    }
                }
            }
        }
    });

    console.log('Portfolio chart initialized for period:', period);
}

// Refresh Scatter Plot
function refreshScatterPlot() {
    showNotification('Matrix wird aktualisiert...', 'info');
    initScatterPlot();
}

// Export Matrix
function exportMatrix() {
    showNotification('Matrix wird exportiert...', 'info');
    console.log('Exporting matrix');
}

// Update Portfolio Chart
function updatePortfolioChart(period) {
    initPortfolioChart(period);
}

// Show All New Cases
function showAllNewCases() {
    showNotification('Alle neuen Fälle werden geladen...', 'info');
}

// Show All Resolved Cases
function showAllResolvedCases() {
    showNotification('Alle erledigten Fälle werden geladen...', 'info');
}

// Filter Customers
function filterCustomers(filterType, value) {
    console.log('Filtering customers by', filterType, ':', value);
}

// Search Customers
function searchCustomers(query) {
    console.log('Searching customers:', query);

    const searchTerm = query.toLowerCase().trim();
    const table = document.querySelector('.customers-table');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    let matchCount = 0;

    rows.forEach(row => {
        if (!searchTerm) {
            // Show all rows when search is empty
            row.style.display = '';
            matchCount++;
            return;
        }

        // Get searchable content from the row
        const kundenNr = row.querySelector('.customer-id')?.textContent?.toLowerCase() || '';
        const kundenName = row.querySelector('.customer-name')?.textContent?.toLowerCase() || '';
        const cells = row.querySelectorAll('td');
        let rowText = '';
        cells.forEach(cell => rowText += ' ' + cell.textContent.toLowerCase());

        // Check if any field matches
        const matches = kundenNr.includes(searchTerm) ||
                       kundenName.includes(searchTerm) ||
                       rowText.includes(searchTerm);

        if (matches) {
            row.style.display = '';
            matchCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Update pagination text
    const paginationText = document.querySelector('.pagination-text');
    if (paginationText) {
        if (searchTerm) {
            paginationText.textContent = `${matchCount} Treffer für "${query}"`;
        } else {
            paginationText.textContent = 'Zeige 1-10 von 47 Fällen';
        }
    }

    // Show notification for search
    if (searchTerm && matchCount === 0) {
        showNotification(`Keine Kunden gefunden für "${query}"`, 'warning');
    }
}

// ========================================
// NEW: NPL Actions
// ========================================

// Review for Sale
function reviewForSale() {
    showNotification('Fälle für Verkauf werden geprüft...', 'info');
}

// Review for Write Off
function reviewForWriteOff() {
    showNotification('Fälle für Abschreibung werden geprüft...', 'info');
}

// Review for Restructure
function reviewForRestructure() {
    showNotification('Fälle für Restrukturierung werden geprüft...', 'info');
}

// ========================================
// CUSTOMER ACTIVITIES & NOTES SYSTEM
// ========================================

// Get current customer ID from modal
let currentCustomerId = null;

// Get customer activities from localStorage
function getCustomerActivities(customerId) {
    const activities = JSON.parse(localStorage.getItem('customerActivities') || '{}');
    return activities[customerId] || [];
}

// Save customer activity to localStorage
function saveCustomerActivity(customerId, activity) {
    const activities = JSON.parse(localStorage.getItem('customerActivities') || '{}');
    if (!activities[customerId]) {
        activities[customerId] = [];
    }
    activities[customerId].unshift(activity);
    localStorage.setItem('customerActivities', JSON.stringify(activities));
    return activity;
}

// Get customer notes from localStorage
function getCustomerNotes(customerId) {
    const notes = JSON.parse(localStorage.getItem('customerNotes') || '{}');
    return notes[customerId] || [];
}

// Save customer note to localStorage
function saveCustomerNote(customerId, note) {
    const notes = JSON.parse(localStorage.getItem('customerNotes') || '{}');
    if (!notes[customerId]) {
        notes[customerId] = [];
    }
    notes[customerId].unshift(note);
    localStorage.setItem('customerNotes', JSON.stringify(notes));
    return note;
}

// Get customer Stammdaten modifications from localStorage
function getCustomerStammdaten(customerId) {
    const stammdaten = JSON.parse(localStorage.getItem('customerStammdaten') || '{}');
    return stammdaten[customerId] || {};
}

// Save customer Stammdaten to localStorage
function saveCustomerStammdaten(customerId, field, value) {
    const stammdaten = JSON.parse(localStorage.getItem('customerStammdaten') || '{}');
    if (!stammdaten[customerId]) {
        stammdaten[customerId] = {};
    }
    stammdaten[customerId][field] = value;
    localStorage.setItem('customerStammdaten', JSON.stringify(stammdaten));
}

// ========================================
// NEW: Workflow Actions
// ========================================

// Add Note - Opens activity creation modal
function addNote() {
    openActivityModal('notiz');
}

// Open activity modal with type preselected
function openActivityModal(type = 'notiz') {
    let modal = document.getElementById('activityModal');
    if (!modal) {
        // Create modal dynamically if not present
        modal = document.createElement('div');
        modal.id = 'activityModal';
        modal.className = 'activity-modal';
        modal.innerHTML = `
            <div class="activity-modal-content">
                <div class="activity-modal-header">
                    <h3>Aktivität hinzufügen</h3>
                    <button class="activity-modal-close" onclick="closeActivityModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="activity-modal-body">
                    <div class="activity-form-group">
                        <label>Typ</label>
                        <select id="activityType">
                            <option value="notiz">Notiz</option>
                            <option value="anruf">Telefonat</option>
                            <option value="email">E-Mail</option>
                            <option value="brief">Brief</option>
                            <option value="termin">Termin</option>
                            <option value="aufgabe">Aufgabe erledigt</option>
                        </select>
                    </div>
                    <div class="activity-form-group">
                        <label>Beschreibung</label>
                        <textarea id="activityText" placeholder="Beschreiben Sie die Aktivität..."></textarea>
                    </div>
                </div>
                <div class="activity-modal-footer">
                    <button class="activity-cancel-btn" onclick="closeActivityModal()">Abbrechen</button>
                    <button class="activity-submit-btn" onclick="submitActivity()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Speichern
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        addActivityModalStyles();
    }

    modal.style.display = 'flex';
    document.getElementById('activityType').value = type;
    document.getElementById('activityText').value = '';
    setTimeout(() => document.getElementById('activityText').focus(), 100);
}

// Add CSS styles for activity modal
function addActivityModalStyles() {
    if (document.getElementById('activity-modal-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'activity-modal-styles';
    styles.textContent = `
        .activity-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            align-items: center;
            justify-content: center;
        }
        .activity-modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .activity-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #e2e8f0;
        }
        .activity-modal-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
        }
        .activity-modal-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #64748b;
        }
        .activity-modal-close:hover { color: #1e293b; }
        .activity-modal-body {
            padding: 20px;
        }
        .activity-form-group {
            margin-bottom: 16px;
        }
        .activity-form-group label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
        }
        .activity-form-group select,
        .activity-form-group textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
        }
        .activity-form-group textarea {
            min-height: 120px;
            resize: vertical;
        }
        .activity-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 20px;
            border-top: 1px solid #e2e8f0;
        }
        .activity-cancel-btn {
            padding: 10px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: white;
            color: #374151;
            font-size: 14px;
            cursor: pointer;
        }
        .activity-submit-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            background: #3b82f6;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
        }
        .activity-submit-btn:hover { background: #2563eb; }
        .btn-delete-activity {
            background: none;
            border: none;
            cursor: pointer;
            color: #94a3b8;
            padding: 4px;
            margin-left: 8px;
        }
        .btn-delete-activity:hover { color: #ef4444; }
        .komm-item.custom-activity {
            background: #f0f9ff;
            border-left: 3px solid #3b82f6;
        }
        .komm-item.custom-activity .komm-icon { color: #3b82f6; }
    `;
    document.head.appendChild(styles);
}

// Close activity modal
function closeActivityModal() {
    const modal = document.getElementById('activityModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Submit activity from modal
function submitActivity() {
    const type = document.getElementById('activityType').value;
    const text = document.getElementById('activityText').value.trim();

    if (!text) {
        showNotification('Bitte geben Sie einen Text ein', 'error');
        return;
    }

    const typeLabels = {
        'notiz': 'Notiz',
        'anruf': 'Telefonat',
        'email': 'E-Mail',
        'brief': 'Brief',
        'termin': 'Termin',
        'aufgabe': 'Aufgabe erledigt'
    };

    const activity = {
        id: Date.now().toString(),
        type: type,
        typeLabel: typeLabels[type] || type,
        text: text,
        author: localStorage.getItem('feedbackAuthor') || 'Eike',
        timestamp: new Date().toISOString()
    };

    if (currentCustomerId) {
        saveCustomerActivity(currentCustomerId, activity);
        renderCustomerActivities(currentCustomerId);
    }

    closeActivityModal();
    showNotification(`${typeLabels[type]} hinzugefügt`, 'success');
}

// Render customer activities in the Kommunikation timeline
function renderCustomerActivities(customerId) {
    const timeline = document.querySelector('#tab-kommunikation .kommunikation-timeline');
    if (!timeline) return;

    // Remove previously added custom activities
    timeline.querySelectorAll('.komm-item.custom-activity').forEach(el => el.remove());

    const activities = getCustomerActivities(customerId);
    const h4 = timeline.querySelector('h4');

    activities.forEach(activity => {
        const item = createActivityElement(activity);
        if (h4 && h4.nextSibling) {
            timeline.insertBefore(item, h4.nextSibling);
        } else {
            timeline.appendChild(item);
        }
    });
}

// Create activity DOM element
function createActivityElement(activity) {
    const div = document.createElement('div');
    div.className = `komm-item ${activity.type} custom-activity`;
    div.dataset.activityId = activity.id;

    const iconMap = {
        'notiz': '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',
        'anruf': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',
        'email': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
        'brief': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
        'termin': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
        'aufgabe': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
    };

    const date = new Date(activity.timestamp);
    const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
        <div class="komm-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                ${iconMap[activity.type] || iconMap['notiz']}
            </svg>
        </div>
        <div class="komm-content">
            <div class="komm-header">
                <span class="komm-type">${activity.typeLabel || activity.type}</span>
                <span class="komm-date">${dateStr}, ${timeStr}</span>
            </div>
            <div class="komm-body">
                <p>${activity.text}</p>
            </div>
            <div class="komm-meta">
                <span class="meta-item">Bearbeiter: ${activity.author}</span>
                <button class="btn-delete-activity" onclick="deleteActivity('${activity.id}')" title="Löschen">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;

    return div;
}

// Delete activity
function deleteActivity(activityId) {
    if (!confirm('Aktivität wirklich löschen?')) return;

    const activities = JSON.parse(localStorage.getItem('customerActivities') || '{}');
    if (activities[currentCustomerId]) {
        activities[currentCustomerId] = activities[currentCustomerId].filter(a => a.id !== activityId);
        localStorage.setItem('customerActivities', JSON.stringify(activities));
        renderCustomerActivities(currentCustomerId);
        showNotification('Aktivität gelöscht', 'success');
    }
}

// Write Off Case (from modal)
function writeOffCase() {
    showNotification('Fall zur Abschreibung vorgemerkt', 'warning');
    closeCustomerDetail();
}

// Show notification helper
function showNotification(message, type = 'info') {
    // Check if there's already a notification container
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position: fixed; top: 80px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px;';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    const colors = {
        'info': { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
        'success': { bg: '#dcfce7', color: '#166534', border: '#86efac' },
        'warning': { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
        'error': { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' }
    };
    const style = colors[type] || colors.info;

    notification.style.cssText = `
        padding: 12px 20px;
        background: ${style.bg};
        color: ${style.color};
        border: 1px solid ${style.border};
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    container.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show new cases panel
function showNewCases() {
    // Scroll to and highlight the updates panel
    const updatesPanel = document.querySelector('.updates-panel');
    if (updatesPanel) {
        updatesPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        updatesPanel.classList.add('highlight-pulse');
        setTimeout(() => updatesPanel.classList.remove('highlight-pulse'), 2000);
    }
    showNotification('47 neue Fälle seit letztem Login', 'info');
}

// Show payments panel
function showPayments() {
    // Scroll to and highlight the payments panel
    const paymentsPanel = document.querySelector('.payments-panel');
    if (paymentsPanel) {
        paymentsPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        paymentsPanel.classList.add('highlight-pulse');
        setTimeout(() => paymentsPanel.classList.remove('highlight-pulse'), 2000);
    }
    showNotification('31 Zahlungseingänge heute erfasst', 'success');
}

// Show promises panel
function showPromises() {
    showNotification('18 aktive Zahlungszusagen', 'info');
}

// Add animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes highlightPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3); }
    }
    .highlight-pulse {
        animation: highlightPulse 0.5s ease-in-out 3;
    }
`;
document.head.appendChild(animationStyles);

// Export module functions
window.switchModule = switchModule;
window.initModuleSelector = initModuleSelector;
window.showBankenTab = showBankenTab;
window.showBankenSection = showBankenSection;
window.filterBySegment = filterBySegment;
window.openSegmentFullscreen = openSegmentFullscreen;
window.clearSegmentFilter = clearSegmentFilter;
window.showChartPopup = showChartPopup;
window.closeChartPopup = closeChartPopup;
window.filterByDPDBucket = filterByDPDBucket;
window.toggleAllNpl = toggleAllNpl;
window.bulkAction = bulkAction;
window.openCase = openCase;
window.callCustomer = callCustomer;
window.sendReminder = sendReminder;
window.scheduleCallback = scheduleCallback;
window.completeTask = completeTask;
window.exportReport = exportReport;
window.showNotification = showNotification;
window.showNewCases = showNewCases;
window.showPayments = showPayments;
window.showPromises = showPromises;

// Customer Detail Modal
window.openCustomerDetail = openCustomerDetail;
window.closeCustomerDetail = closeCustomerDetail;
window.showCustomerTab = showCustomerTab;

// Customer Actions
window.startMahnprozess = startMahnprozess;
window.sellCase = sellCase;
window.writeOff = writeOff;
window.scheduleCall = scheduleCall;
window.createAgreement = createAgreement;
window.viewAgreement = viewAgreement;
window.showFullLetter = showFullLetter;
window.closeLetterModal = closeLetterModal;
window.printLetter = printLetter;
window.openCrmFromModal = openCrmFromModal;

// Task Management
window.filterAufgaben = filterAufgaben;
window.rescheduleTask = rescheduleTask;

// Dashboard Functions
window.initBankenCharts = initBankenCharts;
window.initScatterPlot = initScatterPlot;
window.initPortfolioChart = initPortfolioChart;
window.refreshScatterPlot = refreshScatterPlot;
window.exportMatrix = exportMatrix;
window.updatePortfolioChart = updatePortfolioChart;
window.showAllNewCases = showAllNewCases;
window.showAllResolvedCases = showAllResolvedCases;
window.filterCustomers = filterCustomers;
window.searchCustomers = searchCustomers;

// NPL Actions
window.reviewForSale = reviewForSale;
window.reviewForWriteOff = reviewForWriteOff;
window.reviewForRestructure = reviewForRestructure;

// Workflow Actions
window.addNote = addNote;
window.writeOffCase = writeOffCase;

// Activity & Notes System
window.openActivityModal = openActivityModal;
window.closeActivityModal = closeActivityModal;
window.submitActivity = submitActivity;
window.deleteActivity = deleteActivity;
window.renderCustomerActivities = renderCustomerActivities;
window.getCustomerActivities = getCustomerActivities;
window.saveCustomerActivity = saveCustomerActivity;

// ========================================
// DOCUMENT SCANNER FUNCTIONS
// ========================================

let uploadedFile = null;
let uploadedFileData = null;

function openDocumentScanner() {
    const modal = document.getElementById('documentScannerModal');
    if (modal) {
        modal.classList.add('active');
        resetScanner();
    }
}

function closeDocumentScanner() {
    const modal = document.getElementById('documentScannerModal');
    if (modal) {
        modal.classList.remove('active');
        resetScanner();
    }
}

function resetScanner() {
    uploadedFile = null;
    uploadedFileData = null;

    // Reset to step 1
    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    const step1 = document.getElementById('scanner-step-1');
    if (step1) step1.classList.add('active');

    // Reset upload area
    const uploadPreview = document.getElementById('uploadPreview');
    const dropZone = document.getElementById('dropZone');
    if (uploadPreview) uploadPreview.style.display = 'none';
    if (dropZone) dropZone.style.display = 'block';
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) dropZone.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) dropZone.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) dropZone.classList.remove('dragover');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Ungültiges Dateiformat. Bitte PDF, JPG, PNG oder TIFF verwenden.', 'error');
        return;
    }

    uploadedFile = file;

    // Show preview
    const dropZone = document.getElementById('dropZone');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImage = document.getElementById('previewImage');
    const fileName = document.getElementById('fileName');

    if (dropZone) dropZone.style.display = 'none';
    if (uploadPreview) uploadPreview.style.display = 'block';
    if (fileName) fileName.textContent = file.name;

    // Create preview based on file type
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedFileData = e.target.result;
            if (previewImage) previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        // PDF - show placeholder
        if (previewImage) previewImage.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjUwIiB2aWV3Qm94PSIwIDAgMjAwIDI1MCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNmOGZhZmMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI0MCIgZmlsbD0iI2RjMjYyNiI+UERG PC90ZXh0Pjwvc3ZnPg==';
        uploadedFileData = 'pdf-placeholder';
    }
}

function removeUpload() {
    uploadedFile = null;
    uploadedFileData = null;

    const dropZone = document.getElementById('dropZone');
    const uploadPreview = document.getElementById('uploadPreview');

    if (dropZone) dropZone.style.display = 'block';
    if (uploadPreview) uploadPreview.style.display = 'none';
}

function openCamera() {
    showNotification('Kamera-Funktion wird in einer zukünftigen Version verfügbar sein.', 'info');
}

function startAIRecognition() {
    if (!uploadedFile) {
        showNotification('Bitte laden Sie zuerst ein Dokument hoch.', 'error');
        return;
    }

    // Move to step 2
    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    const step2 = document.getElementById('scanner-step-2');
    if (step2) step2.classList.add('active');

    // Set recognition image
    const recognitionImage = document.getElementById('recognitionImage');
    if (recognitionImage && uploadedFileData) {
        recognitionImage.src = uploadedFileData !== 'pdf-placeholder' ? uploadedFileData : document.getElementById('previewImage').src;
    }

    // Simulate AI recognition
    setTimeout(() => {
        const recognitionStatus = document.getElementById('recognitionStatus');
        const recognizedFields = document.getElementById('recognizedFields');

        if (recognitionStatus) recognitionStatus.style.display = 'none';
        if (recognizedFields) recognizedFields.style.display = 'block';

        // Fill in sample recognized data
        document.getElementById('rec-name').value = 'Schmidt Elektronik GmbH';
        document.getElementById('rec-address').value = 'Industriestr. 45, 38112 Braunschweig';
        document.getElementById('rec-iban').value = 'DE89 3704 0044 0532 0130 00';
        document.getElementById('rec-amount').value = '€ 8.450,00';
        document.getElementById('rec-due-date').value = '2025-10-15';

        showNotification('Dokumentenanalyse abgeschlossen', 'success');
    }, 2000);
}

function goToStep2() {
    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    const step2 = document.getElementById('scanner-step-2');
    if (step2) step2.classList.add('active');
}

function goToStep3() {
    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    const step3 = document.getElementById('scanner-step-3');
    if (step3) step3.classList.add('active');

    // Pre-fill form with recognized data
    document.getElementById('customer-name').value = document.getElementById('rec-name').value;
    document.getElementById('customer-street').value = document.getElementById('rec-address').value.split(',')[0] || '';
    document.getElementById('customer-iban').value = document.getElementById('rec-iban').value;
    document.getElementById('claim-amount').value = parseFloat(document.getElementById('rec-amount').value.replace(/[€\s.]/g, '').replace(',', '.')) || 0;
    document.getElementById('claim-due-date').value = document.getElementById('rec-due-date').value;

    // Set document preview
    const attachedDocPreview = document.getElementById('attachedDocPreview');
    const attachedDocName = document.getElementById('attachedDocName');
    if (attachedDocPreview) attachedDocPreview.src = document.getElementById('recognitionImage').src;
    if (attachedDocName) attachedDocName.textContent = uploadedFile ? uploadedFile.name : 'Dokument';
}

function createCustomerFromScan() {
    showNotification('Kunde wurde erfolgreich angelegt!', 'success');
    closeDocumentScanner();

    // Refresh the customer list or show new customer
    setTimeout(() => {
        showNotification('Neuer Fall wurde zur Segmentierung hinzugefügt.', 'info');
    }, 1000);
}

function showBulkImport() {
    showNotification('Bulk-Import wird vorbereitet...', 'info');
}

// ========================================
// FULL CRM PROFILE FUNCTIONS
// ========================================

function openCrmProfile(customerId, taskContext = null) {
    const crmView = document.getElementById('crmProfileView');
    if (crmView) {
