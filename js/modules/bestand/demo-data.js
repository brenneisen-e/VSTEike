/**
 * Bestand Demo Data Module (ES2024)
 * Demo-Daten für Bestandsübertragung Tool
 */

import * as storage from './storage.js';

// ========================================
// CONSTANTS
// ========================================

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

const KUNDEN = [
    "Müller, Hans", "Weber, Christine", "Fischer, Maria", "Schneider, Peter", "Meyer, Anja",
    "Wolf, Klaus", "Bauer, Sabine", "Hoffmann, Thomas", "Krüger, Martina", "Richter, Stefan",
    "Klein, Ursula", "Schäfer, Andreas", "Neumann, Birgit", "Braun, Wolfgang", "Schulze, Petra",
    "Kaiser, Michael", "Lange, Susanne", "Heinrich, Frank", "Keller, Monika", "Vogel, Rainer",
    "Wagner, Gabriele", "Peters, Jürgen", "Brandt, Silvia", "Engel, Werner", "Winter, Helga"
];

// ========================================
// HELPER FUNCTIONS
// ========================================

const daysAgo = (days, baseDate = new Date()) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - days);
    return date.toISOString();
};

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateVsNr = () => `ERG-${randomInt(1000000, 9999999)}`;

const generateEmail = (makler, kunde, vsNr, sparte, folder = 'sent') => ({
    entryID: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    folder,
    subject: `Bestandsübertragung ${kunde.split(',')[0]} ${sparte} - ${vsNr}`,
    senderEmail: folder === 'sent' ? makler.email : 'maklerservice@ergo.de',
    receivedTime: daysAgo(randomInt(1, 90)),
    bodyPlain: folder === 'sent'
        ? `Sehr geehrte Damen und Herren,\n\nhiermit beantragen wir die Bestandsübertragung für unseren Kunden ${kunde.split(',').reverse().join(' ')}.\n\nVersicherungsnummer: ${vsNr}\nSparte: ${sparte}\n\nMit freundlichen Grüßen\n${makler.name}\nVersicherungsmakler`
        : `Sehr geehrte(r) ${makler.name.split(' ')[0]},\n\nwir bestätigen die Bestandsübertragung für den Vertrag ${vsNr}.\n\nMit freundlichen Grüßen\nERGO Maklerservice`
});

// ========================================
// DEMO CASE GENERATION
// ========================================

const generateDemoCase = (id, status, daysOffset = 0) => {
    const kunde = randomElement(KUNDEN);
    const makler = randomElement(MAKLER);
    const sparte = randomElement(SPARTEN);
    const vsNr = generateVsNr();
    const createdAt = daysAgo(randomInt(1, 60) + daysOffset);

    const workflow = {
        mailReceived: createdAt,
        mailUploaded: daysAgo(randomInt(0, 5), new Date(createdAt)),
        kiRecognized: status !== 'unvollstaendig' ? daysAgo(randomInt(0, 3), new Date(createdAt)) : null,
        pvValidated: ['export-bereit', 'abgeschlossen'].includes(status) ? daysAgo(randomInt(0, 10)) : null,
        exported: status === 'abgeschlossen' ? daysAgo(randomInt(0, 5)) : null
    };

    const messages = [generateEmail(makler, kunde, vsNr, sparte, 'sent')];
    if (['export-bereit', 'abgeschlossen'].includes(status)) {
        messages.push(generateEmail(makler, kunde, vsNr, sparte, 'inbox'));
    }

    return {
        id,
        createdAt,
        updatedAt: daysAgo(randomInt(0, 10)),
        kunde: { name: kunde, source: 'auto', confidence: 0.9 + Math.random() * 0.09 },
        versicherungsnummer: { value: vsNr, source: 'auto', confidence: 0.95 + Math.random() * 0.04 },
        gueltigkeitsdatum: { value: `01.0${randomInt(1, 9)}.2026`, source: 'auto', confidence: 0.85 + Math.random() * 0.1 },
        status,
        sparte,
        makler,
        notes: '',
        workflow,
        exported: status === 'abgeschlossen' ? { date: workflow.exported, by: 'System' } : null,
        messages,
        statusHistory: [{ date: createdAt.split('T')[0], from: null, to: status, note: 'Aus E-Mail erstellt' }]
    };
};

export const generateDemoCases = () => {
    const cases = {};
    let id = 1;

    // Status distribution
    const statusDistribution = [
        { status: 'abgeschlossen', count: 3 },
        { status: 'export-bereit', count: 5 },
        { status: 'zu-validieren', count: 8 },
        { status: 'unvollstaendig', count: 4 },
        { status: 'abgelehnt', count: 2 },
        { status: 'wiedervorlage', count: 4 }
    ];

    statusDistribution.forEach(({ status, count }) => {
        for (let i = 0; i < count; i++) {
            const caseId = `case-${String(id).padStart(3, '0')}`;
            cases[caseId] = generateDemoCase(caseId, status, i * 5);
            id++;
        }
    });

    return cases;
};

// ========================================
// LOAD/DOWNLOAD FUNCTIONS
// ========================================

export const loadDemoData = (force = false) => {
    const existingCases = storage.getCases();
    if (Object.keys(existingCases).length > 0 && !force) return false;

    const demoCases = generateDemoCases();
    Object.values(demoCases).forEach(c => storage.saveCase(c));

    console.log(`${Object.keys(demoCases).length} Demo-Vorgänge geladen`);
    return true;
};

export const generateMassEmails = (count = 1000) => {
    const emails = [];
    for (let i = 0; i < count; i++) {
        const kunde = randomElement(KUNDEN);
        const makler = randomElement(MAKLER);
        const sparte = randomElement(SPARTEN);
        const vsNr = generateVsNr();
        emails.push(generateEmail(makler, kunde, vsNr, sparte, Math.random() > 0.3 ? 'sent' : 'inbox'));
    }
    return emails;
};

export const downloadDemoExportJSON = () => {
    const emails = generateMassEmails(1000);
    const conversations = {};

    emails.forEach(email => {
        const convId = `conv-${email.subject.replace(/\s+/g, '-').toLowerCase().substr(0, 50)}-${Math.random().toString(36).substr(2, 6)}`;
        (conversations[convId] ??= { messages: [] }).messages.push(email);
    });

    const data = { conversations, exportedAt: new Date().toISOString(), count: emails.length };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `outlook_export_demo_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return emails.length;
};
