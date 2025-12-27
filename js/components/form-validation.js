/**
 * Form Validation Component
 * Reusable form validation system
 */

// ========================================
// VALIDATION RULES
// ========================================

const rules = {
    required: (value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
    },

    email: (value) => {
        if (!value) return true; // Skip if empty (use required for mandatory)
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value);
    },

    minLength: (value, min) => {
        if (!value) return true;
        return String(value).length >= min;
    },

    maxLength: (value, max) => {
        if (!value) return true;
        return String(value).length <= max;
    },

    min: (value, min) => {
        if (value === '' || value === null || value === undefined) return true;
        return Number(value) >= min;
    },

    max: (value, max) => {
        if (value === '' || value === null || value === undefined) return true;
        return Number(value) <= max;
    },

    pattern: (value, pattern) => {
        if (!value) return true;
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        return regex.test(value);
    },

    numeric: (value) => {
        if (!value) return true;
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    integer: (value) => {
        if (!value) return true;
        return Number.isInteger(Number(value));
    },

    phone: (value) => {
        if (!value) return true;
        const pattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
        return pattern.test(value);
    },

    url: (value) => {
        if (!value) return true;
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    },

    date: (value) => {
        if (!value) return true;
        const date = new Date(value);
        return !isNaN(date.getTime());
    },

    iban: (value) => {
        if (!value) return true;
        const cleaned = value.replace(/\s/g, '').toUpperCase();
        const pattern = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
        return pattern.test(cleaned);
    },

    bic: (value) => {
        if (!value) return true;
        const pattern = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
        return pattern.test(value.toUpperCase());
    },

    match: (value, fieldName, formData) => {
        if (!value) return true;
        return value === formData[fieldName];
    },

    custom: (value, fn, formData) => {
        return fn(value, formData);
    }
};

// ========================================
// DEFAULT ERROR MESSAGES
// ========================================

const defaultMessages = {
    required: 'Dieses Feld ist erforderlich',
    email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
    minLength: 'Mindestens {0} Zeichen erforderlich',
    maxLength: 'Maximal {0} Zeichen erlaubt',
    min: 'Der Wert muss mindestens {0} sein',
    max: 'Der Wert darf höchstens {0} sein',
    pattern: 'Das Format ist ungültig',
    numeric: 'Bitte geben Sie eine Zahl ein',
    integer: 'Bitte geben Sie eine ganze Zahl ein',
    phone: 'Bitte geben Sie eine gültige Telefonnummer ein',
    url: 'Bitte geben Sie eine gültige URL ein',
    date: 'Bitte geben Sie ein gültiges Datum ein',
    iban: 'Bitte geben Sie eine gültige IBAN ein',
    bic: 'Bitte geben Sie einen gültigen BIC ein',
    match: 'Die Werte stimmen nicht überein',
    custom: 'Ungültiger Wert'
};

// ========================================
// FORM VALIDATOR
// ========================================

/**
 * Create form validator
 * @param {HTMLFormElement|string} form - Form element or selector
 * @param {object} schema - Validation schema
 * @param {object} options - Options
 * @returns {object} Validator instance
 */
export function create(form, schema = {}, options = {}) {
    const formEl = typeof form === 'string' ? document.querySelector(form) : form;

    if (!formEl) {
        console.error('Form element not found');
        return null;
    }

    const {
        validateOnChange = true,
        validateOnBlur = true,
        showErrors = true,
        errorClass = 'has-error',
        successClass = 'is-valid',
        messages = {},
        onSubmit = null,
        onError = null
    } = options;

    const mergedMessages = { ...defaultMessages, ...messages };
    const errors = {};
    const touched = {};

    // Error display element
    function getErrorElement(field) {
        const container = field.closest('.form-group') || field.parentElement;
        let errorEl = container.querySelector('.field-error');

        if (!errorEl && showErrors) {
            errorEl = document.createElement('div');
            errorEl.className = 'field-error';
            errorEl.style.cssText = `
                font-size: 12px;
                color: #DC2626;
                margin-top: 4px;
                display: none;
            `;
            container.appendChild(errorEl);
        }

        return errorEl;
    }

    // Show error for field
    function showFieldError(field, message) {
        field.classList.add(errorClass);
        field.classList.remove(successClass);
        field.style.borderColor = '#DC2626';

        const errorEl = getErrorElement(field);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    // Clear error for field
    function clearFieldError(field) {
        field.classList.remove(errorClass);
        field.style.borderColor = '';

        const errorEl = getErrorElement(field);
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
    }

    // Show success for field
    function showFieldSuccess(field) {
        field.classList.remove(errorClass);
        field.classList.add(successClass);
        field.style.borderColor = '#16A34A';
        clearFieldError(field);
    }

    // Validate single field
    function validateField(name, value, formData) {
        const fieldRules = schema[name];
        if (!fieldRules) return { valid: true };

        const fieldErrors = [];

        for (const [ruleName, ruleConfig] of Object.entries(fieldRules)) {
            if (ruleName === 'message') continue;

            let ruleValue = ruleConfig;
            let customMessage = null;

            // Handle object config with message
            if (typeof ruleConfig === 'object' && ruleConfig !== null && !Array.isArray(ruleConfig)) {
                ruleValue = ruleConfig.value;
                customMessage = ruleConfig.message;
            }

            // Skip if rule is false
            if (ruleValue === false) continue;

            // Get rule function
            const ruleFn = rules[ruleName];
            if (!ruleFn) {
                // Unknown rule: skip
                continue;
            }

            // Execute rule
            let isValid;
            if (ruleName === 'match') {
                isValid = ruleFn(value, ruleValue, formData);
            } else if (ruleName === 'custom') {
                isValid = ruleFn(value, ruleValue, formData);
            } else if (ruleValue === true) {
                isValid = ruleFn(value);
            } else {
                isValid = ruleFn(value, ruleValue);
            }

            if (!isValid) {
                let message = customMessage || mergedMessages[ruleName] || 'Ungültiger Wert';
                message = message.replace('{0}', ruleValue);
                fieldErrors.push(message);
                break; // Stop at first error
            }
        }

        return {
            valid: fieldErrors.length === 0,
            errors: fieldErrors
        };
    }

    // Get form data
    function getFormData() {
        const formData = new FormData(formEl);
        const data = {};

        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (checkboxes, multi-select)
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }

        return data;
    }

    // Validate all fields
    function validateAll() {
        const formData = getFormData();
        const allErrors = {};
        let isValid = true;

        for (const name of Object.keys(schema)) {
            const field = formEl.querySelector(`[name="${name}"]`);
            const value = formData[name] || '';
            const result = validateField(name, value, formData);

            if (!result.valid) {
                isValid = false;
                allErrors[name] = result.errors;
                errors[name] = result.errors;

                if (field && showErrors) {
                    showFieldError(field, result.errors[0]);
                }
            } else {
                delete errors[name];
                if (field) {
                    if (touched[name]) {
                        showFieldSuccess(field);
                    } else {
                        clearFieldError(field);
                    }
                }
            }
        }

        return { valid: isValid, errors: allErrors };
    }

    // Instance
    const instance = {
        form: formEl,
        errors,

        validate() {
            return validateAll();
        },

        validateField(name) {
            const field = formEl.querySelector(`[name="${name}"]`);
            if (!field) return { valid: true };

            const formData = getFormData();
            const value = formData[name] || '';
            const result = validateField(name, value, formData);

            if (!result.valid) {
                errors[name] = result.errors;
                if (showErrors) showFieldError(field, result.errors[0]);
            } else {
                delete errors[name];
                if (touched[name]) {
                    showFieldSuccess(field);
                } else {
                    clearFieldError(field);
                }
            }

            return result;
        },

        isValid() {
            return Object.keys(errors).length === 0;
        },

        getErrors() {
            return { ...errors };
        },

        getData() {
            return getFormData();
        },

        setError(name, message) {
            const field = formEl.querySelector(`[name="${name}"]`);
            errors[name] = [message];
            if (field && showErrors) {
                showFieldError(field, message);
            }
        },

        clearError(name) {
            const field = formEl.querySelector(`[name="${name}"]`);
            delete errors[name];
            if (field) clearFieldError(field);
        },

        clearAllErrors() {
            for (const name of Object.keys(errors)) {
                this.clearError(name);
            }
        },

        reset() {
            formEl.reset();
            this.clearAllErrors();
            Object.keys(touched).forEach(k => delete touched[k]);
        },

        destroy() {
            // Remove event listeners would be done here if we tracked them
        }
    };

    // Setup event listeners
    if (validateOnBlur || validateOnChange) {
        const fields = formEl.querySelectorAll('input, select, textarea');

        fields.forEach(field => {
            const name = field.getAttribute('name');
            if (!name || !schema[name]) return;

            if (validateOnBlur) {
                field.addEventListener('blur', () => {
                    touched[name] = true;
                    instance.validateField(name);
                });
            }

            if (validateOnChange) {
                const eventType = field.type === 'checkbox' || field.type === 'radio'
                    ? 'change'
                    : 'input';

                field.addEventListener(eventType, () => {
                    if (touched[name] || errors[name]) {
                        instance.validateField(name);
                    }
                });
            }
        });
    }

    // Submit handler
    formEl.addEventListener('submit', (e) => {
        e.preventDefault();

        // Mark all as touched
        Object.keys(schema).forEach(name => touched[name] = true);

        const result = validateAll();

        if (result.valid) {
            if (onSubmit) {
                onSubmit(getFormData(), e);
            }
        } else {
            if (onError) {
                onError(result.errors, e);
            }

            // Focus first error field
            const firstErrorField = Object.keys(result.errors)[0];
            const field = formEl.querySelector(`[name="${firstErrorField}"]`);
            if (field) field.focus();
        }
    });

    return instance;
}

/**
 * Add custom validation rule
 * @param {string} name - Rule name
 * @param {function} fn - Validation function
 * @param {string} message - Default error message
 */
export function addRule(name, fn, message) {
    rules[name] = fn;
    if (message) {
        defaultMessages[name] = message;
    }
}

/**
 * Check if value passes a rule
 * @param {*} value - Value to validate
 * @param {string} ruleName - Rule name
 * @param {*} ruleValue - Rule parameter
 * @returns {boolean}
 */
export function check(value, ruleName, ruleValue) {
    const rule = rules[ruleName];
    if (!rule) return true;
    return ruleValue === undefined ? rule(value) : rule(value, ruleValue);
}

// Export rules for direct use
export { rules };

// Export default
export default { create, addRule, check, rules };
