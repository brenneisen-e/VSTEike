/**
 * Storage Service Module
 * Handles localStorage and sessionStorage operations
 */

const STORAGE_PREFIX = 'vst_';

// ========================================
// LOCAL STORAGE
// ========================================

/**
 * Get item from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any}
 */
export function getLocal(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(STORAGE_PREFIX + key);
        if (item === null) return defaultValue;
        return JSON.parse(item);
    } catch (error) {
        console.warn(`Error reading from localStorage: ${key}`, error);
        return defaultValue;
    }
}

/**
 * Set item in localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} Success status
 */
export function setLocal(key, value) {
    try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing to localStorage: ${key}`, error);
        return false;
    }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export function removeLocal(key) {
    try {
        localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
        console.warn(`Error removing from localStorage: ${key}`, error);
    }
}

/**
 * Clear all app-related items from localStorage
 */
export function clearLocal() {
    try {
        Object.keys(localStorage)
            .filter(key => key.startsWith(STORAGE_PREFIX))
            .forEach(key => localStorage.removeItem(key));
    } catch (error) {
        console.error('Error clearing localStorage', error);
    }
}

// ========================================
// SESSION STORAGE
// ========================================

/**
 * Get item from sessionStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any}
 */
export function getSession(key, defaultValue = null) {
    try {
        const item = sessionStorage.getItem(STORAGE_PREFIX + key);
        if (item === null) return defaultValue;
        return JSON.parse(item);
    } catch (error) {
        console.warn(`Error reading from sessionStorage: ${key}`, error);
        return defaultValue;
    }
}

/**
 * Set item in sessionStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} Success status
 */
export function setSession(key, value) {
    try {
        sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing to sessionStorage: ${key}`, error);
        return false;
    }
}

/**
 * Remove item from sessionStorage
 * @param {string} key - Storage key
 */
export function removeSession(key) {
    try {
        sessionStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
        console.warn(`Error removing from sessionStorage: ${key}`, error);
    }
}

/**
 * Clear all app-related items from sessionStorage
 */
export function clearSession() {
    try {
        Object.keys(sessionStorage)
            .filter(key => key.startsWith(STORAGE_PREFIX))
            .forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
        console.error('Error clearing sessionStorage', error);
    }
}

// ========================================
// EXPIRING STORAGE
// ========================================

/**
 * Set item with expiration
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {number} ttlMinutes - Time to live in minutes
 * @returns {boolean} Success status
 */
export function setWithExpiry(key, value, ttlMinutes = 60) {
    const item = {
        value: value,
        expiry: Date.now() + (ttlMinutes * 60 * 1000)
    };
    return setLocal(key, item);
}

/**
 * Get item with expiration check
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found or expired
 * @returns {any}
 */
export function getWithExpiry(key, defaultValue = null) {
    const item = getLocal(key, null);

    if (!item) return defaultValue;

    if (Date.now() > item.expiry) {
        removeLocal(key);
        return defaultValue;
    }

    return item.value;
}

// ========================================
// STORAGE EVENTS
// ========================================

/**
 * Subscribe to storage changes
 * @param {string} key - Storage key to watch (or null for all)
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function onStorageChange(key, callback) {
    const handler = (event) => {
        if (event.storageArea !== localStorage) return;

        const eventKey = event.key?.replace(STORAGE_PREFIX, '');

        if (key === null || eventKey === key) {
            callback({
                key: eventKey,
                oldValue: event.oldValue ? JSON.parse(event.oldValue) : null,
                newValue: event.newValue ? JSON.parse(event.newValue) : null
            });
        }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
}

// ========================================
// STORAGE INFO
// ========================================

/**
 * Get storage usage info
 * @returns {object} Storage usage information
 */
export function getStorageInfo() {
    let totalSize = 0;
    let appSize = 0;
    const items = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const size = (key.length + value.length) * 2; // UTF-16

        totalSize += size;

        if (key.startsWith(STORAGE_PREFIX)) {
            appSize += size;
            items.push({
                key: key.replace(STORAGE_PREFIX, ''),
                size: size,
                sizeKB: (size / 1024).toFixed(2)
            });
        }
    }

    return {
        totalSizeKB: (totalSize / 1024).toFixed(2),
        appSizeKB: (appSize / 1024).toFixed(2),
        itemCount: items.length,
        items: items.sort((a, b) => b.size - a.size)
    };
}

/**
 * Check if storage is available
 * @param {string} type - 'localStorage' or 'sessionStorage'
 * @returns {boolean}
 */
export function isStorageAvailable(type = 'localStorage') {
    try {
        const storage = window[type];
        const testKey = '__storage_test__';
        storage.setItem(testKey, testKey);
        storage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

// Export all as default object
export default {
    getLocal,
    setLocal,
    removeLocal,
    clearLocal,
    getSession,
    setSession,
    removeSession,
    clearSession,
    setWithExpiry,
    getWithExpiry,
    onStorageChange,
    getStorageInfo,
    isStorageAvailable
};
