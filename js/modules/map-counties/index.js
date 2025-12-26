/**
 * Map Counties Module - ES6 Entry Point (ES2024)
 * Germany map with county/region selection
 */

// ========================================
// COUNTY MAP HANDLER CLASS
// ========================================

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

        const width = 380, height = 500;

        this.svg = container.append('svg').attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);
        this.svg.append('rect').attr('class', 'map-background').attr('width', width).attr('height', height).attr('fill', '#f8fafc');

        console.log('📥 Lade Regierungsbezirke...');
        const geojson = await d3.json('assets/geo/regierungsbezirke.geo.json');
        console.log(`✅ ${geojson.features.length} Regierungsbezirke geladen`);

        this.projection = d3.geoMercator().fitSize([width, height], geojson);
        this.path = d3.geoPath().projection(this.projection);

        const countiesGroup = this.svg.append('g').attr('id', 'counties-layer');

        countiesGroup.selectAll('path')
            .data(geojson.features).enter().append('path')
            .attr('d', this.path).attr('class', 'county-path')
            .attr('data-county', d => this.getCountyName(d))
            .attr('data-state', d => d.properties.Bundesland ?? d.properties.VARNAME_1)
            .attr('fill', '#ffffff').attr('stroke', '#cbd5e1').attr('stroke-width', 0.5).style('cursor', 'pointer')
            .on('mouseenter', (event, d) => this.onMouseEnter(event, d))
            .on('mouseleave', (event, d) => this.onMouseLeave(event, d))
            .on('click', (event, d) => this.onClick(event, d));

        const statesGeoJSON = await d3.json('assets/geo/bundeslaender.geo.json');

        this.svg.append('g').attr('id', 'states-borders')
            .selectAll('path').data(statesGeoJSON.features).enter().append('path')
            .attr('d', this.path).attr('fill', 'none').attr('stroke', '#94a3b8').attr('stroke-width', 1.5).style('pointer-events', 'none');

        geojson.features.forEach(feature => {
            const name = this.getCountyName(feature);
            this.counties.set(name, { name, state: feature.properties.Bundesland ?? feature.properties.VARNAME_1, feature, selected: false, value: 0 });
        });

        console.log('✅ Karte initialisiert:', this.counties.size, 'Regierungsbezirke');
    }

    getCountyName(feature) {
        return feature.properties.GEN ?? feature.properties.name ?? feature.properties.NAME_2 ?? feature.id;
    }

    normalizeCountyName(name) {
        return (name ?? '').toLowerCase().replace(/\s+/g, ' ').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/[()]/g, '').trim();
    }

    findCountyByName(searchName) {
        const normalized = this.normalizeCountyName(searchName);
        for (const [name] of this.counties) {
            if (this.normalizeCountyName(name) === normalized) return name;
        }
        for (const [name] of this.counties) {
            const nc = this.normalizeCountyName(name);
            if (nc.includes(normalized) || normalized.includes(nc)) return name;
        }
        return null;
    }

    onMouseEnter(event, d) {
        const name = this.getCountyName(d);
        const county = this.counties.get(name);
        if (!county) return;

        const element = d3.select(event.target);
        if (!county.selected) element.attr('fill', '#e0f2fe').attr('stroke-width', 2).attr('stroke', '#0ea5e9');
        element.raise().style('filter', 'drop-shadow(0 4px 8px rgba(14, 165, 233, 0.4))');
        this.showTooltip(event, county);
    }

    onMouseLeave(event, d) {
        const name = this.getCountyName(d);
        const county = this.counties.get(name);
        if (!county) return;

        const element = d3.select(event.target);
        if (!county.selected) {
            element.attr('fill', '#ffffff').attr('stroke-width', 1).attr('stroke', '#cbd5e1').style('filter', 'none');
        } else {
            element.style('filter', 'drop-shadow(0 0 8px rgba(59, 130, 246, 1))');
        }
        this.hideTooltip();
    }

    onClick(event, d) {
        this.toggleCounty(this.getCountyName(d));
    }

    toggleCounty(countyName) {
        const county = this.counties.get(countyName);
        if (!county) return;

        // Single selection mode
        if (!county.selected && this.selectedCounties.size > 0) {
            this.selectedCounties.forEach(selectedName => {
                const sc = this.counties.get(selectedName);
                if (sc) {
                    sc.selected = false;
                    this.svg.select(`[data-county="${selectedName}"]`).attr('stroke', '#cbd5e1').attr('stroke-width', 1).attr('fill', '#ffffff').style('filter', 'none');
                }
            });
            this.selectedCounties.clear();
        }

        county.selected = !county.selected;
        county.selected ? this.selectedCounties.add(countyName) : this.selectedCounties.delete(countyName);

        const element = this.svg.select(`[data-county="${countyName}"]`);
        if (county.selected) {
            const color = this.getColorForValue(county.value);
            element.attr('stroke', '#3b82f6').attr('stroke-width', 3).attr('fill', color).style('filter', 'drop-shadow(0 0 8px rgba(59, 130, 246, 1))').raise();
        } else {
            element.attr('stroke', '#cbd5e1').attr('stroke-width', 1).attr('fill', '#ffffff').style('filter', 'none');
        }

        this.updateDashboard();
    }

    updateMapData(monthlyData) {
        console.log('🎨 Update Landkreis-Map');

        if (!window.dailyRawData?.length) {
            console.log('⚠️ Keine Daten - Karte bleibt weiß');
            this.counties.forEach((countyData, countyName) => {
                countyData.value = 0;
                this.svg.select(`[data-county="${countyName}"]`).attr('fill', '#ffffff');
            });
            return;
        }

        const countyValues = new Map();
        const state = window.state ?? { filters: {} };

        const filtered = window.dailyRawData.filter(row => {
            if (row.year != state.filters?.year) return false;
            if (state.filters?.silo !== 'alle' && row.silo !== state.filters?.silo) return false;
            if (!state.filters?.segments?.includes('alle') && !state.filters?.segments?.includes(row.segment)) return false;
            if (state.filters?.agentur !== 'alle' && row.vermittler_id !== state.filters?.agentur) return false;
            return true;
        });

        filtered.forEach(row => {
            let kreis = (row.landkreis ?? row.kreis ?? '').replace(/^["']|["']$/g, '').trim();
            if (this.counties.has(kreis)) {
                countyValues.set(kreis, (countyValues.get(kreis) ?? 0) + (parseFloat(row.neugeschaeft) ?? 0));
            }
        });

        console.log(`📊 ${countyValues.size} von ${this.counties.size} Regionen haben Daten`);

        this.counties.forEach((countyData, countyName) => {
            countyData.value = countyValues.get(countyName) ?? 0;
            this.svg.select(`[data-county="${countyName}"]`).attr('fill', countyData.selected ? this.getColorForValue(countyData.value) : '#ffffff');
        });
    }

    getColorForValue(value) {
        if (value === 0) return '#ffffff';
        return d3.scaleThreshold()
            .domain([50000, 200000, 500000, 1000000, 5000000])
            .range(['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6'])(value);
    }

    showTooltip(event, county) {
        d3.select('#info-tooltip')
            .html(`<div style="font-size: 16px; font-weight: 700; margin-bottom: 4px; color: #0f172a;">${county.name}</div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 10px;">📍 ${county.state}</div>
                <div style="font-size: 13px; color: #1e293b; background: #f8fafc; padding: 8px; border-radius: 6px; margin-top: 8px;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">Neugeschäft</div>
                    <div style="font-size: 15px; font-weight: 600; color: #0ea5e9;">${window.formatValue?.(county.value, 'currency') ?? county.value}</div>
                </div>`)
            .style('display', 'block').style('left', (event.pageX + 15) + 'px').style('top', (event.pageY - 60) + 'px')
            .style('background', 'white').style('padding', '14px 16px').style('border-radius', '12px')
            .style('box-shadow', '0 10px 25px rgba(0,0,0,0.15)').style('pointer-events', 'none')
            .style('z-index', '10000').style('border', '1px solid #e2e8f0').style('max-width', '280px');
    }

    hideTooltip() {
        d3.select('#info-tooltip').style('display', 'none');
    }

    updateDashboard() {
        const state = window.state ?? {};
        state.selectedCounties = new Set(this.selectedCounties);

        console.log('🔄 Dashboard Update - Ausgewählte Regionen:', Array.from(this.selectedCounties));

        if (this.selectedCounties.size > 0 && state.filters?.agentur !== 'alle') {
            console.log('🔄 Bundesland ausgewählt - Setze Agenturfilter zurück');
            state.filters.agentur = 'alle';
            const agenturSelect = document.getElementById('agenturFilterSelect');
            if (agenturSelect) agenturSelect.value = 'alle';
        }

        updateCountySelection();
        window.updateAllKPIs?.();
        if (state.currentView === 'table') window.renderTable?.();
    }

    clearSelection() {
        this.selectedCounties.clear();
        this.counties.forEach((countyData, countyName) => {
            countyData.selected = false;
            this.svg.select(`[data-county="${countyName}"]`).attr('stroke', '#cbd5e1').attr('stroke-width', 0.5).style('filter', 'none');
        });
        this.updateDashboard();
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

const updateCountySelection = () => {
    const selectedContainer = document.getElementById('selectedStates');
    const clearButton = document.getElementById('clearStates');

    if (window.countyMapHandler?.selectedCounties?.size > 0) {
        const sorted = Array.from(window.countyMapHandler.selectedCounties).sort();
        selectedContainer.innerHTML = sorted.map(name => `<span class="state-tag" onclick="removeCounty('${name}')">${name} ×</span>`).join('');
        if (clearButton) clearButton.disabled = false;
    } else {
        if (selectedContainer) selectedContainer.innerHTML = '<span class="empty-state">— keine —</span>';
        if (clearButton) clearButton.disabled = true;
    }
};

export const removeCounty = (name) => window.countyMapHandler?.toggleCounty(name);
export const clearAllStates = () => window.countyMapHandler?.clearSelection();

// ========================================
// INIT
// ========================================

export const initMap = async () => {
    console.log('🗺️ initMap() aufgerufen');

    const container = document.getElementById('map');
    if (container) container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;"><span>Karte wird geladen...</span></div>';

    try {
        window.countyMapHandler = new CountyMapHandler();
        await window.countyMapHandler.init();

        if (window.dailyRawData?.length > 0) {
            const data = window.getFilteredData?.() ?? [];
            window.countyMapHandler.updateMapData(data);
        }

        console.log('✅ Karte erfolgreich initialisiert');
    } catch (error) {
        console.error('❌ Fehler bei Karteninitialisierung:', error);
        if (container) container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ef4444;text-align:center;padding:1rem;"><span>Karte konnte nicht geladen werden.<br>Bitte Seite neu laden.</span></div>';
    }
};

// ========================================
// WINDOW EXPORTS
// ========================================

Object.assign(window, { initMap, removeCounty, clearAllStates, CountyMapHandler });

console.log('✅ Map Counties ES6 modules loaded (ES2024)');
