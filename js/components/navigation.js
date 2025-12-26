/**
 * Navigation Component
 * Sidebar and header navigation management
 */

// ========================================
// SIDEBAR NAVIGATION
// ========================================

/**
 * Create sidebar navigation
 * @param {HTMLElement|string} container - Container element
 * @param {object} options - Navigation options
 * @returns {object} Navigation instance
 */
export function createSidebar(container, options = {}) {
    const containerEl = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!containerEl) {
        console.error('Navigation container not found');
        return null;
    }

    const {
        items = [],
        logo = null,
        collapsed = false,
        collapsible = true,
        activeItem = null,
        onNavigate = null,
        onToggle = null
    } = options;

    // State
    let isCollapsed = collapsed;
    let currentActive = activeItem;

    // Create structure
    const nav = document.createElement('nav');
    nav.className = 'sidebar-nav';
    nav.style.cssText = `
        width: ${isCollapsed ? '64px' : '260px'};
        height: 100vh;
        background: #0F172A;
        display: flex;
        flex-direction: column;
        transition: width 0.2s ease;
        position: fixed;
        left: 0;
        top: 0;
        z-index: 100;
    `;

    // Logo section
    const logoSection = document.createElement('div');
    logoSection.className = 'sidebar-logo';
    logoSection.style.cssText = `
        padding: 20px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 64px;
    `;

    if (logo) {
        if (typeof logo === 'string') {
            logoSection.innerHTML = `
                <img src="${logo}" alt="Logo" style="height: 32px; width: auto;">
                ${!isCollapsed ? '<span style="color: white; font-weight: 600; font-size: 18px;">VST Dashboard</span>' : ''}
            `;
        } else if (logo instanceof Element) {
            logoSection.appendChild(logo);
        }
    }

    nav.appendChild(logoSection);

    // Navigation items container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'sidebar-items';
    itemsContainer.style.cssText = `
        flex: 1;
        overflow-y: auto;
        padding: 16px 12px;
    `;

    // Render navigation items
    function renderItems() {
        itemsContainer.innerHTML = '';

        items.forEach((item, index) => {
            if (item.type === 'divider') {
                const divider = document.createElement('div');
                divider.style.cssText = `
                    height: 1px;
                    background: rgba(255,255,255,0.1);
                    margin: 12px 0;
                `;
                itemsContainer.appendChild(divider);
                return;
            }

            if (item.type === 'label') {
                if (!isCollapsed) {
                    const label = document.createElement('div');
                    label.style.cssText = `
                        padding: 12px 12px 8px;
                        font-size: 11px;
                        font-weight: 600;
                        color: #64748B;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    `;
                    label.textContent = item.text;
                    itemsContainer.appendChild(label);
                }
                return;
            }

            const itemEl = document.createElement('a');
            itemEl.href = item.href || '#';
            itemEl.className = 'sidebar-item';
            itemEl.setAttribute('data-id', item.id || index);

            const isActive = currentActive === (item.id || index);

            itemEl.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-radius: 8px;
                color: ${isActive ? 'white' : '#94A3B8'};
                text-decoration: none;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.15s ease;
                background: ${isActive ? 'rgba(255,255,255,0.1)' : 'transparent'};
                margin-bottom: 4px;
                ${isCollapsed ? 'justify-content: center;' : ''}
            `;

            // Icon
            if (item.icon) {
                const iconWrapper = document.createElement('span');
                iconWrapper.style.cssText = `
                    flex-shrink: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
                iconWrapper.innerHTML = item.icon;
                itemEl.appendChild(iconWrapper);
            }

            // Label
            if (!isCollapsed) {
                const label = document.createElement('span');
                label.style.cssText = 'flex: 1;';
                label.textContent = item.label;
                itemEl.appendChild(label);

                // Badge
                if (item.badge) {
                    const badge = document.createElement('span');
                    badge.style.cssText = `
                        padding: 2px 8px;
                        background: ${item.badgeColor || '#2563EB'};
                        color: white;
                        font-size: 11px;
                        font-weight: 600;
                        border-radius: 10px;
                    `;
                    badge.textContent = item.badge;
                    itemEl.appendChild(badge);
                }
            }

            // Hover effects
            itemEl.addEventListener('mouseenter', () => {
                if (!isActive) {
                    itemEl.style.background = 'rgba(255,255,255,0.05)';
                    itemEl.style.color = 'white';
                }
            });

            itemEl.addEventListener('mouseleave', () => {
                if (!isActive) {
                    itemEl.style.background = 'transparent';
                    itemEl.style.color = '#94A3B8';
                }
            });

            // Click handler
            itemEl.addEventListener('click', (e) => {
                if (!item.href || item.href === '#') {
                    e.preventDefault();
                }

                currentActive = item.id || index;
                renderItems();

                if (onNavigate) onNavigate(item, index);
            });

            // Tooltip for collapsed state
            if (isCollapsed) {
                itemEl.title = item.label;
            }

            itemsContainer.appendChild(itemEl);
        });
    }

    nav.appendChild(itemsContainer);

    // Toggle button
    if (collapsible) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-toggle';
        toggleBtn.type = 'button';
        toggleBtn.style.cssText = `
            position: absolute;
            right: -12px;
            top: 72px;
            width: 24px;
            height: 24px;
            background: white;
            border: 1px solid #E2E8F0;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
            z-index: 101;
        `;

        toggleBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" style="transition: transform 0.2s ease; transform: rotate(${isCollapsed ? '0' : '180'}deg);">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
        `;

        toggleBtn.addEventListener('click', () => {
            instance.toggle();
        });

        nav.appendChild(toggleBtn);
    }

    containerEl.appendChild(nav);
    renderItems();

    // Instance
    const instance = {
        element: nav,

        toggle() {
            isCollapsed = !isCollapsed;
            nav.style.width = isCollapsed ? '64px' : '260px';

            const toggleBtn = nav.querySelector('.sidebar-toggle svg');
            if (toggleBtn) {
                toggleBtn.style.transform = `rotate(${isCollapsed ? '0' : '180'}deg)`;
            }

            renderItems();
            if (onToggle) onToggle(isCollapsed);
        },

        collapse() {
            if (!isCollapsed) this.toggle();
        },

        expand() {
            if (isCollapsed) this.toggle();
        },

        isCollapsed() {
            return isCollapsed;
        },

        setActive(id) {
            currentActive = id;
            renderItems();
        },

        getActive() {
            return currentActive;
        },

        updateBadge(id, badge) {
            const item = items.find(i => i.id === id);
            if (item) {
                item.badge = badge;
                renderItems();
            }
        }
    };

    return instance;
}

// ========================================
// BREADCRUMB NAVIGATION
// ========================================

/**
 * Create breadcrumb navigation
 * @param {HTMLElement|string} container - Container element
 * @param {Array} items - Breadcrumb items
 * @param {object} options - Options
 * @returns {object} Breadcrumb instance
 */
export function createBreadcrumb(container, items = [], options = {}) {
    const containerEl = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!containerEl) return null;

    const { separator = '/', onNavigate = null } = options;

    const nav = document.createElement('nav');
    nav.className = 'breadcrumb';
    nav.setAttribute('aria-label', 'Breadcrumb');
    nav.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
    `;

    function render(breadcrumbItems) {
        nav.innerHTML = '';

        breadcrumbItems.forEach((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;

            if (isLast) {
                const span = document.createElement('span');
                span.style.cssText = 'color: #0F172A; font-weight: 500;';
                span.textContent = item.label;
                nav.appendChild(span);
            } else {
                const link = document.createElement('a');
                link.href = item.href || '#';
                link.style.cssText = `
                    color: #64748B;
                    text-decoration: none;
                    transition: color 0.15s ease;
                `;
                link.textContent = item.label;

                link.addEventListener('mouseenter', () => {
                    link.style.color = '#2563EB';
                });

                link.addEventListener('mouseleave', () => {
                    link.style.color = '#64748B';
                });

                link.addEventListener('click', (e) => {
                    if (!item.href || item.href === '#') {
                        e.preventDefault();
                    }
                    if (onNavigate) onNavigate(item, index);
                });

                nav.appendChild(link);

                // Separator
                const sep = document.createElement('span');
                sep.style.cssText = 'color: #CBD5E1;';
                sep.textContent = separator;
                nav.appendChild(sep);
            }
        });
    }

    render(items);
    containerEl.appendChild(nav);

    return {
        element: nav,

        setItems(newItems) {
            render(newItems);
        },

        addItem(item) {
            items.push(item);
            render(items);
        },

        removeItem(index) {
            items.splice(index, 1);
            render(items);
        }
    };
}

// ========================================
// MOBILE MENU
// ========================================

/**
 * Create mobile menu toggle
 * @param {HTMLElement} menuButton - Menu button element
 * @param {HTMLElement} menu - Menu element to toggle
 * @param {object} options - Options
 */
export function createMobileMenu(menuButton, menu, options = {}) {
    const { onOpen = null, onClose = null } = options;

    let isOpen = false;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease;
    `;
    document.body.appendChild(overlay);

    function open() {
        isOpen = true;
        menu.style.transform = 'translateX(0)';
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        if (onOpen) onOpen();
    }

    function close() {
        isOpen = false;
        menu.style.transform = 'translateX(-100%)';
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        document.body.style.overflow = '';
        if (onClose) onClose();
    }

    function toggle() {
        isOpen ? close() : open();
    }

    menuButton.addEventListener('click', toggle);
    overlay.addEventListener('click', close);

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            close();
        }
    });

    return { open, close, toggle, isOpen: () => isOpen };
}

// Export default
export default {
    createSidebar,
    createBreadcrumb,
    createMobileMenu
};
