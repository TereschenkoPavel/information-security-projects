const helpers = require('./helpers');
const { randomBytes } = require('crypto');

async function generateKeys(bits = 1024) {
  const start = performance.now();
  const { p, q } = await helpers.generatePrimeWithSubprime(bits);
  // найти g порядка q: g = h^{(p-1)/q} mod p, h случайное
  let h;
  let g;
  do {
    h = BigInt('0x' + randomBytes(bits/8).toString('hex')) % (p-2n) + 2n;
    g = helpers.modPow(h, (p-1n)/q, p);
  } while (g === 1n);
  const x = BigInt('0x' + randomBytes(32).toString('hex')) % q;
  const y = helpers.modPow(g, x, p);
  const end = performance.now();
  return { p: p.toString(), q: q.toString(), g: g.toString(), x: x.toString(), y: y.toString(), timeMs: end - start };
}

function hashForSchnorr(r, message, q) {
  const data = r.toString(16) + message;
  const hashHex = helpers.hashMessage(data);
  return BigInt('0x' + hashHex) % q;
}

async function sign(message, xStr, yStr, pStr, qStr, gStr) {
  const start = performance.now();
  const p = BigInt(pStr);
  const q = BigInt(qStr);
  const g = BigInt(gStr);
  const x = BigInt(xStr);
  let k, r, e, s;
  do {
    k = BigInt('0x' + randomBytes(32).toString('hex')) % q;
    if (k === 0n) continue;
    r = helpers.modPow(g, k, p);
    e = hashForSchnorr(r, message, q);
    s = (k - x * e) % q;
    if (s < 0n) s += q;
  } while (r === 0n || s === 0n);
  const end = performance.now();
  return { signature: { e: e.toString(), s: s.toString() }, timeMs: end - start };
}

async function verify(message, signature, yStr, pStr, qStr, gStr) {
  const start = performance.now();
  const p = BigInt(pStr);
  const q = BigInt(qStr);
  const g = BigInt(gStr);
  const y = BigInt(yStr);
  const { e, s } = signature;
  const eBig = BigInt(e);
  const sBig = BigInt(s);
  const rv = (helpers.modPow(g, sBig, p) * helpers.modPow(y, eBig, p)) % p;
  const ev = hashForSchnorr(rv, message, q);
  const valid = ev === eBig;
  const end = performance.now();
  return { valid, timeMs: end - start };
}

module.exports = { generateKeys, sign, verify };