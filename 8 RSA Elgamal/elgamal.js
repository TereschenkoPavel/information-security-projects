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

function findPrimitiveRoot(p) {
    const phi = p.subtract(1);
    const factors = [];
    let temp = phi;
    
    for (let i = 2; i <= 100; i++) {
        if (temp.mod(i).eq(0)) {
            factors.push(bigInt(i));
            while (temp.mod(i).eq(0)) {
                temp = temp.divide(i);
            }
        }
    }
    if (temp.gt(1)) factors.push(temp);
    
    for (let g = 2; g < 100; g++) {
        let ok = true;
        for (const q of factors) {
            if (bigInt(g).modPow(phi.divide(q), p).eq(1)) {
                ok = false;
                break;
            }
        }
        if (ok) return bigInt(g);
    }
    return bigInt(2);
}

function generateElGamalKeys(bits = 256) {
    const p = generatePrime(bits);
    const g = findPrimitiveRoot(p);
    const x = bigInt.randBetween(2, p.subtract(2));
    const y = g.modPow(x, p);
    
    return {
        publicKey: { p: p.toString(), g: g.toString(), y: y.toString() },
        privateKey: { p: p.toString(), g: g.toString(), x: x.toString() }
    };
}

function textToBlocks(text, blockSize) {
    const blocks = [];
    for (let i = 0; i < text.length; i += blockSize) {
        const block = text.substring(i, i + blockSize);
        const num = textToNumber(block);
        blocks.push(num);
    }
    return blocks;
}

function blocksToText(blocks) {
    let result = "";
    for (const block of blocks) {
        result += numberToText(block);
    }
    return result;
}

function encryptElGamal(text, p, g, y) {
    const bigP = bigInt(p);
    const bigG = bigInt(g);
    const bigY = bigInt(y);
    
    const maxBlockSize = Math.floor(Math.log10(Number(bigP.toString().length * 3)) / Math.log10(65536)) - 1;
    const blockSize =8;// Math.max(1, Math.min(4, maxBlockSize));
    
    const blocks = textToBlocks(text, blockSize);
    const results = { aList: [], bList: [] };
    
    for (const m of blocks) {
        const k = bigInt.randBetween(2, bigP.subtract(2));
        const a = bigG.modPow(k, bigP);
        const b = m.multiply(bigY.modPow(k, bigP)).mod(bigP);
        results.aList.push(a.toString());
        results.bList.push(b.toString());
    }
    
    return {
        a: results.aList.join(','),
        b: results.bList.join(',')
    };
}

function decryptElGamal(aStr, bStr, p, x) {
    const bigP = bigInt(p);
    const bigX = bigInt(x);
    
    const aList = aStr.split(',');
    const bList = bStr.split(',');
    const decryptedBlocks = [];
    
    for (let i = 0; i < aList.length; i++) {
        const bigA = bigInt(aList[i]);
        const bigB = bigInt(bList[i]);
        
        const s = bigA.modPow(bigX, bigP);
        const sInv = modInverse(s, bigP);
        const message = bigB.multiply(sInv).mod(bigP);
        decryptedBlocks.push(message);
    }
    
    return blocksToText(decryptedBlocks);
}

module.exports = {
    generateElGamalKeys,
    encryptElGamal,
    decryptElGamal
};