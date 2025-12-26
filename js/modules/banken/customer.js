/**
 * Banken Customer Module
 * ES6 Module for customer details, CRM, activities
 */

// ========================================
// STATE
// ========================================

let currentCustomerId = null;

// ========================================
// CUSTOMER DATA (Demo)
// ========================================

const customerDatabase = {
    'K-2024-0001': {
        name: 'Mueller GmbH', type: 'Gewerbe', rechtsform: 'GmbH',
        adresse: 'Musterstraße 123, 38100 Braunschweig', telefon: '+49 531 123456',
        email: 'info@mueller-gmbh.de', ansprechpartner: 'Hans Mueller',
        branche: 'Gastronomie', restschuld: 125000, status: 'Inkasso',
        dpd: 35, willingness: 25, ability: 60, segment: 'eskalation',
        kernproblem: 'Gewerbekunde mit Liquiditätsengpässen seit Q3 2025.'
    },
    'K-2024-7234': {
        name: 'Braun, Thomas', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Lindenweg 45, 30159 Hannover', telefon: '+49 511 987654',
        email: 't.braun@email.de', ansprechpartner: 'Thomas Braun',
        branche: 'Angestellter', restschuld: 289350, status: 'Aktiv',
        dpd: 0, willingness: 90, ability: 85, segment: 'stabil',
        kernproblem: 'Ratenkredit vollständig beglichen.'
    },
    'K-2024-8847': {
        name: 'Müller, Hans', type: 'Privat', rechtsform: 'Privatperson',
        adresse: 'Waldstraße 22, 38100 Braunschweig', telefon: '+49 531 998877',
        email: 'h.mueller@email.de', ansprechpartner: 'Hans Müller',
        branche: 'Angestellter', restschuld: 4230, status: 'Offen',
        dpd: 18, willingness: 85, ability: 70, segment: 'prioritaet',
        kernproblem: 'Dezember-Rate 18 Tage überfällig.'
    }
};

export function getFullCustomerData(customerId) {
    return customerDatabase[customerId] ?? {
        name: 'Unbekannter Kunde', type: 'Unbekannt',
        adresse: '-', telefon: '-', email: '-', ansprechpartner: '-',
        branche: '-', restschuld: 0, status: '-',
        dpd: 0, willingness: 0, ability: 0, segment: 'unbekannt',
        kernproblem: 'Keine Daten verfügbar.'
    };
}

// ========================================
// CUSTOMER DETAIL MODAL
// ========================================

export function openCustomerDetail(customerId, options = {}) {
    const modal = document.getElementById('customerDetailModal');
    if (!modal) return;

    modal.style.display = 'flex';
    currentCustomerId = customerId;

    const customer = getFullCustomerData(customerId);

    const customerNameEl = document.getElementById('customerName');
    if (customerNameEl) customerNameEl.textContent = customer.name;

    const customerIdEl = modal.querySelector('.customer-id');
    if (customerIdEl) customerIdEl.textContent = customerId;

    // Update all tabs
    updateStammdatenFields(modal, customer);
    updateKommunikationFields(modal, customer);

    setTimeout(() => renderCustomerActivities(customerId), 100);

    if (options.showKommunikation) {
        showCustomerTab('kommunikation');
    } else {
        showCustomerTab('stammdaten');
    }

}

export function closeCustomerDetail() {
    const modal = document.getElementById('customerDetailModal');
    if (modal) modal.style.display = 'none';
    currentCustomerId = null;
}

export function showCustomerTab(tabName) {
    document.querySelectorAll('.customer-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    document.querySelectorAll('.customer-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `customer-tab-${tabName}`);
    });
}

function updateStammdatenFields(modal, customer) {
    const fields = {
        'kundenTyp': customer.type,
        'rechtsform': customer.rechtsform,
        'adresse': customer.adresse,
        'telefon': customer.telefon,
        'email': customer.email,
        'ansprechpartner': customer.ansprechpartner,
        'branche': customer.branche
    };

    Object.entries(fields).forEach(([id, value]) => {
        const el = modal.querySelector(`#${id}, [data-field="${id}"]`);
        if (el) el.textContent = value ?? '-';
    });
}

function updateKommunikationFields(modal, customer) {
    const kernproblemEl = modal.querySelector('.ki-kernproblem, #kernproblem');
    if (kernproblemEl) kernproblemEl.textContent = customer.kernproblem ?? '-';
}

// ========================================
// CRM PROFILE
// ========================================

export function openCrmProfile(customerId, taskContext = null) {
    const crmView = document.getElementById('crmProfileView');
    if (!crmView) return;

    crmView.classList.add('active');
    currentCustomerId = customerId;

    const customer = getFullCustomerData(customerId);

    const crmHeader = crmView.querySelector('.crm-header h2, .crm-customer-name');
    if (crmHeader) crmHeader.textContent = customer.name;

    const crmCustomerId = crmView.querySelector('.crm-customer-id');
    if (crmCustomerId) crmCustomerId.textContent = customerId;

}

export function closeCrmProfile() {
    document.getElementById('crmProfileView')?.classList.remove('active');
}

// ========================================
// CUSTOMER ACTIVITIES
// ========================================

export function getCustomerActivities(customerId) {
    const activities = JSON.parse(localStorage.getItem('customerActivities') ?? '{}');
    return activities[customerId] ?? [];
}

export function saveCustomerActivity(customerId, activity) {
    const activities = JSON.parse(localStorage.getItem('customerActivities') ?? '{}');
    activities[customerId] ??= [];
    activities[customerId].unshift(activity);
    localStorage.setItem('customerActivities', JSON.stringify(activities));
    return activity;
}

export function renderCustomerActivities(customerId) {
    const container = document.querySelector('.komm-timeline, #aktivitaetenListe');
    if (!container) return;

    const activities = getCustomerActivities(customerId);

    if (activities.length === 0) return;

    const activityHtml = activities.map(activity => `
        <div class="komm-item ${activity.type} custom-activity" data-id="${activity.id}">
            <div class="komm-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
            </div>
            <div class="komm-body">
                <div class="komm-meta">
                    <span class="komm-type">${activity.typeLabel ?? activity.type}</span>
                    <span class="komm-time">${formatRelativeTime(activity.timestamp)}</span>
                    <span class="komm-author">${activity.author}</span>
                </div>
                <p>${activity.text}</p>
            </div>
            <button class="komm-delete" onclick="deleteActivity('${customerId}', '${activity.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `).join('');

    container.insertAdjacentHTML('afterbegin', activityHtml);
}

export function deleteActivity(customerId, activityId) {
    const activities = JSON.parse(localStorage.getItem('customerActivities') ?? '{}');
    if (activities[customerId]) {
        activities[customerId] = activities[customerId].filter(a => a.id !== activityId);
        localStorage.setItem('customerActivities', JSON.stringify(activities));
    }

    document.querySelector(`.custom-activity[data-id="${activityId}"]`)?.remove();
    window.showNotification?.('Aktivität gelöscht', 'info');
}

// ========================================
// ACTIVITY MODAL
// ========================================

export function openActivityModal(type = 'notiz') {
    let modal = document.getElementById('activityModal');

    if (!modal) {
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
                            <option value="termin">Termin</option>
                        </select>
                    </div>
                    <div class="activity-form-group">
                        <label>Beschreibung</label>
                        <textarea id="activityText" placeholder="Aktivität beschreiben..."></textarea>
                    </div>
                </div>
                <div class="activity-modal-footer">
                    <button class="btn-cancel" onclick="closeActivityModal()">Abbrechen</button>
                    <button class="btn-submit" onclick="submitActivity()">Speichern</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('activityType').value = type;
    document.getElementById('activityText').value = '';
    modal.style.display = 'flex';
}

export function closeActivityModal() {
    const modal = document.getElementById('activityModal');
    if (modal) modal.style.display = 'none';
}

export function submitActivity() {
    const type = document.getElementById('activityType')?.value ?? 'notiz';
    const text = document.getElementById('activityText')?.value?.trim() ?? '';

    if (!text) {
        window.showNotification?.('Bitte Beschreibung eingeben', 'error');
        return;
    }

    if (!currentCustomerId) {
        window.showNotification?.('Kein Kunde ausgewählt', 'error');
        return;
    }

    const typeLabels = {
        notiz: 'Notiz', anruf: 'Telefonat', email: 'E-Mail', termin: 'Termin', aufgabe: 'Aufgabe'
    };

    const activity = {
        id: Date.now().toString(),
        type,
        typeLabel: typeLabels[type] ?? type,
        text,
        author: localStorage.getItem('feedbackAuthor') ?? 'Eike',
        timestamp: new Date().toISOString()
    };

    saveCustomerActivity(currentCustomerId, activity);
    closeActivityModal();
    renderCustomerActivities(currentCustomerId);
    window.showNotification?.('Aktivität gespeichert', 'success');
}

export function addNote() {
    openActivityModal('notiz');
}

// ========================================
// CUSTOMER NOTES & STAMMDATEN
// ========================================

export function getCustomerNotes(customerId) {
    const notes = JSON.parse(localStorage.getItem('customerNotes') ?? '{}');
    return notes[customerId] ?? [];
}

export function saveCustomerNote(customerId, note) {
    const notes = JSON.parse(localStorage.getItem('customerNotes') ?? '{}');
    notes[customerId] ??= [];
    notes[customerId].unshift(note);
    localStorage.setItem('customerNotes', JSON.stringify(notes));
    return note;
}

export function getCustomerStammdaten(customerId) {
    const stammdaten = JSON.parse(localStorage.getItem('customerStammdaten') ?? '{}');
    return stammdaten[customerId] ?? {};
}

export function saveCustomerStammdaten(customerId, field, value) {
    const stammdaten = JSON.parse(localStorage.getItem('customerStammdaten') ?? '{}');
    stammdaten[customerId] ??= {};
    stammdaten[customerId][field] = value;
    localStorage.setItem('customerStammdaten', JSON.stringify(stammdaten));
}

// ========================================
// NPL ACTIONS
// ========================================

export function escalateCase(caseId) {
    window.showNotification?.(`Fall ${caseId} wird eskaliert...`, 'warning');
}

export function createRatePlan(customerId) {
    window.showNotification?.(`Ratenplan für ${customerId} wird erstellt...`, 'info');
}

export function reviewForRestructure() {
    window.showNotification?.('Fälle für Restrukturierung werden geprüft...', 'info');
}

// ========================================
// UTILITIES
// ========================================

function formatRelativeTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tagen`;
    return date.toLocaleDateString('de-DE');
}

// Export current customer ID getter/setter
export const getCurrentCustomerId = () => currentCustomerId;
export const setCurrentCustomerId = (id) => { currentCustomerId = id; };
