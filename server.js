const net = require('net');
const http = require('http');

const PRINTER_IP = '192.168.1.220';
const PRINTER_PORT = 9100;

http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const client = new net.Socket();
            client.connect(PRINTER_PORT, PRINTER_IP, () => {
                client.write(body);
                client.end();
            });
            res.end('Sent');
        });
    } else { res.end('Ready'); }
}).listen(3000);

console.log("Printer Proxy running on http://localhost:3000");