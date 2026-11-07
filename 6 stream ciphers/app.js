const http = require('http');
const { performance } = require('perf_hooks');

function generateBBS(p, q, seed, length = 256) {
    const pBig = BigInt(p);
    const qBig = BigInt(q);
    const sBig = BigInt(seed);
    const M = pBig * qBig;

    let x = (sBig * sBig) % M;
    let sequence = "";

    for (let i = 0; i < length; i++) {
        x = (x * x) % M;
        sequence += (x % 2n).toString();
    }
    return sequence;
}

function rc4Encrypt(key, text) {
    let S = Array.from({ length: 256 }, (_, i) => i);
    let j = 0;

    for (let i = 0; i < 256; i++) {
        j = (j + S[i] + key[i % key.length]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
    }

    let i = 0; j = 0;
    let textBytes = Buffer.from(text, 'utf8');
    let encryptedBytes = [];

    let startTime = performance.now();
    for (let k = 0; k < textBytes.length; k++) {
        i = (i + 1) % 256;
        j = (j + S[i]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
        let K = S[(S[i] + S[j]) % 256];
        encryptedBytes.push(textBytes[k] ^ K); // XOR
    }
    let endTime = performance.now();

    return {
        hex: Buffer.from(encryptedBytes).toString('hex'),
        timeMs: endTime - startTime
    };
}

function rc4Decrypt(key, hexText) {
    let S = Array.from({ length: 256 }, (_, i) => i);
    let j = 0;

    for (let i = 0; i < 256; i++) {
        j = (j + S[i] + key[i % key.length]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
    }

    let i = 0; j = 0;
    let encryptedBytes = Buffer.from(hexText, 'hex');
    let decryptedBytes = [];

    let startTime = performance.now();
    for (let k = 0; k < encryptedBytes.length; k++) {
        i = (i + 1) % 256;
        j = (j + S[i]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
        let K = S[(S[i] + S[j]) % 256];
        decryptedBytes.push(encryptedBytes[k] ^ K); // XOR
    }
    let endTime = performance.now();

    return {
        // Преобразуем расшифрованные байты обратно в читаемый текст
        text: Buffer.from(decryptedBytes).toString('utf8'),
        timeMs: endTime - startTime
    };
}

function benchmarkRC4(key, bytesToGenerate = 1000000) {
    let S = Array.from({ length: 256 }, (_, i) => i);
    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + S[i] + key[i % key.length]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
    }

    let i = 0; j = 0;
    let startTime = performance.now();
    for (let k = 0; k < bytesToGenerate; k++) {
        i = (i + 1) % 256;
        j = (j + S[i]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
        let K = S[(S[i] + S[j]) % 256];
    }
    let endTime = performance.now();
    return { timeMs: endTime - startTime, bytes: bytesToGenerate };
}


const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    if (req.method === 'GET') {
        if (req.url === '/a') {
            res.end(`
                <h2>Главное окно управления</h2>
                <button onclick="window.open('/app1', 'App1', 'width=600,height=450'); 
                                 window.open('/app2', 'App2', 'width=650,height=750');">
                    Открыть Приложения 1 и 2
                </button>
            `);
        } 
        else if (req.url === '/') {
            res.end(`
                <body style="font-family: Arial; padding: 20px;">
                    <h3>Приложение 1: Генератор BBS</h3>
                    <p>Алгоритм BBS. Длина n = 256 бит.</p>
                    <label>p: <input id="p" type="text" value="11"></label><br><br>
                    <label>q: <input id="q" type="text" value="19"></label><br><br>
                    <label>Seed (s): <input id="s" type="text" value="3"></label><br><br>
                    <button onclick="generate()">Сгенерировать ПСП</button>
                    <h4>Результат (256 бит):</h4>
                    <textarea id="res" rows="5" cols="60" readonly></textarea>
                    
                    <script>
                        async function generate() {
                            const p = document.getElementById('p').value;
                            const q = document.getElementById('q').value;
                            const s = document.getElementById('s').value;
                            const response = await fetch('/api/bbs', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ p, q, s })
                            });
                            const data = await response.json();
                            document.getElementById('res').value = data.sequence;
                        }
                    </script>
                </body>
            `);
        } 
        else if (req.url === '/app2') {
            res.end(`
                <body style="font-family: Arial; padding: 20px;">
                    <h3>Приложение 2: Шифратор / Дешифратор RC4</h3>
                    <p>Ключ (n=6): 61, 60, 23, 22, 21, 20</p>
                    
                    <label>Текст для шифрования:</label><br>
                    <textarea id="text" rows="2" cols="60">Произвольный текст для лабораторной работы</textarea><br>
                    <button onclick="encrypt()">Зашифровать</button><br><br>
                    
                    <label>Зашифрованное сообщение (HEX):</label><br>
                    <textarea id="enc" rows="3" cols="60"></textarea><br>
                    <button onclick="decrypt()">Расшифровать сообщение из HEX</button><br><br>
                    
                    <label>Расшифрованное сообщение (Оригинал):</label><br>
                    <textarea id="dec" rows="2" cols="60" readonly style="background-color:#f0f0f0;"></textarea><br><br>

                    <hr>
                    <button onclick="benchmark()">Оценить скорость генерации ПСП (1 МБ)</button>
                    
                    <div id="speed" style="color: blue; font-weight: bold; margin-top:15px; white-space: pre-wrap;"></div>

                    <script>
                        async function encrypt() {
                            const text = document.getElementById('text').value;
                            const response = await fetch('/api/rc4', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'encrypt', text })
                            });
                            const data = await response.json();
                            document.getElementById('enc').value = data.hex;
                            document.getElementById('speed').innerText = 
                                "Время шифрования: " + data.timeMs.toFixed(4) + " мс";
                        }

                        async function decrypt() {
                            const hexText = document.getElementById('enc').value;
                            if(!hexText) { alert('Сначала зашифруйте текст!'); return; }
                            
                            const response = await fetch('/api/rc4', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'decrypt', text: hexText })
                            });
                            const data = await response.json();
                            document.getElementById('dec').value = data.text;
                            document.getElementById('speed').innerText = 
                                "Время расшифрования: " + data.timeMs.toFixed(4) + " мс";
                        }

                        async function benchmark() {
                            const response = await fetch('/api/rc4', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'benchmark' })
                            });
                            const data = await response.json();
                            let mbPerSec = (data.bytes / 1024 / 1024) / (data.timeMs / 1000);
                            document.getElementById('speed').innerText = 
                                "Генерация 1 МБ ПСП заняла: " + data.timeMs.toFixed(2) + " мс\\n" +
                                "Скорость: " + mbPerSec.toFixed(2) + " МБ/сек";
                        }
                    </script>
                </body>
            `);
        } else {
            res.writeHead(404);
            res.end("Not Found");
        }
    } 
    else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const data = JSON.parse(body);
            res.setHeader('Content-Type', 'application/json');

            if (req.url === '/api/bbs') {
                try {
                    const sequence = generateBBS(data.p, data.q, data.s, 256);
                    res.end(JSON.stringify({ sequence }));
                } catch (e) {
                    res.end(JSON.stringify({ error: e.message }));
                }
            } 
            else if (req.url === '/api/rc4') {
                const key = [61, 60, 23, 22, 21, 20]; 
                
                if (data.action === 'encrypt') {
                    const result = rc4Encrypt(key, data.text);
                    res.end(JSON.stringify(result));
                } 
                else if (data.action === 'decrypt') {
                    const result = rc4Decrypt(key, data.text);
                    res.end(JSON.stringify(result));
                }
                else if (data.action === 'benchmark') {
                    const result = benchmarkRC4(key, 1000000);
                    res.end(JSON.stringify(result));
                }
            }
        });
    }
});

server.listen(3000, () => {
    console.log("Сервер запущен!");
    console.log("Откройте в браузере: http://localhost:3000");
});