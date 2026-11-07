const helpers = require('./helpers');
const { randomBytes } = require('crypto');

async function generateKeys(bits = 1024) {
  const start = performance.now();
  const p = await helpers.generatePrime(bits);
  // найти генератор g (простой тест)
  let g = 2n;
  while (g < p - 1n) {
    if (helpers.modPow(g, (p-1n)/2n, p) !== 1n && helpers.modPow(g, (p-1n)/3n, p) !== 1n) break;
    g++;
  }
  const x = BigInt('0x' + randomBytes(bits/8).toString('hex')) % (p-1n) + 1n;
  const y = helpers.modPow(g, x, p);
  const end = performance.now();
  return { p: p.toString(), g: g.toString(), x: x.toString(), y: y.toString(), timeMs: end - start };
}

async function sign(message, xStr, yStr, pStr, gStr) {
  const start = performance.now();
  const p = BigInt(pStr);
  const g = BigInt(gStr);
  const x = BigInt(xStr);
  const h = helpers.hashToBigInt(message) % (p-1n);
  
  let k, r, s;
  do {
    k = BigInt('0x' + randomBytes(128).toString('hex')) % (p-1n);
    if (k === 0n) continue;
    r = helpers.modPow(g, k, p);
    // s = (h - x*r) * k^{-1} mod (p-1)
    const invK = helpers.modInverse(k, p-1n);
    s = ((h - x * r) % (p-1n) + (p-1n)) % (p-1n) * invK % (p-1n);
  } while (r === 0n || s === 0n);
  const end = performance.now();
  return { signature: { r: r.toString(), s: s.toString() }, timeMs: end - start };
}

async function verify(message, signature, yStr, pStr, gStr) {
  const start = performance.now();
  const p = BigInt(pStr);
  const g = BigInt(gStr);
  const y = BigInt(yStr);
  const { r, s } = signature;
  const rBig = BigInt(r);
  const sBig = BigInt(s);
  if (rBig <= 0n || rBig >= p || sBig <= 0n || sBig >= p-1n) return { valid: false, timeMs: 0 };
  const h = helpers.hashToBigInt(message) % (p-1n);
  const left = helpers.modPow(g, h, p);
  const right = (helpers.modPow(y, rBig, p) * helpers.modPow(rBig, sBig, p)) % p;
  const valid = left === right;
  const end = performance.now();
  return { valid, timeMs: end - start };
}

module.exports = { generateKeys, sign, verify };