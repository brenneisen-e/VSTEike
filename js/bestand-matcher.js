/**
 * Matcher Modul - Automatische Zuordnung von E-Mails zu Vorgängen
 * Verwendet verschiedene Matching-Strategien mit Confidence-Scores
 */

const Matcher = (function() {
    'use strict';

    // Matching-Prioritäten und Confidence-Werte
    const MATCH_CONFIDENCE = {
        CONVERSATION_ID: 1.0,    // ConversationID = 100% Treffer
        VS_NR_EXACT: 0.95,       // Exakte VS-Nr = 95%
        VS_NR_PARTIAL: 0.85,     // Teilweise VS-Nr = 85%
        MAKLER_EMAIL: 0.85,      // Makler E-Mail = 85%
        KUNDE_VERSICHERER: 0.80, // Kunde + Versicherer = 80%
        KUNDE_ONLY: 0.60,        // Nur Kunde = 60%
        SUBJECT_SIMILAR: 0.50    // Ähnlicher Betreff = 50%
    };

    // Schwellenwert für automatische Zuordnung
    const AUTO_ASSIGN_THRESHOLD = 0.75;

    /**
     * Hauptfunktion: E-Mail einem Vorgang zuordnen
     * Gibt alle möglichen Matches mit Confidence zurück
     */
    function findMatches(email, cases) {
        const matches = [];

        if (!email || !cases || cases.length === 0) {
            return { matches: [], bestMatch: null, autoAssign: false };
        }

        // 1. ConversationID prüfen (höchste Priorität)
        const convMatch = matchByConversationId(email, cases);
        if (convMatch) {
            matches.push(convMatch);
        }

        // 2. Versicherungsnummer prüfen
        const vsNrMatches = matchByVersicherungsnummer(email, cases);
        matches.push(...vsNrMatches);

        // 3. Makler E-Mail-Adresse prüfen
        const maklerEmailMatches = matchByMaklerEmail(email, cases);
        matches.push(...maklerEmailMatches);

        // 4. Kunde + Versicherer prüfen
        const kundeMatches = matchByKundeVersicherer(email, cases);
        matches.push(...kundeMatches);

        // 5. Betreff-Ähnlichkeit prüfen
        const subjectMatches = matchBySubject(email, cases);
        matches.push(...subjectMatches);

        // Duplikate entfernen und sortieren
        const uniqueMatches = deduplicateMatches(matches);
        uniqueMatches.sort((a, b) => b.confidence - a.confidence);

        // Besten Match ermitteln
        const bestMatch = uniqueMatches.length > 0 ? uniqueMatches[0] : null;
        const autoAssign = bestMatch && bestMatch.confidence >= AUTO_ASSIGN_THRESHOLD;

        return {
            matches: uniqueMatches,
            bestMatch: bestMatch,
            autoAssign: autoAssign
        };
    }

    /**
     * Match per ConversationID
     */
    function matchByConversationId(email, cases) {
        if (!email.conversationID) return null;

        const match = cases.find(c =>
            c.conversationIds && c.conversationIds.includes(email.conversationID)
        );

        if (match) {
            return {
                caseId: match.id,
                confidence: MATCH_CONFIDENCE.CONVERSATION_ID,
                reason: 'ConversationID',
                details: `Gleiche Konversation: ${email.conversationID}`
            };
        }

        return null;
    }

    /**
     * Match per Makler E-Mail-Adresse
     * Wenn der Sender der E-Mail der Makler eines bestehenden Vorgangs ist
     */
    function matchByMaklerEmail(email, cases) {
        const matches = [];

        // E-Mail-Adresse des Senders extrahieren
        const senderEmail = extractEmailAddress(email.from || email.senderAddress || '');
        const recipientEmail = extractEmailAddress(email.to || email.recipientAddress || '');

        if (!senderEmail && !recipientEmail) return matches;

        cases.forEach(c => {
            if (!c.makler || !c.makler.email) return;

            const maklerEmail = c.makler.email.toLowerCase();

            // Sender ist der Makler (Antwort vom Makler)
            if (senderEmail && senderEmail === maklerEmail) {
                matches.push({
                    caseId: c.id,
                    confidence: MATCH_CONFIDENCE.MAKLER_EMAIL,
                    reason: 'Makler E-Mail (Sender)',
                    details: `E-Mail von ${c.makler.name || maklerEmail}`
                });
            }
            // Empfänger ist der Makler (Anfrage an den Makler)
            else if (recipientEmail && recipientEmail === maklerEmail) {
                matches.push({
                    caseId: c.id,
                    confidence: MATCH_CONFIDENCE.MAKLER_EMAIL * 0.9, // Etwas niedrigere Confidence
                    reason: 'Makler E-Mail (Empfänger)',
                    details: `E-Mail an ${c.makler.name || maklerEmail}`
                });
            }
        });

        return matches;
    }

    /**
     * E-Mail-Adresse aus String extrahieren
     */
    function extractEmailAddress(str) {
        if (!str) return null;

        // E-Mail aus Format "Name <email@domain.de>" oder direkt extrahieren
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
        const match = str.match(emailRegex);

        return match ? match[0].toLowerCase() : null;
    }

    /**
     * Match per Versicherungsnummer
     */
    function matchByVersicherungsnummer(email, cases) {
        const matches = [];

        // VS-Nr aus E-Mail extrahieren
        const text = (email.subject || '') + '\n' + (email.bodyPlain || '');
        const extracted = Extractor.extractVersicherungsnummer(text);

        if (!extracted || !extracted.value) return matches;

        const emailVsNr = normalizeVsNr(extracted.value);

        cases.forEach(c => {
            if (!c.versicherungsnummer || !c.versicherungsnummer.value) return;

            const caseVsNr = normalizeVsNr(c.versicherungsnummer.value);

            // Exakte Übereinstimmung
            if (emailVsNr === caseVsNr) {
                matches.push({
                    caseId: c.id,
                    confidence: MATCH_CONFIDENCE.VS_NR_EXACT,
                    reason: 'Versicherungsnummer (exakt)',
                    details: `VS-Nr: ${extracted.value}`
                });
            }
            // Teilweise Übereinstimmung (mindestens 6 Ziffern gleich)
            else if (partialVsNrMatch(emailVsNr, caseVsNr)) {
                matches.push({
                    caseId: c.id,
                    confidence: MATCH_CONFIDENCE.VS_NR_PARTIAL,
                    reason: 'Versicherungsnummer (ähnlich)',
                    details: `VS-Nr Mail: ${extracted.value}, VS-Nr Vorgang: ${c.versicherungsnummer.value}`
                });
            }
        });

        return matches;
    }

    /**
     * VS-Nr normalisieren (nur alphanumerische Zeichen, uppercase)
     */
    function normalizeVsNr(vsNr) {
        return vsNr.replace(/[-\s.]/g, '').toUpperCase();
    }

    /**
     * Prüfen ob VS-Nr teilweise übereinstimmt
     */
    function partialVsNrMatch(vsNr1, vsNr2) {
        // Nur Ziffern extrahieren
        const digits1 = vsNr1.replace(/\D/g, '');
        const digits2 = vsNr2.replace(/\D/g, '');

        if (digits1.length < 6 || digits2.length < 6) return false;

        // Prüfen ob 6 aufeinanderfolgende Ziffern übereinstimmen
        for (let i = 0; i <= digits1.length - 6; i++) {
            const substr = digits1.substr(i, 6);
            if (digits2.includes(substr)) return true;
        }

        return false;
    }

    /**
     * Match per Kunde + Versicherer
     */
    function matchByKundeVersicherer(email, cases) {
        const matches = [];

        // Daten aus E-Mail extrahieren
        const text = (email.subject || '') + '\n' + (email.bodyPlain || '');
        const extracted = Extractor.extractFromEmail(email);

        if (!extracted.kunde || !extracted.kunde.name) return matches;

        const emailKunde = normalizeKunde(extracted.kunde.name);
        const emailVersicherer = extracted.versicherer ? extracted.versicherer.name : null;

        cases.forEach(c => {
            if (!c.kunde || !c.kunde.name) return;

            const caseKunde = normalizeKunde(c.kunde.name);
            const kundeMatch = kundeNamesMatch(emailKunde, caseKunde);

            if (!kundeMatch) return;

            // Kunde + Versicherer
            if (emailVersicherer && c.versicherer && c.versicherer.name === emailVersicherer) {
                matches.push({
                    caseId: c.id,
                    confidence: MATCH_CONFIDENCE.KUNDE_VERSICHERER,
                    reason: 'Kunde + Versicherer',
                    details: `${extracted.kunde.name} bei ${emailVersicherer}`
                });
            }
            // Nur Kunde (niedrigere Confidence, kein Auto-Assign)
            else {
                matches.push({
                    caseId: c.id,
                    confidence: MATCH_CONFIDENCE.KUNDE_ONLY,
                    reason: 'Kunde (nur)',
                    details: `Kundenname: ${extracted.kunde.name}`
                });
            }
        });

        return matches;
    }

    /**
     * Kundenname normalisieren
     */
    function normalizeKunde(name) {
        if (!name) return '';
        return name.toLowerCase()
            .replace(/[,\s]+/g, ' ')
            .replace(/ä/g, 'ae')
            .replace(/ö/g, 'oe')
            .replace(/ü/g, 'ue')
            .replace(/ß/g, 'ss')
            .trim();
    }

    /**
     * Prüfen ob zwei Kundennamen übereinstimmen
     */
    function kundeNamesMatch(name1, name2) {
        if (!name1 || !name2) return false;

        // Exakte Übereinstimmung
        if (name1 === name2) return true;

        // Alle Wörter des kürzeren Namens im längeren enthalten?
        const words1 = name1.split(' ').filter(w => w.length > 2);
        const words2 = name2.split(' ').filter(w => w.length > 2);

        const shorter = words1.length <= words2.length ? words1 : words2;
        const longer = words1.length > words2.length ? words1 : words2;

        let matchCount = 0;
        shorter.forEach(word => {
            if (longer.some(w => w.includes(word) || word.includes(w))) {
                matchCount++;
            }
        });

        // Mindestens 2 Wörter müssen übereinstimmen
        return matchCount >= Math.min(2, shorter.length);
    }

    /**
     * Match per Betreff-Ähnlichkeit
     */
    function matchBySubject(email, cases) {
        const matches = [];

        if (!email.subject) return matches;

        const emailSubject = normalizeSubject(email.subject);

        cases.forEach(c => {
            if (!c.messages || c.messages.length === 0) return;

            // Betreff der neuesten Nachricht
            const caseSubjects = c.messages.map(m => normalizeSubject(m.subject || ''));

            caseSubjects.forEach(caseSubject => {
                const similarity = calculateSimilarity(emailSubject, caseSubject);

                if (similarity > 0.6) {
                    matches.push({
                        caseId: c.id,
                        confidence: MATCH_CONFIDENCE.SUBJECT_SIMILAR * similarity,
                        reason: 'Betreff-Ähnlichkeit',
                        details: `Ähnlichkeit: ${Math.round(similarity * 100)}%`
                    });
                }
            });
        });

        return matches;
    }

    /**
     * Betreff normalisieren
     */
    function normalizeSubject(subject) {
        return subject.toLowerCase()
            .replace(/^(re:|aw:|fwd:|wg:)\s*/gi, '')
            .replace(/[^\wäöüß\s]/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Ähnlichkeit zweier Strings berechnen (Jaccard)
     */
    function calculateSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;

        const words1 = new Set(str1.split(' ').filter(w => w.length > 2));
        const words2 = new Set(str2.split(' ').filter(w => w.length > 2));

        if (words1.size === 0 || words2.size === 0) return 0;

        const intersection = new Set([...words1].filter(w => words2.has(w)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }

    /**
     * Doppelte Matches entfernen
     */
    function deduplicateMatches(matches) {
        const seen = new Map();

        matches.forEach(match => {
            const existing = seen.get(match.caseId);
            if (!existing || match.confidence > existing.confidence) {
                seen.set(match.caseId, match);
            }
        });

        return Array.from(seen.values());
    }

    /**
     * Batch-Matching: Mehrere E-Mails auf einmal zuordnen
     */
    function batchMatch(emails, cases) {
        const results = {
            matched: [],      // Automatisch zugeordnet
            suggested: [],    // Vorschläge (niedrigere Confidence)
            unmatched: []     // Keine Zuordnung gefunden
        };

        emails.forEach(email => {
            // Bereits verarbeitete E-Mails überspringen
            if (Storage.isMessageProcessed(email.entryID)) {
                return;
            }

            const matchResult = findMatches(email, cases);

            if (matchResult.autoAssign && matchResult.bestMatch) {
                results.matched.push({
                    email: email,
                    match: matchResult.bestMatch
                });
            } else if (matchResult.matches.length > 0) {
                results.suggested.push({
                    email: email,
                    matches: matchResult.matches
                });
            } else {
                results.unmatched.push(email);
            }
        });

        return results;
    }

    /**
     * Automatische Zuordnung durchführen
     */
    function autoAssign(matchedItems) {
        const assigned = [];
        const failed = [];

        matchedItems.forEach(item => {
            const { email, match } = item;

            try {
                // Nachricht zum Vorgang hinzufügen
                const result = Storage.addMessagesToCase(match.caseId, [email]);

                if (result) {
                    // Message als verarbeitet markieren
                    Storage.markMessageProcessed(email.entryID);

                    assigned.push({
                        email: email,
                        caseId: match.caseId,
                        reason: match.reason
                    });

                    // Status ggf. aktualisieren basierend auf E-Mail-Inhalt
                    updateStatusFromEmail(match.caseId, email);
                } else {
                    failed.push({ email: email, error: 'Speichern fehlgeschlagen' });
                }
            } catch (e) {
                failed.push({ email: email, error: e.message });
            }
        });

        return { assigned, failed };
    }

    /**
     * Status eines Vorgangs basierend auf E-Mail-Inhalt aktualisieren
     */
    function updateStatusFromEmail(caseId, email) {
        const caseData = Storage.getCase(caseId);
        if (!caseData) return;

        const text = (email.subject || '') + '\n' + (email.bodyPlain || '');
        const extractedStatus = Extractor.extractStatus(text);

        if (!extractedStatus) return;

        // Status-Mapping auf neuen Workflow
        const statusMapping = {
            'neu': 'unvollstaendig',
            'angefragt': 'zu-validieren',
            'in-bearbeitung': 'wiedervorlage',
            'bestaetigt': 'export-bereit',
            'abgelehnt': 'abgelehnt',
            'erledigt': 'abgeschlossen'
        };

        // Status nur updaten wenn er "aufsteigt" (nicht zurückstufen)
        const statusOrder = ['unvollstaendig', 'zu-validieren', 'wiedervorlage', 'export-bereit', 'abgeschlossen', 'abgelehnt'];
        const currentIndex = statusOrder.indexOf(caseData.status);
        const mappedStatus = statusMapping[extractedStatus.status] || extractedStatus.status;
        const newIndex = statusOrder.indexOf(mappedStatus);

        // Bei export-bereit/abgelehnt immer updaten (Endstatus)
        if (mappedStatus === 'export-bereit' || mappedStatus === 'abgelehnt') {
            const oldStatus = caseData.status;
            caseData.status = mappedStatus;
            Storage.saveCase(caseData);
            Storage.addStatusHistory(caseId, oldStatus, mappedStatus, 'Automatisch aus E-Mail erkannt');
        }
        // Ansonsten nur wenn höherer Status
        else if (newIndex > currentIndex && currentIndex !== -1) {
            const oldStatus = caseData.status;
            caseData.status = mappedStatus;
            Storage.saveCase(caseData);
            Storage.addStatusHistory(caseId, oldStatus, mappedStatus, 'Automatisch aus E-Mail erkannt');
        }

        // Gültigkeitsdatum aktualisieren falls erkannt
        const extractedDatum = Extractor.extractDatum(text);
        if (extractedDatum && (!caseData.gueltigkeitsdatum || !caseData.gueltigkeitsdatum.value)) {
            caseData.gueltigkeitsdatum = extractedDatum;
            Storage.saveCase(caseData);
        }
    }

    /**
     * Neuen Vorgang aus E-Mail erstellen
     * Prüft mehrere Kriterien um Duplikate zu verhindern
     */
    function createCaseFromEmail(email, conversationMessages) {
        const messages = conversationMessages || [email];
        const extracted = Extractor.extractFromConversation(messages);
        const existingCases = Storage.getCasesArray();

        // Duplikat-Prüfung 1: Existiert bereits ein Vorgang mit dieser VS-Nr?
        const vsNr = extracted.versicherungsnummer?.value;
        if (vsNr) {
            const existingCase = existingCases.find(c => {
                const caseVsNr = c.versicherungsnummer?.value;
                if (!caseVsNr) return false;
                return normalizeVsNr(caseVsNr) === normalizeVsNr(vsNr);
            });

            if (existingCase) {
                console.log(`Duplikat verhindert (VS-Nr): ${vsNr} existiert bereits in Vorgang ${existingCase.id}`);
                Storage.addMessagesToCase(existingCase.id, messages);
                Storage.markMessagesProcessed(messages.map(m => m.entryID));
                return null;
            }
        }

        // Duplikat-Prüfung 2: Existiert bereits ein Vorgang mit gleichem Kunden + Makler?
        const kundeName = extracted.kunde?.name;
        const maklerEmail = extracted.makler?.email || extractEmailAddress(email.senderEmail || email.from || '');

        if (kundeName && maklerEmail) {
            const normalizedKunde = normalizeKunde(kundeName);
            const normalizedMakler = maklerEmail.toLowerCase();

            const existingCase = existingCases.find(c => {
                if (!c.kunde?.name || !c.makler?.email) return false;
                const caseKunde = normalizeKunde(c.kunde.name);
                const caseMakler = c.makler.email.toLowerCase();
                return caseKunde === normalizedKunde && caseMakler === normalizedMakler;
            });

            if (existingCase) {
                console.log(`Duplikat verhindert (Kunde+Makler): ${kundeName} / ${maklerEmail} existiert bereits in Vorgang ${existingCase.id}`);
                Storage.addMessagesToCase(existingCase.id, messages);
                Storage.markMessagesProcessed(messages.map(m => m.entryID));
                return null;
            }
        }

        // Duplikat-Prüfung 3: Existiert bereits ein Vorgang mit gleichem Kunden + Versicherer?
        const versicherer = extracted.versicherer?.name;
        if (kundeName && versicherer) {
            const normalizedKunde = normalizeKunde(kundeName);

            const existingCase = existingCases.find(c => {
                if (!c.kunde?.name || !c.versicherer?.name) return false;
                const caseKunde = normalizeKunde(c.kunde.name);
                return caseKunde === normalizedKunde && c.versicherer.name === versicherer;
            });

            if (existingCase) {
                console.log(`Duplikat verhindert (Kunde+Versicherer): ${kundeName} / ${versicherer} existiert bereits in Vorgang ${existingCase.id}`);
                Storage.addMessagesToCase(existingCase.id, messages);
                Storage.markMessagesProcessed(messages.map(m => m.entryID));
                return null;
            }
        }

        // Makler-Info zusammenstellen
        const maklerInfo = extracted.makler || {
            name: '',
            email: extractEmailAddress(email.senderEmail || email.from || '') || '',
            confidence: 0.5,
            source: 'sender'
        };
        // Falls kein Name aber E-Mail vorhanden, E-Mail als Fallback verwenden
        if (!maklerInfo.email && email.senderEmail) {
            maklerInfo.email = extractEmailAddress(email.senderEmail) || email.senderEmail;
        }

        // Status basierend auf Vollständigkeit der Daten bestimmen
        const hasKunde = extracted.kunde && extracted.kunde.name && extracted.kunde.name.trim().length > 0;
        const hasVsNr = extracted.versicherungsnummer && extracted.versicherungsnummer.value && extracted.versicherungsnummer.value.trim().length > 0;
        const isComplete = hasKunde && hasVsNr;
        const initialStatus = isComplete ? 'zu-validieren' : 'unvollstaendig';

        // Mail-Empfangsdatum parsen (Format: DD.MM.YYYY HH:MM:SS)
        let mailReceivedDate = null;
        if (email.receivedTime) {
            const parts = email.receivedTime.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
            if (parts) {
                mailReceivedDate = new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5], parts[6]).toISOString();
            }
        }
        const now = new Date().toISOString();

        const newCase = {
            kunde: extracted.kunde || { name: '', confidence: 0, source: 'manual' },
            versicherungsnummer: extracted.versicherungsnummer || { value: '', confidence: 0, source: 'manual' },
            versicherer: extracted.versicherer || { name: '', confidence: 0, source: 'manual' },
            gueltigkeitsdatum: extracted.gueltigkeitsdatum || null,
            makler: maklerInfo,
            status: initialStatus,
            sparte: extracted.sparte || '',
            notes: '',
            flagged: false,
            conversationIds: email.conversationID ? [email.conversationID] : [],
            messageIds: messages.map(m => m.entryID),
            messages: messages,
            workflow: {
                mailReceived: mailReceivedDate || now,
                mailUploaded: now,
                kiRecognized: isComplete ? now : null,
                pvValidated: null,
                exported: null
            },
            statusHistory: [
                { date: new Date().toISOString(), from: null, to: initialStatus, note: 'Aus E-Mail erstellt', isNew: true }
            ]
        };

        // Vorgang speichern
        const savedCase = Storage.saveCase(newCase);

        if (savedCase) {
            // Nachrichten als verarbeitet markieren
            Storage.markMessagesProcessed(messages.map(m => m.entryID));
        }

        return savedCase;
    }

    // Öffentliche API
    return {
        findMatches,
        batchMatch,
        autoAssign,
        createCaseFromEmail,
        updateStatusFromEmail,

        // Hilfsfunktionen
        normalizeVsNr,
        normalizeKunde,
        calculateSimilarity,

        // Konfiguration
        MATCH_CONFIDENCE,
        AUTO_ASSIGN_THRESHOLD
    };
})();
