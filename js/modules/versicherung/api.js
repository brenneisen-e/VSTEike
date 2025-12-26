/**
 * Versicherung API Module
 * ES6 Module for Claude API configuration (ES2024)
 */

// ========================================
// CONFIGURATION
// ========================================

window.CLAUDE_WORKER_URL ??= 'https://vst-claude-api.eike-3e2.workers.dev';
window.CLAUDE_MODEL ??= 'claude-haiku-4-5-20251001';
window.USE_WORKER = window.CLAUDE_WORKER_URL !== '';

// ========================================
// TOKEN MANAGEMENT
// ========================================

export const getApiToken = () => localStorage.getItem('claude_api_token') ?? '';

export const saveApiToken = (token) => {
    if (token?.trim()) {
        localStorage.setItem('claude_api_token', token.trim());
        return true;
    }
    return false;
};

export const clearApiToken = () => localStorage.removeItem('claude_api_token');

export const isUsingMockMode = () => !window.USE_WORKER && !getApiToken();

// ========================================
// API TOKEN UI
// ========================================

export function setupApiTokenInput() {
    const tokenInput = document.getElementById('apiTokenInput');
    const toggleBtn = document.getElementById('apiTokenToggle');
    const saveBtn = document.getElementById('apiTokenSave');
    const statusDiv = document.getElementById('apiTokenStatus');

    if (!tokenInput || !toggleBtn || !saveBtn) return;

    // Show current status
    if (window.USE_WORKER) {
        statusDiv.className = 'api-token-status success';
        statusDiv.textContent = '✅ Claude AI aktiv (via Worker)';
    } else {
        const existingToken = getApiToken();
        if (existingToken) {
            tokenInput.value = existingToken;
            statusDiv.className = 'api-token-status success';
            statusDiv.textContent = '✅ API-Key gespeichert (KI-Modus aktiv)';
        } else {
            statusDiv.className = 'api-token-status';
            statusDiv.textContent = 'ℹ️ Mock-Modus aktiv (vorgefertigte Antworten)';
        }
    }

    // Toggle password visibility
    toggleBtn.addEventListener('click', () => {
        const isPassword = tokenInput.type === 'password';
        tokenInput.type = isPassword ? 'text' : 'password';
        toggleBtn.textContent = isPassword ? '🙈' : '👁️';
    });

    // Save token
    const handleSave = () => {
        const token = tokenInput.value.trim();

        if (!token) {
            clearApiToken();
            statusDiv.className = 'api-token-status';
            statusDiv.textContent = 'ℹ️ Mock-Modus aktiv (vorgefertigte Antworten)';
            return;
        }

        if (!token.startsWith('sk-')) {
            statusDiv.className = 'api-token-status error';
            statusDiv.textContent = '❌ Ungültiger API-Key (muss mit "sk-" beginnen)';
            return;
        }

        if (saveApiToken(token)) {
            statusDiv.className = 'api-token-status success';
            statusDiv.textContent = '✅ API-Key gespeichert! KI-Modus ist jetzt aktiv.';
            window.USE_MOCK_MODE = false;
        } else {
            statusDiv.className = 'api-token-status error';
            statusDiv.textContent = '❌ Fehler beim Speichern';
        }
    };

    saveBtn.addEventListener('click', handleSave);
    tokenInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSave();
    });
}

// ========================================
// API CALL
// ========================================

export async function callClaudeAPI(message, context = '') {
    if (isUsingMockMode()) {
        return null; // Use mock mode
    }

    const requestBody = {
        model: window.CLAUDE_MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: context + message }]
    };

    try {
        if (window.USE_WORKER) {
            const response = await fetch(window.CLAUDE_WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();
            return data.content?.[0]?.text ?? null;
        } else {
            const token = getApiToken();
            if (!token) return null;

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': token,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();
            return data.content?.[0]?.text ?? null;
        }
    } catch (error) {
        console.error('Claude API error:', error);
        return null;
    }
}
