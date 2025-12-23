/**
 * VSTEike Feedback Worker
 *
 * Cloudflare Worker für persistente Feedback-Speicherung
 *
 * SETUP-ANLEITUNG:
 * 1. Gehe zu https://dash.cloudflare.com
 * 2. Workers & Pages → Create application → Create Worker
 * 3. Kopiere diesen Code in den Worker Editor
 * 4. Gehe zu Settings → Variables → KV Namespace Bindings
 * 5. Erstelle einen neuen KV Namespace namens "FEEDBACK_KV"
 * 6. Binde ihn als Variable "FEEDBACK" an
 * 7. Deploy den Worker
 * 8. Kopiere die Worker-URL und trage sie in banken.js ein
 */

// CORS Headers für Cross-Origin Requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

export default {
    async fetch(request, env, ctx) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // GET /feedback - Alle Feedbacks laden
            if (request.method === 'GET' && path === '/feedback') {
                const feedbackList = await env.FEEDBACK.get('feedbacks', 'json') || [];
                return new Response(JSON.stringify({
                    success: true,
                    data: feedbackList,
                    count: feedbackList.length
                }), { headers: corsHeaders });
            }

            // POST /feedback - Neues Feedback speichern
            if (request.method === 'POST' && path === '/feedback') {
                const body = await request.json();

                // Validierung
                if (!body.text || body.text.trim() === '') {
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Kommentar darf nicht leer sein'
                    }), { status: 400, headers: corsHeaders });
                }

                // Bestehende Feedbacks laden
                const feedbackList = await env.FEEDBACK.get('feedbacks', 'json') || [];

                // Neues Feedback erstellen
                const newFeedback = {
                    id: Date.now().toString(),
                    author: body.author || 'Anonym',
                    area: body.area || 'allgemein',
                    type: body.type || 'verbesserung',
                    text: body.text.trim(),
                    timestamp: new Date().toISOString(),
                    url: body.url || '',
                    userAgent: (body.userAgent || '').substring(0, 100),
                    screenshot: body.screenshot || null
                };

                // Am Anfang hinzufügen (neueste zuerst)
                feedbackList.unshift(newFeedback);

                // In KV speichern
                await env.FEEDBACK.put('feedbacks', JSON.stringify(feedbackList));

                return new Response(JSON.stringify({
                    success: true,
                    data: newFeedback,
                    message: 'Feedback gespeichert'
                }), { status: 201, headers: corsHeaders });
            }

            // POST /feedback/:id/reply - Antwort hinzufügen
            if (request.method === 'POST' && path.match(/^\/feedback\/[^/]+\/reply$/)) {
                const id = path.split('/')[2];
                const body = await request.json();

                if (!body.text || body.text.trim() === '') {
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Antwort darf nicht leer sein'
                    }), { status: 400, headers: corsHeaders });
                }

                const feedbackList = await env.FEEDBACK.get('feedbacks', 'json') || [];
                const feedbackIndex = feedbackList.findIndex(f => f.id === id);

                if (feedbackIndex === -1) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Feedback nicht gefunden'
                    }), { status: 404, headers: corsHeaders });
                }

                // Reply erstellen
                const reply = {
                    id: Date.now().toString(),
                    author: body.author || 'Anonym',
                    text: body.text.trim(),
                    timestamp: body.timestamp || new Date().toISOString()
                };

                // Replies Array initialisieren falls nicht vorhanden
                if (!feedbackList[feedbackIndex].replies) {
                    feedbackList[feedbackIndex].replies = [];
                }

                feedbackList[feedbackIndex].replies.push(reply);

                await env.FEEDBACK.put('feedbacks', JSON.stringify(feedbackList));

                return new Response(JSON.stringify({
                    success: true,
                    data: reply,
                    message: 'Antwort hinzugefügt'
                }), { status: 201, headers: corsHeaders });
            }

            // DELETE /feedback/:id - Feedback löschen
            if (request.method === 'DELETE' && path.startsWith('/feedback/') && !path.includes('/reply')) {
                const id = path.split('/')[2];

                if (!id) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Feedback-ID erforderlich'
                    }), { status: 400, headers: corsHeaders });
                }

                const feedbackList = await env.FEEDBACK.get('feedbacks', 'json') || [];
                const filteredList = feedbackList.filter(f => f.id !== id);

                if (feedbackList.length === filteredList.length) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Feedback nicht gefunden'
                    }), { status: 404, headers: corsHeaders });
                }

                await env.FEEDBACK.put('feedbacks', JSON.stringify(filteredList));

                return new Response(JSON.stringify({
                    success: true,
                    message: 'Feedback gelöscht'
                }), { headers: corsHeaders });
            }

            // GET /stats - Statistiken
            if (request.method === 'GET' && path === '/stats') {
                const feedbackList = await env.FEEDBACK.get('feedbacks', 'json') || [];

                const stats = {
                    total: feedbackList.length,
                    byType: {},
                    byArea: {},
                    lastFeedback: feedbackList[0]?.timestamp || null
                };

                feedbackList.forEach(f => {
                    stats.byType[f.type] = (stats.byType[f.type] || 0) + 1;
                    stats.byArea[f.area] = (stats.byArea[f.area] || 0) + 1;
                });

                return new Response(JSON.stringify({
                    success: true,
                    data: stats
                }), { headers: corsHeaders });
            }

            // 404 für unbekannte Routen
            return new Response(JSON.stringify({
                success: false,
                error: 'Route nicht gefunden',
                availableRoutes: [
                    'GET /feedback',
                    'POST /feedback',
                    'POST /feedback/:id/reply',
                    'DELETE /feedback/:id',
                    'GET /stats'
                ]
            }), { status: 404, headers: corsHeaders });

        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Interner Serverfehler: ' + error.message
            }), { status: 500, headers: corsHeaders });
        }
    }
};
