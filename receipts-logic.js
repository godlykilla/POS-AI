// Rename this function to renderReceipts to match your HTML
function renderReceipts() {
    const cont = document.getElementById('logs-container');
    if(!cont) return;
    cont.innerHTML = '';
    
    const logs = DataMgr.getLogs();
    if(!logs || logs.length === 0) {
        cont.innerHTML = '<div style="padding:40px; text-align:center; color:#94a3b8;">No sales history available.</div>';
        return;
    }

    logs.slice().reverse().forEach(log => {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.style.cursor = 'pointer';
        entry.style.borderBottom = '1px solid #f1f5f9';
        
        entry.innerHTML = `
            <div style="padding:15px; display:flex; justify-content:space-between; align-items:center;">
                <span>
                    <strong style="color:#1e293b;">Order #${log.orderNumber}</strong> 
                    <small style="color:#64748b; margin-left:10px;">${log.timestamp}</small>
                </span>
                <strong style="color:#10b981; font-family:monospace;">${log.total}</strong>
            </div>`;
        
        const details = document.createElement('div');
        details.className = 'log-details';
        details.style.display = 'none'; 
        
        let receiptContent = log.cart.map(item => {
            let lines = [];
            
            // Main Item
            lines.push(`
                <div style="display:flex; justify-content:space-between; font-weight:700; color:#1e293b;">
                    <span>${item.name}</span>
                    <span>€${parseFloat(item.price).toFixed(2)}</span>
                </div>`);

            // Standard Modifiers
            if (item.appliedModifiers) {
                item.appliedModifiers.forEach(m => {
                    lines.push(`
                        <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b; padding-left:15px;">
                            <span>+ ${m.name}</span>
                            <span>€${parseFloat(m.price).toFixed(2)}</span>
                        </div>`);
                });
            }

            // Sub-Items (Combos)
            if (item.subItems) {
                item.subItems.forEach(si => {
                    lines.push(`
                        <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#475569; padding-left:10px; font-weight:600; margin-top:2px;">
                            <span>- ${si.name}</span>
                            <span>Included</span>
                        </div>`);
                    
                    (si.selectedMods || []).forEach(m => {
                        lines.push(`
                            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#94a3b8; padding-left:25px;">
                                <span>+ ${m.name}</span>
                                <span>€${parseFloat(m.price).toFixed(2)}</span>
                            </div>`);
                    });
                });
            }

            return `<div style="margin-bottom:12px;">${lines.join('')}</div>`;
        }).join('<hr style="border:0; border-top:1px dashed #e2e8f0; margin:10px 0;">');

        details.innerHTML = `
            <div style="padding: 0 15px 20px 15px; background: #f8fafc;">
                <div style="background:white; padding:20px; border-radius:12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border:1px solid #e2e8f0;">
                    <div style="text-align:center; font-weight:900; border-bottom:2px solid #1e293b; margin-bottom:15px; padding-bottom:10px; font-size:0.9rem; color:#1e293b;">
                        RECEIPT SUMMARY
                    </div>
                    <div>${receiptContent}</div>
                    <div style="border-top:2px solid #1e293b; margin-top:15px; padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:800; color:#64748b; font-size:0.8rem;">TOTAL</span>
                        <span style="font-weight:900; font-size:1.2rem; font-family:monospace; color:#1e293b;">${log.total}</span>
                    </div>
                </div>
            </div>`;

        entry.onclick = () => {
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        };

        cont.appendChild(entry);
        cont.appendChild(details);
    });
}