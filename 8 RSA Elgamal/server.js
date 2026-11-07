const express = require('express');
const { generateRSAKeys, encryptRSA, decryptRSA } = require('./rsa');
const { generateElGamalKeys, encryptElGamal, decryptElGamal } = require('./elgamal');

const app = express();
app.use(express.json());
app.use(express.static('public'));

let rsaKeys = null;
let elgamalKeys = null;

app.post('/api/rsa/generate', (req, res) => {
    const bits = req.body.bits || 512;
    rsaKeys = generateRSAKeys(bits);
    res.json(rsaKeys);
});

app.post('/api/rsa/encrypt', (req, res) => {
    const { text, e, n } = req.body;
    const ciphertext = encryptRSA(text, e, n);
    res.json({ ciphertext });
});

app.post('/api/rsa/decrypt', (req, res) => {
    const { ciphertext, d, n } = req.body;
    const text = decryptRSA(ciphertext, d, n);
    res.json({ text });
});

app.post('/api/elgamal/generate', (req, res) => {
    const bits = req.body.bits || 512;
    elgamalKeys = generateElGamalKeys(bits);
    res.json(elgamalKeys);
});

app.post('/api/elgamal/encrypt', (req, res) => {
    const { text, p, g, y } = req.body;
    const { a, b } = encryptElGamal(text, p, g, y);
    res.json({ a, b });
});

app.post('/api/elgamal/decrypt', (req, res) => {
    const { a, b, p, x } = req.body;
    const text = decryptElGamal(a, b, p, x);
    res.json({ text });
});

app.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
    console.log('Лабораторная работа №10 - RSA и Эль-Гамаля');
});