/**
 * Bestand Storage Module (ES2024)
 * localStorage Persistenz für Bestandsübertragung
 */

// ========================================
// CONSTANTS
// ========================================

const KEYS = {
    CASES: 'bestandsuebertragung_cases',
    PROCESSED: 'bestandsuebertragung_processed',
    SETTINGS: 'bestandsuebertragung_settings',
    UNASSIGNED: 'bestandsuebertragung_unassigned'
};

const DEFAULT_SETTINGS = {
    autoMatch: true,
    confirmDelete: true,
    demoLoaded: false
};

// ========================================
// HELPERS
// ========================================

const safeJSONParse = (str, fallback) => {
    try {
        return JSON.parse(str) ?? fallback;
    } catch {
        return fallback;
    }
};

export const generateId = () =>
    'case-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 11);

// ========================================
// CASES
// ========================================

export const getCases = () => safeJSONParse(localStorage.getItem(KEYS.CASES), {});

export const saveCases = (cases) => {
    try {
        localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
        return true;
    } catch {
        return false;
    }
};

export const getCase = (id) => getCases()[id] ?? null;

export const saveCase = (caseData) => {
    const cases = getCases();
    const now = new Date().toISOString();

    if (!caseData.id) {
        caseData.id = generateId();
        caseData.createdAt = now;
    }
    caseData.updatedAt = now;
    cases[caseData.id] = caseData;

    return saveCases(cases) ? caseData : null;
};

export const deleteCase = (id) => {
    const cases = getCases();
    if (cases[id]) {
        delete cases[id];
        return saveCases(cases);
    }
    return false;
};

export const getCasesArray = () => Object.values(getCases());

// ========================================
// CASE FINDING
// ========================================

export const findCaseByConversationId = (conversationId) =>
    getCasesArray().find(c => c.conversationIds?.includes(conversationId));

export const findCaseByVsNr = (vsNr) => {
    if (!vsNr) return null;
    const normalized = vsNr.replace(/[-\s]/g, '').toUpperCase();
    return getCasesArray().find(c => {
        const caseVsNr = c.versicherungsnummer?.value?.replace(/[-\s]/g, '').toUpperCase();
        return caseVsNr === normalized;
    });
};

export const findCasesByKunde = (name) => {
    if (!name) return [];
    const normalized = name.toLowerCase();
    return getCasesArray().filter(c => c.kunde?.name?.toLowerCase().includes(normalized));
};

export const findCasesByMakler = (maklerName) => {
    if (!maklerName) return [];
    const normalized = maklerName.toLowerCase();
    return getCasesArray().filter(c => c.makler?.name?.toLowerCase().includes(normalized));
};

// ========================================
// MESSAGES
// ========================================

export const getProcessedMessageIds = () =>
    safeJSONParse(localStorage.getItem(KEYS.PROCESSED), []);

export const markMessageProcessed = (messageId) => {
    const processed = getProcessedMessageIds();
    if (!processed.includes(messageId)) {
        processed.push(messageId);
        localStorage.setItem(KEYS.PROCESSED, JSON.stringify(processed));
    }
};

export const markMessagesProcessed = (messageIds) => {
    const processed = getProcessedMessageIds();
    let changed = false;
    messageIds.forEach(id => {
        if (!processed.includes(id)) {
            processed.push(id);
            changed = true;
        }
    });
    if (changed) localStorage.setItem(KEYS.PROCESSED, JSON.stringify(processed));
};

export const isMessageProcessed = (messageId) =>
    getProcessedMessageIds().includes(messageId);

export const addMessagesToCase = (caseId, messages) => {
    const caseData = getCase(caseId);
    if (!caseData) return false;

    caseData.messages ??= [];
    caseData.messageIds ??= [];
    caseData.conversationIds ??= [];
    caseData.statusHistory ??= [];

    let addedCount = 0;
    messages.forEach(msg => {
        if (!caseData.messageIds.includes(msg.entryID)) {
            caseData.messages.push(msg);
            caseData.messageIds.push(msg.entryID);
            addedCount++;
            if (msg.conversationID && !caseData.conversationIds.includes(msg.conversationID)) {
                caseData.conversationIds.push(msg.conversationID);
            }
        }
    });

    if (addedCount > 0) {
        caseData.statusHistory.push({
            date: new Date().toISOString(),
            from: caseData.status,
            to: caseData.status,
            note: `${addedCount} neue Mail${addedCount > 1 ? 's' : ''} erhalten`,
            isNew: true
        });
    }

    return saveCase(caseData);
};

// ========================================
// UNASSIGNED MAILS
// ========================================

export const getUnassignedMails = () =>
    safeJSONParse(localStorage.getItem(KEYS.UNASSIGNED), []);

export const addUnassignedMail = (mail) => {
    const mails = getUnassignedMails();
    if (!mails.find(m => m.entryID === mail.entryID)) {
        mails.push(mail);
        localStorage.setItem(KEYS.UNASSIGNED, JSON.stringify(mails));
    }
};

export const removeUnassignedMail = (entryID) => {
    const mails = getUnassignedMails().filter(m => m.entryID !== entryID);
    localStorage.setItem(KEYS.UNASSIGNED, JSON.stringify(mails));
};

export const clearUnassignedMails = () =>
    localStorage.setItem(KEYS.UNASSIGNED, JSON.stringify([]));

// ========================================
// SETTINGS
// ========================================

export const getSettings = () => ({
    ...DEFAULT_SETTINGS,
    ...safeJSONParse(localStorage.getItem(KEYS.SETTINGS), {})
});

export const saveSettings = (settings) => {
    const updated = { ...getSettings(), ...settings };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
};

// ========================================
// STATISTICS
// ========================================

export const getStats = () => {
    const cases = getCasesArray();
    const stats = { total: cases.length, bestaetigt: 0, abgelehnt: 0, offen: 0, exportiert: 0 };

    cases.forEach(c => {
        if (c.status === 'bestaetigt') stats.bestaetigt++;
        else if (c.status === 'abgelehnt') stats.abgelehnt++;
        else stats.offen++;
        if (c.exported?.date) stats.exportiert++;
    });

    return stats;
};

export const getDetailedStats = () => {
    const cases = getCasesArray();
    const stats = {
        total: cases.length,
        byStatus: { neu: 0, angefragt: 0, 'in-bearbeitung': 0, bestaetigt: 0, abgelehnt: 0 },
        exportiert: 0,
        exportReady: 0,
        byWorkflow: { mailReceived: 0, mailUploaded: 0, kiRecognized: 0, pvValidated: 0, exported: 0 }
    };

    cases.forEach(c => {
        if (stats.byStatus.hasOwnProperty(c.status)) stats.byStatus[c.status]++;
        if (c.exported?.date) stats.exportiert++;
        if (c.status === 'export-bereit' && !c.exported?.date) stats.exportReady++;
        if (c.workflow) {
            if (c.workflow.mailReceived) stats.byWorkflow.mailReceived++;
            if (c.workflow.mailUploaded) stats.byWorkflow.mailUploaded++;
            if (c.workflow.kiRecognized && c.status !== 'unvollstaendig') stats.byWorkflow.kiRecognized++;
            if (c.workflow.pvValidated) stats.byWorkflow.pvValidated++;
            if (c.workflow.exported) stats.byWorkflow.exported++;
        }
    });

    return stats;
};

export const getMaklerStats = () => {
    const cases = getCasesArray();
    const maklerMap = {};

    cases.forEach(c => {
        const name = c.makler?.name ?? 'Unbekannt';
        maklerMap[name] ??= { name, email: c.makler?.email ?? '', total: 0, bestaetigt: 0, abgelehnt: 0, offen: 0, cases: [] };
        maklerMap[name].total++;
        maklerMap[name].cases.push(c);
        if (c.status === 'bestaetigt') maklerMap[name].bestaetigt++;
        else if (c.status === 'abgelehnt') maklerMap[name].abgelehnt++;
        else maklerMap[name].offen++;
    });

    return Object.values(maklerMap).sort((a, b) => b.total - a.total);
};

export const getSpartenStats = () => {
    const spartenMap = {};
    getCasesArray().forEach(c => {
        const sparte = c.sparte ?? 'Unbekannt';
        spartenMap[sparte] = (spartenMap[sparte] ?? 0) + 1;
    });
    return Object.entries(spartenMap).map(([sparte, count]) => ({ sparte, count })).sort((a, b) => b.count - a.count);
};

export const getAllEmails = () => {
    const emails = [];
    getCasesArray().forEach(c => {
        c.messages?.forEach(msg => {
            emails.push({ ...msg, caseId: c.id, kundeName: c.kunde?.name ?? 'Unbekannt', status: c.status });
        });
    });
    return emails.sort((a, b) => new Date(b.receivedTime) - new Date(a.receivedTime));
};

export const getRecentActivity = (limit = 10) => {
    const activities = [];
    getCasesArray().forEach(c => {
        c.statusHistory?.forEach(h => {
            activities.push({
                caseId: c.id, kundeName: c.kunde?.name ?? 'Unbekannt', maklerName: c.makler?.name ?? '-',
                date: h.date, from: h.from, to: h.to, note: h.note, isNew: h.isNew ?? false
            });
        });
    });
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
};

// ========================================
// VALIDATION & EXPORT
// ========================================

export const getExportReadyCases = () =>
    getCasesArray().filter(c => c.workflow?.pvValidated && !c.exported?.date);

export const getPendingValidationCases = () =>
    getCasesArray().filter(c => c.workflow?.kiRecognized && !c.workflow?.pvValidated && c.status !== 'unvollstaendig');

export const getIncompleteCases = () =>
    getCasesArray().filter(c => c.status === 'unvollstaendig');

export const markCaseValidated = (caseId) => {
    const caseData = getCase(caseId);
    if (!caseData) return false;
    caseData.workflow ??= {};
    caseData.workflow.pvValidated = new Date().toISOString();
    return saveCase(caseData);
};

export const markCasesValidated = (caseIds) => {
    const cases = getCases();
    const date = new Date().toISOString();
    let count = 0;
    caseIds.forEach(id => {
        if (cases[id]) {
            cases[id].workflow ??= {};
            cases[id].workflow.pvValidated = date;
            cases[id].updatedAt = date;
            count++;
        }
    });
    saveCases(cases);
    return count;
};

export const markCasesExported = (caseIds, exporterName) => {
    const cases = getCases();
    const date = new Date().toISOString();
    let count = 0;
    caseIds.forEach(id => {
        if (cases[id]) {
            const prev = cases[id].status;
            cases[id].exported = { date, by: exporterName };
            cases[id].status = 'abgeschlossen';
            cases[id].workflow ??= {};
            cases[id].workflow.exported = date;
            cases[id].statusHistory ??= [];
            cases[id].statusHistory.push({ date: date.split('T')[0], from: prev, to: 'abgeschlossen', note: `Exportiert von ${exporterName}` });
            cases[id].updatedAt = date;
            count++;
        }
    });
    saveCases(cases);
    return count;
};

// ========================================
// IMPORT/EXPORT HISTORY
// ========================================

export const getImportExportHistory = () => {
    try {
        return JSON.parse(localStorage.getItem('importExportHistory')) ?? [];
    } catch {
        return [];
    }
};

export const logImportExport = (type, count, user) => {
    const history = getImportExportHistory();
    history.unshift({ date: new Date().toISOString(), type, count, user: user ?? 'Unbekannt' });
    localStorage.setItem('importExportHistory', JSON.stringify(history.slice(0, 50)));
};

// ========================================
// LINKED CASES
// ========================================

export const getLinkedCases = (caseId) => {
    const caseData = getCase(caseId);
    if (!caseData?.linkedCaseIds?.length) return [];
    const cases = getCases();
    return caseData.linkedCaseIds.filter(id => cases[id]).map(id => cases[id]);
};

export const hasLinkedCases = (caseId) => {
    const caseData = getCase(caseId);
    return caseData?.linkedCaseIds?.length > 0;
};

// ========================================
// STATUS HISTORY
// ========================================

export const addStatusHistory = (caseId, fromStatus, toStatus, note) => {
    const caseData = getCase(caseId);
    if (!caseData) return false;
    caseData.statusHistory ??= [];
    caseData.statusHistory.push({ date: new Date().toISOString(), from: fromStatus, to: toStatus, note: note ?? '', isNew: true });
    return saveCase(caseData);
};

// ========================================
// UTILITIES
// ========================================

export const clearAll = () => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('importExportHistory');
    const settings = getSettings();
    settings.demoLoaded = false;
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

export const getStorageInfo = () => {
    let total = 0;
    Object.values(KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) total += item.length * 2;
    });
    return { used: total, usedKB: (total / 1024).toFixed(2), usedMB: (total / 1024 / 1024).toFixed(2), limit: '5MB' };
};

export const exportData = () => ({
    exportDate: new Date().toISOString(),
    cases: getCases(),
    processed: getProcessedMessageIds(),
    unassigned: getUnassignedMails(),
    settings: getSettings()
});

export const importData = (data) => {
    try {
        if (data.cases) localStorage.setItem(KEYS.CASES, JSON.stringify(data.cases));
        if (data.processed) localStorage.setItem(KEYS.PROCESSED, JSON.stringify(data.processed));
        if (data.unassigned) localStorage.setItem(KEYS.UNASSIGNED, JSON.stringify(data.unassigned));
        if (data.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
        return true;
    } catch {
        return false;
    }
};

// ========================================
// DUPLICATES
// ========================================

export const findDuplicates = () => {
    const cases = getCasesArray();
    const groups = [];
    const processed = new Set();

    const normalize = (s) => s?.replace(/[-\s.]/g, '').toUpperCase() ?? '';
    const normalizeName = (s) => s?.toLowerCase().replace(/[,\s]+/g, ' ').replace(/[äöüß]/g, c => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }[c])).trim() ?? '';

    cases.forEach((a, i) => {
        if (processed.has(a.id)) return;
        const dups = [a];

        cases.slice(i + 1).forEach(b => {
            if (processed.has(b.id)) return;
            const vsA = normalize(a.versicherungsnummer?.value), vsB = normalize(b.versicherungsnummer?.value);
            const kA = normalizeName(a.kunde?.name), kB = normalizeName(b.kunde?.name);
            const mA = a.makler?.email?.toLowerCase(), mB = b.makler?.email?.toLowerCase();
            const vA = a.versicherer?.name, vB = b.versicherer?.name;

            let reason = '';
            if (vsA && vsB && vsA === vsB) reason = 'VS-Nr';
            else if (kA && kB && mA && mB && kA === kB && mA === mB) reason = 'Kunde+Makler';
            else if (kA && kB && vA && vB && kA === kB && vA === vB) reason = 'Kunde+Versicherer';

            if (reason) {
                dups.push({ ...b, _duplicateReason: reason });
                processed.add(b.id);
            }
        });

        if (dups.length > 1) {
            processed.add(a.id);
            groups.push(dups);
        }
    });

    return groups;
};

export const mergeDuplicates = () => {
    const groups = findDuplicates();
    let merged = 0, deleted = 0;

    groups.forEach(group => {
        group.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const primary = group[0];

        group.slice(1).forEach(dup => {
            if (dup.messages?.length) addMessagesToCase(primary.id, dup.messages);
            if (dup.notes?.trim()) {
                const p = getCase(primary.id);
                if (p) {
                    p.notes = (p.notes ?? '') + (p.notes ? '\n---\n' : '') + `[Aus ${dup.id}]: ` + dup.notes;
                    saveCase(p);
                }
            }
            addStatusHistory(primary.id, primary.status, primary.status, `Duplikat zusammengeführt (${dup._duplicateReason ?? 'manuell'})`);
            deleteCase(dup.id);
            deleted++;
        });
        merged++;
    });

    return { groupsFound: groups.length, mergedInto: merged, deleted };
};
