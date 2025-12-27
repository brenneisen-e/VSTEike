/**
 * Banken Chat Module - Initialization
 * Initialize chat widget and event handlers
 */

import { bankenChatInitialized, setBankenChatInitialized } from './_state.js';
import { sendBankenMessage } from './_actions.js';

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
        console.error('❌ Banken Chat Input-Elemente nicht gefunden');
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
