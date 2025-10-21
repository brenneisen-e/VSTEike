// js/config.js - Configuration and Constants

// KPI Definitions
const kpiDefinitions = [
    { id: 'neugeschaeft', title: 'Neugeschäftsvolumen', description: 'Gesamtvolumen aller neu abgeschlossenen Verträge', unit: 'currency', hasYTD: true, icon: '💡' },
    { id: 'bestand', title: 'Bestandsvolumen', description: 'Gesamtwert aller verwalteten Versicherungsverträge', unit: 'currency', hasYTD: false, icon: '💼' },
    { id: 'storno', title: 'Stornoquote', description: 'Prozentsatz der gekündigten Verträge', unit: 'percent', hasYTD: true, icon: '📉' },
    { id: 'nps', title: 'NPS Score', description: 'Net Promoter Score - Kundenweiterempfehlungsrate', unit: 'score', hasYTD: false, icon: '📊' },
    { id: 'risiko', title: 'Risikoscore', description: 'Aggregierte Risikobewertung des Portfolios', unit: 'score', hasYTD: false, icon: '🛡️' },
    { id: 'combined', title: 'Combined Ratio', description: 'Verhältnis von Schäden und Kosten zu Prämieneinnahmen', unit: 'percent', hasYTD: false, icon: '%' },
    { id: 'ergebnis', title: 'Gesamtergebnis', description: 'Geschäftsergebnis nach allen Kosten', unit: 'currency', hasYTD: true, icon: '🏆' },
    { id: 'underwriting', title: 'Underwriting Qualität', description: 'Anteil Anträge, die Risikoprüfungskriterien entsprechen', unit: 'percent', hasYTD: false, icon: '📋' },
    { id: 'deckungsbeitrag', title: 'Deckungsbeitrag', description: 'Ertrag nach Abzug direkter Kosten und Provisionen', unit: 'currency', hasYTD: true, icon: '💰' }
];

// Bundesland Data (for reference only - used in CSV generator)
const bundeslandData = {
    'Baden-Württemberg': { baseFactor: 1.35, seasonPattern: [1.1, 1.0, 1.05, 1.1, 0.95, 0.85, 0.8, 0.75, 1.0, 1.15, 1.2, 1.25], volatility: 0.15 },
    'Bayern': { baseFactor: 1.40, seasonPattern: [1.15, 1.05, 1.1, 1.0, 0.9, 0.8, 0.75, 0.7, 0.95, 1.1, 1.25, 1.3], volatility: 0.12 },
    'Berlin': { baseFactor: 0.95, seasonPattern: [0.9, 0.95, 1.0, 1.05, 1.1, 1.05, 1.0, 1.05, 1.1, 1.05, 0.95, 0.85], volatility: 0.25 },
    'Brandenburg': { baseFactor: 0.65, seasonPattern: [0.8, 0.85, 0.95, 1.05, 1.15, 1.2, 1.15, 1.1, 1.0, 0.9, 0.85, 0.8], volatility: 0.20 },
    'Bremen': { baseFactor: 1.05, seasonPattern: [1.05, 1.0, 1.0, 0.95, 0.9, 0.9, 0.95, 0.95, 1.05, 1.1, 1.1, 1.05], volatility: 0.10 },
    'Hamburg': { baseFactor: 1.45, seasonPattern: [1.2, 1.1, 1.05, 0.95, 0.85, 0.8, 0.85, 0.9, 1.05, 1.15, 1.2, 1.15], volatility: 0.18 },
    'Hessen': { baseFactor: 1.25, seasonPattern: [1.1, 1.05, 1.0, 0.95, 0.9, 0.85, 0.85, 0.9, 1.0, 1.1, 1.15, 1.15], volatility: 0.14 },
    'Mecklenburg-Vorpommern': { baseFactor: 0.55, seasonPattern: [0.7, 0.75, 0.85, 1.0, 1.3, 1.5, 1.6, 1.4, 1.1, 0.9, 0.75, 0.7], volatility: 0.30 },
    'Niedersachsen': { baseFactor: 1.00, seasonPattern: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], volatility: 0.10 },
    'Nordrhein-Westfalen': { baseFactor: 1.30, seasonPattern: [1.05, 1.0, 0.95, 0.9, 0.85, 0.85, 0.9, 0.95, 1.05, 1.15, 1.2, 1.15], volatility: 0.16 },
    'Rheinland-Pfalz': { baseFactor: 0.98, seasonPattern: [0.95, 0.9, 0.95, 1.0, 1.05, 1.1, 1.1, 1.05, 1.0, 0.95, 0.9, 0.95], volatility: 0.12 },
    'Saarland': { baseFactor: 0.82, seasonPattern: [0.9, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.05, 1.0, 0.95, 0.9, 0.85], volatility: 0.15 },
    'Sachsen': { baseFactor: 0.78, seasonPattern: [0.85, 0.9, 0.95, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.9, 0.85, 0.8], volatility: 0.22 },
    'Sachsen-Anhalt': { baseFactor: 0.68, seasonPattern: [0.8, 0.85, 0.9, 1.0, 1.1, 1.15, 1.15, 1.1, 1.0, 0.9, 0.85, 0.8], volatility: 0.25 },
    'Schleswig-Holstein': { baseFactor: 1.02, seasonPattern: [0.85, 0.9, 0.95, 1.05, 1.2, 1.3, 1.35, 1.25, 1.05, 0.95, 0.85, 0.8], volatility: 0.20 },
    'Thüringen': { baseFactor: 0.72, seasonPattern: [0.85, 0.9, 0.95, 1.05, 1.1, 1.1, 1.05, 1.0, 0.95, 0.9, 0.85, 0.85], volatility: 0.18 }
};

// Simple factors for backward compatibility (used in map display)
const bundeslandFactors = Object.fromEntries(
    Object.entries(bundeslandData).map(([name, data]) => [name, data.baseFactor])
);

// Segment Factors
const segmentFactors = {
    'Leben': { neugeschaeft: 0.45, bestand: 0.40, storno: 1.15, nps: 0.95, risiko: 0.90, combined: 0.92, ergebnis: 0.35, underwriting: 1.02, deckungsbeitrag: 0.38 },
    'Kranken': { neugeschaeft: 0.20, bestand: 0.25, storno: 0.70, nps: 1.10, risiko: 0.85, combined: 0.98, ergebnis: 0.25, underwriting: 1.05, deckungsbeitrag: 0.22 },
    'Schaden': { neugeschaeft: 0.20, bestand: 0.20, storno: 0.90, nps: 1.00, risiko: 1.10, combined: 1.05, ergebnis: 0.25, underwriting: 0.95, deckungsbeitrag: 0.23 },
    'Kfz': { neugeschaeft: 0.15, bestand: 0.15, storno: 1.10, nps: 0.90, risiko: 1.15, combined: 1.08, ergebnis: 0.15, underwriting: 0.92, deckungsbeitrag: 0.17 }
};

// Silo Factors
const siloFactors = {
    'Ausschließlichkeit': { neugeschaeft: 1.20, bestand: 1.15, storno: 0.85, nps: 1.05, risiko: 0.95, combined: 0.96, ergebnis: 1.25, underwriting: 1.08, deckungsbeitrag: 1.22 },
    'Makler': { neugeschaeft: 0.90, bestand: 0.95, storno: 1.05, nps: 0.95, risiko: 1.05, combined: 1.02, ergebnis: 0.85, underwriting: 0.95, deckungsbeitrag: 0.88 },
    'Direktvertrieb': { neugeschaeft: 0.60, bestand: 0.55, storno: 1.20, nps: 1.10, risiko: 0.90, combined: 0.94, ergebnis: 1.10, underwriting: 1.05, deckungsbeitrag: 0.95 },
    'Banken': { neugeschaeft: 0.30, bestand: 0.35, storno: 0.95, nps: 0.90, risiko: 1.00, combined: 1.00, ergebnis: 0.80, underwriting: 0.98, deckungsbeitrag: 0.85 }
};

// Products by Segment
const productsBySegment = {
    'Leben': ['Risikoleben', 'Kapitallebensversicherung', 'Fondsgebundene LV', 'Berufsunfähigkeit', 'Rentenversicherung'],
    'Kranken': ['Vollversicherung', 'Zusatzversicherung', 'Pflegeversicherung', 'Zahnzusatz', 'Auslandsreise'],
    'Schaden': ['Hausrat', 'Wohngebäude', 'Haftpflicht', 'Rechtsschutz', 'Gewerbe'],
    'Kfz': ['Kfz-Haftpflicht', 'Vollkasko', 'Teilkasko', 'Flottenversicherung', 'Schutzbrief']
};

// Agent Distribution Templates
const agentDistributions = {
    'neugeschaeft': [
        { range: '< 10k', count: 120 },
        { range: '10k-50k', count: 340 },
        { range: '50k-100k', count: 280 },
        { range: '100k-150k', count: 180 },
        { range: '150k-250k', count: 95 },
        { range: '250k-500k', count: 45 },
        { range: '> 500k', count: 15 }
    ],
    'bestand': [
        { range: '< 1 Mio', count: 80 },
        { range: '1-5 Mio', count: 250 },
        { range: '5-10 Mio', count: 320 },
        { range: '10-25 Mio', count: 240 },
        { range: '25-50 Mio', count: 120 },
        { range: '50-100 Mio', count: 55 },
        { range: '> 100 Mio', count: 10 }
    ],
    'storno': [
        { range: '< 3%', count: 45 },
        { range: '3-5%', count: 180 },
        { range: '5-7%', count: 320 },
        { range: '7-9%', count: 280 },
        { range: '9-12%', count: 150 },
        { range: '12-15%', count: 75 },
        { range: '> 15%', count: 25 }
    ],
    'nps': [
        { range: '< 0', count: 15 },
        { range: '0-20', count: 45 },
        { range: '20-40', count: 120 },
        { range: '40-60', count: 280 },
        { range: '60-70', count: 340 },
        { range: '70-80', count: 200 },
        { range: '> 80', count: 75 }
    ],
    'risiko': [
        { range: '< 30', count: 25 },
        { range: '30-40', count: 85 },
        { range: '40-50', count: 220 },
        { range: '50-60', count: 380 },
        { range: '60-70', count: 245 },
        { range: '70-80', count: 95 },
        { range: '> 80', count: 25 }
    ],
    'combined': [
        { range: '< 85%', count: 35 },
        { range: '85-90%', count: 120 },
        { range: '90-95%', count: 380 },
        { range: '95-100%', count: 320 },
        { range: '100-105%', count: 150 },
        { range: '105-110%', count: 55 },
        { range: '> 110%', count: 15 }
    ],
    'ergebnis': [
        { range: '< 0', count: 45 },
        { range: '0-10k', count: 180 },
        { range: '10k-25k', count: 280 },
        { range: '25k-50k', count: 320 },
        { range: '50k-100k', count: 180 },
        { range: '100k-200k', count: 55 },
        { range: '> 200k', count: 15 }
    ],
    'underwriting': [
        { range: '< 70%', count: 25 },
        { range: '70-75%', count: 65 },
        { range: '75-80%', count: 150 },
        { range: '80-85%', count: 320 },
        { range: '85-90%', count: 340 },
        { range: '90-95%', count: 140 },
        { range: '> 95%', count: 35 }
    ],
    'deckungsbeitrag': [
        { range: '< 0', count: 35 },
        { range: '0-50k', count: 220 },
        { range: '50k-100k', count: 340 },
        { range: '100k-200k', count: 280 },
        { range: '200k-500k', count: 140 },
        { range: '500k-1M', count: 45 },
        { range: '> 1M', count: 15 }
    ]
};