// ========================================
// MODULE SWITCHING (Versicherung/Banken/Asset Manager)
// ========================================

// Track if Banken module has been loaded
let bankenModuleLoaded = false;

// Component registry for the modular Banken system
const BANKEN_COMPONENTS = [
    'header',
    'section-segmentierung',
    'section-npl',
    'section-stage2',
    'section-aufgaben',
    'modal-customer-detail',
    'modal-document-scanner',
    'crm-profile-view'
];

// Load a single component
async function loadComponent(componentName) {
    try {
        const response = await fetch(`partials/banken/${componentName}.html`);
        if (response.ok) {
            return await response.text();
        }
        console.warn(`Component ${componentName} could not be loaded`);
        return `<!-- Component ${componentName} failed to load -->`;
    } catch (error) {
        console.warn(`Error loading component ${componentName}:`, error);
        return `<!-- Component ${componentName} error -->`;
    }
}

// Load all components and inject into placeholders
async function loadBankenComponents(container) {
    const componentPlaceholders = container.querySelectorAll('[data-component]');

    // Load all components in parallel for better performance
    const loadPromises = Array.from(componentPlaceholders).map(async (placeholder) => {
        const componentName = placeholder.getAttribute('data-component');
        const html = await loadComponent(componentName);
        placeholder.outerHTML = html;
    });

    await Promise.all(loadPromises);
    console.log(`Loaded ${componentPlaceholders.length} components`);
}

// Load Banken module from partial (modular version)
async function loadBankenModule() {
    if (bankenModuleLoaded) return;

    const container = document.getElementById('bankenModule');
    if (!container) return;

    try {
        // First load the main shell template
        const response = await fetch('partials/banken-module.html');
        if (response.ok) {
            const html = await response.text();
            container.innerHTML = html;

            // Then load all components into placeholders
            await loadBankenComponents(container);

            bankenModuleLoaded = true;
            console.log('Banken-Modul modular geladen');

            // Initialize charts after all content is loaded
            setTimeout(() => {
                initBankenCharts();
            }, 100);
        } else {
            throw new Error('Failed to load module');
        }
    } catch (error) {
        console.warn('Banken-Modul konnte nicht geladen werden, verwende Fallback');
        // If fetch fails (e.g., file:// protocol), the module stays with loading state
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

// Show overdue cases - navigates to Aufgaben section
function showOverdueCases() {
    showBankenSection('aufgaben');
    showNotification('23 überfällige Fälle werden angezeigt', 'warning');
    console.log('Showing overdue cases');
}

// Dismiss alert banner
function dismissAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
        alert.style.display = 'none';
    }
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
document.addEventListener('DOMContentLoaded', initModuleSelector);

console.log('✅ banken.js geladen');
