/**
 * Dropdown Component
 * Reusable dropdown/select menus
 */

// ========================================
// DROPDOWN STATE
// ========================================

const openDropdowns = new Set();

// ========================================
// DROPDOWN CREATION
// ========================================

/**
 * Create enhanced dropdown
 * @param {HTMLSelectElement|HTMLElement} element - Target element
 * @param {object} options - Dropdown options
 * @returns {object} Dropdown instance
 */
export function create(element, options = {}) {
    const {
        items = [],
        placeholder = 'Bitte wählen...',
        searchable = false,
        multiple = false,
        maxHeight = 300,
        onChange = null,
        renderItem = null
    } = options;

    // Container
    const container = document.createElement('div');
    container.className = 'dropdown-container';
    container.style.cssText = `
        position: relative;
        width: 100%;
    `;

    // Trigger button
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'dropdown-trigger';
    trigger.style.cssText = `
        width: 100%;
        padding: 10px 36px 10px 12px;
        background: white;
        border: 1px solid #E2E8F0;
        border-radius: 6px;
        font-size: 14px;
        color: #0F172A;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease;
        position: relative;
    `;

    // Arrow icon
    const arrow = document.createElement('span');
    arrow.className = 'dropdown-arrow';
    arrow.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    `;
    arrow.style.cssText = `
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #94A3B8;
        pointer-events: none;
        transition: transform 0.2s ease;
    `;
    trigger.appendChild(arrow);

    // Menu
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    menu.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 4px;
        background: white;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        max-height: ${maxHeight}px;
        overflow-y: auto;
        z-index: 100;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px);
        transition: all 0.2s ease;
    `;

    // Search input (if searchable)
    let searchInput = null;
    if (searchable) {
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = `
            padding: 8px;
            border-bottom: 1px solid #E2E8F0;
        `;

        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Suchen...';
        searchInput.className = 'dropdown-search';
        searchInput.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
        `;

        searchContainer.appendChild(searchInput);
        menu.appendChild(searchContainer);
    }

    // Items container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'dropdown-items';
    itemsContainer.style.cssText = `
        padding: 4px;
    `;
    menu.appendChild(itemsContainer);

    container.appendChild(trigger);
    container.appendChild(menu);

    // State
    let selectedValue = multiple ? [] : null;
    let isOpen = false;
    let currentItems = items;

    // Instance methods
    const instance = {
        container,
        trigger,
        menu,

        open() {
            if (isOpen) return;

            isOpen = true;
            menu.style.opacity = '1';
            menu.style.visibility = 'visible';
            menu.style.transform = 'translateY(0)';
            arrow.style.transform = 'translateY(-50%) rotate(180deg)';
            trigger.style.borderColor = '#2563EB';

            openDropdowns.add(this);

            if (searchInput) {
                searchInput.focus();
            }
        },

        close() {
            if (!isOpen) return;

            isOpen = false;
            menu.style.opacity = '0';
            menu.style.visibility = 'hidden';
            menu.style.transform = 'translateY(-8px)';
            arrow.style.transform = 'translateY(-50%)';
            trigger.style.borderColor = '#E2E8F0';

            openDropdowns.delete(this);

            if (searchInput) {
                searchInput.value = '';
                this.filterItems('');
            }
        },

        toggle() {
            isOpen ? this.close() : this.open();
        },

        getValue() {
            return selectedValue;
        },

        setValue(value) {
            if (multiple) {
                selectedValue = Array.isArray(value) ? value : [value];
            } else {
                selectedValue = value;
            }
            this.updateDisplay();
            if (onChange) onChange(selectedValue);
        },

        setItems(newItems) {
            currentItems = newItems;
            this.renderItems(newItems);
        },

        filterItems(query) {
            const filtered = currentItems.filter(item => {
                const label = typeof item === 'object' ? item.label : item;
                return label.toLowerCase().includes(query.toLowerCase());
            });
            this.renderItems(filtered);
        },

        renderItems(itemsToRender) {
            itemsContainer.innerHTML = '';

            if (itemsToRender.length === 0) {
                const empty = document.createElement('div');
                empty.style.cssText = `
                    padding: 12px;
                    text-align: center;
                    color: #94A3B8;
                    font-size: 14px;
                `;
                empty.textContent = 'Keine Ergebnisse';
                itemsContainer.appendChild(empty);
                return;
            }

            itemsToRender.forEach(item => {
                const value = typeof item === 'object' ? item.value : item;
                const label = typeof item === 'object' ? item.label : item;
                const disabled = typeof item === 'object' && item.disabled;

                const itemEl = document.createElement('div');
                itemEl.className = 'dropdown-item';
                itemEl.setAttribute('data-value', value);
                itemEl.style.cssText = `
                    padding: 10px 12px;
                    border-radius: 6px;
                    cursor: ${disabled ? 'not-allowed' : 'pointer'};
                    font-size: 14px;
                    color: ${disabled ? '#94A3B8' : '#0F172A'};
                    transition: background 0.15s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                `;

                // Custom render or default
                if (renderItem) {
                    itemEl.innerHTML = renderItem(item);
                } else {
                    itemEl.textContent = label;
                }

                // Check if selected
                const isSelected = multiple
                    ? selectedValue.includes(value)
                    : selectedValue === value;

                if (isSelected) {
                    itemEl.style.background = '#EEF2FF';
                    itemEl.style.color = '#2563EB';
                }

                if (!disabled) {
                    itemEl.addEventListener('mouseenter', () => {
                        if (!isSelected) {
                            itemEl.style.background = '#F8FAFC';
                        }
                    });

                    itemEl.addEventListener('mouseleave', () => {
                        if (!isSelected) {
                            itemEl.style.background = '';
                        }
                    });

                    itemEl.addEventListener('click', () => {
                        if (multiple) {
                            const idx = selectedValue.indexOf(value);
                            if (idx > -1) {
                                selectedValue.splice(idx, 1);
                            } else {
                                selectedValue.push(value);
                            }
                            this.renderItems(itemsToRender);
                        } else {
                            selectedValue = value;
                            this.close();
                        }
                        this.updateDisplay();
                        if (onChange) onChange(selectedValue);
                    });
                }

                itemsContainer.appendChild(itemEl);
            });
        },

        updateDisplay() {
            const textSpan = trigger.querySelector('.dropdown-text') || (() => {
                const span = document.createElement('span');
                span.className = 'dropdown-text';
                trigger.insertBefore(span, arrow);
                return span;
            })();

            if (multiple && selectedValue.length > 0) {
                textSpan.textContent = `${selectedValue.length} ausgewählt`;
                textSpan.style.color = '#0F172A';
            } else if (!multiple && selectedValue !== null) {
                const item = currentItems.find(i =>
                    (typeof i === 'object' ? i.value : i) === selectedValue
                );
                textSpan.textContent = item
                    ? (typeof item === 'object' ? item.label : item)
                    : selectedValue;
                textSpan.style.color = '#0F172A';
            } else {
                textSpan.textContent = placeholder;
                textSpan.style.color = '#94A3B8';
            }
        },

        destroy() {
            this.close();
            container.remove();
        }
    };

    // Event listeners
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        instance.toggle();
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            instance.filterItems(e.target.value);
        });

        searchInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Initialize
    instance.renderItems(currentItems);
    instance.updateDisplay();

    // Replace original element if provided
    if (element && element.parentNode) {
        element.parentNode.replaceChild(container, element);
    }

    return instance;
}

// ========================================
// GLOBAL CLICK HANDLER
// ========================================

if (typeof document !== 'undefined') {
    document.addEventListener('click', () => {
        openDropdowns.forEach(dropdown => dropdown.close());
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            openDropdowns.forEach(dropdown => dropdown.close());
        }
    });
}

// Export default
export default { create };
