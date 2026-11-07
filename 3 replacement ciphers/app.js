const fs = require('fs')

const file = fs.readFileSync('text.txt').toString()
const ALPHABET = 'АБВГДЕЁЖЗІЙКЛМНОПРСТУЎФХЦЧШЫЬЭЮЯ\'';

let old = performance.now()
const ceasarEncrypted = ceasar(file,'інфарматыка',2)
const ceasarPerformance = performance.now() - old

fs.writeFileSync('ceasar.txt',ceasarEncrypted)
console.log('гистограмма оригинального текста')
histogram(file)
console.log('гистограмма зашифрованнного шифром цезаря текста ')
histogram(ceasarEncrypted)

old = performance.now()
const trithemiusEncrypted = trithemius(file,'Павел')
const trithemiusPerformance = performance.now() - old

fs.writeFileSync('trithemius.txt',trithemiusEncrypted)
console.log('гистограмма зашифрованнного шифром трисемуса текста')
histogram(trithemiusEncrypted)

old = performance.now()
const decryptedCeasar = decryptCeasar(ceasarEncrypted, 'інфарматыка', 2)
const decryptedCeasarPerformance = performance.now() - old
if(decryptedCeasar.toUpperCase() == file.toUpperCase()) {console.log('цезарь успешно расшифрован')}
console.log('время шифрования шифра цезаря: ', ceasarPerformance)
console.log('время расшифрования шифра цезаря: ', decryptedCeasarPerformance)

old = performance.now()
const decryptedTrithemius = decryptTrithemius(trithemiusEncrypted, 'Павел')
const decryptedTrithemiusPerformance = performance.now() - old
if(decryptedTrithemius.toUpperCase() == file.toUpperCase()) {console.log('трисемус успешно расшифрован')}
console.log('время шифрования шифра трисемуса: ', trithemiusPerformance)
console.log('время расшифрования шифра трисемуса: ', decryptedTrithemiusPerformance)

function histogram(text){
    var freq = new Map();
    for(const ch of ALPHABET){
        freq.set(ch,0)
    }
    for(const ch of text){
        freq.set(ch.toUpperCase(),freq.get(ch.toUpperCase())+1);
    }
    for(const ch of ALPHABET){
        console.log(`${ch}\t${freq.get(ch)/text.length}`)
    }
}

function buildSubstitutionAlphabet(keyword, shift) {
    const upperKeyword = keyword.toUpperCase();
    const key = [];
    const seen = new Set();
    for (const ch of upperKeyword) {
        if (ALPHABET.includes(ch) && !seen.has(ch)) {
            seen.add(ch);
            key.push(ch);
        }
    }

    const remaining = [];
    for (const ch of ALPHABET) {
        if (!seen.has(ch)) {
            remaining.push(ch);
        }
    }

    const base = key.concat(remaining);
    const shifted = base.slice(-shift).concat(base.slice(0, -shift));
    console.log(ALPHABET)
    console.log(shifted.join(''))
    return shifted;
}


function ceasar(plaintext, keyword, shift) {
    const subAlphabet = buildSubstitutionAlphabet(keyword, shift);
    let result = '';
    for (const ch of plaintext) {
        const upperCh = ch.toUpperCase();
        const index = ALPHABET.indexOf(upperCh);
        if (index !== -1) {
            result += subAlphabet[index];
        } else {
            result += ch;
        }
    }
    return result;
}

function decryptCeasar(ciphertext, keyword, shift) {
    const subAlphabet = buildSubstitutionAlphabet(keyword, shift);
    let result = '';
    for (const ch of ciphertext) {
        const upperCh = ch.toUpperCase();
        const index = subAlphabet.indexOf(upperCh);
        if (index !== -1) {
            result += ALPHABET[index];
        } else {
            result += ch;
        }
    }
    return result;
}

function trithemius(plaintext, keyword = '') {
    let result = '';
    let table = []
   const upperKeyword = keyword.toUpperCase();
    const firstRow = [];
    const seen = new Set();

    for (const ch of upperKeyword) {
        if (ALPHABET.includes(ch) && !seen.has(ch)) {
            seen.add(ch);
            firstRow.push(ch);
        }
    }
    for (const ch of ALPHABET) {
        if (!seen.has(ch)) {
            firstRow.push(ch);
        }
    }
    table.push(firstRow)
    console.log(firstRow.join(''))
    for (let i = 1; i < ALPHABET.length; i++){
        let Row = [];
        Row = firstRow.slice(-i).concat(firstRow.slice(0, -i));
        table.push(Row)
        console.log(Row.join(''))
    }
    for (let i = 0; i < plaintext.length; i++) {
        const ch = plaintext[i];
        const upperCh = ch.toUpperCase();
        const idx = firstRow.join('').indexOf(upperCh);

        if (idx === -1) {
            result += ch;
        } else {
            const encryptedChar = table[i%ALPHABET.length][idx];
            result += encryptedChar;
        }
    }
    return result;
}

function decryptTrithemius(ciphertext, keyword = '') {
    let table = []
    const upperKeyword = keyword.toUpperCase();
    const firstRow = [];
    const seen = new Set();

    for (const ch of upperKeyword) {
        if (ALPHABET.includes(ch) && !seen.has(ch)) {
            seen.add(ch);
            firstRow.push(ch);
        }
    }
    for (const ch of ALPHABET) {
        if (!seen.has(ch)) {
            firstRow.push(ch);
        }
    }
    table.push(firstRow)
     for (let i = 1; i < ALPHABET.length; i++){
        let Row = [];
        Row = firstRow.slice(-i).concat(firstRow.slice(0, -i));
        table.push(Row)
    }

    let result = '';
    for (let i = 0; i < ciphertext.length; i++) {
        const ch = ciphertext[i];
        const upperCh = ch.toUpperCase();
        const idx = table[i%ALPHABET.length].join('').indexOf(upperCh);

        if (idx == -1) {
            result += ch;
        } else {
            const encryptedChar = table[0][idx];
            result += encryptedChar;
        }
    }
    return result;
}