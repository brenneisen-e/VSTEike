/**
 * Screenshot Annotation System Module
 * ES6 Module for capturing and annotating screenshots
 */

// ========================================
// STATE
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

// ========================================
// SCREENSHOT CAPTURE
// ========================================

export async function captureScreenshot() {
    const btn = document.getElementById('screenshotBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="spin"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> Wird aufgenommen...';
    btn.disabled = true;

    try {
        const feedbackPanel = document.getElementById('feedbackPanel');
        feedbackPanel.style.visibility = 'hidden';

        const canvas = await html2canvas(document.body, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            x: window.scrollX,
            y: window.scrollY,
            width: window.innerWidth,
            height: window.innerHeight,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            ignoreElements: (element) => {
                return element.id === 'feedbackPanel' ||
                       element.id === 'bankenChatWidget' ||
                       element.classList?.contains('banken-chat-toggle');
            }
        });

        feedbackPanel.style.visibility = 'visible';

        screenshotImage = new Image();
        screenshotImage.onload = () => openScreenshotModal();
        screenshotImage.src = canvas.toDataURL('image/png');

    } catch (error) {
        console.error('Screenshot Fehler:', error);
        window.showFeedbackNotification?.('Screenshot konnte nicht erstellt werden');
    }

    btn.innerHTML = originalText;
    btn.disabled = false;
}

// ========================================
// MODAL CONTROLS
// ========================================

export function openScreenshotModal() {
    const modal = document.getElementById('screenshotModal');
    const canvas = document.getElementById('screenshotCanvas');

    modal.classList.add('open');

    screenshotCanvas = canvas;
    screenshotCtx = canvas.getContext('2d');

    canvas.width = screenshotImage.width;
    canvas.height = screenshotImage.height;

    screenshotCtx.drawImage(screenshotImage, 0, 0);

    drawHistory = [];
    saveDrawState();

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

export function closeScreenshotModal() {
    const modal = document.getElementById('screenshotModal');
    modal.classList.remove('open');

    const canvas = document.getElementById('screenshotCanvas');
    canvas.removeEventListener('mousedown', startDrawing);
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mouseup', stopDrawing);
    canvas.removeEventListener('mouseout', stopDrawing);
    canvas.removeEventListener('touchstart', handleTouch);
    canvas.removeEventListener('touchmove', handleTouch);
    canvas.removeEventListener('touchend', stopDrawing);
}

// ========================================
// DRAWING FUNCTIONS
// ========================================

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

function startDrawing(e) {
    isDrawing = true;
    const rect = screenshotCanvas.getBoundingClientRect();
    const scaleX = screenshotCanvas.width / rect.width;
    const scaleY = screenshotCanvas.height / rect.height;

    const clientX = e.offsetX ?? (e.clientX - rect.left);
    const clientY = e.offsetY ?? (e.clientY - rect.top);
    startX = clientX * scaleX;
    startY = clientY * scaleY;

    if (currentTool === 'pen') {
        screenshotCtx.beginPath();
        screenshotCtx.moveTo(startX, startY);
    }
}

function draw(e) {
    if (!isDrawing) return;

    const rect = screenshotCanvas.getBoundingClientRect();
    const scaleX = screenshotCanvas.width / rect.width;
    const scaleY = screenshotCanvas.height / rect.height;

    const clientX = e.offsetX ?? (e.clientX - rect.left);
    const clientY = e.offsetY ?? (e.clientY - rect.top);
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
        restoreLastState();
        drawShape(startX, startY, x, y);
    }
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveDrawState();
    }
}

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
        screenshotCtx.beginPath();
        screenshotCtx.moveTo(x1, y1);
        screenshotCtx.lineTo(x2, y2);
        screenshotCtx.stroke();

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

// ========================================
// STATE MANAGEMENT
// ========================================

function saveDrawState() {
    drawHistory.push(screenshotCanvas.toDataURL());
}

function restoreLastState() {
    if (drawHistory.length > 0) {
        const img = new Image();
        img.src = drawHistory.at(-1);
        screenshotCtx.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
        screenshotCtx.drawImage(img, 0, 0);
    }
}

export function undoDrawing() {
    if (drawHistory.length > 1) {
        drawHistory.pop();
        const img = new Image();
        img.onload = () => {
            screenshotCtx.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
            screenshotCtx.drawImage(img, 0, 0);
        };
        img.src = drawHistory.at(-1);
    }
}

export function clearDrawing() {
    screenshotCtx.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
    screenshotCtx.drawImage(screenshotImage, 0, 0);
    drawHistory = [];
    saveDrawState();
}

// ========================================
// TOOL CONTROLS
// ========================================

export function setDrawTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.screenshot-tool').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === tool);
    });

    if (tool === 'text') {
        window.showFeedbackNotification?.('Klicke auf die Stelle, wo der Text erscheinen soll');
        screenshotCanvas.onclick = (e) => {
            if (currentTool !== 'text') return;

            const text = prompt('Text eingeben:');
            if (!text) return;

            const rect = screenshotCanvas.getBoundingClientRect();
            const scaleX = screenshotCanvas.width / rect.width;
            const scaleY = screenshotCanvas.height / rect.height;
            const clientX = e.offsetX ?? (e.clientX - rect.left);
            const clientY = e.offsetY ?? (e.clientY - rect.top);

            screenshotCtx.font = 'bold 24px Arial';
            screenshotCtx.fillStyle = currentColor;
            screenshotCtx.fillText(text, clientX * scaleX, clientY * scaleY);
            saveDrawState();
        };
    } else {
        screenshotCanvas.onclick = null;
    }
}

export function setDrawColor(color) {
    currentColor = color;
    document.querySelectorAll('.screenshot-color').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === color);
    });
}

// ========================================
// SAVE & EDIT
// ========================================

export function saveAnnotatedScreenshot() {
    currentScreenshotData = screenshotCanvas.toDataURL('image/jpeg', 0.92);

    const preview = document.getElementById('screenshotPreview');
    const thumbnail = document.getElementById('screenshotThumbnail');

    thumbnail.src = currentScreenshotData;
    preview.style.display = 'flex';

    closeScreenshotModal();
    window.showFeedbackNotification?.('Screenshot hinzugefügt!');
}

export function editScreenshot() {
    if (!currentScreenshotData) return;

    screenshotImage = new Image();
    screenshotImage.onload = () => openScreenshotModal();
    screenshotImage.src = currentScreenshotData;
}

export function removeScreenshot() {
    currentScreenshotData = null;
    document.getElementById('screenshotPreview').style.display = 'none';
}

// ========================================
// GETTERS/SETTERS
// ========================================

export const getCurrentScreenshotData = () => currentScreenshotData;
export const setCurrentScreenshotData = (data) => { currentScreenshotData = data; };
