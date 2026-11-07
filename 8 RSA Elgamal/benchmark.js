const bigInt = require('big-integer');
const { generateRSAKeys, encryptRSA, decryptRSA } = require('./rsa-module');
const { generateElGamalKeys, encryptElGamal, decryptElGamal } = require('./elgamal-module');

function measureTime(fn) {
    const start = process.hrtime.bigint();
    const result = fn();
    const end = process.hrtime.bigint();
    const timeMs = Number(end - start) / 1e6;
    return { result, timeMs };
}

const testText = "Терещенко Павел Александрович";
console.log("=".repeat(70));
console.log("СРАВНЕНИЕ ПРОИЗВОДИТЕЛЬНОСТИ RSA И ЭЛЬ-ГАМАЛЯ");
console.log("=".repeat(70));
console.log(`\nТестовое сообщение: "${testText}"`);
console.log(`Длина сообщения: ${testText.length} символов\n`);

console.log("-".repeat(70));
console.log("RSA (512 бит)");
console.log("-".repeat(70));

let rsaResult = measureTime(() => {
    const keys = generateRSAKeys(512);
    const ciphertext = encryptRSA(testText, keys.publicKey.e, keys.publicKey.n);
    const plaintext = decryptRSA(ciphertext, keys.privateKey.d, keys.privateKey.n);
    return { keys, ciphertext, plaintext };
});

console.log(`Время генерации ключей + шифрование + расшифрование: ${rsaResult.timeMs.toFixed(2)} мс`);
console.log(`Длина шифротекста (RSA): ${rsaResult.result.ciphertext.length} цифр`);
console.log(`Результат расшифрования: ${rsaResult.result.plaintext}`);

console.log("\n" + "-".repeat(70));
console.log("ЭЛЬ-ГАМАЛЯ (256 бит)");
console.log("-".repeat(70));

let elgamalResult = measureTime(() => {
    const keys = generateElGamalKeys(256);
    const { a, b } = encryptElGamal(testText, keys.publicKey.p, keys.publicKey.g, keys.publicKey.y);
    const plaintext = decryptElGamal(a, b, keys.privateKey.p, keys.privateKey.x);
    return { keys, a, b, plaintext };
});

console.log(`Время генерации ключей + шифрование + расшифрование: ${elgamalResult.timeMs.toFixed(2)} мс`);
console.log(`Длина шифротекста (a): ${elgamalResult.result.a.length} цифр`);
console.log(`Длина шифротекста (b): ${elgamalResult.result.b.length} цифр`);
console.log(`Общая длина шифротекста: ${elgamalResult.result.a.length + elgamalResult.result.b.length} цифр`);
console.log(`Результат расшифрования: ${elgamalResult.result.plaintext}`);