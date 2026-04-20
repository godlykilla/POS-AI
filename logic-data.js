const DataMgr = {
    getInventory() {
        return JSON.parse(localStorage.getItem('pos_inventory')) || [];
    },
    saveInventory(data) {
        localStorage.setItem('pos_inventory', JSON.stringify(data));
    },
    getCategories() {
        return JSON.parse(localStorage.getItem('pos_categories')) || ["Standard", "Combos"];
    },
    saveCategories(cats) {
        localStorage.setItem('pos_categories', JSON.stringify(cats));
    },
    saveOrUpdateItem(item) {
        let inv = this.getInventory();
        const existingIndex = inv.findIndex(i => String(i.id) === String(item.id));
        if (existingIndex > -1) {
            inv[existingIndex] = item;
        } else {
            inv.push(item);
        }
        this.saveInventory(inv);
    },
    getNextOrderNumber() {
        const today = new Date().toLocaleDateString();
        let orderData = JSON.parse(localStorage.getItem('pos_order_counter')) || { date: today, count: 0 };
        
        if (orderData.date !== today) {
            orderData = { date: today, count: 1 };
        } else {
            orderData.count++;
        }
        
        localStorage.setItem('pos_order_counter', JSON.stringify(orderData));
        return orderData.count;
    },
    getLogs() {
        return JSON.parse(localStorage.getItem('pos_sales_log')) || [];
    },
    saveLog(cart, total, orderNum) {
        const logs = this.getLogs();
        const newEntry = {
            id: Date.now(),
            orderNumber: orderNum,
            timestamp: new Date().toLocaleString(),
            total: total,
            status: 'preparing',
            cart: JSON.parse(JSON.stringify(cart))
        };
        logs.push(newEntry);
        localStorage.setItem('pos_sales_log', JSON.stringify(logs));
        return newEntry;
    },
    updateLogStatus(logId, newStatus) {
        const logs = this.getLogs();
        const idx = logs.findIndex(l => String(l.id) === String(logId));
        if (idx > -1) {
            logs[idx].status = newStatus;
            localStorage.setItem('pos_sales_log', JSON.stringify(logs));
        }
    },
    deleteLog(logId) {
        const logs = this.getLogs().filter(l => String(l.id) !== String(logId));
        localStorage.setItem('pos_sales_log', JSON.stringify(logs));
    },
    clearAllLogs() {
        localStorage.setItem('pos_sales_log', JSON.stringify([]));
    },
    // Security logic
    getPasscode() {
        return localStorage.getItem('pos_admin_passcode') || "1234";
    },
    setPasscode(newPin) {
        localStorage.setItem('pos_admin_passcode', newPin);
    }
};