
function openPotentialAnalyse() {
    console.log('📊 Potentialanalyse öffnen...');

    // Verstecke alle Seiten
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'none';
    const kundenDetail = document.getElementById('kundenDetailPage');
    if (kundenDetail) kundenDetail.style.display = 'none';

    // Zeige Potentialanalyse
    document.getElementById('potentialAnalysePage').style.display = 'block';

    // Reset Filter
    currentPotentialFilter = null;
    updatePotentialFilter();
}

function openPotentialAnalyseWithFilter(productId, productName) {
    console.log('📊 Potentialanalyse öffnen mit Filter:', productId);

    // Verstecke alle Seiten
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'none';
    const kundenDetail = document.getElementById('kundenDetailPage');
    if (kundenDetail) kundenDetail.style.display = 'none';

    // Zeige Potentialanalyse
    document.getElementById('potentialAnalysePage').style.display = 'block';

    // Setze Filter
    currentPotentialFilter = productId;
    const filterSelect = document.getElementById('potentialProductFilter');
    if (filterSelect) {
        filterSelect.value = productId;
    }
    updatePotentialFilter();
}

function closePotentialAnalyse() {
    document.getElementById('potentialAnalysePage').style.display = 'none';
    document.getElementById('landingPage').style.display = 'flex';
    currentPotentialFilter = null;
}

function showEigeneDaten() {
    document.getElementById('eigeneDatenContainer').style.display = 'block';
    document.getElementById('fidaContainer').style.display = 'none';
    document.getElementById('eigeneDatenBtn').classList.add('active');
    document.getElementById('fidaBtn').classList.remove('active');
}

function showFidaDaten() {
    // Open Finance erweitert die eigenen Daten - beide anzeigen
    document.getElementById('eigeneDatenContainer').style.display = 'block';
    document.getElementById('fidaContainer').style.display = 'block';
    document.getElementById('eigeneDatenBtn').classList.remove('active');
    document.getElementById('fidaBtn').classList.add('active');
}

function updatePotentialFilter() {
    const filter = currentPotentialFilter;

    // Wenn kein Filter aktiv ist, gruppierte Ansicht zeigen
    if (!filter) {
        renderGroupedPotentials('eigeneDatenTable');
        renderGroupedPotentials('fidaTable');
    } else {
        // Bei aktivem Filter: Flache Ansicht mit Filter
        renderFlatPotentials('eigeneDatenTable', filter);
        renderFlatPotentials('fidaTable', filter);
    }

    // Update aktiven Filter-Button
    const filterBtns = document.querySelectorAll('.potential-filter-btn');
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
}

// Rendert die Tabelle mit Gruppierung nach Hauptsegmenten (Leben, Kranken, SHU, Kfz)
function renderGroupedPotentials(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    // Header in gruppierter Ansicht ausblenden
    const thead = table.querySelector('thead');
    if (thead) thead.style.display = 'none';

    // Sammle alle Original-Zeilen (ohne Gruppen-Zeilen)
    const originalRows = Array.from(tbody.querySelectorAll('tr:not(.potential-group-row)'));
    if (originalRows.length === 0) return;

    // Speichere Original-HTML falls noch nicht geschehen
    if (!tbody.dataset.originalHtml) {
        tbody.dataset.originalHtml = tbody.innerHTML;
    }

    // Mapping von Produkten zu Hauptsegmenten
    const productToSegment = {
        // Leben
        'bu': 'leben',
        'leben': 'leben',
        'altersvorsorge': 'leben',
        // Kranken
        'pflege': 'kranken',
        'kranken': 'kranken',
        // SHU (Sach/Haftpflicht/Unfall)
        'hausrat': 'shu',
        'haftpflicht': 'shu',
        'unfall': 'shu',
        'rechtsschutz': 'shu',
        'sach': 'shu',
        'wohngebaeude': 'shu',
        // Kfz
        'kfz': 'kfz'
    };

    // Hauptsegment-Namen, Reihenfolge und Icons
    const mainSegments = {
        'leben': {
            name: 'Leben',
            order: 1,
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
        },
        'kranken': {
            name: 'Kranken',
            order: 2,
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>'
        },
        'shu': {
            name: 'Sach / Haftpflicht / Unfall',
            order: 3,
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
        },
        'kfz': {
            name: 'Kfz',
            order: 4,
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"></path><path d="M3 17h2m14 0h2M5 17H3v-4l2-5h10l4 5v4h-2"></path></svg>'
        }
    };

    // Parse Original-HTML und gruppiere
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = '<table><tbody>' + tbody.dataset.originalHtml + '</tbody></table>';
    const rows = Array.from(tempDiv.querySelectorAll('tr'));

    const groups = {};

    rows.forEach(row => {
        const badge = row.querySelector('.potential-badge');
        if (badge) {
            // Finde Produkt-Klasse
            const classes = Array.from(badge.classList);
            const product = classes.find(c => c !== 'potential-badge') || 'sonstige';

            // Mappe zu Hauptsegment
            const mainSegment = productToSegment[product] || 'shu';

            if (!groups[mainSegment]) {
                groups[mainSegment] = [];
            }

            // Ermittle Priorität
            const priorityEl = row.querySelector('.priority');
            let priority = 'medium';
            if (priorityEl) {
                if (priorityEl.classList.contains('high')) priority = 'high';
                else if (priorityEl.classList.contains('low')) priority = 'low';
            }

            // Ermittle Kundenname für Sortierung
            const firstCell = row.querySelector('td');
            const kundenName = firstCell ? firstCell.textContent.trim() : '';

            groups[mainSegment].push({
                html: row.outerHTML,
                priority: priority,
                kundenName: kundenName,
                product: product
            });
        }
    });

    // Sortiere Segmente nach definierter Reihenfolge
    const sortedSegments = Object.keys(groups).sort((a, b) => {
        const orderA = mainSegments[a]?.order || 99;
        const orderB = mainSegments[b]?.order || 99;
        return orderA - orderB;
    });

    // Ermittle Spaltenanzahl aus Tabellen-Header
    const colCount = table.querySelectorAll('thead th').length || 5;

    // Baue neue Tabellen-Struktur
    let newHtml = '';

    sortedSegments.forEach(segment => {
        const items = groups[segment];

        // Sortiere Vorgänge alphabetisch nach Kundenname
        items.sort((a, b) => a.kundenName.localeCompare(b.kundenName));

        // Zähle Prioritäten
        const highCount = items.filter(i => i.priority === 'high').length;
        const mediumCount = items.filter(i => i.priority === 'medium').length;
        const lowCount = items.filter(i => i.priority === 'low').length;

        const segmentInfo = mainSegments[segment] || { name: segment, icon: '' };

        // Gruppen-Zeile
        newHtml += `
            <tr class="potential-group-row" data-segment="${segment}" onclick="togglePotentialGroup(this)">
                <td colspan="${colCount}">
                    <div class="group-toggle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <span class="segment-badge segment-${segment}">${segmentInfo.icon || ''}${segmentInfo.name}</span>
                        <span class="group-count">${items.length}</span>
                        <div class="group-priorities">
                            ${highCount > 0 ? `<span class="priority-count high">${highCount} Hoch</span>` : ''}
                            ${mediumCount > 0 ? `<span class="priority-count medium">${mediumCount} Mittel</span>` : ''}
                            ${lowCount > 0 ? `<span class="priority-count low">${lowCount} Niedrig</span>` : ''}
                        </div>
                    </div>
                </td>
            </tr>
        `;

        // Detail-Zeilen
        items.forEach(item => {
            // Füge Klasse für versteckte Zeilen hinzu - berücksichtige existierende class-Attribute
            let rowHtml = item.html;
            if (rowHtml.includes('class="')) {
                // Existierende class erweitern
                rowHtml = rowHtml.replace(/class="([^"]*)"/, `class="$1 potential-detail-row" data-segment="${segment}"`);
            } else {
                // Neue class hinzufügen
                rowHtml = rowHtml.replace('<tr', `<tr class="potential-detail-row" data-segment="${segment}"`);
            }
            newHtml += rowHtml;
        });
    });

    tbody.innerHTML = newHtml;
}

// Rendert die Tabelle flach (ohne Gruppierung) mit optionalem Filter
function renderFlatPotentials(tableId, filter) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    // Header bei gefilterter Ansicht wieder einblenden
    const thead = table.querySelector('thead');
    if (thead) thead.style.display = '';

    // Stelle Original-HTML wieder her falls vorhanden
    if (tbody.dataset.originalHtml) {
        tbody.innerHTML = tbody.dataset.originalHtml;
    }

    // Wende Filter an
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        if (!filter) {
            row.style.display = '';
        } else {
            const badge = row.querySelector('.potential-badge');
            if (badge && badge.classList.contains(filter)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

// Toggle Gruppen-Zeilen ein/aus
function togglePotentialGroup(groupRow) {
    const segment = groupRow.dataset.segment;
    const isExpanded = groupRow.classList.contains('expanded');

    groupRow.classList.toggle('expanded');

    // Finde alle Detail-Zeilen dieser Gruppe
    const table = groupRow.closest('table');
    const detailRows = table.querySelectorAll(`.potential-detail-row[data-segment="${segment}"]`);

    detailRows.forEach(row => {
        row.classList.toggle('visible', !isExpanded);
    });
}

function filterPotentials(productId) {
    currentPotentialFilter = productId === 'alle' ? null : productId;
    updatePotentialFilter();
}

// Globale Funktion für Toggle
window.togglePotentialGroup = togglePotentialGroup;

// ========================================
// KUNDENDETAIL SEITE
// ========================================

// Speichert ob FIDA in der Potentialanalyse aktiv war
let fidaActiveInPotentialAnalyse = false;

function openKundenDetail(kundenName, vermittlerId) {
    console.log('👤 Kundendetail öffnen:', kundenName, vermittlerId);

    // Prüfe ob FIDA in der Potentialanalyse aktiv ist (mehrere Checks für Zuverlässigkeit)
    const fidaBtn = document.getElementById('fidaBtn');
    const fidaContainer = document.getElementById('fidaContainer');

    // FIDA ist aktiv wenn Container sichtbar ist (display: block)
    const fidaContainerDisplay = fidaContainer ? fidaContainer.style.display : 'none';
    fidaActiveInPotentialAnalyse = (fidaContainerDisplay === 'block');
    console.log('📊 FIDA Check - Container display:', fidaContainerDisplay, '| FIDA aktiv:', fidaActiveInPotentialAnalyse);

    // Verstecke alle Seiten
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('potentialAnalysePage').style.display = 'none';
    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'none';

    // Zeige Kundendetail-Seite
    const kundenDetail = document.getElementById('kundenDetailPage');
    if (kundenDetail) {
        kundenDetail.style.display = 'block';

        // Setze initiale Makler/AO-Ansicht
        kundenDetail.classList.remove('makler-view', 'ao-view');
        kundenDetail.classList.add(currentVermittlerMode === 'makler' ? 'makler-view' : 'ao-view');

        // Fülle Kundendaten
        fillKundenDetail(kundenName, vermittlerId);

        // Aktiviere FIDA in Kundendetail wenn es in Potentialanalyse aktiv war
        initKundenFidaState();
    }
}

// Initialisiert den FIDA-Status in der Kundendetail-Seite
function initKundenFidaState() {
    const fidaDaten = document.getElementById('kundenFidaDaten');
    const fidaBtn = document.getElementById('kundenFidaBtn');

    if (fidaActiveInPotentialAnalyse) {
        // FIDA aktivieren
        if (fidaDaten) fidaDaten.style.display = 'block';
        if (fidaBtn) {
            fidaBtn.classList.add('active');
            fidaBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> Open Finance aktiv';
        }
        console.log('✅ FIDA in Kundendetail aktiviert');
    } else {
        // FIDA deaktivieren (Standard)
        if (fidaDaten) fidaDaten.style.display = 'none';
        if (fidaBtn) {
            fidaBtn.classList.remove('active');
            fidaBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> Open Finance';
        }
    }
}

// Speichert den aktuellen Vermittlermodus (makler/ao)
let currentVermittlerMode = 'makler';

// Wechselt zwischen Makler und AO Modus
function switchVermittlerMode(mode) {
    currentVermittlerMode = mode;
    console.log('🔄 Vermittlermodus gewechselt zu:', mode);

    // Toggle-Buttons aktualisieren
    const toggleBtns = document.querySelectorAll('.toggle-option');
    toggleBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });

    // Produktvorschläge Label aktualisieren
    const label = document.getElementById('produktvorschlaegeLabel');
    if (label) {
        if (mode === 'makler') {
            label.textContent = 'Top-Produktvorschläge (Makler-Vergleich)';
        } else {
            label.textContent = 'ERGO Produktempfehlung (Ausschließlichkeit)';
        }
    }

    // Produktvorschläge anzeigen/verstecken
    const maklerProdukte = document.getElementById('maklerProdukte');
    const aoProdukte = document.getElementById('aoProdukte');

    if (maklerProdukte && aoProdukte) {
        if (mode === 'makler') {
            maklerProdukte.style.display = 'flex';
            aoProdukte.style.display = 'none';
        } else {
            maklerProdukte.style.display = 'none';
            aoProdukte.style.display = 'flex';
        }
    }

    // Bei AO-Modus: Fremdprodukte in der Open Finance Tabelle anpassen
    updateOpenFinanceTable(mode);

    // Makler/AO-Ansicht für Betreute Verträge Tabelle
    const kundenDetailPage = document.getElementById('kundenDetailPage');
    if (kundenDetailPage) {
        kundenDetailPage.classList.remove('makler-view', 'ao-view');
        kundenDetailPage.classList.add(mode === 'makler' ? 'makler-view' : 'ao-view');
    }
}

// Passt die Open Finance Tabelle je nach Modus an
function updateOpenFinanceTable(mode) {
    // Bei AO (ERGO) sollten die ERGO-Produkte ausgeblendet werden
    // da diese als eigene Produkte gelten und nicht als "Fremdprodukte" angezeigt werden
    console.log('📊 Open Finance Tabelle für Modus:', mode);

    const ergoRows = document.querySelectorAll('tr[data-anbieter="ergo"]');
    const sourceTag = document.querySelector('.fida-source-tag');

    ergoRows.forEach(row => {
        if (mode === 'ao') {
            row.style.display = 'none';
        } else {
            row.style.display = '';
        }
    });

    // Source Tag aktualisieren
    if (sourceTag) {
        if (mode === 'ao') {
            sourceTag.textContent = 'Allianz, HUK24, ARAG (ohne ERGO)';
        } else {
            sourceTag.textContent = 'Allianz, ERGO, HUK24, ARAG';
        }
    }
}

function closeKundenDetail() {
    document.getElementById('kundenDetailPage').style.display = 'none';
    document.getElementById('potentialAnalysePage').style.display = 'block';
}

function fillKundenDetail(kundenName, vermittlerId) {
    // Stammdaten füllen
    const nameEl = document.getElementById('kundenName');
    if (nameEl) nameEl.textContent = kundenName;

    const idEl = document.getElementById('kundenVermittlerId');
    if (idEl) idEl.textContent = vermittlerId;

    // Mock-Daten für Demo
    const mockKunden = {
        'Peter Schmidt': {
            geburtsdatum: '15.03.1985',
            adresse: 'Musterstraße 123, 12345 Musterstadt',
            telefon: '+49 123 456789',
            email: 'peter.schmidt@email.de',
            beruf: 'Angestellter',
            familienstand: 'Verheiratet',
            kinder: [{ name: 'Lena', alter: 8 }, { name: 'Paul', alter: 5 }],
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.500/Mon., Endalter 67, ohne Ausschlüsse', praemie: '€89/Mon.', beginn: '01.03.2018', status: 'Aktiv' },
                { typ: 'Wohngebäudeversicherung', versicherer: 'VHV', details: 'Vers.-Summe: €450.000, inkl. Elementar, gleitender Neuwert', praemie: '€450/Jahr', beginn: '15.06.2019', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Sparkasse', typ: 'Girokonto', info: 'Hauptkonto' },
                { anbieter: 'ING DiBa', typ: 'Tagesgeld', info: 'Sparkonto' },
                { anbieter: 'DWS', typ: 'Depot', info: 'Fondssparen' }
            ]
        },
        'Sabine König': {
            geburtsdatum: '08.11.1979',
            adresse: 'Lindenweg 7, 60329 Frankfurt',
            telefon: '+49 69 7654321',
            email: 'sabine.koenig@email.de',
            beruf: 'Lehrerin',
            familienstand: 'Geschieden',
            kinder: [{ name: 'Max', alter: 12 }],
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.800/Mon., Endalter 67', praemie: '€95/Mon.', beginn: '01.09.2015', status: 'Aktiv' },
                { typ: 'Unfallversicherung', versicherer: 'Helvetia', details: 'Invalidität €100.000, Progression 350%', praemie: '€180/Jahr', beginn: '01.01.2020', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Volksbank', typ: 'Girokonto', info: 'Gehaltskonto' },
                { anbieter: 'DKB', typ: 'Tagesgeld', info: 'Notgroschen' }
            ]
        },
        'Thomas Weber': {
            geburtsdatum: '25.04.1990',
            adresse: 'Bergstraße 22, 80331 München',
            telefon: '+49 89 1234567',
            email: 'thomas.weber@email.de',
            beruf: 'Software-Entwickler',
            familienstand: 'Ledig',
            kinder: [],
            vertraege: [
                { typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Single, €50 Mio. Deckung', praemie: '€65/Jahr', beginn: '01.03.2021', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'N26', typ: 'Girokonto', info: 'Hauptkonto' },
                { anbieter: 'Trade Republic', typ: 'Depot', info: 'ETF-Sparplan €500/Mon.' },
                { anbieter: 'Scalable Capital', typ: 'Depot', info: 'Einzelaktien' }
            ]
        },
        'Anna Hoffmann': {
            geburtsdatum: '03.06.1988',
            adresse: 'Rosenstraße 15, 50667 Köln',
            telefon: '+49 221 9876543',
            email: 'anna.hoffmann@email.de',
            beruf: 'Marketing-Managerin',
            familienstand: 'Verheiratet',
            kinder: [{ name: 'Sophie', alter: 3 }, { name: 'Emma', alter: 1 }],
            vertraege: [
                { typ: 'Risikolebensversicherung', versicherer: 'ERGO', details: 'Vers.-Summe: €300.000, Laufzeit bis 2045', praemie: '€25/Mon.', beginn: '01.07.2020', status: 'Aktiv' },
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Alte Leipziger', details: 'BU-Rente: €2.000/Mon., Endalter 67', praemie: '€110/Mon.', beginn: '01.01.2019', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Commerzbank', typ: 'Girokonto', info: 'Familienkonto' },
                { anbieter: 'Consorsbank', typ: 'Depot', info: 'Kindersparen' }
            ]
        },
        'Michael Braun': {
            geburtsdatum: '17.09.1975',
            adresse: 'Industriestraße 88, 70173 Stuttgart',
            telefon: '+49 711 5432167',
            email: 'michael.braun@email.de',
            beruf: 'Geschäftsführer',
            familienstand: 'Verheiratet',
            kinder: [{ name: 'Lukas', alter: 18 }, { name: 'Jana', alter: 15 }],
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €3.500/Mon., Endalter 65', praemie: '€220/Mon.', beginn: '01.06.2010', status: 'Aktiv' },
                { typ: 'Wohngebäudeversicherung', versicherer: 'Axa', details: 'Vers.-Summe: €750.000, inkl. Elementar', praemie: '€680/Jahr', beginn: '01.01.2012', status: 'Aktiv' },
                { typ: 'Rechtsschutzversicherung', versicherer: 'ERGO', details: 'Premium inkl. Beruf, Verkehr, Privat', praemie: '€380/Jahr', beginn: '01.04.2018', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Deutsche Bank', typ: 'Girokonto', info: 'Geschäftskonto' },
                { anbieter: 'Deka', typ: 'Depot', info: 'Vermögensaufbau €180.000' },
                { anbieter: 'Bausparkasse Schwäbisch Hall', typ: 'Bausparvertrag', info: 'Zuteilungsreif' }
            ]
        },
        'Lisa Müller': {
            geburtsdatum: '29.12.1992',
            adresse: 'Parkallee 5, 20095 Hamburg',
            telefon: '+49 40 8765432',
            email: 'lisa.mueller@email.de',
            beruf: 'Ärztin (Assistenz)',
            familienstand: 'In Partnerschaft',
            kinder: [],
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €2.500/Mon., Dienstunfähigkeitsklausel', praemie: '€145/Mon.', beginn: '01.08.2022', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Comdirect', typ: 'Girokonto', info: 'Gehaltskonto' },
                { anbieter: 'ING', typ: 'Extra-Konto', info: 'Tagesgeld €15.000' },
                { anbieter: 'KfW', typ: 'Studienkredit', info: 'Restschuld €18.000' }
            ]
        },
        'Klaus Meier': {
            geburtsdatum: '22.07.1978',
            adresse: 'Hauptstraße 45, 54321 Beispielstadt',
            telefon: '+49 987 654321',
            email: 'klaus.meier@email.de',
            beruf: 'Selbstständig (Handwerk)',
            familienstand: 'Verheiratet',
            kinder: [{ name: 'Tim', alter: 10 }, { name: 'Mia', alter: 7 }],
            vertraege: [
                { typ: 'Betriebshaftpflicht', versicherer: 'ERGO', details: '€5 Mio. Deckung, Handwerksbetrieb', praemie: '€890/Jahr', beginn: '01.01.2015', status: 'Aktiv' },
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Nürnberger', details: 'BU-Rente: €2.000/Mon., Handwerker-Tarif', praemie: '€135/Mon.', beginn: '01.03.2016', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Commerzbank', typ: 'Geschäftskonto', info: 'Betriebskonto' },
                { anbieter: 'Union Investment', typ: 'Riester', info: 'Altersvorsorge €45.000' }
            ]
        },
        'Matthias Engel': {
            geburtsdatum: '14.08.1982',
            adresse: 'Schillerstraße 78, 45127 Essen',
            telefon: '+49 201 3456789',
            email: 'matthias.engel@email.de',
            beruf: 'IT-Consultant',
            familienstand: 'Verheiratet',
            kinder: [{ name: 'Jonas', alter: 6 }, { name: 'Lea', alter: 4 }],
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Allianz', details: 'BU-Rente: €1.200/Mon., Endalter 65 - UNTERDECKT', praemie: '€75/Mon.', beginn: '01.04.2015', status: 'Aktiv' },
                { typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Familie, €50 Mio. Deckung', praemie: '€85/Jahr', beginn: '01.01.2018', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Sparkasse Essen', typ: 'Girokonto', info: 'Gehalt €4.200 netto/Mon.' },
                { anbieter: 'ING', typ: 'Depot', info: 'ETF-Sparplan €400/Mon.' },
                { anbieter: 'Allianz', typ: 'BU-Versicherung', info: 'Nur €1.200/Mon. - Deckungslücke!' }
            ]
        },
        'Christian Bauer': {
            geburtsdatum: '23.01.1989',
            adresse: 'Königsallee 15, 40212 Düsseldorf',
            telefon: '+49 211 9876543',
            email: 'christian.bauer@email.de',
            beruf: 'Projektmanager',
            familienstand: 'Ledig',
            kinder: [],
            vertraege: [
                { typ: 'Rechtsschutzversicherung', versicherer: 'ERGO', details: 'Beruf & Privat, €300 SB', praemie: '€280/Jahr', beginn: '01.06.2021', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Commerzbank', typ: 'Girokonto', info: 'Gehalt €3.800 netto/Mon.' },
                { anbieter: 'Trade Republic', typ: 'Depot', info: 'Aktien €45.000' },
                { anbieter: 'keine', typ: 'BU-Versicherung', info: 'NICHT VORHANDEN!' }
            ]
        },
        'Martin Wolf': {
            geburtsdatum: '05.05.1987',
            adresse: 'Handwerkerweg 9, 44135 Dortmund',
            telefon: '+49 231 7654321',
            email: 'martin.wolf@email.de',
            beruf: 'Dachdecker (Meister)',
            familienstand: 'Verheiratet',
            kinder: [{ name: 'Felix', alter: 9 }, { name: 'Marie', alter: 7 }, { name: 'Ben', alter: 3 }],
            vertraege: [
                { typ: 'Unfallversicherung', versicherer: 'ERGO', details: 'Invalidität €150.000, Progression 500%', praemie: '€320/Jahr', beginn: '01.03.2017', status: 'Aktiv' },
                { typ: 'Wohngebäudeversicherung', versicherer: 'VHV', details: 'Vers.-Summe: €380.000, inkl. Elementar', praemie: '€520/Jahr', beginn: '01.07.2016', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Volksbank Dortmund', typ: 'Girokonto', info: 'Gehalt €3.200 netto/Mon.' },
                { anbieter: 'Bausparkasse LBS', typ: 'Bausparvertrag', info: 'Ansparphase €28.000' },
                { anbieter: 'keine', typ: 'BU-Versicherung', info: 'NICHT VORHANDEN - Hochrisiko-Beruf!' }
            ]
        },
        'Eva Hartmann': {
            geburtsdatum: '19.11.1991',
            adresse: 'Kunststraße 33, 50674 Köln',
            telefon: '+49 221 1234567',
            email: 'eva.hartmann@email.de',
            beruf: 'Grafikdesignerin (selbstständig)',
            familienstand: 'In Partnerschaft',
            kinder: [{ name: 'Mila', alter: 2 }],
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.000/Mon., Endalter 67 - Aufstockung empfohlen', praemie: '€68/Mon.', beginn: '01.09.2019', status: 'Aktiv' },
                { typ: 'Betriebshaftpflicht', versicherer: 'Hiscox', details: '€2 Mio. Deckung, Freelancer-Tarif', praemie: '€290/Jahr', beginn: '01.01.2020', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'N26', typ: 'Geschäftskonto', info: 'Selbstständigen-Einkommen variabel' },
                { anbieter: 'ING', typ: 'Tagesgeld', info: 'Rücklage €12.000' },
                { anbieter: 'KfW', typ: 'Gründerkredit', info: 'Restschuld €15.000' }
            ]
        }
    };

    const kunde = mockKunden[kundenName] || mockKunden['Peter Schmidt'];

    // Stammdaten
    document.getElementById('kundenGeburtsdatum').textContent = kunde.geburtsdatum;
    document.getElementById('kundenAdresse').textContent = kunde.adresse;
    document.getElementById('kundenTelefon').textContent = kunde.telefon;
    document.getElementById('kundenEmail').textContent = kunde.email;
    document.getElementById('kundenBeruf').textContent = kunde.beruf;
    document.getElementById('kundenFamilienstand').textContent = kunde.familienstand;

    // Kinder
    const kinderList = document.getElementById('kundenKinder');
    if (kinderList) {
        if (kunde.kinder.length > 0) {
            kinderList.innerHTML = kunde.kinder.map(k =>
                `<span class="kinder-badge">${k.name} (${k.alter} Jahre)</span>`
            ).join('');
        } else {
            kinderList.innerHTML = '<span class="no-children">Keine Kinder</span>';
        }
    }

    // Verträge
    const vertraegeBody = document.getElementById('kundenVertraege');
    if (vertraegeBody) {
        vertraegeBody.innerHTML = kunde.vertraege.map(v => `
            <tr>
                <td><strong>${v.typ}</strong></td>
                <td class="makler-only-col">${v.versicherer || ''}</td>
                <td>${v.details || ''}</td>
                <td>${v.praemie}</td>
                <td>${v.beginn || ''}</td>
                <td><span class="status-badge aktiv">${v.status}</span></td>
            </tr>
        `).join('');
    }

    // FIDA Verträge
    const fidaBody = document.getElementById('kundenFidaVertraege');
    if (fidaBody) {
        fidaBody.innerHTML = kunde.fidaVertraege.map(v => `
            <tr>
                <td>${v.anbieter}</td>
                <td>${v.typ}</td>
                <td>${v.info}</td>
            </tr>
        `).join('');
    }
}

// ========================================
// KUNDEN TAB NAVIGATION
// ========================================

function switchKundenTab(tabName) {
    // Alle Tabs deaktivieren
    document.querySelectorAll('.kunden-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Alle Tab-Inhalte verstecken
    document.querySelectorAll('.kunden-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Aktiven Tab markieren
    const activeTab = document.querySelector(`.kunden-tab[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Tab-Inhalt anzeigen
    const tabContent = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    if (tabContent) {
        tabContent.classList.add('active');
    }

    console.log('Tab gewechselt zu:', tabName);
}

// Toggle Impuls Detail
function toggleImpulsDetail(impulsId) {
    const detailElement = document.getElementById(impulsId);
    if (detailElement) {
        const isVisible = detailElement.style.display !== 'none';
        detailElement.style.display = isVisible ? 'none' : 'block';

        // Rotate the expand icon
        const parentItem = detailElement.previousElementSibling;
        if (parentItem) {
            const expandIcon = parentItem.querySelector('.impuls-expand');
            if (expandIcon) {
                expandIcon.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        }
    }
}

// Kommunikation ansehen
function viewKommunikation(kommId) {
    console.log('Kommunikation ansehen:', kommId);

    // Mock-Daten für Kommunikation
    const kommunikationen = {
        'email-1': {
            typ: 'E-Mail',
            datum: '28.11.2025, 09:15',
            betreff: 'Kfz-Versicherung: Ihr Vertrag läuft aus',
            inhalt: `Sehr geehrter Herr Mustermann,

Ihr Kfz-Vertrag bei der Allianz (Kennzeichen: M-AB 1234) läuft am 31.12.2025 aus.

Basierend auf Ihrer Schadenfreiheitsklasse SF12 und Ihren Fahrzeugdaten haben wir ein attraktives Angebot für Sie:

- Haftpflicht + Vollkasko: €520/Jahr (statt €680 aktuell)
- Ersparnis: €160/Jahr

Interesse? Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an.

Mit freundlichen Grüßen
Ihre Versicherungsagentur`,
            status: 'Geöffnet am 28.11.2025, 14:32'
        },
        'brief-1': {
            typ: 'Brief',
            datum: '15.11.2025',
            betreff: 'Open Finance Datenfreigabe: Neue Potentiale erkannt',
            inhalt: `Sehr geehrter Herr Mustermann,

vielen Dank für Ihre Open Finance Datenfreigabe vom 15.03.2024.

Basierend auf der Analyse Ihrer Finanzdaten haben wir folgende Optimierungsmöglichkeiten identifiziert:

1. Risikolebensversicherung
   Ihre Hypothek (€320.000) ist derzeit nicht abgesichert.

2. Private Altersvorsorge
   Bei Ihrer Sparrate von €800/Monat können wir Ihre Rentenlücke schließen.

Wir würden uns freuen, diese Möglichkeiten in einem persönlichen Gespräch mit Ihnen zu besprechen.

Mit freundlichen Grüßen
Ihre Versicherungsagentur`,
            status: 'Versendet'
        },
        'call-1': {
            typ: 'Telefonat',
            datum: '10.11.2025, 11:20',
            betreff: 'Rückruf wegen Altersvorsorge-Angebot',
            inhalt: `Gesprächsnotiz:

Kunde rief zurück wegen Brief vom 15.11.

- Interesse an fondsgebundener Rentenversicherung
- Möchte Angebot mit verschiedenen Fonds-Optionen
- Bevorzugt nachhaltige ETFs
- Budget: ca. €400/Monat zusätzlich zur bestehenden Sparrate

Termin vereinbart: 12.12.2025, 14:00 Uhr
Ort: Agentur

Vorbereitung:
- 3 Angebote mit unterschiedlichen Risikoprofilen
- ESG-Fonds-Optionen`,
            status: 'Termin: 12.12.2025'
        },
        'email-2': {
            typ: 'E-Mail',
            datum: '01.10.2025, 08:00',
            betreff: 'Willkommen bei Open Finance - Ihre Daten sind jetzt verknüpft',
            inhalt: `Sehr geehrter Herr Mustermann,

vielen Dank für Ihre Open Finance Datenfreigabe!

Ab sofort können wir Ihnen personalisierte Versicherungsempfehlungen basierend auf Ihrer Finanzsituation anbieten.

Was bedeutet das für Sie?
- Wir erkennen automatisch, wenn sich Ihre Lebensumstände ändern
- Sie erhalten nur relevante Angebote
- Ihre Daten sind sicher und DSGVO-konform geschützt

Ihre freigegebenen Datenquellen:
- Sparkasse (Girokonto)
- DWS (Depot)
- Sparkasse (Hypothekendarlehen)
- Allianz (Kfz-Versicherung)

Sie können Ihre Einwilligung jederzeit über das Open Finance Dashboard widerrufen.

Mit freundlichen Grüßen
Ihre Versicherungsagentur`,
            status: 'Geöffnet am 01.10.2025, 19:45'
        }
    };

    const komm = kommunikationen[kommId];
    if (komm) {
        alert(`${komm.typ} vom ${komm.datum}\n\nBetreff: ${komm.betreff}\n\n${komm.inhalt}\n\nStatus: ${komm.status}`);
    }
}

// Legacy-Funktion für Kompatibilität
function toggleKundenFida() {
    switchKundenTab('fida');
}

// ========================================
// CHATBOT AUTOCOMPLETE
// ========================================

const mockAgents = [
    { id: 'VM00001', name: 'Max Mustermann' },
    { id: 'VM00002', name: 'Maria Schmidt' },
    { id: 'VM00003', name: 'Michael Weber' },
