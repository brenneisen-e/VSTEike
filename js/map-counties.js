// js/map-counties.js - Deutschland Karte mit Landkreisen

class CountyMapHandler {
    constructor() {
        this.svg = null;
        this.projection = null;
        this.path = null;
        this.counties = new Map();
        this.selectedCounties = new Set();
        this.zoom = null;
    }

    async init() {
        console.log('🗺️ Initialisiere Landkreis-Karte...');
        
        const container = d3.select('#map');
        container.html('');
        
        const width = 380;
        const height = 500;
        
        // SVG mit Zoom
        this.svg = container
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);
        
        // Hintergrund
        this.svg.append('rect')
            .attr('class', 'map-background')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', '#f8fafc'); // Hellgrauer Hintergrund (nicht weiß, damit weiße Regionen sichtbar sind)
        
        // Lade Regierungsbezirke GeoJSON (lokal gehostet um CSP zu umgehen)
        console.log('📥 Lade Regierungsbezirke...');
        const geojson = await d3.json('assets/geo/regierungsbezirke.geo.json');
        
        console.log(`✅ ${geojson.features.length} Regierungsbezirke geladen`);
        
        // Projektion
        this.projection = d3.geoMercator()
            .fitSize([width, height], geojson);
        
        this.path = d3.geoPath().projection(this.projection);

        // Landkreise zeichnen
        const countiesGroup = this.svg.append('g')
            .attr('id', 'counties-layer');
        
        countiesGroup.selectAll('path')
            .data(geojson.features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', 'county-path')
            .attr('data-county', d => this.getCountyName(d))
            .attr('data-state', d => d.properties.Bundesland || d.properties.VARNAME_1)
            .attr('fill', '#ffffff') // Weiß am Anfang (keine Daten)
            .attr('stroke', '#cbd5e1')
            .attr('stroke-width', 0.5)
            .style('cursor', 'pointer')
            .on('mouseenter', (event, d) => this.onMouseEnter(event, d))
            .on('mouseleave', (event, d) => this.onMouseLeave(event, d))
            .on('click', (event, d) => this.onClick(event, d));
        
        // Bundesland-Grenzen (lokal gehostet)
        const statesGeoJSON = await d3.json('assets/geo/bundeslaender.geo.json');
        
        this.svg.append('g')
            .attr('id', 'states-borders')
            .selectAll('path')
            .data(statesGeoJSON.features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('fill', 'none')
            .attr('stroke', '#94a3b8') // Helleres modernes Grau
            .attr('stroke-width', 1.5) // Etwas dünner
            .style('pointer-events', 'none');
        
        // Speichere Referenzen - WICHTIG: value auf 0 setzen am Anfang!
        geojson.features.forEach(feature => {
            const name = this.getCountyName(feature);
            this.counties.set(name, {
                name: name,
                state: feature.properties.Bundesland || feature.properties.VARNAME_1,
                feature: feature,
                selected: false,
                value: 0 // Explizit auf 0 setzen
            });
        });
        
        console.log('✅ Karte initialisiert:', this.counties.size, 'Regierungsbezirke');

        // DEBUG: Zeige alle Regierungsbezirk-Namen gruppiert nach Bundesland
        this.logCountiesByState();
    }
    
    // NEU: Debug-Funktion um alle Regionen nach Bundesland zu loggen
    logCountiesByState() {
        const byState = {};
        this.counties.forEach((county, name) => {
            if (!byState[county.state]) {
                byState[county.state] = [];
            }
            byState[county.state].push(name);
        });
        
        console.log('📋 REGIERUNGSBEZIRKE NACH BUNDESLAND:');
        Object.keys(byState).sort().forEach(state => {
            console.log(`'${state}': [${byState[state].map(n => `'${n}'`).join(', ')}],`);
        });
        
        console.log('\n💡 Kopiere diese Namen in den CSV-Generator!');
    }

    getCountyName(feature) {
        // Verschiedene mögliche Property-Namen
        return feature.properties.GEN || 
               feature.properties.name || 
               feature.properties.NAME_2 || 
               feature.id;
    }
    
    // Normalisiere Namen für besseres Matching
    normalizeCountyName(name) {
        if (!name) return '';
        return name
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/ä/g, 'a')
            .replace(/ö/g, 'o')
            .replace(/ü/g, 'u')
            .replace(/ß/g, 'ss')
            .replace(/[()]/g, '')
            .trim();
    }
    
    // Finde County by name (mit fuzzy matching)
    findCountyByName(searchName) {
        const normalized = this.normalizeCountyName(searchName);
        
        // Exakte Suche
        for (const [name, county] of this.counties) {
            if (this.normalizeCountyName(name) === normalized) {
                return name;
            }
        }
        
        // Teilstring-Suche
        for (const [name, county] of this.counties) {
            const normalizedCounty = this.normalizeCountyName(name);
            if (normalizedCounty.includes(normalized) || normalized.includes(normalizedCounty)) {
                return name;
            }
        }
        
        return null;
    }

    onMouseEnter(event, d) {
        const name = this.getCountyName(d);
        const county = this.counties.get(name);
        
        if (!county) return;
        
        const element = d3.select(event.target);
        
        // Hover-Effekt - modernes blau (nur visuell, keine Farbe speichern!)
        if (!county.selected) {
            element
                .attr('fill', '#e0f2fe') // Hell cyan/blau beim Hover
                .attr('stroke-width', 2)
                .attr('stroke', '#0ea5e9'); // Sky blue
        }
        
        // Bring to front und highlight
        element
            .raise()
            .style('filter', 'drop-shadow(0 4px 8px rgba(14, 165, 233, 0.4))');
        
        this.showTooltip(event, county);
    }

    onMouseLeave(event, d) {
        const name = this.getCountyName(d);
        const county = this.counties.get(name);
        
        if (!county) return;
        
        const element = d3.select(event.target);
        
        if (!county.selected) {
            // Nicht ausgewählt: Zurück zu weiß
            element
                .attr('fill', '#ffffff')
                .attr('stroke-width', 1)
                .attr('stroke', '#cbd5e1')
                .style('filter', 'none');
        } else {
            // Ausgewählt: Behalte blaue Farbe und Glow
            element
                .style('filter', 'drop-shadow(0 0 8px rgba(59, 130, 246, 1))');
        }
        
        this.hideTooltip();
    }

    onClick(event, d) {
        const name = this.getCountyName(d);
        this.toggleCounty(name);
    }

    toggleCounty(countyName) {
        const county = this.counties.get(countyName);
        if (!county) return;
        
        // SINGLE SELECTION: Wenn ein anderes County ausgewählt ist, deselektiere es erst
        if (!county.selected && this.selectedCounties.size > 0) {
            // Deselektiere alle anderen Counties
            this.selectedCounties.forEach(selectedName => {
                const selectedCounty = this.counties.get(selectedName);
                if (selectedCounty) {
                    selectedCounty.selected = false;
                    
                    // Zurück zu weiß
                    this.svg.select(`[data-county="${selectedName}"]`)
                        .attr('stroke', '#cbd5e1')
                        .attr('stroke-width', 1)
                        .attr('fill', '#ffffff')
                        .style('filter', 'none');
                }
            });
            this.selectedCounties.clear();
        }
        
        // Toggle current county
        county.selected = !county.selected;
        
        if (county.selected) {
            this.selectedCounties.add(countyName);
        } else {
            this.selectedCounties.delete(countyName);
        }
        
        // Update visual
        const element = this.svg.select(`[data-county="${countyName}"]`);
        
        if (county.selected) {
            // Ausgewählt: Blau basierend auf Daten
            const color = this.getColorForValue(county.value);
            element
                .attr('stroke', '#3b82f6')
                .attr('stroke-width', 3)
                .attr('fill', color)
                .style('filter', 'drop-shadow(0 0 8px rgba(59, 130, 246, 1))')
                .raise();
        } else {
            // Nicht ausgewählt: Zurück zu weiß
            element
                .attr('stroke', '#cbd5e1')
                .attr('stroke-width', 1)
                .attr('fill', '#ffffff')
                .style('filter', 'none');
        }
        
        this.updateDashboard();
    }

    updateMapData(monthlyData) {
        console.log('🎨 Update Landkreis-Map');
        
        if (!dailyRawData || dailyRawData.length === 0) {
            console.log('⚠️ Keine Daten - Karte bleibt weiß');
            this.counties.forEach((countyData, countyName) => {
                countyData.value = 0;
                this.svg.select(`[data-county="${countyName}"]`)
                    .attr('fill', '#ffffff');
            });
            return;
        }
        
        const countyValues = new Map();
        
        let filtered = dailyRawData.filter(row => {
            if (row.year != state.filters.year) return false;
            if (state.filters.silo !== 'alle' && row.silo !== state.filters.silo) return false;
            if (!state.filters.segments.includes('alle') && !state.filters.segments.includes(row.segment)) return false;
            if (state.filters.agentur !== 'alle' && row.vermittler_id !== state.filters.agentur) return false;
            return true;
        });
        
        // Zähle nach Regierungsbezirk/County
        filtered.forEach(row => {
            let kreis = row.landkreis || row.kreis;
            if (!kreis) return;
            
            // Entferne Anführungszeichen falls vorhanden
            if (typeof kreis === 'string') {
                kreis = kreis.replace(/^["']|["']$/g, '').trim();
            }
            
            // Direktes Matching (Namen sind jetzt exakt)
            if (this.counties.has(kreis)) {
                const current = countyValues.get(kreis) || 0;
                countyValues.set(kreis, current + (parseFloat(row.neugeschaeft) || 0));
            }
        });
        
        console.log(`📊 ${countyValues.size} von ${this.counties.size} Regionen haben Daten`);
        
        // Speichere Werte OHNE Farben zu ändern - Regionen bleiben weiß!
        this.counties.forEach((countyData, countyName) => {
            const value = countyValues.get(countyName) || 0;
            countyData.value = value;
            
            // NUR färben wenn ausgewählt, sonst weiß lassen!
            if (countyData.selected) {
                const color = this.getColorForValue(value);
                this.svg.select(`[data-county="${countyName}"]`)
                    .attr('fill', color);
            } else {
                // Nicht ausgewählte Regionen bleiben weiß
                this.svg.select(`[data-county="${countyName}"]`)
                    .attr('fill', '#ffffff');
            }
        });
    }

    fallbackToStates(filteredData) {
        // Falls keine Landkreis-Daten, färbe nach Bundesland
        const stateValues = new Map();
        
        filteredData.forEach(row => {
            const land = row.bundesland;
            if (!land) return;
            
            const current = stateValues.get(land) || 0;
            stateValues.set(land, current + (parseFloat(row.neugeschaeft) || 0));
        });
        
        // Verteile Bundesland-Werte auf alle Landkreise des Bundeslandes
        this.counties.forEach((countyData, countyName) => {
            const stateValue = stateValues.get(countyData.state) || 0;
            
            // Zähle wie viele Landkreise es in diesem Bundesland gibt
            let countiesInState = 0;
            this.counties.forEach(c => {
                if (c.state === countyData.state) countiesInState++;
            });
            
            // Verteile den Wert gleichmäßig + zufällige Variation für Realismus
            const baseValue = stateValue / countiesInState;
            const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 bis 1.3
            const value = baseValue * randomFactor;
            
            countyData.value = value;
            
            const color = this.getColorForValue(value);
            
            this.svg.select(`[data-county="${countyName}"]`)
                .transition()
                .duration(300)
                .attr('fill', color);
        });
    }

    getColorForValue(value) {
        // Weiß wenn keine Daten
        if (value === 0) return '#ffffff';
        
        // Moderne blaue Farbskala für Daten
        const scale = d3.scaleThreshold()
            .domain([50000, 200000, 500000, 1000000, 5000000])
            .range([
                '#eff6ff', // Sehr hell blau
                '#dbeafe', // Hell blau
                '#bfdbfe', // Mittel hell blau
                '#93c5fd', // Mittel blau
                '#60a5fa', // Blau
                '#3b82f6'  // Dunkel blau
            ]);
        
        return scale(value);
    }

    showTooltip(event, county) {
        const tooltip = d3.select('#info-tooltip');
        
        tooltip
            .html(`
                <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px; color: #0f172a;">
                    ${county.name}
                </div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 10px;">
                    📍 ${county.state}
                </div>
                <div style="font-size: 13px; color: #1e293b; background: #f8fafc; padding: 8px; border-radius: 6px; margin-top: 8px;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">Neugeschäft</div>
                    <div style="font-size: 15px; font-weight: 600; color: #0ea5e9;">${formatValue(county.value, 'currency')}</div>
                </div>
            `)
            .style('display', 'block')
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 60) + 'px')
            .style('background', 'white')
            .style('padding', '14px 16px')
            .style('border-radius', '12px')
            .style('box-shadow', '0 10px 25px rgba(0,0,0,0.15)')
            .style('pointer-events', 'none')
            .style('z-index', '10000')
            .style('border', '1px solid #e2e8f0')
            .style('max-width', '280px')
            .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif');
    }

    hideTooltip() {
        d3.select('#info-tooltip').style('display', 'none');
    }

    updateDashboard() {
        // Setze selected counties im globalen State
        state.selectedCounties = new Set(this.selectedCounties);

        console.log('🔄 Dashboard Update - Ausgewählte Regionen:', Array.from(this.selectedCounties));

        // ✨ v15: Reset Agenturfilter bei Bundesland-Auswahl
        if (this.selectedCounties.size > 0 && state.filters.agentur !== 'alle') {
            console.log('🔄 Bundesland ausgewählt - Setze Agenturfilter zurück');
            state.filters.agentur = 'alle';

            // Update Agentur-Select falls vorhanden
            const agenturSelect = document.getElementById('agenturFilterSelect');
            if (agenturSelect) {
                agenturSelect.value = 'alle';
            }
        }

        updateCountySelection();
        
        // WICHTIG: Dashboard KPIs aktualisieren!
        if (typeof updateAllKPIs === 'function') {
            console.log('📊 Aktualisiere KPIs...');
            updateAllKPIs();
        } else {
            console.error('❌ updateAllKPIs Funktion nicht gefunden!');
        }
        
        if (state.currentView === 'table') {
            if (typeof renderTable === 'function') {
                renderTable();
            }
        }
    }

    clearSelection() {
        this.selectedCounties.clear();
        this.counties.forEach((countyData, countyName) => {
            countyData.selected = false;
            
            this.svg.select(`[data-county="${countyName}"]`)
                .attr('stroke', '#cbd5e1')
                .attr('stroke-width', 0.5)
                .style('filter', 'none');
        });
        this.updateDashboard();
    }

    // Zusatz: Zoom zu Bundesland
    zoomToState(stateName) {
        const stateCounties = [];
        this.counties.forEach((county, name) => {
            if (county.state === stateName) {
                stateCounties.push(county.feature);
            }
        });
        
        if (stateCounties.length === 0) return;
        
        const bounds = this.path.bounds({
            type: 'FeatureCollection',
            features: stateCounties
        });
        
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2;
        const y = (bounds[0][1] + bounds[1][1]) / 2;
        const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / 380, dy / 500)));
        const translate = [380 / 2 - scale * x, 500 / 2 - scale * y];
        
        this.svg.transition()
            .duration(750)
            .call(
                this.zoom.transform,
                d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );
    }
}

// Globale Instanz
let countyMapHandler;

async function initMap() {
    console.log('🗺️ initMap() aufgerufen');

    // Zeige Lade-Indikator
    const container = document.getElementById('map');
    if (container) {
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;"><span>Karte wird geladen...</span></div>';
    }

    try {
        countyMapHandler = new CountyMapHandler();
        await countyMapHandler.init();

        if (dailyRawData && dailyRawData.length > 0) {
            const data = getFilteredData();
            countyMapHandler.updateMapData(data);
        }

        console.log('✅ Karte erfolgreich initialisiert');
    } catch (error) {
        console.error('❌ Fehler bei Karteninitialisierung:', error);
        // Zeige Fehlermeldung
        if (container) {
            container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ef4444;text-align:center;padding:1rem;"><span>Karte konnte nicht geladen werden.<br>Bitte Seite neu laden.</span></div>';
        }
    }
}

function updateCountySelection() {
    const selectedContainer = document.getElementById('selectedStates');
    const clearButton = document.getElementById('clearStates');
    
    if (countyMapHandler.selectedCounties.size > 0) {
        const sorted = Array.from(countyMapHandler.selectedCounties).sort();
        
        // Bei Single Selection zeigen wir nur das eine ausgewählte County
        selectedContainer.innerHTML = sorted.map(name => 
            `<span class="state-tag" onclick="removeCounty('${name}')">${name} ×</span>`
        ).join('');
        clearButton.disabled = false;
    } else {
        selectedContainer.innerHTML = '<span class="empty-state">— keine —</span>';
        clearButton.disabled = true;
    }
}

function removeCounty(name) {
    countyMapHandler.toggleCounty(name);
}

function clearAllStates() {
    countyMapHandler.clearSelection();
}

window.removeCounty = removeCounty;
window.clearAllStates = clearAllStates;