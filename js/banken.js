// ========================================
// MODULE SWITCHING (Versicherung/Banken/Asset Manager)
// ========================================

// Track if Banken module has been loaded
let bankenModuleLoaded = false;

// Load Banken module from partial
async function loadBankenModule() {
    if (bankenModuleLoaded) return;

    const container = document.getElementById('bankenModule');
    if (!container) return;

    try {
        const response = await fetch('partials/banken-module.html');
        if (response.ok) {
            const html = await response.text();
            container.innerHTML = html;
            bankenModuleLoaded = true;
            console.log('Banken-Modul dynamisch geladen');

            // Initialize charts after content is loaded
            setTimeout(() => {
                initBankenCharts();
            }, 100);
        } else {
            throw new Error('Failed to load module');
        }
    } catch (error) {
        console.warn('Banken-Modul konnte nicht geladen werden, verwende Fallback');
        // If fetch fails (e.g., file:// protocol), the module stays with loading state
        // In production, you could embed the HTML as fallback here
        container.innerHTML = `
            <div class="module-loading">
                <p style="color: #ef4444;">Modul konnte nicht geladen werden.</p>
                <p style="font-size: 12px;">Bitte starten Sie die Anwendung über einen Webserver.</p>
            </div>
        `;
    }
}

function switchModule(moduleName) {
    // Update module tabs
    document.querySelectorAll('.module-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.module === moduleName) {
            tab.classList.add('active');
        }
    });

    // Update module content
    document.querySelectorAll('.module-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetModule = document.getElementById(moduleName + 'Module');
    if (targetModule) {
        targetModule.classList.add('active');
    }

    // Store current module
    localStorage.setItem('currentModule', moduleName);

    // Load Banken module dynamically when first accessed
    if (moduleName === 'banken') {
        loadBankenModule();
    }

    console.log('Switched to module:', moduleName);
}

// Initialize module on page load
function initModuleSelector() {
    const savedModule = localStorage.getItem('currentModule') || 'versicherung';
    switchModule(savedModule);
}

// ========================================
// BANKEN COLLECTIONS DASHBOARD FUNCTIONS
// ========================================

// Switch between Banken Dashboard tabs
function showBankenTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.banken-tabs .banken-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Find and activate the clicked tab
    const tabButtons = document.querySelectorAll('.banken-tabs .banken-tab');
    tabButtons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(tabName.toLowerCase()) ||
            btn.onclick.toString().includes(tabName)) {
            btn.classList.add('active');
        }
    });

    // Activate by checking onclick attribute
    document.querySelectorAll('.banken-tabs .banken-tab').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabName}'`)) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.banken-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetContent = document.getElementById(`banken-tab-${tabName}`);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    console.log('Banken tab switched to:', tabName);
}

// Filter by segment in 2x2 matrix
function filterBySegment(segment) {
    // Toggle selection
    document.querySelectorAll('.matrix-cell').forEach(cell => {
        cell.classList.remove('selected');
    });

    const selectedCell = document.querySelector(`.matrix-cell.${segment}`);
    if (selectedCell) {
        selectedCell.classList.add('selected');
    }

    // Show notification
    const segmentNames = {
        'q1': 'Will zahlen & Kann zahlen',
        'q2': 'Will nicht & Kann zahlen',
        'q3': 'Will zahlen & Kann nicht',
        'q4': 'Will nicht & Kann nicht',
        'priority': 'Priorität - Zahlungsvereinbarung',
        'restructure': 'Restrukturierung',
        'escalate': 'Eskalation - Inkasso',
        'writeoff': 'Abwicklung'
    };

    showNotification(`Filter: ${segmentNames[segment] || segment}`, 'info');
    console.log('Filtering by segment:', segment);
}

// Toggle all NPL checkboxes
function toggleAllNpl(checkbox) {
    const isChecked = checkbox.checked;
    document.querySelectorAll('.npl-checkbox').forEach(cb => {
        cb.checked = isChecked;
    });
    updateBulkActionState();
}

// Update bulk action buttons state
function updateBulkActionState() {
    const checkedBoxes = document.querySelectorAll('.npl-checkbox:checked');
    const bulkButtons = document.querySelectorAll('.btn-bulk');

    bulkButtons.forEach(btn => {
        btn.disabled = checkedBoxes.length === 0;
        btn.style.opacity = checkedBoxes.length === 0 ? '0.5' : '1';
    });
}

// Bulk action handler
function bulkAction(action) {
    const checkedBoxes = document.querySelectorAll('.npl-checkbox:checked');
    const count = checkedBoxes.length;

    if (count === 0) {
        showNotification('Bitte wählen Sie mindestens einen Fall aus', 'warning');
        return;
    }

    const actions = {
        'assign': `${count} Fälle werden zugewiesen...`,
        'escalate': `${count} Fälle werden eskaliert...`,
        'writeoff': `${count} Fälle zur Abschreibung markiert`
    };

    showNotification(actions[action] || `Aktion "${action}" für ${count} Fälle`, 'success');
    console.log('Bulk action:', action, 'for', count, 'cases');
}

// Open case detail
function openCase(caseId) {
    showNotification(`Fall ${caseId} wird geöffnet...`, 'info');
    console.log('Opening case:', caseId);
    // Here would normally open a modal or navigate to case detail
}

// Call customer
function callCustomer(customerId) {
    showNotification(`Anruf wird gestartet für Kunde ${customerId}...`, 'success');
    console.log('Calling customer:', customerId);
}

// Send reminder
function sendReminder(customerId) {
    showNotification(`Mahnung wird versendet an Kunde ${customerId}...`, 'info');
    console.log('Sending reminder to:', customerId);
}

// Schedule callback
function scheduleCallback(customerId) {
    showNotification(`Rückruf geplant für Kunde ${customerId}`, 'success');
    console.log('Scheduling callback for:', customerId);
}

// Complete task
function completeTask(taskId) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
        taskElement.classList.add('completed');
    }
    showNotification(`Aufgabe ${taskId} abgeschlossen`, 'success');
    console.log('Completing task:', taskId);
}

// Export report
function exportReport(reportType) {
    showNotification(`${reportType} Report wird erstellt...`, 'info');
    console.log('Exporting report:', reportType);
}

// ========================================
// NEW: Section Navigation Functions
// ========================================

// Show Banken Section (Navigation Tiles)
function showBankenSection(sectionName) {
    // Update nav tiles
    document.querySelectorAll('.nav-tile').forEach(tile => {
        tile.classList.remove('active');
    });

    // Find and activate clicked tile
    document.querySelectorAll('.nav-tile').forEach(tile => {
        const onclickAttr = tile.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${sectionName}'`)) {
            tile.classList.add('active');
        }
    });

    // Update section content
    document.querySelectorAll('.banken-section').forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    console.log('Showing Banken section:', sectionName);
}

// ========================================
// NEW: Customer Detail Modal Functions
// ========================================

// Open customer detail modal
function openCustomerDetail(customerId) {
    const modal = document.getElementById('customerDetailModal');
    if (modal) {
        modal.style.display = 'flex';
        // Update modal title
        const customerName = document.getElementById('customerName');
        if (customerName) {
            // In real app, would fetch customer data
            customerName.textContent = customerId;
        }
        console.log('Opening customer detail:', customerId);
    }
}

// Close customer detail modal
function closeCustomerDetail() {
    const modal = document.getElementById('customerDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show customer tab in modal
function showCustomerTab(tabName) {
    // Update modal tabs
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.modal-tab').forEach(tab => {
        const onclickAttr = tab.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabName}'`)) {
            tab.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.customer-tab').forEach(content => {
        content.classList.remove('active');
    });

    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    console.log('Customer tab:', tabName);
}

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

// ========================================
// NEW: Task Management
// ========================================

// Filter Aufgaben
function filterAufgaben(filter) {
    document.querySelectorAll('.aufgaben-filter').forEach(btn => {
        btn.classList.remove('active');
    });

    event.target.classList.add('active');
    showNotification(`Filter: ${filter}`, 'info');
    console.log('Filtering tasks:', filter);
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
// NEW: Workflow Actions
// ========================================

// Add Note
function addNote() {
    showNotification('Notiz hinzugefügt', 'success');
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
`;
document.head.appendChild(animationStyles);

// Export module functions
window.switchModule = switchModule;
window.initModuleSelector = initModuleSelector;
window.showBankenTab = showBankenTab;
window.showBankenSection = showBankenSection;
window.filterBySegment = filterBySegment;
window.toggleAllNpl = toggleAllNpl;
window.bulkAction = bulkAction;
window.openCase = openCase;
window.callCustomer = callCustomer;
window.sendReminder = sendReminder;
window.scheduleCallback = scheduleCallback;
window.completeTask = completeTask;
window.exportReport = exportReport;
window.showNotification = showNotification;

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

function openCrmProfile(customerId) {
    const crmView = document.getElementById('crmProfileView');
    if (crmView) {
        crmView.classList.add('active');
        // Could load customer data here based on customerId
        console.log('Opening CRM profile for customer:', customerId);
    }
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

function editStammdaten() {
    showNotification('Bearbeitungsmodus aktiviert', 'info');
}

// Update openCustomerDetail to use full CRM view
const originalOpenCustomerDetail = openCustomerDetail;
function openCustomerDetailCRM(customerId) {
    // Use the full CRM profile instead of the modal
    openCrmProfile(customerId);
}

// Scanner Functions
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
window.crmCall = crmCall;
window.crmEmail = crmEmail;
window.crmSchedule = crmSchedule;
window.crmNote = crmNote;
window.editStammdaten = editStammdaten;

// Initialize module selector on DOM ready
document.addEventListener('DOMContentLoaded', initModuleSelector);

console.log('✅ banken.js geladen');
