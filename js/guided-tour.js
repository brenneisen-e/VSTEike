// js/guided-tour.js - Interactive Guided Tour / Demo Presentation Mode
// Führt den Benutzer durch alle Features des Tools

class GuidedTour {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.overlay = null;
        this.tooltip = null;
        this.spotlight = null;
        this.steps = [];
        this.onComplete = null;

        this.init();
    }

    init() {
        this.createOverlayElements();
        this.defineSteps();
        this.bindKeyboardNavigation();
    }

    createOverlayElements() {
        // Main overlay container
        this.overlay = document.createElement('div');
        this.overlay.className = 'tour-overlay';
        this.overlay.innerHTML = `
            <div class="tour-backdrop"></div>
            <div class="tour-spotlight"></div>
            <div class="tour-tooltip">
                <div class="tour-tooltip-header">
                    <span class="tour-step-indicator"></span>
                    <button class="tour-close" title="Tour beenden">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="tour-tooltip-content">
                    <div class="tour-icon"></div>
                    <h3 class="tour-title"></h3>
                    <p class="tour-description"></p>
                </div>
                <div class="tour-tooltip-footer">
                    <button class="tour-btn tour-btn-skip">Tour überspringen</button>
                    <div class="tour-nav">
                        <button class="tour-btn tour-btn-prev">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Zurück
                        </button>
                        <button class="tour-btn tour-btn-next tour-btn-primary">
                            Weiter
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="tour-progress">
                    <div class="tour-progress-bar"></div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Get references
        this.tooltip = this.overlay.querySelector('.tour-tooltip');
        this.spotlight = this.overlay.querySelector('.tour-spotlight');

        // Bind button events
        this.overlay.querySelector('.tour-close').addEventListener('click', () => this.end());
        this.overlay.querySelector('.tour-btn-skip').addEventListener('click', () => this.end());
        this.overlay.querySelector('.tour-btn-prev').addEventListener('click', () => this.prev());
        this.overlay.querySelector('.tour-btn-next').addEventListener('click', () => this.next());
    }

    defineSteps() {
        // SVG icon definitions
        const icons = {
            welcome: '<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
            target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
            chart: '<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
            trending: '<svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
            refresh: '<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
            search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
            map: '<svg viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>',
            bot: '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>',
            table: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>',
            maximize: '<svg viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>',
            bank: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
            check: '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
        };

        // Define all tour steps
        this.steps = [
            // Welcome
            {
                title: 'Willkommen zum KI-gestützten Arbeitsplatz',
                description: 'Diese interaktive Tour zeigt Ihnen alle Funktionen unseres intelligenten Dashboards für Versicherungs- und Banking-Analytics. Klicken Sie auf "Weiter" um zu starten.',
                icon: icons.welcome,
                element: null,
                position: 'center',
                beforeShow: () => {
                    // Ensure we start at the landing/module selection
                    if (typeof switchModule === 'function') {
                        switchModule('versicherung');
                    }
                }
            },

            // Landing Page - Module Selection
            {
                title: 'Modul-Auswahl',
                description: 'Wählen Sie hier zwischen verschiedenen Analyse-Modulen: Vertriebssteuerung für Versicherungs-KPIs, Banken-Inkasso für Forderungsmanagement, oder Risikoscoring für Bonitätsbewertungen.',
                icon: icons.target,
                element: '.nav-boxes',
                position: 'bottom',
                beforeShow: () => {
                    // Show module selection area
                    const modulePage = document.querySelector('.module-selector-page');
                    if (modulePage) modulePage.style.display = 'block';
                }
            },

            // KPI Dashboard
            {
                title: 'KPI-Dashboard',
                description: 'Das Herzstück: 9 interaktive KPI-Karten zeigen Echtzeit-Kennzahlen wie Neugeschäft, Bestand, Stornoquote und mehr. Jede Karte ist klickbar für Detailansichten.',
                icon: icons.chart,
                element: '.kpi-grid',
                position: 'bottom',
                beforeShow: () => {
                    // Navigate to the dashboard/Gesamtübersicht
                    if (typeof openGesamtuebersicht === 'function') {
                        openGesamtuebersicht();
                    }
                    // Small delay to let navigation complete
                    return new Promise(resolve => setTimeout(resolve, 300));
                }
            },

            // KPI Card Details
            {
                title: 'Interaktive KPI-Karten',
                description: 'Jede Karte zeigt: aktueller Wert, Trend vs. Vormonat, und ein Mini-Chart. Klicken Sie auf die Icons rechts um zwischen Monats-, Verteilungs- und Tagesansicht zu wechseln.',
                icon: icons.trending,
                element: '.kpi-card:first-child',
                position: 'right'
            },

            // View Toggle
            {
                title: 'Ansicht wechseln',
                description: 'Diese Buttons ermöglichen verschiedene Visualisierungen: Monatsansicht (Zeitverlauf), Verteilung (Histogramm der Vermittler), und Tagesansicht (detaillierte Zeitreihe).',
                icon: icons.refresh,
                element: '.kpi-card:first-child .view-toggle',
                position: 'left'
            },

            // Filters
            {
                title: 'Intelligente Filter',
                description: 'Filtern Sie die Daten nach Jahr, Silo (Ausschließlichkeit, Makler, etc.), Produktsegment oder einzelnen Vermittlern. Alle KPIs aktualisieren sich in Echtzeit.',
                icon: icons.search,
                element: '.filter-bar, .filters',
                position: 'bottom'
            },

            // Map
            {
                title: 'Interaktive Deutschlandkarte',
                description: 'Klicken Sie auf Bundesländer um regionale Analysen durchzuführen. Die Karte zeigt farbcodiert die Performance je Region. Mehrfachauswahl möglich!',
                icon: icons.map,
                element: '.map-container, .map-section',
                position: 'left'
            },

            // AI Chat
            {
                title: 'KI-Assistent',
                description: 'Unser integrierter KI-Chatbot versteht natürliche Sprache: "Zeige Top 5 Vermittler", "Wie ist die Performance in Bayern?", oder "Filtere nach Makler". Die KI setzt automatisch Filter und analysiert Daten.',
                icon: icons.bot,
                element: '#chatWidget, #chatToggle, .chat-widget',
                position: 'left',
                beforeShow: () => {
                    const toggle = document.getElementById('chatToggle');
                    const widget = document.getElementById('chatWidget');
                    if (toggle && widget) {
                        widget.style.display = 'flex';
                        toggle.style.display = 'none';
                    }
                }
            },

            // Table View
            {
                title: 'Tabellen-Ansicht',
                description: 'Wechseln Sie zur detaillierten Tabellenansicht um alle Vermittler zu sehen. Sortieren, filtern und exportieren Sie Daten. Wählen Sie mehrere Vermittler für Vergleiche aus.',
                icon: icons.table,
                element: '.view-mode-toggle, .sidebar-btn[onclick*="table"]',
                position: 'right'
            },

            // Fullscreen Charts
            {
                title: 'Vollbild-Analyse',
                description: 'Klicken Sie auf die Lupe bei jeder KPI-Karte um eine Vollbild-Ansicht mit erweiterten Analyse-Optionen zu öffnen. Perfekt für Präsentationen!',
                icon: icons.maximize,
                element: '.zoom-button',
                position: 'left'
            },

            // Banken Module Intro
            {
                title: 'Banken-Inkasso Modul',
                description: 'Das Collections-Dashboard für Forderungsmanagement: KI-basierte Kundensegmentierung, Zahlungsbereitschaft vs. Zahlungsfähigkeit Matrix, und automatisierte Aufgabenverwaltung.',
                icon: icons.bank,
                element: '.nav-box[onclick*="banken"], .banken-module-card',
                position: 'bottom',
                fallbackElement: '.nav-boxes',
                beforeShow: () => {
                    // Navigate to Banken module
                    if (typeof switchModule === 'function') {
                        switchModule('banken');
                    }
                    return new Promise(resolve => setTimeout(resolve, 300));
                }
            },

            // Completion
            {
                title: 'Tour abgeschlossen!',
                description: 'Sie kennen jetzt alle wichtigen Funktionen. Erkunden Sie das Tool selbst oder starten Sie die Tour jederzeit erneut über den "Demo"-Button. Viel Erfolg!',
                icon: icons.check,
                element: null,
                position: 'center',
                isLast: true
            }
        ];
    }

    bindKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;

            if (e.key === 'Escape') {
                this.end();
            } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
                this.next();
            } else if (e.key === 'ArrowLeft') {
                this.prev();
            }
        });
    }

    start() {
        this.isActive = true;
        this.currentStep = 0;
        this.overlay.classList.add('active');
        document.body.classList.add('tour-active');
        this.showStep(0);
    }

    end() {
        this.isActive = false;
        this.overlay.classList.remove('active');
        document.body.classList.remove('tour-active');
        this.spotlight.style.display = 'none';

        if (this.onComplete) {
            this.onComplete();
        }
    }

    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.showStep(this.currentStep);
        } else {
            this.end();
        }
    }

    prev() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    goToStep(index) {
        if (index >= 0 && index < this.steps.length) {
            this.currentStep = index;
            this.showStep(index);
        }
    }

    async showStep(index) {
        const step = this.steps[index];

        // Execute beforeShow callback if exists (supports async)
        if (step.beforeShow) {
            await step.beforeShow();
        }

        // Update content - use innerHTML for SVG icons
        this.tooltip.querySelector('.tour-icon').innerHTML = step.icon || '';
        this.tooltip.querySelector('.tour-title').textContent = step.title;
        this.tooltip.querySelector('.tour-description').textContent = step.description;
        this.tooltip.querySelector('.tour-step-indicator').textContent = `Schritt ${index + 1} von ${this.steps.length}`;

        // Update progress bar
        const progress = ((index + 1) / this.steps.length) * 100;
        this.tooltip.querySelector('.tour-progress-bar').style.width = `${progress}%`;

        // Update buttons
        const prevBtn = this.tooltip.querySelector('.tour-btn-prev');
        const nextBtn = this.tooltip.querySelector('.tour-btn-next');
        const skipBtn = this.tooltip.querySelector('.tour-btn-skip');

        prevBtn.style.display = index === 0 ? 'none' : 'flex';
        skipBtn.style.display = step.isLast ? 'none' : 'block';

        if (step.isLast) {
            nextBtn.innerHTML = `
                Tour beenden
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
        } else {
            nextBtn.innerHTML = `
                Weiter
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            `;
        }

        // Position tooltip and spotlight
        this.positionElements(step);
    }

    positionElements(step) {
        // Find target element
        let targetElement = null;

        if (step.element) {
            // Handle multiple selectors separated by comma
            const selectors = step.element.split(',').map(s => s.trim());
            for (const selector of selectors) {
                targetElement = document.querySelector(selector);
                if (targetElement) break;
            }

            // Try fallback element
            if (!targetElement && step.fallbackElement) {
                targetElement = document.querySelector(step.fallbackElement);
            }
        }

        if (targetElement && step.position !== 'center') {
            // Scroll element into view
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Get element position
            const rect = targetElement.getBoundingClientRect();
            const padding = 10;

            // Position spotlight
            this.spotlight.style.display = 'block';
            this.spotlight.style.top = `${rect.top - padding}px`;
            this.spotlight.style.left = `${rect.left - padding}px`;
            this.spotlight.style.width = `${rect.width + padding * 2}px`;
            this.spotlight.style.height = `${rect.height + padding * 2}px`;

            // Position tooltip based on position preference
            this.positionTooltip(rect, step.position);
        } else {
            // Center position (no element)
            this.spotlight.style.display = 'none';
            this.tooltip.style.top = '50%';
            this.tooltip.style.left = '50%';
            this.tooltip.style.transform = 'translate(-50%, -50%)';
            this.tooltip.removeAttribute('data-position');
        }
    }

    positionTooltip(rect, position) {
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const margin = 20;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top, left;
        this.tooltip.style.transform = 'none';

        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - margin;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + margin;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - margin;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + margin;
                break;
            default:
                top = rect.bottom + margin;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
        }

        // Keep within viewport bounds
        if (left < margin) left = margin;
        if (left + tooltipRect.width > viewportWidth - margin) {
            left = viewportWidth - tooltipRect.width - margin;
        }
        if (top < margin) top = margin;
        if (top + tooltipRect.height > viewportHeight - margin) {
            top = viewportHeight - tooltipRect.height - margin;
        }

        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
        this.tooltip.setAttribute('data-position', position);
    }
}

// Create global instance
window.guidedTour = new GuidedTour();

// Helper function to start tour
function startDemoTour() {
    window.guidedTour.start();
}

// Export
window.startDemoTour = startDemoTour;

console.log('✅ guided-tour.js geladen');
