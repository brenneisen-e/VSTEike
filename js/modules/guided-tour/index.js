/**
 * Guided Tour Module - ES6 Entry Point (ES2024)
 * Interactive Demo / Presentation Mode
 */

// ========================================
// GUIDED TOUR CLASS
// ========================================

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
                            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
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
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            Zurück
                        </button>
                        <button class="tour-btn tour-btn-next tour-btn-primary">
                            Weiter
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>
                <div class="tour-progress"><div class="tour-progress-bar"></div></div>
            </div>
        `;

        document.body.appendChild(this.overlay);
        this.tooltip = this.overlay.querySelector('.tour-tooltip');
        this.spotlight = this.overlay.querySelector('.tour-spotlight');

        this.overlay.querySelector('.tour-close').addEventListener('click', () => this.end());
        this.overlay.querySelector('.tour-btn-skip').addEventListener('click', () => this.end());
        this.overlay.querySelector('.tour-btn-prev').addEventListener('click', () => this.prev());
        this.overlay.querySelector('.tour-btn-next').addEventListener('click', () => this.next());
    }

    defineSteps() {
        const icons = {
            welcome: '<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
            target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
            chart: '<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
            trending: '<svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
            map: '<svg viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon></svg>',
            bot: '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path></svg>',
            check: '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
        };

        this.steps = [
            { title: 'Willkommen zum KI-gestützten Arbeitsplatz', description: 'Diese interaktive Tour zeigt Ihnen alle Funktionen unseres intelligenten Dashboards.', icon: icons.welcome, element: null, position: 'center', beforeShow: () => window.switchModule?.('versicherung') },
            { title: 'Modul-Auswahl', description: 'Wählen Sie hier zwischen verschiedenen Analyse-Modulen: Vertriebssteuerung, Banken-Inkasso oder Risikoscoring.', icon: icons.target, element: '.nav-boxes', position: 'bottom' },
            { title: 'KPI-Dashboard', description: '9 interaktive KPI-Karten zeigen Echtzeit-Kennzahlen wie Neugeschäft, Bestand und Stornoquote.', icon: icons.chart, element: '.kpi-grid', position: 'bottom', beforeShow: () => { window.openGesamtuebersicht?.(); return new Promise(r => setTimeout(r, 300)); } },
            { title: 'Interaktive KPI-Karten', description: 'Jede Karte zeigt: aktueller Wert, Trend vs. Vormonat, und ein Mini-Chart.', icon: icons.trending, element: '.kpi-card:first-child', position: 'right' },
            { title: 'Interaktive Deutschlandkarte', description: 'Klicken Sie auf Bundesländer für regionale Analysen. Mehrfachauswahl möglich!', icon: icons.map, element: '.map-container, .map-section', position: 'left' },
            { title: 'KI-Assistent', description: 'Unser KI-Chatbot versteht natürliche Sprache und setzt automatisch Filter.', icon: icons.bot, element: '#chatWidget, #chatToggle', position: 'left', beforeShow: () => { const w = document.getElementById('chatWidget'); if (w) w.style.display = 'flex'; } },
            { title: 'Tour abgeschlossen!', description: 'Sie kennen jetzt alle wichtigen Funktionen. Viel Erfolg!', icon: icons.check, element: null, position: 'center', isLast: true }
        ];
    }

    bindKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            if (e.key === 'Escape') this.end();
            else if (e.key === 'ArrowRight' || e.key === 'Enter') this.next();
            else if (e.key === 'ArrowLeft') this.prev();
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
        this.onComplete?.();
    }

    next() {
        this.currentStep < this.steps.length - 1 ? (this.currentStep++, this.showStep(this.currentStep)) : this.end();
    }

    prev() {
        this.currentStep > 0 && (this.currentStep--, this.showStep(this.currentStep));
    }

    async showStep(index) {
        const step = this.steps[index];
        await step.beforeShow?.();

        this.tooltip.querySelector('.tour-icon').innerHTML = step.icon ?? '';
        this.tooltip.querySelector('.tour-title').textContent = step.title;
        this.tooltip.querySelector('.tour-description').textContent = step.description;
        this.tooltip.querySelector('.tour-step-indicator').textContent = `Schritt ${index + 1} von ${this.steps.length}`;
        this.tooltip.querySelector('.tour-progress-bar').style.width = `${((index + 1) / this.steps.length) * 100}%`;

        const prevBtn = this.tooltip.querySelector('.tour-btn-prev');
        const nextBtn = this.tooltip.querySelector('.tour-btn-next');
        const skipBtn = this.tooltip.querySelector('.tour-btn-skip');

        prevBtn.style.display = index === 0 ? 'none' : 'flex';
        skipBtn.style.display = step.isLast ? 'none' : 'block';
        nextBtn.innerHTML = step.isLast
            ? 'Tour beenden <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : 'Weiter <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="9 18 15 12 9 6"></polyline></svg>';

        this.positionElements(step);
    }

    positionElements(step) {
        let targetElement = null;

        if (step.element) {
            for (const selector of step.element.split(',').map(s => s.trim())) {
                targetElement = document.querySelector(selector);
                if (targetElement) break;
            }
        }

        if (targetElement && step.position !== 'center') {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const rect = targetElement.getBoundingClientRect();
            const padding = 10;

            this.spotlight.style.display = 'block';
            this.spotlight.style.top = `${rect.top - padding}px`;
            this.spotlight.style.left = `${rect.left - padding}px`;
            this.spotlight.style.width = `${rect.width + padding * 2}px`;
            this.spotlight.style.height = `${rect.height + padding * 2}px`;

            this.positionTooltip(rect, step.position);
        } else {
            this.spotlight.style.display = 'none';
            this.tooltip.style.cssText = 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
            this.tooltip.removeAttribute('data-position');
        }
    }

    positionTooltip(rect, position) {
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const margin = 20;
        let top, left;

        this.tooltip.style.transform = 'none';

        switch (position) {
            case 'top': top = rect.top - tooltipRect.height - margin; left = rect.left + (rect.width - tooltipRect.width) / 2; break;
            case 'bottom': top = rect.bottom + margin; left = rect.left + (rect.width - tooltipRect.width) / 2; break;
            case 'left': top = rect.top + (rect.height - tooltipRect.height) / 2; left = rect.left - tooltipRect.width - margin; break;
            case 'right': top = rect.top + (rect.height - tooltipRect.height) / 2; left = rect.right + margin; break;
            default: top = rect.bottom + margin; left = rect.left + (rect.width - tooltipRect.width) / 2;
        }

        left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));
        top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));

        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
        this.tooltip.setAttribute('data-position', position);
    }
}

// ========================================
// EXPORTS
// ========================================

const guidedTour = new GuidedTour();

export const startDemoTour = () => guidedTour.start();

Object.assign(window, { guidedTour, startDemoTour });

console.log('✅ Guided Tour ES6 modules loaded (ES2024)');
