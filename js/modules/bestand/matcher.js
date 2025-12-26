/**
 * Bestand Matcher Module (ES2024)
 * Automatische Zuordnung von E-Mails zu Vorgängen
 */

import * as storage from './storage.js';
import * as extractor from './extractor.js';

// ========================================
// CONSTANTS
// ========================================

export const MATCH_CONFIDENCE = {
    CONVERSATION_ID: 1.0,
    VS_NR_EXACT: 0.95,
    VS_NR_PARTIAL: 0.85,
    MAKLER_EMAIL: 0.85,
    KUNDE_VERSICHERER: 0.80,
    KUNDE_ONLY: 0.60,
    SUBJECT_SIMILAR: 0.50
};

export const AUTO_ASSIGN_THRESHOLD = 0.75;

// ========================================
// HELPER FUNCTIONS
// ========================================

export const normalizeVsNr = (vsNr) => vsNr.replace(/[-\s.]/g, '').toUpperCase();

export const normalizeKunde = (name) => {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/[,\s]+/g, ' ')
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .trim();
};

const extractEmailAddress = (str) => {
    if (!str) return null;
    const match = str.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
    return match ? match[0].toLowerCase() : null;
};

const partialVsNrMatch = (vsNr1, vsNr2) => {
    const digits1 = vsNr1.replace(/\D/g, '');
    const digits2 = vsNr2.replace(/\D/g, '');
    if (digits1.length < 6 || digits2.length < 6) return false;
    for (let i = 0; i <= digits1.length - 6; i++) {
        if (digits2.includes(digits1.substr(i, 6))) return true;
    }
    return false;
};

const kundeNamesMatch = (name1, name2) => {
    if (!name1 || !name2) return false;
    if (name1 === name2) return true;
    const words1 = name1.split(' ').filter(w => w.length > 2);
    const words2 = name2.split(' ').filter(w => w.length > 2);
    const shorter = words1.length <= words2.length ? words1 : words2;
    const longer = words1.length > words2.length ? words1 : words2;
    let matchCount = 0;
    shorter.forEach(word => {
        if (longer.some(w => w.includes(word) || word.includes(w))) matchCount++;
    });
    return matchCount >= Math.min(2, shorter.length);
};

export const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    const words1 = new Set(str1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(str2.split(' ').filter(w => w.length > 2));
    if (words1.size === 0 || words2.size === 0) return 0;
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
};

const normalizeSubject = (subject) => {
    return subject.toLowerCase()
        .replace(/^(re:|aw:|fwd:|wg:)\s*/gi, '')
        .replace(/[^\wäöüß\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const deduplicateMatches = (matches) => {
    const seen = new Map();
    matches.forEach(match => {
        const existing = seen.get(match.caseId);
        if (!existing || match.confidence > existing.confidence) {
            seen.set(match.caseId, match);
        }
    });
    return Array.from(seen.values());
};

// ========================================
// MATCHING FUNCTIONS
// ========================================

const matchByConversationId = (email, cases) => {
    if (!email.conversationID) return null;
    const match = cases.find(c => c.conversationIds?.includes(email.conversationID));
    return match ? {
        caseId: match.id,
        confidence: MATCH_CONFIDENCE.CONVERSATION_ID,
        reason: 'ConversationID',
        details: `Gleiche Konversation: ${email.conversationID}`
    } : null;
};

const matchByMaklerEmail = (email, cases) => {
    const matches = [];
    const senderEmail = extractEmailAddress(email.from ?? email.senderAddress ?? '');
    const recipientEmail = extractEmailAddress(email.to ?? email.recipientAddress ?? '');
    if (!senderEmail && !recipientEmail) return matches;

    cases.forEach(c => {
        if (!c.makler?.email) return;
        const maklerEmail = c.makler.email.toLowerCase();

        if (senderEmail === maklerEmail) {
            matches.push({ caseId: c.id, confidence: MATCH_CONFIDENCE.MAKLER_EMAIL, reason: 'Makler E-Mail (Sender)', details: `E-Mail von ${c.makler.name ?? maklerEmail}` });
        } else if (recipientEmail === maklerEmail) {
            matches.push({ caseId: c.id, confidence: MATCH_CONFIDENCE.MAKLER_EMAIL * 0.9, reason: 'Makler E-Mail (Empfänger)', details: `E-Mail an ${c.makler.name ?? maklerEmail}` });
        }
    });
    return matches;
};

const matchByVersicherungsnummer = (email, cases) => {
    const matches = [];
    const text = (email.subject ?? '') + '\n' + (email.bodyPlain ?? '');
    const extracted = extractor.extractVersicherungsnummer(text);
    if (!extracted?.value) return matches;

    const emailVsNr = normalizeVsNr(extracted.value);

    cases.forEach(c => {
        if (!c.versicherungsnummer?.value) return;
        const caseVsNr = normalizeVsNr(c.versicherungsnummer.value);

        if (emailVsNr === caseVsNr) {
            matches.push({ caseId: c.id, confidence: MATCH_CONFIDENCE.VS_NR_EXACT, reason: 'Versicherungsnummer (exakt)', details: `VS-Nr: ${extracted.value}` });
        } else if (partialVsNrMatch(emailVsNr, caseVsNr)) {
            matches.push({ caseId: c.id, confidence: MATCH_CONFIDENCE.VS_NR_PARTIAL, reason: 'Versicherungsnummer (ähnlich)', details: `VS-Nr Mail: ${extracted.value}, VS-Nr Vorgang: ${c.versicherungsnummer.value}` });
        }
    });
    return matches;
};

const matchByKundeVersicherer = (email, cases) => {
    const matches = [];
    const extracted = extractor.extractFromEmail(email);
    if (!extracted.kunde?.name) return matches;

    const emailKunde = normalizeKunde(extracted.kunde.name);
    const emailVersicherer = extracted.versicherer?.name ?? null;

    cases.forEach(c => {
        if (!c.kunde?.name) return;
        const caseKunde = normalizeKunde(c.kunde.name);
        if (!kundeNamesMatch(emailKunde, caseKunde)) return;

        if (emailVersicherer && c.versicherer?.name === emailVersicherer) {
            matches.push({ caseId: c.id, confidence: MATCH_CONFIDENCE.KUNDE_VERSICHERER, reason: 'Kunde + Versicherer', details: `${extracted.kunde.name} bei ${emailVersicherer}` });
        } else {
            matches.push({ caseId: c.id, confidence: MATCH_CONFIDENCE.KUNDE_ONLY, reason: 'Kunde (nur)', details: `Kundenname: ${extracted.kunde.name}` });
        }
    });
    return matches;
};

const matchBySubject = (email, cases) => {
    const matches = [];
    if (!email.subject) return matches;
    const emailSubject = normalizeSubject(email.subject);

    cases.forEach(c => {
        if (!c.messages?.length) return;
        c.messages.forEach(m => {
            const caseSubject = normalizeSubject(m.subject ?? '');
            const similarity = calculateSimilarity(emailSubject, caseSubject);
            if (similarity > 0.6) {
                matches.push({ caseId: c.id, confidence: MATCH_CONFIDENCE.SUBJECT_SIMILAR * similarity, reason: 'Betreff-Ähnlichkeit', details: `Ähnlichkeit: ${Math.round(similarity * 100)}%` });
            }
        });
    });
    return matches;
};

// ========================================
// MAIN FUNCTIONS
// ========================================

export const findMatches = (email, cases) => {
    const matches = [];
    if (!email || !cases?.length) return { matches: [], bestMatch: null, autoAssign: false };

    const convMatch = matchByConversationId(email, cases);
    if (convMatch) matches.push(convMatch);

    matches.push(...matchByVersicherungsnummer(email, cases));
    matches.push(...matchByMaklerEmail(email, cases));
    matches.push(...matchByKundeVersicherer(email, cases));
    matches.push(...matchBySubject(email, cases));

    const uniqueMatches = deduplicateMatches(matches);
    uniqueMatches.sort((a, b) => b.confidence - a.confidence);

    const bestMatch = uniqueMatches[0] ?? null;
    return {
        matches: uniqueMatches,
        bestMatch,
        autoAssign: bestMatch && bestMatch.confidence >= AUTO_ASSIGN_THRESHOLD
    };
};

export const batchMatch = (emails, cases) => {
    const results = { matched: [], suggested: [], unmatched: [] };

    emails.forEach(email => {
        if (storage.isMessageProcessed(email.entryID)) return;

        const matchResult = findMatches(email, cases);
        if (matchResult.autoAssign && matchResult.bestMatch) {
            results.matched.push({ email, match: matchResult.bestMatch });
        } else if (matchResult.matches.length > 0) {
            results.suggested.push({ email, matches: matchResult.matches });
        } else {
            results.unmatched.push(email);
        }
    });
    return results;
};

export const updateStatusFromEmail = (caseId, email) => {
    const caseData = storage.getCase(caseId);
    if (!caseData) return;

    const text = (email.subject ?? '') + '\n' + (email.bodyPlain ?? '');
    const extractedStatus = extractor.extractStatus(text);
    if (!extractedStatus) return;

    const statusMapping = {
        'neu': 'unvollstaendig', 'angefragt': 'zu-validieren', 'in-bearbeitung': 'wiedervorlage',
        'bestaetigt': 'export-bereit', 'abgelehnt': 'abgelehnt', 'erledigt': 'abgeschlossen'
    };
    const statusOrder = ['unvollstaendig', 'zu-validieren', 'wiedervorlage', 'export-bereit', 'abgeschlossen', 'abgelehnt'];
    const currentIndex = statusOrder.indexOf(caseData.status);
    const mappedStatus = statusMapping[extractedStatus.status] ?? extractedStatus.status;
    const newIndex = statusOrder.indexOf(mappedStatus);

    if (mappedStatus === 'export-bereit' || mappedStatus === 'abgelehnt' || (newIndex > currentIndex && currentIndex !== -1)) {
        const oldStatus = caseData.status;
        caseData.status = mappedStatus;
        storage.saveCase(caseData);
        storage.addStatusHistory(caseId, oldStatus, mappedStatus, 'Automatisch aus E-Mail erkannt');
    }

    const extractedDatum = extractor.extractDatum(text);
    if (extractedDatum && !caseData.gueltigkeitsdatum?.value) {
        caseData.gueltigkeitsdatum = extractedDatum;
        storage.saveCase(caseData);
    }
};

export const autoAssign = (matchedItems) => {
    const assigned = [], failed = [];

    matchedItems.forEach(item => {
        const { email, match } = item;
        try {
            const result = storage.addMessagesToCase(match.caseId, [email]);
            if (result) {
                storage.markMessageProcessed(email.entryID);
                assigned.push({ email, caseId: match.caseId, reason: match.reason });
                updateStatusFromEmail(match.caseId, email);
            } else {
                failed.push({ email, error: 'Speichern fehlgeschlagen' });
            }
        } catch (e) {
            failed.push({ email, error: e.message });
        }
    });
    return { assigned, failed };
};

export const createCaseFromEmail = (email, conversationMessages) => {
    const messages = conversationMessages ?? [email];
    const extracted = extractor.extractFromConversation(messages);
    const existingCases = storage.getCasesArray();

    // Duplikat-Prüfung: VS-Nr
    const vsNr = extracted?.versicherungsnummer?.value;
    if (vsNr) {
        const existingCase = existingCases.find(c => c.versicherungsnummer?.value && normalizeVsNr(c.versicherungsnummer.value) === normalizeVsNr(vsNr));
        if (existingCase) {
            storage.addMessagesToCase(existingCase.id, messages);
            storage.markMessagesProcessed(messages.map(m => m.entryID));
            return null;
        }
    }

    // Duplikat-Prüfung: Kunde + Makler
    const kundeName = extracted?.kunde?.name;
    const maklerEmail = extracted?.makler?.email ?? extractEmailAddress(email.senderEmail ?? email.from ?? '');
    if (kundeName && maklerEmail) {
        const existingCase = existingCases.find(c => c.kunde?.name && c.makler?.email && normalizeKunde(c.kunde.name) === normalizeKunde(kundeName) && c.makler.email.toLowerCase() === maklerEmail.toLowerCase());
        if (existingCase) {
            storage.addMessagesToCase(existingCase.id, messages);
            storage.markMessagesProcessed(messages.map(m => m.entryID));
            return null;
        }
    }

    // Makler-Info
    const maklerInfo = extracted?.makler ?? { name: '', email: extractEmailAddress(email.senderEmail ?? email.from ?? '') ?? '', confidence: 0.5, source: 'sender' };
    if (!maklerInfo.email && email.senderEmail) maklerInfo.email = extractEmailAddress(email.senderEmail) ?? email.senderEmail;

    // Status basierend auf Vollständigkeit
    const hasKunde = extracted?.kunde?.name?.trim().length > 0;
    const hasVsNr = extracted?.versicherungsnummer?.value?.trim().length > 0;
    const initialStatus = hasKunde && hasVsNr ? 'zu-validieren' : 'unvollstaendig';

    // Mail-Empfangsdatum
    let mailReceivedDate = null;
    if (email.receivedTime) {
        const parts = email.receivedTime.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
        if (parts) mailReceivedDate = new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5], parts[6]).toISOString();
    }
    const now = new Date().toISOString();

    const newCase = {
        kunde: extracted?.kunde ?? { name: '', confidence: 0, source: 'manual' },
        versicherungsnummer: extracted?.versicherungsnummer ?? { value: '', confidence: 0, source: 'manual' },
        versicherer: extracted?.versicherer ?? { name: '', confidence: 0, source: 'manual' },
        gueltigkeitsdatum: extracted?.gueltigkeitsdatum ?? null,
        makler: maklerInfo,
        status: initialStatus,
        sparte: extracted?.sparte ?? '',
        notes: '',
        flagged: false,
        conversationIds: email.conversationID ? [email.conversationID] : [],
        messageIds: messages.map(m => m.entryID),
        messages,
        workflow: {
            mailReceived: mailReceivedDate ?? now,
            mailUploaded: now,
            kiRecognized: hasKunde && hasVsNr ? now : null,
            pvValidated: null,
            exported: null
        },
        statusHistory: [{ date: now, from: null, to: initialStatus, note: 'Aus E-Mail erstellt', isNew: true }]
    };

    const savedCase = storage.saveCase(newCase);
    if (savedCase) storage.markMessagesProcessed(messages.map(m => m.entryID));
    return savedCase;
};
