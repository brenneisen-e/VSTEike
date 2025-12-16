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

// Refresh Scatter Plot
function refreshScatterPlot() {
    showNotification('Matrix wird aktualisiert...', 'info');
    console.log('Refreshing scatter plot');
}

// Export Matrix
function exportMatrix() {
    showNotification('Matrix wird exportiert...', 'info');
    console.log('Exporting matrix');
}

// Update Portfolio Chart
function updatePortfolioChart(period) {
    console.log('Updating portfolio chart for period:', period);
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

// Initialize module selector on DOM ready
document.addEventListener('DOMContentLoaded', initModuleSelector);

console.log('✅ banken.js geladen');
