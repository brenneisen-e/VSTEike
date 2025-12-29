/**
 * Banken Chat Module - Action Functions
 * Main action handlers for sending messages, filtering, and exporting
 */

import { addBankenChatMessage, showBankenTyping, hideBankenTyping } from './_ui.js';
import { processBankenQuery } from './_query-processor.js';
import { formatCurrency } from './_helpers.js';

/**
 * Send a message from the chat input
 */
export const sendBankenMessage = () => {
    const chatInput = document.getElementById('bankenChatInput');
    const message = chatInput?.value?.trim();
    if (!message) return;

    chatInput.value = '';
    addBankenChatMessage('user', message);
    showBankenTyping();

    setTimeout(() => {
        hideBankenTyping();
        const response = processBankenQuery(message);
        addBankenChatMessage('assistant', response);
    }, 800);
};

/**
 * Show filtered customers in the customer list
 * @param {string} customerIdsString - Comma-separated customer IDs
 */
export const showFilteredCustomers = (customerIdsString) => {
    const customerIds = customerIdsString.split(',').map(id => id.trim());

    // Show filter indicator
    showChatFilterIndicator(customerIds.length);

    const customerListSection = document.querySelector('.customer-list-section');
    if (customerListSection) {
        customerListSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const table = document.querySelector('.banken-page .customer-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const matchingRows = [];
    const hiddenRows = [];

    rows.forEach(row => {
        const onclickAttr = row.getAttribute('onclick') ?? '';
        const cellText = row.querySelector('.customer-cell small')?.textContent ?? '';
        const matches = customerIds.some(id => onclickAttr.includes(id) || cellText.includes(id));

        if (matches) {
            matchingRows.push(row);
            row.style.display = '';
            row.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        } else {
            hiddenRows.push(row);
            row.style.display = 'none';
        }
    });

    // Re-order: matching rows first
    matchingRows.forEach(row => tbody.appendChild(row));
    hiddenRows.forEach(row => tbody.appendChild(row));

    // Update pagination text
    const paginationText = document.querySelector('.table-pagination span');
    if (paginationText) {
        paginationText.textContent = `Zeige ${matchingRows.length} gefilterte Kunden aus KI-Chat`;
    }

    window.showNotification?.(`${matchingRows.length} Kunden gefiltert`, 'info');
};

/**
 * Show filter indicator for chat-based filtering
 */
const showChatFilterIndicator = (count) => {
    // Remove any existing indicator
    document.querySelector('.chat-filter-indicator')?.remove();
    document.querySelector('.segment-filter-indicator')?.remove();

    const indicator = document.createElement('div');
    indicator.className = 'chat-filter-indicator';
    indicator.innerHTML = `
        <span class="filter-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            KI-Chat Filter: ${count} Kunden
        </span>
        <button class="filter-clear-btn" onclick="clearChatFilter()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Filter aufheben
        </button>
    `;

    const tableWrapper = document.querySelector('.customer-table-wrapper');
    if (tableWrapper) {
        tableWrapper.insertAdjacentElement('beforebegin', indicator);
    }
};

/**
 * Clear chat-based filter and show all customers
 */
export const clearChatFilter = () => {
    document.querySelector('.chat-filter-indicator')?.remove();

    const table = document.querySelector('.banken-page .customer-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    tbody.querySelectorAll('tr').forEach(row => {
        row.style.display = '';
        row.style.backgroundColor = '';
    });

    const paginationText = document.querySelector('.table-pagination span');
    if (paginationText) {
        paginationText.textContent = 'Zeige alle Kunden';
    }

    window.showNotification?.('Filter aufgehoben', 'info');
};

/**
 * Export chat query results to Excel (CSV format)
 * @param {Object} data - Data to export
 * @param {string} filename - Base filename for the export
 */
export const exportChatToExcel = (data, filename) => {
    let csvContent = '';

    if (data.type === 'customers') {
        csvContent = 'ID;Name;Forderung;DPD;Segment;Status\n';
        data.items.forEach(item => {
            csvContent += `${item.id};${item.name};${item.forderung};${item.dpd};${item.segment};${item.status}\n`;
        });
    } else if (data.type === 'payments') {
        csvContent = 'ID;Kunde;Betrag;Datum;Art\n';
        data.items.forEach(item => {
            csvContent += `${item.id};${item.kunde};${item.betrag};${item.datum};${item.art}\n`;
        });
    } else if (data.type === 'portfolio') {
        csvContent = 'Kennzahl;Wert\n';
        csvContent += `Gesamtforderung;${data.total}\nAktive Fälle;${data.count}\nØ DPD;${data.avgDpd}\n`;
        csvContent += `Eskalation;${data.segments.eskalation}\nPriorität;${data.segments.prioritaet}\n`;
        csvContent += `Restrukturierung;${data.segments.restrukturierung}\nAbwicklung;${data.segments.abwicklung}\n`;
    }

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof showNotification === 'function') showNotification('Excel-Export erfolgreich', 'success');
};

/**
 * Export chat query results to PDF
 * @param {Object} data - Data to export
 * @param {string} filename - Base filename for the export
 */
export const exportChatToPdf = (data, filename) => {
    const printWindow = window.open('', '_blank');

    let htmlContent = `<!DOCTYPE html><html><head><title>${filename}</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f1f5f9; color: #475569; text-align: left; padding: 12px; border: 1px solid #e2e8f0; }
            td { padding: 10px 12px; border: 1px solid #e2e8f0; }
            tr:nth-child(even) { background: #f8fafc; }
            .summary { background: #f0f9ff; padding: 16px; border-radius: 8px; margin: 20px 0; }
            .summary h3 { margin: 0 0 10px 0; color: #0369a1; }
            .footer { margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style></head><body>
        <h1>Collections Dashboard - ${filename}</h1>
        <p>Erstellt am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}</p>`;

    if (data.type === 'customers') {
        const total = data.items.reduce((sum, c) => sum + c.forderung, 0);
        htmlContent += `<div class="summary"><h3>Zusammenfassung</h3>
            <p><strong>${data.items.length}</strong> Kunden · <strong>€${formatCurrency(total)}</strong> Gesamtforderung</p></div>
            <table><thead><tr><th>ID</th><th>Name</th><th>Forderung</th><th>DPD</th><th>Segment</th><th>Status</th></tr></thead><tbody>`;
        data.items.forEach(item => {
            htmlContent += `<tr><td>${item.id}</td><td>${item.name}</td><td>€${formatCurrency(item.forderung)}</td>
                <td>${item.dpd}</td><td>${item.segment}</td><td>${item.status}</td></tr>`;
        });
        htmlContent += '</tbody></table>';
    } else if (data.type === 'payments') {
        const total = data.items.reduce((sum, p) => sum + p.betrag, 0);
        htmlContent += `<div class="summary"><h3>Zahlungsübersicht</h3>
            <p><strong>${data.items.length}</strong> Zahlungen · <strong>€${formatCurrency(total)}</strong> Gesamtbetrag</p></div>
            <table><thead><tr><th>ID</th><th>Kunde</th><th>Betrag</th><th>Datum</th><th>Art</th></tr></thead><tbody>`;
        data.items.forEach(item => {
            htmlContent += `<tr><td>${item.id}</td><td>${item.kunde}</td><td>€${formatCurrency(item.betrag)}</td>
                <td>${item.datum}</td><td>${item.art}</td></tr>`;
        });
        htmlContent += '</tbody></table>';
    } else if (data.type === 'portfolio') {
        htmlContent += `<div class="summary"><h3>Portfolio-Übersicht</h3>
            <table style="width: auto;"><tr><td><strong>Gesamtforderung:</strong></td><td>€${formatCurrency(data.total)}</td></tr>
            <tr><td><strong>Aktive Fälle:</strong></td><td>${data.count}</td></tr>
            <tr><td><strong>Ø DPD:</strong></td><td>${data.avgDpd} Tage</td></tr></table></div>
            <h3>Segmentverteilung</h3><table><thead><tr><th>Segment</th><th>Anzahl Fälle</th></tr></thead><tbody>
            <tr><td>Eskalation</td><td>${data.segments.eskalation}</td></tr>
            <tr><td>Priorität</td><td>${data.segments.prioritaet}</td></tr>
            <tr><td>Restrukturierung</td><td>${data.segments.restrukturierung}</td></tr>
            <tr><td>Abwicklung</td><td>${data.segments.abwicklung}</td></tr></tbody></table>`;
    }

    htmlContent += `<div class="footer">Dieser Bericht wurde automatisch vom Collections Dashboard generiert.</div></body></html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();

    if (typeof showNotification === 'function') showNotification('PDF-Export wird geöffnet', 'success');
};
