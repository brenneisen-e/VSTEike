# Cloudflare Feedback System - Setup Anleitung

Diese Anleitung erklärt, wie Sie das Feedback-System mit Cloudflare Workers einrichten.

## Voraussetzungen

- Ein Cloudflare-Konto (kostenlos unter https://cloudflare.com)
- Ca. 10 Minuten Zeit

## Schritt 1: Cloudflare Worker erstellen

1. Melden Sie sich bei https://dash.cloudflare.com an
2. Klicken Sie links auf **Workers & Pages**
3. Klicken Sie auf **Create application** → **Create Worker**
4. Geben Sie einen Namen ein, z.B. `vsteike-feedback`
5. Klicken Sie auf **Deploy**

## Schritt 2: Worker-Code einfügen

1. Nach dem Deployment klicken Sie auf **Edit code**
2. Löschen Sie den bestehenden Code
3. Kopieren Sie den kompletten Inhalt von `feedback-worker.js` hinein
4. Klicken Sie auf **Save and Deploy**

## Schritt 3: KV Namespace erstellen

1. Gehen Sie zu **Workers & Pages** → Ihr Worker → **Settings**
2. Scrollen Sie zu **Bindings** → Klicken Sie auf **Add**
3. Wählen Sie **KV Namespace**
4. Klicken Sie auf **Create a namespace**
5. Geben Sie als Namen `FEEDBACK_KV` ein
6. Klicken Sie auf **Add**
7. Bei **Variable name** geben Sie `FEEDBACK` ein
8. Klicken Sie auf **Save**

## Schritt 4: Worker-URL in banken.js eintragen

1. Kopieren Sie die Worker-URL (z.B. `https://vsteike-feedback.IHR-ACCOUNT.workers.dev`)
2. Öffnen Sie `js/banken.js`
3. Suchen Sie diese Zeile (ca. Zeile 14):
   ```javascript
   const FEEDBACK_API_URL = 'https://vsteike-feedback.DEIN-ACCOUNT.workers.dev';
   ```
4. Ersetzen Sie die URL mit Ihrer Worker-URL

## Fertig!

Nach dem Speichern werden alle Kommentare persistent in Cloudflare gespeichert und sind von allen Geräten aus sichtbar.

## API Endpunkte

Der Worker bietet folgende Endpunkte:

| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| GET | /feedback | Alle Feedbacks laden |
| POST | /feedback | Neues Feedback speichern |
| DELETE | /feedback/:id | Feedback löschen |
| GET | /stats | Statistiken anzeigen |

## Kosten

Cloudflare Workers ist kostenlos bis zu:
- 100.000 Requests/Tag
- 10ms CPU-Zeit pro Request
- 1GB KV Speicher

Für ein Feedback-System ist das mehr als ausreichend.

## Fehlerbehebung

### Feedbacks werden nicht geladen
- Prüfen Sie, ob die Worker-URL korrekt ist
- Öffnen Sie die Browser-Konsole (F12) für Fehlermeldungen

### CORS-Fehler
- Der Worker ist bereits für CORS konfiguriert
- Stellen Sie sicher, dass Sie den kompletten Code kopiert haben

### KV-Fehler
- Prüfen Sie, ob der KV Namespace korrekt gebunden ist
- Variable name muss exakt `FEEDBACK` lauten

## Unterstützung

Bei Fragen wenden Sie sich an das Entwicklungsteam.
