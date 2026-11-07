const crypto = require('crypto');
const readline = require('readline');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const {Buffer} = require('buffer')


function pad(data) {
    const blockSize = 8;
    const padding = blockSize - (data.length % blockSize);
    const padBuffer = Buffer.alloc(padding, padding);
    return Buffer.concat([data, padBuffer]);
}

function unpad(data) {
    const padding = data[data.length - 1];
    if (padding < 1 || padding > 8) throw new Error('Неверное дополнение');
    for (let i = 0; i < padding; i++) {
        if (data[data.length - 1 - i] !== padding) throw new Error('Нарушено дополнение');
    }
    return data.subarray(0, data.length - padding);
}

function encryptECB(key, plaintext) {
    const cipher = crypto.createCipheriv('des-ede-ecb', key, null);
    cipher.setAutoPadding(false); 
    const padded = pad(plaintext);
    const encrypted = Buffer.concat([cipher.update(padded), cipher.final()]);
    return encrypted;
}

function decryptECB(key, ciphertext) {
    const decipher = crypto.createDecipheriv('des-ede-ecb', key, null);
    decipher.setAutoPadding(false);
    const decryptedPadded = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return unpad(decryptedPadded);
}

function generateRandomKey() {
    return crypto.randomBytes(16);
}

async function measureSpeed(key, dataSizeMB = 1) {
    const data = crypto.randomBytes(dataSizeMB * 1024 * 1024);
    console.log(`\n=== Оценка скорости (данные: ${dataSizeMB} МБ) ===`);

    let start = process.hrtime.bigint();
    const encrypted = encryptECB(key, data);
    let end = process.hrtime.bigint();
    const encryptTime = Number(end - start) / 1e6; 
    console.log(`Шифрование: ${encryptTime.toFixed(2)} мс, скорость: ${(dataSizeMB / (encryptTime / 1024)).toFixed(2)} МБ/с`);

    start = process.hrtime.bigint();
    const decrypted = decryptECB(key, encrypted);
    end = process.hrtime.bigint();
    const decryptTime = Number(end - start) / 1e6;
    console.log(`Расшифрование: ${decryptTime.toFixed(2)} мс, скорость: ${(dataSizeMB / (decryptTime / 1024)).toFixed(2)} МБ/с`);

    if (!data.equals(decrypted)) console.error('Ошибка: расшифрованные данные не совпадают с исходными!');
    else console.log('Проверка целостности: успешно');
}


function flipBit(buffer, byteIndex, bitPos) {
    const newBuffer = Buffer.from(buffer);
    newBuffer[byteIndex] ^= (1 << bitPos);
    return newBuffer;
}

function countDiffBits(buf1, buf2) {
    if (buf1.length !== buf2.length) throw new Error('Разная длина буферов');
    let diffBits = 0;
    for (let i = 0; i < buf1.length; i++) {
        let xor = buf1[i] ^ buf2[i];
        while (xor) {
            diffBits += xor & 1;
            xor >>= 1;
        }
    }
    return diffBits;
}

function avalancheEffect(key, plaintext, byteIndex = 0, bitPos = 0) {
    console.log(`\n=== Лавинный эффект (ключ: ${key.toString('hex')}) ===`);
    const originalCipher = encryptECB(key, plaintext);
    const modifiedPlain = flipBit(plaintext, byteIndex, bitPos);
    const modifiedCipher = encryptECB(key, modifiedPlain);
    const diffBits = countDiffBits(originalCipher, modifiedCipher);
    const totalBits = originalCipher.length * 8;
    const percent = (diffBits / totalBits) * 100;
    console.log(`Исходный текст (hex): ${plaintext.toString('hex')}`);
    console.log(`Изменённый текст (hex): ${modifiedPlain.toString('hex')}`);
    console.log(`Исходный шифротекст: ${originalCipher.toString('hex')}`);
    console.log(`Изменённый шифротекст: ${modifiedCipher.toString('hex')}`);
    console.log(`Изменение: ${diffBits} бит из ${totalBits} (${percent.toFixed(2)}%)`);
    return diffBits;
}


const weakKeysDES = [
    Buffer.from('0101010101010101', 'hex'),
    Buffer.from('FEFEFEFEFEFEFEFE', 'hex'),
    Buffer.from('1F1F1F1F0E0E0E0E', 'hex'),
    Buffer.from('E0E0E0E0F1F1F1F1', 'hex')
];

const semiWeakPairs = [
    Buffer.from('01FE01FE01FE01FE', 'hex'),
    Buffer.from('FE01FE01FE01FE01', 'hex'),
    Buffer.from('1FE01FE00EF10EF1', 'hex'),
    Buffer.from('E01FE01FF10EF10E', 'hex')
];

function makeEDE2Key(k1, k2) {
    return Buffer.concat([k1, k2]);
}

function analyzeWeakKeys() {
    const testPlain = Buffer.from('Crypto01');
    console.log('\n========== АНАЛИЗ ВЛИЯНИЯ СЛАБЫХ И ПОЛУСЛАБЫХ КЛЮЧЕЙ ==========');
    console.log(`Тестовый открытый текст: "${testPlain.toString()}" (hex: ${testPlain.toString('hex')})\n`);

    const normalKey = generateRandomKey();
    const normalCipher = encryptECB(normalKey, testPlain);
    const normalDecrypted = decryptECB(normalKey, normalCipher);
    console.log(` Случайный ключ: ${normalKey.toString('hex')}`);
    console.log(`  Шифротекст: ${normalCipher.toString('hex')}`);
    console.log(`  Расшифровано: ${normalDecrypted.toString()}`);
    console.log(`  Лавинный эффект (бит 0 байта 0):`);
    avalancheEffect(normalKey, testPlain, 0, 0);
    console.log('---');

    const weak1 = weakKeysDES[0];
    const weakKeyBoth = makeEDE2Key(weak1, weak1);
    const cipherWeakBoth = encryptECB(weakKeyBoth, testPlain);
    const decryptedWeakBoth = decryptECB(weakKeyBoth, cipherWeakBoth);
    console.log(`[СЛАБЫЙ КЛЮЧ (оба K1=K2=${weak1.toString('hex')})]`);
    console.log(`  Шифротекст: ${cipherWeakBoth.toString('hex')}`);
    console.log(`  Расшифровано: ${decryptedWeakBoth.toString()}`);
    console.log(`  Лавинный эффект:`);
    avalancheEffect(weakKeyBoth, testPlain, 0, 0);
    console.log('---');

    const semi = semiWeakPairs[0];
    const semiKey = makeEDE2Key(semi, semi);
    const cipherSemi = encryptECB(semiKey, testPlain);
    const decryptedSemi = decryptECB(semiKey, cipherSemi);
    console.log(`[ПОЛУСЛАБЫЙ КЛЮЧ (K1=${semi.k1.toString('hex')}, K2=${semi.k2.toString('hex')})]`);
    console.log(`  Шифротекст: ${cipherSemi.toString('hex')}`);
    console.log(`  Расшифровано: ${decryptedSemi.toString()}`);
    console.log(`  Лавинный эффект:`);
    avalancheEffect(semiKey, testPlain, 0, 0);
    console.log('---');
}

const zlib = require('zlib');
const { promisify } = require('util');
const { buffer } = require('stream/consumers');
const gzip = promisify(zlib.gzip);

async function compressionRatioTest() {
    const originalText = Buffer.from('Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(100));
    const key = generateRandomKey();
    const cipherData = encryptECB(key, originalText);

    const compressedPlain = await gzip(originalText);
    const compressedCipher = await gzip(cipherData);

    const plainSize = originalText.length;
    const cipherSize = cipherData.length;
    const zipPlainSize = compressedPlain.length;
    const zipCipherSize = compressedCipher.length;

    console.log('\n========== ОЦЕНКА СТЕПЕНИ СЖАТИЯ (gzip) ==========');
    console.log(`Размер открытого текста: ${plainSize} байт`);
    console.log(`Размер шифротекста: ${cipherSize} байт`);
    console.log(`Сжатый открытый текст: ${zipPlainSize} байт, степень сжатия: ${(plainSize / zipPlainSize  ).toFixed(2)}`);
    console.log(`Сжатый шифротекст: ${zipCipherSize} байт, степень сжатия: ${(cipherSize / zipCipherSize ).toFixed(2)}`);
}
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function toHex(str){
    let buf =Buffer.from(str, 'utf-8')
    if(buf.length>=32){
        return buf.subarray(0,32);
    } else{
        let padded = Buffer.alloc(32, 'b');
        buf.copy(padded)
        return padded;
    }
}

async function main() {
    console.log('DES-EDE2');
    console.log('Алгоритм: двухключевой тройной DES (K1, K2, K1)\n');

    let key = null;
    const keyHex = await question('Введите ключ (32 hex символа) или оставьте пустым для генерации случайного: ');
    if (keyHex.trim() === '') {
        key = generateRandomKey();
        console.log(`Сгенерирован случайный ключ: ${key.toString('hex')}`);
    } else {
        try {
            if (keyHex.trim().length !== 32) throw new Error('Ключ должен быть 32 hex-символа (16 байт)');
            key = Buffer.from(keyHex.trim(), 'hex');
        } catch (e) {
            console.error('Ошибка:', e.message);
            rl.close();
            return;
        }
    }

    while (true) {

        console.log('1. Зашифровать сообщение');
        console.log('2. Расшифровать сообщение');
        console.log('3. Измерить скорость (шифрование+расшифрование 1 МБ)');
        console.log('4. Проанализировать лавинный эффект (на тестовом слове "Crypto01")');
        console.log('5. Исследовать влияние слабых/полуслабых ключей');
        console.log('6. Оценить степень сжатия (zip)');
        console.log('0. Выход');
        const choice = await question('Ваш выбор: ');

        if (choice === '0') break;
        else if (choice === '1') {
            const text = await question('Введите текст для зашифрования: ');
            const plain = Buffer.from(text, 'utf8');
            const cipher = encryptECB(key, plain);
            console.log(`Шифротекст (hex): ${cipher.toString('hex')}`);
        } else if (choice === '2') {
            const hex = await question('Введите шифротекст в hex: ');
            try {
                const cipher = Buffer.from(hex, 'hex');
                const plain = decryptECB(key, cipher);
                console.log(`Расшифрованный текст: ${plain.toString('utf8')}`);
            } catch (e) {
                console.error('Ошибка расшифрования:', e.message);
            }
        } else if (choice === '3') {
            await measureSpeed(key, 1);
        } else if (choice === '4') {
            const testWord = Buffer.from('Crypto01');
            await avalancheEffect(key, testWord, 0, 0);
        } else if (choice === '5') {
            analyzeWeakKeys();
        } else if (choice === '6') {
            await compressionRatioTest();
        } else {
            console.log('Неверный ввод');
        }
    }
    rl.close();
}

main().catch(console.error);