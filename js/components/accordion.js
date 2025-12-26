/**
 * Accordion Component
 * Collapsible content panels
 */

// ========================================
// ACCORDION CREATION
// ========================================

/**
 * Create accordion component
 * @param {HTMLElement|string} container - Container element or selector
 * @param {object} options - Accordion options
 * @returns {object} Accordion instance
 */
export function create(container, options = {}) {
    const containerEl = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!containerEl) {
        console.error('Accordion container not found');
        return null;
    }

    const {
        items = [],
        multiple = false, // Allow multiple panels open
        defaultOpen = [], // Array of indices to open by default
        animated = true,
        iconPosition = 'right', // 'left' or 'right'
        onChange = null
    } = options;

    // State
    const openPanels = new Set(defaultOpen);
    const panelElements = [];

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'accordion';
    wrapper.style.cssText = `
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        overflow: hidden;
    `;

    // Chevron icon
    const chevronIcon = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    `;

    // Create panels
    items.forEach((item, index) => {
        const panel = document.createElement('div');
        panel.className = 'accordion-panel';
        panel.setAttribute('data-index', index);

        // Header
        const header = document.createElement('button');
        header.type = 'button';
        header.className = 'accordion-header';
        header.setAttribute('aria-expanded', openPanels.has(index));
        header.style.cssText = `
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 16px;
            background: white;
            border: none;
            border-bottom: 1px solid #E2E8F0;
            cursor: pointer;
            text-align: left;
            transition: background 0.15s ease;
            ${iconPosition === 'left' ? 'flex-direction: row-reverse;' : ''}
        `;

        // Header content
        const headerContent = document.createElement('div');
        headerContent.className = 'accordion-header-content';
        headerContent.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
        `;

        // Title
        const title = document.createElement('span');
        title.className = 'accordion-title';
        title.style.cssText = `
            font-size: 15px;
            font-weight: 600;
            color: #0F172A;
        `;
        title.textContent = item.title || item;

        headerContent.appendChild(title);

        // Subtitle
        if (item.subtitle) {
            const subtitle = document.createElement('span');
            subtitle.className = 'accordion-subtitle';
            subtitle.style.cssText = `
                font-size: 13px;
                color: #64748B;
            `;
            subtitle.textContent = item.subtitle;
            headerContent.appendChild(subtitle);
        }

        // Icon container
        const iconWrapper = document.createElement('span');
        iconWrapper.className = 'accordion-icon';
        iconWrapper.innerHTML = item.icon || chevronIcon;
        iconWrapper.style.cssText = `
            flex-shrink: 0;
            color: #64748B;
            transition: transform 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            ${openPanels.has(index) ? 'transform: rotate(180deg);' : ''}
        `;

        header.appendChild(headerContent);
        header.appendChild(iconWrapper);

        // Body wrapper (for animation)
        const bodyWrapper = document.createElement('div');
        bodyWrapper.className = 'accordion-body-wrapper';
        bodyWrapper.style.cssText = `
            overflow: hidden;
            ${animated ? 'transition: height 0.2s ease;' : ''}
            height: ${openPanels.has(index) ? 'auto' : '0'};
        `;

        // Body
        const body = document.createElement('div');
        body.className = 'accordion-body';
        body.style.cssText = `
            padding: 16px;
            font-size: 14px;
            color: #475569;
            line-height: 1.6;
            border-bottom: 1px solid #E2E8F0;
        `;

        // Content
        if (item.content) {
            if (typeof item.content === 'string') {
                body.innerHTML = item.content;
            } else if (item.content instanceof Element) {
                body.appendChild(item.content);
            }
        }

        bodyWrapper.appendChild(body);

        // Event listener
        header.addEventListener('click', () => {
            instance.toggle(index);
        });

        // Hover effect
        header.addEventListener('mouseenter', () => {
            header.style.background = '#F8FAFC';
        });

        header.addEventListener('mouseleave', () => {
            header.style.background = 'white';
        });

        panel.appendChild(header);
        panel.appendChild(bodyWrapper);
        wrapper.appendChild(panel);

        panelElements.push({
            panel,
            header,
            bodyWrapper,
            body,
            iconWrapper
        });
    });

    // Remove last border
    if (panelElements.length > 0) {
        const lastBody = panelElements[panelElements.length - 1].body;
        if (!openPanels.has(items.length - 1)) {
            panelElements[panelElements.length - 1].header.style.borderBottom = 'none';
        }
    }

    containerEl.innerHTML = '';
    containerEl.appendChild(wrapper);

    // Instance methods
    const instance = {
        wrapper,

        open(index) {
            if (index < 0 || index >= items.length) return;

            // Close others if not multiple
            if (!multiple) {
                openPanels.forEach(i => {
                    if (i !== index) this.close(i);
                });
            }

            openPanels.add(index);
            const { header, bodyWrapper, body, iconWrapper } = panelElements[index];

            header.setAttribute('aria-expanded', 'true');
            iconWrapper.style.transform = 'rotate(180deg)';
            header.style.borderBottom = '1px solid #E2E8F0';

            if (animated) {
                bodyWrapper.style.height = `${body.offsetHeight}px`;
                setTimeout(() => {
                    bodyWrapper.style.height = 'auto';
                }, 200);
            } else {
                bodyWrapper.style.height = 'auto';
            }

            if (onChange) onChange(Array.from(openPanels), index, 'open');
        },

        close(index) {
            if (index < 0 || index >= items.length) return;
            if (!openPanels.has(index)) return;

            openPanels.delete(index);
            const { header, bodyWrapper, body, iconWrapper } = panelElements[index];

            header.setAttribute('aria-expanded', 'false');
            iconWrapper.style.transform = 'rotate(0deg)';

            // Handle last item border
            if (index === items.length - 1 && openPanels.size === 0) {
                header.style.borderBottom = 'none';
            }

            if (animated) {
                bodyWrapper.style.height = `${body.offsetHeight}px`;
                requestAnimationFrame(() => {
                    bodyWrapper.style.height = '0';
                });
            } else {
                bodyWrapper.style.height = '0';
            }

            if (onChange) onChange(Array.from(openPanels), index, 'close');
        },

        toggle(index) {
            if (openPanels.has(index)) {
                this.close(index);
            } else {
                this.open(index);
            }
        },

        openAll() {
            items.forEach((_, i) => this.open(i));
        },

        closeAll() {
            items.forEach((_, i) => this.close(i));
        },

        isOpen(index) {
            return openPanels.has(index);
        },

        getOpenPanels() {
            return Array.from(openPanels);
        },

        setContent(index, content) {
            if (index < 0 || index >= items.length) return;
            const { body } = panelElements[index];

            if (typeof content === 'string') {
                body.innerHTML = content;
            } else if (content instanceof Element) {
                body.innerHTML = '';
                body.appendChild(content);
            }
        },

        disable(index) {
            if (index < 0 || index >= items.length) return;
            const { header } = panelElements[index];
            header.disabled = true;
            header.style.opacity = '0.5';
            header.style.cursor = 'not-allowed';
        },

        enable(index) {
            if (index < 0 || index >= items.length) return;
            const { header } = panelElements[index];
            header.disabled = false;
            header.style.opacity = '1';
            header.style.cursor = 'pointer';
        }
    };

    return instance;
}

/**
 * Initialize accordions from existing HTML
 * @param {string} selector - Container selector
 * @param {object} options - Options
 */
export function init(selector, options = {}) {
    const containers = document.querySelectorAll(selector);
    const instances = [];

    containers.forEach(container => {
        const panels = container.querySelectorAll('[data-accordion-panel]');
        const items = Array.from(panels).map(panel => ({
            title: panel.querySelector('[data-accordion-title]')?.textContent || '',
            content: panel.querySelector('[data-accordion-content]')?.innerHTML || ''
        }));

        if (items.length > 0) {
            instances.push(create(container, { ...options, items }));
        }
    });

    return instances;
}

// Export default
export default { create, init };
