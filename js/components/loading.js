/**
 * Loading Component
 * Spinners, skeletons, and loading states
 */

// ========================================
// SPINNER
// ========================================

/**
 * Create spinner element
 * @param {object} options - Spinner options
 * @returns {HTMLElement}
 */
export function spinner(options = {}) {
    const {
        size = 'default', // 'sm', 'default', 'lg', 'xl'
        color = '#2563EB',
        thickness = 2,
        text = ''
    } = options;

    const sizes = {
        sm: 16,
        default: 24,
        lg: 32,
        xl: 48
    };

    const sizeValue = sizes[size] || sizes.default;

    const wrapper = document.createElement('div');
    wrapper.className = 'spinner-wrapper';
    wrapper.style.cssText = `
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    `;

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.cssText = `
        width: ${sizeValue}px;
        height: ${sizeValue}px;
        border: ${thickness}px solid #E2E8F0;
        border-top-color: ${color};
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    `;

    wrapper.appendChild(spinner);

    if (text) {
        const label = document.createElement('span');
        label.className = 'spinner-text';
        label.style.cssText = `
            font-size: 13px;
            color: #64748B;
        `;
        label.textContent = text;
        wrapper.appendChild(label);
    }

    // Inject animation if not exists
    injectSpinAnimation();

    return wrapper;
}

/**
 * Show fullscreen loading overlay
 * @param {object} options - Options
 * @returns {object} Overlay controller
 */
export function overlay(options = {}) {
    const {
        text = 'Wird geladen...',
        backdrop = true,
        spinnerSize = 'lg'
    } = options;

    const container = document.createElement('div');
    container.className = 'loading-overlay';
    container.style.cssText = `
        position: fixed;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        z-index: 9999;
        ${backdrop ? 'background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(4px);' : ''}
        opacity: 0;
        transition: opacity 0.2s ease;
    `;

    container.appendChild(spinner({ size: spinnerSize }));

    if (text) {
        const label = document.createElement('span');
        label.style.cssText = `
            font-size: 15px;
            color: #475569;
            font-weight: 500;
        `;
        label.textContent = text;
        container.appendChild(label);
    }

    return {
        show() {
            document.body.appendChild(container);
            requestAnimationFrame(() => {
                container.style.opacity = '1';
            });
        },

        hide() {
            container.style.opacity = '0';
            setTimeout(() => {
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            }, 200);
        },

        setText(newText) {
            const label = container.querySelector('span:not(.spinner-text)');
            if (label) label.textContent = newText;
        }
    };
}

/**
 * Show inline loading state
 * @param {HTMLElement} element - Element to show loading in
 * @param {object} options - Options
 * @returns {object} Loading controller
 */
export function inline(element, options = {}) {
    const {
        text = 'Wird geladen...',
        minHeight = 100
    } = options;

    const originalContent = element.innerHTML;
    const originalStyles = {
        minHeight: element.style.minHeight,
        display: element.style.display,
        alignItems: element.style.alignItems,
        justifyContent: element.style.justifyContent
    };

    const loadingContent = document.createElement('div');
    loadingContent.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        min-height: ${minHeight}px;
        padding: 24px;
    `;

    loadingContent.appendChild(spinner({ size: 'default' }));

    if (text) {
        const label = document.createElement('span');
        label.style.cssText = `
            font-size: 14px;
            color: #64748B;
        `;
        label.textContent = text;
        loadingContent.appendChild(label);
    }

    return {
        show() {
            element.innerHTML = '';
            element.appendChild(loadingContent);
        },

        hide() {
            element.innerHTML = originalContent;
            Object.assign(element.style, originalStyles);
        },

        setText(newText) {
            const label = loadingContent.querySelector('span');
            if (label) label.textContent = newText;
        }
    };
}

// ========================================
// SKELETON LOADERS
// ========================================

/**
 * Create skeleton element
 * @param {object} options - Skeleton options
 * @returns {HTMLElement}
 */
export function skeleton(options = {}) {
    const {
        type = 'text', // 'text', 'circle', 'rect', 'card'
        width = '100%',
        height = 'auto',
        lines = 3,
        animated = true
    } = options;

    const wrapper = document.createElement('div');
    wrapper.className = `skeleton skeleton-${type}`;

    const baseStyle = `
        background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
        background-size: 200% 100%;
        ${animated ? 'animation: shimmer 1.5s infinite;' : ''}
    `;

    if (type === 'text') {
        wrapper.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: ${width};
        `;

        for (let i = 0; i < lines; i++) {
            const line = document.createElement('div');
            const lineWidth = i === lines - 1 ? '60%' : '100%';
            line.style.cssText = `
                height: 16px;
                width: ${lineWidth};
                border-radius: 4px;
                ${baseStyle}
            `;
            wrapper.appendChild(line);
        }
    } else if (type === 'circle') {
        const size = typeof width === 'number' ? `${width}px` : width;
        wrapper.style.cssText = `
            width: ${size};
            height: ${size};
            border-radius: 50%;
            ${baseStyle}
        `;
    } else if (type === 'rect') {
        wrapper.style.cssText = `
            width: ${typeof width === 'number' ? `${width}px` : width};
            height: ${typeof height === 'number' ? `${height}px` : height};
            border-radius: 8px;
            ${baseStyle}
        `;
    } else if (type === 'card') {
        wrapper.style.cssText = `
            width: ${typeof width === 'number' ? `${width}px` : width};
            padding: 16px;
            background: white;
            border-radius: 8px;
            border: 1px solid #E2E8F0;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        `;

        const avatar = document.createElement('div');
        avatar.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 50%;
            ${baseStyle}
        `;

        const titleLines = document.createElement('div');
        titleLines.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
        `;

        const title = document.createElement('div');
        title.style.cssText = `
            height: 14px;
            width: 60%;
            border-radius: 4px;
            ${baseStyle}
        `;

        const subtitle = document.createElement('div');
        subtitle.style.cssText = `
            height: 12px;
            width: 40%;
            border-radius: 4px;
            ${baseStyle}
        `;

        titleLines.appendChild(title);
        titleLines.appendChild(subtitle);
        header.appendChild(avatar);
        header.appendChild(titleLines);
        wrapper.appendChild(header);

        // Content lines
        for (let i = 0; i < 3; i++) {
            const line = document.createElement('div');
            const lineWidth = i === 2 ? '80%' : '100%';
            line.style.cssText = `
                height: 12px;
                width: ${lineWidth};
                border-radius: 4px;
                margin-top: 8px;
                ${baseStyle}
            `;
            wrapper.appendChild(line);
        }
    }

    // Inject shimmer animation
    injectShimmerAnimation();

    return wrapper;
}

/**
 * Create table skeleton
 * @param {object} options - Options
 * @returns {HTMLElement}
 */
export function tableSkeleton(options = {}) {
    const { rows = 5, columns = 4 } = options;

    const table = document.createElement('div');
    table.className = 'skeleton-table';
    table.style.cssText = `
        width: 100%;
    `;

    // Header
    const headerRow = document.createElement('div');
    headerRow.style.cssText = `
        display: flex;
        gap: 16px;
        padding: 12px 16px;
        background: #F8FAFC;
        border-bottom: 1px solid #E2E8F0;
    `;

    for (let i = 0; i < columns; i++) {
        const cell = skeleton({ type: 'rect', width: '100%', height: 16 });
        cell.style.flex = '1';
        headerRow.appendChild(cell);
    }

    table.appendChild(headerRow);

    // Body rows
    for (let r = 0; r < rows; r++) {
        const row = document.createElement('div');
        row.style.cssText = `
            display: flex;
            gap: 16px;
            padding: 16px;
            border-bottom: 1px solid #E2E8F0;
        `;

        for (let c = 0; c < columns; c++) {
            const cell = skeleton({ type: 'rect', width: '100%', height: 16 });
            cell.style.flex = '1';
            row.appendChild(cell);
        }

        table.appendChild(row);
    }

    return table;
}

// ========================================
// BUTTON LOADING STATE
// ========================================

/**
 * Set button loading state
 * @param {HTMLButtonElement} button - Button element
 * @param {boolean} loading - Loading state
 * @param {string} loadingText - Text while loading
 */
export function buttonLoading(button, loading, loadingText = '') {
    if (loading) {
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.style.position = 'relative';
        button.style.pointerEvents = 'none';

        const spinnerEl = spinner({ size: 'sm', color: 'currentColor' });
        spinnerEl.style.cssText += `
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        `;

        if (loadingText) {
            button.innerHTML = `<span style="opacity: 0">${button.innerHTML}</span>`;
            button.appendChild(spinnerEl);
            const textEl = document.createElement('span');
            textEl.style.cssText = 'margin-left: 32px;';
            textEl.textContent = loadingText;
            button.appendChild(textEl);
        } else {
            button.innerHTML = `<span style="opacity: 0">${button.innerHTML}</span>`;
            button.appendChild(spinnerEl);
        }
    } else {
        button.innerHTML = button.dataset.originalText || button.innerHTML;
        button.disabled = false;
        button.style.pointerEvents = '';
        delete button.dataset.originalText;
    }
}

// ========================================
// ANIMATION INJECTION
// ========================================

function injectSpinAnimation() {
    if (document.getElementById('spin-animation')) return;

    const style = document.createElement('style');
    style.id = 'spin-animation';
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

function injectShimmerAnimation() {
    if (document.getElementById('shimmer-animation')) return;

    const style = document.createElement('style');
    style.id = 'shimmer-animation';
    style.textContent = `
        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `;
    document.head.appendChild(style);
}

// Export default
export default {
    spinner,
    overlay,
    inline,
    skeleton,
    tableSkeleton,
    buttonLoading
};
