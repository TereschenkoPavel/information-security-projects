function gcdExtended(a, b) {
    if (b === 0n) return { gcd: a, x: 1n, y: 0n };
    const { gcd, x, y } = gcdExtended(b, a % b);
    return { gcd, x: y, y: x - (a / b) * y };
}

function modInverse(a, m) {
    const { gcd, x } = gcdExtended(a, m);
    if (gcd !== 1n) throw new Error("Нет обратного элемента");
    return (x % m + m) % m;
}

function gcd(a, b) {
    while (b !== 0n) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
}

function generateSuperincreasingSequence(z) {
    const seq = [];
    let total = 0n;
    for (let i = 0; i < z; i++) {
        const minVal = total + 1n;
        const maxVal = 1n << 100n;
        let val = minVal + (BigInt(Math.floor(Math.random() * Number(maxVal - minVal))) || 1n);
        if (val > maxVal) val = minVal;
        seq.push(val);
        total += val;
    }
    return seq;
}

function generateKeys(z) {
    const privateKey = generateSuperincreasingSequence(z);
    const sumPrivate = privateKey.reduce((a, b) => a + b, 0n);
    
    let n = sumPrivate + BigInt(Math.floor(Math.random() * 5000) + 100);
    
    let a = 1027n;
    while (a < n) {
        if (gcd(a, n) === 1n) break;
        a++;
    }
    
    const publicKey = privateKey.map(di => (di * a) % n);
    
    return { privateKey, publicKey, n, a };
}

function stringToBits(str) {
    const bits = [];
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    for (let byte of bytes) {
        for (let j = 7; j >= 0; j--) {
            bits.push((byte >> j) & 1);
        }
    }
    return bits;
}

function bitsToString(bits) {
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
        let byte = 0;
        for (let j = 0; j < 8 && i + j < bits.length; j++) {
            byte = (byte << 1) | bits[i + j];
        }
        bytes.push(byte);
    }
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(bytes));
}

function encrypt(message, publicKey) {
    const bits = stringToBits(message);
    const z = publicKey.length;
    
    const padded = [...bits];
    while (padded.length % z !== 0) padded.push(0);
    
    const cipher = [];
    for (let i = 0; i < padded.length; i += z) {
        let sum = 0n;
        for (let j = 0; j < z; j++) {
            if (padded[i + j] === 1) sum += publicKey[j];
        }
        cipher.push(sum);
    }
    return cipher;
}

function decrypt(ciphertext, privateKey, n, a) {
    const aInv = modInverse(a, n);
    const z = privateKey.length;
    const allBits = [];
    
    for (let c of ciphertext) {
        let s = (c * aInv) % n;
        const bits = new Array(z).fill(0);
        let rem = s;
        for (let i = z - 1; i >= 0; i--) {
            if (rem >= privateKey[i]) {
                bits[i] = 1;
                rem -= privateKey[i];
            }
        }
        if (rem !== 0n) {
            return null;
        }
        allBits.push(...bits);
    }
    return bitsToString(allBits);
}

function measureTime(fn) {
    const start = process.hrtime.bigint();
    const result = fn();
    const end = process.hrtime.bigint();
    const timeMs = Number(end - start) / 1e6;
    return { result, timeMs };
}

function runLab() {
    const fullName = "Терещенко Павел Александрович";
    console.log(`\nИсходное сообщение: "${fullName}"`);
    console.log(`Длина: ${fullName.length} символов\n`);
    
    const testCases = [
        { name: "Режим 1 (z=8)", z: 8 },
        { name: "Режим 2 (z=6)", z: 6 }
    ];
    
    for (const test of testCases) {
        console.log("-".repeat(70));
        console.log(`Тест: ${test.name}`);
        console.log("-".repeat(70));
        
        const genRes = measureTime(() => generateKeys(test.z));
        const { privateKey, publicKey, n, a } = genRes.result;
        
        console.log("Тайный ключ (сверхвозрастающая последовательность):");
        privateKey.forEach((v, i) => console.log(`  d${i} = ${v}`));
        console.log(`\nМодуль n = ${n}`);
        console.log(`Множитель a = ${a}`);
        console.log(`a^-1 mod n = ${modInverse(a, n)}`);
        console.log("\nОткрытый ключ (нормальная последовательность):");
        publicKey.forEach((v, i) => console.log(`  e${i} = ${v}`));
        console.log(`\nВремя генерации ключей: ${genRes.timeMs.toFixed(3)} мс`);
        
        const encRes = measureTime(() => encrypt(fullName, publicKey));
        const cipher = encRes.result;
        
        console.log(`\nЗашифрованное сообщение (${cipher.length} блоков):`);
        let cipherStr = cipher.map(c => c.toString()).join(", ");
        console.log(`[${cipherStr}]`);
        console.log(`Время шифрования: ${encRes.timeMs.toFixed(3)} мс`);
        
        const decRes = measureTime(() => decrypt(cipher, privateKey, n, a));
        const decrypted = decRes.result;
        
        console.log(`\nРасшифрованное сообщение: "${decrypted}"`);
        console.log(`Время расшифрования: ${decRes.timeMs.toFixed(3)} мс`);
        console.log(`Результат: ${decrypted.trim().slice(0,fullName.length) === fullName.trim() ? "УСПЕШНО" : "ОШИБКА"}\n`);
    }
}

runLab();