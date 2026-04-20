/**
 * Media Manager Logic
 * Handles image selection, Base64 conversion, and linking to items.
 */

let selectedBase64 = null;

// Updates the image preview box inside the Product Editor
function setEditorPreview(base64) {
    const previewBox = document.getElementById('image-preview-container');
    const hiddenInput = document.getElementById('item-image-data');
    const removeBtn = document.getElementById('remove-img-btn');

    if (base64) {
        if (previewBox) {
            previewBox.innerHTML = `<img src="${base64}" style="max-width:100%; max-height:120px; border-radius:8px; border:2px solid #e2e8f0; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">`;
            previewBox.style.display = 'flex';
        }
        if (hiddenInput) hiddenInput.value = base64;
        if (removeBtn) removeBtn.style.display = 'block';
    } else {
        if (previewBox) {
            previewBox.innerHTML = '<span style="color:#94a3b8; font-size:0.8rem; font-weight:600;">NO IMAGE LINKED</span>';
            previewBox.style.display = 'flex';
        }
        if (hiddenInput) hiddenInput.value = '';
        if (removeBtn) removeBtn.style.display = 'none';
    }
}

// Triggered when a new file is chosen in the editor
function handleEditorImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        setEditorPreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Clears the image from the item currently being edited
function removeEditorImage() {
    if (confirm("Permanently remove this image from the item?")) {
        setEditorPreview(null);
        // Ensure the hidden input is cleared so the save doesn't keep the old image
        const hiddenInput = document.getElementById('item-image-data');
        if (hiddenInput) hiddenInput.value = '';
    }
}

// Populates the dropdown with all existing inventory items
function populateMediaDropdown() {
    const select = document.getElementById('media-item-select');
    if (!select) return;

    const inventory = DataMgr.getInventory();
    select.innerHTML = '<option value="">Select Item...</option>';
    
    inventory.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = item.name;
        select.appendChild(opt);
    });
}

// Reads the file and shows a preview for the standalone media tool
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        selectedBase64 = e.target.result;
        const preview = document.getElementById('upload-preview');
        preview.innerHTML = `<img src="${selectedBase64}" style="max-width:100%; max-height:150px; border-radius:8px;"/>`;
    };
    reader.readAsDataURL(file);
}

// Saves the image string into the item's data
function saveItemPhoto() {
    const itemId = document.getElementById('media-item-select').value;
    
    if (!itemId) return alert("Please select an item first.");
    if (!selectedBase64) return alert("Please choose a photo first.");

    const inventory = DataMgr.getInventory();
    const itemIndex = inventory.findIndex(i => String(i.id) === String(itemId));

    if (itemIndex !== -1) {
        inventory[itemIndex].image = selectedBase64;
        DataMgr.saveInventory(inventory);
        
        alert(`Photo linked to ${inventory[itemIndex].name}!`);
        
        // Reset UI
        selectedBase64 = null;
        const preview = document.getElementById('upload-preview');
        if(preview) preview.innerHTML = '<span style="color:#94a3b8; font-size:0.8rem;">No Image Selected</span>';
        renderInventoryTable();
    }
}