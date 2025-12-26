/**
 * Banken Document Scanner Module
 * ES6 Module for document scanning and OCR
 */

// ========================================
// STATE
// ========================================

let uploadedFile = null;
let uploadedFileData = null;

// ========================================
// MODAL CONTROLS
// ========================================

export function openDocumentScanner() {
    document.getElementById('documentScannerModal')?.classList.add('active');
    resetScanner();
}

export function closeDocumentScanner() {
    document.getElementById('documentScannerModal')?.classList.remove('active');
    resetScanner();
}

function resetScanner() {
    uploadedFile = null;
    uploadedFileData = null;

    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    document.getElementById('scanner-step-1')?.classList.add('active');

    const uploadPreview = document.getElementById('uploadPreview');
    const dropZone = document.getElementById('dropZone');
    if (uploadPreview) uploadPreview.style.display = 'none';
    if (dropZone) dropZone.style.display = 'block';
}

// ========================================
// DRAG & DROP
// ========================================

export function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('dropZone')?.classList.add('dragover');
}

export function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('dropZone')?.classList.remove('dragover');
}

export function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('dropZone')?.classList.remove('dragover');

    const files = event.dataTransfer.files;
    if (files.length > 0) processFile(files[0]);
}

export function handleFileSelect(event) {
    const file = event.target.files?.[0];
    if (file) processFile(file);
}

// ========================================
// FILE PROCESSING
// ========================================

function processFile(file) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
        window.showNotification?.('Ungültiges Dateiformat. Bitte PDF, JPG, PNG oder TIFF verwenden.', 'error');
        return;
    }

    uploadedFile = file;

    const dropZone = document.getElementById('dropZone');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImage = document.getElementById('previewImage');
    const fileName = document.getElementById('fileName');

    if (dropZone) dropZone.style.display = 'none';
    if (uploadPreview) uploadPreview.style.display = 'block';
    if (fileName) fileName.textContent = file.name;

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedFileData = e.target.result;
            if (previewImage) previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        // PDF placeholder
        if (previewImage) previewImage.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjUwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2Y4ZmFmYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjQwIiBmaWxsPSIjZGMyNjI2Ij5QREY8L3RleHQ+PC9zdmc+';
        uploadedFileData = 'pdf-placeholder';
    }
}

export function removeUpload() {
    uploadedFile = null;
    uploadedFileData = null;

    const dropZone = document.getElementById('dropZone');
    const uploadPreview = document.getElementById('uploadPreview');
    if (dropZone) dropZone.style.display = 'block';
    if (uploadPreview) uploadPreview.style.display = 'none';
}

export function openCamera() {
    window.showNotification?.('Kamera-Funktion wird in einer zukünftigen Version verfügbar sein.', 'info');
}

// ========================================
// AI RECOGNITION
// ========================================

export function startAIRecognition() {
    if (!uploadedFile) {
        window.showNotification?.('Bitte laden Sie zuerst ein Dokument hoch.', 'error');
        return;
    }

    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    document.getElementById('scanner-step-2')?.classList.add('active');

    const recognitionImage = document.getElementById('recognitionImage');
    if (recognitionImage && uploadedFileData) {
        recognitionImage.src = uploadedFileData !== 'pdf-placeholder'
            ? uploadedFileData
            : document.getElementById('previewImage')?.src ?? '';
    }

    // Simulate AI recognition
    setTimeout(() => {
        const recognitionStatus = document.getElementById('recognitionStatus');
        const recognizedFields = document.getElementById('recognizedFields');

        if (recognitionStatus) recognitionStatus.style.display = 'none';
        if (recognizedFields) recognizedFields.style.display = 'block';

        // Fill sample recognized data
        const fields = {
            'rec-name': 'Schmidt Elektronik GmbH',
            'rec-address': 'Industriestr. 45, 38112 Braunschweig',
            'rec-iban': 'DE89 3704 0044 0532 0130 00',
            'rec-amount': '€ 8.450,00',
            'rec-due-date': '2025-10-15'
        };

        Object.entries(fields).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.value = value;
        });

        window.showNotification?.('Dokumentenanalyse abgeschlossen', 'success');
    }, 2000);
}

// ========================================
// STEP NAVIGATION
// ========================================

export function goToStep2() {
    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    document.getElementById('scanner-step-2')?.classList.add('active');
}

export function goToStep3() {
    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    document.getElementById('scanner-step-3')?.classList.add('active');

    // Pre-fill form with recognized data
    const getValue = (id) => document.getElementById(id)?.value ?? '';

    const customerName = document.getElementById('customer-name');
    const customerStreet = document.getElementById('customer-street');
    const customerIban = document.getElementById('customer-iban');
    const claimAmount = document.getElementById('claim-amount');
    const claimDueDate = document.getElementById('claim-due-date');

    if (customerName) customerName.value = getValue('rec-name');
    if (customerStreet) customerStreet.value = getValue('rec-address').split(',')[0] ?? '';
    if (customerIban) customerIban.value = getValue('rec-iban');
    if (claimAmount) claimAmount.value = parseFloat(getValue('rec-amount').replace(/[€\s.]/g, '').replace(',', '.')) || 0;
    if (claimDueDate) claimDueDate.value = getValue('rec-due-date');

    const attachedDocPreview = document.getElementById('attachedDocPreview');
    const attachedDocName = document.getElementById('attachedDocName');
    if (attachedDocPreview) attachedDocPreview.src = document.getElementById('recognitionImage')?.src ?? '';
    if (attachedDocName) attachedDocName.textContent = uploadedFile?.name ?? 'Dokument';
}

export function createCustomerFromScan() {
    window.showNotification?.('Kunde wurde erfolgreich angelegt!', 'success');
    closeDocumentScanner();

    setTimeout(() => {
        window.showNotification?.('Neuer Fall wurde zur Segmentierung hinzugefügt.', 'info');
    }, 1000);
}

export function showBulkImport() {
    window.showNotification?.('Bulk-Import wird vorbereitet...', 'info');
}
