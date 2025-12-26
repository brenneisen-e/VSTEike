/**
 * Helper Functions Module
 * Shared utility functions across the application
 */

// ========================================
// STRING UTILITIES
// ========================================

/**
 * Format currency value
 * @param {number} value - The number to format
 * @param {string} currency - Currency code (default: EUR)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = 'EUR') {
    if (value === null || value === undefined || isNaN(value)) {
        return '0,00 €';
    }
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Format number with German locale
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 0) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0';
    }
    return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Format percentage
 * @param {number} value - The decimal value (0.15 = 15%)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0%';
    }
    return new Intl.NumberFormat('de-DE', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Format date to German locale
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'datetime'
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'short') {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '';

    const options = {
        short: { day: '2-digit', month: '2-digit', year: 'numeric' },
        long: { day: 'numeric', month: 'long', year: 'numeric' },
        datetime: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    };

    return new Intl.DateTimeFormat('de-DE', options[format] || options.short).format(d);
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export function truncate(str, maxLength = 50) {
    if (!str || str.length <= maxLength) return str || '';
    return str.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generate unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique ID
 */
export function generateId(prefix = '') {
    const random = Math.random().toString(36).substring(2, 9);
    const timestamp = Date.now().toString(36);
    return prefix ? `${prefix}-${timestamp}${random}` : `${timestamp}${random}`;
}

// ========================================
// DOM UTILITIES
// ========================================

/**
 * Query selector shorthand
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element
 * @returns {Element|null}
 */
export function $(selector, context = document) {
    return context.querySelector(selector);
}

/**
 * Query selector all shorthand
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element
 * @returns {NodeList}
 */
export function $$(selector, context = document) {
    return context.querySelectorAll(selector);
}

/**
 * Create element with attributes
 * @param {string} tag - HTML tag name
 * @param {object} attrs - Attributes object
 * @param {string|Element|Array} children - Child elements or text
 * @returns {Element}
 */
export function createElement(tag, attrs = {}, children = null) {
    const el = document.createElement(tag);

    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                el.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.substring(2).toLowerCase(), value);
        } else {
            el.setAttribute(key, value);
        }
    });

    if (children) {
        if (Array.isArray(children)) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    el.appendChild(document.createTextNode(child));
                } else if (child instanceof Element) {
                    el.appendChild(child);
                }
            });
        } else if (typeof children === 'string') {
            el.textContent = children;
        } else if (children instanceof Element) {
            el.appendChild(children);
        }
    }

    return el;
}

/**
 * Add event listener with automatic cleanup
 * @param {Element} element - Target element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {object} options - Event options
 * @returns {Function} Cleanup function
 */
export function on(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// OBJECT UTILITIES
// ========================================

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
        );
    }
    return obj;
}

/**
 * Deep merge objects
 * @param {object} target - Target object
 * @param {object} source - Source object
 * @returns {object} Merged object
 */
export function deepMerge(target, source) {
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    output[key] = source[key];
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                output[key] = source[key];
            }
        });
    }

    return output;
}

/**
 * Check if value is plain object
 * @param {any} item - Value to check
 * @returns {boolean}
 */
export function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Get nested object property safely
 * @param {object} obj - Object to get property from
 * @param {string} path - Property path (e.g., 'user.address.city')
 * @param {any} defaultValue - Default value if not found
 * @returns {any}
 */
export function get(obj, path, defaultValue = undefined) {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result === null || result === undefined) {
            return defaultValue;
        }
        result = result[key];
    }

    return result === undefined ? defaultValue : result;
}

// ========================================
// ARRAY UTILITIES
// ========================================

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string|Function} key - Key to group by
 * @returns {object}
 */
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const groupKey = typeof key === 'function' ? key(item) : item[key];
        (result[groupKey] = result[groupKey] || []).push(item);
        return result;
    }, {});
}

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array}
 */
export function sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
        const valueA = a[key];
        const valueB = b[key];

        if (valueA < valueB) return order === 'asc' ? -1 : 1;
        if (valueA > valueB) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Remove duplicates from array
 * @param {Array} array - Array to dedupe
 * @param {string} key - Optional key for object arrays
 * @returns {Array}
 */
export function unique(array, key = null) {
    if (key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    }
    return [...new Set(array)];
}

// ========================================
// ASYNC UTILITIES
// ========================================

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise}
 */
export async function retry(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries) {
                await sleep(baseDelay * Math.pow(2, i));
            }
        }
    }

    throw lastError;
}

// ========================================
// VALIDATION UTILITIES
// ========================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate German phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export function isValidPhone(phone) {
    const cleaned = phone.replace(/[\s\-\/\(\)]/g, '');
    const re = /^(\+49|0049|0)?[1-9]\d{6,13}$/;
    return re.test(cleaned);
}

/**
 * Validate IBAN
 * @param {string} iban - IBAN to validate
 * @returns {boolean}
 */
export function isValidIBAN(iban) {
    const cleaned = iban.replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/.test(cleaned)) return false;

    // Move first 4 chars to end
    const rearranged = cleaned.substring(4) + cleaned.substring(0, 4);

    // Replace letters with numbers (A=10, B=11, etc.)
    const numeric = rearranged.replace(/[A-Z]/g, char => char.charCodeAt(0) - 55);

    // Mod 97 check
    let remainder = numeric;
    while (remainder.length > 2) {
        const block = remainder.substring(0, 9);
        remainder = (parseInt(block, 10) % 97).toString() + remainder.substring(block.length);
    }

    return parseInt(remainder, 10) % 97 === 1;
}

// Export all as default object for non-module usage
export default {
    formatCurrency,
    formatNumber,
    formatPercent,
    formatDate,
    truncate,
    capitalize,
    generateId,
    $,
    $$,
    createElement,
    on,
    debounce,
    throttle,
    deepClone,
    deepMerge,
    isObject,
    get,
    groupBy,
    sortBy,
    unique,
    sleep,
    retry,
    isValidEmail,
    isValidPhone,
    isValidIBAN
};
