/**
 * Bestand UI Helpers (ES2024)
 * Hilfsfunktionen für Formatierung, Escaping und Textverarbeitung
 */

/**
 * Escaped HTML-Zeichen aus einem String
 * @param {string} str - Der zu escapende String
 * @returns {string} HTML-escaped String
 */
export const escapeHtml = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

/**
 * Formatiert ein Datum im deutschen Format
 * @param {string} dateStr - Datum-String
 * @returns {string} Formatiertes Datum (DD.MM.YYYY)
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return dateStr; }
};

/**
 * Parst ein deutsches Datumsformat zu einem Date-Objekt
 * @param {string} dateStr - Datum-String
 * @returns {Date|null} Geparster Date-Objekt oder null
 */
export const parseGermanDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    const match = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (match) {
        const [, day, month, year, hour = '0', minute = '0', second = '0'] = match;
        return new Date(year, month - 1, day, hour, minute, second);
    }
    return null;
};

/**
 * Formatiert ein Datum mit Uhrzeit im deutschen Format
 * @param {string} dateStr - Datum-String
 * @returns {string} Formatiertes Datum (DD.MM.YYYY HH:MM)
 */
export const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = parseGermanDate(dateStr);
    if (!date || isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/**
 * Kürzt einen Text auf eine maximale Länge
 * @param {string} text - Zu kürzender Text
 * @param {number} maxLength - Maximale Länge
 * @returns {string} Gekürzter Text mit "..." oder Originaltext
 */
export const truncateText = (text, maxLength) => text?.length > maxLength ? text.substring(0, maxLength) + '...' : (text ?? '');

/**
 * Escaped Regex-Sonderzeichen
 * @param {string} str - String mit möglichen Regex-Zeichen
 * @returns {string} Escaped String
 */
export const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Hebt Keywords in einem Text hervor
 * @param {string} text - Text zum Highlighten
 * @param {string[]} keywords - Array von Keywords
 * @returns {string} HTML mit hervorgehobenen Keywords
 */
export const highlightKeywords = (text, keywords) => {
    if (!keywords?.length) return escapeHtml(text);
    let result = escapeHtml(text);
    keywords.forEach(keyword => {
        if (!keyword || keyword.length < 2) return;
        const regex = new RegExp(`(${escapeRegex(escapeHtml(keyword))})`, 'gi');
        result = result.replace(regex, '<mark>$1</mark>');
    });
    return result;
};

/**
 * Konvertiert deutsches Datum zu ISO-Format
 * @param {string} dateStr - Datum-String (DD.MM.YYYY)
 * @returns {string} ISO-Datum (YYYY-MM-DD)
 */
export const convertGermanDateToISO = (dateStr) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const match = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    return match ? `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}` : '';
};
