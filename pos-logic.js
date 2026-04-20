    let currentCart = [];
    let configQueue = []; 
    let currentConfigIndex = 0;
    let configuredCombo = null; 
    let tempSelectedMods = [];

    function initTerminal() {
    const wrapper = document.getElementById('category-wrapper');
    if (!wrapper) return;
    wrapper.innerHTML = '';
    
    // Filter inventory to only show enabled items
    const items = DataMgr.getInventory().filter(i => !i.disabled);
    const cats = DataMgr.getCategories();

    cats.forEach(cat => {
        const catItems = items.filter(i => i.category === cat);
        if(catItems.length === 0) return;
        
        const section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = `<div class="category-title">${cat}</div><div class="cat-grid" id="grid-${cat.replace(/\s/g, '')}"></div>`;
        wrapper.appendChild(section);
        
        catItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'product-card';
            if (item.image) card.style.backgroundImage = `url('${item.image}')`;
            else card.classList.add('no-image');
            card.innerHTML = `<h3>${item.name}</h3><div class="price-tag">EUR ${parseFloat(item.price).toFixed(2)}</div>`;
            card.onclick = () => handleProductClick(item);
            document.getElementById(`grid-${cat.replace(/\s/g, '')}`).appendChild(card);
        });
    });
}

    function handleProductClick(item) {
        if (item.type === 'combo') {
            const inv = DataMgr.getInventory();
            const subItems = (item.comboItems || []).map(id => inv.find(i => String(i.id) === String(id))).filter(Boolean);
            configQueue = subItems.filter(si => si.modifiers && si.modifiers.length > 0).map(si => ({...si, selectedMods: []}));
            configuredCombo = { ...item, subItems: subItems.map(si => ({ ...si, selectedMods: [] })) };
            if (configQueue.length > 0) { currentConfigIndex = 0; openConfigStep(); } 
            else { addComboToCart(configuredCombo); }
        } else {
            if (item.modifiers && item.modifiers.length > 0) {
                configQueue = [{ ...item, selectedMods: [] }];
                currentConfigIndex = 0; configuredCombo = null; openConfigStep();
            } else { addToCart(item, []); }
        }
    }

    function openConfigStep() {
        const item = configQueue[currentConfigIndex];
        tempSelectedMods = [];
        document.getElementById('mod-step').innerText = `STEP ${currentConfigIndex + 1} OF ${configQueue.length}`;
        document.getElementById('mod-title').innerText = item.name;
        const list = document.getElementById('mod-options-list');
        list.innerHTML = '';
        (item.modifiers || []).forEach(mod => {
            const div = document.createElement('div');
            div.className = 'option-pill';
            div.innerHTML = `<span>${mod.name}</span><span>+EUR ${parseFloat(mod.price).toFixed(2)}</span>`;
            div.onclick = () => { 
                div.classList.toggle('selected'); 
                const i = tempSelectedMods.findIndex(m => m.name === mod.name); 
                if(i > -1) tempSelectedMods.splice(i,1); else tempSelectedMods.push(mod); 
            };
            list.appendChild(div);
        });
        document.getElementById('mod-modal').style.display = 'flex';
    }

    function nextStep() {
        configQueue[currentConfigIndex].selectedMods = [...tempSelectedMods];
        if (currentConfigIndex < configQueue.length - 1) { currentConfigIndex++; openConfigStep(); } 
        else { finalizeConfiguration(); }
    }

    function finalizeConfiguration() {
        if (configuredCombo) {
            configQueue.forEach(qItem => {
                const target = configuredCombo.subItems.find(si => si.id === qItem.id);
                if (target) target.selectedMods = qItem.selectedMods;
            });
            addComboToCart(configuredCombo);
        } else { addToCart(configQueue[0], configQueue[0].selectedMods); }
        document.getElementById('mod-modal').style.display = 'none';
    }

    function addToCart(item, mods) { currentCart.push({ ...item, appliedModifiers: [...mods] }); renderCart(); }
    function addComboToCart(combo) { currentCart.push(JSON.parse(JSON.stringify(combo))); renderCart(); }

    function renderCart() {
    const list = document.getElementById('cart-list');
    if (!list) return;
    list.innerHTML = '';
    let total = 0;

    currentCart.forEach((item, idx) => {
        let itemTotalPrice = parseFloat(item.price);
        let modsHtml = '';

        // 1. Standard item modifiers (e.g., Small Fries + Mayo)
        if (item.appliedModifiers) {
            item.appliedModifiers.forEach(m => {
                const mPrice = parseFloat(m.price);
                itemTotalPrice += mPrice;
                modsHtml += `
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:gray; padding-left:10px;">
                        <span>+ ${m.name}</span>
                        <span>EUR ${mPrice.toFixed(2)}</span>
                    </div>`;
            });
        }

        // 2. Combo sub-items (Names only) and their extra modifiers (Price included)
        if (item.subItems) {
            item.subItems.forEach(si => {
                // Show sub-item name without adding its individual price to the total
                modsHtml += `
                    <div style="font-size:0.75rem; color:blue; padding-left:5px; margin-top:2px;">
                        • ${si.name}
                    </div>`;

                // Add and show only the prices of modifiers chosen for these sub-items
                (si.selectedMods || []).forEach(sm => {
                    const smPrice = parseFloat(sm.price);
                    itemTotalPrice += smPrice;
                    modsHtml += `
                        <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:gray; padding-left:15px;">
                            <span>+ ${sm.name}</span>
                            <span>EUR ${smPrice.toFixed(2)}</span>
                        </div>`;
                });
            });
        }

        total += itemTotalPrice;

        list.innerHTML += `
            <div style="margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:8px;">
                <div style="display:flex; justify-content:space-between; font-weight:bold;">
                    <span>${item.name}</span>
                    <span>EUR ${itemTotalPrice.toFixed(2)}</span>
                </div>
                ${modsHtml}
                <div onclick="removeFromCart(${idx})" style="color:red; cursor:pointer; font-size:0.7rem; margin-top:5px;">Remove</div>
            </div>`;
    });

    document.getElementById('grand-total').innerText = `EUR ${total.toFixed(2)}`;
}

    function removeFromCart(idx) { currentCart.splice(idx, 1); renderCart(); }

    function openPaymentSimulator() {
        if(!currentCart.length) return;
        document.getElementById('pay-total-display').innerText = document.getElementById('grand-total').innerText;
        document.getElementById('payment-modal').style.display = 'flex';
        setTimeout(() => document.getElementById('pay-progress').style.width = '100%', 50);
        
        setTimeout(() => {
            finishSale();
        }, 1600);
    }

    function finishSale() {
        const total = document.getElementById('grand-total').innerText;
        const orderNum = DataMgr.getNextOrderNumber();
        const cartToPrint = JSON.parse(JSON.stringify(currentCart));

        DataMgr.saveLog(currentCart, total, orderNum);
        localStorage.setItem('pos_last_update', Date.now());
        window.dispatchEvent(new Event('storage'));

        PrinterLogic.printReceipt(cartToPrint, total, orderNum)
            .then(success => {
                if (success === false) {
                    alert("⚠️ PRINTER OFFLINE\nOrder sent to kitchen, but the receipt printer could not be reached.");
                }
            })
            .catch(() => {
                alert("⚠️ PRINTER OFFLINE\nOrder sent to kitchen, but the receipt printer could not be reached.");
            });

        currentCart = [];
        renderCart();
        closePaymentModal();
    }

    function closePaymentModal() {
        document.getElementById('payment-modal').style.display = 'none';
        document.getElementById('pay-progress').style.width = '0%';
    }
    window.onload = initTerminal;