/**
 * Banken Chat Module - State Management
 * Manages internal state for the chat widget
 */

/**
 * Tracks whether the chat has been initialized
 * @type {boolean}
 */
export let bankenChatInitialized = false;

/**
 * Stores the last chat query result for export functionality
 * @type {Object|null}
 */
export let lastChatQueryResult = null;

/**
 * Set the initialization state
 * @param {boolean} value - New initialization state
 */
export const setBankenChatInitialized = (value) => {
    bankenChatInitialized = value;
};

/**
 * Set the last chat query result
 * @param {Object} value - Query result data
 */
export const setLastChatQueryResult = (value) => {
    lastChatQueryResult = value;
};
