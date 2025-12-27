/**
 * Banken Chat Module - Initialization
 * Initialize chat widget and event handlers
 */

import { bankenChatInitialized, setBankenChatInitialized } from './_state.js';
import { sendBankenMessage } from './_actions.js';

/**
 * Toggle Banken Chat visibility
 */
export const toggleBankenChat = () => {
    const chatWidget = document.getElementById('bankenChatWidget');
    const chatToggle = document.getElementById('bankenChatToggle');
    const chatInput = document.getElementById('bankenChatInput');

    if (!chatWidget || !chatToggle) return;

    const isVisible = chatWidget.style.display === 'flex';
    chatWidget.style.display = isVisible ? 'none' : 'flex';
    chatToggle.style.display = isVisible ? 'flex' : 'none';

    if (!isVisible && chatInput) chatInput.focus();
};

/**
 * Ask a predefined question in Banken Chat
 */
export const askBankenQuestion = (question) => {
    const chatInput = document.getElementById('bankenChatInput');
    if (chatInput) {
        chatInput.value = question;
        sendBankenMessage();
    }
};

/**
 * Initialize the Banken Chat widget
 * Sets up event listeners and prepares the chat interface
 */
export const initBankenChat = () => {
    if (bankenChatInitialized) {
        return;
    }

    const chatToggle = document.getElementById('bankenChatToggle');
    const chatWidget = document.getElementById('bankenChatWidget');

    if (!chatToggle || !chatWidget) {
        return;
    }

    const chatClose = chatWidget.querySelector('.banken-chat-close');
    const chatSend = document.getElementById('bankenChatSend');
    const chatInput = document.getElementById('bankenChatInput');
    const chatBody = document.getElementById('bankenChatBody');

    if (!chatSend || !chatInput || !chatBody) {
        console.error('[ERROR] Banken Chat Input-Elemente nicht gefunden');
        return;
    }

    setBankenChatInitialized(true);

    chatToggle.addEventListener('click', () => {
        chatWidget.style.display = 'flex';
        chatToggle.style.display = 'none';
        chatInput.focus();
    });

    chatClose?.addEventListener('click', () => {
        chatWidget.style.display = 'none';
        chatToggle.style.display = 'flex';
    });

    chatSend.addEventListener('click', () => sendBankenMessage());

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendBankenMessage();
        }
    });

    chatBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('example-btn')) {
            chatInput.value = e.target.dataset.question;
            sendBankenMessage();
        }
    });
};
