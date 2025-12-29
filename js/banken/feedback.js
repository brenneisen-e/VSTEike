// ========================================
// BANKEN FEEDBACK SYSTEM MODULE
// Firebase-basiertes Kommentar/Feedback-System
// ========================================

// Firebase Konfiguration - BITTE MIT EIGENEN WERTEN ERSETZEN
// Anleitung: https://console.firebase.google.com → Neues Projekt → Realtime Database
const firebaseConfig = {
    apiKey: "AIzaSyDemo-REPLACE-WITH-YOUR-KEY",
    authDomain: "vsteike-demo.firebaseapp.com",
    databaseURL: "https://vsteike-demo-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "vsteike-demo",
    storageBucket: "vsteike-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Firebase initialisieren (wenn SDK geladen)
let feedbackDb = null;
let currentFeedbackType = 'verbesserung';

function initFirebase() {
    try {
        if (typeof firebase !== 'undefined' && !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            feedbackDb = firebase.database();
            console.log('✅ Firebase initialisiert');
            loadFeedbackFromFirebase();
        } else if (firebase.apps.length) {
            feedbackDb = firebase.database();
            loadFeedbackFromFirebase();
        }
    } catch (error) {
        console.warn('Firebase nicht verfügbar, nutze LocalStorage:', error);
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

// Feedback speichern
function submitFeedback() {
    const author = document.getElementById('feedbackAuthor').value.trim() || 'Anonym';
    const area = document.getElementById('feedbackArea').value;
    const text = document.getElementById('feedbackText').value.trim();

    if (!text) {
        alert('Bitte geben Sie einen Kommentar ein.');
        return;
    }

    // Autor für nächstes Mal speichern
    localStorage.setItem('feedbackAuthor', author);

    const feedback = {
        id: Date.now(),
        author: author,
        area: area,
        type: currentFeedbackType,
        text: text,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 100)
    };

    if (feedbackDb) {
        // In Firebase speichern
        feedbackDb.ref('feedback').push(feedback)
            .then(() => {
                console.log('✅ Feedback in Firebase gespeichert');
                document.getElementById('feedbackText').value = '';
                showFeedbackNotification('Feedback gespeichert!');
            })
            .catch(error => {
                console.error('Firebase Fehler:', error);
                saveFeedbackToLocalStorage(feedback);
            });
    } else {
        // Fallback: LocalStorage
        saveFeedbackToLocalStorage(feedback);
    }
}

// LocalStorage Fallback
function saveFeedbackToLocalStorage(feedback) {
    const feedbacks = JSON.parse(localStorage.getItem('bankenFeedback') || '[]');
    feedbacks.unshift(feedback);
    localStorage.setItem('bankenFeedback', JSON.stringify(feedbacks));
    loadFeedbackFromLocalStorage();
    document.getElementById('feedbackText').value = '';
    showFeedbackNotification('Feedback lokal gespeichert!');
}

// Feedback aus Firebase laden
function loadFeedbackFromFirebase() {
    if (!feedbackDb) return;

    feedbackDb.ref('feedback').orderByChild('timestamp').on('value', (snapshot) => {
        const feedbacks = [];
        snapshot.forEach(child => {
            feedbacks.push({ ...child.val(), firebaseKey: child.key });
        });
        feedbacks.reverse(); // Neueste zuerst
        renderFeedbackList(feedbacks);
        updateFeedbackBadge(feedbacks.length);
    });
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

    if (feedbacks.length === 0) {
        listEl.innerHTML = '<div class="feedback-empty">Noch keine Kommentare vorhanden.</div>';
        return;
    }

    const typeIcons = {
        'verbesserung': '💡',
        'fehler': '🐛',
        'frage': '❓',
        'lob': '👍'
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

    listEl.innerHTML = feedbacks.map(fb => {
        const date = new Date(fb.timestamp);
        const dateStr = date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="feedback-item ${fb.type}">
                <div class="feedback-item-header">
                    <span class="feedback-item-type">${typeIcons[fb.type] || '💬'}</span>
                    <span class="feedback-item-author">${fb.author}</span>
                    <span class="feedback-item-area">${areaLabels[fb.area] || fb.area}</span>
                    <span class="feedback-item-date">${dateStr}</span>
                </div>
                <div class="feedback-item-text">${fb.text}</div>
            </div>
        `;
    }).join('');
}

// Badge aktualisieren
function updateFeedbackBadge(count) {
    const badge = document.getElementById('feedbackBadge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
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

// Feedback exportieren (JSON Download)
function exportFeedback() {
    const feedbacks = JSON.parse(localStorage.getItem('bankenFeedback') || '[]');
    if (feedbackDb) {
        feedbackDb.ref('feedback').once('value', (snapshot) => {
            const fbData = [];
            snapshot.forEach(child => fbData.push(child.val()));
            downloadFeedbackJson(fbData);
        });
    } else {
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

// Firebase beim Laden initialisieren
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initFirebase, 500);
});

console.log('📝 Banken Feedback Module geladen');
