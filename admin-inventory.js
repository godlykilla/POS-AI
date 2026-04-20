function renderInventoryTable() {
    const invList = document.getElementById('inventory-list');
    if(!invList) return;
    invList.innerHTML = '';
    
    DataMgr.getInventory().forEach(item => {
        const row = document.createElement('div');
        row.className = 'inventory-row';
        row.setAttribute('data-id', item.id);
        
        // Dim the row if the item is disabled
        if (item.disabled) {
            row.style.opacity = "0.5";
            row.style.filter = "grayscale(1)";
        }
        
        const imgHtml = item.image 
            ? `<img src="${item.image}" style="width:40px; height:40px; border-radius:6px; object-fit:cover; border:1px solid #e2e8f0;">` 
            : `<div class="no-img-thumb" style="width:40px; height:40px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#cbd5e1; border-radius:6px; font-size:10px; border:1px dashed #cbd5e1; text-align:center; line-height:1;">NO<br>IMG</div>`;

        row.innerHTML = `
            <div class="drag-handle" style="cursor:grab; color:#cbd5e1; display:flex; align-items:center; justify-content:center;">☰</div>
            <div style="display:flex; align-items:center; justify-content:center;">${imgHtml}</div>
            <div style="display:flex; flex-direction:column; justify-content:center; overflow:hidden;">
                <strong style="color:#1e293b; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${item.name}</strong>
                ${item.type === 'combo' ? '<span style="font-size:0.6rem; color:#10b981; font-weight:800; text-transform:uppercase;">Combo</span>' : ''}
            </div>
            <div style="display:flex; align-items:center;"><span class="badge">${item.category || 'Standard'}</span></div>
            <div style="display:flex; align-items:center; font-family:monospace; font-weight:700; color:#475569;">€${parseFloat(item.price || 0).toFixed(2)}</div>
            <div style="display:flex; align-items:center; justify-content:flex-end; gap:8px;">
                <button class="btn-action" style="width:auto; padding:6px 10px; font-size:0.65rem; background:${item.disabled ? '#10b981' : '#64748b'};" onclick="toggleItemStatus('${item.id}')">
                    ${item.disabled ? 'ENABLE' : 'DISABLE'}
                </button>
                <button class="btn-action" style="width:auto; padding:6px 10px; font-size:0.65rem; background:#1e293b;" onclick="editItem('${item.id}')">EDIT</button>
                <button class="btn-action" style="width:auto; padding:6px 10px; font-size:0.65rem; background:#fee2e2; color:#ef4444;" onclick="deleteItem('${item.id}')">DEL</button>
            </div>`;
        invList.appendChild(row);
    });

    if (window.Sortable) {
        Sortable.create(invList, { animation: 150, handle: '.drag-handle', onEnd: () => {
            const newOrder = Array.from(document.querySelectorAll('.inventory-row')).map(el => 
                DataMgr.getInventory().find(i => String(i.id) === String(el.getAttribute('data-id')))
            );
            DataMgr.saveInventory(newOrder);
        }});
    }
}

// New function to handle the status toggle
function toggleItemStatus(id) {
    const inv = DataMgr.getInventory();
    const item = inv.find(i => String(i.id) === String(id));
    if (item) {
        item.disabled = !item.disabled;
        DataMgr.saveInventory(inv);
        renderInventoryTable();
    }
}

function renderComboChecklist() {
    const inv = DataMgr.getInventory().filter(i => i.type !== 'combo');
    const container = document.getElementById('combo-checklist');
    if (!container) return;
    
    container.className = "combo-grid-container";
    container.innerHTML = inv.map(i => `
        <label class="combo-item-card" id="card-${i.id}">
            <input type="checkbox" class="c-check" value="${i.id}" 
                   onchange="document.getElementById('card-${i.id}').classList.toggle('selected', this.checked)">
            <span class="combo-item-name">${i.name}</span>
        </label>
    `).join('');
}

function toggleFormMode(type) {
    const std = document.getElementById('standard-extras');
    const cmb = document.getElementById('combo-extras');
    if (std) std.style.display = type === 'standard' ? 'block' : 'none';
    if (cmb) cmb.style.display = type === 'combo' ? 'block' : 'none';
    if (type === 'combo') renderComboChecklist();
}

function prepareForm(type) {
    document.getElementById('editor-ui').style.display = 'block';
    document.getElementById('edit-id').value = "";
    document.getElementById('prod-name').value = "";
    document.getElementById('prod-price').value = "";
    document.getElementById('prod-type').value = type;
    document.getElementById('mod-inputs').innerHTML = "";
    
    if (window.setEditorPreview) setEditorPreview(null);
    
    updateCategoryDropdowns();
    toggleFormMode(type);
}

function editItem(id) {
    const item = DataMgr.getInventory().find(i => String(i.id) === String(id));
    if (!item) return;
    document.getElementById('editor-ui').style.display = 'block';
    document.getElementById('edit-id').value = item.id;
    document.getElementById('prod-name').value = item.name;
    document.getElementById('prod-price').value = item.price;
    document.getElementById('prod-type').value = item.type || 'standard';
    
    if (window.setEditorPreview) {
        setEditorPreview(item.image || null);
    }

    updateCategoryDropdowns();
    document.getElementById('prod-cat').value = item.category || 'Standard';
    toggleFormMode(item.type || 'standard');
    
    if (item.type !== 'combo') {
        document.getElementById('mod-inputs').innerHTML = "";
        (item.modifiers || []).forEach(m => addModUI(m.name, m.price));
    } else {
        renderComboChecklist();
        setTimeout(() => {
            const checks = document.querySelectorAll('.c-check');
            checks.forEach(c => { 
                if (item.comboItems?.includes(c.value)) {
                    c.checked = true;
                    const card = document.getElementById(`card-${c.value}`);
                    if (card) card.classList.add('selected');
                }
            });
        }, 50);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function saveData() {
    const id = document.getElementById('edit-id').value || Date.now().toString();
    const type = document.getElementById('prod-type').value;
    const imageVal = document.getElementById('item-image-data')?.value || "";
    
    const item = {
        id, type,
        name: document.getElementById('prod-name').value,
        price: document.getElementById('prod-price').value,
        category: document.getElementById('prod-cat').value,
        image: imageVal
    };

    if (type === 'standard') {
        item.modifiers = Array.from(document.querySelectorAll('.mod-row')).map(r => ({
            name: r.querySelector('.m-n').value, price: r.querySelector('.m-p').value
        })).filter(m => m.name);
    } else {
        item.comboItems = Array.from(document.querySelectorAll('.c-check:checked')).map(c => c.value);
    }

    DataMgr.saveOrUpdateItem(item);
    document.getElementById('editor-ui').style.display = 'none';
    renderInventoryTable();
}

function addModUI(n='', p='') {
    const div = document.createElement('div');
    div.className = 'mod-row';
    div.style = "display:flex; gap:5px; margin-bottom:5px;";
    div.innerHTML = `<input type="text" class="m-n" placeholder="Mod Name" value="${n}" style="flex:2; padding:8px; border:1px solid #e2e8f0; border-radius:6px;">
                     <input type="number" class="m-p" placeholder="Price" value="${p}" style="flex:1; padding:8px; border:1px solid #e2e8f0; border-radius:6px;">
                     <button onclick="this.parentElement.remove()" style="color:red; background:none; border:none; cursor:pointer; font-size:1.2rem;">×</button>`;
    document.getElementById('mod-inputs').appendChild(div);
}

function updateCategoryDropdowns() {
    const cats = DataMgr.getCategories();
    const dropdown = document.getElementById('prod-cat');
    if(dropdown) dropdown.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
    
    const chips = document.getElementById('category-list-chips');
    if(chips) chips.innerHTML = cats.map(c => `
        <span class="badge" style="margin-right:5px; display:inline-flex; align-items:center; gap:5px; padding: 8px 12px;">
            ${c} <span onclick="deleteCategory('${c}')" style="cursor:pointer; opacity:0.5; ${c === 'Standard' ? 'display:none' : ''}">×</span>
        </span>`).join('');
}

function addCategory() {
    const n = document.getElementById('new-cat-name').value.trim();
    if (n) {
        const cats = DataMgr.getCategories();
        if(!cats.includes(n)) { cats.push(n); DataMgr.saveCategories(cats); updateCategoryDropdowns(); }
        document.getElementById('new-cat-name').value = "";
    }
}

function deleteCategory(name) {
    if(name === "Standard") return;
    if(confirm(`Delete category "${name}"? Items will move to Standard.`)) {
        let cats = DataMgr.getCategories().filter(c => c !== name);
        DataMgr.saveCategories(cats);
        let inv = DataMgr.getInventory();
        inv.forEach(i => { if(i.category === name) i.category = "Standard"; });
        DataMgr.saveInventory(inv);
        updateCategoryDropdowns();
        renderInventoryTable();
    }
}

function deleteItem(id) { 
    if(confirm("Delete item?")) { 
        DataMgr.saveInventory(DataMgr.getInventory().filter(i => String(i.id) !== String(id))); 
        renderInventoryTable(); 
    } 
}