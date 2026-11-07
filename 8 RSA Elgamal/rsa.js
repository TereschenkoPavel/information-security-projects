const bigInt = require('big-integer');
const { textToNumber, numberToText } = require('./unicode-utils');

function isPrime(n, k = 10) {
    if (n.leq(1)) return false;
    if (n.leq(3)) return true;
    if (n.mod(2).eq(0)) return false;
    
    let d = n.subtract(1);
    let s = 0;
    while (d.mod(2).eq(0)) {
        d = d.divide(2);
        s++;
    }
    
    for (let i = 0; i < k; i++) {
        const a = bigInt.randBetween(2, n.subtract(2));
        let x = a.modPow(d, n);
        if (x.eq(1) || x.eq(n.subtract(1))) continue;
        
        let cont = false;
        for (let r = 0; r < s - 1; r++) {
            x = x.modPow(2, n);
            if (x.eq(n.subtract(1))) {
                cont = true;
                break;
            }
        }
        if (cont) continue;
        return false;
    }
    return true;
}

function generatePrime(bits) {
    while (true) {
        const min = bigInt(2).pow(bits - 1);
        const max = bigInt(2).pow(bits).subtract(1);
        const candidate = bigInt.randBetween(min, max);
        if (isPrime(candidate)) {
            return candidate;
        }
    }
}

function gcd(a, b) {
    while (!b.eq(0)) {
        const t = b;
        b = a.mod(b);
        a = t;
    }
    return a;
}

function modInverse(a, m) {
    let m0 = m;
    let y = bigInt(0);
    let x = bigInt(1);
    
    if (m.eq(1)) return bigInt(0);
    
    let aCopy = a;
    while (aCopy.gt(1)) {
        const q = aCopy.divide(m);
        let t = m;
        m = aCopy.mod(m);
        aCopy = t;
        t = y;
        y = x.subtract(q.multiply(y));
        x = t;
    }
    
    if (x.lt(0)) x = x.add(m0);
    return x;
}

function generateRSAKeys(bits = 512) {
    const p = generatePrime(bits / 2);
    const q = generatePrime(bits / 2);
    const n = p.multiply(q);
    const phi = p.subtract(1).multiply(q.subtract(1));
    
    let e = bigInt(65537);
    while (!gcd(e, phi).eq(1)) {
        e = e.add(2);
    }
    
    const d = modInverse(e, phi);
    
    return {
        publicKey: { e: e.toString(), n: n.toString() },
        privateKey: { d: d.toString(), n: n.toString() }
    };
}

function encryptRSA(text, e, n) {
    const m = textToNumber(text);
    const cipher = m.modPow(bigInt(e), bigInt(n));
    return cipher.toString();
}

function decryptRSA(ciphertext, d, n) {
    const m = bigInt(ciphertext).modPow(bigInt(d), bigInt(n));
    return numberToText(m);
}

module.exports = {
    generateRSAKeys,
    encryptRSA,
    decryptRSA
};