#!/bin/bash
# VSTEike Cloudflare Feedback Setup Script
# Führen Sie dieses Script in einem Terminal aus

# ============================================
# KONFIGURATION - Bitte anpassen!
# ============================================
API_TOKEN="smeDqVy-23GMK6G-8DEtt53ChZ_h-6F6PUkU2ayJ"
WORKER_NAME="vsteike-feedback"

# ============================================
# 1. Account ID ermitteln
# ============================================
echo "[CHECK] Ermittle Account ID..."
ACCOUNT_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json")

ACCOUNT_ID=$(echo $ACCOUNT_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$ACCOUNT_ID" ]; then
    echo "[ERROR] Fehler: Konnte Account ID nicht ermitteln"
    echo "Response: $ACCOUNT_RESPONSE"
    exit 1
fi

echo "[OK] Account ID: $ACCOUNT_ID"

# ============================================
# 2. KV Namespace erstellen
# ============================================
echo ""
echo "[INFO] Erstelle KV Namespace..."
KV_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/storage/kv/namespaces" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"title":"FEEDBACK_KV"}')

KV_ID=$(echo $KV_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$KV_ID" ]; then
    # Vielleicht existiert er schon - versuche zu finden
    echo "[WARNING] KV existiert möglicherweise bereits, suche..."
    KV_LIST=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/storage/kv/namespaces" \
      -H "Authorization: Bearer $API_TOKEN")
    KV_ID=$(echo $KV_LIST | grep -o '"id":"[^"]*","title":"FEEDBACK_KV"' | head -1 | cut -d'"' -f4)
fi

if [ -z "$KV_ID" ]; then
    echo "[ERROR] Fehler: Konnte KV Namespace nicht erstellen"
    exit 1
fi

echo "[OK] KV Namespace ID: $KV_ID"

# ============================================
# 3. Worker erstellen
# ============================================
echo ""
echo "[START] Erstelle Worker..."

# Worker Script aus Datei lesen
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKER_SCRIPT=$(cat "$SCRIPT_DIR/feedback-worker.js")

# Worker mit Metadata erstellen
METADATA='{
  "main_module": "worker.js",
  "bindings": [
    {
      "type": "kv_namespace",
      "name": "FEEDBACK",
      "namespace_id": "'$KV_ID'"
    }
  ]
}'

# Multipart form data für Worker upload
WORKER_RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/scripts/$WORKER_NAME" \
  -H "Authorization: Bearer $API_TOKEN" \
  -F "metadata=$METADATA;type=application/json" \
  -F "worker.js=@$SCRIPT_DIR/feedback-worker.js;type=application/javascript+module")

if echo "$WORKER_RESPONSE" | grep -q '"success":true'; then
    echo "[OK] Worker erstellt!"
else
    echo "[WARNING] Worker Response: $WORKER_RESPONSE"
fi

# ============================================
# 4. Worker subdomain aktivieren (workers.dev)
# ============================================
echo ""
echo "[INFO] Aktiviere workers.dev Subdomain..."

SUBDOMAIN_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/scripts/$WORKER_NAME/subdomain" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"enabled":true}')

# ============================================
# 5. Worker URL ermitteln
# ============================================
echo ""
echo "[INFO] Ermittle Worker URL..."

# Account subdomain holen
SUBDOMAIN_INFO=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/subdomain" \
  -H "Authorization: Bearer $API_TOKEN")

SUBDOMAIN=$(echo $SUBDOMAIN_INFO | grep -o '"subdomain":"[^"]*"' | cut -d'"' -f4)

if [ -n "$SUBDOMAIN" ]; then
    WORKER_URL="https://$WORKER_NAME.$SUBDOMAIN.workers.dev"
    echo ""
    echo "============================================"
    echo "[OK] SETUP ABGESCHLOSSEN!"
    echo "============================================"
    echo ""
    echo "Worker URL: $WORKER_URL"
    echo ""
    echo "Bitte tragen Sie diese URL in js/banken.js ein:"
    echo ""
    echo "  const FEEDBACK_API_URL = '$WORKER_URL';"
    echo ""
    echo "============================================"
else
    echo ""
    echo "============================================"
    echo "[OK] Worker wurde erstellt!"
    echo "============================================"
    echo ""
    echo "Bitte prüfen Sie die Worker URL im Cloudflare Dashboard:"
    echo "https://dash.cloudflare.com → Workers & Pages → $WORKER_NAME"
    echo ""
fi
