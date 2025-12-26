/**
 * Banken Feedback System Module
 * ES6 Module for handling user feedback
 */

// ========================================
// CONFIGURATION
// ========================================

const FEEDBACK_API_URL = 'https://vsteike-feedback.eike-3e2.workers.dev';
const USE_CLOUDFLARE = !FEEDBACK_API_URL.includes('DEIN-ACCOUNT');

// ========================================
// STATE
// ========================================

let currentFeedbackType = 'verbesserung';
let currentFeedbackList = [];
let editingFeedbackId = null;
let currentScreenshotData = null;

// Screenshot canvas state
let screenshotCanvas = null;
let screenshotCtx = null;
let screenshotImage = null;
let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#ef4444';
let drawHistory = [];
let startX, startY;

// ========================================
// INITIALIZATION
// ========================================

export function initFeedbackSystem() {
    initAuthorSelect();

    if (USE_CLOUDFLARE) {
        loadFeedbackFromCloudflare();
    } else {
        loadFeedbackFromLocalStorage();
    }
}

// ========================================
// PANEL CONTROLS
// ========================================

export function toggleFeedbackPanel() {
    const panel = document.getElementById('feedbackPanel');
    if (panel) {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
            const savedAuthor = localStorage.getItem('feedbackAuthor');
            if (savedAuthor) {
                document.getElementById('feedbackAuthor').value = savedAuthor;
            }
        }
    }
}

export function setFeedbackType(type) {
    currentFeedbackType = type;
    document.querySelectorAll('.feedback-type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
}

// ========================================
// AUTHOR SELECTION
// ========================================

export function handleAuthorSelect() {
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

export function handleReplyAuthorSelect() {
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

// ========================================
// SUBMIT FEEDBACK
// ========================================

export async function submitFeedback() {
    const author = document.getElementById('feedbackAuthor').value.trim() || 'Anonym';
    const area = document.getElementById('feedbackArea').value;
    const text = document.getElementById('feedbackText').value.trim();

    if (!text) {
        alert('Bitte gib einen Kommentar ein.');
        return;
    }

    localStorage.setItem('feedbackAuthor', author);

    const feedback = {
        author,
        area,
        type: currentFeedbackType,
        text,
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 100),
        screenshot: currentScreenshotData || null
    };

    if (editingFeedbackId) {
        if (USE_CLOUDFLARE) {
            try {
                await fetch(`${FEEDBACK_API_URL}/feedback/${editingFeedbackId}`, { method: 'DELETE' });
            } catch (e) {
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

    document.getElementById('feedbackText').value = '';
    removeScreenshot();
    resetSubmitButton();
}

function resetSubmitButton() {
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

// ========================================
// CLOUDFLARE STORAGE
// ========================================

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
        saveFeedbackToLocalStorage({ ...feedback, id: Date.now(), timestamp: new Date().toISOString() });
    }
}

async function loadFeedbackFromCloudflare() {
    if (window.preloadedFeedback && !window.feedbackAlreadyLoaded) {
        renderFeedbackList(window.preloadedFeedback);
        updateFeedbackBadge(window.preloadedFeedback.length);
        window.feedbackAlreadyLoaded = true;
        return;
    }

    try {
        const response = await fetch(`${FEEDBACK_API_URL}/feedback`);
        const result = await response.json();

        if (result.success) {
            renderFeedbackList(result.data);
            updateFeedbackBadge(result.count);
        } else {
            throw new Error(result.error || 'Laden fehlgeschlagen');
        }
    } catch (error) {
        console.error('❌ Cloudflare Laden Fehler:', error);
        loadFeedbackFromLocalStorage();
    }
}

// ========================================
// LOCALSTORAGE FALLBACK
// ========================================

function saveFeedbackToLocalStorage(feedback) {
    const feedbacks = JSON.parse(localStorage.getItem('bankenFeedback') || '[]');
    feedbacks.unshift(feedback);
    localStorage.setItem('bankenFeedback', JSON.stringify(feedbacks));
    loadFeedbackFromLocalStorage();
    document.getElementById('feedbackText').value = '';
    showFeedbackNotification('Feedback lokal gespeichert (nur in diesem Browser)');
}

function loadFeedbackFromLocalStorage() {
    const feedbacks = JSON.parse(localStorage.getItem('bankenFeedback') || '[]');
    renderFeedbackList(feedbacks);
    updateFeedbackBadge(feedbacks.length);
}

// ========================================
// RENDERING
// ========================================

function renderFeedbackList(feedbacks) {
    const listEl = document.getElementById('feedbackList');
    if (!listEl) return;

    currentFeedbackList = feedbacks;

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
        const shortText = fb.text.length > 80 ? fb.text.substring(0, 80) + '...' : fb.text;
        const replyCount = fb.replies ? fb.replies.length : 0;

        return `
            <div class="feedback-item ${fb.type}" data-id="${fb.id}" onclick="openFeedbackDetail(${index})">
                <div class="feedback-item-header">
                    <span class="feedback-item-type">${typeIcons[fb.type] || ''}</span>
                    <span class="feedback-item-author">${fb.author}</span>
                    <span class="feedback-item-area">${areaLabels[fb.area] || fb.area}</span>
                    ${fb.screenshot ? '<span class="feedback-has-image" title="Mit Screenshot">📷</span>' : ''}
                    ${replyCount > 0 ? `<span class="feedback-has-replies">${replyCount}</span>` : ''}
                    <span class="feedback-item-date">${dateStr}</span>
                </div>
                <div class="feedback-item-text">${shortText}</div>
            </div>
        `;
    }).join('');
}

// ========================================
// DETAIL VIEW
// ========================================

export function openFeedbackDetail(index) {
    const fb = currentFeedbackList[index];
    if (!fb) return;

    // Create modal if not exists
    let modal = document.getElementById('feedbackDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'feedbackDetailModal';
        modal.className = 'feedback-detail-modal';
        document.body.appendChild(modal);
    }

    const date = new Date(fb.timestamp);
    const dateStr = date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const savedAuthor = localStorage.getItem('feedbackAuthor') || '';

    modal.innerHTML = `
        <div class="feedback-detail-content">
            <div class="feedback-detail-header">
                <h3>Kommentar Details</h3>
                <button class="feedback-detail-close" onclick="closeFeedbackDetail()">✕</button>
            </div>
            <div class="feedback-detail-body">
                <div class="feedback-detail-meta">
                    <span>${fb.author}</span>
                    <span class="${fb.type}">${fb.type}</span>
                    <span>${fb.area}</span>
                    <span>${dateStr}</span>
                </div>
                <div class="feedback-detail-text">${fb.text}</div>
                ${fb.screenshot ? `<div class="feedback-detail-screenshot"><img src="${fb.screenshot}" onclick="openScreenshotLightbox(this.src)"></div>` : ''}
            </div>
            <div class="feedback-detail-actions">
                <button onclick="closeFeedbackDetail(); editFeedbackByIndex(${index});">Bearbeiten</button>
                <button onclick="closeFeedbackDetail(); deleteFeedback('${fb.id}');">Löschen</button>
            </div>
        </div>
    `;

    modal.classList.add('open');
    modal.onclick = (e) => { if (e.target === modal) closeFeedbackDetail(); };
}

export function closeFeedbackDetail() {
    const modal = document.getElementById('feedbackDetailModal');
    if (modal) modal.classList.remove('open');
}

// ========================================
// EDIT & DELETE
// ========================================

export function editFeedbackByIndex(index) {
    const fb = currentFeedbackList[index];
    if (!fb) {
        showFeedbackNotification('Kommentar nicht gefunden');
        return;
    }
    editFeedback(fb);
}

export function editFeedback(fb) {
    if (typeof fb === 'string') {
        fb = JSON.parse(decodeURIComponent(fb));
    }
    editingFeedbackId = fb.id;

    document.getElementById('feedbackAuthor').value = fb.author || '';
    document.getElementById('feedbackArea').value = fb.area || 'allgemein';
    document.getElementById('feedbackText').value = fb.text || '';
    setFeedbackType(fb.type || 'verbesserung');

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

    const submitBtn = document.querySelector('.feedback-submit-btn');
    if (submitBtn) {
        submitBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg> Änderungen speichern`;
    }

    showFeedbackNotification('Formular wurde ausgefüllt - jetzt bearbeiten und speichern');
}

export async function deleteFeedback(id) {
    if (!confirm('Möchtest du diesen Kommentar wirklich löschen?')) return;

    if (USE_CLOUDFLARE) {
        try {
            const response = await fetch(`${FEEDBACK_API_URL}/feedback/${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                showFeedbackNotification('Kommentar gelöscht!');
                loadFeedbackFromCloudflare();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Löschen Fehler:', error);
            showFeedbackNotification('Fehler beim Löschen');
        }
    } else {
        const feedbacks = JSON.parse(localStorage.getItem('bankenFeedback') || '[]');
        const filtered = feedbacks.filter(f => f.id !== id && f.id !== parseInt(id));
        localStorage.setItem('bankenFeedback', JSON.stringify(filtered));
        loadFeedbackFromLocalStorage();
        showFeedbackNotification('Kommentar gelöscht!');
    }
}

// ========================================
// UTILITIES
// ========================================

function updateFeedbackBadge(count) {
    const badge = document.getElementById('feedbackBadge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
    const headerBadge = document.getElementById('headerFeedbackBadge');
    if (headerBadge) {
        headerBadge.textContent = count;
        headerBadge.style.display = count > 0 ? 'flex' : 'none';
    }
}

export function showFeedbackNotification(message) {
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

export async function refreshFeedbackList() {
    showFeedbackNotification('Aktualisiere...');
    if (USE_CLOUDFLARE) {
        await loadFeedbackFromCloudflare();
    } else {
        loadFeedbackFromLocalStorage();
    }
    showFeedbackNotification('Liste aktualisiert!');
}

export async function exportFeedback() {
    let data;
    if (USE_CLOUDFLARE) {
        try {
            const response = await fetch(`${FEEDBACK_API_URL}/feedback`);
            const result = await response.json();
            data = result.success ? result.data : [];
        } catch (error) {
            data = JSON.parse(localStorage.getItem('bankenFeedback') || '[]');
        }
    } else {
        data = JSON.parse(localStorage.getItem('bankenFeedback') || '[]');
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ========================================
// SCREENSHOT
// ========================================

export function removeScreenshot() {
    currentScreenshotData = null;
    const preview = document.getElementById('screenshotPreview');
    if (preview) preview.style.display = 'none';
}

export function openScreenshotLightbox(src) {
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

// Export state getters for other modules
export function getCurrentScreenshotData() {
    return currentScreenshotData;
}

export function setCurrentScreenshotData(data) {
    currentScreenshotData = data;
}
