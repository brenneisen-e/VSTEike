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
        // Define all tour steps
        this.steps = [
            // Welcome
            {
                title: 'Willkommen zum KI-gestützten Arbeitsplatz',
                description: 'Diese interaktive Tour zeigt Ihnen alle Funktionen unseres intelligenten Dashboards für Versicherungs- und Banking-Analytics. Klicken Sie auf "Weiter" um zu starten.',
                icon: '👋',
                element: null, // No specific element - centered
                position: 'center'
            },

            // Landing Page - Module Selection
            {
                title: 'Modul-Auswahl',
                description: 'Wählen Sie hier zwischen verschiedenen Analyse-Modulen: Vertriebssteuerung für Versicherungs-KPIs, Banken-Inkasso für Forderungsmanagement, oder Risikoscoring für Bonitätsbewertungen.',
                icon: '🎯',
                element: '.nav-boxes',
                position: 'bottom'
            },

            // KPI Dashboard
            {
                title: 'KPI-Dashboard',
                description: 'Das Herzstück: 9 interaktive KPI-Karten zeigen Echtzeit-Kennzahlen wie Neugeschäft, Bestand, Stornoquote und mehr. Jede Karte ist klickbar für Detailansichten.',
                icon: '📊',
                element: '.kpi-grid',
                position: 'bottom',
                beforeShow: () => {
                    // Make sure we're on the dashboard view
                    if (typeof openGesamtuebersicht === 'function') {
                        openGesamtuebersicht();
                    }
                }
            },

            // KPI Card Details
            {
                title: 'Interaktive KPI-Karten',
                description: 'Jede Karte zeigt: aktueller Wert, Trend vs. Vormonat, und ein Mini-Chart. Klicken Sie auf die Icons rechts um zwischen Monats-, Verteilungs- und Tagesansicht zu wechseln.',
                icon: '📈',
                element: '.kpi-card:first-child',
                position: 'right'
            },

            // View Toggle
            {
                title: 'Ansicht wechseln',
                description: 'Diese Buttons ermöglichen verschiedene Visualisierungen: Monatsansicht (Zeitverlauf), Verteilung (Histogramm der Vermittler), und Tagesansicht (detaillierte Zeitreihe).',
                icon: '🔄',
                element: '.kpi-card:first-child .view-toggle',
                position: 'left'
            },

            // Filters
            {
                title: 'Intelligente Filter',
                description: 'Filtern Sie die Daten nach Jahr, Silo (Ausschließlichkeit, Makler, etc.), Produktsegment oder einzelnen Vermittlern. Alle KPIs aktualisieren sich in Echtzeit.',
                icon: '🔍',
                element: '.filter-bar',
                position: 'bottom'
            },

            // Map
            {
                title: 'Interaktive Deutschlandkarte',
                description: 'Klicken Sie auf Bundesländer um regionale Analysen durchzuführen. Die Karte zeigt farbcodiert die Performance je Region. Mehrfachauswahl möglich!',
                icon: '🗺️',
                element: '.map-container',
                position: 'left'
            },

            // AI Chat
            {
                title: 'KI-Assistent',
                description: 'Unser integrierter KI-Chatbot versteht natürliche Sprache: "Zeige Top 5 Vermittler", "Wie ist die Performance in Bayern?", oder "Filtere nach Makler". Die KI setzt automatisch Filter und analysiert Daten.',
                icon: '🤖',
                element: '#chatWidget, #chatToggle',
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
                icon: '📋',
                element: '.sidebar-btn[onclick*="table"], .view-switch',
                position: 'right'
            },

            // Fullscreen Charts
            {
                title: 'Vollbild-Analyse',
                description: 'Klicken Sie auf die Lupe bei jeder KPI-Karte um eine Vollbild-Ansicht mit erweiterten Analyse-Optionen zu öffnen. Perfekt für Präsentationen!',
                icon: '🔎',
                element: '.zoom-button',
                position: 'left'
            },

            // Banken Module Intro
            {
                title: 'Banken-Inkasso Modul',
                description: 'Das Collections-Dashboard für Forderungsmanagement: KI-basierte Kundensegmentierung, Zahlungsbereitschaft vs. Zahlungsfähigkeit Matrix, und automatisierte Aufgabenverwaltung.',
                icon: '🏦',
                element: '.nav-box[onclick*="Banken"], .nav-box:contains("Banken")',
                position: 'bottom',
                fallbackElement: '.nav-boxes'
            },

            // Completion
            {
                title: 'Tour abgeschlossen!',
                description: 'Sie kennen jetzt alle wichtigen Funktionen. Erkunden Sie das Tool selbst oder starten Sie die Tour jederzeit erneut über den "Demo"-Button. Viel Erfolg!',
                icon: '🎉',
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

    showStep(index) {
        const step = this.steps[index];

        // Execute beforeShow callback if exists
        if (step.beforeShow) {
            step.beforeShow();
        }

        // Update content
        this.tooltip.querySelector('.tour-icon').textContent = step.icon || '💡';
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
