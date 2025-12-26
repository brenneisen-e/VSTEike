/**
 * Tabs Component
 * Reusable tab navigation system
 */

// ========================================
// TABS CREATION
// ========================================

/**
 * Create tab component
 * @param {HTMLElement} container - Container element
 * @param {object} options - Tab options
 * @returns {object} Tabs instance
 */
export function create(container, options = {}) {
    const {
        tabs = [],
        activeTab = 0,
        variant = 'default', // 'default', 'pills', 'underline'
        onChange = null,
        renderPanel = null
    } = options;

    // Styles based on variant
    const variants = {
        default: {
            nav: `
                display: flex;
                border-bottom: 1px solid #E2E8F0;
                gap: 0;
            `,
            tab: `
                padding: 12px 16px;
                font-size: 14px;
                font-weight: 500;
                color: #64748B;
                background: none;
                border: none;
                cursor: pointer;
                position: relative;
                transition: color 0.15s ease;
            `,
            tabActive: `
                color: #2563EB;
            `,
            tabIndicator: `
                position: absolute;
                bottom: -1px;
                left: 0;
                right: 0;
                height: 2px;
                background: #2563EB;
            `
        },
        pills: {
            nav: `
                display: flex;
                gap: 8px;
                padding: 4px;
                background: #F1F5F9;
                border-radius: 8px;
            `,
            tab: `
                padding: 8px 16px;
                font-size: 14px;
                font-weight: 500;
                color: #64748B;
                background: none;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.15s ease;
            `,
            tabActive: `
                background: white;
                color: #0F172A;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            `,
            tabIndicator: ''
        },
        underline: {
            nav: `
                display: flex;
                gap: 24px;
            `,
            tab: `
                padding: 12px 0;
                font-size: 14px;
                font-weight: 500;
                color: #64748B;
                background: none;
                border: none;
                cursor: pointer;
                position: relative;
                transition: color 0.15s ease;
            `,
            tabActive: `
                color: #0F172A;
            `,
            tabIndicator: `
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: #0F172A;
            `
        }
    };

    const style = variants[variant] || variants.default;

    // Create navigation
    const nav = document.createElement('nav');
    nav.className = 'tabs-nav';
    nav.setAttribute('role', 'tablist');
    nav.style.cssText = style.nav;

    // Create panels container
    const panelsContainer = document.createElement('div');
    panelsContainer.className = 'tabs-panels';
    panelsContainer.style.cssText = `
        padding-top: 16px;
    `;

    // State
    let currentTab = activeTab;
    const tabElements = [];
    const panelElements = [];

    // Create tabs and panels
    tabs.forEach((tab, index) => {
        const id = `tab-${Date.now()}-${index}`;
        const panelId = `panel-${Date.now()}-${index}`;

        // Tab button
        const tabEl = document.createElement('button');
        tabEl.type = 'button';
        tabEl.className = 'tabs-tab';
        tabEl.id = id;
        tabEl.setAttribute('role', 'tab');
        tabEl.setAttribute('aria-controls', panelId);
        tabEl.setAttribute('aria-selected', index === currentTab);
        tabEl.style.cssText = style.tab;

        // Tab content
        if (tab.icon) {
            const iconSpan = document.createElement('span');
            iconSpan.innerHTML = tab.icon;
            iconSpan.style.cssText = 'margin-right: 8px; display: inline-flex; align-items: center;';
            tabEl.appendChild(iconSpan);
        }

        const labelSpan = document.createElement('span');
        labelSpan.textContent = tab.label || tab;
        tabEl.appendChild(labelSpan);

        if (tab.badge) {
            const badge = document.createElement('span');
            badge.className = 'tabs-badge';
            badge.textContent = tab.badge;
            badge.style.cssText = `
                margin-left: 8px;
                padding: 2px 8px;
                background: #E2E8F0;
                color: #64748B;
                font-size: 12px;
                border-radius: 10px;
            `;
            tabEl.appendChild(badge);
        }

        // Active indicator
        const indicator = document.createElement('span');
        indicator.className = 'tabs-indicator';
        indicator.style.cssText = style.tabIndicator;
        if (index !== currentTab) {
            indicator.style.display = 'none';
        }
        tabEl.appendChild(indicator);

        // Apply active style
        if (index === currentTab) {
            tabEl.style.cssText += style.tabActive;
        }

        // Hover effect
        tabEl.addEventListener('mouseenter', () => {
            if (index !== currentTab) {
                tabEl.style.color = '#0F172A';
            }
        });

        tabEl.addEventListener('mouseleave', () => {
            if (index !== currentTab) {
                tabEl.style.color = '#64748B';
            }
        });

        // Click handler
        tabEl.addEventListener('click', () => {
            instance.setActiveTab(index);
        });

        tabElements.push(tabEl);
        nav.appendChild(tabEl);

        // Panel
        const panel = document.createElement('div');
        panel.className = 'tabs-panel';
        panel.id = panelId;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', id);
        panel.style.cssText = `
            display: ${index === currentTab ? 'block' : 'none'};
        `;

        // Panel content
        if (renderPanel) {
            const content = renderPanel(tab, index);
            if (typeof content === 'string') {
                panel.innerHTML = content;
            } else if (content instanceof Element) {
                panel.appendChild(content);
            }
        } else if (tab.content) {
            if (typeof tab.content === 'string') {
                panel.innerHTML = tab.content;
            } else if (tab.content instanceof Element) {
                panel.appendChild(tab.content);
            }
        }

        panelElements.push(panel);
        panelsContainer.appendChild(panel);
    });

    // Append to container
    container.innerHTML = '';
    container.appendChild(nav);
    container.appendChild(panelsContainer);

    // Instance
    const instance = {
        container,
        nav,
        panels: panelsContainer,

        getActiveTab() {
            return currentTab;
        },

        setActiveTab(index) {
            if (index === currentTab || index < 0 || index >= tabs.length) return;

            // Deactivate current
            const prevTab = tabElements[currentTab];
            const prevPanel = panelElements[currentTab];

            prevTab.style.cssText = style.tab;
            prevTab.setAttribute('aria-selected', 'false');
            prevTab.querySelector('.tabs-indicator').style.display = 'none';
            prevPanel.style.display = 'none';

            // Activate new
            currentTab = index;
            const newTab = tabElements[currentTab];
            const newPanel = panelElements[currentTab];

            newTab.style.cssText = style.tab + style.tabActive;
            newTab.setAttribute('aria-selected', 'true');
            const indicator = newTab.querySelector('.tabs-indicator');
            if (indicator && style.tabIndicator) {
                indicator.style.cssText = style.tabIndicator;
            }
            newPanel.style.display = 'block';

            if (onChange) onChange(currentTab, tabs[currentTab]);
        },

        setTabContent(index, content) {
            const panel = panelElements[index];
            if (!panel) return;

            if (typeof content === 'string') {
                panel.innerHTML = content;
            } else if (content instanceof Element) {
                panel.innerHTML = '';
                panel.appendChild(content);
            }
        },

        enableTab(index) {
            const tab = tabElements[index];
            if (tab) {
                tab.disabled = false;
                tab.style.opacity = '1';
                tab.style.cursor = 'pointer';
            }
        },

        disableTab(index) {
            const tab = tabElements[index];
            if (tab) {
                tab.disabled = true;
                tab.style.opacity = '0.5';
                tab.style.cursor = 'not-allowed';
            }
        },

        updateBadge(index, badge) {
            const tab = tabElements[index];
            if (!tab) return;

            let badgeEl = tab.querySelector('.tabs-badge');
            if (badge) {
                if (!badgeEl) {
                    badgeEl = document.createElement('span');
                    badgeEl.className = 'tabs-badge';
                    badgeEl.style.cssText = `
                        margin-left: 8px;
                        padding: 2px 8px;
                        background: #E2E8F0;
                        color: #64748B;
                        font-size: 12px;
                        border-radius: 10px;
                    `;
                    tab.appendChild(badgeEl);
                }
                badgeEl.textContent = badge;
            } else if (badgeEl) {
                badgeEl.remove();
            }
        }
    };

    return instance;
}

/**
 * Initialize tabs from existing HTML
 * @param {string} selector - Container selector
 * @param {object} options - Options
 */
export function init(selector, options = {}) {
    const containers = document.querySelectorAll(selector);
    const instances = [];

    containers.forEach(container => {
        const tabElements = container.querySelectorAll('[data-tab]');
        const tabs = Array.from(tabElements).map(el => ({
            label: el.textContent,
            content: el.dataset.content || ''
        }));

        if (tabs.length > 0) {
            instances.push(create(container, { ...options, tabs }));
        }
    });

    return instances;
}

// Export default
export default { create, init };
