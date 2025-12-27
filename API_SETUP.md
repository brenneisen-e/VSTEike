# API-Konfiguration für Chat-Funktionalität

## Übersicht

Das Dashboard verwendet die OpenAI API für KI-gestützte Chat-Funktionen. Ohne API-Key läuft das Dashboard im Mock-Modus mit vorgefertigten Antworten.

## Option 1: Mock-Modus (Standard)

**Empfohlen für Entwicklung und Tests**

Der Mock-Modus ist standardmäßig aktiviert und erfordert keine API-Keys.

```javascript
// In js/chat-common.js
const CHAT_CONFIG = {
    USE_MOCK_MODE: true  // Bereits aktiv
};
```

Der Mock-Modus bietet:
- Sofortige Antworten ohne API-Kosten
- Beispiel-Analysen für häufige Fragen
- Vollständige Dashboard-Funktionalität

## Option 2: OpenAI API (Produktiv)

**Für echte KI-Analysen**

### Schritt 1: OpenAI API-Key erhalten

1. Registriere dich bei [OpenAI](https://platform.openai.com/)
2. Navigiere zu API Keys: https://platform.openai.com/api-keys
3. Erstelle einen neuen API-Key
4. **WICHTIG**: Bewahre den Key sicher auf!

### Schritt 2: API-Key konfigurieren

#### Methode A: Direkt im Code (nur für lokale Entwicklung)

**WARNUNG**: Committen Sie niemals echte API-Keys in Git!

```javascript
// In js/chat-common.js
const CHAT_CONFIG = {
    OPENAI_API_KEY: 'sk-proj-...',  // Füge deinen Key hier ein
    USE_MOCK_MODE: false,            // Deaktiviere Mock-Modus
    MODEL: 'gpt-4o',
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7
};
```

#### Methode B: Environment Variables (empfohlen für Produktion)

1. Kopiere `.env.example` nach `.env.local`
2. Füge deinen API-Key in `.env.local` ein
3. Verwende ein Build-Tool (Webpack, Vite, etc.) um ENV-Variablen zu injizieren

```bash
# .env.local
OPENAI_API_KEY=sk-proj-your-actual-key-here
USE_MOCK_MODE=false
```

### Schritt 3: Testen

1. Öffne das Dashboard
2. Lade CSV-Daten hoch
3. Öffne den Chat (Chat-Button unten rechts)
4. Stelle eine Frage wie "Zeige die Top 5 Vermittler"
5. Du solltest eine KI-generierte Antwort erhalten

## Sicherheitshinweise

### NIEMALS:

- API-Keys in Git committen
- API-Keys im Client-Code für Produktion
- API-Keys in öffentlichen Repositories
- Denselben Key für mehrere Projekte nutzen

### IMMER:

- API-Keys in `.env.local` oder ähnlich speichern
- `.env.local` in `.gitignore` eintragen
- Für Produktion: API-Calls über Backend-Server
- API-Keys regelmäßig rotieren
- Nutzungs-Limits in OpenAI Dashboard setzen

## Produktions-Setup (empfohlen)

Für Produktions-Deployments sollten API-Calls **nicht direkt vom Client** erfolgen:

```
Browser -> Ihr Backend -> OpenAI API
```

**Vorteile:**
- API-Keys bleiben serverseitig sicher
- Rate-Limiting und Caching möglich
- Kostenüberwachung zentralisiert
- Keine CORS-Probleme

### Beispiel Backend-Endpunkt (Node.js/Express)

```javascript
// server.js
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "user", content: message }]
        })
    });

    const data = await response.json();
    res.json(data);
});
```

## Kosten

OpenAI API-Kosten (Stand 2024):
- **GPT-4o**: ca. $2.50 / 1M Input-Tokens, ca. $10 / 1M Output-Tokens
- **GPT-4o-mini**: ca. $0.15 / 1M Input-Tokens, ca. $0.60 / 1M Output-Tokens

Durchschnittliche Dashboard-Anfrage: ca. 500 Input + 800 Output Tokens
- GPT-4o: ca. $0.009 pro Chat-Anfrage
- GPT-4o-mini: ca. $0.0005 pro Chat-Anfrage

## Troubleshooting

### "API request failed: 401"

- API-Key korrekt eingefügt?
- Key aktiv in OpenAI Dashboard?
- Billing aktiviert?

### "API request failed: 429"

- Rate-Limit erreicht
- Warte 1 Minute oder upgrade Plan

### "Mock-Modus trotz API-Key"

- `USE_MOCK_MODE` auf `false` setzen
- Browser-Cache leeren (Strg+Shift+R)

## Support

Bei Problemen:
1. Prüfe Browser-Konsole (F12)
2. Prüfe OpenAI API Logs: https://platform.openai.com/usage
3. Teste API-Key mit curl:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```
