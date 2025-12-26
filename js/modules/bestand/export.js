/**
 * Bestand Export Module (ES2024)
 * CSV und Daten-Export Funktionen
 */

import * as storage from './storage.js';
import * as matcher from './matcher.js';
import * as ui from './ui.js';

// ========================================
// CONSTANTS
// ========================================

const CSV_COLUMNS = [
    { key: 'id', label: 'ID' },
    { key: 'kunde.name', label: 'Kunde' },
    { key: 'versicherungsnummer.value', label: 'VS-Nr' },
    { key: 'sparte', label: 'Sparte' },
    { key: 'status', label: 'Status' },
    { key: 'gueltigkeitsdatum.value', label: 'Gültig ab' },
    { key: 'makler.name', label: 'Makler' },
    { key: 'makler.email', label: 'Makler E-Mail' },
    { key: 'notes', label: 'Notizen' },
    { key: 'messageCount', label: 'Mails' },
    { key: 'createdAt', label: 'Erstellt' },
    { key: 'updatedAt', label: 'Aktualisiert' }
];

const STATUS_LABELS = {
    'unvollstaendig': 'Unvollständig',
    'zu-validieren': 'Zu Validieren',
    'export-bereit': 'Export-Bereit',
    'abgeschlossen': 'Abgeschlossen',
    'abgelehnt': 'Abgelehnt',
    'wiedervorlage': 'Wiedervorlage'
};

// ========================================
// HELPER FUNCTIONS
// ========================================

export const formatDateForFilename = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}`;
};

export const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const getNestedValue = (obj, path) => {
    if (!obj || !path) return '';
    if (path === 'messageCount') return obj.messages?.length ?? 0;
    let value = obj;
    for (const part of path.split('.')) {
        if (value == null) return '';
        value = value[part];
    }
    return value;
};

const formatCSVValue = (value, key) => {
    if (value == null) return '';
    if (typeof value === 'boolean') return value ? 'Ja' : 'Nein';
    if (key === 'status') return STATUS_LABELS[value] ?? value;
    if (key === 'createdAt' || key === 'updatedAt') {
        try {
            return new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return value; }
    }
    let str = String(value);
    if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
};

const fixMojibake = (text) => {
    if (!text) return text;
    const replacements = [
        ['Ã¼', 'ü'], ['Ã¶', 'ö'], ['Ã¤', 'ä'], ['ÃŸ', 'ß'],
        ['Ãœ', 'Ü'], ['Ã–', 'Ö'], ['Ã„', 'Ä'],
        ['Ã©', 'é'], ['Ã¨', 'è'], ['Ã¢', 'â'],
        ['Ã®', 'î'], ['Ã´', 'ô'], ['Ã»', 'û'], ['Ã§', 'ç'],
        ['Â§', '§'], ['Â©', '©'], ['Â®', '®']
    ];
    let result = text;
    for (const [bad, good] of replacements) result = result.split(bad).join(good);
    return result;
};

const fixEmailEncoding = (email) => ({
    ...email,
    subject: fixMojibake(email.subject),
    bodyPlain: fixMojibake(email.bodyPlain),
    folder: fixMojibake(email.folder)
});

const extractVsNrFromEmail = (email) => {
    const text = (email.subject ?? '') + '\n' + (email.bodyPlain ?? '');
    const match = text.match(/ERG[-\s]?\d{6,8}/i);
    return match ? match[0].toUpperCase().replace(/\s/g, '-') : null;
};

// ========================================
// EXPORT FUNCTIONS
// ========================================

export const exportToCSV = (cases, filename) => {
    if (!cases?.length) return false;

    filename ??= `ergo_bestandsuebertragung_${formatDateForFilename(new Date())}.csv`;
    const headers = CSV_COLUMNS.map(col => col.label);
    const rows = cases.map(c => CSV_COLUMNS.map(col => formatCSVValue(getNestedValue(c, col.key), col.key)));

    const csvContent = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\r\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    downloadBlob(blob, filename);
    return true;
};

export const exportToJSON = (filename) => {
    const data = storage.exportData();
    filename ??= `ergo_bestandsuebertragung_backup_${formatDateForFilename(new Date())}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
    ui.showToast('Backup erstellt', 'success');
    return true;
};

export const importFromJSON = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                let content = e.target.result;
                if (content.charCodeAt(0) === 0xFEFF || content.charCodeAt(0) === 0xFFFE) content = content.substring(1);
                if (content.charCodeAt(0) === 0xEF && content.charCodeAt(1) === 0xBB && content.charCodeAt(2) === 0xBF) content = content.substring(3);

                const data = JSON.parse(content);

                if (data.cases && data.processed) {
                    const success = storage.importData(data);
                    if (success) resolve({ type: 'backup', data });
                    else reject(new Error('Backup-Import fehlgeschlagen'));
                } else if (data.conversations || data.emails) {
                    resolve({ type: 'outlook', data });
                } else {
                    reject(new Error('Unbekanntes Dateiformat'));
                }
            } catch (e) {
                reject(new Error('Ungültige JSON-Datei: ' + e.message));
            }
        };

        reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
        reader.readAsText(file);
    });
};

export const processOutlookExport = (data) => {
    const allMessages = [];

    if (data.conversations) {
        for (const [convId, conv] of Object.entries(data.conversations)) {
            if (conv.messages) {
                conv.messages.forEach(msg => {
                    msg.conversationID = convId;
                    allMessages.push(fixEmailEncoding(msg));
                });
            }
        }
    } else if (data.emails) {
        data.emails.forEach(email => allMessages.push(fixEmailEncoding(email)));
    }

    if (!allMessages.length) return { processed: 0, matched: 0, unmatched: 0, created: 0, errors: [] };

    const newMessages = allMessages.filter(msg => !storage.isMessageProcessed(msg.entryID));
    if (!newMessages.length) return { processed: 0, matched: 0, unmatched: 0, created: 0, errors: [], message: 'Alle Nachrichten wurden bereits verarbeitet' };

    const cases = storage.getCasesArray();
    const matchResult = matcher.batchMatch(newMessages, cases);

    const assignResult = matcher.autoAssign(matchResult.matched);

    const suggestedForAssign = matchResult.suggested
        .filter(s => s.matches?.length > 0)
        .map(s => ({ email: s.email, match: s.matches[0] }));
    const suggestedAssignResult = matcher.autoAssign(suggestedForAssign);

    let createdCases = 0;
    const byVsNr = {};
    matchResult.unmatched.forEach(email => {
        const vsNr = extractVsNrFromEmail(email) ?? `unknown-${email.entryID}`;
        (byVsNr[vsNr] ??= []).push(email);
    });

    for (const emails of Object.values(byVsNr)) {
        const newCase = matcher.createCaseFromEmail(emails[0], emails);
        if (newCase) createdCases++;
    }

    return {
        processed: newMessages.length,
        matched: assignResult.assigned.length + suggestedAssignResult.assigned.length,
        unmatched: matchResult.unmatched.length,
        created: createdCases,
        errors: [...assignResult.failed, ...suggestedAssignResult.failed]
    };
};

export const generateReport = (cases) => {
    const stats = storage.getStats();
    const maklerStats = storage.getMaklerStats();
    const now = new Date();

    let report = `ERGO Bestandsübertragung Report\n`;
    report += `Erstellt: ${now.toLocaleDateString('de-DE')} ${now.toLocaleTimeString('de-DE')}\n`;
    report += `${'='.repeat(50)}\n\n`;

    report += `ÜBERSICHT\n${'-'.repeat(50)}\n`;
    report += `Gesamt Vorgänge:     ${stats.total}\nBestätigt:           ${stats.bestaetigt}\nAbgelehnt:           ${stats.abgelehnt}\nOffen:               ${stats.offen}\n\n`;

    report += `NACH MAKLER\n${'-'.repeat(50)}\n`;
    maklerStats.forEach(m => {
        report += `${m.name.padEnd(30)} ${m.total} (${m.bestaetigt}/${m.offen}/${m.abgelehnt})\n`;
    });

    const bySparte = {};
    cases.forEach(c => {
        const s = c.sparte ?? 'Unbekannt';
        bySparte[s] = (bySparte[s] ?? 0) + 1;
    });

    report += `\nNACH SPARTE\n${'-'.repeat(50)}\n`;
    Object.entries(bySparte).sort((a, b) => b[1] - a[1]).forEach(([sparte, count]) => {
        report += `${sparte.padEnd(25)} ${count}\n`;
    });

    return report;
};

export const exportReport = (cases, filename) => {
    const report = generateReport(cases);
    filename ??= `ergo_bestandsuebertragung_report_${formatDateForFilename(new Date())}.txt`;
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    downloadBlob(blob, filename);
    ui.showToast('Report exportiert', 'success');
    return true;
};
