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

// Initialize module selector on DOM ready
document.addEventListener('DOMContentLoaded', initModuleSelector);

console.log('✅ banken.js geladen');
