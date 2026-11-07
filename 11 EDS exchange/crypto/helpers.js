const { prime, isProbablyPrime } = require('bigint-crypto-utils');
const crypto = require('crypto');

async function generatePrime(bits) {
  return await prime(bits);
}

async function generatePrimeWithSubprime(bits) {
  // для Шнорра: p = k*q + 1, q – простое ~160-256 бит, p ~1024 бит
  const qBits = 160;
  let q = await prime(qBits);
  let p;
  let k;
  while (true) {
    k = BigInt(2) * BigInt(Math.floor(Math.random() * 2**20)) + 1n;
    p = k * q + 1n;
    if (p.toString(2).length === bits && await isProbablyPrime(p)) break;
  }
  return { p, q };
}

function hashMessage(message) {
  return crypto.createHash('sha256').update(message).digest('hex');
}

function hashToBigInt(message) {
  const hex = hashMessage(message);
  return BigInt('0x' + hex);
}

function modPow(base, exponent, modulus) {
  if (modulus === 1n) return 0n;
  let result = 1n;
  base = base % modulus;
  let exp = exponent;
  while (exp > 0) {
    if (exp % 2n === 1n) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exp >>= 1n;
  }
  return result;
}

function modInverse(a, m) {
  // extended Euclidean algorithm for BigInt
  let [old_r, r] = [a, m];
  let [old_s, s] = [1n, 0n];
  let [old_t, t] = [0n, 1n];
  while (r !== 0n) {
    let quotient = old_r / r;
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
    [old_t, t] = [t, old_t - quotient * t];
  }
  if (old_s < 0n) old_s += m;
  return old_s;
}

module.exports = {
  generatePrime,
  generatePrimeWithSubprime,
  hashMessage,
  hashToBigInt,
  modPow,
  modInverse
};