// ========================================
// MODULE SWITCHING (Versicherung/Banken/Asset Manager)
// ========================================

// Track if Banken module has been loaded
let bankenModuleLoaded = false;

// ========================================
// CLOUDFLARE FEEDBACK SYSTEM
// ========================================

// Cloudflare Worker API URL - BITTE MIT EIGENER WORKER-URL ERSETZEN
// Anleitung: Siehe cloudflare/feedback-worker.js
const FEEDBACK_API_URL = 'https://vsteike-feedback.eike-3e2.workers.dev';

// Alternative: Wenn keine Cloudflare-URL konfiguriert, nutze LocalStorage
const USE_CLOUDFLARE = !FEEDBACK_API_URL.includes('DEIN-ACCOUNT');

let currentFeedbackType = 'verbesserung';
let currentFeedbackList = []; // Globale Liste für Edit/Delete-Zugriff

// Feedback System initialisieren
function initFeedbackSystem() {
    // Autor-Auswahl initialisieren
    initAuthorSelect();

    if (USE_CLOUDFLARE) {
        console.log('✅ Cloudflare Feedback System aktiv');
        loadFeedbackFromCloudflare();
    } else {
        console.log('⚠️ Cloudflare nicht konfiguriert, nutze LocalStorage');
        console.log('📝 Konfiguriere FEEDBACK_API_URL in banken.js für persistente Speicherung');
        loadFeedbackFromLocalStorage();
    }
}

// Feedback Panel ein/ausblenden
function toggleFeedbackPanel() {
    const panel = document.getElementById('feedbackPanel');
    if (panel) {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
            // Autor aus LocalStorage laden
            const savedAuthor = localStorage.getItem('feedbackAuthor');
            if (savedAuthor) {
                document.getElementById('feedbackAuthor').value = savedAuthor;
            }
        }
    }
}

// Feedback-Typ setzen
function setFeedbackType(type) {
    currentFeedbackType = type;
    document.querySelectorAll('.feedback-type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
}

// Autor-Auswahl Handler
function handleAuthorSelect() {
    const select = document.getElementById('feedbackAuthorSelect');
    const input = document.getElementById('feedbackAuthor');

    if (select.value === 'custom') {
        input.style.display = 'block';
        input.focus();
    } else if (select.value) {
        input.style.display = 'none';
        input.value = select.value;
    } else {
        input.style.display = 'none';
        input.value = '';
    }
}

// Autor-Auswahl initialisieren (bei Laden)
function initAuthorSelect() {
    const savedAuthor = localStorage.getItem('feedbackAuthor');
    const select = document.getElementById('feedbackAuthorSelect');
    const input = document.getElementById('feedbackAuthor');

    if (!select || !input) return;

    if (savedAuthor === 'Eike' || savedAuthor === 'Bianca') {
        select.value = savedAuthor;
        input.value = savedAuthor;
        input.style.display = 'none';
    } else if (savedAuthor) {
        select.value = 'custom';
        input.value = savedAuthor;
        input.style.display = 'block';
    }
}

// Antwort-Autor-Auswahl Handler
function handleReplyAuthorSelect() {
    const select = document.getElementById('replyAuthorSelect');
    const input = document.getElementById('replyAuthor');

    if (select.value === 'custom') {
        input.style.display = 'block';
        input.focus();
    } else if (select.value) {
        input.style.display = 'none';
        input.value = select.value;
    } else {
        input.style.display = 'none';
        input.value = '';
    }
}

// Feedback speichern
async function submitFeedback() {
    const author = document.getElementById('feedbackAuthor').value.trim() || 'Anonym';
    const area = document.getElementById('feedbackArea').value;
    const text = document.getElementById('feedbackText').value.trim();

    if (!text) {
        alert('Bitte gib einen Kommentar ein.');
        return;
    }

    // Autor für nächstes Mal speichern
    localStorage.setItem('feedbackAuthor', author);

    const feedback = {
        author: author,
        area: area,
        type: currentFeedbackType,
        text: text,
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 100),
        screenshot: currentScreenshotData || null
    };

    // Falls wir bearbeiten: erst löschen, dann neu erstellen
    if (editingFeedbackId) {
        if (USE_CLOUDFLARE) {
            try {
                await fetch(`${FEEDBACK_API_URL}/feedback/${editingFeedbackId}`, { method: 'DELETE' });
            } catch (e) {
                console.log('Altes Feedback löschen fehlgeschlagen:', e);
            }
        } else {
            const feedbacks = JSON.parse(localStorage.getItem('bankenFeedback') || '[]');
            const filtered = feedbacks.filter(f => f.id !== editingFeedbackId && f.id !== parseInt(editingFeedbackId));
            localStorage.setItem('bankenFeedback', JSON.stringify(filtered));
        }
        editingFeedbackId = null;
    }

    if (USE_CLOUDFLARE) {
        await saveFeedbackToCloudflare(feedback);
    } else {
        saveFeedbackToLocalStorage({ ...feedback, id: Date.now(), timestamp: new Date().toISOString() });
    }

    // Formular zurücksetzen
    document.getElementById('feedbackText').value = '';
    removeScreenshot();

    // Button-Text zurücksetzen
    const submitBtn = document.querySelector('.feedback-submit-btn');
    if (submitBtn) {
        submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            Feedback speichern
        `;
    }
}

// Cloudflare: Feedback speichern
async function saveFeedbackToCloudflare(feedback) {
    try {
        const response = await fetch(`${FEEDBACK_API_URL}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedback)
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('feedbackText').value = '';
            showFeedbackNotification('Feedback gespeichert!');
            loadFeedbackFromCloudflare();
        } else {
            throw new Error(result.error || 'Unbekannter Fehler');
        }
    } catch (error) {
        console.error('Cloudflare Fehler:', error);
        showFeedbackNotification('Fehler: ' + error.message, 'error');
        // Fallback zu LocalStorage
        saveFeedbackToLocalStorage({ ...feedback, id: Date.now(), timestamp: new Date().toISOString() });
    }
}

// Cloudflare: Feedback laden
async function loadFeedbackFromCloudflare() {
    // Verwende vorgeladene Daten falls verfügbar
    if (window.preloadedFeedback && !window.feedbackAlreadyLoaded) {
        console.log('📦 Verwende vorgeladene Feedback-Daten');
        renderFeedbackList(window.preloadedFeedback);
        updateFeedbackBadge(window.preloadedFeedback.length);
        window.feedbackAlreadyLoaded = true;
        return;
    }

    try {
        console.log('📡 Lade Feedback von Cloudflare:', FEEDBACK_API_URL);
        const response = await fetch(`${FEEDBACK_API_URL}/feedback`);
        const result = await response.json();

        if (result.success) {
            console.log(`✅ ${result.count} Feedbacks von Cloudflare geladen`);
            renderFeedbackList(result.data);
            updateFeedbackBadge(result.count);
        } else {
            throw new Error(result.error || 'Laden fehlgeschlagen');
        }
    } catch (error) {
        console.error('❌ Cloudflare Laden Fehler:', error);
        console.log('⚠️ Fallback zu LocalStorage...');
        loadFeedbackFromLocalStorage();
    }
}

// LocalStorage Fallback
function saveFeedbackToLocalStorage(feedback) {
    const feedbacks = JSON.parse(localStorage.getItem('bankenFeedback') || '[]');
    feedbacks.unshift(feedback);
    localStorage.setItem('bankenFeedback', JSON.stringify(feedbacks));
    loadFeedbackFromLocalStorage();
    document.getElementById('feedbackText').value = '';
    showFeedbackNotification('Feedback lokal gespeichert (nur in diesem Browser)');
}

// Feedback aus LocalStorage laden
function loadFeedbackFromLocalStorage() {
    const feedbacks = JSON.parse(localStorage.getItem('bankenFeedback') || '[]');
    renderFeedbackList(feedbacks);
    updateFeedbackBadge(feedbacks.length);
}

// Feedback-Liste rendern
function renderFeedbackList(feedbacks) {
    const listEl = document.getElementById('feedbackList');
    if (!listEl) return;

    // Global speichern für Edit/Delete-Zugriff
    currentFeedbackList = feedbacks;

    // Debug: Anzahl Feedbacks mit Screenshots
    const withScreenshots = feedbacks.filter(f => f.screenshot).length;
    console.log(`📋 Rendere ${feedbacks.length} Feedbacks (${withScreenshots} mit Screenshot)`);

    if (feedbacks.length === 0) {
        listEl.innerHTML = '<div class="feedback-empty">Noch keine Kommentare vorhanden.</div>';
        return;
    }

    const typeIcons = {
        'verbesserung': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>',
        'fehler': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        'frage': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        'lob': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"></path></svg>'
    };

    const areaLabels = {
        'allgemein': 'Allgemein',
        'dashboard': 'Dashboard',
        'kundenakte': 'Kundenakte',
        'konten-finanzen': 'Konten & Finanzen',
        'kommunikation': 'Kommunikation',
        'ki-analyse': 'KI-Analyse',
        'design': 'Design/UI',
        'daten': 'Daten',
        'funktion': 'Funktion'
    };

    listEl.innerHTML = feedbacks.map((fb, index) => {
        const date = new Date(fb.timestamp);
        const dateStr = date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

        // Bild-Indikator (falls Screenshot vorhanden)
        const hasImageIndicator = fb.screenshot
            ? `<span class="feedback-has-image" title="Mit Screenshot">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                   <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                   <circle cx="8.5" cy="8.5" r="1.5"></circle>
                   <polyline points="21 15 16 10 5 21"></polyline>
                 </svg>
               </span>`
            : '';

        // Antworten-Indikator
        const replyCount = fb.replies ? fb.replies.length : 0;
        const hasRepliesIndicator = replyCount > 0
            ? `<span class="feedback-has-replies" title="${replyCount} Antwort${replyCount !== 1 ? 'en' : ''}">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                   <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                 </svg>
                 ${replyCount}
               </span>`
            : '';

        // Text kürzen für Vorschau
        const shortText = fb.text.length > 80 ? fb.text.substring(0, 80) + '...' : fb.text;

        return `
            <div class="feedback-item ${fb.type}" data-id="${fb.id}" onclick="openFeedbackDetail(${index})">
                <div class="feedback-item-header">
                    <span class="feedback-item-type">${typeIcons[fb.type] || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg>'}</span>
                    <span class="feedback-item-author">${fb.author}</span>
                    <span class="feedback-item-area">${areaLabels[fb.area] || fb.area}</span>
                    ${hasImageIndicator}
                    ${hasRepliesIndicator}
                    <span class="feedback-item-date">${dateStr}</span>
                </div>
                <div class="feedback-item-text">${shortText}</div>
            </div>
        `;
    }).join('');
}

// Feedback-Detail-Ansicht öffnen
function openFeedbackDetail(index) {
    const fb = currentFeedbackList[index];
    if (!fb) return;

    console.log(`📝 Öffne Feedback Detail #${index}:`, fb.id, 'Screenshot:', fb.screenshot ? 'Ja (' + fb.screenshot.length + ' bytes)' : 'Nein');

    const typeLabels = {
        'verbesserung': 'Verbesserung',
        'fehler': 'Fehler',
        'frage': 'Frage',
        'lob': 'Lob'
    };

    const areaLabels = {
        'allgemein': 'Allgemein',
        'dashboard': 'Dashboard',
        'kundenakte': 'Kundenakte',
        'konten-finanzen': 'Konten & Finanzen',
        'kommunikation': 'Kommunikation',
        'ki-analyse': 'KI-Analyse',
        'design': 'Design/UI',
        'daten': 'Daten',
        'funktion': 'Funktion'
    };

    const date = new Date(fb.timestamp);
    const dateStr = date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    // Screenshot HTML für Detail-Ansicht
    const screenshotHtml = fb.screenshot
        ? `<div class="feedback-detail-screenshot">
             <img src="${fb.screenshot}" alt="Screenshot" onclick="openScreenshotLightbox(this.src)">
           </div>`
        : '';

    // Antworten HTML
    const replies = fb.replies || [];
    const repliesHtml = replies.length > 0
        ? `<div class="feedback-replies">
             <h4 class="replies-title">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                     <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                 </svg>
                 ${replies.length} Antwort${replies.length !== 1 ? 'en' : ''}
             </h4>
             ${replies.map(reply => {
                 const replyDate = new Date(reply.timestamp);
                 const replyDateStr = replyDate.toLocaleDateString('de-DE') + ' ' + replyDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                 return `
                     <div class="feedback-reply">
                         <div class="reply-header">
                             <span class="reply-author">${reply.author}</span>
                             <span class="reply-date">${replyDateStr}</span>
                         </div>
                         <div class="reply-text">${reply.text}</div>
                     </div>
                 `;
             }).join('')}
           </div>`
        : '';

    // Modal erstellen oder wiederverwenden
    let modal = document.getElementById('feedbackDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'feedbackDetailModal';
        modal.className = 'feedback-detail-modal';
        document.body.appendChild(modal);
    }

    // Gespeicherten Autor laden
    const savedAuthor = localStorage.getItem('feedbackAuthor') || '';

    modal.innerHTML = `
        <div class="feedback-detail-content">
            <div class="feedback-detail-header">
                <h3>Kommentar Details</h3>
                <button class="feedback-detail-close" onclick="closeFeedbackDetail()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="feedback-detail-body">
                <div class="feedback-detail-meta">
                    <span class="feedback-detail-author">${fb.author}</span>
                    <span class="feedback-detail-type ${fb.type}">${typeLabels[fb.type] || fb.type}</span>
                    <span class="feedback-detail-area">${areaLabels[fb.area] || fb.area}</span>
                    <span class="feedback-detail-date">${dateStr}</span>
                </div>
                <div class="feedback-detail-text">${fb.text}</div>
                ${screenshotHtml}
                ${repliesHtml}
                <div class="feedback-reply-form">
                    <h4 class="reply-form-title">Antworten</h4>
                    <div class="reply-author-wrapper">
                        <select id="replyAuthorSelect" onchange="handleReplyAuthorSelect()" class="reply-author-select">
                            <option value="">-- Wähle --</option>
                            <option value="Eike" ${savedAuthor === 'Eike' ? 'selected' : ''}>Eike</option>
                            <option value="Bianca" ${savedAuthor === 'Bianca' ? 'selected' : ''}>Bianca</option>
                            <option value="custom" ${savedAuthor && savedAuthor !== 'Eike' && savedAuthor !== 'Bianca' ? 'selected' : ''}>Anderer Name...</option>
                        </select>
                        <input type="text" id="replyAuthor" placeholder="Dein Name" value="${savedAuthor}" class="reply-author-input" style="display: ${savedAuthor && savedAuthor !== 'Eike' && savedAuthor !== 'Bianca' ? 'block' : 'none'};">
                    </div>
                    <textarea id="replyText" placeholder="Deine Antwort..." class="reply-text-input"></textarea>
                    <button class="reply-submit-btn" onclick="submitReply('${fb.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                        Antwort senden
                    </button>
                </div>
            </div>
            <div class="feedback-detail-actions">
                <button class="feedback-detail-btn edit" onclick="closeFeedbackDetail(); editFeedbackByIndex(${index});">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Bearbeiten
                </button>
                <button class="feedback-detail-btn delete" onclick="closeFeedbackDetail(); deleteFeedback('${fb.id}');">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Löschen
                </button>
            </div>
        </div>
    `;

    modal.classList.add('open');

    // Klick außerhalb schließt Modal
    modal.onclick = (e) => {
        if (e.target === modal) closeFeedbackDetail();
    };
}

// Feedback-Detail schließen
function closeFeedbackDetail() {
    const modal = document.getElementById('feedbackDetailModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

// Antwort auf Kommentar senden
async function submitReply(feedbackId) {
    const authorInput = document.getElementById('replyAuthor');
    const textInput = document.getElementById('replyText');

    const author = authorInput.value.trim() || 'Anonym';
    const text = textInput.value.trim();

    if (!text) {
        showFeedbackNotification('Bitte gib eine Antwort ein');
        return;
    }

    // Autor speichern
    localStorage.setItem('feedbackAuthor', author);

    const reply = {
        id: Date.now(),
        author: author,
        text: text,
        timestamp: new Date().toISOString()
    };

    if (USE_CLOUDFLARE) {
        try {
            const response = await fetch(`${FEEDBACK_API_URL}/feedback/${feedbackId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reply)
            });

            const result = await response.json();

            if (result.success) {
                showFeedbackNotification('Antwort gesendet!');
                textInput.value = '';
                // Modal schließen und neu laden
                closeFeedbackDetail();
                loadFeedbackFromCloudflare();
            } else {
                throw new Error(result.error || 'Antwort konnte nicht gesendet werden');
            }
        } catch (error) {
            console.error('Reply Fehler:', error);
            // Fallback: Lokal speichern
            addReplyToLocalStorage(feedbackId, reply);
        }
    } else {
        addReplyToLocalStorage(feedbackId, reply);
    }
}

// Antwort lokal speichern (Fallback)
function addReplyToLocalStorage(feedbackId, reply) {
    const feedbacks = JSON.parse(localStorage.getItem('bankenFeedback') || '[]');
    const feedback = feedbacks.find(f => f.id === feedbackId || f.id === parseInt(feedbackId));

    if (feedback) {
        if (!feedback.replies) feedback.replies = [];
        feedback.replies.push(reply);
        localStorage.setItem('bankenFeedback', JSON.stringify(feedbacks));
        showFeedbackNotification('Antwort lokal gespeichert');
        closeFeedbackDetail();
        loadFeedbackFromLocalStorage();
    } else {
        showFeedbackNotification('Kommentar nicht gefunden');
    }
}

// Feedback bearbeiten
let editingFeedbackId = null;

// Feedback per Index aus globaler Liste bearbeiten
function editFeedbackByIndex(index) {
    const fb = currentFeedbackList[index];
    if (!fb) {
        showFeedbackNotification('Kommentar nicht gefunden');
        return;
    }
    editFeedback(fb);
}

function editFeedback(fb) {
    // Falls String übergeben wurde (alte Aufrufe), parsen
    if (typeof fb === 'string') {
        fb = JSON.parse(decodeURIComponent(fb));
    }
    editingFeedbackId = fb.id;

    // Formularfelder füllen
    document.getElementById('feedbackAuthor').value = fb.author || '';
    document.getElementById('feedbackArea').value = fb.area || 'allgemein';
    document.getElementById('feedbackText').value = fb.text || '';

    // Feedback-Typ setzen
    setFeedbackType(fb.type || 'verbesserung');

    // Screenshot laden falls vorhanden
    if (fb.screenshot) {
        currentScreenshotData = fb.screenshot;
        const preview = document.getElementById('screenshotPreview');
        const thumbnail = document.getElementById('screenshotThumbnail');
        if (preview && thumbnail) {
            thumbnail.src = fb.screenshot;
            preview.style.display = 'flex';
        }
    } else {
        removeScreenshot();
    }

    // Button-Text ändern
    const submitBtn = document.querySelector('.feedback-submit-btn');
    if (submitBtn) {
        submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Änderungen speichern
        `;
    }

    // Zum Formular scrollen (innerhalb des Feedback-Panels)
    const panelContent = document.querySelector('.feedback-panel-content');
    if (panelContent) {
        panelContent.scrollTop = 0; // Nach oben scrollen
    }

    showFeedbackNotification('Formular wurde ausgefüllt - jetzt bearbeiten und speichern');
}

// Feedback löschen
async function deleteFeedback(id) {
    if (!confirm('Möchtest du diesen Kommentar wirklich löschen?')) {
        return;
    }

    if (USE_CLOUDFLARE) {
        try {
            const response = await fetch(`${FEEDBACK_API_URL}/feedback/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.success) {
                showFeedbackNotification('Kommentar gelöscht!');
                loadFeedbackFromCloudflare();
            } else {
                throw new Error(result.error || 'Löschen fehlgeschlagen');
            }
        } catch (error) {
            console.error('Löschen Fehler:', error);
            showFeedbackNotification('Fehler beim Löschen');
        }
    } else {
        // LocalStorage Fallback
        const feedbacks = JSON.parse(localStorage.getItem('bankenFeedback') || '[]');
        const filtered = feedbacks.filter(f => f.id !== id && f.id !== parseInt(id));
        localStorage.setItem('bankenFeedback', JSON.stringify(filtered));
        loadFeedbackFromLocalStorage();
        showFeedbackNotification('Kommentar gelöscht!');
    }
}

// Bearbeitung abbrechen
function cancelEditFeedback() {
    editingFeedbackId = null;

    // Formular zurücksetzen
    document.getElementById('feedbackText').value = '';
    removeScreenshot();

    // Button-Text zurücksetzen
    const submitBtn = document.querySelector('.feedback-submit-btn');
    if (submitBtn) {
        submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            Feedback speichern
        `;
    }
}

// Screenshot-Lightbox öffnen
function openScreenshotLightbox(src) {
    // Lightbox erstellen falls noch nicht vorhanden
    let lightbox = document.getElementById('screenshotLightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'screenshotLightbox';
        lightbox.className = 'screenshot-lightbox';
        lightbox.innerHTML = '<img src="" alt="Screenshot Vollbild">';
        lightbox.onclick = () => lightbox.classList.remove('open');
        document.body.appendChild(lightbox);
    }

    lightbox.querySelector('img').src = src;
    lightbox.classList.add('open');
}

// Badge aktualisieren
function updateFeedbackBadge(count) {
    // Original floating badge
    const badge = document.getElementById('feedbackBadge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
    // Header badge
    const headerBadge = document.getElementById('headerFeedbackBadge');
    if (headerBadge) {
        headerBadge.textContent = count;
        headerBadge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Benachrichtigung anzeigen
function showFeedbackNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'feedback-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Feedback-Liste aktualisieren
async function refreshFeedbackList() {
    showFeedbackNotification('Aktualisiere...');
    if (USE_CLOUDFLARE) {
        await loadFeedbackFromCloudflare();
    } else {
        loadFeedbackFromLocalStorage();
    }
    showFeedbackNotification('Liste aktualisiert!');
}

// Feedback exportieren (JSON Download)
async function exportFeedback() {
    if (USE_CLOUDFLARE) {
        try {
            const response = await fetch(`${FEEDBACK_API_URL}/feedback`);
            const result = await response.json();
            if (result.success) {
                downloadFeedbackJson(result.data);
            } else {
                throw new Error('Export fehlgeschlagen');
            }
        } catch (error) {
            console.error('Export Fehler:', error);
            // Fallback zu LocalStorage
            const feedbacks = JSON.parse(localStorage.getItem('bankenFeedback') || '[]');
            downloadFeedbackJson(feedbacks);
        }
    } else {
        const feedbacks = JSON.parse(localStorage.getItem('bankenFeedback') || '[]');
        downloadFeedbackJson(feedbacks);
    }
}

function downloadFeedbackJson(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ========================================
// SCREENSHOT ANNOTATION SYSTEM
