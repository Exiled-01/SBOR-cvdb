// calculator.js
export function setupCalculatorSearch(itemInputId, colInputId, allItems) {
    const itemInput = document.getElementById(itemInputId);
    const colInput = document.getElementById(colInputId);

    // Wrap input in relative container if not already
    let wrapper = itemInput.parentElement;
    if (!wrapper.classList.contains('comparison-container')) {
        wrapper = document.createElement('div');
        wrapper.className = 'comparison-container';
        itemInput.parentNode.insertBefore(wrapper, itemInput);
        wrapper.appendChild(itemInput);
    }

    // Create dropdown container
    let container = document.createElement('div');
    container.className = 'comparison-options';
    wrapper.appendChild(container);

    // Position dropdown using getBoundingClientRect
    function positionDropdown() {
        const rect = itemInput.getBoundingClientRect();
        container.style.position = 'fixed';
        container.style.top = `${rect.bottom + 2}px`;
        container.style.left = `${rect.left}px`;
        container.style.width = `${rect.width}px`;
        container.style.zIndex = 1000;
    }

    itemInput.addEventListener('input', () => {
        const value = itemInput.value.toLowerCase();
        container.innerHTML = '';
        if (!value) return container.style.display = 'none';

        const matches = allItems.filter(item => item.name.toLowerCase().includes(value));

        matches.forEach(item => {
            const div = document.createElement('div');
            div.textContent = item.name;
            div.addEventListener('click', () => {
                itemInput.value = item.name;
                colInput.value = item.colValue ?? 0;
                container.innerHTML = '';
                container.style.display = 'none';
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

    // Reposition dropdown on resize or scroll
    window.addEventListener('resize', positionDropdown);
    itemInput.closest('.modal-content')?.addEventListener('scroll', positionDropdown);

    document.addEventListener('click', e => {
        if (!container.contains(e.target) && e.target !== itemInput) {
            container.innerHTML = '';
            container.style.display = 'none';
        }
    });
}

export function setupCalculatorButton(buttonId, colInputId, quantityInputId) {
    const button = document.getElementById(buttonId);
    button.addEventListener('click', calculateBulkSelling);

    function calculateBulkSelling() {
        const colValue = parseInt(document.getElementById(colInputId).value) || 0;
        const quantity = parseInt(document.getElementById(quantityInputId).value) || 1;

        if (colValue === 0) {
            alert('Please enter a col value');
            return;
        }

        // Total col for all items
        const totalCol = colValue * quantity;

        // Resale calculations based on totalCol
        const baseResale = Math.floor(totalCol * 0.35);
        const vmResale = Math.floor(totalCol * 0.45);
        const vmBonus = vmResale - baseResale;

        // Display results
        document.getElementById('calc-base-resale').textContent = baseResale.toLocaleString();
        document.getElementById('calc-vm-resale').textContent = vmResale.toLocaleString();
        document.getElementById('calc-vm-bonus').textContent = vmBonus.toLocaleString();
        document.getElementById('calc-total-col').textContent = totalCol.toLocaleString();

        // Quantity breakpoints
        const breakpoints = [1, 5, 10, 25, 50, 100];
        const breakpointsHTML = breakpoints.map(qty => {
            const total = colValue * qty;
            const base = Math.floor(total * 0.35);
            const vm = Math.floor(total * 0.45);
            const bonus = vm - base;
            return `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-weight: 600;">×${qty}:</span>
                    <span>Base: ${base.toLocaleString()} | VM: ${vm.toLocaleString()} | Bonus: ${bonus.toLocaleString()}</span>
                </div>
            `;
        }).join('');

        document.getElementById('calc-breakpoints').innerHTML = breakpointsHTML;
        document.getElementById('calculator-results').style.display = 'block';
    }
}
