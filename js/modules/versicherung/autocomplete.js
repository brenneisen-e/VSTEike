/**
 * Versicherung Autocomplete Module
 * ES6 Module for chatbot autocomplete (ES2024)
 */

import { openPotentialAnalyseWithFilter } from './potentialanalyse.js';
import { setAgenturFilter } from './filters.js';
import { openDashboard } from './data.js';
import { addLandingChatMessage } from './chat.js';

// ========================================
// STATE
// ========================================

let selectedSuggestionIndex = -1;
let currentSuggestionType = null;

const mockAgents = [
    { id: 'VM00001', name: 'Max Mustermann' },
    { id: 'VM00002', name: 'Maria Schmidt' },
    { id: 'VM00003', name: 'Michael Weber' },
    { id: 'VM00004', name: 'Martina Fischer' },
    { id: 'VM00005', name: 'Markus Braun' }
];

const potentialProducts = [
    { id: 'hausrat', name: 'Hausratversicherung' },
    { id: 'haftpflicht', name: 'Haftpflichtversicherung' },
    { id: 'kfz', name: 'Kfz-Versicherung' },
    { id: 'leben', name: 'Lebensversicherung' },
    { id: 'bu', name: 'Berufsunfähigkeitsversicherung' },
    { id: 'unfall', name: 'Unfallversicherung' },
    { id: 'rechtsschutz', name: 'Rechtsschutzversicherung' },
    { id: 'kranken', name: 'Krankenversicherung' },
    { id: 'pflege', name: 'Pflegeversicherung' },
    { id: 'altersvorsorge', name: 'Private Altersvorsorge' },
    { id: 'sach', name: 'Sachversicherung' },
    { id: 'wohngebaeude', name: 'Wohngebäudeversicherung' }
];

const quickCommands = [
    { pattern: 'gesamtübersicht', label: 'Gesamtübersicht öffnen', action: 'openDashboard', icon: 'grid' },
    { pattern: 'potentialanalyse', label: 'Potentialanalyse öffnen', action: 'openPotentialAnalyse', icon: 'chart' },
    { pattern: 'dashboard', label: 'Dashboard öffnen', action: 'openDashboard', icon: 'grid' },
    { pattern: 'hilfe', label: 'Hilfe anzeigen', action: 'showHelp', icon: 'help' },
    { pattern: 'filter zurücksetzen', label: 'Alle Filter zurücksetzen', action: 'clearFilters', icon: 'x' }
];

// ========================================
// ICONS
// ========================================

const icons = {
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
};

export function getIcon(iconType) {
    return icons[iconType] ?? icons.user;
}

// ========================================
// SUGGESTIONS
// ========================================

export function getAgentSuggestions(searchTerm, prefix) {
    const agenturen = typeof window.getAgenturen === 'function' ? window.getAgenturen() : mockAgents;

    return agenturen.filter(a =>
        a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5).map(agent => ({
        type: 'agent',
        id: agent.id,
        name: agent.name ?? agent.id,
        label: prefix === 'filter ' ? `Filter auf ${agent.name}` : `Übersicht ${agent.name}`,
        prefix,
        icon: 'user'
    }));
}

export function getPotentialSuggestions(searchTerm) {
    return potentialProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5).map(p => ({
        type: 'potential',
        id: p.id,
        name: p.name,
        label: `Potentiale für ${p.name}`,
        icon: 'chart'
    }));
}

export function showUnifiedSuggestions(suggestions, container) {
    container.innerHTML = suggestions.map(s => `
        <div class="autocomplete-item"
             data-type="${s.type}"
             data-id="${s.id ?? ''}"
             data-name="${s.name ?? ''}"
             data-action="${s.action ?? ''}"
             data-label="${s.label}"
             onclick="executeSuggestion(this)">
            ${getIcon(s.icon)}
            <span class="suggestion-label">${s.label}</span>
            ${s.id ? `<span class="suggestion-id">(${s.id})</span>` : ''}
        </div>
    `).join('');

    container.style.display = 'block';
    selectedSuggestionIndex = -1;
}

export function hideSuggestions(container) {
    container.style.display = 'none';
    selectedSuggestionIndex = -1;
    currentSuggestionType = null;
}

function updateSuggestionSelection(items) {
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedSuggestionIndex);
    });
}

// ========================================
// EXECUTE SUGGESTION
// ========================================

export function executeSuggestion(element) {
    const type = element.dataset.type;
    const id = element.dataset.id;
    const name = element.dataset.name;
    const action = element.dataset.action;
    const container = document.getElementById('autocompleteSuggestions');

    hideSuggestions(container);

    const chatInput = document.getElementById('landingChatInput');
    if (chatInput) chatInput.value = '';

    if (type === 'agent') {
        if (typeof window.showAgenturOverview === 'function') {
            window.showAgenturOverview(id);
        }
    } else if (type === 'potential') {
        openPotentialAnalyseWithFilter(id, name);
    } else if (type === 'command') {
        if (action === 'openDashboard') {
            openDashboard();
        } else if (action === 'openPotentialAnalyse') {
            window.openPotentialAnalyse?.();
        } else if (action === 'clearFilters') {
            window.clearAllFilters?.();
            addLandingChatMessage('assistant', 'Alle Filter wurden zurückgesetzt.');
        } else if (action === 'showHelp') {
            addLandingChatMessage('assistant', '**Verfügbare Befehle:**\n\n- "Übersicht [Name]" - Agenturübersicht öffnen\n- "Potentiale für [Produkt]" - Potentialanalyse filtern\n- "Gesamtübersicht" - Dashboard öffnen\n- "Potentialanalyse" - Potentialanalyse öffnen\n- "Filter zurücksetzen" - Alle Filter entfernen');
        }
    }
}

export function selectAgentSuggestion(agentId, agentName) {
    console.log('Agentur ausgewählt:', agentId, agentName);

    const container = document.getElementById('autocompleteSuggestions');
    if (container) container.style.display = 'none';

    const chatInput = document.getElementById('landingChatInput');
    if (chatInput) chatInput.value = '';

    if (typeof window.showAgenturOverview === 'function') {
        window.showAgenturOverview(agentId);
    } else {
        setAgenturFilter(agentId);
        openDashboard();
    }
}

export function selectPotentialSuggestion(productId, productName) {
    console.log('Potential ausgewählt:', productId, productName);

    const container = document.getElementById('autocompleteSuggestions');
    if (container) container.style.display = 'none';

    const chatInput = document.getElementById('landingChatInput');
    if (chatInput) chatInput.value = '';

    openPotentialAnalyseWithFilter(productId, productName);
}

// ========================================
// SETUP
// ========================================

export function setupAutocomplete() {
    const chatInput = document.getElementById('landingChatInput');
    const suggestionsContainer = document.getElementById('autocompleteSuggestions');

    if (!chatInput || !suggestionsContainer) return;

    chatInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase().trim();

        if (value.length < 3) {
            hideSuggestions(suggestionsContainer);
            return;
        }

        let suggestions = [];

        // Agent commands
        const agentPatterns = ['agentur ', 'übersicht ', 'zeige ', 'filter ', 'ansicht '];
        for (const pattern of agentPatterns) {
            if (value.includes(pattern)) {
                const searchTerm = value.split(pattern).pop();
                if (searchTerm?.length > 0) {
                    suggestions = suggestions.concat(getAgentSuggestions(searchTerm, pattern));
                }
                break;
            }
        }

        // Potential commands
        const potentialPatterns = ['potentiale für ', 'potential für ', 'potentiale ', 'potential '];
        for (const pattern of potentialPatterns) {
            if (value.includes(pattern)) {
                const searchTerm = value.split(pattern).pop();
                if (searchTerm?.length > 0) {
                    suggestions = suggestions.concat(getPotentialSuggestions(searchTerm));
                }
                break;
            }
        }

        // Show all potentials when "pot..." is typed
        if (value.startsWith('pot') && !value.includes(' ')) {
            const allPotentials = potentialProducts.slice(0, 5).map(p => ({
                type: 'potential',
                id: p.id,
                name: p.name,
                label: `Potentiale für ${p.name}`,
                icon: 'chart'
            }));
            suggestions = suggestions.concat(allPotentials);
        }

        // General agent search
        if (suggestions.length === 0) {
            suggestions = suggestions.concat(getAgentSuggestions(value, ''));
        }

        // Quick commands
        const commandMatches = quickCommands.filter(cmd =>
            cmd.pattern.includes(value) || cmd.label.toLowerCase().includes(value)
        ).map(cmd => ({
            type: 'command',
            label: cmd.label,
            action: cmd.action,
            icon: cmd.icon
        }));
        suggestions = suggestions.concat(commandMatches);

        // Direct potential products
        if (suggestions.length < 5) {
            const directPotentials = potentialProducts.filter(p =>
                p.name.toLowerCase().includes(value) || p.id.includes(value)
            ).slice(0, 3).map(p => ({
                type: 'potential',
                id: p.id,
                name: p.name,
                label: `Potentiale für ${p.name}`,
                icon: 'chart'
            }));
            suggestions = suggestions.concat(directPotentials);
        }

        suggestions = suggestions.slice(0, 8);

        if (suggestions.length > 0) {
            showUnifiedSuggestions(suggestions, suggestionsContainer);
        } else {
            hideSuggestions(suggestionsContainer);
        }
    });

    // Keyboard navigation
    chatInput.addEventListener('keydown', (e) => {
        const items = suggestionsContainer.querySelectorAll('.autocomplete-item');

        if (suggestionsContainer.style.display === 'none' || items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, items.length - 1);
            updateSuggestionSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, 0);
            updateSuggestionSelection(items);
        } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
            e.preventDefault();
            const selectedItem = items[selectedSuggestionIndex];
            if (selectedItem) executeSuggestion(selectedItem);
        }
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!suggestionsContainer.contains(e.target) && e.target !== chatInput) {
            hideSuggestions(suggestionsContainer);
        }
    });
}

// Legacy compatibility
export function showAgentSuggestions(searchTerm, container) {
    const suggestions = getAgentSuggestions(searchTerm, '').map(s => ({
        ...s,
        label: `Übersicht ${s.name}`
    }));

    if (suggestions.length === 0) {
        hideSuggestions(container);
        return;
    }

    showUnifiedSuggestions(suggestions, container);
}

export function showPotentialSuggestions(searchTerm, container) {
    const suggestions = getPotentialSuggestions(searchTerm);

    if (suggestions.length === 0) {
        hideSuggestions(container);
        return;
    }

    showUnifiedSuggestions(suggestions, container);
}

export function selectSuggestion(id, name) {
    if (currentSuggestionType === 'potential') {
        selectPotentialSuggestion(id, name);
    } else {
        selectAgentSuggestion(id, name);
    }
}
