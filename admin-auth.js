let currentPinEntry = "";
let isLocked = true;

window.addEventListener('keydown', (e) => {
    if (!isLocked) return;
    if (e.key >= '0' && e.key <= '9') pressKey(e.key);
    else if (e.key === 'Enter') pressKey('OK');
    else if (e.key === 'Backspace' || e.key === 'Escape') pressKey('C');
});

function pressKey(key) {
    if (key === 'C') {
        currentPinEntry = "";
    } else if (key === 'OK') {
        // Retrieve passcode from DataMgr (logic-data.js)
        const storedPass = DataMgr.getPasscode ? DataMgr.getPasscode() : "0000";
        if (currentPinEntry === storedPass) { 
            document.getElementById('admin-lock-screen').style.display = 'none'; 
            isLocked = false; 
        } else { 
            alert("Wrong PIN"); 
            currentPinEntry = ""; 
        }
    } else {
        if (currentPinEntry.length < 4) currentPinEntry += key;
        if (currentPinEntry.length === 4) setTimeout(() => pressKey('OK'), 200);
    }
    updatePinDisplay();
}

function updatePinDisplay() { 
    const dots = document.getElementById('pin-dots');
    if(dots) dots.innerText = "•".repeat(currentPinEntry.length); 
}

function exitToTerminal() {
    window.location.href = 'index.html';
}

function changePin() {
    const oldPinInput = document.getElementById('old-pin-input');
    const newPinInput = document.getElementById('new-pin-input');
    const oldPin = oldPinInput.value;
    const newPin = newPinInput.value;

    const currentStoredPin = DataMgr.getPasscode ? DataMgr.getPasscode() : "0000";

    if (oldPin !== currentStoredPin) {
        alert("Verification Failed: Current PIN is incorrect.");
        return;
    }

    if (newPin.length !== 4 || isNaN(newPin)) {
        alert("Invalid PIN: New PIN must be exactly 4 digits.");
        return;
    }

    // Save to DataMgr
    if (DataMgr.savePasscode) {
        DataMgr.savePasscode(newPin);
    } else {
        // Fallback if DataMgr doesn't have the method yet
        localStorage.setItem('pos_admin_passcode', newPin);
    }

    alert("PIN successfully changed!");
    oldPinInput.value = "";
    newPinInput.value = "";
}