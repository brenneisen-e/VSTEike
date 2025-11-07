# VSTEike - Vertriebssteuerungs-Cockpit

[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-orange)](https://pages.cloudflare.com/)
[![Version](https://img.shields.io/badge/Version-v19-blue)](https://github.com/brenneisen-e/VSTEike)

KI-gestütztes Dashboard für Vertriebssteuerung mit interaktiven KPIs, geografischen Visualisierungen und Datenanalyse.

## 🚀 Deployment

Die App ist für **Cloudflare Pages** optimiert und kann direkt aus GitHub deployed werden.

**Deployment-Anleitung**: Siehe [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)

## 📊 Features

- **Interaktives Dashboard** mit Echtzeit-KPIs
- **Geografische Visualisierung** auf Landkreis-Ebene
- **KI-gestützter Chat-Assistent** (OpenAI Integration)
- **CSV-Datenimport** und -verarbeitung
- **Multi-dimensionale Filter** (Jahr, Agentur, Segment, Silo)
- **Responsive Design** für alle Bildschirmgrößen

## 🛠️ Technologie-Stack

- **Frontend**: Pure HTML, CSS, JavaScript (Vanilla)
- **Charts**: Chart.js, D3.js
- **Maps**: Leaflet.js
- **Hosting**: Cloudflare Pages
- **KI**: OpenAI API

## 📦 Struktur

```
VSTEike/
├── index.html              # Haupt-Dashboard
├── csv-generator.html      # CSV-Test-Daten Generator
├── css/
│   └── styles.css         # Alle Styles
├── js/
│   ├── config.js          # Konfiguration
│   ├── data.js            # Datenverarbeitung
│   ├── charts.js          # Chart-Logik
│   ├── map-counties.js    # Kartenvisualisierung
│   ├── chat.js            # KI-Chat
│   ├── landing.js         # Landing Page
│   ├── main.js            # Hauptlogik
│   └── tables.js          # Tabellenansicht
├── wrangler.toml          # Cloudflare Konfiguration
├── _headers               # Security Headers
└── _redirects             # Routing-Regeln
```

## 🔧 Lokale Entwicklung

```bash
# Einfacher HTTP Server
python3 -m http.server 8000

# Oder mit npx
npx serve .

# Mit Cloudflare Wrangler
npx wrangler pages dev .
```

Öffne dann `http://localhost:8000` im Browser.

## 🔒 Repository auf Private stellen

Das Repository kann nach dem Deployment auf **private** gestellt werden:

1. Gehe zu **Settings** → **General** → **Danger Zone**
2. Klicke auf **Change visibility** → **Make private**

Cloudflare Pages hat bereits Zugriff und wird weiterhin funktionieren.

## 📝 Weitere Dokumentation

- [Cloudflare Deployment Guide](./CLOUDFLARE_DEPLOYMENT.md)
- [API Setup](./API_SETUP.md)
- [Optimierungen](./OPTIMIZATIONS.md)

## 📄 Lizenz

Private Repository - Alle Rechte vorbehalten.
