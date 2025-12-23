#!/usr/bin/env node
/**
 * VSTEike Cloudflare Feedback Setup
 *
 * Ausführen mit: node cloudflare/setup-cloudflare.js DEIN_API_TOKEN
 *
 * Beispiel: node cloudflare/setup-cloudflare.js smeDqVy-23GMK6G-8DEtt53ChZ_h-6F6PUkU2ayJ
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_TOKEN = process.argv[2];
const WORKER_NAME = 'vsteike-feedback';

if (!API_TOKEN) {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║         VSTEike Cloudflare Feedback Setup                  ║
╚════════════════════════════════════════════════════════════╝

Verwendung:
  node cloudflare/setup-cloudflare.js DEIN_API_TOKEN

So erhalten Sie einen API Token:
  1. Gehen Sie zu: https://dash.cloudflare.com/profile/api-tokens
  2. Klicken Sie "Create Token"
  3. Wählen Sie "Custom Token" → "Get started"
  4. Permissions:
     - Account → Workers KV Storage → Edit
     - Account → Workers Scripts → Edit
  5. Kopieren Sie den Token

Dann führen Sie aus:
  node cloudflare/setup-cloudflare.js IHR_TOKEN_HIER
`);
    process.exit(1);
}

// Helper für API Requests
function apiRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.cloudflare.com',
            path: `/client/v4${endpoint}`,
            method: method,
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Multipart Upload für Worker
function uploadWorker(accountId, kvId, workerScript) {
    return new Promise((resolve, reject) => {
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substr(2);

        const metadata = JSON.stringify({
            main_module: 'worker.js',
            bindings: [{
                type: 'kv_namespace',
                name: 'FEEDBACK',
                namespace_id: kvId
            }],
            compatibility_date: '2024-01-01'
        });

        const body = [
            `--${boundary}`,
            'Content-Disposition: form-data; name="metadata"',
            'Content-Type: application/json',
            '',
            metadata,
            `--${boundary}`,
            'Content-Disposition: form-data; name="worker.js"; filename="worker.js"',
            'Content-Type: application/javascript+module',
            '',
            workerScript,
            `--${boundary}--`
        ].join('\r\n');

        const options = {
            hostname: 'api.cloudflare.com',
            path: `/client/v4/accounts/${accountId}/workers/scripts/${WORKER_NAME}`,
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(responseBody));
                } catch (e) {
                    resolve(responseBody);
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function setup() {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║         VSTEike Cloudflare Feedback Setup                  ║
╚════════════════════════════════════════════════════════════╝
`);

    try {
        // 1. Account ID holen
        console.log('🔍 Ermittle Account ID...');
        const accounts = await apiRequest('GET', '/accounts');

        if (!accounts.success || !accounts.result?.length) {
            console.error('❌ Fehler: Konnte Account nicht finden');
            console.error('   Prüfen Sie, ob der API Token korrekt ist.');
            if (accounts.errors) console.error('   Fehler:', accounts.errors);
            process.exit(1);
        }

        const accountId = accounts.result[0].id;
        const accountName = accounts.result[0].name;
        console.log(`✅ Account: ${accountName} (${accountId})`);

        // 2. KV Namespace erstellen
        console.log('\n📦 Erstelle KV Namespace...');
        let kvId;

        // Prüfen ob schon existiert
        const existingKV = await apiRequest('GET', `/accounts/${accountId}/storage/kv/namespaces`);
        const existing = existingKV.result?.find(kv => kv.title === 'FEEDBACK_KV');

        if (existing) {
            kvId = existing.id;
            console.log(`✅ KV Namespace existiert bereits: ${kvId}`);
        } else {
            const kvResult = await apiRequest('POST', `/accounts/${accountId}/storage/kv/namespaces`, {
                title: 'FEEDBACK_KV'
            });

            if (!kvResult.success) {
                console.error('❌ Fehler beim Erstellen des KV Namespace');
                if (kvResult.errors) console.error('   Fehler:', kvResult.errors);
                process.exit(1);
            }

            kvId = kvResult.result.id;
            console.log(`✅ KV Namespace erstellt: ${kvId}`);
        }

        // 3. Worker Script laden
        console.log('\n📄 Lade Worker Script...');
        const scriptPath = path.join(__dirname, 'feedback-worker.js');

        if (!fs.existsSync(scriptPath)) {
            console.error(`❌ Worker Script nicht gefunden: ${scriptPath}`);
            process.exit(1);
        }

        const workerScript = fs.readFileSync(scriptPath, 'utf8');
        console.log(`✅ Worker Script geladen (${workerScript.length} Bytes)`);

        // 4. Worker deployen
        console.log('\n🚀 Deploye Worker...');
        const deployResult = await uploadWorker(accountId, kvId, workerScript);

        if (!deployResult.success) {
            console.error('❌ Fehler beim Deployen des Workers');
            if (deployResult.errors) console.error('   Fehler:', JSON.stringify(deployResult.errors, null, 2));
            process.exit(1);
        }
        console.log('✅ Worker deployed!');

        // 5. Subdomain aktivieren
        console.log('\n🌐 Aktiviere workers.dev Subdomain...');
        await apiRequest('POST', `/accounts/${accountId}/workers/scripts/${WORKER_NAME}/subdomain`, {
            enabled: true
        });

        // 6. Subdomain ermitteln
        const subdomainInfo = await apiRequest('GET', `/accounts/${accountId}/workers/subdomain`);
        const subdomain = subdomainInfo.result?.subdomain;

        const workerUrl = subdomain
            ? `https://${WORKER_NAME}.${subdomain}.workers.dev`
            : `https://${WORKER_NAME}.workers.dev`;

        // 7. banken.js automatisch aktualisieren
        console.log('\n📝 Aktualisiere banken.js...');
        const bankenPath = path.join(__dirname, '..', 'js', 'banken.js');

        if (fs.existsSync(bankenPath)) {
            let bankenContent = fs.readFileSync(bankenPath, 'utf8');
            bankenContent = bankenContent.replace(
                /const FEEDBACK_API_URL = '[^']*';/,
                `const FEEDBACK_API_URL = '${workerUrl}';`
            );
            fs.writeFileSync(bankenPath, bankenContent);
            console.log('✅ banken.js aktualisiert!');
        }

        // Erfolg!
        console.log(`
╔════════════════════════════════════════════════════════════╗
║                    ✅ SETUP ERFOLGREICH!                   ║
╚════════════════════════════════════════════════════════════╝

Worker URL: ${workerUrl}

Die URL wurde automatisch in js/banken.js eingetragen.
Laden Sie die Seite neu - Ihre Kommentare werden jetzt
persistent in Cloudflare gespeichert!

Test: ${workerUrl}/feedback
`);

    } catch (error) {
        console.error('\n❌ Fehler:', error.message);
        process.exit(1);
    }
}

setup();
