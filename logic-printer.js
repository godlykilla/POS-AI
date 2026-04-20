const PrinterLogic = {
    async printReceipt(cart, totalStr, orderNum) {
        const INIT = "\x1b\x40";
        const CENTER = "\x1b\x61\x01";
        const LEFT = "\x1b\x61\x00";
        const BOLD_ON = "\x1b\x45\x01";
        const BOLD_OFF = "\x1b\x45\x00";
        const DOUBLE_ON = "\x1b\x21\x30"; 
        const DOUBLE_OFF = "\x1b\x21\x00";
        const CUT = "\x1d\x56\x01";

        let receipt = INIT + CENTER + DOUBLE_ON + `ORDER #${orderNum}\n` + DOUBLE_OFF;
        receipt += new Date().toLocaleString() + "\n";
        receipt += "--------------------------------\n\n" + LEFT;

        cart.forEach(item => {
            let p = parseFloat(item.price);
            if (item.appliedModifiers) item.appliedModifiers.forEach(m => p += parseFloat(m.price));
            if (item.subItems) item.subItems.forEach(si => (si.selectedMods || []).forEach(m => p += parseFloat(m.price)));
            receipt += BOLD_ON + `${item.name.padEnd(20)} EUR ${p.toFixed(2)}\n` + BOLD_OFF;
            if(item.subItems) {
                item.subItems.forEach(si => {
                    receipt += `  - ${si.name}\n`;
                    (si.selectedMods || []).forEach(m => receipt += `    + ${m.name}\n`);
                });
            } else if(item.appliedModifiers) {
                item.appliedModifiers.forEach(m => receipt += `  + ${m.name}\n`);
            }
        });

        const cleanTotal = totalStr.replace(/[^\d.,]/g, '');
        receipt += "\n--------------------------------\n";
        receipt += DOUBLE_ON + `TOTAL: EUR ${cleanTotal.padStart(15)}\n` + DOUBLE_OFF;
        receipt += "\n\n\n\n" + CUT;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);

        try {
            const response = await fetch('http://localhost:3000', { 
                method: 'POST',
                body: receipt,
                signal: controller.signal
            });
            clearTimeout(timeout);
            return response.ok;
        } catch (err) {
            return false;
        }
    }
}