/**
 * Versicherung Data Module
 * ES6 Module for CSV data loading and processing (ES2024)
 */

// ========================================
// HELPER FUNCTIONS
// ========================================

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ========================================
// LOADING PROGRESS
// ========================================

export function updateMainLoadingProgress(percent, text) {
    const progressBar = document.getElementById('mainProgressBar');
    const statusText = document.getElementById('loadingStatus');
    const percentText = document.getElementById('loadingPercent');

    console.log(`Loading: ${percent}% - ${text}`);
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (statusText) statusText.textContent = text;
    if (percentText) percentText.textContent = `${percent}%`;
}

export function updateLoadingText(text) {
    const statusText = document.getElementById('loadingStatus');
    if (statusText) statusText.textContent = text;
}

// ========================================
// CSV PROCESSING
// ========================================

export function processCSVData(csvText) {
    try {
        const parsedData = window.parseCSV?.(csvText) ?? [];

        if (parsedData.length > 0) {
            window.dailyRawData = parsedData;

            if (typeof window.aggregateDailyToMonthly === 'function') {
                const monthlyData = window.aggregateDailyToMonthly(parsedData);
                window.state.uploadedData = monthlyData;
                window.state.useUploadedData = true;
            }

            console.log('CSV-Daten geladen:', parsedData.length, 'Datensätze');

            window.updateAgenturFilterDropdown?.();
            window.updateAllKPIs?.();

            if (window.countyMapHandler && typeof window.getFilteredData === 'function') {
                const data = window.getFilteredData();
                window.countyMapHandler.updateMapData(data);
            }

            const statusEl = document.getElementById('quickUploadStatus');
            if (statusEl) {
                statusEl.innerHTML = `<span style="color: #16a34a;">${parsedData.length} Datensätze geladen</span>`;
            }
        }
    } catch (error) {
        console.error('Fehler beim Parsen der CSV:', error);
    }
}

// ========================================
// AUTO-LOAD DATA
// ========================================

export async function loadDefaultCSVData() {
    console.log('Lade Standard-CSV-Daten...');

    updateMainLoadingProgress(10, 'Initialisiere Anwendung...');
    await sleep(200);

    updateMainLoadingProgress(25, 'Lade Ressourcen...');
    await sleep(300);

    const localCsvPath = 'data/mock-data.csv';

    try {
        updateMainLoadingProgress(40, 'Lade Kundendaten...');
        const response = await fetch(localCsvPath);

        if (!response.ok) throw new Error('Lokale CSV nicht gefunden');

        updateMainLoadingProgress(60, 'Verarbeite Datensätze...');
        await sleep(200);
        const csvText = await response.text();

        updateMainLoadingProgress(75, 'Analysiere Daten...');
        await sleep(200);
        processCSVData(csvText);

        updateMainLoadingProgress(80, 'Lade Feedback-Kommentare...');
        await loadFeedbackData();

        updateMainLoadingProgress(95, 'Erstelle Dashboard...');
        await sleep(300);

        updateMainLoadingProgress(100, 'Fertig!');
        await sleep(400);

        console.log('Alle Daten geladen');

    } catch (error) {
        console.warn('Fehler beim Laden der CSV-Daten:', error);
        updateMainLoadingProgress(90, 'Lade Feedback-Kommentare...');
        await loadFeedbackData();
        updateMainLoadingProgress(100, 'Bereit');
        await sleep(500);
        console.log('Daten können manuell über Settings > CSV Upload geladen werden');
    }
}

export async function loadFeedbackData() {
    const FEEDBACK_API_URL = 'https://vsteike-feedback.eike-3e2.workers.dev';
    try {
        const response = await fetch(`${FEEDBACK_API_URL}/feedback`);
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                window.preloadedFeedback = result.data;
                console.log(`${result.data.length} Feedback-Kommentare geladen`);
            }
        }
    } catch (error) {
        console.warn('Feedback konnte nicht vorgeladen werden:', error);
    }
}

// ========================================
// DASHBOARD SETUP
// ========================================

export function setupChatManually() {
    const chatClose = document.getElementById('chatClose');
    const chatMinimize = document.getElementById('chatMinimize');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    const chatToggle = document.getElementById('chatToggle');
    const chatWidget = document.getElementById('chatWidget');

    if (!chatSend || !chatInput) {
        console.error('Chat Input/Send Buttons nicht gefunden!');
        return;
    }

    console.log('Chat Elemente gefunden, setze Event Listeners...');

    chatClose?.addEventListener('click', () => {
        chatWidget.style.display = 'none';
        chatToggle.style.display = 'flex';
    });

    chatMinimize?.addEventListener('click', () => {
        chatWidget?.classList.toggle('minimized');
    });

    chatSend.addEventListener('click', () => {
        window.sendMessage?.();
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            window.sendMessage?.();
        }
    });

    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatToggle?.addEventListener('click', () => {
        chatWidget.style.display = 'flex';
        chatToggle.style.display = 'none';
        chatInput.focus();
    });

    console.log('Chat manuell initialisiert!');
}

export function openDashboard() {
    console.log('Dashboard öffnen...');

    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');

    if (landingPage) landingPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';

    setTimeout(() => {
        if (typeof window.waitForLibraries === 'function') {
            window.waitForLibraries(() => {
                if (window.state?.availableYears?.length > 0) {
                    const yearFilter = document.getElementById('yearFilter');
                    if (yearFilter) {
                        window.state.availableYears.forEach(year => {
                            if (!Array.from(yearFilter.options).some(opt => opt.value == year)) {
                                const option = document.createElement('option');
                                option.value = year;
                                option.textContent = year;
                                yearFilter.appendChild(option);
                            }
                        });
                        yearFilter.value = window.state.filters.year;
                    }
                }

                window.updateAgenturFilterDropdown?.();
                window.initKPIGrid?.();
                window.updateAllKPIs?.();

                setTimeout(() => window.initMap?.(), 500);

                setTimeout(() => {
                    const chatWidget = document.getElementById('chatWidget');
                    const chatToggle = document.getElementById('chatToggle');

                    if (chatWidget && chatToggle) {
                        chatWidget.style.display = 'flex';
                        chatToggle.style.display = 'none';

                        if (typeof window.initChat === 'function') {
                            window.initChat();
                        } else {
                            setupChatManually();
                        }
                    }
                }, 1000);
            });
        }
    }, 100);
}
