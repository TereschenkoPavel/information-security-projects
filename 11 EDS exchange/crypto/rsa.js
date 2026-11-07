const forge = require('node-forge');
const crypto = require('crypto');

function generateKeys(bits = 2048) {
  const start = performance.now();
  const keypair = forge.rsa.generateKeyPair({ bits });
  const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
  const end = performance.now();
  return { publicKey, privateKey, timeMs: end - start };
}

function sign(message, privateKeyPem) {
  const start = performance.now();
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const md = forge.md.sha256.create();
  md.update(message);
  const signature = privateKey.sign(md);
  const end = performance.now();
  return { signature: forge.util.encode64(signature), timeMs: end - start };
}

function verify(message, signatureBase64, publicKeyPem) {
  const start = performance.now();
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const md = forge.md.sha256.create();
  md.update(message);
  const signature = forge.util.decode64(signatureBase64);
  const valid = publicKey.verify(md.digest().bytes(), signature);
  const end = performance.now();
  return { valid, timeMs: end - start };
}

module.exports = { generateKeys, sign, verify };