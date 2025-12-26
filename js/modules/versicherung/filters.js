/**
 * Versicherung Filters Module
 * ES6 Module for KI filter commands (ES2024)
 */

import { addLandingChatMessage } from './chat.js';
import { openDashboard } from './data.js';

// ========================================
// FILTER FUNCTIONS
// ========================================

export function setAgenturFilter(vermittlerId) {

    if (typeof window.state !== 'undefined') {
        const currentYear = window.state.filters.year;
        window.state.filters = {
            year: currentYear,
            agentur: vermittlerId,
            silo: 'alle',
            segments: ['alle'],
            products: ['alle'],
            bundeslaender: []
        };
    } else {
        localStorage.removeItem('pendingSiloFilter');
        localStorage.removeItem('pendingSegmentFilter');
        localStorage.removeItem('pendingBundeslandFilter');
        localStorage.setItem('pendingAgenturFilter', vermittlerId);
    }
}

export function setSiloFilter(silo) {

    if (typeof window.state !== 'undefined') {
        window.state.filters.silo = silo;
    } else {
        localStorage.setItem('pendingSiloFilter', silo);
    }
}

export function setSegmentFilter(segments) {

    if (typeof window.state !== 'undefined') {
        window.state.filters.segments = segments;
    } else {
        localStorage.setItem('pendingSegmentFilter', JSON.stringify(segments));
    }
}

export function setBundeslandFilter(laender) {

    if (typeof window.state !== 'undefined') {
        window.state.filters.bundeslaender = laender;
    } else {
        localStorage.setItem('pendingBundeslandFilter', JSON.stringify(laender));
    }
}

export function clearAllFilters() {

    if (typeof window.state !== 'undefined') {
        window.state.filters = {
            year: 2024,
            agentur: 'alle',
            silo: 'alle',
            segments: [],
            bundeslaender: []
        };
    } else {
        localStorage.removeItem('pendingAgenturFilter');
        localStorage.removeItem('pendingSiloFilter');
        localStorage.removeItem('pendingSegmentFilter');
        localStorage.removeItem('pendingBundeslandFilter');
    }
}

// ========================================
// COMMAND PARSING
// ========================================

export async function parseAndExecuteCommands(message) {

    let hasExecutedCommands = false;

    // Check for Agentur Overview Command
    const overviewMatch = message.match(/showAgenturOverview\(['"]([^'"]+)['"]\)/);
    if (overviewMatch) {
        const vermittlerId = overviewMatch[1];

        if (typeof window.showAgenturOverview === 'function') {
            window.showAgenturOverview(vermittlerId);
            return true;
        }
    }

    const patterns = {
        setAgenturFilter: /setAgenturFilter\(['"]([^'"]+)['"]\)/gi,
        setSiloFilter: /setSiloFilter\(['"]([^'"]+)['"]\)/gi,
        setSegmentFilter: /setSegmentFilter\(\[([^\]]+)\]\)/gi,
        setBundeslandFilter: /setBundeslandFilter\(\[([^\]]+)\]\)/gi,
        clearAllFilters: /clearAllFilters\(\)/gi
    };

    let match;

    while ((match = patterns.setAgenturFilter.exec(message)) !== null) {
        setAgenturFilter(match[1]);
        hasExecutedCommands = true;
    }

    patterns.setSiloFilter.lastIndex = 0;
    while ((match = patterns.setSiloFilter.exec(message)) !== null) {
        setSiloFilter(match[1]);
        hasExecutedCommands = true;
    }

    patterns.setSegmentFilter.lastIndex = 0;
    while ((match = patterns.setSegmentFilter.exec(message)) !== null) {
        const segments = match[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
        setSegmentFilter(segments);
        hasExecutedCommands = true;
    }

    patterns.setBundeslandFilter.lastIndex = 0;
    while ((match = patterns.setBundeslandFilter.exec(message)) !== null) {
        const laender = match[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
        setBundeslandFilter(laender);
        hasExecutedCommands = true;
    }

    if (patterns.clearAllFilters.test(message)) {
        clearAllFilters();
        hasExecutedCommands = true;
    }

    if (hasExecutedCommands) {
        addLandingChatMessage('system', 'Filter wurden angewendet. Öffne Dashboard...');

        setTimeout(() => {
            openDashboard();
        }, 1500);
    }
}

// ========================================
// STANDARD ANSWERS
// ========================================

export const standardAnswers = {
    'Was kann ich hier machen?': `**Willkommen im Vertriebssteuerungs-Cockpit!**

Hier kannst du:
- **Dashboard öffnen** - Visualisiere deine Versicherungsdaten mit interaktiven Charts
- **CSV-Daten hochladen** - Lade deine eigenen Daten hoch oder nutze den Generator
- **Daten generieren** - Erstelle realistische Testdaten mit dem CSV-Generator
- **KI-Analysen** - Stelle Fragen zu deinen Daten (powered by Claude AI)

Klicke auf "Zur Gesamtübersicht" um loszulegen!`,

    'Zeige mir ein Beispiel Dashboard': `**So funktioniert das Dashboard:**

1. **Klicke auf "Zur Gesamtübersicht"** oben
2. Das Dashboard lädt automatisch mit Beispieldaten
3. Du siehst:
   - KPI-Kacheln (Neugeschäft, Bestand, etc.)
   - Interaktive Charts
   - Deutschland-Karte mit Regionen
   - Filter-Optionen

**Oder:** Generiere eigene Daten mit dem CSV-Generator!`,

    'Wie lade ich Daten hoch?': `**Daten hochladen - 2 Optionen:**

**Option 1: Direkt hier**
- Ziehe eine CSV-Datei in das Upload-Feld oben
- Oder klicke drauf zum Auswählen

**Option 2: Im Dashboard**
- Öffne das Dashboard
- Nutze den Upload-Button oben
- Wähle deine CSV-Datei

**Oder generiere Testdaten:**
- Klicke auf "Test-Daten generieren"
- Wähle Unternehmensgröße
- Download CSV und lade sie hoch`
};

export function askLandingSampleQuestion(question) {

    const sampleQuestions = document.getElementById('landingSampleQuestions');
    if (sampleQuestions) sampleQuestions.style.display = 'none';

    if (standardAnswers[question]) {
        addLandingChatMessage('user', question);

        setTimeout(() => {
            addLandingChatMessage('assistant', standardAnswers[question]);
        }, 300);

        return;
    }

    const chatInput = document.getElementById('landingChatInput');
    if (chatInput) chatInput.value = question;

    window.sendLandingChatMessage?.();
}
