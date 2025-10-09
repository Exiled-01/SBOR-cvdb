import * as Helpers from './helpers.js';
import * as Table from './table.js';
import * as Comparison from './comparison.js';
import { setupCalculatorSearch, setupCalculatorButton } from './calculator.js';

const allItems = window.allItems || [];

// Initialize table filters and stats
Table.filterItems();
Table.updateStats();

// Navigation tabs
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        Helpers.state.currentSection = tab.dataset.section;

        const isCalculator = Helpers.state.currentSection === 'calculator';
        document.getElementById('subcategory-selector').style.display = isCalculator ? 'none' : 'block';
        document.querySelector('.stats-grid').style.display = isCalculator ? 'none' : 'grid';
        document.getElementById('category-progress-section').style.display = isCalculator ? 'none' : 'block';
        document.querySelector('.controls').style.display = isCalculator ? 'none' : 'flex';
        document.querySelector('.table-container').style.display = isCalculator ? 'none' : 'block';

        if (isCalculator) Table.showModal(Helpers.calculatorModal);
        else Table.hideAllModals();

        Table.filterItems();
        Table.updateStats();
    });
});

// Comparison modal open/close
document.getElementById('compare-button').addEventListener('click', () => Table.showModal(Helpers.comparisonModal));
document.getElementById('close-comparison').addEventListener('click', () => Helpers.comparisonModal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === Helpers.comparisonModal) Helpers.comparisonModal.style.display = 'none'; });

// Checkboxes & filters
document.querySelectorAll('.own-checkbox').forEach(cb => cb.addEventListener('change', Table.updateStats));
document.querySelectorAll('.wish-checkbox').forEach(cb => cb.addEventListener('change', Table.updateStats));

['search-input','ownership-filter','sort-filter','obtain-filter','skill-min','skill-max','col-min','col-max'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(['input','change'].includes(el.type)?'input':'change', Table.filterItems);
});

// Initialize autocompletes
Comparison.setupAutocomplete('compare-item-1', 'compare-item-1-options', 'comparison-stats-1', allItems, true, Helpers.state, () => Comparison.updateComparisonAnalysis(allItems));
Comparison.setupAutocomplete('compare-item-2', 'compare-item-2-options', 'comparison-stats-2', allItems, false, Helpers.state, () => Comparison.updateComparisonAnalysis(allItems));

// Clear buttons
document.getElementById('clear-compare-1').addEventListener('click', () => {
    document.getElementById('compare-item-1').value = '';
    document.getElementById('compare-item-1-options').innerHTML = '';
    document.getElementById('comparison-stats-1').innerHTML = '';
    Helpers.state.firstSelectionType = null;
    Comparison.updateComparisonAnalysis(allItems);
});

document.getElementById('clear-compare-2').addEventListener('click', () => {
    document.getElementById('compare-item-2').value = '';
    document.getElementById('compare-item-2-options').innerHTML = '';
    document.getElementById('comparison-stats-2').innerHTML = '';
    Helpers.state.secondSelectionType = null;
    Comparison.updateComparisonAnalysis(allItems);
});

// Initialize the bulk calculator search with clear button
setupCalculatorSearch('calc-item-name', 'calc-col-value', allItems);
setupCalculatorButton('calculate-button', 'calc-col-value', 'calc-quantity');

