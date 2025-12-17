/**
 * Export Modul - CSV und Daten-Export Funktionen
 * Exportiert Vorgangsdaten in verschiedene Formate
 */

const Export = (function() {
    'use strict';

    // CSV-Spalten Definitionen
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

    // Status-Labels für Export
    const STATUS_LABELS = {
        'unvollstaendig': 'Unvollständig',
        'zu-validieren': 'Zu Validieren',
        'export-bereit': 'Export-Bereit',
        'abgeschlossen': 'Abgeschlossen',
        'abgelehnt': 'Abgelehnt',
        'wiedervorlage': 'Wiedervorlage'
    };

    /**
     * Vorgänge als CSV exportieren
     */
    function exportToCSV(cases, filename) {
        if (!cases || cases.length === 0) {
            return false;
        }

        // Dateiname generieren
        filename = filename || `ergo_bestandsuebertragung_${formatDateForFilename(new Date())}.csv`;

        // CSV-Header
        const headers = CSV_COLUMNS.map(col => col.label);

        // CSV-Zeilen
        const rows = cases.map(c => {
            return CSV_COLUMNS.map(col => {
                const value = getNestedValue(c, col.key);
                return formatCSVValue(value, col.key);
            });
        });

        // CSV zusammenbauen
        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.join(';'))
        ].join('\r\n');

        // BOM für UTF-8 hinzufügen (damit Excel Umlaute korrekt anzeigt)
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

        // Download
        downloadBlob(blob, filename);

        return true;
    }

    /**
     * Verschachtelten Wert aus Objekt holen
     */
    function getNestedValue(obj, path) {
        if (!obj || !path) return '';

        // Spezialfall: messageCount
        if (path === 'messageCount') {
            return obj.messages ? obj.messages.length : 0;
        }

        const parts = path.split('.');
        let value = obj;

        for (const part of parts) {
            if (value === null || value === undefined) return '';
            value = value[part];
        }

        return value;
    }

    /**
     * Wert für CSV formatieren
     */
    function formatCSVValue(value, key) {
        if (value === null || value === undefined) {
            return '';
        }

        // Boolean
        if (typeof value === 'boolean') {
            return value ? 'Ja' : 'Nein';
        }

        // Status
        if (key === 'status') {
            return STATUS_LABELS[value] || value;
        }

        // Datum
        if (key === 'createdAt' || key === 'updatedAt') {
            return formatDateForCSV(value);
        }

        // String mit Sonderzeichen escapen
        let str = String(value);

        // Semikolon, Anführungszeichen, Zeilenumbrüche behandeln
        if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            str = '"' + str.replace(/"/g, '""') + '"';
        }

        return str;
    }

    /**
     * Datum für CSV formatieren
     */
    function formatDateForCSV(dateStr) {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    }

    /**
     * Datum für Dateinamen formatieren
     */
    function formatDateForFilename(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}${month}${day}_${hours}${minutes}`;
    }

    /**
     * Blob als Datei herunterladen
     */
    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Alle Daten als JSON exportieren (Backup)
     */
    function exportToJSON(filename) {
        const data = Storage.exportData();

        filename = filename || `ergo_bestandsuebertragung_backup_${formatDateForFilename(new Date())}.json`;

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, filename);

        UI.showToast('Backup erstellt', 'success');
        return true;
    }

    /**
     * JSON-Datei importieren (Outlook-Export oder Backup)
     */
    function importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function(e) {
                try {
                    // BOM entfernen falls vorhanden (UTF-8: EF BB BF, UTF-16: FE FF oder FF FE)
                    let content = e.target.result;
                    if (content.charCodeAt(0) === 0xFEFF || content.charCodeAt(0) === 0xFFFE) {
                        content = content.substring(1);
                    }
                    // UTF-8 BOM kann als 3 Zeichen erscheinen
                    if (content.charCodeAt(0) === 0xEF && content.charCodeAt(1) === 0xBB && content.charCodeAt(2) === 0xBF) {
                        content = content.substring(3);
                    }

                    const data = JSON.parse(content);

                    // Prüfen ob es ein Backup oder ein Outlook-Export ist
                    if (data.cases && data.processed) {
                        // Backup-Import
                        const success = Storage.importData(data);
                        if (success) {
                            resolve({ type: 'backup', data: data });
                        } else {
                            reject(new Error('Backup-Import fehlgeschlagen'));
                        }
                    } else if (data.conversations || data.emails) {
                        // Outlook-Export (conversations oder emails Format)
                        resolve({ type: 'outlook', data: data });
                    } else {
                        reject(new Error('Unbekanntes Dateiformat'));
                    }
                } catch (e) {
                    reject(new Error('Ungültige JSON-Datei: ' + e.message));
                }
            };

            reader.onerror = function() {
                reject(new Error('Datei konnte nicht gelesen werden'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * UTF-8 Mojibake korrigieren (wenn UTF-8 als Windows-1252 gelesen wurde)
     */
    function fixMojibake(text) {
        if (!text) return text;
        // Häufige UTF-8 Mojibake-Muster (als Array um Duplikate zu vermeiden)
        const replacements = [
            ['Ã¼', 'ü'], ['Ã¶', 'ö'], ['Ã¤', 'ä'], ['ÃŸ', 'ß'],
            ['Ãœ', 'Ü'], ['Ã–', 'Ö'], ['Ã„', 'Ä'],
            ['Ã©', 'é'], ['Ã¨', 'è'], ['Ã¢', 'â'],
            ['Ã®', 'î'], ['Ã´', 'ô'], ['Ã»', 'û'], ['Ã§', 'ç'],
            ['Â§', '§'], ['Â©', '©'], ['Â®', '®']
        ];
        let result = text;
        for (const [bad, good] of replacements) {
            result = result.split(bad).join(good);
        }
        return result;
    }

    /**
     * E-Mail-Felder korrigieren (Encoding)
     */
    function fixEmailEncoding(email) {
        return {
            ...email,
            subject: fixMojibake(email.subject),
            bodyPlain: fixMojibake(email.bodyPlain),
            folder: fixMojibake(email.folder)
        };
    }

    /**
     * VS-Nr aus E-Mail-Text extrahieren
     */
    function extractVsNrFromEmail(email) {
        const text = (email.subject || '') + '\n' + (email.bodyPlain || '');
        // ERG-Nummer Pattern
        const match = text.match(/ERG[-\s]?\d{6,8}/i);
        return match ? match[0].toUpperCase().replace(/\s/g, '-') : null;
    }

    /**
     * Outlook-Export verarbeiten
     * Unterstützt sowohl 'conversations' als auch 'emails' Format
     */
    function processOutlookExport(data) {
        const allMessages = [];

        // Format 1: conversations (gruppiert nach ConversationID)
        if (data.conversations) {
            for (const [convId, conv] of Object.entries(data.conversations)) {
                if (conv.messages) {
                    conv.messages.forEach(msg => {
                        msg.conversationID = convId;
                        allMessages.push(fixEmailEncoding(msg));
                    });
                }
            }
        }
        // Format 2: emails (flache Liste aus VBScript-Export)
        else if (data.emails) {
            data.emails.forEach(email => {
                allMessages.push(fixEmailEncoding(email));
            });
        }

        if (allMessages.length === 0) {
            return { processed: 0, matched: 0, unmatched: 0, created: 0, errors: [] };
        }

        // Bereits verarbeitete Nachrichten filtern
        const newMessages = allMessages.filter(msg =>
            !Storage.isMessageProcessed(msg.entryID)
        );

        if (newMessages.length === 0) {
            return {
                processed: 0,
                matched: 0,
                unmatched: 0,
                created: 0,
                errors: [],
                message: 'Alle Nachrichten wurden bereits verarbeitet'
            };
        }

        // Matching durchführen
        const cases = Storage.getCasesArray();
        const matchResult = Matcher.batchMatch(newMessages, cases);

        // Automatische Zuordnungen durchführen
        const assignResult = Matcher.autoAssign(matchResult.matched);

        // Suggested Matches auch zuordnen (niedrigere Confidence, aber trotzdem Match)
        // Dies verhindert, dass Reminder-Mails als neue Vorgänge angelegt werden
        const suggestedForAssign = matchResult.suggested
            .filter(s => s.matches && s.matches.length > 0)
            .map(s => ({
                email: s.email,
                match: s.matches[0] // Besten Match nehmen
            }));
        const suggestedAssignResult = Matcher.autoAssign(suggestedForAssign);

        // Neue Fälle nur aus wirklich nicht zugeordneten E-Mails erstellen
        let createdCases = 0;
        const unmatchedEmails = matchResult.unmatched;

        // E-Mails nach VS-Nr gruppieren (nicht nach ConversationID!)
        // Das ist wichtig, wenn mehrere Vorgänge in derselben Konversation sind
        const byVsNr = {};
        unmatchedEmails.forEach(email => {
            const vsNr = extractVsNrFromEmail(email) || `unknown-${email.entryID}`;
            if (!byVsNr[vsNr]) {
                byVsNr[vsNr] = [];
            }
            byVsNr[vsNr].push(email);
        });

        // Für jede VS-Nr einen neuen Fall erstellen
        for (const [vsNr, emails] of Object.entries(byVsNr)) {
            const newCase = Matcher.createCaseFromEmail(emails[0], emails);
            if (newCase) {
                createdCases++;
            }
        }

        // Gesamtzahl der zugeordneten E-Mails
        const totalAssigned = assignResult.assigned.length + suggestedAssignResult.assigned.length;

        return {
            processed: newMessages.length,
            matched: totalAssigned,
            unmatched: unmatchedEmails.length,
            created: createdCases,
            errors: [...assignResult.failed, ...suggestedAssignResult.failed]
        };
    }

    /**
     * Statistik-Report als Text generieren
     */
    function generateReport(cases) {
        const stats = Storage.getStats();
        const maklerStats = Storage.getMaklerStats();
        const now = new Date();

        let report = `ERGO Bestandsübertragung Report\n`;
        report += `Erstellt: ${now.toLocaleDateString('de-DE')} ${now.toLocaleTimeString('de-DE')}\n`;
        report += `${'='.repeat(50)}\n\n`;

        report += `ÜBERSICHT\n`;
        report += `${'-'.repeat(50)}\n`;
        report += `Gesamt Vorgänge:     ${stats.total}\n`;
        report += `Bestätigt:           ${stats.bestaetigt}\n`;
        report += `Abgelehnt:           ${stats.abgelehnt}\n`;
        report += `Offen:               ${stats.offen}\n\n`;

        // Nach Makler
        report += `NACH MAKLER\n`;
        report += `${'-'.repeat(50)}\n`;
        maklerStats.forEach(m => {
            report += `${m.name.padEnd(30)} ${m.total} (${m.bestaetigt}/${m.offen}/${m.abgelehnt})\n`;
        });

        report += `\n`;

        // Nach Sparte gruppieren
        const bySparte = {};
        cases.forEach(c => {
            const s = c.sparte || 'Unbekannt';
            bySparte[s] = (bySparte[s] || 0) + 1;
        });

        report += `NACH SPARTE\n`;
        report += `${'-'.repeat(50)}\n`;
        Object.entries(bySparte)
            .sort((a, b) => b[1] - a[1])
            .forEach(([sparte, count]) => {
                report += `${sparte.padEnd(25)} ${count}\n`;
            });

        return report;
    }

    /**
     * Report als Textdatei exportieren
     */
    function exportReport(cases, filename) {
        const report = generateReport(cases);
        filename = filename || `ergo_bestandsuebertragung_report_${formatDateForFilename(new Date())}.txt`;

        const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
        downloadBlob(blob, filename);

        UI.showToast('Report exportiert', 'success');
        return true;
    }

    // Öffentliche API
    return {
        exportToCSV,
        exportToJSON,
        importFromJSON,
        processOutlookExport,
        generateReport,
        exportReport,

        // Hilfsfunktionen
        formatDateForFilename,
        downloadBlob
    };
})();
