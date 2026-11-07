const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');

const PORT = 3000;


const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
};


function serveStaticFile(res, filePath) {
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}


function handleHash(req, res, body) {
    try {
        const { text } = JSON.parse(body);
        if (typeof text !== 'string') throw new Error('Invalid input');
        const hash = crypto.createHash('md5').update(text, 'utf8').digest('hex');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ hash }));
    } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: err.message }));
    }
}


function handleBenchmark(req, res, body) {
    try {
        const { sizeMB } = JSON.parse(body);
        const bytes = sizeMB * 1024 * 1024;
        
        const buffer = Buffer.alloc(bytes, 'a');
        const start = process.hrtime.bigint();
        const hash = crypto.createHash('md5').update(buffer).digest('hex');
        const end = process.hrtime.bigint();
        const timeNs = Number(end - start);
        const timeMs = timeNs / 1e6;
        const speedMBps = sizeMB / (timeMs / 1000);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            timeMs: timeMs.toFixed(2),
            speedMBps: speedMBps.toFixed(2),
            hash
        }));
    } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: err.message }));
    }
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    
    if (pathname === '/api/hash' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => handleHash(req, res, body));
        return;
    }
    if (pathname === '/api/benchmark' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => handleBenchmark(req, res, body));
        return;
    }

    
    let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
    serveStaticFile(res, filePath);
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    
    const startCmd = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    exec(`${startCmd} http://localhost:${PORT}`);
});