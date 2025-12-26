# Cloudflare Worker - Claude API Proxy

## Setup-Anleitung

### 1. Worker in Cloudflare erstellen

1. Gehe zu [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Wähle "Workers & Pages" → "Create Application" → "Create Worker"
3. Gib dem Worker einen Namen (z.B. `claude-proxy`)
4. Ersetze den Code mit dem Inhalt von `worker.js`
5. Klicke "Deploy"

### 2. Secret hinzufügen

1. Gehe zu deinem Worker → "Settings" → "Variables"
2. Unter "Environment Variables" klicke "Add variable"
3. Name: `CLAUDE_API_KEY`
4. Value: `sk-ant-api03-...` (dein API Key)
5. Klicke "Encrypt" um es als Secret zu speichern
6. Klicke "Save and Deploy"

### 3. Worker-URL in der App eintragen

Deine Worker-URL sieht so aus:
```
https://claude-proxy.<dein-account>.workers.dev
```

Trage diese URL in `js/chat.js` und `js/landing.js` ein:
```javascript
const CLAUDE_WORKER_URL = 'https://claude-proxy.dein-account.workers.dev';
```

### Fertig!

Jetzt werden alle API-Anfragen über deinen Worker geleitet. Der API-Key bleibt sicher in Cloudflare und ist nie im Browser sichtbar.
