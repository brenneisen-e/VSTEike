/**
 * Versicherung Upload Module
 * ES6 Module for CSV upload and data processing (ES2024)
 */

// ========================================
// QUICK UPLOAD
// ========================================

export function setupQuickUpload() {
    const uploadInput = document.getElementById('quickCsvUpload');
    const uploadBox = uploadInput?.parentElement;
    const statusDiv = document.getElementById('quickUploadStatus');

    if (!uploadInput || !uploadBox) return;

    uploadInput.addEventListener('change', (e) => {
        handleQuickUpload(e.target.files?.[0]);
    });

    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#667eea';
        uploadBox.style.background = '#f1f5f9';
    });

    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#cbd5e1';
        uploadBox.style.background = '#f8fafc';
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#cbd5e1';
        uploadBox.style.background = '#f8fafc';

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.endsWith('.csv')) {
            handleQuickUpload(files[0]);
        } else if (statusDiv) {
            statusDiv.className = 'upload-status error';
            statusDiv.textContent = '❌ Bitte nur CSV-Dateien hochladen';
        }
    });
}

export function handleQuickUpload(file) {
    const statusDiv = document.getElementById('quickUploadStatus');
    if (!file) return;

    if (statusDiv) {
        statusDiv.className = 'upload-status';
        statusDiv.textContent = '⏳ Lade Datei...';
    }

    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const csvText = event.target.result;
            const parsedData = window.parseCSV?.(csvText) ?? [];

            const firstRow = parsedData[0] ?? {};
            const hasDay = 'day' in firstRow;
            const hasMonth = 'month' in firstRow;
            const hasYear = 'year' in firstRow;
            const hasVermittler = 'vermittler_id' in firstRow;
            const hasLandkreis = 'landkreis' in firstRow || 'kreis' in firstRow;

            if (hasDay && hasVermittler) {
                window.dailyRawData = parsedData;
                const monthlyData = window.aggregateDailyToMonthly?.(parsedData) ?? parsedData;
                window.state.uploadedData = monthlyData;

                const landkreisInfo = hasLandkreis ? ' mit Landkreisen' : '';
                if (statusDiv) {
                    statusDiv.className = 'upload-status success';
                    statusDiv.textContent = `✅ ${file.name} geladen (${parsedData.length} Tagesdaten → ${monthlyData.length} Monate${landkreisInfo})`;
                }
            } else if (hasMonth && !hasDay) {
                window.state.uploadedData = parsedData;
                window.dailyRawData = null;

                if (statusDiv) {
                    statusDiv.className = 'upload-status success';
                    statusDiv.textContent = `✅ ${file.name} geladen (${parsedData.length} Monatsdaten)`;
                }
            } else {
                window.state.uploadedData = parsedData;
                window.dailyRawData = null;

                if (statusDiv) {
                    statusDiv.className = 'upload-status success';
                    statusDiv.textContent = `⚠️ ${file.name} geladen (${parsedData.length} Zeilen)`;
                }
            }

            window.state.useUploadedData = true;

            if (hasYear && parsedData.length > 0) {
                const years = [...new Set(parsedData.map(row => row.year))].sort();
                window.state.availableYears = years;

                if (!years.includes(parseInt(window.state.filters.year))) {
                    window.state.filters.year = String(years[0]);
                }
            }

            console.log('✅ Daten erfolgreich geladen:', parsedData.length, 'Zeilen');

        } catch (error) {
            console.error('Fehler beim Parsen:', error);
            if (statusDiv) {
                statusDiv.className = 'upload-status error';
                statusDiv.textContent = `❌ Fehler beim Laden: ${error.message}`;
            }
        }
    };

    reader.onerror = () => {
        if (statusDiv) {
            statusDiv.className = 'upload-status error';
            statusDiv.textContent = '❌ Fehler beim Lesen der Datei';
        }
    };

    reader.readAsText(file);
}

// ========================================
// DIALOGS
// ========================================

export function openUploadDialog() {
    window.showNotification?.('Upload-Dialog öffnen', 'info');
}

export function openGenerator() {
    window.location.href = 'csv-generator.html';
}

// ========================================
// UPLOAD MODE
// ========================================

let uploadModeActive = false;

export function toggleUploadMode() {
    uploadModeActive = !uploadModeActive;
    document.body.classList.toggle('upload-mode', uploadModeActive);

    const uploadBtn = document.querySelector('.upload-mode-toggle');
    if (uploadBtn) {
        uploadBtn.textContent = uploadModeActive ? '✓ Upload-Modus' : '📤 Upload-Modus';
    }

    if (uploadModeActive) {
        initUploadMode();
    }
}

export function initUploadMode() {
    const editableElements = document.querySelectorAll('.upload-editable');
    editableElements.forEach(el => {
        el.contentEditable = 'true';
        el.classList.add('editable-active');
    });
}

export function triggerLogoUpload() {
    document.getElementById('logoUpload')?.click();
}

export function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const logoImg = document.querySelector('.company-logo img, .logo-placeholder');
        if (logoImg) {
            if (logoImg.tagName === 'IMG') {
                logoImg.src = e.target.result;
            } else {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Company Logo';
                logoImg.replaceWith(img);
            }
            localStorage.setItem('customLogo', e.target.result);
        }
    };
    reader.readAsDataURL(file);
}

export function loadCustomLogo() {
    const savedLogo = localStorage.getItem('customLogo');
    if (savedLogo) {
        const logoImg = document.querySelector('.company-logo img');
        if (logoImg) logoImg.src = savedLogo;
    }
}
