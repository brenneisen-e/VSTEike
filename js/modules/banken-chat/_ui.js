/**
 * Banken Chat Module - UI Functions
 * Functions for manipulating the chat user interface
 */

/**
 * Add a message to the chat body
 * @param {'user'|'assistant'} role - The role of the message sender
 * @param {string} content - The message content (HTML)
 */
export const addBankenChatMessage = (role, content) => {
    const chatBody = document.getElementById('bankenChatBody');
    if (!chatBody) return;

    chatBody.querySelector('.banken-chat-welcome')?.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `banken-chat-message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'banken-chat-avatar';
    avatar.innerHTML = role === 'user'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"></path></svg>';

    const bubble = document.createElement('div');
    bubble.className = 'banken-chat-bubble';
    bubble.innerHTML = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
};

/**
 * Show a typing indicator in the chat
 */
export const showBankenTyping = () => {
    const chatBody = document.getElementById('bankenChatBody');
    if (!chatBody) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'banken-chat-message assistant';
    typingDiv.id = 'bankenTypingIndicator';
    typingDiv.innerHTML = `
        <div class="banken-chat-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9"></path>
            </svg>
        </div>
        <div class="banken-chat-typing"><span></span><span></span><span></span></div>
    `;
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
};

/**
 * Hide the typing indicator
 */
export const hideBankenTyping = () => document.getElementById('bankenTypingIndicator')?.remove();
