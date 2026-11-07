const fs = require('fs');
const readline = require('readline');
const iconv = require('iconv-lite');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function shannonEntropy(probs) {
  return -probs.reduce((sum, p) => {
    sum += p * Math.log2(p);
    return sum;
  }, 0);
}

function h(p) {
  if (p === 0 || p === 1) return 0;
  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
}

function countCharFrequencies(text) {
  const freq = {};
  let total = 0;
  for (const ch of text) {
    freq[ch] = (freq[ch] || 0) + 1;
    total++;
  }
  const chars = Object.keys(freq).sort();
  const probs = chars.map(ch => freq[ch] / total);
  const entropy = shannonEntropy(probs);
  return { freq, total, chars, probs, entropy };
}

function countBitFrequencies(buffer) {
  let count0 = 0;
  let count1 = 0;
  for (const byte of buffer) {
    for (let i = 0; i < 8; i++) {
      const bit = (byte >> i) & 1;
      if (bit === 0) {
        count0++;
      } else {
        count1++;
      }
    }
  }

  const total = count0 + count1;
  const probs = [count0 / total, count1 / total];

  const entropy = shannonEntropy(probs);


  return {
    freq: [count0, count1], 
    total,
    probs,
    entropy
  };
}

function readTextFile(path, encoding = 'utf8') {
  try {
    const buffer = fs.readFileSync(path);
    if (encoding === 'win1251') {
      return iconv.decode(buffer, 'win1251');
    }
    return buffer.toString(encoding);
  } catch (err) {
    console.error(`Ошибка чтения файла ${path}:`, err.message);
    return null;
  }
}

function readBinaryFile(path) {
  try {
    return fs.readFileSync(path);
  } catch (err) {
    console.error(`Ошибка чтения файла ${path}:`, err.message);
    return null;
  }
}

function printFreqTable(chars, probs, freq, total, title) {
  console.log(`\n${title}`);
  console.log('Символ | Частота | Вероятность');
  console.log('-------|---------|------------');
  chars.forEach((ch, i) => {
    const displayChar = ch === ' ' ? 'пробел' : ch;
    console.log(`${displayChar.padEnd(6)} | ${freq[ch].toString().padEnd(7)} | ${probs[i].toFixed(6)}`);
  });
  console.log(`Всего символов: ${total}`);
}

function printBitFreqTable(freq, probs, total, title) {
  console.log(`\n${title}`);
  console.log('Бит | Частота | Вероятность');
  console.log('----|---------|------------');
  for (let bit = 0; bit <= 1; bit++) {
    console.log(`${bit.toString().padEnd(3)} | ${freq[bit].toString().padEnd(7)} | ${probs[bit].toFixed(6)}`);
  }
  console.log(`Всего бит: ${total}`);
}

async function main() {
  try {
    console.log('=== Лабораторная работа №2 ===');
    console.log('Расчёт энтропии и количества информации\n');

    console.log('--- Латинский алфавит ---');
    let latinText;
    latinText = readTextFile('latin1.txt');
      if (latinText === null) return;
    
    const latinFreq = countCharFrequencies(latinText);
    printFreqTable(latinFreq.chars, latinFreq.probs, latinFreq.freq, latinFreq.total, 'Частоты символов (латиница)');
    console.log(`Энтропия: ${latinFreq.entropy.toFixed(6)} бит/символ`);

    console.log('\n--- Кириллический алфавит ---');
    kirText = readTextFile('win1251.txt');
    if (kirText === null) return;

    const kirFreq = countCharFrequencies(kirText);
    printFreqTable(kirFreq.chars, kirFreq.probs, kirFreq.freq, kirFreq.total, 'Частоты символов (кириллица)');
    console.log(`Энтропия: ${kirFreq.entropy.toFixed(6)} бит/символ`);

    console.log('\n--- Бинарный алфавит латиница ---');
    const binaryBufferLatin = readBinaryFile('latin1.txt');
    const bitStats = countBitFrequencies(binaryBufferLatin);
    printBitFreqTable(bitStats.freq, bitStats.probs, bitStats.total, 'Частоты битов');
    console.log(`Энтропия: ${bitStats.entropy.toFixed(6)} бит/бит`);

    console.log('\n--- Бинарный алфавит кириллица ---');
    const binaryBufferCyrilyc = readBinaryFile('win1251.txt');
    const bitStatsCyrilyc = countBitFrequencies(binaryBufferCyrilyc);
    printBitFreqTable(bitStatsCyrilyc.freq, bitStatsCyrilyc.probs, bitStatsCyrilyc.total, 'Частоты битов');
    console.log(`Энтропия: ${bitStatsCyrilyc.entropy.toFixed(6)} бит/бит`);


    console.log('\n--- ФИО ---');
    const fullName = 'Терещенко Павел Александрович';
    const latinName = 'Tereschenko Pavel Alexandrovich';
    const nameLengthCharsLatin = latinName.length
    const nameBuffer = iconv.encode(fullName, 'win1251');
    const nameLengthChars = fullName.length;
    const nameLengthBytes = nameBuffer.length;
    
    const infoKir = kirFreq.entropy * nameLengthChars;
    console.log(`\nКоличество информации киррилического алфавита: ${infoKir.toFixed(6)} бит`);

    const infoBin = bitStatsCyrilyc.entropy * nameLengthBytes*8;
    console.log(`Количество информации windows-1251 кириллического алфавита: ${infoBin.toFixed(6)} бит`);

    const infoLat = latinFreq.entropy * nameLengthCharsLatin;
    console.log(`\nКоличество информации Латинского алфавита: ${infoLat.toFixed(6)} бит`);

    const infoASCII = bitStats.entropy * nameLengthCharsLatin*8;
    console.log(`Количество информации ASCII алфавита: ${infoASCII.toFixed(6)} бит`);

    console.log('\n--- Передача сообщения по каналу с ошибками ---');
    const errorProbs = [0.1, 0.5, 1.0];
    const totalBits = infoBin;

    for (const p of errorProbs) {
      const ConditionalEntropy = h(p);
      const EffectiveEntropy = 1 - ConditionalEntropy; 
      const info = totalBits * EffectiveEntropy;
      console.log(`\np = ${p}:`);
      console.log(`  h(p) = ${ConditionalEntropy.toFixed(6)} бит, He = ${EffectiveEntropy.toFixed(6)} бит/бит`);
      console.log(`  Количество информации в принятом сообщении: ${info.toFixed(6)} бит (из ${totalBits} переданных бит)`);
    }
    rl.close();
  } catch (err) {
    console.error('Ошибка:', err);
    rl.close();
  }
}

main();