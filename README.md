# VSTEike - Vertriebssteuerungs-Cockpit

KI-gestütztes Dashboard für Vertriebssteuerung mit interaktiven KPIs, geografischen Visualisierungen und Datenanalyse.

## Deployment

Die App ist für **Cloudflare Pages** optimiert und kann direkt aus GitHub deployed werden.

Deployment-Anleitung: Siehe [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)

## Features

- **Interaktives Dashboard** mit Echtzeit-KPIs
- **Geografische Visualisierung** auf Landkreis-Ebene
- **KI-gestützter Chat-Assistent** (OpenAI Integration)
- **CSV-Datenimport** und -verarbeitung
- **Multi-dimensionale Filter** (Jahr, Agentur, Segment, Silo)
- **Responsive Design** für alle Bildschirmgrößen
- **Barrierefreie Bedienung** (WCAG 2.1 AA)

## Technologie-Stack

| Kategorie | Technologien |
|-----------|--------------|
| Frontend | HTML5, CSS3, JavaScript (ES2024) |
| Charts | Chart.js, D3.js |
| Maps | Leaflet.js |
| Hosting | Cloudflare Pages |
| KI | OpenAI API |

## Projektstruktur

```
VSTEike/
├── index.html                    # Haupt-Dashboard
├── Provisionssimulation.html     # Provisionsrechner
├── Risikoscoring_vDraft.html     # Risikobewertung
├── csv-generator.html            # CSV-Test-Daten Generator
│
├── css/
│   ├── styles.css                # Globale Styles
│   └── modules/                  # Modulare CSS-Architektur
│       ├── core/                 # Basis-Styles, Variablen, Reset
│       ├── banken/               # Banken-Modul (6 Submodule)
│       ├── bestand/              # Bestand-Modul (4 Submodule)
│       ├── versicherung/         # Versicherung-Modul (7 Submodule)
│       └── provisionssimulation/ # Provisions-Modul
│
├── js/
│   ├── app.js                    # Haupt-Entry-Point
│   ├── components/               # Wiederverwendbare UI-Komponenten
│   │   ├── data-table/           # Datentabelle (6 Submodule)
│   │   ├── modal.js              # Modal-Dialoge
│   │   ├── toast.js              # Benachrichtigungen
│   │   └── ...
│   ├── modules/                  # Feature-Module
│   │   ├── helpers.js            # Utility-Funktionen
│   │   ├── date-utils.js         # Datums-Utilities
│   │   ├── risikoscoring/        # Risikoscoring (13 Submodule)
│   │   ├── bestand/              # Bestand (12 Submodule)
│   │   ├── banken-chat/          # Banken-Chat (7 Submodule)
│   │   ├── provisionssimulation/ # Provision (8 Submodule)
│   │   └── ...
│   └── services/                 # API und Storage Services
│
├── partials/                     # Wiederverwendbare HTML-Partials
│   ├── shared/                   # Geteilte Komponenten
│   └── banken/                   # Banken-spezifische Partials
│
├── wrangler.toml                 # Cloudflare Konfiguration
├── _headers                      # Security Headers
└── _redirects                    # Routing-Regeln
```

## Lokale Entwicklung

```bash
# Einfacher HTTP Server
python3 -m http.server 8000

# Oder mit npx
npx serve .

# Mit Cloudflare Wrangler
npx wrangler pages dev .
```

Öffne dann `http://localhost:8000` im Browser.

## Architektur

### CSS-Architektur

Die CSS-Struktur folgt einer modularen Architektur mit 122 fokussierten Submodulen:

- **Core**: Variablen, Reset, Typography, Layout-Utilities
- **Components**: Buttons, Cards, Forms, Tables, Modals
- **Module**: Feature-spezifische Styles (Banken, Bestand, Versicherung)

### JavaScript-Architektur

Die JavaScript-Struktur verwendet ES2024 Module mit 46 fokussierten Submodulen:

- **Components**: Wiederverwendbare UI-Komponenten (DataTable, Modal, Toast)
- **Modules**: Feature-spezifische Logik (Risikoscoring, Bestand, Chat)
- **Services**: API-Kommunikation und Storage
- **Helpers**: Utility-Funktionen (Formatierung, Validierung)

## Qualitätsmerkmale

### Performance

- Lazy Loading für Images
- Defer/Async für externe Scripts
- Event Delegation für bessere Memory-Effizienz
- Modulare CSS-Imports

### Barrierefreiheit (WCAG 2.1 AA)

- Semantisches HTML mit Landmarks
- Vollständige Tastatur-Navigation
- Skip-Links für Screenreader
- Fokus-Indikatoren
- ARIA-Labels für alle interaktiven Elemente

### Code-Qualität

- JSDoc-Dokumentation
- Keine Code-Duplizierung
- Einheitliche Naming-Conventions
- Modulare, wartbare Struktur

## Repository-Einstellungen

Das Repository kann nach dem Deployment auf **private** gestellt werden:

1. Gehe zu **Settings** - **General** - **Danger Zone**
2. Klicke auf **Change visibility** - **Make private**

Cloudflare Pages hat bereits Zugriff und wird weiterhin funktionieren.

## Dokumentation

- [Cloudflare Deployment Guide](./CLOUDFLARE_DEPLOYMENT.md)
- [API Setup](./API_SETUP.md)

## Lizenz

Private Repository - Alle Rechte vorbehalten.
