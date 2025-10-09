import { state, comparisonModal, calculatorModal } from './helpers.js';

export function updateCategoryProgress() {
    const progressContainer = document.getElementById('category-progress-bars');
    progressContainer.innerHTML = '';
    const rows = Array.from(document.querySelectorAll('#item-table tr'));
    const visibleRows = rows.filter(r => r.style.display !== 'none');
    const categories = [...new Set(visibleRows.map(r => r.dataset.category))];

    categories.forEach(cat => {
        const catRows = visibleRows.filter(r => r.dataset.category === cat);
        const completed = catRows.filter(r => r.querySelector('.col-value')?.textContent !== 'TBD').length;
        const percentage = catRows.length ? Math.round((completed / catRows.length) * 100) : 0;

        const progressDiv = document.createElement('div');
        progressDiv.className = 'category-progress';
        progressDiv.innerHTML = `
            <div class="category-progress-label">
                <span>${cat}</span>
                <span>${completed}/${catRows.length}</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentage}%">${percentage}%</div>
            </div>
        `;
        progressContainer.appendChild(progressDiv);
    });
}

export function updateStats() {
    const rows = Array.from(document.querySelectorAll('#item-table tr'));
    const visibleRows = rows.filter(r => r.style.display !== 'none');

    const totalItems = visibleRows.length;
    const completedItems = visibleRows.filter(r => r.querySelector('.col-value')?.textContent !== 'TBD').length;
    const ownedCount = visibleRows.filter(r => r.querySelector('.own-checkbox')?.checked).length;

    let totalValue = 0;
    let mostValuableItem = null;
    let highestValue = 0;

    visibleRows.forEach(r => {
        const colValue = parseInt(r.querySelector('.col-value')?.textContent.replace(/,/g, '')) || 0;
        const name = r.querySelector('td:nth-child(3)')?.textContent || '';
        if (r.querySelector('.own-checkbox')?.checked && colValue > 0) {
            totalValue += colValue;
            if (colValue > highestValue) {
                highestValue = colValue;
                mostValuableItem = name;
            }
        }
    });

    document.getElementById('progress-value').textContent = `${completedItems}/${totalItems}`;
    document.getElementById('completion-percentage').textContent = `${totalItems ? Math.round((completedItems / totalItems) * 100) : 0}%`;
    document.getElementById('owned-items').textContent = `${ownedCount}/${totalItems}`;
    document.getElementById('total-value').textContent = totalValue.toLocaleString();
    document.getElementById('most-valuable').textContent = mostValuableItem || 'None';

    updateCategoryProgress();
}

export function filterItems() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const ownershipFilter = document.getElementById('ownership-filter').value;
    const obtainFilter = document.getElementById('obtain-filter').value;
    const skillMin = parseInt(document.getElementById('skill-min').value) || 0;
    const skillMax = parseInt(document.getElementById('skill-max').value) || Infinity;
    const colMin = parseInt(document.getElementById('col-min').value) || 0;
    const colMax = parseInt(document.getElementById('col-max').value) || Infinity;

    const rows = Array.from(document.querySelectorAll('#item-table tr'));

    rows.forEach(r => {
        const name = r.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
        const colValue = parseInt(r.querySelector('.col-value')?.textContent.replace(/,/g, '')) || 0;
        const skill = parseInt(r.querySelector('td:nth-child(4)')?.textContent) || 0;
        const owned = r.querySelector('.own-checkbox')?.checked || false;
        const wish = r.querySelector('.wish-checkbox')?.checked || false;
        const obtain = r.querySelector('td:nth-child(9)')?.textContent.toLowerCase() || '';
        const type = r.dataset.type;

        let show = true;

        // Use state.currentSection instead of imported primitive
        if ((state.currentSection === 'weapons' && type !== 'weapon') || (state.currentSection === 'gear' && type !== 'gear')) show = false;
        if (searchTerm && !name.includes(searchTerm)) show = false;
        if (ownershipFilter === 'owned' && !owned) show = false;
        if (ownershipFilter === 'missing' && owned) show = false;
        if (ownershipFilter === 'wishlisted' && !wish) show = false;
        if (obtainFilter !== 'all' && !obtain.includes(obtainFilter)) show = false;
        if (skill < skillMin || skill > skillMax) show = false;
        if (colValue < colMin || colValue > colMax) show = false;

        r.style.display = show ? '' : 'none';
    });

    const visibleRows = rows.filter(r => r.style.display !== 'none');
    document.getElementById('table-title').textContent = `${state.currentSection.charAt(0).toUpperCase() + state.currentSection.slice(1)} (${visibleRows.length} items)`;
}

export function hideAllModals() {
    comparisonModal.style.display = 'none';
    calculatorModal.style.display = 'none';
}

export function showModal(modal) {
    hideAllModals();
    modal.style.display = 'block';
}
