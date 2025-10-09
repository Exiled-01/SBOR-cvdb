import { state } from './helpers.js';

// Display stats for a selected item
export function displayComparisonStats(item, containerId) {
    const container = document.getElementById(containerId);
    if (!item) {
        container.innerHTML = '<p style="color: #6b7280;">Select an item to compare</p>';
        return;
    }

    container.innerHTML = `
        <div class="comparison-stat">
            <span class="comparison-label">Name:</span>
            <span class="comparison-value">${item.name}</span>
        </div>
        <div class="comparison-stat">
            <span class="comparison-label">Max Skill:</span>
            <span class="comparison-value">${item.maxSkill || 'N/A'}</span>
        </div>
        <div class="comparison-stat">
            <span class="comparison-label">${state.currentSection === 'gear' ? 'Defense:' : 'Attack:'}</span>
            <span class="comparison-value">${state.currentSection === 'gear' ? (item.defense || 'N/A') : (item.attack || 'N/A')}</span>
        </div>
        ${state.currentSection === 'gear' ? `
        <div class="comparison-stat">
            <span class="comparison-label">Dexterity:</span>
            <span class="comparison-value">${item.dexterity || 'N/A'}</span>
        </div>` : ''}
        <div class="comparison-stat">
            <span class="comparison-label">Col Value:</span>
            <span class="comparison-value">${item.colValue != null ? item.colValue.toLocaleString() : 'TBD'}</span>
        </div>
        <div class="comparison-stat">
            <span class="comparison-label">Resale (Base):</span>
            <span class="comparison-value">${item.resaleAmount || '-'}</span>
        </div>
        <div class="comparison-stat">
            <span class="comparison-label">Resale (VM):</span>
            <span class="comparison-value">${item.resaleAmountVM || '-'}</span>
        </div>
        <div class="comparison-stat">
            <span class="comparison-label">How to Obtain:</span>
            <span class="comparison-value" style="font-size: 12px;">${item.howToObtain || 'Unknown'}</span>
        </div>
    `;
}

// Compare two items and show analysis
export function compareItems(item1, item2) {
    const resultDiv = document.getElementById('comparison-result');
    const analysisDiv = document.getElementById('comparison-analysis');
    analysisDiv.innerHTML = '';
    resultDiv.style.display = 'none';

    if (!item1 || !item2) return;

    resultDiv.style.display = 'block';
    const analysis = [];

    const attack1 = parseFloat(item1.attack) || parseFloat(item1.defense) || 0;
    const attack2 = parseFloat(item2.attack) || parseFloat(item2.defense) || 0;
    const col1 = item1.colValue || 0;
    const col2 = item2.colValue || 0;

    if (attack1 > attack2) analysis.push(`✓ ${item1.name} has higher ${state.currentSection === 'gear' ? 'defense' : 'attack'} (${attack1} vs ${attack2})`);
    else if (attack2 > attack1) analysis.push(`✓ ${item2.name} has higher ${state.currentSection === 'gear' ? 'defense' : 'attack'} (${attack2} vs ${attack1})`);

    if (col1 > col2) analysis.push(`✓ ${item1.name} has higher col value (${col1.toLocaleString()} vs ${col2.toLocaleString()})`);
    else if (col2 > col1) analysis.push(`✓ ${item2.name} has higher col value (${col2.toLocaleString()} vs ${col1.toLocaleString()})`);

    if (attack1 > 0 && attack2 > 0 && col1 > 0 && col2 > 0) {
        const value1 = col1 / attack1;
        const value2 = col2 / attack2;
        if (value1 < value2) analysis.push(`✓ ${item1.name} is better value (${Math.round(value1)} col per point vs ${Math.round(value2)})`);
        else if (value2 < value1) analysis.push(`✓ ${item2.name} is better value (${Math.round(value2)} col per point vs ${Math.round(value1)})`);
    }

    analysisDiv.innerHTML = analysis.join('<br>');
}

// Setup autocomplete for comparison input
export function setupAutocomplete(inputId, optionsContainerId, statsContainerId, allItems, isFirst) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(optionsContainerId);
    const statsDiv = document.getElementById(statsContainerId);

    function positionDropdown() {
        const rect = input.getBoundingClientRect();
        container.style.position = 'fixed';
        container.style.top = `${rect.bottom + 2}px`; // slight offset
        container.style.left = `${rect.left}px`;
        container.style.width = `${rect.width}px`;
        container.style.zIndex = 1000;
    }

    input.addEventListener('input', () => {
        const value = input.value.toLowerCase();
        container.innerHTML = '';
        if (!value) return container.style.display = 'none';

        const filterType = isFirst ? state.secondSelectionType : state.firstSelectionType;
        const matches = allItems.filter(item =>
            item.name.toLowerCase().includes(value) &&
            (!filterType || item.type === filterType)
        );

        matches.forEach(item => {
            const div = document.createElement('div');
            div.textContent = item.name;
            div.addEventListener('click', () => {
                input.value = item.name;
                container.innerHTML = '';
                container.style.display = 'none';

                displayComparisonStats(item, statsContainerId);

                if (isFirst) state.firstSelectionType = item.type;
                else state.secondSelectionType = item.type;

                const otherInputId = isFirst ? 'compare-item-2' : 'compare-item-1';
                const otherItemName = document.getElementById(otherInputId).value;
                const otherItem = allItems.find(i => i.name === otherItemName);

                compareItems(isFirst ? item : otherItem, isFirst ? otherItem : item);
            });
            container.appendChild(div);
        });

        if (matches.length) {
            container.style.display = 'block';
            positionDropdown();
        } else {
            container.style.display = 'none';
        }
    });

    window.addEventListener('resize', positionDropdown);
    input.closest('.modal-content')?.addEventListener('scroll', positionDropdown);

    document.addEventListener('click', e => {
        if (!container.contains(e.target) && e.target !== input) {
            container.innerHTML = '';
            container.style.display = 'none';
        }
    });
}

// Optional clear button
export function setupClearButton(inputId, statsId, allItems, isFirst) {
    const input = document.getElementById(inputId);
    const statsDiv = document.getElementById(statsId);

    const btn = document.createElement('button');
    btn.textContent = '×';
    btn.className = 'clear-search';
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(btn);

    btn.addEventListener('click', () => {
        input.value = '';
        statsDiv.innerHTML = '';
        if (isFirst) state.firstSelectionType = null;
        else state.secondSelectionType = null;

        const otherInputId = isFirst ? 'compare-item-2' : 'compare-item-1';
        const otherItemName = document.getElementById(otherInputId).value;
        const otherItem = allItems.find(i => i.name === otherItemName);
        compareItems(isFirst ? null : otherItem, isFirst ? otherItem : null);
    });
}
