// SCREENSHOT ANNOTATION SYSTEM
// ========================================

let currentScreenshotData = null;
let screenshotCanvas = null;
let screenshotCtx = null;
let screenshotImage = null;
let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#ef4444';
let drawHistory = [];
let startX, startY;

// Screenshot aufnehmen
async function captureScreenshot() {
    const btn = document.getElementById('screenshotBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="spin"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> Wird aufgenommen...';
    btn.disabled = true;

    try {
        // Feedback-Panel kurz ausblenden für sauberen Screenshot
        const feedbackPanel = document.getElementById('feedbackPanel');
        const screenshotModal = document.getElementById('screenshotModal');
        feedbackPanel.style.visibility = 'hidden';

        // Screenshot vom sichtbaren Viewport erstellen (was der User gerade sieht)
        const canvas = await html2canvas(document.body, {
            scale: 2, // Höhere Auflösung für bessere Qualität
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            // Nur den sichtbaren Viewport erfassen
            x: window.scrollX,
            y: window.scrollY,
            width: window.innerWidth,
            height: window.innerHeight,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            ignoreElements: (element) => {
                // Feedback-Panel und Chat-Widget nicht mitaufnehmen
                return element.id === 'feedbackPanel' ||
                       element.id === 'bankenChatWidget' ||
                       element.classList?.contains('banken-chat-toggle');
            }
        });

        feedbackPanel.style.visibility = 'visible';

        // Screenshot im Modal öffnen
        screenshotImage = new Image();
        screenshotImage.onload = function() {
            openScreenshotModal();
        };
        screenshotImage.src = canvas.toDataURL('image/png'); // PNG für beste Qualität

    } catch (error) {
        console.error('Screenshot Fehler:', error);
        showFeedbackNotification('Screenshot konnte nicht erstellt werden');
    }

    btn.innerHTML = originalText;
    btn.disabled = false;
}

// Screenshot-Modal öffnen
function openScreenshotModal() {
    const modal = document.getElementById('screenshotModal');
    const canvas = document.getElementById('screenshotCanvas');

    modal.classList.add('open');

    // Canvas initialisieren
    screenshotCanvas = canvas;
    screenshotCtx = canvas.getContext('2d');

    // Canvas-Größe an Bild anpassen
    canvas.width = screenshotImage.width;
    canvas.height = screenshotImage.height;

    // Bild zeichnen
    screenshotCtx.drawImage(screenshotImage, 0, 0);

    // Zeichen-History zurücksetzen
    drawHistory = [];
    saveDrawState();

    // Event-Listener für Zeichnen
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch-Support
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

// Screenshot-Modal schließen
function closeScreenshotModal() {
    const modal = document.getElementById('screenshotModal');
    modal.classList.remove('open');

    // Event-Listener entfernen
    const canvas = document.getElementById('screenshotCanvas');
    canvas.removeEventListener('mousedown', startDrawing);
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mouseup', stopDrawing);
    canvas.removeEventListener('mouseout', stopDrawing);
    canvas.removeEventListener('touchstart', handleTouch);
    canvas.removeEventListener('touchmove', handleTouch);
    canvas.removeEventListener('touchend', stopDrawing);
}

// Touch-Events handling
function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = screenshotCanvas.getBoundingClientRect();
    const scaleX = screenshotCanvas.width / rect.width;
    const scaleY = screenshotCanvas.height / rect.height;

    const mouseEvent = {
        offsetX: (touch.clientX - rect.left) * scaleX,
        offsetY: (touch.clientY - rect.top) * scaleY,
        type: e.type === 'touchstart' ? 'mousedown' : 'mousemove'
    };

    if (e.type === 'touchstart') {
        startDrawing(mouseEvent);
    } else {
        draw(mouseEvent);
    }
}

// Zeichnen starten
function startDrawing(e) {
    isDrawing = true;
    const rect = screenshotCanvas.getBoundingClientRect();
    const scaleX = screenshotCanvas.width / rect.width;
    const scaleY = screenshotCanvas.height / rect.height;

    // Immer skalieren - offsetX/offsetY sind relativ zur Anzeigegröße
    const clientX = e.offsetX !== undefined ? e.offsetX : (e.clientX - rect.left);
    const clientY = e.offsetY !== undefined ? e.offsetY : (e.clientY - rect.top);
    startX = clientX * scaleX;
    startY = clientY * scaleY;

    if (currentTool === 'pen') {
        screenshotCtx.beginPath();
        screenshotCtx.moveTo(startX, startY);
    }
}

// Zeichnen
function draw(e) {
    if (!isDrawing) return;

    const rect = screenshotCanvas.getBoundingClientRect();
    const scaleX = screenshotCanvas.width / rect.width;
    const scaleY = screenshotCanvas.height / rect.height;

    // Immer skalieren - offsetX/offsetY sind relativ zur Anzeigegröße
    const clientX = e.offsetX !== undefined ? e.offsetX : (e.clientX - rect.left);
    const clientY = e.offsetY !== undefined ? e.offsetY : (e.clientY - rect.top);
    const x = clientX * scaleX;
    const y = clientY * scaleY;

    screenshotCtx.strokeStyle = currentColor;
    screenshotCtx.lineWidth = 4;
    screenshotCtx.lineCap = 'round';
    screenshotCtx.lineJoin = 'round';

    if (currentTool === 'pen') {
        screenshotCtx.lineTo(x, y);
        screenshotCtx.stroke();
    } else if (['rect', 'circle', 'arrow'].includes(currentTool)) {
        // Für Formen: Bei jedem Move das Canvas wiederherstellen und Form neu zeichnen
        restoreLastState();
        drawShape(startX, startY, x, y);
    }
}

// Zeichnen beenden
function stopDrawing(e) {
    if (isDrawing) {
        isDrawing = false;
        saveDrawState();
    }
}

// Form zeichnen
function drawShape(x1, y1, x2, y2) {
    screenshotCtx.strokeStyle = currentColor;
    screenshotCtx.lineWidth = 4;
    screenshotCtx.lineCap = 'round';
    screenshotCtx.lineJoin = 'round';

    if (currentTool === 'rect') {
        screenshotCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    } else if (currentTool === 'circle') {
        const radiusX = Math.abs(x2 - x1) / 2;
        const radiusY = Math.abs(y2 - y1) / 2;
        const centerX = x1 + (x2 - x1) / 2;
        const centerY = y1 + (y2 - y1) / 2;

        screenshotCtx.beginPath();
        screenshotCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        screenshotCtx.stroke();
    } else if (currentTool === 'arrow') {
        // Linie zeichnen
        screenshotCtx.beginPath();
        screenshotCtx.moveTo(x1, y1);
        screenshotCtx.lineTo(x2, y2);
        screenshotCtx.stroke();

        // Pfeilspitze
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 20;

        screenshotCtx.beginPath();
        screenshotCtx.moveTo(x2, y2);
        screenshotCtx.lineTo(
            x2 - headLength * Math.cos(angle - Math.PI / 6),
            y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        screenshotCtx.moveTo(x2, y2);
        screenshotCtx.lineTo(
            x2 - headLength * Math.cos(angle + Math.PI / 6),
            y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        screenshotCtx.stroke();
    }
}

// Zeichenzustand speichern
function saveDrawState() {
    drawHistory.push(screenshotCanvas.toDataURL());
}

// Letzten Zustand wiederherstellen (für Live-Preview von Formen)
function restoreLastState() {
    if (drawHistory.length > 0) {
        const img = new Image();
        img.src = drawHistory[drawHistory.length - 1];
        screenshotCtx.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
        screenshotCtx.drawImage(img, 0, 0);
    }
}

// Rückgängig machen
function undoDrawing() {
    if (drawHistory.length > 1) {
        drawHistory.pop(); // Aktuellen Zustand entfernen
        const img = new Image();
        img.onload = function() {
            screenshotCtx.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
            screenshotCtx.drawImage(img, 0, 0);
        };
        img.src = drawHistory[drawHistory.length - 1];
    }
}

// Alles löschen (zurück zum Original)
function clearDrawing() {
    screenshotCtx.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
    screenshotCtx.drawImage(screenshotImage, 0, 0);
    drawHistory = [];
    saveDrawState();
}

// Werkzeug wählen
function setDrawTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.screenshot-tool').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tool === tool) {
            btn.classList.add('active');
        }
    });

    // Bei Text-Tool: Prompt anzeigen
    if (tool === 'text') {
        showFeedbackNotification('Klicke auf die Stelle, wo der Text erscheinen soll');
        screenshotCanvas.onclick = function(e) {
            if (currentTool === 'text') {
                const text = prompt('Text eingeben:');
                if (text) {
                    const rect = screenshotCanvas.getBoundingClientRect();
                    const scaleX = screenshotCanvas.width / rect.width;
                    const scaleY = screenshotCanvas.height / rect.height;
                    // Immer skalieren
                    const clientX = e.offsetX !== undefined ? e.offsetX : (e.clientX - rect.left);
                    const clientY = e.offsetY !== undefined ? e.offsetY : (e.clientY - rect.top);
                    const x = clientX * scaleX;
                    const y = clientY * scaleY;

                    screenshotCtx.font = 'bold 24px Arial';
                    screenshotCtx.fillStyle = currentColor;
                    screenshotCtx.fillText(text, x, y);
                    saveDrawState();
                }
            }
        };
    } else {
        screenshotCanvas.onclick = null;
    }
}

// Farbe wählen
function setDrawColor(color) {
    currentColor = color;
    document.querySelectorAll('.screenshot-color').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.color === color) {
            btn.classList.add('active');
        }
    });
}

// Screenshot speichern und zum Feedback hinzufügen
function saveAnnotatedScreenshot() {
    currentScreenshotData = screenshotCanvas.toDataURL('image/jpeg', 0.92); // Höhere Qualität

    // Vorschau anzeigen
    const preview = document.getElementById('screenshotPreview');
    const thumbnail = document.getElementById('screenshotThumbnail');

    thumbnail.src = currentScreenshotData;
    preview.style.display = 'flex';

    // Modal schließen
    closeScreenshotModal();

    showFeedbackNotification('Screenshot hinzugefügt!');
}

// Screenshot bearbeiten
function editScreenshot() {
    if (currentScreenshotData) {
        screenshotImage = new Image();
        screenshotImage.onload = function() {
            openScreenshotModal();
        };
        screenshotImage.src = currentScreenshotData;
    }
}

// Screenshot entfernen
function removeScreenshot() {
    currentScreenshotData = null;
    const preview = document.getElementById('screenshotPreview');
    preview.style.display = 'none';
}

// submitFeedback erweitern für Screenshot
const originalSubmitFeedback = typeof submitFeedback === 'function' ? submitFeedback : null;

// Feedback System beim Laden initialisieren
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initFeedbackSystem, 500);
});

// Component registry for the modular Banken system
const BANKEN_COMPONENTS = [
    'header',
    'section-segmentierung',
    'section-npl',
    'section-stage2',
    'section-aufgaben',
    'modal-customer-detail',
    'modal-document-scanner',
    'crm-profile-view'
];

// Load a single component
async function loadComponent(componentName) {
    try {
        const response = await fetch(`partials/banken/${componentName}.html`);
        if (response.ok) {
            return await response.text();
        }
        console.warn(`Component ${componentName} could not be loaded`);
        return `<!-- Component ${componentName} failed to load -->`;
    } catch (error) {
        console.warn(`Error loading component ${componentName}:`, error);
        return `<!-- Component ${componentName} error -->`;
    }
}

// Load all components and inject into placeholders
async function loadBankenComponents(container) {
    const componentPlaceholders = container.querySelectorAll('[data-component]');

    // Load all components in parallel for better performance
    const loadPromises = Array.from(componentPlaceholders).map(async (placeholder) => {
        const componentName = placeholder.getAttribute('data-component');
        const html = await loadComponent(componentName);
        placeholder.outerHTML = html;
    });

    await Promise.all(loadPromises);
    console.log(`Loaded ${componentPlaceholders.length} components`);
}

// Show loading progress bar
function showLoadingProgress(container) {
    container.innerHTML = `
        <div class="banken-loading-screen">
            <div class="loading-content">
                <div class="loading-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                </div>
                <h2 class="loading-title">Collections Management</h2>
                <div class="loading-progress-container">
                    <div class="loading-progress-bar">
                        <div class="loading-progress-fill" id="loadingProgressFill"></div>
                    </div>
                    <span class="loading-progress-text" id="loadingProgressText">Initialisiere...</span>
                </div>
            </div>
        </div>
    `;
}

// Update loading progress for Banken module
function updateBankenLoadingProgress(percent, text) {
    const fill = document.getElementById('loadingProgressFill');
    const textEl = document.getElementById('loadingProgressText');

    if (fill) fill.style.width = `${percent}%`;
    if (textEl) textEl.textContent = text;
}

// Load Banken module from partial (modular version) - loads in background
async function loadBankenModule() {
    if (bankenModuleLoaded) return;

    const container = document.getElementById('bankenModule');
    if (!container) return;

    try {
        // Load main shell template
        const response = await fetch('partials/banken-module.html');
        if (response.ok) {
            const html = await response.text();

            // Create temporary container to load components
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;

            // Load all components in background
            await loadBankenComponents(tempContainer);

            // Set the content once everything is loaded
            container.innerHTML = tempContainer.innerHTML;

            bankenModuleLoaded = true;
            console.log('Banken-Modul geladen');

            // Initialize charts after all content is loaded
            setTimeout(() => {
                initBankenCharts();
                // Initialize Banken Chat
                if (typeof initBankenChat === 'function') {
                    initBankenChat();
                }
                // Initialize Feedback System
                initFeedbackSystem();
            }, 100);
        } else {
            throw new Error('Failed to load module');
        }
    } catch (error) {
        console.error('Banken-Modul Fehler:', error);
        container.innerHTML = `
            <div class="banken-error-screen">
                <p>Fehler beim Laden. Bitte starte die Anwendung über einen Webserver.</p>
            </div>
        `;
    }
}

// Load all components in parallel (no progress display)
async function loadBankenComponents(container) {
    const componentPlaceholders = container.querySelectorAll('[data-component]');

    // Load all components in parallel for faster loading
    const loadPromises = Array.from(componentPlaceholders).map(async (placeholder) => {
        const componentName = placeholder.getAttribute('data-component');
        const html = await loadComponent(componentName);
        placeholder.outerHTML = html;
    });

    await Promise.all(loadPromises);
    console.log(`Loaded ${componentPlaceholders.length} components`);
}

function switchModule(moduleName) {
    // Update module tabs
    document.querySelectorAll('.module-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.module === moduleName) {
            tab.classList.add('active');
        }
    });

    // Update module content
    document.querySelectorAll('.module-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetModule = document.getElementById(moduleName + 'Module');
    if (targetModule) {
        targetModule.classList.add('active');
    }

    // Store current module
    localStorage.setItem('currentModule', moduleName);

    // Load Banken module dynamically when first accessed
    if (moduleName === 'banken') {
        loadBankenModule();
    }

    console.log('Switched to module:', moduleName);
}

// Initialize module on page load
function initModuleSelector() {
    const savedModule = localStorage.getItem('currentModule') || 'versicherung';
    switchModule(savedModule);
}

// ========================================
// BANKEN COLLECTIONS DASHBOARD FUNCTIONS
// ========================================

// Switch between Banken Dashboard tabs
function showBankenTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.banken-tabs .banken-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Find and activate the clicked tab
    const tabButtons = document.querySelectorAll('.banken-tabs .banken-tab');
    tabButtons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(tabName.toLowerCase()) ||
            btn.onclick.toString().includes(tabName)) {
            btn.classList.add('active');
        }
    });

    // Activate by checking onclick attribute
    document.querySelectorAll('.banken-tabs .banken-tab').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabName}'`)) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.banken-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetContent = document.getElementById(`banken-tab-${tabName}`);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    console.log('Banken tab switched to:', tabName);
}

// Filter by segment in 2x2 matrix
function filterBySegment(segment) {
    // Map segment parameter to badge class and display name
    const segmentConfig = {
        'eskalation': { badgeClass: 'escalate', name: 'Eskalation', color: '#ef4444' },
        'prioritaet': { badgeClass: 'priority', name: 'Priorität', color: '#22c55e' },
        'restrukturierung': { badgeClass: 'restructure', name: 'Restrukturierung', color: '#f59e0b' },
        'abwicklung': { badgeClass: 'writeoff', name: 'Abwicklung', color: '#64748b' }
    };

    const config = segmentConfig[segment];
    if (!config) {
        console.warn('Unknown segment:', segment);
        return;
    }

    // Highlight selected quadrant
    document.querySelectorAll('.matrix-quadrant').forEach(q => {
        q.classList.remove('selected');
    });
    const selectedQuadrant = document.querySelector(`.matrix-quadrant.segment-${segment}`);
    if (selectedQuadrant) {
        selectedQuadrant.classList.add('selected');
    }

    // Find the customer table
    const table = document.querySelector('.banken-page .customer-table');
    if (!table) {
        console.warn('Customer table not found');
        return;
    }

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Filter rows by segment
    let matchingRows = [];
    let hiddenRows = [];

    rows.forEach(row => {
        const segmentBadge = row.querySelector('.segment-badge');
        if (segmentBadge && segmentBadge.classList.contains(config.badgeClass)) {
            matchingRows.push(row);
            row.style.display = '';
        } else {
            hiddenRows.push(row);
            row.style.display = 'none';
        }
    });

    // Sort matching rows by volume (Forderung) - highest first
    matchingRows.sort((a, b) => {
        const amountA = parseAmount(a.querySelector('.amount')?.textContent || '0');
        const amountB = parseAmount(b.querySelector('.amount')?.textContent || '0');
        return amountB - amountA; // Descending order
    });

    // Re-append rows in sorted order (matching first, then hidden)
    matchingRows.forEach(row => tbody.appendChild(row));
    hiddenRows.forEach(row => tbody.appendChild(row));

    // Show/update filter indicator
    showFilterIndicator(config.name, config.color, matchingRows.length, segment);

    // Scroll to table
    const tableWrapper = document.querySelector('.banken-page .customer-table-wrapper');
    if (tableWrapper) {
        tableWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Update pagination text
    const paginationText = document.querySelector('.table-pagination span');
    if (paginationText) {
        paginationText.textContent = `Zeige ${matchingRows.length} ${config.name}-Fälle (sortiert nach Volumen)`;
    }

    showNotification(`${matchingRows.length} Fälle im Segment "${config.name}" gefunden`, 'info');
    console.log('Filtered by segment:', segment, '- Found:', matchingRows.length);
}

// Track currently selected segment
let currentSelectedSegment = null;

// Toggle collapsible sections
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('collapsed');

        // Save state to localStorage
        const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
        collapsedSections[sectionId] = section.classList.contains('collapsed');
        localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
    }
}

// Restore collapsed sections state on page load
function restoreCollapsedSections() {
    const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
    Object.keys(collapsedSections).forEach(sectionId => {
        if (collapsedSections[sectionId]) {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('collapsed');
            }
        }
    });
}

// Show all ehemalige (former) cases
function showAllEhemalige() {
    // Filter customer list by ehemalige status
    showNotification('Zeige alle ehemaligen Fälle', 'info');

    // For demo, show notification - in production this would filter/show a dedicated view
    const customerTable = document.querySelector('.customer-table tbody');
    if (customerTable) {
        // Scroll to customer list
        const customerList = document.querySelector('.customer-list-section');
        if (customerList) {
            customerList.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Navigate to customer list with segment filter applied
function openSegmentFullscreen(segment) {
    const segmentConfig = {
        'eskalation': { badgeClass: 'escalate', name: 'Eskalation', filterValue: 'escalate' },
        'prioritaet': { badgeClass: 'priority', name: 'Priorität', filterValue: 'priority' },
        'restrukturierung': { badgeClass: 'restructure', name: 'Restrukturierung', filterValue: 'restructure' },
        'abwicklung': { badgeClass: 'writeoff', name: 'Abwicklung', filterValue: 'writeoff' },
        'ehemalige': { badgeClass: 'ehemalige', name: 'Ehemalige Fälle', filterValue: 'ehemalige' }
    };

    const config = segmentConfig[segment];
    if (!config) return;

    // Toggle: if same segment clicked, deselect
    if (currentSelectedSegment === segment) {
        clearSegmentFilter();
        currentSelectedSegment = null;
        showNotification('Filter aufgehoben', 'info');
        return;
    }

    // Remove selected from all quadrants
    document.querySelectorAll('.matrix-quadrant').forEach(q => {
        q.classList.remove('selected');
    });

    // Add selected to clicked quadrant
    const clickedQuadrant = document.querySelector(`.segment-${segment}`);
    if (clickedQuadrant) {
        clickedQuadrant.classList.add('selected');
    }

    currentSelectedSegment = segment;

    // Apply segment filter to customer list
    filterBySegment(segment);

    // Update segment dropdown to match
    const segmentSelect = document.querySelector('.filter-select[onchange*="segment"]');
    if (segmentSelect) {
        segmentSelect.value = config.filterValue;
    }

    // Scroll to customer list section
    const customerList = document.querySelector('.customer-list-section');
    if (customerList) {
        customerList.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showNotification(`Gefiltert nach Segment: ${config.name}`, 'info');
}

// Parse amount string to number (e.g., "€125.000" -> 125000)
function parseAmount(amountStr) {
    if (!amountStr) return 0;
    // Remove currency symbol and thousands separators, handle decimal
    const cleaned = amountStr.replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}

// Show filter indicator above the table
function showFilterIndicator(segmentName, color, count, segmentKey) {
    // Remove existing indicator
    const existingIndicator = document.querySelector('.segment-filter-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }

    // Create new indicator
    const indicator = document.createElement('div');
    indicator.className = 'segment-filter-indicator';
    indicator.innerHTML = `
        <div class="filter-indicator-content">
            <span class="filter-indicator-badge" style="background: ${color};">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                ${segmentName}
            </span>
            <span class="filter-indicator-count">${count} Fälle · Sortiert nach Volumen (höchstes zuerst)</span>
        </div>
        <button class="filter-indicator-clear" onclick="clearSegmentFilter()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Filter aufheben
        </button>
    `;

    // Insert before table wrapper
    const tableWrapper = document.querySelector('.banken-page .customer-table-wrapper');
    if (tableWrapper) {
        tableWrapper.parentNode.insertBefore(indicator, tableWrapper);
    }
}

// Clear segment filter
function clearSegmentFilter() {
    // Reset selected segment tracker
    currentSelectedSegment = null;

    // Remove indicator
    const indicator = document.querySelector('.segment-filter-indicator');
    if (indicator) {
        indicator.remove();
    }

    // Remove quadrant selection
    document.querySelectorAll('.matrix-quadrant').forEach(q => {
        q.classList.remove('selected');
    });

    // Show all rows
    const table = document.querySelector('.banken-page .customer-table');
    if (table) {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.style.display = '';
        });
    }

    // Reset pagination text
    const paginationText = document.querySelector('.table-pagination span');
    if (paginationText) {
        paginationText.textContent = 'Zeige 1-4 von 10.234 Kunden';
    }

    showNotification('Filter aufgehoben', 'info');
}

// Show chart popup for KPI mini charts
function showChartPopup(chartId, title) {
    // Chart data for different KPIs - with dual Y-axes support
    const chartData = {
        'aktive-faelle': {
            color: '#3b82f6',
            data: [9800, 9950, 10050, 10100, 10180, 10234],
            labels: ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            suffix: '',
            axisLabel: 'Anzahl Fälle',
            // Secondary axis data (amount in millions)
            secondaryColor: '#f97316',
            secondaryData: [42.5, 44.1, 45.2, 46.0, 46.8, 47.8],
            secondarySuffix: ' Mio €',
            secondaryLabel: 'Forderung'
        },
        'offene-forderung': {
            color: '#f97316',
            data: [42.5, 44.1, 45.2, 46.0, 46.8, 47.8],
            labels: ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            suffix: ' Mio €',
            axisLabel: 'Forderung',
            // Secondary: Recovery amount
            secondaryColor: '#22c55e',
            secondaryData: [26.4, 28.0, 29.3, 30.5, 31.4, 32.7],
            secondarySuffix: ' Mio €',
            secondaryLabel: 'Eingezogen'
        },
        'recovery-rate': {
            color: '#22c55e',
            data: [62.1, 63.5, 64.8, 66.2, 67.1, 68.4],
            labels: ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            suffix: '%',
            axisLabel: 'Recovery Rate',
            // Secondary: Absolute recovery in Mio
            secondaryColor: '#3b82f6',
            secondaryData: [26.4, 28.0, 29.3, 30.5, 31.4, 32.7],
            secondarySuffix: ' Mio €',
            secondaryLabel: 'Absolut'
        },
        'dpd': {
            color: '#8b5cf6',
            data: [52, 51, 50, 49, 48, 47],
            labels: ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            suffix: ' Tage',
            axisLabel: 'Ø DPD',
            // Secondary: Number of >90 DPD cases
            secondaryColor: '#ef4444',
            secondaryData: [2500, 2450, 2400, 2380, 2360, 2344],
            secondarySuffix: '',
            secondaryLabel: '>90 DPD Fälle'
        },
        'aufgaben': {
            color: '#ef4444',
            data: [180, 165, 172, 158, 162, 156],
            labels: ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            suffix: '',
            axisLabel: 'Offene Aufgaben',
            // Secondary: Completed tasks
            secondaryColor: '#22c55e',
            secondaryData: [145, 168, 152, 175, 160, 178],
            secondarySuffix: '',
            secondaryLabel: 'Erledigt'
        }
    };

    const config = chartData[chartId] || chartData['aktive-faelle'];

    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.className = 'chart-popup-overlay';
    overlay.onclick = (e) => {
        if (e.target === overlay) closeChartPopup();
    };

    // Create popup content
    const popup = document.createElement('div');
    popup.className = 'chart-popup';
    popup.innerHTML = `
        <div class="chart-popup-header">
            <h3>${title}</h3>
            <button class="chart-popup-close" onclick="closeChartPopup()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <div class="chart-popup-content" id="popup-chart-${chartId}"></div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Render chart using simple SVG
    renderPopupChart(chartId, config);
}

// Render chart in popup with dual Y-axes support
function renderPopupChart(chartId, config) {
    const container = document.getElementById(`popup-chart-${chartId}`);
    if (!container) return;

    const width = 720;
    const height = 340;
    const padding = { top: 30, right: 90, bottom: 50, left: 90 };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Primary data
    const data = config.data;
    const labels = config.labels;
    const maxVal = Math.max(...data) * 1.1;
    const minVal = Math.min(...data) * 0.9;
    const range = maxVal - minVal;

    // Secondary data (for dual Y-axis)
    const hasSecondary = config.secondaryData && config.secondaryData.length > 0;
    let secondaryMaxVal, secondaryMinVal, secondaryRange;
    if (hasSecondary) {
        secondaryMaxVal = Math.max(...config.secondaryData) * 1.1;
        secondaryMinVal = Math.min(...config.secondaryData) * 0.9;
        secondaryRange = secondaryMaxVal - secondaryMinVal;
    }

    // Create primary points
    const points = data.map((val, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - ((val - minVal) / range) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    // Create secondary points
    let secondaryPoints = '';
    if (hasSecondary) {
        secondaryPoints = config.secondaryData.map((val, i) => {
            const x = padding.left + (i / (config.secondaryData.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - ((val - secondaryMinVal) / secondaryRange) * chartHeight;
            return `${x},${y}`;
        }).join(' ');
    }

    // Create area path for primary
    const areaPath = `M ${padding.left},${height - padding.bottom} ` +
        data.map((val, i) => {
            const x = padding.left + (i / (data.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - ((val - minVal) / range) * chartHeight;
            return `L ${x},${y}`;
        }).join(' ') +
        ` L ${width - padding.right},${height - padding.bottom} Z`;

    // Generate primary Y-axis labels (left)
    const yLabels = [];
    for (let i = 0; i <= 4; i++) {
        const val = minVal + (range * i / 4);
        const y = padding.top + chartHeight - (i / 4) * chartHeight;
        const formattedVal = config.suffix === '%' ? val.toFixed(1) : Math.round(val).toLocaleString('de-DE');
        yLabels.push({ val: formattedVal + (config.suffix || ''), y });
    }

    // Generate secondary Y-axis labels (right)
    const yLabelsRight = [];
    if (hasSecondary) {
        for (let i = 0; i <= 4; i++) {
            const val = secondaryMinVal + (secondaryRange * i / 4);
            const y = padding.top + chartHeight - (i / 4) * chartHeight;
            const formattedVal = config.secondarySuffix === '%' ? val.toFixed(1) :
                (config.secondarySuffix.includes('Mio') ? val.toFixed(1) : Math.round(val).toLocaleString('de-DE'));
            yLabelsRight.push({ val: formattedVal + (config.secondarySuffix || ''), y });
        }
    }

    container.innerHTML = `
        <svg width="${width}" height="${height}" style="display: block; margin: 0 auto;">
            <!-- Grid lines -->
            ${yLabels.map(l => `<line x1="${padding.left}" y1="${l.y}" x2="${width - padding.right}" y2="${l.y}" stroke="#e2e8f0" stroke-dasharray="4,4"/>`).join('')}

            <!-- Area fill for primary -->
            <path d="${areaPath}" fill="${config.color}" fill-opacity="0.1"/>

            <!-- Primary Line -->
            <polyline fill="none" stroke="${config.color}" stroke-width="3" points="${points}" stroke-linecap="round" stroke-linejoin="round"/>

            ${hasSecondary ? `
            <!-- Secondary Line (dashed) -->
            <polyline fill="none" stroke="${config.secondaryColor}" stroke-width="2" stroke-dasharray="6,4" points="${secondaryPoints}" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- Secondary Data points -->
            ${config.secondaryData.map((val, i) => {
                const x = padding.left + (i / (config.secondaryData.length - 1)) * chartWidth;
                const y = padding.top + chartHeight - ((val - secondaryMinVal) / secondaryRange) * chartHeight;
                return `<circle cx="${x}" cy="${y}" r="4" fill="${config.secondaryColor}" stroke="white" stroke-width="2"/>`;
            }).join('')}
            ` : ''}

            <!-- Primary Data points -->
            ${data.map((val, i) => {
                const x = padding.left + (i / (data.length - 1)) * chartWidth;
                const y = padding.top + chartHeight - ((val - minVal) / range) * chartHeight;
                return `<circle cx="${x}" cy="${y}" r="6" fill="white" stroke="${config.color}" stroke-width="3"/>`;
            }).join('')}

            <!-- X-axis labels -->
            ${labels.map((label, i) => {
                const x = padding.left + (i / (data.length - 1)) * chartWidth;
                return `<text x="${x}" y="${height - 25}" text-anchor="middle" font-size="12" fill="#64748b">${label}</text>`;
            }).join('')}

            <!-- Left Y-axis labels -->
            ${yLabels.map(l => `<text x="${padding.left - 12}" y="${l.y + 4}" text-anchor="end" font-size="11" fill="${config.color}">${l.val}</text>`).join('')}

            <!-- Left Y-axis title -->
            <text x="20" y="${padding.top + chartHeight / 2}" text-anchor="middle" font-size="11" fill="${config.color}" transform="rotate(-90, 20, ${padding.top + chartHeight / 2})">${config.axisLabel || ''}</text>

            ${hasSecondary ? `
            <!-- Right Y-axis labels -->
            ${yLabelsRight.map(l => `<text x="${width - padding.right + 12}" y="${l.y + 4}" text-anchor="start" font-size="11" fill="${config.secondaryColor}">${l.val}</text>`).join('')}

            <!-- Right Y-axis title -->
            <text x="${width - 20}" y="${padding.top + chartHeight / 2}" text-anchor="middle" font-size="11" fill="${config.secondaryColor}" transform="rotate(90, ${width - 20}, ${padding.top + chartHeight / 2})">${config.secondaryLabel || ''}</text>
            ` : ''}
        </svg>

        <!-- Legend -->
        <div style="display: flex; justify-content: center; gap: 24px; margin-top: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="${config.color}" stroke-width="3"/></svg>
                <span style="font-size: 12px; color: #64748b;">${config.axisLabel || 'Primär'}</span>
            </div>
            ${hasSecondary ? `
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="${config.secondaryColor}" stroke-width="2" stroke-dasharray="6,4"/></svg>
                <span style="font-size: 12px; color: #64748b;">${config.secondaryLabel || 'Sekundär'}</span>
            </div>
            ` : ''}
        </div>
    `;
}

// Close chart popup
function closeChartPopup() {
    const overlay = document.querySelector('.chart-popup-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Filter by DPD bucket
function filterByDPDBucket(bucket) {
    const bucketConfig = {
        '0-30': { label: '0-30 Tage', minDpd: 0, maxDpd: 30 },
        '31-90': { label: '31-90 Tage', minDpd: 31, maxDpd: 90 },
        '90+': { label: '> 90 Tage', minDpd: 91, maxDpd: 999 }
    };

    const config = bucketConfig[bucket];
    if (!config) return;

    showNotification(`Filter: DPD ${config.label}`, 'info');
    console.log('Filtering by DPD bucket:', bucket);

    // Filter table rows by DPD value
    const table = document.querySelector('.banken-page .customer-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    let matchCount = 0;

    rows.forEach(row => {
        const dpdBadge = row.querySelector('.dpd-badge');
        if (dpdBadge) {
            const dpd = parseInt(dpdBadge.textContent) || 0;
            if (dpd >= config.minDpd && dpd <= config.maxDpd) {
                row.style.display = '';
                matchCount++;
            } else {
                row.style.display = 'none';
            }
        }
    });

    // Update pagination
    const paginationText = document.querySelector('.table-pagination span');
    if (paginationText) {
        paginationText.textContent = `Zeige ${matchCount} Fälle mit DPD ${config.label}`;
    }
}

// Toggle all NPL checkboxes
function toggleAllNpl(checkbox) {
    const isChecked = checkbox.checked;
    document.querySelectorAll('.npl-checkbox').forEach(cb => {
        cb.checked = isChecked;
    });
    updateBulkActionState();
}

// Update bulk action buttons state
function updateBulkActionState() {
    const checkedBoxes = document.querySelectorAll('.npl-checkbox:checked');
    const bulkButtons = document.querySelectorAll('.btn-bulk');

    bulkButtons.forEach(btn => {
        btn.disabled = checkedBoxes.length === 0;
        btn.style.opacity = checkedBoxes.length === 0 ? '0.5' : '1';
    });
}

// Bulk action handler
function bulkAction(action) {
    const checkedBoxes = document.querySelectorAll('.npl-checkbox:checked');
    const count = checkedBoxes.length;

    if (count === 0) {
        showNotification('Bitte wählen Sie mindestens einen Fall aus', 'warning');
        return;
    }

    const actions = {
        'assign': `${count} Fälle werden zugewiesen...`,
        'escalate': `${count} Fälle werden eskaliert...`,
        'writeoff': `${count} Fälle zur Abschreibung markiert`
    };

    showNotification(actions[action] || `Aktion "${action}" für ${count} Fälle`, 'success');
    console.log('Bulk action:', action, 'for', count, 'cases');
}

// Open case detail
function openCase(caseId) {
    showNotification(`Fall ${caseId} wird geöffnet...`, 'info');
    console.log('Opening case:', caseId);
    // Here would normally open a modal or navigate to case detail
}

// Call customer
function callCustomer(customerId) {
    showNotification(`Anruf wird gestartet für Kunde ${customerId}...`, 'success');
    console.log('Calling customer:', customerId);
}

// Send reminder
function sendReminder(customerId) {
    showNotification(`Mahnung wird versendet an Kunde ${customerId}...`, 'info');
    console.log('Sending reminder to:', customerId);
}

// Schedule callback
function scheduleCallback(customerId) {
    showNotification(`Rückruf geplant für Kunde ${customerId}`, 'success');
    console.log('Scheduling callback for:', customerId);
}

// Complete task - opens dialog for problem/solution documentation
function completeTask(taskId) {
    // Find the task element to get task info
    const taskElement = document.querySelector(`.aufgabe-item [onclick*="completeTask('${taskId}')"]`)?.closest('.aufgabe-item');

    let taskTitle = 'Aufgabe erledigt';
    let customerId = null;

    if (taskElement) {
        // Get task title
        const titleEl = taskElement.querySelector('.aufgabe-title');
        if (titleEl) taskTitle = titleEl.textContent.trim();

        // Get customer ID from the task
        const customerEl = taskElement.querySelector('.aufgabe-customer');
        if (customerEl) customerId = customerEl.textContent.trim();
    }

    // Open completion dialog
    openTaskCompletionDialog(taskId, taskTitle, customerId, taskElement);
}

// Open task completion dialog
function openTaskCompletionDialog(taskId, taskTitle, customerId, taskElement) {
    let modal = document.getElementById('taskCompletionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'taskCompletionModal';
        modal.className = 'task-completion-modal';
        modal.innerHTML = `
            <div class="task-completion-content">
                <div class="task-completion-header">
                    <h3>Aufgabe abschließen</h3>
                    <button class="task-completion-close" onclick="closeTaskCompletionDialog()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="task-completion-body">
                    <div class="task-info-display">
                        <span class="task-info-label">Aufgabe:</span>
                        <span class="task-info-value" id="completionTaskTitle"></span>
                    </div>
                    <div class="task-form-group">
                        <label>Was war das Problem?</label>
                        <textarea id="taskProblem" placeholder="Beschreiben Sie das ursprüngliche Problem..."></textarea>
                    </div>
                    <div class="task-form-group">
                        <label>Wie wurde es gelöst?</label>
                        <textarea id="taskSolution" placeholder="Beschreiben Sie die durchgeführte Lösung..."></textarea>
                    </div>
                </div>
                <div class="task-completion-footer">
                    <button class="task-cancel-btn" onclick="closeTaskCompletionDialog()">Abbrechen</button>
                    <button class="task-complete-btn" onclick="submitTaskCompletion()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Als erledigt markieren
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        addTaskCompletionStyles();
    }

    // Store task info for submission
    modal.dataset.taskId = taskId;
    modal.dataset.taskTitle = taskTitle;
    modal.dataset.customerId = customerId || '';

    // Update display
    document.getElementById('completionTaskTitle').textContent = taskTitle;
    document.getElementById('taskProblem').value = '';
    document.getElementById('taskSolution').value = '';

    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('taskProblem').focus(), 100);
}

// Close task completion dialog
function closeTaskCompletionDialog() {
    const modal = document.getElementById('taskCompletionModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Submit task completion
function submitTaskCompletion() {
    const modal = document.getElementById('taskCompletionModal');
    const taskId = modal.dataset.taskId;
    const taskTitle = modal.dataset.taskTitle;
    const customerId = modal.dataset.customerId;
    const problem = document.getElementById('taskProblem').value.trim();
    const solution = document.getElementById('taskSolution').value.trim();

    if (!problem || !solution) {
        showNotification('Bitte füllen Sie beide Felder aus', 'error');
        return;
    }

    // Find and mark task element as completed
    const taskElement = document.querySelector(`.aufgabe-item [onclick*="completeTask('${taskId}')"]`)?.closest('.aufgabe-item');
    if (taskElement) {
        taskElement.classList.add('completed');
        taskElement.style.opacity = '0.5';
        taskElement.style.textDecoration = 'line-through';
    }

    // If we have a customer, add detailed activity
    if (customerId) {
        currentCustomerId = customerId;

        // Create detailed completion activity
        const activity = {
            id: Date.now().toString(),
            type: 'aufgabe',
            typeLabel: 'Aufgabe erledigt',
            text: `**${taskTitle}**\n\n**Problem:** ${problem}\n\n**Lösung:** ${solution}\n\n✅ Status: Erledigt`,
            author: localStorage.getItem('feedbackAuthor') || 'Eike',
            timestamp: new Date().toISOString(),
            isCompleted: true
        };

        saveCustomerActivity(customerId, activity);

        closeTaskCompletionDialog();
        showNotification(`Aufgabe "${taskTitle}" erledigt`, 'success');

        // Open customer profile
        setTimeout(() => {
            openCustomerDetail(customerId, { showKommunikation: true });
        }, 500);
    } else {
        closeTaskCompletionDialog();
        showNotification(`Aufgabe ${taskId} abgeschlossen`, 'success');
    }

    console.log('Completing task:', taskId, 'Customer:', customerId);
}

// Add styles for task completion modal
function addTaskCompletionStyles() {
    if (document.getElementById('task-completion-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'task-completion-styles';
    styles.textContent = `
        .task-completion-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            align-items: center;
            justify-content: center;
        }
        .task-completion-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 550px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .task-completion-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #e2e8f0;
        }
        .task-completion-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
        }
        .task-completion-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #64748b;
        }
        .task-completion-close:hover { color: #1e293b; }
        .task-completion-body {
            padding: 20px;
        }
        .task-info-display {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 20px;
        }
        .task-info-label {
            font-size: 12px;
            color: #0369a1;
            display: block;
            margin-bottom: 4px;
        }
        .task-info-value {
            font-size: 14px;
            font-weight: 600;
            color: #0c4a6e;
        }
        .task-form-group {
            margin-bottom: 16px;
        }
        .task-form-group label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
        }
        .task-form-group textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            min-height: 80px;
            resize: vertical;
        }
        .task-form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .task-completion-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 20px;
            border-top: 1px solid #e2e8f0;
        }
        .task-cancel-btn {
            padding: 10px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: white;
            color: #374151;
            font-size: 14px;
            cursor: pointer;
        }
        .task-complete-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            background: #10b981;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
        }
        .task-complete-btn:hover { background: #059669; }

        /* Completed activity styling */
        .komm-item.aufgabe.custom-activity {
            background: #f0fdf4;
            border-left: 3px solid #10b981;
        }
        .komm-item.aufgabe .komm-icon { color: #10b981; }
        .komm-item.custom-activity .komm-body p {
            white-space: pre-line;
        }
    `;
    document.head.appendChild(styles);
}

// Export task completion functions
window.openTaskCompletionDialog = openTaskCompletionDialog;
window.closeTaskCompletionDialog = closeTaskCompletionDialog;
window.submitTaskCompletion = submitTaskCompletion;

// Export report
function exportReport(reportType) {
    showNotification(`${reportType} Report wird erstellt...`, 'info');
    console.log('Exporting report:', reportType);
}

// ========================================
// NEW: Section Navigation Functions
