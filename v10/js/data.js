// js/data.js - Data Management

// Global state
const state = {
    filters: {
        year: '2025',
        silo: 'alle',
        segments: ['alle'],
        products: ['alle'],
        agentur: 'alle'
    },
    selectedStates: new Set(),
    selectedCounties: new Set(), // NEU für Regierungsbezirke
    charts: {},
    fullscreenChart: null,
    useUploadedData: false,
    uploadedData: null,
    timeNavigation: {},
    currentView: 'dashboard',
    currentTableView: 'bundeslaender',
    selectedAgentur: null,
    tableSort: {
        column: null,
        direction: 'asc'
    }
};

// Store daily data globally
let dailyRawData = null;

// Aggregate daily to monthly
function aggregateDailyToMonthly(dailyData) {
    const monthlyData = {};
    
    dailyData.forEach(row => {
        const key = `${row.year || 2025}-${row.month}`;
        if (!monthlyData[key]) {
            monthlyData[key] = {
                year: row.year || 2025,
                month: row.month,
                neugeschaeft: 0,
                bestand: {}, // WICHTIG: Object statt Array - pro Vermittler nur 1x zählen!
                storno: [],
                nps: [],
                risiko: [],
                combined: [],
                ergebnis: 0,
                underwriting: [],
                deckungsbeitrag: 0,
                count: 0
            };
        }
        
        const monthData = monthlyData[key];
        
        monthData.neugeschaeft += parseFloat(row.neugeschaeft) || 0;
        monthData.ergebnis += parseFloat(row.ergebnis) || 0;
        monthData.deckungsbeitrag += parseFloat(row.deckungsbeitrag) || 0;
        
        const bestandValue = parseFloat(row.bestand);
        const stornoValue = parseFloat(row.storno);
        const npsValue = parseFloat(row.nps);
        const risikoValue = parseFloat(row.risiko);
        const combinedValue = parseFloat(row.combined);
        const underwritingValue = parseFloat(row.underwriting);
        
        // Bestand: Pro Vermittler nur EINMAL pro Monat zählen!
        if (!isNaN(bestandValue) && row.vermittler_id) {
            monthData.bestand[row.vermittler_id] = bestandValue;
        }
        
        if (!isNaN(stornoValue)) monthData.storno.push(stornoValue);
        if (!isNaN(npsValue)) monthData.nps.push(npsValue);
        if (!isNaN(risikoValue)) monthData.risiko.push(risikoValue);
        if (!isNaN(combinedValue)) monthData.combined.push(combinedValue);
        if (!isNaN(underwritingValue)) monthData.underwriting.push(underwritingValue);
        
        monthData.count++;
    });
    
    const result = Object.values(monthlyData).map(month => {
        // Bestand: Summiere alle Vermittler-Bestände
        const bestandValues = Object.values(month.bestand);
        const totalBestand = bestandValues.reduce((sum, val) => sum + val, 0);
        
        return {
            month: month.month,
            neugeschaeft: month.neugeschaeft,
            bestand: totalBestand, // Summe aller Vermittler-Bestände
            storno: month.storno.length > 0 ? month.storno.reduce((a,b) => a+b, 0) / month.storno.length : 0,
            nps: month.nps.length > 0 ? month.nps.reduce((a,b) => a+b, 0) / month.nps.length : 0,
            risiko: month.risiko.length > 0 ? month.risiko.reduce((a,b) => a+b, 0) / month.risiko.length : 0,
            combined: month.combined.length > 0 ? month.combined.reduce((a,b) => a+b, 0) / month.combined.length : 0,
            ergebnis: month.ergebnis,
            underwriting: month.underwriting.length > 0 ? month.underwriting.reduce((a,b) => a+b, 0) / month.underwriting.length : 0,
            deckungsbeitrag: month.deckungsbeitrag
        };
    });
    
    result.sort((a, b) => a.month - b.month);
    return result;
}

// Get filtered data
function getFilteredData() {
    const year = state.filters.year;
    
    console.log('🔎 getFilteredData aufgerufen - selectedCounties:', state.selectedCounties.size, Array.from(state.selectedCounties));
    
    if (dailyRawData && dailyRawData.length > 0) {
        let filteredDaily = dailyRawData;
        
        if (dailyRawData[0].year !== undefined) {
            filteredDaily = filteredDaily.filter(row => row.year == year || row.year == parseInt(year));
        }
        
        if (state.filters.agentur !== 'alle' && dailyRawData[0].vermittler_id !== undefined) {
            filteredDaily = filteredDaily.filter(row => row.vermittler_id === state.filters.agentur);
        }
        
        if (state.selectedStates.size > 0) {
            filteredDaily = filteredDaily.filter(row => state.selectedStates.has(row.bundesland));
        }
        
        // NEU: Filter by selected counties (Regierungsbezirke) - MIT DEBUG!
        if (state.selectedCounties && state.selectedCounties.size > 0) {
            console.log('🔍 Filtere nach Regionen:', Array.from(state.selectedCounties));
            const beforeCount = filteredDaily.length;
            
            filteredDaily = filteredDaily.filter(row => {
                let kreis = row.landkreis || row.kreis;
                if (!kreis) return false;
                
                // Entferne Anführungszeichen
                if (typeof kreis === 'string') {
                    kreis = kreis.replace(/^["']|["']$/g, '').trim();
                }
                
                const match = state.selectedCounties.has(kreis);
                if (!match && Math.random() < 0.001) {
                    console.log('🔸 Beispiel nicht-Match:', kreis, 'gesucht:', Array.from(state.selectedCounties)[0]);
                }
                
                return match;
            });
            
            console.log(`📉 Gefiltert: ${beforeCount} → ${filteredDaily.length} Zeilen`);
        }
        
        if (state.filters.silo !== 'alle' && dailyRawData[0].silo !== undefined) {
            filteredDaily = filteredDaily.filter(row => row.silo === state.filters.silo);
        }
        
        if (!state.filters.segments.includes('alle') && dailyRawData[0].segment !== undefined) {
            filteredDaily = filteredDaily.filter(row => state.filters.segments.includes(row.segment));
        }
        
        if (!state.filters.products.includes('alle') && dailyRawData[0].product !== undefined) {
            filteredDaily = filteredDaily.filter(row => state.filters.products.includes(row.product));
        }
        
        return aggregateDailyToMonthly(filteredDaily);
    }
    
    if (state.uploadedData && state.uploadedData.length > 0) {
        return state.uploadedData;
    }
    
    return [];
}

// Get available Agenturen with names
function getAgenturen() {
    if (!dailyRawData || dailyRawData.length === 0) return [];
    
    const agenturenMap = new Map();
    
    dailyRawData.forEach(row => {
        if (row.vermittler_id) {
            if (!agenturenMap.has(row.vermittler_id)) {
                agenturenMap.set(row.vermittler_id, {
                    id: row.vermittler_id,
                    name: row.vermittler_name || row.vermittler_id
                });
            }
        }
    });
    
    const agenturen = Array.from(agenturenMap.values());
    
    agenturen.sort((a, b) => {
        const numA = parseFloat(a.id.replace(/\D/g, ''));
        const numB = parseFloat(b.id.replace(/\D/g, ''));
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return String(a.id).localeCompare(String(b.id));
    });
    
    return agenturen;
}

// Get data for specific Agentur
function getAgenturData(agenturId) {
    if (!dailyRawData || dailyRawData.length === 0) return null;
    
    let agenturData = dailyRawData.filter(row => row.vermittler_id == agenturId);
    
    const year = state.filters.year;
    if (agenturData[0] && agenturData[0].year !== undefined) {
        agenturData = agenturData.filter(row => row.year == year);
    }
    
    if (state.filters.silo !== 'alle' && agenturData[0] && agenturData[0].silo !== undefined) {
        agenturData = agenturData.filter(row => row.silo === state.filters.silo);
    }
    
    if (!state.filters.segments.includes('alle') && agenturData[0] && agenturData[0].segment !== undefined) {
        agenturData = agenturData.filter(row => state.filters.segments.includes(row.segment));
    }
    
    if (!state.filters.products.includes('alle') && agenturData[0] && agenturData[0].product !== undefined) {
        agenturData = agenturData.filter(row => state.filters.products.includes(row.product));
    }
    
    if (agenturData.length === 0) return null;
    
    const monthlyData = aggregateDailyToMonthly(agenturData);
    const row = { 
        agentur: agenturId,
        agentur_name: agenturData[0].vermittler_name || agenturId
    };
    
    kpiDefinitions.forEach(kpi => {
        if (['storno', 'nps', 'risiko', 'combined', 'underwriting'].includes(kpi.id)) {
            const sum = monthlyData.reduce((acc, month) => acc + (month[kpi.id] || 0), 0);
            row[kpi.id] = monthlyData.length > 0 ? sum / monthlyData.length : 0;
        } else {
            row[kpi.id] = monthlyData.reduce((sum, month) => sum + (month[kpi.id] || 0), 0);
        }
    });
    
    const firstRow = agenturData[0];
    if (firstRow.bundesland) row.bundesland = firstRow.bundesland;
    if (firstRow.silo) row.silo = firstRow.silo;
    if (firstRow.segment) row.segment = firstRow.segment;
    
    return row;
}

// Get data grouped by Bundesland
function getBundeslaenderData() {
    if (!dailyRawData || dailyRawData.length === 0) return [];
    
    const bundeslandMap = {};
    let filteredData = dailyRawData;
    
    const year = state.filters.year;
    if (filteredData[0] && filteredData[0].year !== undefined) {
        filteredData = filteredData.filter(row => row.year == year);
    }
    
    if (state.filters.agentur !== 'alle' && filteredData[0] && filteredData[0].vermittler_id !== undefined) {
        filteredData = filteredData.filter(row => row.vermittler_id === state.filters.agentur);
    }
    
    if (state.filters.silo !== 'alle' && filteredData[0] && filteredData[0].silo !== undefined) {
        filteredData = filteredData.filter(row => row.silo === state.filters.silo);
    }
    
    if (!state.filters.segments.includes('alle') && filteredData[0] && filteredData[0].segment !== undefined) {
        filteredData = filteredData.filter(row => state.filters.segments.includes(row.segment));
    }
    
    if (!state.filters.products.includes('alle') && filteredData[0] && filteredData[0].product !== undefined) {
        filteredData = filteredData.filter(row => state.filters.products.includes(row.product));
    }
    
    filteredData.forEach(row => {
        const land = row.bundesland;
        if (!land) return;
        
        if (!bundeslandMap[land]) {
            bundeslandMap[land] = {
                bundesland: land,
                neugeschaeft: 0,
                bestand: {}, // Pro Vermittler nur 1x zählen!
                storno: [],
                nps: [],
                risiko: [],
                combined: [],
                ergebnis: 0,
                underwriting: [],
                deckungsbeitrag: 0
            };
        }
        
        const data = bundeslandMap[land];
        data.neugeschaeft += parseFloat(row.neugeschaeft) || 0;
        data.ergebnis += parseFloat(row.ergebnis) || 0;
        data.deckungsbeitrag += parseFloat(row.deckungsbeitrag) || 0;
        
        // Bestand: Pro Vermittler nur EINMAL zählen!
        if (!isNaN(parseFloat(row.bestand)) && row.vermittler_id) {
            data.bestand[row.vermittler_id] = parseFloat(row.bestand);
        }
        
        if (!isNaN(parseFloat(row.storno))) data.storno.push(parseFloat(row.storno));
        if (!isNaN(parseFloat(row.nps))) data.nps.push(parseFloat(row.nps));
        if (!isNaN(parseFloat(row.risiko))) data.risiko.push(parseFloat(row.risiko));
        if (!isNaN(parseFloat(row.combined))) data.combined.push(parseFloat(row.combined));
        if (!isNaN(parseFloat(row.underwriting))) data.underwriting.push(parseFloat(row.underwriting));
    });
    
    const result = Object.values(bundeslandMap).map(data => ({
        bundesland: data.bundesland,
        neugeschaeft: data.neugeschaeft,
        bestand: Object.values(data.bestand).reduce((sum, val) => sum + val, 0), // Summe aller Vermittler
        storno: data.storno.length > 0 ? data.storno.reduce((a,b) => a+b, 0) / data.storno.length : 0,
        nps: data.nps.length > 0 ? data.nps.reduce((a,b) => a+b, 0) / data.nps.length : 0,
        risiko: data.risiko.length > 0 ? data.risiko.reduce((a,b) => a+b, 0) / data.risiko.length : 0,
        combined: data.combined.length > 0 ? data.combined.reduce((a,b) => a+b, 0) / data.combined.length : 0,
        ergebnis: data.ergebnis,
        underwriting: data.underwriting.length > 0 ? data.underwriting.reduce((a,b) => a+b, 0) / data.underwriting.length : 0,
        deckungsbeitrag: data.deckungsbeitrag
    }));
    
    return result.sort((a, b) => a.bundesland.localeCompare(b.bundesland));
}

// NEU: Get data grouped by Landkreise
function getLandkreiseData() {
    if (!dailyRawData || dailyRawData.length === 0) return [];
    
    const kreisMap = {};
    let filteredData = dailyRawData.filter(row => row.year == state.filters.year);
    
    if (state.filters.agentur !== 'alle') {
        filteredData = filteredData.filter(row => row.vermittler_id === state.filters.agentur);
    }
    if (state.filters.silo !== 'alle') {
        filteredData = filteredData.filter(row => row.silo === state.filters.silo);
    }
    if (!state.filters.segments.includes('alle')) {
        filteredData = filteredData.filter(row => state.filters.segments.includes(row.segment));
    }
    
    filteredData.forEach(row => {
        let kreis = row.landkreis || row.kreis;
        if (!kreis) return;
        
        // Entferne Anführungszeichen
        if (typeof kreis === 'string') {
            kreis = kreis.replace(/^["']|["']$/g, '').trim();
        }
        
        if (!kreisMap[kreis]) {
            kreisMap[kreis] = {
                landkreis: kreis,
                bundesland: row.bundesland,
                neugeschaeft: 0,
                bestand: {}, // Pro Vermittler nur 1x zählen!
                storno: [],
                nps: [],
                risiko: [],
                combined: [],
                ergebnis: 0,
                underwriting: [],
                deckungsbeitrag: 0
            };
        }
        
        const data = kreisMap[kreis];
        data.neugeschaeft += parseFloat(row.neugeschaeft) || 0;
        data.ergebnis += parseFloat(row.ergebnis) || 0;
        data.deckungsbeitrag += parseFloat(row.deckungsbeitrag) || 0;
        
        // Bestand: Pro Vermittler nur EINMAL zählen!
        if (!isNaN(parseFloat(row.bestand)) && row.vermittler_id) {
            data.bestand[row.vermittler_id] = parseFloat(row.bestand);
        }
        
        if (!isNaN(parseFloat(row.storno))) data.storno.push(parseFloat(row.storno));
        if (!isNaN(parseFloat(row.nps))) data.nps.push(parseFloat(row.nps));
        if (!isNaN(parseFloat(row.risiko))) data.risiko.push(parseFloat(row.risiko));
        if (!isNaN(parseFloat(row.combined))) data.combined.push(parseFloat(row.combined));
        if (!isNaN(parseFloat(row.underwriting))) data.underwriting.push(parseFloat(row.underwriting));
    });
    
    const result = Object.values(kreisMap).map(data => ({
        landkreis: data.landkreis,
        bundesland: data.bundesland,
        neugeschaeft: data.neugeschaeft,
        bestand: Object.values(data.bestand).reduce((sum, val) => sum + val, 0), // Summe aller Vermittler
        storno: data.storno.length > 0 ? data.storno.reduce((a,b) => a+b, 0) / data.storno.length : 0,
        nps: data.nps.length > 0 ? data.nps.reduce((a,b) => a+b, 0) / data.nps.length : 0,
        risiko: data.risiko.length > 0 ? data.risiko.reduce((a,b) => a+b, 0) / data.risiko.length : 0,
        combined: data.combined.length > 0 ? data.combined.reduce((a,b) => a+b, 0) / data.combined.length : 0,
        ergebnis: data.ergebnis,
        underwriting: data.underwriting.length > 0 ? data.underwriting.reduce((a,b) => a+b, 0) / data.underwriting.length : 0,
        deckungsbeitrag: data.deckungsbeitrag
    }));
    
    return result.sort((a, b) => a.landkreis.localeCompare(b.landkreis));
}

// Update Agentur filter display
function updateAgenturFilterDisplay() {
    const button = document.getElementById('agenturFilterButton');
    if (!button) return;
    
    if (state.filters.agentur === 'alle') {
        button.querySelector('span').textContent = 'Alle Agenturen';
    } else {
        const agenturen = getAgenturen();
        const selected = agenturen.find(a => a.id === state.filters.agentur);
        if (selected) {
            const displayText = selected.name ? 
                `${selected.id} - ${selected.name}` : 
                selected.id;
            button.querySelector('span').textContent = displayText;
        }
    }
}