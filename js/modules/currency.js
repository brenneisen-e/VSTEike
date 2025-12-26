/**
 * Currency Utilities
 * German-localized currency formatting and calculations
 */

// ========================================
// CONFIGURATION
// ========================================

const DEFAULT_CURRENCY = 'EUR';
const DEFAULT_LOCALE = 'de-DE';

// ========================================
// FORMATTING
// ========================================

/**
 * Format number as currency
 * @param {number} value - Value to format
 * @param {string} currency - Currency code (default: EUR)
 * @param {object} options - Additional options
 * @returns {string}
 */
export function format(value, currency = DEFAULT_CURRENCY, options = {}) {
    if (value === null || value === undefined || isNaN(value)) {
        return options.fallback || '–';
    }

    const {
        locale = DEFAULT_LOCALE,
        minimumFractionDigits = 2,
        maximumFractionDigits = 2,
        showSymbol = true,
        compact = false
    } = options;

    const formatOptions = {
        style: showSymbol ? 'currency' : 'decimal',
        currency,
        minimumFractionDigits,
        maximumFractionDigits
    };

    if (compact) {
        formatOptions.notation = 'compact';
        formatOptions.compactDisplay = 'short';
    }

    return new Intl.NumberFormat(locale, formatOptions).format(value);
}

/**
 * Format as short currency (e.g., 1,5 Mio. €)
 * @param {number} value - Value to format
 * @param {string} currency - Currency code
 * @returns {string}
 */
export function formatShort(value, currency = DEFAULT_CURRENCY) {
    if (value === null || value === undefined || isNaN(value)) {
        return '–';
    }

    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    const symbol = getCurrencySymbol(currency);

    if (abs >= 1000000000) {
        return `${sign}${(abs / 1000000000).toFixed(1).replace('.', ',')} Mrd. ${symbol}`;
    } else if (abs >= 1000000) {
        return `${sign}${(abs / 1000000).toFixed(1).replace('.', ',')} Mio. ${symbol}`;
    } else if (abs >= 1000) {
        return `${sign}${(abs / 1000).toFixed(1).replace('.', ',')} Tsd. ${symbol}`;
    } else {
        return format(value, currency);
    }
}

/**
 * Format as accounting style (negative in parentheses)
 * @param {number} value - Value to format
 * @param {string} currency - Currency code
 * @returns {string}
 */
export function formatAccounting(value, currency = DEFAULT_CURRENCY) {
    const formatted = format(Math.abs(value), currency);
    return value < 0 ? `(${formatted})` : formatted;
}

/**
 * Format percentage
 * @param {number} value - Value (0.15 = 15%)
 * @param {object} options - Options
 * @returns {string}
 */
export function formatPercent(value, options = {}) {
    if (value === null || value === undefined || isNaN(value)) {
        return options.fallback || '–';
    }

    const {
        decimals = 2,
        locale = DEFAULT_LOCALE,
        showSign = false
    } = options;

    const formatted = new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);

    if (showSign && value > 0) {
        return '+' + formatted;
    }

    return formatted;
}

/**
 * Format as decimal number
 * @param {number} value - Value to format
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
export function formatNumber(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) {
        return '–';
    }

    return new Intl.NumberFormat(DEFAULT_LOCALE, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

// ========================================
// PARSING
// ========================================

/**
 * Parse German-formatted currency string to number
 * @param {string} str - String to parse (e.g., "1.234,56 €")
 * @returns {number}
 */
export function parse(str) {
    if (!str || typeof str !== 'string') return NaN;

    // Remove currency symbols and whitespace
    let cleaned = str.replace(/[€$£¥₹\s]/g, '').trim();

    // Handle German format: 1.234,56
    // Remove thousand separators (dots) and replace comma with dot
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');

    // Handle parentheses for negative
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
        cleaned = '-' + cleaned.slice(1, -1);
    }

    return parseFloat(cleaned);
}

/**
 * Parse percentage string to decimal
 * @param {string} str - String to parse (e.g., "15,5 %")
 * @returns {number}
 */
export function parsePercent(str) {
    if (!str || typeof str !== 'string') return NaN;

    let cleaned = str.replace(/%/g, '').trim();
    cleaned = cleaned.replace(',', '.');

    return parseFloat(cleaned) / 100;
}

// ========================================
// CALCULATIONS
// ========================================

/**
 * Calculate percentage change
 * @param {number} oldValue - Original value
 * @param {number} newValue - New value
 * @returns {number}
 */
export function percentChange(oldValue, newValue) {
    if (oldValue === 0) return newValue > 0 ? Infinity : (newValue < 0 ? -Infinity : 0);
    return (newValue - oldValue) / Math.abs(oldValue);
}

/**
 * Calculate sum of values
 * @param {number[]} values - Array of numbers
 * @returns {number}
 */
export function sum(values) {
    return values.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
}

/**
 * Calculate average of values
 * @param {number[]} values - Array of numbers
 * @returns {number}
 */
export function average(values) {
    const validValues = values.filter(v => !isNaN(parseFloat(v)));
    if (validValues.length === 0) return 0;
    return sum(validValues) / validValues.length;
}

/**
 * Round to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Decimal places
 * @returns {number}
 */
export function round(value, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number}
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// ========================================
// UTILITIES
// ========================================

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string}
 */
export function getCurrencySymbol(currency = DEFAULT_CURRENCY) {
    const symbols = {
        EUR: '€',
        USD: '$',
        GBP: '£',
        CHF: 'CHF',
        JPY: '¥',
        CNY: '¥',
        INR: '₹'
    };
    return symbols[currency] || currency;
}

/**
 * Check if value is valid currency amount
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isValid(value) {
    const num = typeof value === 'string' ? parse(value) : value;
    return !isNaN(num) && isFinite(num);
}

/**
 * Compare two currency values with precision
 * @param {number} a - First value
 * @param {number} b - Second value
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} -1 if a < b, 0 if equal, 1 if a > b
 */
export function compare(a, b, precision = 2) {
    const roundedA = round(a, precision);
    const roundedB = round(b, precision);

    if (roundedA < roundedB) return -1;
    if (roundedA > roundedB) return 1;
    return 0;
}

/**
 * Format change with color indicator
 * @param {number} value - Change value
 * @param {string} currency - Currency code
 * @returns {object} { formatted, color, isPositive }
 */
export function formatChange(value, currency = DEFAULT_CURRENCY) {
    const isPositive = value > 0;
    const isNegative = value < 0;

    return {
        formatted: (isPositive ? '+' : '') + format(value, currency),
        color: isPositive ? '#16A34A' : (isNegative ? '#DC2626' : '#64748B'),
        isPositive,
        isNegative,
        isZero: value === 0
    };
}

// Export default
export default {
    format,
    formatShort,
    formatAccounting,
    formatPercent,
    formatNumber,
    parse,
    parsePercent,
    percentChange,
    sum,
    average,
    round,
    clamp,
    getCurrencySymbol,
    isValid,
    compare,
    formatChange
};
