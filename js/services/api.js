/**
 * API Service Module
 * Handles all HTTP requests including Claude API calls
 */

// ========================================
// CONFIGURATION
// ========================================

const API_CONFIG = {
    claudeWorkerUrl: 'https://vst-claude-api.eike-3e2.workers.dev',
    claudeModel: 'claude-haiku-4-5-20251001',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
};

// ========================================
// BASE HTTP CLIENT
// ========================================

/**
 * Make HTTP request with error handling
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @returns {Promise<any>}
 */
async function request(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || API_CONFIG.timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
            error.status = response.status;
            error.response = response;
            throw error;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        return await response.text();
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }

        throw error;
    }
}

/**
 * Make request with retry logic
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @returns {Promise<any>}
 */
async function requestWithRetry(url, options = {}) {
    const maxRetries = options.retries || API_CONFIG.retryAttempts;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await request(url, options);
        } catch (error) {
            lastError = error;

            // Don't retry on client errors (4xx)
            if (error.status && error.status >= 400 && error.status < 500) {
                throw error;
            }

            // Wait before retrying with exponential backoff
            if (attempt < maxRetries) {
                const delay = API_CONFIG.retryDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

// ========================================
// HTTP METHODS
// ========================================

/**
 * GET request
 * @param {string} url - Request URL
 * @param {object} options - Additional options
 * @returns {Promise<any>}
 */
export async function get(url, options = {}) {
    return requestWithRetry(url, {
        method: 'GET',
        ...options
    });
}

/**
 * POST request
 * @param {string} url - Request URL
 * @param {any} data - Request body
 * @param {object} options - Additional options
 * @returns {Promise<any>}
 */
export async function post(url, data, options = {}) {
    return requestWithRetry(url, {
        method: 'POST',
        body: JSON.stringify(data),
        ...options
    });
}

/**
 * PUT request
 * @param {string} url - Request URL
 * @param {any} data - Request body
 * @param {object} options - Additional options
 * @returns {Promise<any>}
 */
export async function put(url, data, options = {}) {
    return requestWithRetry(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        ...options
    });
}

/**
 * DELETE request
 * @param {string} url - Request URL
 * @param {object} options - Additional options
 * @returns {Promise<any>}
 */
export async function del(url, options = {}) {
    return requestWithRetry(url, {
        method: 'DELETE',
        ...options
    });
}

// ========================================
// CLAUDE API
// ========================================

/**
 * Send message to Claude API
 * @param {string} userMessage - User's message
 * @param {string} systemPrompt - System prompt/context
 * @param {Array} conversationHistory - Previous messages
 * @returns {Promise<string>} Claude's response
 */
export async function sendToClaude(userMessage, systemPrompt = '', conversationHistory = []) {
    const messages = [
        ...conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        })),
        {
            role: 'user',
            content: userMessage
        }
    ];

    const payload = {
        model: API_CONFIG.claudeModel,
        max_tokens: 4096,
        messages: messages
    };

    if (systemPrompt) {
        payload.system = systemPrompt;
    }

    try {
        const response = await post(API_CONFIG.claudeWorkerUrl, payload, {
            timeout: 60000, // Longer timeout for AI responses
            retries: 2
        });

        if (response.content && response.content[0] && response.content[0].text) {
            return response.content[0].text;
        }

        throw new Error('Invalid response format from Claude API');
    } catch (error) {
        console.error('Claude API error:', error);
        throw new Error(`Claude API Fehler: ${error.message}`);
    }
}

/**
 * Stream message from Claude API
 * @param {string} userMessage - User's message
 * @param {string} systemPrompt - System prompt
 * @param {Function} onChunk - Callback for each chunk
 * @param {Array} conversationHistory - Previous messages
 * @returns {Promise<string>} Full response
 */
export async function streamFromClaude(userMessage, systemPrompt, onChunk, conversationHistory = []) {
    const messages = [
        ...conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        })),
        {
            role: 'user',
            content: userMessage
        }
    ];

    const payload = {
        model: API_CONFIG.claudeModel,
        max_tokens: 4096,
        stream: true,
        messages: messages
    };

    if (systemPrompt) {
        payload.system = systemPrompt;
    }

    const response = await fetch(API_CONFIG.claudeWorkerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        if (onChunk) {
            onChunk(chunk, fullResponse);
        }
    }

    return fullResponse;
}

// ========================================
// API CONFIGURATION
// ========================================

/**
 * Update API configuration
 * @param {object} config - New configuration values
 */
export function setApiConfig(config) {
    Object.assign(API_CONFIG, config);
}

/**
 * Get current API configuration
 * @returns {object} Current configuration
 */
export function getApiConfig() {
    return { ...API_CONFIG };
}

/**
 * Check if Claude API is configured
 * @returns {boolean}
 */
export function isClaudeConfigured() {
    return Boolean(API_CONFIG.claudeWorkerUrl);
}

// Export all as default object
export default {
    get,
    post,
    put,
    del,
    sendToClaude,
    streamFromClaude,
    setApiConfig,
    getApiConfig,
    isClaudeConfigured
};
