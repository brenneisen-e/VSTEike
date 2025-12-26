/**
 * Date Utilities
 * German-localized date formatting and manipulation
 */

// ========================================
// FORMATTING
// ========================================

/**
 * Format date to German locale string
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format type: 'short', 'medium', 'long', 'full'
 * @returns {string}
 */
export function format(date, format = 'medium') {
    const d = toDate(date);
    if (!d) return '';

    const options = {
        short: { day: '2-digit', month: '2-digit', year: 'numeric' },
        medium: { day: 'numeric', month: 'short', year: 'numeric' },
        long: { day: 'numeric', month: 'long', year: 'numeric' },
        full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    };

    return d.toLocaleDateString('de-DE', options[format] || options.medium);
}

/**
 * Format date and time
 * @param {Date|string|number} date - Date to format
 * @param {boolean} includeSeconds - Include seconds
 * @returns {string}
 */
export function formatDateTime(date, includeSeconds = false) {
    const d = toDate(date);
    if (!d) return '';

    const dateStr = format(d, 'short');
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        ...(includeSeconds && { second: '2-digit' })
    };

    const timeStr = d.toLocaleTimeString('de-DE', timeOptions);
    return `${dateStr}, ${timeStr}`;
}

/**
 * Format time only
 * @param {Date|string|number} date - Date to format
 * @param {boolean} includeSeconds - Include seconds
 * @returns {string}
 */
export function formatTime(date, includeSeconds = false) {
    const d = toDate(date);
    if (!d) return '';

    const options = {
        hour: '2-digit',
        minute: '2-digit',
        ...(includeSeconds && { second: '2-digit' })
    };

    return d.toLocaleTimeString('de-DE', options);
}

/**
 * Format as relative time (e.g., "vor 5 Minuten")
 * @param {Date|string|number} date - Date to format
 * @returns {string}
 */
export function formatRelative(date) {
    const d = toDate(date);
    if (!d) return '';

    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    const isFuture = diffMs < 0;
    const abs = Math.abs;

    if (abs(diffSec) < 60) {
        return 'gerade eben';
    } else if (abs(diffMin) < 60) {
        const min = abs(diffMin);
        return isFuture
            ? `in ${min} Minute${min === 1 ? '' : 'n'}`
            : `vor ${min} Minute${min === 1 ? '' : 'n'}`;
    } else if (abs(diffHour) < 24) {
        const hour = abs(diffHour);
        return isFuture
            ? `in ${hour} Stunde${hour === 1 ? '' : 'n'}`
            : `vor ${hour} Stunde${hour === 1 ? '' : 'n'}`;
    } else if (abs(diffDay) < 7) {
        const day = abs(diffDay);
        if (day === 1) {
            return isFuture ? 'morgen' : 'gestern';
        }
        return isFuture
            ? `in ${day} Tagen`
            : `vor ${day} Tagen`;
    } else if (abs(diffWeek) < 4) {
        const week = abs(diffWeek);
        return isFuture
            ? `in ${week} Woche${week === 1 ? '' : 'n'}`
            : `vor ${week} Woche${week === 1 ? '' : 'n'}`;
    } else if (abs(diffMonth) < 12) {
        const month = abs(diffMonth);
        return isFuture
            ? `in ${month} Monat${month === 1 ? '' : 'en'}`
            : `vor ${month} Monat${month === 1 ? '' : 'en'}`;
    } else {
        const year = abs(diffYear);
        return isFuture
            ? `in ${year} Jahr${year === 1 ? '' : 'en'}`
            : `vor ${year} Jahr${year === 1 ? '' : 'en'}`;
    }
}

/**
 * Format as ISO string (YYYY-MM-DD)
 * @param {Date|string|number} date - Date to format
 * @returns {string}
 */
export function toISODate(date) {
    const d = toDate(date);
    if (!d) return '';
    return d.toISOString().split('T')[0];
}

// ========================================
// PARSING
// ========================================

/**
 * Convert to Date object
 * @param {Date|string|number} date - Input to convert
 * @returns {Date|null}
 */
export function toDate(date) {
    if (!date) return null;
    if (date instanceof Date) return isNaN(date.getTime()) ? null : date;
    if (typeof date === 'number') return new Date(date);
    if (typeof date === 'string') {
        // Try German format first (DD.MM.YYYY)
        const germanMatch = date.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (germanMatch) {
            return new Date(germanMatch[3], germanMatch[2] - 1, germanMatch[1]);
        }
        // Try standard formats
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
}

/**
 * Parse German date string
 * @param {string} dateStr - Date string (DD.MM.YYYY)
 * @returns {Date|null}
 */
export function parseGerman(dateStr) {
    if (!dateStr) return null;
    const match = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!match) return null;
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
}

// ========================================
// MANIPULATION
// ========================================

/**
 * Add time to date
 * @param {Date|string|number} date - Base date
 * @param {number} amount - Amount to add
 * @param {string} unit - Unit: 'days', 'weeks', 'months', 'years'
 * @returns {Date}
 */
export function add(date, amount, unit) {
    const d = new Date(toDate(date));

    switch (unit) {
        case 'days':
            d.setDate(d.getDate() + amount);
            break;
        case 'weeks':
            d.setDate(d.getDate() + (amount * 7));
            break;
        case 'months':
            d.setMonth(d.getMonth() + amount);
            break;
        case 'years':
            d.setFullYear(d.getFullYear() + amount);
            break;
        case 'hours':
            d.setHours(d.getHours() + amount);
            break;
        case 'minutes':
            d.setMinutes(d.getMinutes() + amount);
            break;
    }

    return d;
}

/**
 * Subtract time from date
 */
export function subtract(date, amount, unit) {
    return add(date, -amount, unit);
}

/**
 * Get start of period
 * @param {Date|string|number} date - Date
 * @param {string} unit - Unit: 'day', 'week', 'month', 'year'
 * @returns {Date}
 */
export function startOf(date, unit) {
    const d = new Date(toDate(date));

    switch (unit) {
        case 'day':
            d.setHours(0, 0, 0, 0);
            break;
        case 'week':
            const day = d.getDay();
            const diff = (day === 0 ? -6 : 1) - day; // Monday as start
            d.setDate(d.getDate() + diff);
            d.setHours(0, 0, 0, 0);
            break;
        case 'month':
            d.setDate(1);
            d.setHours(0, 0, 0, 0);
            break;
        case 'year':
            d.setMonth(0, 1);
            d.setHours(0, 0, 0, 0);
            break;
    }

    return d;
}

/**
 * Get end of period
 */
export function endOf(date, unit) {
    const d = new Date(toDate(date));

    switch (unit) {
        case 'day':
            d.setHours(23, 59, 59, 999);
            break;
        case 'week':
            const day = d.getDay();
            const diff = day === 0 ? 0 : 7 - day;
            d.setDate(d.getDate() + diff);
            d.setHours(23, 59, 59, 999);
            break;
        case 'month':
            d.setMonth(d.getMonth() + 1, 0);
            d.setHours(23, 59, 59, 999);
            break;
        case 'year':
            d.setMonth(11, 31);
            d.setHours(23, 59, 59, 999);
            break;
    }

    return d;
}

// ========================================
// COMPARISON
// ========================================

/**
 * Check if date is today
 */
export function isToday(date) {
    const d = toDate(date);
    const today = new Date();
    return d && d.toDateString() === today.toDateString();
}

/**
 * Check if date is in the past
 */
export function isPast(date) {
    const d = toDate(date);
    return d && d < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date) {
    const d = toDate(date);
    return d && d > new Date();
}

/**
 * Check if date is within range
 */
export function isBetween(date, start, end) {
    const d = toDate(date);
    const s = toDate(start);
    const e = toDate(end);
    return d && s && e && d >= s && d <= e;
}

/**
 * Get difference between dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @param {string} unit - Unit: 'days', 'weeks', 'months', 'years'
 * @returns {number}
 */
export function diff(date1, date2, unit = 'days') {
    const d1 = toDate(date1);
    const d2 = toDate(date2);
    if (!d1 || !d2) return 0;

    const diffMs = d1 - d2;

    switch (unit) {
        case 'days':
            return Math.floor(diffMs / (1000 * 60 * 60 * 24));
        case 'weeks':
            return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
        case 'months':
            return (d1.getFullYear() - d2.getFullYear()) * 12 + (d1.getMonth() - d2.getMonth());
        case 'years':
            return d1.getFullYear() - d2.getFullYear();
        default:
            return diffMs;
    }
}

// ========================================
// UTILITIES
// ========================================

/**
 * Get month name
 * @param {number} month - Month (1-12 or 0-11 with zeroIndexed=true)
 * @param {boolean} zeroIndexed - If true, month is 0-11
 * @returns {string}
 */
export function getMonthName(month, zeroIndexed = false) {
    const months = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    const index = zeroIndexed ? month : month - 1;
    return months[index] || '';
}

/**
 * Get day name
 * @param {number} day - Day of week (0-6, Sunday = 0)
 * @returns {string}
 */
export function getDayName(day) {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return days[day] || '';
}

/**
 * Get days in month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {number}
 */
export function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

/**
 * Get current quarter (1-4)
 * @param {Date} date - Date (defaults to now)
 * @returns {number}
 */
export function getQuarter(date = new Date()) {
    const d = toDate(date);
    return Math.ceil((d.getMonth() + 1) / 3);
}

// Export default
export default {
    format,
    formatDateTime,
    formatTime,
    formatRelative,
    toISODate,
    toDate,
    parseGerman,
    add,
    subtract,
    startOf,
    endOf,
    isToday,
    isPast,
    isFuture,
    isBetween,
    diff,
    getMonthName,
    getDayName,
    getDaysInMonth,
    getQuarter
};
