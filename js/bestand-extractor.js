/**
 * Extractor Modul - Schlagwort-Extraktion aus E-Mail-Texten
 * Erkennt Versicherungsnummern, Kundennamen, Datums- und Statusangaben
 */

const Extractor = (function() {
    'use strict';

    // Regex-Patterns für Extraktion
    const PATTERNS = {
        // Versicherungsnummern - verschiedene Formate
        versicherungsnummer: [
            // Mit Label
            /(?:VS[-.\s]?Nr\.?|Vertragsnummer|Vertrag[-\s]?Nr\.?|Police[-\s]?Nr\.?|Versicherungs[-\s]?Nr\.?)[\s:]*([A-Z0-9][-\s]?[A-Z0-9]{5,14})/gi,
            // ERGO-spezifisch
            /\b(ERG[-\s]?\d{6,12})\b/gi,
            // Allgemeines Format: 2-4 Buchstaben + 6-12 Ziffern
            /\b([A-Z]{2,4}[-\s]?\d{6,12})\b/g,
            // Nur Ziffern mit optionalen Trennzeichen (8-15 Zeichen)
            /(?:Nr\.?|Nummer)[\s:]*(\d{2,4}[-\s]?\d{4,6}[-\s]?\d{0,6})\b/gi
        ],

        // Kundennamen
        kundenname: [
            // Mit Label (Kunde/Kunden/Kundin)
            /(?:VN|Versicherungsnehmer|Kunden?|Kundin|Vertragspartner)[\s:]+([A-ZÄÖÜß][a-zäöüß]+(?:[,\s]+[A-ZÄÖÜß][a-zäöüß]+)+)/gi,
            // "für unseren Kunden Vorname Nachname"
            /für\s+(?:unsere[n]?\s+)?(?:Kunde[n]?|Kundin)\s+([A-ZÄÖÜß][a-zäöüß]+\s+[A-ZÄÖÜß][a-zäöüß]+)/gi,
            // Anrede + Name
            /(?:Herr[n]?|Frau)\s+([A-ZÄÖÜß][a-zäöüß]+(?:\s+[A-ZÄÖÜß][a-zäöüß]+){1,3})/gi,
            // Format: Nachname, Vorname nach für/betr/bzgl
            /(?:für|betr(?:\.?|ifft)|bzgl\.?|betrifft)\s+([A-ZÄÖÜß][a-zäöüß]+,\s*[A-ZÄÖÜß][a-zäöüß]+)/gi
        ],

        // Datums-Patterns
        datum: [
            // Mit Kontext
            /(?:zum|ab|per|wirksam|gültig\s+ab|Wirksamkeit(?:\s+ab)?|Übertragung(?:\s+zum)?)[\s:]+(\d{1,2}\.\d{1,2}\.\d{2,4})/gi,
            // Datum im Format TT.MM.JJJJ
            /(\d{1,2}\.\d{1,2}\.20\d{2})/g
        ],

        // Status-Keywords - Positiv
        statusPositiv: /\b(bestätigt|übertragen|erfolgt|zugestimmt|erteilt|wirksam|genehmigt|akzeptiert|angenommen)\b/gi,

        // Status-Keywords - Negativ
        statusNegativ: /\b(abgelehnt|widersprochen|nicht\s+möglich|zurückgewiesen|verweigert|abgewiesen|nicht\s+erteilt)\b/gi,

        // Status-Keywords - Pending
        statusPending: /\b(in\s+bearbeitung|wird\s+geprüft|rückfrage|unterlagen\s+fehlen|prüfung|warten|ausstehend)\b/gi,

        // Sparten-Keywords
        sparte: {
            'KFZ': /\b(KFZ|Kraftfahrzeug|Auto|PKW|Fahrzeug|Kfz[-\s]?Versicherung)\b/gi,
            'Leben': /\b(Leben|Lebensversicherung|LV|Risikoleben|Kapital[-\s]?Leben)\b/gi,
            'Kranken': /\b(Kranken|KV|Krankenzusatz|PKV|GKV|Krankenversicherung)\b/gi,
            'Haftpflicht': /\b(Haftpflicht|PHV|Privathaftpflicht|Hundehalterhaftpflicht)\b/gi,
            'Hausrat': /\b(Hausrat|HR|Hausratversicherung)\b/gi,
            'Rechtsschutz': /\b(Rechtsschutz|RS|Rechtschutz)\b/gi,
            'Unfall': /\b(Unfall|UV|Unfallversicherung)\b/gi,
            'BU': /\b(BU|Berufsunfähigkeit|Berufsunfähigkeitsversicherung)\b/gi,
            'Wohngebäude': /\b(Wohngebäude|Gebäude|WG|Wohngebäudeversicherung)\b/gi,
            'Rente': /\b(Rente|RV|Rentenversicherung|Altersvorsorge|bAV)\b/gi
        }
    };

    // Versicherer Domain Mapping
    const VERSICHERER_DOMAINS = {
        'ergo.de': 'ERGO',
        'ergo-direkt.de': 'ERGO',
        'allianz.de': 'Allianz',
        'allianz.com': 'Allianz',
        'axa.de': 'AXA',
        'axa.com': 'AXA',
        'hdi.de': 'HDI',
        'hdi.global': 'HDI',
        'zurich.de': 'Zurich',
        'zurich.com': 'Zurich',
        'generali.de': 'Generali',
        'generali.com': 'Generali',
        'debeka.de': 'Debeka',
        'signal-iduna.de': 'Signal Iduna',
        'huk-coburg.de': 'HUK-Coburg',
        'huk24.de': 'HUK-Coburg',
        'nuernberger.de': 'Nürnberger',
        'gothaer.de': 'Gothaer',
        'barmenia.de': 'Barmenia',
        'r-v.de': 'R+V',
        'ruv.de': 'R+V',
        'lvm.de': 'LVM',
        'devk.de': 'DEVK',
        'continentale.de': 'Continentale',
        'wwk.de': 'WWK',
        'basler.de': 'Basler',
        'hansemerkur.de': 'HanseMerkur',
        'inter.de': 'INTER',
        'volkswohl-bund.de': 'Volkswohl Bund',
        'swiss-life.de': 'Swiss Life',
        'swisslife.de': 'Swiss Life',
        'canada-life.de': 'Canada Life',
        'canadalife.de': 'Canada Life',
        'condor-versicherung.de': 'Condor',
        'alte-leipziger.de': 'Alte Leipziger',
        'hallesche.de': 'Hallesche',
        'provinzial.de': 'Provinzial',
        'provinzial.com': 'Provinzial',
        'sparkassen-versicherung.de': 'SV SparkassenVersicherung',
        'sv.de': 'SV SparkassenVersicherung',
        'wgv.de': 'WGV',
        'vgh.de': 'VGH',
        'oesa.de': 'ÖSA',
        'mannheimer.de': 'Mannheimer',
        'concordia.de': 'Concordia',
        'vhv.de': 'VHV',
        'kravag.de': 'KRAVAG',
        'wuerttembergische.de': 'Württembergische',
        'wuerttbg.de': 'Württembergische',
        'bgv.de': 'BGV',
        'sparkassenversicherung.de': 'SV SparkassenVersicherung'
    };

    /**
     * Versicherungsnummer aus Text extrahieren
     */
    function extractVersicherungsnummer(text) {
        if (!text) return null;

        const results = [];

        for (const pattern of PATTERNS.versicherungsnummer) {
            const regex = new RegExp(pattern.source, pattern.flags);
            let match;
            while ((match = regex.exec(text)) !== null) {
                const value = match[1].trim().replace(/\s+/g, '-').toUpperCase();
                // Mindestens 6 Zeichen, nicht nur Bindestriche
                if (value.replace(/-/g, '').length >= 6) {
                    results.push({
                        value: value,
                        confidence: calculateConfidence(match, pattern),
                        source: 'auto'
                    });
                }
            }
        }

        // Beste Übereinstimmung zurückgeben (höchste Confidence)
        if (results.length > 0) {
            results.sort((a, b) => b.confidence - a.confidence);
            return results[0];
        }

        return null;
    }

    /**
     * Kundenname aus Text extrahieren
     */
    function extractKundenname(text) {
        if (!text) return null;

        const results = [];

        for (const pattern of PATTERNS.kundenname) {
            const regex = new RegExp(pattern.source, pattern.flags);
            let match;
            while ((match = regex.exec(text)) !== null) {
                let name = match[1].trim();

                // Name normalisieren (Nachname, Vorname)
                name = normalizeName(name);

                if (name && name.length >= 4) {
                    results.push({
                        name: name,
                        confidence: calculateConfidence(match, pattern),
                        source: 'auto'
                    });
                }
            }
        }

        if (results.length > 0) {
            results.sort((a, b) => b.confidence - a.confidence);
            return results[0];
        }

        return null;
    }

    /**
     * Name in Format "Nachname, Vorname" normalisieren
     */
    function normalizeName(name) {
        if (!name) return null;

        // Bereits im Format "Nachname, Vorname"?
        if (name.includes(',')) {
            const parts = name.split(',').map(p => p.trim());
            if (parts.length === 2) {
                return capitalizeFirstLetter(parts[0]) + ', ' + capitalizeFirstLetter(parts[1]);
            }
        }

        // Format "Vorname Nachname" -> "Nachname, Vorname"
        const parts = name.split(/\s+/);
        if (parts.length >= 2) {
            const nachname = parts[parts.length - 1];
            const vorname = parts.slice(0, -1).join(' ');
            return capitalizeFirstLetter(nachname) + ', ' + capitalizeFirstLetter(vorname);
        }

        return capitalizeFirstLetter(name);
    }

    /**
     * Ersten Buchstaben groß, Rest klein
     */
    function capitalizeFirstLetter(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Gültigkeitsdatum aus Text extrahieren
     */
    function extractDatum(text) {
        if (!text) return null;

        const results = [];

        for (const pattern of PATTERNS.datum) {
            const regex = new RegExp(pattern.source, pattern.flags);
            let match;
            while ((match = regex.exec(text)) !== null) {
                const value = normalizeDatum(match[1]);
                if (value) {
                    results.push({
                        value: value,
                        confidence: calculateConfidence(match, pattern),
                        source: 'auto'
                    });
                }
            }
        }

        if (results.length > 0) {
            results.sort((a, b) => b.confidence - a.confidence);
            return results[0];
        }

        return null;
    }

    /**
     * Datum normalisieren (DD.MM.YYYY)
     */
    function normalizeDatum(dateStr) {
        if (!dateStr) return null;

        const parts = dateStr.split('.');
        if (parts.length !== 3) return null;

        let day = parts[0].padStart(2, '0');
        let month = parts[1].padStart(2, '0');
        let year = parts[2];

        // Zweistelliges Jahr in vierstelliges umwandeln
        if (year.length === 2) {
            year = (parseInt(year) > 50 ? '19' : '20') + year;
        }

        // Validierung
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);

        if (dayNum < 1 || dayNum > 31) return null;
        if (monthNum < 1 || monthNum > 12) return null;
        if (yearNum < 2000 || yearNum > 2100) return null;

        return `${day}.${month}.${year}`;
    }

    /**
     * Status aus Text erkennen
     */
    function extractStatus(text) {
        if (!text) return null;

        // Priorität: Positiv > Negativ > Pending
        if (PATTERNS.statusPositiv.test(text)) {
            return { status: 'bestaetigt', confidence: 0.8 };
        }
        if (PATTERNS.statusNegativ.test(text)) {
            return { status: 'abgelehnt', confidence: 0.8 };
        }
        if (PATTERNS.statusPending.test(text)) {
            return { status: 'in-bearbeitung', confidence: 0.7 };
        }

        return null;
    }

    /**
     * Sparte aus Text erkennen
     */
    function extractSparte(text) {
        if (!text) return null;

        for (const [sparte, pattern] of Object.entries(PATTERNS.sparte)) {
            if (pattern.test(text)) {
                return sparte;
            }
        }

        return null;
    }

    /**
     * Versicherer aus E-Mail-Domain erkennen
     */
    function extractVersichererFromEmail(email) {
        if (!email) return null;

        const domain = email.split('@')[1];
        if (!domain) return null;

        const normalizedDomain = domain.toLowerCase();

        // Direkte Übereinstimmung
        if (VERSICHERER_DOMAINS[normalizedDomain]) {
            return {
                name: VERSICHERER_DOMAINS[normalizedDomain],
                confidence: 1.0,
                source: 'email-domain'
            };
        }

        // Teilübereinstimmung (Subdomain)
        for (const [domainKey, versicherer] of Object.entries(VERSICHERER_DOMAINS)) {
            if (normalizedDomain.endsWith('.' + domainKey) || normalizedDomain.includes(domainKey)) {
                return {
                    name: versicherer,
                    confidence: 0.9,
                    source: 'email-domain'
                };
            }
        }

        return null;
    }

    /**
     * Makler-Name aus E-Mail-Body extrahieren
     * Sucht nach Signaturen wie "Mit freundlichen Grüßen\nThomas Meier\nVersicherungsmakler"
     */
    function extractMaklerFromBody(text) {
        if (!text) return null;

        // Pattern 1: Nach "Mit freundlichen Grüßen" + Name + Makler-Bezeichnung
        const mfgPattern = /Mit freundlichen Grüßen\s*\n+\s*([A-ZÄÖÜß][a-zäöüß]+\s+[A-ZÄÖÜß][a-zäöüß]+)\s*\n+\s*(?:Versicherungsmakler|Versicherungsmaklerin|Makler|Maklerin)/gi;
        let match = mfgPattern.exec(text);
        if (match) {
            return {
                name: match[1].trim(),
                confidence: 0.9,
                source: 'signature'
            };
        }

        // Pattern 2: "Ihr Makler" / "Ihre Maklerin" + Name
        const ihrMaklerPattern = /(?:Ihr(?:e)?\s+(?:Versicherungs)?makler(?:in)?)\s*[:\n]\s*([A-ZÄÖÜß][a-zäöüß]+\s+[A-ZÄÖÜß][a-zäöüß]+)/gi;
        match = ihrMaklerPattern.exec(text);
        if (match) {
            return {
                name: match[1].trim(),
                confidence: 0.85,
                source: 'signature'
            };
        }

        // Pattern 3: Name + "Versicherungsmakler(in)" in der selben oder nächsten Zeile
        const maklerPattern = /([A-ZÄÖÜß][a-zäöüß]+\s+[A-ZÄÖÜß][a-zäöüß]+)\s*\n*\s*Versicherungsmakler(?:in)?/gi;
        match = maklerPattern.exec(text);
        if (match) {
            return {
                name: match[1].trim(),
                confidence: 0.8,
                source: 'signature'
            };
        }

        return null;
    }

    /**
     * Confidence-Score berechnen
     */
    function calculateConfidence(match, pattern) {
        // Basis-Confidence
        let confidence = 0.7;

        // Erhöhen wenn Match am Anfang oder mit Label
        if (match.index < 200) confidence += 0.1;

        // Erhöhen wenn Pattern spezifisch ist (z.B. mit Label)
        if (pattern.source.includes('(?:')) confidence += 0.1;

        // Maximale Confidence: 0.95 (nie 1.0 für auto-extrahierte Werte)
        return Math.min(confidence, 0.95);
    }

    /**
     * Alle verfügbaren Informationen aus einer E-Mail extrahieren
     */
    function extractFromEmail(email) {
        const text = (email.subject || '') + '\n' + (email.bodyPlain || email.body || '');

        // Makler aus Body extrahieren
        const maklerFromBody = extractMaklerFromBody(text);

        // Makler-Info zusammenstellen
        let makler = null;
        if (maklerFromBody) {
            makler = {
                name: maklerFromBody.name,
                email: email.senderEmail || '',
                confidence: maklerFromBody.confidence,
                source: maklerFromBody.source
            };
        } else if (email.senderEmail) {
            // Fallback: Sender-E-Mail als Makler-Email verwenden
            makler = {
                name: '',
                email: email.senderEmail,
                confidence: 0.5,
                source: 'sender'
            };
        }

        return {
            versicherungsnummer: extractVersicherungsnummer(text),
            kunde: extractKundenname(text),
            gueltigkeitsdatum: extractDatum(text),
            status: extractStatus(text),
            sparte: extractSparte(text),
            versicherer: extractVersichererFromEmail(email.senderEmail),
            makler: makler
        };
    }

    /**
     * Alle verfügbaren Informationen aus mehreren E-Mails extrahieren
     * Kombiniert die besten Ergebnisse
     */
    function extractFromConversation(messages) {
        if (!messages || messages.length === 0) return null;

        const combined = {
            versicherungsnummer: null,
            kunde: null,
            gueltigkeitsdatum: null,
            status: null,
            sparte: null,
            versicherer: null,
            makler: null
        };

        // Durch alle Nachrichten iterieren
        messages.forEach(msg => {
            const extracted = extractFromEmail(msg);

            // Für jeden extrahierten Wert prüfen, ob er besser ist als der aktuelle
            for (const [key, value] of Object.entries(extracted)) {
                if (!value) continue;

                // Bei Objekten mit confidence
                if (value.confidence !== undefined) {
                    if (!combined[key] || value.confidence > combined[key].confidence) {
                        combined[key] = value;
                    }
                } else if (!combined[key]) {
                    // Einfache Werte (z.B. sparte)
                    combined[key] = value;
                }
            }
        });

        return combined;
    }

    /**
     * Text nach Betreff-Keywords durchsuchen
     */
    function extractFromSubject(subject) {
        if (!subject) return {};

        const result = {};

        // Versicherungsnummer aus Betreff
        const vsNr = extractVersicherungsnummer(subject);
        if (vsNr) {
            vsNr.confidence = Math.min(vsNr.confidence + 0.1, 0.95);
            result.versicherungsnummer = vsNr;
        }

        // Kundenname aus Betreff
        const kunde = extractKundenname(subject);
        if (kunde) {
            kunde.confidence = Math.min(kunde.confidence + 0.1, 0.95);
            result.kunde = kunde;
        }

        // Sparte aus Betreff
        result.sparte = extractSparte(subject);

        return result;
    }

    // Öffentliche API
    return {
        extractVersicherungsnummer,
        extractKundenname,
        extractDatum,
        extractStatus,
        extractSparte,
        extractVersichererFromEmail,
        extractMaklerFromBody,
        extractFromEmail,
        extractFromConversation,
        extractFromSubject,
        normalizeName,
        normalizeDatum,
        VERSICHERER_DOMAINS
    };
})();
