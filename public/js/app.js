let ownedItems = new Set();
let wishlistedItems = new Set();
let currentSection = 'weapons';
let currentSubcategory = 'one-handed';
let currentCategory = 'all';
let filteredItems = [];

// Helper functions
function getAllItems() {
    if (currentSection === 'weapons') {
        return Object.values(items.weapons).flat();
    } else if (currentSection === 'gear') {
        return [...items.armor, ...items['upper-headwear'], ...items['lower-headwear'], ...items.shields];
    }
    return [];
}

function getCurrentSubcategoryItems() {
    if (currentSection === 'weapons') {
        return items.weapons[currentSubcategory] || [];
    } else if (currentSection === 'gear') {
        if (currentSubcategory === 'armor') return items.armor;
        if (currentSubcategory === 'upper-headwear') return items['upper-headwear'];
        if (currentSubcategory === 'lower-headwear') return items['lower-headwear'];
        if (currentSubcategory === 'shields') return items.shields;
    }
    return [];
}

function getItemId(item) {
    return `${currentSection}-${currentSubcategory}-${item.name}`;
}

function getItemIcon(item) {
    return '';
}

function getRarityClass(item) {
    if (!item.colValue) return 'rarity-common';
    if (item.colValue < 10000) return 'rarity-common';
    if (item.colValue < 30000) return 'rarity-uncommon';
    if (item.colValue < 60000) return 'rarity-rare';
    if (item.colValue < 90000) return 'rarity-epic';
    return 'rarity-legendary';
}

function wikiUrl(name) {
    return "https://swordbloxonlinerebirth.fandom.com/wiki/" + name.replace(/ /g, "_");
}

function updateStats() {
    const allItems = getAllItems();
    const completedItems = allItems.filter(item => item.colValue !== null).length;
    const completionPercentage = allItems.length > 0 ? Math.round((completedItems / allItems.length) * 100) : 0;

    const ownedCount = Array.from(ownedItems).filter(id => {
        return allItems.some(item => getItemId(item) === id);
    }).length;

    document.getElementById('progress-value').textContent = `${completedItems}/${allItems.length}`;
    document.getElementById('completion-percentage').textContent = `${completionPercentage}%`;
    document.getElementById('owned-items').textContent = `${ownedCount}/${allItems.length}`;

    let totalValue = 0;
    let mostValuableItem = null;
    let highestValue = 0;

    allItems.forEach(item => {
        const itemId = getItemId(item);
        if (ownedItems.has(itemId) && item.colValue) {
            totalValue += item.colValue;

            if (item.resaleAmount !== 'Cannot be sold' &&
                item.resaleAmount !== 'cannot be sold' &&
                item.colValue > highestValue) {
                highestValue = item.colValue;
                mostValuableItem = item.name;
            }
        }
    });

    document.getElementById('total-value').textContent = totalValue.toLocaleString();
    document.getElementById('most-valuable').textContent = mostValuableItem || 'None';

    updateCategoryProgress();
}

function updateCategoryProgress() {
    const progressContainer = document.getElementById('category-progress-bars');
    progressContainer.innerHTML = '';

    if (currentSection === 'weapons') {
        Object.keys(items.weapons).forEach(category => {
            const categoryItems = items.weapons[category];
            const completed = categoryItems.filter(item => item.colValue !== null).length;
            const percentage = categoryItems.length > 0 ? Math.round((completed / categoryItems.length) * 100) : 0;

            const progressDiv = document.createElement('div');
            progressDiv.className = 'category-progress';
            progressDiv.innerHTML = `
                        <div class="category-progress-label">
                            <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                            <span>${completed}/${categoryItems.length}</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${percentage}%">${percentage}%</div>
                        </div>
                    `;
            progressContainer.appendChild(progressDiv);
        });
    } else if (currentSection === 'gear') {
        const gearCategories = {
            'armor': items.armor,
            'upper-headwear': items['upper-headwear'],
            'lower-headwear': items['lower-headwear'],
            'shields': items.shields
        };

        Object.keys(gearCategories).forEach(category => {
            const categoryItems = gearCategories[category];
            const completed = categoryItems.filter(item => item.colValue !== null).length;
            const percentage = categoryItems.length > 0 ? Math.round((completed / categoryItems.length) * 100) : 0;

            const progressDiv = document.createElement('div');
            progressDiv.className = 'category-progress';
            const displayName = category === 'upper-headwear' ? 'Upper Headwear' :
                category === 'lower-headwear' ? 'Lower Headwear' :
                    category.charAt(0).toUpperCase() + category.slice(1);
            progressDiv.innerHTML = `
                        <div class="category-progress-label">
                            <span>${displayName}</span>
                            <span>${completed}/${categoryItems.length}</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${percentage}%">${percentage}%</div>
                        </div>
                    `;
            progressContainer.appendChild(progressDiv);
        });
    }
}

function toggleOwnership(item, checkbox) {
    const itemId = getItemId(item);
    if (checkbox.checked) {
        ownedItems.add(itemId);
    } else {
        ownedItems.delete(itemId);
    }
    updateStats();
}

function toggleWishlist(item, checkbox) {
    const itemId = getItemId(item);
    if (checkbox.checked) {
        wishlistedItems.add(itemId);
    } else {
        wishlistedItems.delete(itemId);
    }
}

function renderItemRow(item) {
    const tr = document.createElement('tr');
    const itemId = getItemId(item);

    const ownCheckbox = document.createElement('input');
    ownCheckbox.type = 'checkbox';
    ownCheckbox.className = 'item-checkbox';
    ownCheckbox.checked = ownedItems.has(itemId);
    ownCheckbox.addEventListener('change', () => toggleOwnership(item, ownCheckbox));

    const ownCell = document.createElement('td');
    ownCell.className = 'checkbox-cell';
    ownCell.appendChild(ownCheckbox);
    tr.appendChild(ownCell);

    const wishCheckbox = document.createElement('input');
    wishCheckbox.type = 'checkbox';
    wishCheckbox.className = 'item-checkbox';
    wishCheckbox.checked = wishlistedItems.has(itemId);
    wishCheckbox.addEventListener('change', () => toggleWishlist(item, wishCheckbox));

    const wishCell = document.createElement('td');
    wishCell.className = 'checkbox-cell';
    wishCell.appendChild(wishCheckbox);
    tr.appendChild(wishCell);

    const nameCell = document.createElement('td');
    const nameLink = document.createElement('a');
    nameLink.href = wikiUrl(item.name);
    nameLink.target = '_blank';
    nameLink.className = `item-name tooltip ${getRarityClass(item)}`;
    nameLink.innerHTML = `
                <span>${item.name}</span>
                <span class="tooltiptext">
                    <strong>${item.name}</strong><br>
                    Max Skill: ${item.maxSkill || 'N/A'}<br>
                    ${currentSection === 'gear' ?
            `Defense: ${item.defense || 'N/A'}<br>Dexterity: ${item.dexterity || 'N/A'}` :
            `Attack: ${item.attack || 'N/A'}`}<br>
                    Col Value: ${item.colValue !== null ? item.colValue.toLocaleString() : 'TBD'}<br>
                    How to Obtain: ${item.howToObtain || 'Unknown'}
                </span>
            `;
    nameCell.appendChild(nameLink);
    tr.appendChild(nameCell);

    const skillCell = document.createElement('td');
    skillCell.textContent = item.maxSkill || '';
    tr.appendChild(skillCell);

    const attackCell = document.createElement('td');
    if (currentSection === 'gear') {
        attackCell.textContent = `${item.defense || ''} / ${item.dexterity || ''}`;
    } else {
        attackCell.textContent = item.attack || '';
    }
    tr.appendChild(attackCell);

    const colValueCell = document.createElement('td');
    const colValueSpan = document.createElement('span');
    colValueSpan.className = 'col-value ' + (item.colValue === null ? 'missing' : 'completed');
    colValueSpan.textContent = item.colValue === null ? 'TBD' : item.colValue.toLocaleString();
    colValueCell.appendChild(colValueSpan);
    tr.appendChild(colValueCell);

    const resaleCell = document.createElement('td');
    resaleCell.className = 'resale-amount';
    resaleCell.textContent = item.resaleAmount || '-';
    tr.appendChild(resaleCell);

    const resaleVMCell = document.createElement('td');
    resaleVMCell.className = 'resale-amount';
    resaleVMCell.textContent = item.resaleAmountVM || '-';
    tr.appendChild(resaleVMCell);

    const obtainCell = document.createElement('td');
    obtainCell.className = 'how-to-obtain';
    obtainCell.title = item.howToObtain || '';
    obtainCell.textContent = item.howToObtain || '';
    tr.appendChild(obtainCell);

    return tr;
}

function renderTable() {
    const tbody = document.getElementById('item-table');
    tbody.innerHTML = '';

    filteredItems.forEach(item => {
        tbody.appendChild(renderItemRow(item));
    });
}

function filterItems() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const ownershipFilter = document.getElementById('ownership-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    const obtainFilter = document.getElementById('obtain-filter').value;
    const skillMin = parseInt(document.getElementById('skill-min').value) || 0;
    const skillMax = parseInt(document.getElementById('skill-max').value) || Infinity;
    const colMin = parseInt(document.getElementById('col-min').value) || 0;
    const colMax = parseInt(document.getElementById('col-max').value) || Infinity;

    let itemList;
    if (currentCategory === 'all') {
        itemList = getAllItems();
    } else {
        itemList = getCurrentSubcategoryItems();
    }

    filteredItems = itemList.filter(item => {
        const itemId = getItemId(item);

        if (searchTerm && !item.name.toLowerCase().includes(searchTerm)) return false;

        if (ownershipFilter === 'owned' && !ownedItems.has(itemId)) return false;
        if (ownershipFilter === 'missing' && ownedItems.has(itemId)) return false;
        if (ownershipFilter === 'wishlisted' && !wishlistedItems.has(itemId)) return false;

        if (obtainFilter !== 'all') {
            const obtain = (item.howToObtain || '').toLowerCase();
            if (obtainFilter === 'shop' && !obtain.includes('shop')) return false;
            if (obtainFilter === 'mob' && (obtain.includes('shop') || obtain.includes('blacksmithing') || obtain.includes('quest'))) return false;
            if (obtainFilter === 'blacksmithing' && !obtain.includes('blacksmithing')) return false;
            if (obtainFilter === 'quest' && !obtain.includes('quest')) return false;
        }

        const maxSkill = parseInt(item.maxSkill) || 0;
        if (maxSkill < skillMin || maxSkill > skillMax) return false;

        const colValue = item.colValue || 0;
        if (colValue < colMin || colValue > colMax) return false;

        return true;
    });

    filteredItems.sort((a, b) => {
        switch (sortFilter) {
            case 'col-asc':
                return (a.colValue || 0) - (b.colValue || 0);
            case 'col-desc':
                return (b.colValue || 0) - (a.colValue || 0);
            case 'skill-asc':
                return (parseInt(a.maxSkill) || 0) - (parseInt(b.maxSkill) || 0);
            case 'skill-desc':
                return (parseInt(b.maxSkill) || 0) - (parseInt(a.maxSkill) || 0);
            case 'name-asc':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });

    const categoryName = currentCategory === 'all' ? currentSection : currentSubcategory;
    const displayName = categoryName === 'upper-headwear' ? 'Upper Headwear' :
        categoryName === 'lower-headwear' ? 'Lower Headwear' :
            categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    document.getElementById('table-title').textContent = `${displayName} (${filteredItems.length} items)`;

    renderTable();
}

function exportCSV(filterType = 'all') {
    let exportItems;
    const allItems = getAllItems();

    switch (filterType) {
        case 'owned':
            exportItems = allItems.filter(item => ownedItems.has(getItemId(item)));
            break;
        case 'missing':
            exportItems = allItems.filter(item => !ownedItems.has(getItemId(item)));
            break;
        case 'category':
            exportItems = filteredItems;
            break;
        default:
            exportItems = allItems;
    }

    const csvHeader = "Item Name,Type,Max Skill,Attack,Defense,Dexterity,Col Value,Resale,Resale (VM),How to Obtain,Wiki URL\n";
    const csvRows = exportItems.map(item => {
        const name = `"${item.name}"`;
        const type = currentSection;
        const maxSkill = item.maxSkill || "";
        const attack = item.attack || "";
        const defense = item.defense || "";
        const dexterity = item.dexterity || "";
        const colValue = item.colValue !== null ? item.colValue : "TBD";
        const resale = `"${item.resaleAmount || ""}"`;
        const resaleVM = `"${item.resaleAmountVM || ""}"`;
        const howToObtain = `"${item.howToObtain || ""}"`;
        const wikiLink = `"${wikiUrl(item.name)}"`;

        return `${name},${type},${maxSkill},${attack},${defense},${dexterity},${colValue},${resale},${resaleVM},${howToObtain},${wikiLink}`;
    }).join("\n");

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `sbor_${filterType}_${currentSection}.csv`;
    link.click();

    URL.revokeObjectURL(url);
}

function openComparison() {
    const modal = document.getElementById('comparison-modal');
    modal.style.display = 'block';

    const allItems = getAllItems();
    const select1 = document.getElementById('compare-item-1');
    const select2 = document.getElementById('compare-item-2');

    select1.innerHTML = '<option value="">Select Item 1</option>';
    select2.innerHTML = '<option value="">Select Item 2</option>';

    allItems.forEach((item, index) => {
        const option1 = document.createElement('option');
        option1.value = index;
        option1.textContent = item.name;
        select1.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = index;
        option2.textContent = item.name;
        select2.appendChild(option2);
    });
}

function displayComparisonStats(item, containerId) {
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
                    <span class="comparison-label">${currentSection === 'gear' ? 'Defense:' : 'Attack:'}</span>
                    <span class="comparison-value">${currentSection === 'gear' ?
            (item.defense || 'N/A') : (item.attack || 'N/A')}</span>
                </div>
                ${currentSection === 'gear' ?
            `<div class="comparison-stat">
                    <span class="comparison-label">Dexterity:</span>
                    <span class="comparison-value">${item.dexterity || 'N/A'}</span>
                </div>` : ''}
                <div class="comparison-stat">
                    <span class="comparison-label">Col Value:</span>
                    <span class="comparison-value">${item.colValue !== null ? item.colValue.toLocaleString() : 'TBD'}</span>
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

function compareItems(item1, item2) {
    if (!item1 || !item2) return;

    const resultDiv = document.getElementById('comparison-result');
    const analysisDiv = document.getElementById('comparison-analysis');
    resultDiv.style.display = 'block';

    let analysis = [];

    const attack1 = parseFloat(item1.attack) || 0;
    const attack2 = parseFloat(item2.attack) || 0;
    if (attack1 > attack2) {
        analysis.push(`✓ ${item1.name} has higher attack (${attack1} vs ${attack2})`);
    } else if (attack2 > attack1) {
        analysis.push(`✓ ${item2.name} has higher attack (${attack2} vs ${attack1})`);
    }

    const col1 = item1.colValue || 0;
    const col2 = item2.colValue || 0;
    if (col1 > col2) {
        analysis.push(`✓ ${item1.name} has higher col value (${col1.toLocaleString()} vs ${col2.toLocaleString()})`);
    } else if (col2 > col1) {
        analysis.push(`✓ ${item2.name} has higher col value (${col2.toLocaleString()} vs ${col1.toLocaleString()})`);
    }

    if (attack1 > 0 && attack2 > 0 && col1 > 0 && col2 > 0) {
        const value1 = col1 / attack1;
        const value2 = col2 / attack2;
        if (value1 < value2) {
            analysis.push(`✓ ${item1.name} is better value (${Math.round(value1)} col per attack point vs ${Math.round(value2)})`);
        } else if (value2 < value1) {
            analysis.push(`✓ ${item2.name} is better value (${Math.round(value2)} col per attack point vs ${Math.round(value1)})`);
        }
    }

    analysisDiv.innerHTML = analysis.join('<br>');
}

function calculateBulkSelling() {
    const colValue = parseInt(document.getElementById('calc-col-value').value) || 0;
    const quantity = parseInt(document.getElementById('calc-quantity').value) || 1;

    if (colValue === 0) {
        alert('Please enter a col value');
        return;
    }

    const baseResale = Math.floor(colValue * 0.35 * quantity);
    const vmResale = Math.floor(colValue * 0.45 * quantity);
    const vmBonus = vmResale - baseResale;
    const totalCol = colValue * quantity;

    document.getElementById('calc-base-resale').textContent = baseResale.toLocaleString();
    document.getElementById('calc-vm-resale').textContent = vmResale.toLocaleString();
    document.getElementById('calc-vm-bonus').textContent = vmBonus.toLocaleString();
    document.getElementById('calc-total-col').textContent = totalCol.toLocaleString();

    const breakpoints = [1, 5, 10, 25, 50, 100];
    const breakpointsHTML = breakpoints.map(qty => {
        const base = Math.floor(colValue * 0.35 * qty);
        const vm = Math.floor(colValue * 0.45 * qty);
        return `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-weight: 600;">×${qty}:</span>
                        <span>Base: ${base.toLocaleString()} | VM: ${vm.toLocaleString()}</span>
                    </div>
                `;
    }).join('');

    document.getElementById('calc-breakpoints').innerHTML = breakpointsHTML;
    document.getElementById('calculator-results').style.display = 'block';
}

// Event Listeners
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const section = tab.dataset.section;

        document.getElementById('calculator-section').style.display = 'none';
        document.getElementById('subcategory-selector').style.display = 'none';
        document.querySelector('.stats-grid').style.display = section === 'calculator' ? 'none' : 'grid';
        document.getElementById('category-progress-section').style.display = section === 'calculator' ? 'none' : 'block';
        document.querySelector('.controls').style.display = section === 'calculator' ? 'none' : 'flex';
        document.querySelector('.table-container').style.display = section === 'calculator' ? 'none' : 'block';

        if (section === 'calculator') {
            document.getElementById('calculator-section').style.display = 'block';
        } else {
            currentSection = section;
            document.getElementById('subcategory-selector').style.display = 'block';

            // Update table header based on section
            const statHeader = document.getElementById('stat-header');
            if (section === 'gear') {
                statHeader.textContent = 'Defense / Dexterity';
            } else {
                statHeader.textContent = 'Attack';
            }

            // Update subcategory dropdown options
            const subcategoryFilter = document.getElementById('main-subcategory-filter');
            if (section === 'weapons') {
                subcategoryFilter.innerHTML = `
                            <option value="one-handed">One-Handed</option>
                            <option value="two-handed">Two-Handed</option>
                            <option value="rapier">Rapier</option>
                            <option value="dagger">Dagger</option>
                            <option value="melee">Melee</option>
                        `;
                currentSubcategory = 'one-handed';
            } else if (section === 'gear') {
                subcategoryFilter.innerHTML = `
                            <option value="armor">Armor</option>
                            <option value="upper-headwear">Upper Headwear</option>
                            <option value="lower-headwear">Lower Headwear</option>
                            <option value="shields">Shields</option>
                        `;
                currentSubcategory = 'armor';
            }

            const categoryFilter = document.getElementById('category-filter');
            categoryFilter.innerHTML = '<option value="all">All Items</option>';
            currentCategory = 'all';

            updateStats();
            filterItems();
        }
    });
});

document.getElementById('main-subcategory-filter').addEventListener('change', (e) => {
    currentSubcategory = e.target.value;
    currentCategory = 'specific';
    filterItems();
});

document.getElementById('search-input').addEventListener('input', filterItems);
document.getElementById('category-filter').addEventListener('change', (e) => {
    currentCategory = e.target.value;
    filterItems();
});
document.getElementById('ownership-filter').addEventListener('change', filterItems);
document.getElementById('sort-filter').addEventListener('change', filterItems);
document.getElementById('obtain-filter').addEventListener('change', filterItems);
document.getElementById('skill-min').addEventListener('input', filterItems);
document.getElementById('skill-max').addEventListener('input', filterItems);
document.getElementById('col-min').addEventListener('input', filterItems);
document.getElementById('col-max').addEventListener('input', filterItems);

document.getElementById('export-button').addEventListener('click', () => exportCSV('category'));
document.getElementById('export-owned-button').addEventListener('click', () => exportCSV('owned'));
document.getElementById('export-missing-button').addEventListener('click', () => exportCSV('missing'));

document.getElementById('compare-button').addEventListener('click', openComparison);
document.getElementById('close-comparison').addEventListener('click', () => {
    document.getElementById('comparison-modal').style.display = 'none';
});

document.getElementById('compare-item-1').addEventListener('change', (e) => {
    const allItems = getAllItems();
    const item = allItems[e.target.value];
    displayComparisonStats(item, 'comparison-stats-1');

    const item2Index = document.getElementById('compare-item-2').value;
    if (item2Index) {
        compareItems(item, allItems[item2Index]);
    }
});

document.getElementById('compare-item-2').addEventListener('change', (e) => {
    const allItems = getAllItems();
    const item = allItems[e.target.value];
    displayComparisonStats(item, 'comparison-stats-2');

    const item1Index = document.getElementById('compare-item-1').value;
    if (item1Index) {
        compareItems(allItems[item1Index], item);
    }
});

document.getElementById('calculate-button').addEventListener('click', calculateBulkSelling);

window.addEventListener('click', (e) => {
    const modal = document.getElementById('comparison-modal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Initialize
updateStats();
filterItems();