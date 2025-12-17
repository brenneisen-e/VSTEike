/**
 * Demo-Daten Modul - 20 realistische Beispiel-Vorgänge für Bestandsübertragung
 * Jeder Fall ist E2E durchdacht mit korrekten Schlagwörtern in den E-Mails
 */

const DemoData = (function() {
    'use strict';

    // 20 Einzelmakler (individuelle Versicherungsmakler)
    const MAKLER = [
        { name: "Thomas Meier", email: "t.meier@makler-meier.de" },
        { name: "Sandra Schmidt", email: "s.schmidt@schmidt-versicherungen.de" },
        { name: "Michael Hofmann", email: "m.hofmann@hofmann-makler.de" },
        { name: "Julia Wagner", email: "j.wagner@wagner-finanz.de" },
        { name: "Andreas Krause", email: "a.krause@krause-makler.de" },
        { name: "Petra Becker", email: "p.becker@becker-versicherung.de" },
        { name: "Frank Richter", email: "f.richter@richter-makler.de" },
        { name: "Claudia Wolf", email: "c.wolf@wolf-versicherungen.de" },
        { name: "Martin Neumann", email: "m.neumann@neumann-finanz.de" },
        { name: "Anna Schwarz", email: "a.schwarz@schwarz-makler.de" },
        { name: "Stefan Zimmermann", email: "s.zimmermann@zimmermann-versicherung.de" },
        { name: "Martina Koch", email: "m.koch@koch-makler.de" },
        { name: "Nicole Krüger", email: "n.krueger@krueger-finanz.de" },
        { name: "Daniel Hartmann", email: "d.hartmann@hartmann-makler.de" },
        { name: "Karin Schulz", email: "k.schulz@schulz-versicherungen.de" },
        { name: "Christian Bauer", email: "c.bauer@bauer-makler.de" },
        { name: "Susanne Lang", email: "s.lang@lang-finanz.de" },
        { name: "Markus Friedrich", email: "m.friedrich@friedrich-makler.de" },
        { name: "Elisabeth Vogt", email: "e.vogt@vogt-versicherung.de" },
        { name: "Robert Lehmann", email: "r.lehmann@lehmann-makler.de" }
    ];

    const SPARTEN = ["KFZ", "Leben", "Kranken", "Haftpflicht", "Hausrat", "Rechtsschutz", "Unfall", "BU", "Wohngebäude", "Rente"];

    /**
     * 20 konkrete Demo-Fälle generieren
     */
    function generateDemoCases() {
        const cases = {};
        const now = new Date();

        function daysAgo(days) {
            const date = new Date(now);
            date.setDate(date.getDate() - days);
            return date.toISOString();
        }

        function formatDateGerman(isoDate) {
            const d = new Date(isoDate);
            return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        // ============================================
        // FALL 1: Bestätigt & Exportiert - KFZ
        // ============================================
        cases['case-001'] = {
            id: 'case-001',
            createdAt: daysAgo(45),
            updatedAt: daysAgo(30),
            kunde: { name: "Müller, Hans", source: "auto", confidence: 0.98 },
            versicherungsnummer: { value: "ERG-7823456", source: "auto", confidence: 0.99 },
            gueltigkeitsdatum: { value: "01.01.2026", source: "auto", confidence: 0.95 },
            status: 'abgeschlossen',
            sparte: 'KFZ',
            makler: MAKLER[0],
            notes: "",
            workflow: {
                mailReceived: daysAgo(45),
                mailUploaded: daysAgo(44),
                kiRecognized: daysAgo(44),
                pvValidated: daysAgo(35),
                exported: daysAgo(25)
            },
            exported: { date: daysAgo(25), by: "Max Mustermann" },
            messages: [
                {
                    entryID: 'msg-001-a',
                    folder: 'sent',
                    subject: 'Bestandsübertragung Müller KFZ - ERG-7823456',
                    senderEmail: MAKLER[0].email,
                    receivedTime: daysAgo(45),
                    bodyPlain: `Sehr geehrte Damen und Herren,

hiermit beantragen wir die Bestandsübertragung für unseren Kunden Hans Müller.

Versicherungsnummer: ERG-7823456
Sparte: KFZ
Gewünschter Übertragungstermin: 01.01.2026

Die unterschriebene Maklervollmacht liegt vor und ist diesem Schreiben beigefügt.

Mit freundlichen Grüßen
Thomas Meier
Versicherungsmakler`
                },
                {
                    entryID: 'msg-001-b',
                    folder: 'inbox',
                    subject: 'AW: Bestandsübertragung Müller KFZ - ERG-7823456',
                    senderEmail: 'maklerservice@ergo.de',
                    receivedTime: daysAgo(35),
                    bodyPlain: `Sehr geehrter Herr Meier,

wir bestätigen die Bestandsübertragung für den Vertrag ERG-7823456 des Kunden Hans Müller.

Die Übertragung wird zum 01.01.2026 wirksam. Ab diesem Datum sind Sie als betreuender Makler hinterlegt.

Mit freundlichen Grüßen
ERGO Maklerservice`
                }
            ],
            statusHistory: [
                { date: daysAgo(45).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' },
                { date: daysAgo(35).split('T')[0], from: 'zu-validieren', to: 'export-bereit', note: 'Bestätigt durch ERGO' }
            ]
        };

        // ============================================
        // FALL 2: Export-Bereit - Leben (Christine Weber)
        // Import: 13.12., PV-Validierung: 14.12.
        // ============================================
        cases['case-002'] = {
            id: 'case-002',
            createdAt: daysAgo(2),  // 13.12.
            updatedAt: daysAgo(1),  // 14.12.
            kunde: { name: "Weber, Christine", source: "auto", confidence: 0.97 },
            versicherungsnummer: { value: "ERG-4512378", source: "auto", confidence: 0.99 },
            gueltigkeitsdatum: { value: "01.02.2026", source: "auto", confidence: 0.92 },
            status: 'export-bereit',
            sparte: 'Leben',
            makler: MAKLER[1],
            notes: "",
            workflow: {
                mailReceived: daysAgo(60),       // Original-Mail vom 15.10.
                mailUploaded: daysAgo(2),        // Import am 13.12.
                kiRecognized: daysAgo(2),        // KI-Erkennung am 13.12.
                pvValidated: daysAgo(1)          // PV-Validierung am 14.12.
            },
            messages: [
                {
                    entryID: 'msg-002-a',
                    folder: 'sent',
                    subject: 'Antrag Bestandsübertragung Weber - Lebensversicherung',
                    senderEmail: MAKLER[1].email,
                    receivedTime: daysAgo(60),
                    bodyPlain: `Sehr geehrte Damen und Herren,

für unsere Kundin Christine Weber beantragen wir die Übertragung der Lebensversicherung.

Vertragsnummer: ERG-4512378
Übertragung zum: 01.02.2026

Vollmacht anbei.

Mit freundlichen Grüßen
Sandra Schmidt
Versicherungsmaklerin`
                }
            ],
            statusHistory: [
                { date: daysAgo(2).split('T')[0], from: null, to: 'zu-validieren', note: 'Importiert am 13.12.' },
                { date: daysAgo(1).split('T')[0], from: 'zu-validieren', to: 'export-bereit', note: 'PV validiert am 14.12.' }
            ]
        };

        // ============================================
        // FALL 3: Export-Bereit - nicht exportiert - Hausrat
        // ============================================
        cases['case-003'] = {
            id: 'case-003',
            createdAt: daysAgo(25),
            updatedAt: daysAgo(10),
            kunde: { name: "Fischer, Maria", source: "auto", confidence: 0.96 },
            versicherungsnummer: { value: "ERG-9087654", source: "auto", confidence: 0.98 },
            gueltigkeitsdatum: { value: "15.01.2026", source: "auto", confidence: 0.90 },
            status: 'export-bereit',
            sparte: 'Hausrat',
            makler: MAKLER[2],
            notes: "",
            workflow: {
                mailReceived: daysAgo(25),
                mailUploaded: daysAgo(24),
                kiRecognized: daysAgo(24),
                pvValidated: daysAgo(12)
            },
            messages: [
                {
                    entryID: 'msg-003-a',
                    folder: 'sent',
                    subject: 'Bestandsübertragung Fischer Hausrat ERG-9087654',
                    senderEmail: MAKLER[2].email,
                    receivedTime: daysAgo(25),
                    bodyPlain: `Guten Tag,

bitte übertragen Sie den Hausratvertrag ERG-9087654 der Kundin Maria Fischer in unseren Bestand.

Gewünschter Termin: 15.01.2026

Maklervollmacht liegt bei.

Freundliche Grüße
Michael Hofmann
Versicherungsmakler`
                },
                {
                    entryID: 'msg-003-b',
                    folder: 'inbox',
                    subject: 'Bestätigung Bestandsübertragung Fischer',
                    senderEmail: 'maklerservice@ergo.de',
                    receivedTime: daysAgo(12),
                    bodyPlain: `Sehr geehrter Herr Hofmann,

die Bestandsübertragung für Maria Fischer (ERG-9087654) wurde durchgeführt.

Wirksam ab: 15.01.2026

Mit freundlichen Grüßen
ERGO Maklerservice`
                }
            ],
            statusHistory: [
                { date: daysAgo(25).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' },
                { date: daysAgo(12).split('T')[0], from: 'zu-validieren', to: 'export-bereit', note: 'Bestätigt durch ERGO' }
            ]
        };

        // ============================================
        // FALL 4: Export-Bereit - Kranken
        // ============================================
        cases['case-004'] = {
            id: 'case-004',
            createdAt: daysAgo(50),
            updatedAt: daysAgo(35),
            kunde: { name: "Schneider, Peter", source: "auto", confidence: 0.94 },
            versicherungsnummer: { value: "ERG-3345678", source: "auto", confidence: 0.97 },
            gueltigkeitsdatum: { value: "01.03.2026", source: "auto", confidence: 0.88 },
            status: 'export-bereit',
            sparte: 'Kranken',
            makler: MAKLER[3],
            notes: "",
            workflow: {
                mailReceived: daysAgo(50),
                mailUploaded: daysAgo(49),
                kiRecognized: daysAgo(49),
                pvValidated: daysAgo(38)
            },
            messages: [
                {
                    entryID: 'msg-004-a',
                    folder: 'sent',
                    subject: 'Übertragungsantrag Schneider Krankenversicherung',
                    senderEmail: MAKLER[3].email,
                    receivedTime: daysAgo(50),
                    bodyPlain: `Sehr geehrte Damen und Herren,

hiermit beantrage ich die Bestandsübertragung für Peter Schneider.

VS-Nr: ERG-3345678
Sparte: Kranken
Übertragung zum: 01.03.2026

Vollmacht anbei.

Julia Wagner
Versicherungsmaklerin`
                },
                {
                    entryID: 'msg-004-b',
                    folder: 'inbox',
                    subject: 'Ablehnung Bestandsübertragung Schneider',
                    senderEmail: 'maklerservice@ergo.de',
                    receivedTime: daysAgo(38),
                    bodyPlain: `Sehr geehrte Frau Wagner,

leider müssen wir die Bestandsübertragung für Peter Schneider, Vertrag ERG-3345678, ablehnen.

Grund: Die eingereichte Maklervollmacht ist auf ein falsches Datum ausgestellt und daher ungültig.

Bitte reichen Sie eine korrigierte Vollmacht ein.

Mit freundlichen Grüßen
ERGO Maklerservice`
                }
            ],
            statusHistory: [
                { date: daysAgo(50).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' },
                { date: daysAgo(38).split('T')[0], from: 'zu-validieren', to: 'export-bereit', note: 'Validiert - Bereit für Export' }
            ]
        };

        // ============================================
        // FALL 5: Export-Bereit - Haftpflicht
        // ============================================
        cases['case-005'] = {
            id: 'case-005',
            createdAt: daysAgo(20),
            updatedAt: daysAgo(8),
            kunde: { name: "Braun, Sabine", source: "auto", confidence: 0.95 },
            versicherungsnummer: { value: "ERG-6654321", source: "auto", confidence: 0.99 },
            gueltigkeitsdatum: { value: "01.04.2026", source: "auto", confidence: 0.91 },
            status: 'export-bereit',
            sparte: 'Haftpflicht',
            makler: MAKLER[4],
            notes: "",
            workflow: {
                mailReceived: daysAgo(20),
                mailUploaded: daysAgo(19),
                kiRecognized: daysAgo(19),
                pvValidated: daysAgo(10)
            },
            messages: [
                {
                    entryID: 'msg-005-a',
                    folder: 'sent',
                    subject: 'Bestandsübertragung Braun Haftpflicht',
                    senderEmail: MAKLER[4].email,
                    receivedTime: daysAgo(20),
                    bodyPlain: `Sehr geehrte Damen und Herren,

für die Kundin Sabine Braun beantragen wir die Übertragung der Haftpflichtversicherung ERG-6654321.

Übertragungsdatum: 01.04.2026

Vollmacht folgt per Post.

Mit freundlichen Grüßen
Andreas Krause
Versicherungsmakler`
                },
                {
                    entryID: 'msg-005-b',
                    folder: 'inbox',
                    subject: 'AW: Bestandsübertragung Braun - Ablehnung',
                    senderEmail: 'maklerservice@ergo.de',
                    receivedTime: daysAgo(10),
                    bodyPlain: `Sehr geehrter Herr Krause,

die Bestandsübertragung für Sabine Braun (ERG-6654321) kann nicht durchgeführt werden.

Grund: Es liegt keine unterschriebene Maklervollmacht vor.

Bitte reichen Sie die Vollmacht nach.

Mit freundlichen Grüßen
ERGO Maklerservice`
                }
            ],
            statusHistory: [
                { date: daysAgo(20).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' },
                { date: daysAgo(10).split('T')[0], from: 'zu-validieren', to: 'export-bereit', note: 'Validiert - Bereit für Export' }
            ]
        };

        // ============================================
        // FALL 6: In Bearbeitung - Rechtsschutz
        // ============================================
        cases['case-006'] = {
            id: 'case-006',
            createdAt: daysAgo(15),
            updatedAt: daysAgo(5),
            kunde: { name: "Klein, Thomas", source: "auto", confidence: 0.97 },
            versicherungsnummer: { value: "ERG-2234567", source: "auto", confidence: 0.98 },
            gueltigkeitsdatum: { value: "01.02.2026", source: "auto", confidence: 0.93 },
            status: 'wiedervorlage',
            sparte: 'Rechtsschutz',
            makler: MAKLER[5],
            notes: "Rückfrage zu Vollmachtsdatum",
            workflow: {
                mailReceived: daysAgo(15),
                mailUploaded: daysAgo(14),
                kiRecognized: daysAgo(14),
                pvValidated: daysAgo(7)
            },
            messages: [
                {
                    entryID: 'msg-006-a',
                    folder: 'sent',
                    subject: 'Bestandsübertragung Klein Rechtsschutz ERG-2234567',
                    senderEmail: MAKLER[5].email,
                    receivedTime: daysAgo(15),
                    bodyPlain: `Sehr geehrte Damen und Herren,

wir beantragen die Bestandsübertragung für Thomas Klein.

Vertrag: ERG-2234567
Sparte: Rechtsschutz
Wirksam ab: 01.02.2026

Vollmacht im Anhang.

Petra Becker
Versicherungsmaklerin`
                },
                {
                    entryID: 'msg-006-b',
                    folder: 'inbox',
                    subject: 'Rückfrage zu Bestandsübertragung Klein',
                    senderEmail: 'maklerservice@ergo.de',
                    receivedTime: daysAgo(7),
                    bodyPlain: `Sehr geehrte Frau Becker,

zu Ihrem Antrag für Thomas Klein, Vertrag ERG-2234567, haben wir eine Rückfrage:

Das Vollmachtsdatum liegt vor dem Vertragsbeginn. Bitte bestätigen Sie, dass dies korrekt ist.

Mit freundlichen Grüßen
ERGO Maklerservice`
                }
            ],
            statusHistory: [
                { date: daysAgo(15).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' },
                { date: daysAgo(7).split('T')[0], from: 'zu-validieren', to: 'wiedervorlage', note: 'Rückfrage ERGO' }
            ]
        };

        // ============================================
        // FALL 7: Export-Bereit - BU
        // ============================================
        cases['case-007'] = {
            id: 'case-007',
            createdAt: daysAgo(10),
            updatedAt: daysAgo(5),
            kunde: { name: "Hoffmann, Laura", source: "auto", confidence: 0.96 },
            versicherungsnummer: { value: "ERG-8876543", source: "auto", confidence: 0.99 },
            gueltigkeitsdatum: { value: "01.05.2026", source: "auto", confidence: 0.94 },
            status: 'export-bereit',
            sparte: 'BU',
            makler: MAKLER[6],
            notes: "",
            workflow: {
                mailReceived: daysAgo(10),
                mailUploaded: daysAgo(9),
                kiRecognized: daysAgo(9),
                pvValidated: daysAgo(5)
            },
            messages: [
                {
                    entryID: 'msg-007-a',
                    folder: 'sent',
                    subject: 'Bestandsübertragung Hoffmann BU-Versicherung',
                    senderEmail: MAKLER[6].email,
                    receivedTime: daysAgo(10),
                    bodyPlain: `Sehr geehrte Damen und Herren,

ich beantrage die Bestandsübertragung für Laura Hoffmann.

VS-Nr: ERG-8876543
Sparte: Berufsunfähigkeit
Übertragung zum: 01.05.2026

Maklervollmacht liegt bei.

Mit freundlichen Grüßen
Frank Richter
Versicherungsmakler`
                }
            ],
            statusHistory: [
                { date: daysAgo(10).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' },
                { date: daysAgo(5).split('T')[0], from: 'zu-validieren', to: 'export-bereit', note: 'Validiert - Bereit für Export' }
            ]
        };

        // ============================================
        // FALL 8: Export-Bereit - Wohngebäude
        // ============================================
        cases['case-008'] = {
            id: 'case-008',
            createdAt: daysAgo(8),
            updatedAt: daysAgo(3),
            kunde: { name: "Berger, Thorsten", source: "auto", confidence: 0.98 },
            versicherungsnummer: { value: "ERG-1123456", source: "auto", confidence: 0.97 },
            gueltigkeitsdatum: { value: "01.03.2026", source: "auto", confidence: 0.92 },
            status: 'export-bereit',
            sparte: 'Wohngebäude',
            makler: MAKLER[7],
            notes: "",
            workflow: {
                mailReceived: daysAgo(8),
                mailUploaded: daysAgo(7),
                kiRecognized: daysAgo(7),
                pvValidated: daysAgo(3)
            },
            messages: [
                {
                    entryID: 'msg-008-a',
                    folder: 'sent',
                    subject: 'Übertragung Wohngebäudeversicherung Berger',
                    senderEmail: MAKLER[7].email,
                    receivedTime: daysAgo(8),
                    bodyPlain: `Guten Tag,

für meinen Kunden Thorsten Berger beantrage ich die Übertragung der Wohngebäudeversicherung.

Vertragsnummer: ERG-1123456
Gewünschtes Übertragungsdatum: 01.03.2026

Vollmacht anbei.

Claudia Wolf
Versicherungsmaklerin`
                }
            ],
            statusHistory: [
                { date: daysAgo(8).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' },
                { date: daysAgo(3).split('T')[0], from: 'zu-validieren', to: 'export-bereit', note: 'Validiert - Bereit für Export' }
            ]
        };

        // ============================================
        // FALL 9: Angefragt - Unfall
        // ============================================
        cases['case-009'] = {
            id: 'case-009',
            createdAt: daysAgo(6),
            updatedAt: daysAgo(6),
            kunde: { name: "Lorenz, Simone", source: "auto", confidence: 0.95 },
            versicherungsnummer: { value: "ERG-5543210", source: "auto", confidence: 0.98 },
            gueltigkeitsdatum: { value: "15.02.2026", source: "auto", confidence: 0.90 },
            status: 'zu-validieren',
            sparte: 'Unfall',
            makler: MAKLER[8],
            notes: "",
            workflow: {
                mailReceived: daysAgo(6),
                mailUploaded: daysAgo(5),
                kiRecognized: daysAgo(5)
            },
            messages: [
                {
                    entryID: 'msg-009-a',
                    folder: 'sent',
                    subject: 'Bestandsübertragung Lorenz Unfallversicherung',
                    senderEmail: MAKLER[8].email,
                    receivedTime: daysAgo(6),
                    bodyPlain: `Sehr geehrte Damen und Herren,

ich beantrage die Übertragung der Unfallversicherung für Simone Lorenz.

Versicherungsnummer: ERG-5543210
Übertragung zum: 15.02.2026

Maklervollmacht im Anhang.

Martin Neumann
Versicherungsmakler`
                }
            ],
            statusHistory: [
                { date: daysAgo(6).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' }
            ]
        };

        // ============================================
        // FALL 10: Angefragt - Rente
        // ============================================
        cases['case-010'] = {
            id: 'case-010',
            createdAt: daysAgo(5),
            updatedAt: daysAgo(5),
            kunde: { name: "Werner, Patrick", source: "auto", confidence: 0.97 },
            versicherungsnummer: { value: "ERG-7765432", source: "auto", confidence: 0.99 },
            gueltigkeitsdatum: { value: "01.04.2026", source: "auto", confidence: 0.93 },
            status: 'zu-validieren',
            sparte: 'Rente',
            makler: MAKLER[9],
            notes: "",
            workflow: {
                mailReceived: daysAgo(5),
                mailUploaded: daysAgo(4),
                kiRecognized: daysAgo(4)
            },
            messages: [
                {
                    entryID: 'msg-010-a',
                    folder: 'sent',
                    subject: 'Antrag Bestandsübertragung Werner Rentenversicherung',
                    senderEmail: MAKLER[9].email,
                    receivedTime: daysAgo(5),
                    bodyPlain: `Sehr geehrte Damen und Herren,

hiermit beantrage ich die Bestandsübertragung für Patrick Werner.

VS-Nr: ERG-7765432
Produkt: Rentenversicherung
Übertragungstermin: 01.04.2026

Die Vollmacht ist beigefügt.

Anna Schwarz
Versicherungsmaklerin`
                }
            ],
            statusHistory: [
                { date: daysAgo(5).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' }
            ]
        };

        // ============================================
        // FALL 11: Angefragt - KFZ (KI hat alles erkannt)
        // ============================================
        cases['case-011'] = {
            id: 'case-011',
            createdAt: daysAgo(2),
            updatedAt: daysAgo(2),
            kunde: { name: "Franke, Birgit", source: "auto", confidence: 0.95 },
            versicherungsnummer: { value: "ERG-4432109", source: "auto", confidence: 0.97 },
            gueltigkeitsdatum: { value: "01.06.2026", source: "auto", confidence: 0.92 },
            status: 'zu-validieren',
            sparte: 'KFZ',
            makler: MAKLER[10],
            notes: "Vollmacht noch nicht unterschrieben - Rückfrage nötig",
            workflow: {
                mailReceived: daysAgo(2),
                mailUploaded: daysAgo(2),
                kiRecognized: daysAgo(2)
            },
            messages: [
                {
                    entryID: 'msg-011-a',
                    folder: 'sent',
                    subject: 'Bestandsübertragung KFZ',
                    senderEmail: MAKLER[10].email,
                    receivedTime: daysAgo(2),
                    bodyPlain: `Hallo,

anbei die Unterlagen für Frau Franke, Birgit.

KFZ-Versicherung ERG-4432109
Übertragung gewünscht zum 01.06.2026

Vollmacht folgt.

Stefan Zimmermann`
                }
            ],
            statusHistory: [
                { date: daysAgo(2).split('T')[0], from: null, to: 'zu-validieren', note: 'KI-Erkennung erfolgreich' }
            ]
        };

        // ============================================
        // FALL 12: Unvollständig - Leben (VS-Nr fehlt in Mail)
        // ============================================
        cases['case-012'] = {
            id: 'case-012',
            createdAt: daysAgo(1),
            updatedAt: daysAgo(1),
            kunde: { name: "Seidel, Ralf", source: "auto", confidence: 0.85 },
            versicherungsnummer: { value: "", source: "auto", confidence: 0 },
            gueltigkeitsdatum: { value: "01.07.2026", source: "auto", confidence: 0.75 },
            status: 'unvollstaendig',
            sparte: 'Leben',
            makler: MAKLER[11],
            notes: "VS-Nr fehlt in der Original-Mail - bitte manuell ergänzen",
            workflow: {
                mailReceived: daysAgo(1),
                mailUploaded: daysAgo(1),
                kiRecognized: daysAgo(1)
            },
            messages: [
                {
                    entryID: 'msg-012-a',
                    folder: 'sent',
                    subject: 'Übertragung Lebensversicherung Seidel',
                    senderEmail: MAKLER[11].email,
                    receivedTime: daysAgo(1),
                    bodyPlain: `Sehr geehrte Damen und Herren,

für Herrn Ralf Seidel beantrage ich die Übertragung seiner Lebensversicherung.

Die Vertragsnummer finden Sie in den beigefügten Unterlagen.
Termin: 01.07.2026

Maklervollmacht im Anhang.

Martina Koch
Versicherungsmaklerin`
                }
            ],
            statusHistory: [
                { date: daysAgo(1).split('T')[0], from: null, to: 'unvollstaendig', note: 'KI-Erkennung: VS-Nr nicht gefunden' }
            ]
        };

        // ============================================
        // FALL 13: Export-Bereit - Kranken
        // ============================================
        cases['case-013'] = {
            id: 'case-013',
            createdAt: daysAgo(35),
            updatedAt: daysAgo(18),
            kunde: { name: "Koch, Martina", source: "auto", confidence: 0.96 },
            versicherungsnummer: { value: "ERG-6678901", source: "auto", confidence: 0.98 },
            gueltigkeitsdatum: { value: "01.01.2026", source: "auto", confidence: 0.95 },
            status: 'export-bereit',
            sparte: 'Kranken',
            makler: MAKLER[12],
            notes: "",
            workflow: {
                mailReceived: daysAgo(35),
                mailUploaded: daysAgo(34),
                kiRecognized: daysAgo(34),
                pvValidated: daysAgo(22)
            },
            messages: [
                {
                    entryID: 'msg-013-a',
                    folder: 'sent',
                    subject: 'Übertragung Krankenversicherung Koch',
                    senderEmail: MAKLER[12].email,
                    receivedTime: daysAgo(35),
                    bodyPlain: `Sehr geehrte Damen und Herren,

bitte übertragen Sie die Krankenversicherung ERG-6678901 von Martina Koch in meinen Bestand.

Gewünschter Termin: 01.01.2026

Vollmacht anbei.

Martina Koch
Versicherungsmaklerin`
                },
                {
                    entryID: 'msg-013-b',
                    folder: 'inbox',
                    subject: 'Bestätigung: Übertragung Koch',
                    senderEmail: 'maklerservice@ergo.de',
                    receivedTime: daysAgo(22),
                    bodyPlain: `Sehr geehrte Frau Koch,

die Bestandsübertragung für Martina Koch (ERG-6678901) wurde bestätigt.

Wirksam ab 01.01.2026.

ERGO Maklerservice`
                }
            ],
            statusHistory: [
                { date: daysAgo(35).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' },
                { date: daysAgo(22).split('T')[0], from: 'zu-validieren', to: 'export-bereit', note: 'Bestätigt durch ERGO' }
            ]
        };

        // ============================================
        // FALL 14: Angefragt - KFZ
        // ============================================
        cases['case-014'] = {
            id: 'case-014',
            createdAt: daysAgo(4),
            updatedAt: daysAgo(4),
            kunde: { name: "Krüger, Nicole", source: "auto", confidence: 0.94 },
            versicherungsnummer: { value: "ERG-3321098", source: "auto", confidence: 0.97 },
            gueltigkeitsdatum: { value: "01.03.2026", source: "auto", confidence: 0.91 },
            status: 'zu-validieren',
            sparte: 'KFZ',
            makler: MAKLER[13],
            notes: "",
            workflow: {
                mailReceived: daysAgo(4),
                mailUploaded: daysAgo(3),
                kiRecognized: daysAgo(3)
            },
            messages: [
                {
                    entryID: 'msg-014-a',
                    folder: 'sent',
                    subject: 'Bestandsübertragung KFZ Krüger ERG-3321098',
                    senderEmail: MAKLER[13].email,
                    receivedTime: daysAgo(4),
                    bodyPlain: `Guten Tag,

ich beantrage die Übertragung des KFZ-Vertrags ERG-3321098 für Nicole Krüger.

Übertragung zum 01.03.2026.

Vollmacht im Anhang.

Daniel Hartmann
Versicherungsmakler`
                }
            ],
            statusHistory: [
                { date: daysAgo(4).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' }
            ]
        };

        // ============================================
        // FALL 15: In Bearbeitung - Hausrat
        // ============================================
        cases['case-015'] = {
            id: 'case-015',
            createdAt: daysAgo(18),
            updatedAt: daysAgo(6),
            kunde: { name: "Roth, Alexander", source: "auto", confidence: 0.97 },
            versicherungsnummer: { value: "ERG-2210987", source: "auto", confidence: 0.99 },
            gueltigkeitsdatum: { value: "15.01.2026", source: "auto", confidence: 0.94 },
            status: 'wiedervorlage',
            sparte: 'Hausrat',
            makler: MAKLER[14],
            notes: "Prüfung der Vollmacht läuft",
            workflow: {
                mailReceived: daysAgo(18),
                mailUploaded: daysAgo(17),
                kiRecognized: daysAgo(17),
                pvValidated: daysAgo(8)
            },
            messages: [
                {
                    entryID: 'msg-015-a',
                    folder: 'sent',
                    subject: 'Antrag Bestandsübertragung Roth',
                    senderEmail: MAKLER[14].email,
                    receivedTime: daysAgo(18),
                    bodyPlain: `Sehr geehrte Damen und Herren,

für Alexander Roth beantrage ich die Übertragung der Hausratversicherung.

Vertrag: ERG-2210987
Datum: 15.01.2026

Vollmacht liegt bei.

Karin Schulz
Versicherungsmaklerin`
                },
                {
                    entryID: 'msg-015-b',
                    folder: 'inbox',
                    subject: 'Bearbeitung Bestandsübertragung Roth',
                    senderEmail: 'maklerservice@ergo.de',
                    receivedTime: daysAgo(8),
                    bodyPlain: `Sehr geehrte Frau Schulz,

Ihr Antrag für Alexander Roth (ERG-2210987) wird derzeit geprüft.

Wir melden uns bei Rückfragen.

ERGO Maklerservice`
                }
            ],
            statusHistory: [
                { date: daysAgo(18).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' },
                { date: daysAgo(8).split('T')[0], from: 'zu-validieren', to: 'wiedervorlage', note: 'In Prüfung' }
            ]
        };

        // ============================================
        // FALL 16: Abgeschlossen - Haftpflicht
        // ============================================
        cases['case-016'] = {
            id: 'case-016',
            createdAt: daysAgo(40),
            updatedAt: daysAgo(25),
            kunde: { name: "Schenk, Oliver", source: "auto", confidence: 0.98 },
            versicherungsnummer: { value: "ERG-8809876", source: "auto", confidence: 0.99 },
            gueltigkeitsdatum: { value: "01.12.2025", source: "auto", confidence: 0.96 },
            status: 'abgeschlossen',
            sparte: 'Haftpflicht',
            makler: MAKLER[15],
            notes: "",
            workflow: {
                mailReceived: daysAgo(40),
                mailUploaded: daysAgo(39),
                kiRecognized: daysAgo(39),
                pvValidated: daysAgo(28),
                exported: daysAgo(15)
            },
            exported: { date: daysAgo(15), by: "Lisa Schmidt" },
            messages: [
                {
                    entryID: 'msg-016-a',
                    folder: 'sent',
                    subject: 'Übertragung Haftpflicht Schenk',
                    senderEmail: MAKLER[15].email,
                    receivedTime: daysAgo(40),
                    bodyPlain: `Sehr geehrte Damen und Herren,

ich beantrage die Bestandsübertragung für Oliver Schenk.

VS-Nr: ERG-8809876
Sparte: Haftpflicht
Übertragung: 01.12.2025

Vollmacht anbei.

Christian Bauer
Versicherungsmakler`
                },
                {
                    entryID: 'msg-016-b',
                    folder: 'inbox',
                    subject: 'AW: Übertragung Haftpflicht Schenk',
                    senderEmail: 'maklerservice@ergo.de',
                    receivedTime: daysAgo(28),
                    bodyPlain: `Sehr geehrter Herr Bauer,

die Bestandsübertragung für Oliver Schenk, Vertrag ERG-8809876, wurde genehmigt.

Wirksam ab: 01.12.2025

ERGO Maklerservice`
                }
            ],
            statusHistory: [
                { date: daysAgo(40).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' },
                { date: daysAgo(28).split('T')[0], from: 'zu-validieren', to: 'export-bereit', note: 'Bestätigt durch ERGO' }
            ]
        };

        // ============================================
        // FALL 17: Angefragt - Leben
        // ============================================
        cases['case-017'] = {
            id: 'case-017',
            createdAt: daysAgo(3),
            updatedAt: daysAgo(3),
            kunde: { name: "Bauer, Christian", source: "auto", confidence: 0.95 },
            versicherungsnummer: { value: "ERG-1198765", source: "auto", confidence: 0.98 },
            gueltigkeitsdatum: { value: "01.05.2026", source: "auto", confidence: 0.92 },
            status: 'zu-validieren',
            sparte: 'Leben',
            makler: MAKLER[16],
            notes: "",
            workflow: {
                mailReceived: daysAgo(3),
                mailUploaded: daysAgo(2),
                kiRecognized: daysAgo(2)
            },
            messages: [
                {
                    entryID: 'msg-017-a',
                    folder: 'sent',
                    subject: 'Bestandsübertragung Bauer Lebensversicherung',
                    senderEmail: MAKLER[16].email,
                    receivedTime: daysAgo(3),
                    bodyPlain: `Sehr geehrte Damen und Herren,

ich beantrage die Übertragung der Lebensversicherung ERG-1198765 für Christian Bauer.

Termin: 01.05.2026

Maklervollmacht anbei.

Susanne Lang
Versicherungsmaklerin`
                }
            ],
            statusHistory: [
                { date: daysAgo(3).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' }
            ]
        };

        // ============================================
        // FALL 18: Abgelehnt - Unfall
        // ============================================
        cases['case-018'] = {
            id: 'case-018',
            createdAt: daysAgo(30),
            updatedAt: daysAgo(15),
            kunde: { name: "Kraft, Melanie", source: "auto", confidence: 0.93 },
            versicherungsnummer: { value: "ERG-4487654", source: "auto", confidence: 0.96 },
            gueltigkeitsdatum: { value: "01.02.2026", source: "auto", confidence: 0.89 },
            status: 'abgelehnt',
            sparte: 'Unfall',
            makler: MAKLER[17],
            notes: "Kunde hat Übertragung widerrufen",
            workflow: {
                mailReceived: daysAgo(30),
                mailUploaded: daysAgo(29),
                kiRecognized: daysAgo(29),
                pvValidated: daysAgo(18)
            },
            messages: [
                {
                    entryID: 'msg-018-a',
                    folder: 'sent',
                    subject: 'Übertragungsantrag Kraft Unfallversicherung',
                    senderEmail: MAKLER[17].email,
                    receivedTime: daysAgo(30),
                    bodyPlain: `Sehr geehrte Damen und Herren,

für Melanie Kraft beantrage ich die Übertragung der Unfallversicherung.

VS-Nr: ERG-4487654
Termin: 01.02.2026

Vollmacht liegt bei.

Markus Friedrich
Versicherungsmakler`
                },
                {
                    entryID: 'msg-018-b',
                    folder: 'inbox',
                    subject: 'Stornierung Bestandsübertragung Kraft',
                    senderEmail: 'maklerservice@ergo.de',
                    receivedTime: daysAgo(18),
                    bodyPlain: `Sehr geehrter Herr Friedrich,

die Bestandsübertragung für Melanie Kraft (ERG-4487654) wurde auf Wunsch der Kundin storniert.

Die Kundin hat ihre Maklervollmacht widerrufen.

ERGO Maklerservice`
                }
            ],
            statusHistory: [
                { date: daysAgo(30).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' },
                { date: daysAgo(18).split('T')[0], from: 'zu-validieren', to: 'abgelehnt', note: 'Storniert durch Kunde' }
            ]
        };

        // ============================================
        // FALL 19: Angefragt - Rechtsschutz (KI hat alles erkannt)
        // ============================================
        cases['case-019'] = {
            id: 'case-019',
            createdAt: daysAgo(1),
            updatedAt: daysAgo(1),
            kunde: { name: "Engel, Tanja", source: "auto", confidence: 0.94 },
            versicherungsnummer: { value: "ERG-7776543", source: "auto", confidence: 0.96 },
            gueltigkeitsdatum: { value: "01.08.2026", source: "auto", confidence: 0.91 },
            status: 'zu-validieren',
            sparte: 'Rechtsschutz',
            makler: MAKLER[18],
            notes: "Vollmacht wird per Post erwartet",
            workflow: {
                mailReceived: daysAgo(1),
                mailUploaded: daysAgo(1),
                kiRecognized: daysAgo(1)
            },
            messages: [
                {
                    entryID: 'msg-019-a',
                    folder: 'sent',
                    subject: 'Rechtsschutz Engel - Übertragung',
                    senderEmail: MAKLER[18].email,
                    receivedTime: daysAgo(1),
                    bodyPlain: `Guten Tag,

ich möchte die Rechtsschutzversicherung von Frau Tanja Engel übertragen.

VS-Nr: ERG-7776543
Gewünschter Termin: 01.08.2026

Vollmacht kommt per Post.

Mit freundlichen Grüßen
Elisabeth Vogt
Versicherungsmaklerin`
                }
            ],
            statusHistory: [
                { date: daysAgo(1).split('T')[0], from: null, to: 'zu-validieren', note: 'KI-Erkennung erfolgreich' }
            ]
        };

        // ============================================
        // FALL 20: Angefragt - Wohngebäude
        // ============================================
        cases['case-020'] = {
            id: 'case-020',
            createdAt: daysAgo(7),
            updatedAt: daysAgo(7),
            kunde: { name: "Vogt, Elisabeth", source: "auto", confidence: 0.96 },
            versicherungsnummer: { value: "ERG-5565432", source: "auto", confidence: 0.99 },
            gueltigkeitsdatum: { value: "01.04.2026", source: "auto", confidence: 0.93 },
            status: 'zu-validieren',
            sparte: 'Wohngebäude',
            makler: MAKLER[19],
            notes: "",
            workflow: {
                mailReceived: daysAgo(7),
                mailUploaded: daysAgo(6),
                kiRecognized: daysAgo(6)
            },
            messages: [
                {
                    entryID: 'msg-020-a',
                    folder: 'sent',
                    subject: 'Antrag Bestandsübertragung Vogt Wohngebäude',
                    senderEmail: MAKLER[19].email,
                    receivedTime: daysAgo(7),
                    bodyPlain: `Sehr geehrte Damen und Herren,

hiermit beantrage ich die Übertragung der Wohngebäudeversicherung für Elisabeth Vogt.

Vertragsnummer: ERG-5565432
Übertragung zum: 01.04.2026

Die Maklervollmacht ist beigefügt.

Mit freundlichen Grüßen
Robert Lehmann
Versicherungsmakler`
                }
            ],
            statusHistory: [
                { date: daysAgo(7).split('T')[0], from: null, to: 'zu-validieren', note: 'Anfrage erstellt' }
            ]
        };

        // ============================================
        // SAMMELMAIL 1: 3 verschiedene Kunden in einer E-Mail
        // Makler: Thomas Meier sendet eine Sammelanfrage für 3 Kunden
        // ============================================
        const sammelmail1Id = 'email-sammel-001';
        const sammelmail1 = {
            entryID: sammelmail1Id,
            folder: 'sent',
            subject: 'Sammelanfrage Bestandsübertragung - 3 Kunden',
            senderEmail: MAKLER[0].email,
            receivedTime: daysAgo(0),
            bodyPlain: `Sehr geehrte Damen und Herren,

hiermit beantragen wir die Bestandsübertragung für folgende Kunden:

1. Kunde: Anna Bergmann
   Versicherungsnummer: ERG-1111111
   Sparte: KFZ
   Übertragung zum: 01.02.2026

2. Kunde: Klaus Dietrich
   Versicherungsnummer: ERG-2222222
   Sparte: Hausrat
   Übertragung zum: 01.02.2026

3. Kunde: Monika Eckert
   Versicherungsnummer: ERG-3333333
   Sparte: Haftpflicht
   Übertragung zum: 01.02.2026

Die unterschriebenen Maklervollmachten für alle drei Kunden liegen bei.

Mit freundlichen Grüßen
Thomas Meier
Versicherungsmakler`
        };

        // FALL 21: Aus Sammelmail 1 - Kunde 1
        cases['case-021'] = {
            id: 'case-021',
            createdAt: daysAgo(0),
            updatedAt: daysAgo(0),
            kunde: { name: "Bergmann, Anna", source: "auto", confidence: 0.96 },
            versicherungsnummer: { value: "ERG-1111111", source: "auto", confidence: 0.99 },
            gueltigkeitsdatum: { value: "01.02.2026", source: "auto", confidence: 0.95 },
            status: 'zu-validieren',
            sparte: 'KFZ',
            makler: MAKLER[0],
            notes: "",
            sourceEmailId: sammelmail1Id,
            linkedCaseIds: ['case-022', 'case-023'],
            workflow: {
                mailReceived: daysAgo(0),
                mailUploaded: daysAgo(0),
                kiRecognized: daysAgo(0)
            },
            messages: [sammelmail1],
            statusHistory: [
                { date: daysAgo(0).split('T')[0], from: null, to: 'zu-validieren', note: 'Aus Sammelanfrage erstellt' }
            ]
        };

        // FALL 22: Aus Sammelmail 1 - Kunde 2
        cases['case-022'] = {
            id: 'case-022',
            createdAt: daysAgo(0),
            updatedAt: daysAgo(0),
            kunde: { name: "Dietrich, Klaus", source: "auto", confidence: 0.97 },
            versicherungsnummer: { value: "ERG-2222222", source: "auto", confidence: 0.98 },
            gueltigkeitsdatum: { value: "01.02.2026", source: "auto", confidence: 0.94 },
            status: 'zu-validieren',
            sparte: 'Hausrat',
            makler: MAKLER[0],
            notes: "",
            sourceEmailId: sammelmail1Id,
            linkedCaseIds: ['case-021', 'case-023'],
            workflow: {
                mailReceived: daysAgo(0),
                mailUploaded: daysAgo(0),
                kiRecognized: daysAgo(0)
            },
            messages: [sammelmail1],
            statusHistory: [
                { date: daysAgo(0).split('T')[0], from: null, to: 'zu-validieren', note: 'Aus Sammelanfrage erstellt' }
            ]
        };

        // FALL 23: Aus Sammelmail 1 - Kunde 3
        cases['case-023'] = {
            id: 'case-023',
            createdAt: daysAgo(0),
            updatedAt: daysAgo(0),
            kunde: { name: "Eckert, Monika", source: "auto", confidence: 0.95 },
            versicherungsnummer: { value: "ERG-3333333", source: "auto", confidence: 0.99 },
            gueltigkeitsdatum: { value: "01.02.2026", source: "auto", confidence: 0.93 },
            status: 'zu-validieren',
            sparte: 'Haftpflicht',
            makler: MAKLER[0],
            notes: "",
            sourceEmailId: sammelmail1Id,
            linkedCaseIds: ['case-021', 'case-022'],
            workflow: {
                mailReceived: daysAgo(0),
                mailUploaded: daysAgo(0),
                kiRecognized: daysAgo(0)
            },
            messages: [sammelmail1],
            statusHistory: [
                { date: daysAgo(0).split('T')[0], from: null, to: 'zu-validieren', note: 'Aus Sammelanfrage erstellt' }
            ]
        };

        // ============================================
        // SAMMELMAIL 2: 1 Kunde mit 3 verschiedenen Verträgen
        // Makler: Sandra Schmidt sendet Anfrage für einen Kunden mit 3 Verträgen
        // ============================================
        const sammelmail2Id = 'email-sammel-002';
        const sammelmail2 = {
            entryID: sammelmail2Id,
            folder: 'sent',
            subject: 'Bestandsübertragung Familie Huber - 3 Verträge',
            senderEmail: MAKLER[1].email,
            receivedTime: daysAgo(0),
            bodyPlain: `Sehr geehrte Damen und Herren,

für unseren Kunden Herrn Franz Huber beantragen wir die Übertragung folgender Verträge:

1. KFZ-Versicherung
   Versicherungsnummer: ERG-4444444
   Übertragung zum: 15.02.2026

2. Hausratversicherung
   Versicherungsnummer: ERG-5555555
   Übertragung zum: 15.02.2026

3. Wohngebäudeversicherung
   Versicherungsnummer: ERG-6666666
   Übertragung zum: 15.02.2026

Die Maklervollmacht für alle drei Verträge liegt diesem Schreiben bei.

Mit freundlichen Grüßen
Sandra Schmidt
Versicherungsmaklerin`
        };

        // FALL 24: Aus Sammelmail 2 - Vertrag 1 (KFZ)
        cases['case-024'] = {
            id: 'case-024',
            createdAt: daysAgo(0),
            updatedAt: daysAgo(0),
            kunde: { name: "Huber, Franz", source: "auto", confidence: 0.98 },
            versicherungsnummer: { value: "ERG-4444444", source: "auto", confidence: 0.99 },
            gueltigkeitsdatum: { value: "15.02.2026", source: "auto", confidence: 0.96 },
            status: 'zu-validieren',
            sparte: 'KFZ',
            makler: MAKLER[1],
            notes: "",
            sourceEmailId: sammelmail2Id,
            linkedCaseIds: ['case-025', 'case-026'],
            workflow: {
                mailReceived: daysAgo(0),
                mailUploaded: daysAgo(0),
                kiRecognized: daysAgo(0)
            },
            messages: [sammelmail2],
            statusHistory: [
                { date: daysAgo(0).split('T')[0], from: null, to: 'zu-validieren', note: 'Aus Sammelanfrage erstellt' }
            ]
        };

        // FALL 25: Aus Sammelmail 2 - Vertrag 2 (Hausrat)
        cases['case-025'] = {
            id: 'case-025',
            createdAt: daysAgo(0),
            updatedAt: daysAgo(0),
            kunde: { name: "Huber, Franz", source: "auto", confidence: 0.98 },
            versicherungsnummer: { value: "ERG-5555555", source: "auto", confidence: 0.99 },
            gueltigkeitsdatum: { value: "15.02.2026", source: "auto", confidence: 0.96 },
            status: 'zu-validieren',
            sparte: 'Hausrat',
            makler: MAKLER[1],
            notes: "",
            sourceEmailId: sammelmail2Id,
            linkedCaseIds: ['case-024', 'case-026'],
            workflow: {
                mailReceived: daysAgo(0),
                mailUploaded: daysAgo(0),
                kiRecognized: daysAgo(0)
            },
            messages: [sammelmail2],
            statusHistory: [
                { date: daysAgo(0).split('T')[0], from: null, to: 'zu-validieren', note: 'Aus Sammelanfrage erstellt' }
            ]
        };

        // FALL 26: Aus Sammelmail 2 - Vertrag 3 (Wohngebäude)
        cases['case-026'] = {
            id: 'case-026',
            createdAt: daysAgo(0),
            updatedAt: daysAgo(0),
            kunde: { name: "Huber, Franz", source: "auto", confidence: 0.98 },
            versicherungsnummer: { value: "ERG-6666666", source: "auto", confidence: 0.99 },
            gueltigkeitsdatum: { value: "15.02.2026", source: "auto", confidence: 0.96 },
            status: 'zu-validieren',
            sparte: 'Wohngebäude',
            makler: MAKLER[1],
            notes: "",
            sourceEmailId: sammelmail2Id,
            linkedCaseIds: ['case-024', 'case-025'],
            workflow: {
                mailReceived: daysAgo(0),
                mailUploaded: daysAgo(0),
                kiRecognized: daysAgo(0)
            },
            messages: [sammelmail2],
            statusHistory: [
                { date: daysAgo(0).split('T')[0], from: null, to: 'zu-validieren', note: 'Aus Sammelanfrage erstellt' }
            ]
        };

        return cases;
    }

    /**
     * Demo Import/Export Historie generieren
     */
    function generateDemoImportExportHistory() {
        return [
            {
                date: daysAgo(0),
                type: 'import',
                count: 6,
                user: 'Max Mustermann'
            },
            {
                date: daysAgo(15),
                type: 'export',
                count: 4,
                user: 'Lisa Schmidt'
            },
            {
                date: daysAgo(30),
                type: 'import',
                count: 20,
                user: 'Max Mustermann'
            }
        ];
    }

    /**
     * Demo-Daten laden (falls erster Start oder force=true)
     */
    function loadDemoData(force = false) {
        const settings = Storage.getSettings();

        if (!force && settings.demoLoaded) {
            return false;
        }

        // Generiere frische Demo-Daten
        const demoCases = generateDemoCases();

        // Speichern
        Storage.saveCases(demoCases);
        Storage.saveSettings({ demoLoaded: true });

        // Import/Export Historie speichern
        const demoHistory = generateDemoImportExportHistory();
        localStorage.setItem('importExportHistory', JSON.stringify(demoHistory));

        return true;
    }

    // Deutsche Vornamen und Nachnamen für Generator
    const VORNAMEN = [
        "Thomas", "Michael", "Andreas", "Stefan", "Christian", "Martin", "Peter", "Wolfgang", "Klaus", "Jürgen",
        "Frank", "Markus", "Uwe", "Bernd", "Ralf", "Dieter", "Holger", "Matthias", "Torsten", "Dirk",
        "Sabine", "Petra", "Monika", "Claudia", "Andrea", "Susanne", "Martina", "Birgit", "Heike", "Karin",
        "Nicole", "Stefanie", "Julia", "Christina", "Marion", "Gabriele", "Silke", "Anja", "Melanie", "Sandra",
        "Hans", "Werner", "Helmut", "Heinz", "Gerhard", "Manfred", "Karl", "Walter", "Wilhelm", "Heinrich",
        "Anna", "Maria", "Elisabeth", "Ursula", "Renate", "Helga", "Ingrid", "Erika", "Brigitte", "Gisela"
    ];

    const NACHNAMEN = [
        "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann",
        "Schäfer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Zimmermann",
        "Braun", "Krüger", "Hofmann", "Hartmann", "Lange", "Schmitt", "Werner", "Schmitz", "Krause", "Meier",
        "Lehmann", "Schmid", "Schulze", "Maier", "Köhler", "Herrmann", "König", "Walter", "Mayer", "Huber",
        "Kaiser", "Fuchs", "Peters", "Lang", "Scholz", "Möller", "Weiß", "Jung", "Hahn", "Schubert",
        "Vogel", "Friedrich", "Keller", "Günther", "Frank", "Berger", "Winkler", "Roth", "Beck", "Lorenz"
    ];

    /**
     * 1000 Demo-E-Mails generieren für Massentest
     * ~800 neue Vorgänge, ~200 Reminder, ~100 unvollständig
     */
    function generateDemoExportJSON() {
        const now = new Date();
        const emails = [];
        const usedVsNrs = new Map(); // VS-Nr -> Array von Email-Indizes für Reminder

        function randomElement(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        function randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function generateVsNr() {
            return `ERG-${randomInt(1000000, 9999999)}`;
        }

        function generateName() {
            return `${randomElement(VORNAMEN)} ${randomElement(NACHNAMEN)}`;
        }

        function formatDateGerman(date) {
            const d = date.getDate().toString().padStart(2, '0');
            const m = (date.getMonth() + 1).toString().padStart(2, '0');
            const y = date.getFullYear();
            const h = date.getHours().toString().padStart(2, '0');
            const min = date.getMinutes().toString().padStart(2, '0');
            const s = date.getSeconds().toString().padStart(2, '0');
            return `${d}.${m}.${y} ${h}:${min}:${s}`;
        }

        function formatDateOnlyGerman(date) {
            const d = date.getDate().toString().padStart(2, '0');
            const m = (date.getMonth() + 1).toString().padStart(2, '0');
            const y = date.getFullYear();
            return `${d}.${m}.${y}`;
        }

        function daysAgo(days) {
            const date = new Date(now);
            date.setDate(date.getDate() - days);
            date.setHours(randomInt(7, 18), randomInt(0, 59), randomInt(0, 59));
            return date;
        }

        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16).toUpperCase();
            });
        }

        function generateEntryID() {
            let result = '';
            for (let i = 0; i < 144; i++) {
                result += '0123456789ABCDEF'[Math.floor(Math.random() * 16)];
            }
            return result;
        }

        // E-Mail-Vorlagen
        function generateNewRequestEmail(kunde, vsNr, sparte, makler, datum, includeVsNr, includeKunde, includeDatum) {
            const vsNrText = includeVsNr ? `Versicherungsnummer: ${vsNr}\n` : '';
            const kundeText = includeKunde ? `für unseren Kunden ${kunde}` : 'für den beigefügten Kunden';
            const datumText = includeDatum ? `Gewünschter Übertragungstermin: ${datum}\n` : '';
            const sparteText = sparte ? `Sparte: ${sparte}\n` : '';

            return `Sehr geehrte Damen und Herren,

hiermit beantragen wir die Bestandsübertragung ${kundeText}.

${vsNrText}${sparteText}${datumText}
Die unterschriebene Maklervollmacht liegt diesem Schreiben bei.

Mit freundlichen Grüßen
${makler.name}
Versicherungsmakler`;
        }

        function generateReminderEmail(kunde, vsNr, makler) {
            return `Sehr geehrte Damen und Herren,

ich erlaube mir, nach dem Stand unserer Bestandsübertragung zu fragen.

Kunde: ${kunde}
Versicherungsnummer: ${vsNr}

Über eine zeitnahe Rückmeldung würde ich mich freuen.

Mit freundlichen Grüßen
${makler.name}
Versicherungsmakler`;
        }

        // Schritt 1: ~800 neue Anfragen generieren (davon ~100 unvollständig)
        const newCasesCount = 800;
        const incompleteCount = 100;

        for (let i = 0; i < newCasesCount; i++) {
            const vsNr = generateVsNr();
            const kunde = generateName();
            const makler = randomElement(MAKLER);
            const sparte = randomElement(SPARTEN);
            const receivedDate = daysAgo(randomInt(1, 90));
            const transferDate = new Date(now);
            transferDate.setMonth(transferDate.getMonth() + randomInt(1, 6));
            const transferDateStr = formatDateOnlyGerman(transferDate);

            // Ist diese E-Mail unvollständig?
            const isIncomplete = i < incompleteCount;
            let includeVsNr = true;
            let includeKunde = true;
            let includeDatum = true;

            if (isIncomplete) {
                // Zufällig ein oder mehrere Felder weglassen
                const missingField = randomInt(1, 3);
                if (missingField === 1) includeVsNr = false;
                else if (missingField === 2) includeKunde = false;
                else includeDatum = false;
            }

            const subject = includeVsNr
                ? `Bestandsübertragung ${kunde.split(' ')[1]} ${sparte} - ${vsNr}`
                : `Bestandsübertragung ${sparte}`;

            const email = {
                entryID: generateEntryID(),
                conversationID: generateUUID(),
                subject: subject,
                senderEmail: makler.email,
                receivedTime: formatDateGerman(receivedDate),
                bodyPlain: generateNewRequestEmail(kunde, vsNr, sparte, makler, transferDateStr, includeVsNr, includeKunde, includeDatum),
                folder: 'Inbox'
            };

            emails.push(email);

            // Für Reminder merken (nur vollständige)
            if (includeVsNr && Math.random() < 0.3) {
                usedVsNrs.set(vsNr, { kunde, makler, conversationID: email.conversationID });
            }
        }

        // Schritt 2: ~200 Reminder-E-Mails für bestehende Vorgänge
        const reminderCount = 200;
        const vsNrsForReminder = Array.from(usedVsNrs.entries()).slice(0, reminderCount);

        for (const [vsNr, data] of vsNrsForReminder) {
            const receivedDate = daysAgo(randomInt(1, 30));

            const email = {
                entryID: generateEntryID(),
                conversationID: data.conversationID, // Gleiche Konversation
                subject: `AW: Bestandsübertragung - ${vsNr}`,
                senderEmail: data.makler.email,
                receivedTime: formatDateGerman(receivedDate),
                bodyPlain: generateReminderEmail(data.kunde, vsNr, data.makler),
                folder: 'Inbox'
            };

            emails.push(email);
        }

        // E-Mails nach Datum sortieren (neueste zuerst)
        emails.sort((a, b) => {
            const dateA = parseGermanDateTime(a.receivedTime);
            const dateB = parseGermanDateTime(b.receivedTime);
            return dateB - dateA;
        });

        function parseGermanDateTime(str) {
            const [datePart, timePart] = str.split(' ');
            const [d, m, y] = datePart.split('.');
            const [h, min, s] = timePart.split(':');
            return new Date(y, m - 1, d, h, min, s);
        }

        return {
            exportDate: formatDateGerman(now),
            mailbox: "demo@ergo-maklerservice.de",
            subjectFilter: "Bestandsübertragung",
            totalEmails: emails.length,
            emails: emails
        };
    }

    /**
     * Demo-JSON herunterladen
     */
    function downloadDemoExportJSON() {
        const data = generateDemoExportJSON();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `demo_outlook_export_${data.totalEmails}_emails.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return data.totalEmails;
    }

    // Öffentliche API
    return {
        loadDemoData,
        generateDemoExportJSON,
        downloadDemoExportJSON,
        MAKLER,
        SPARTEN
    };
})();
