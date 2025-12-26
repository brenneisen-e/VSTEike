/**
 * Debug Logger Module - ES2024
 * Production-safe logging with conditional output
 */

// Debug mode from localStorage or default false
const DEBUG = localStorage.getItem('VST_DEBUG') === 'true';

const noop = () => {};

const createLogger = (enabled) => ({
    log: enabled ? console.log.bind(console) : noop,
    warn: enabled ? console.warn.bind(console) : noop,
    error: enabled ? console.error.bind(console) : noop,
    info: enabled ? console.info.bind(console) : noop,
    debug: enabled ? console.debug.bind(console) : noop,
    group: enabled ? console.group.bind(console) : noop,
    groupEnd: enabled ? console.groupEnd.bind(console) : noop,
    table: enabled ? console.table.bind(console) : noop,
    time: enabled ? console.time.bind(console) : noop,
    timeEnd: enabled ? console.timeEnd.bind(console) : noop
});

export const logger = createLogger(DEBUG);

// Enable debug mode: localStorage.setItem('VST_DEBUG', 'true'); location.reload();
// Disable debug mode: localStorage.removeItem('VST_DEBUG'); location.reload();

export const enableDebug = () => {
    localStorage.setItem('VST_DEBUG', 'true');
    location.reload();
};

export const disableDebug = () => {
    localStorage.removeItem('VST_DEBUG');
    location.reload();
};

// Window exports for console access
Object.assign(window, { logger, enableDebug, disableDebug, VST_DEBUG: DEBUG });

if (DEBUG) console.log('🔧 VST Debug Mode enabled');
