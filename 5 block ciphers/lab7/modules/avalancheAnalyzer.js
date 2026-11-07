const CryptoJS = require('crypto-js');
const DESDetailed = require('./desDetailed');
class AvalancheAnalyzer {
    constructor(desOps) {
        this.desOps = desOps;
    }

    async detailedRoundAnalysis(originalText, key, mode = 'text') {
    console.log(`Режим: ${mode === 'text' ? 'изменение текста' : 'изменение ключа'}`);
    
    const textBytes = CryptoJS.enc.Utf8.parse(originalText);
    const originalHex = textBytes.toString(CryptoJS.enc.Hex).slice(0, 16); 
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const keyHex = keyBytes.toString(CryptoJS.enc.Hex).slice(0, 16);
    
    console.log(`Исходный текст (hex): ${originalHex}`);
    console.log(`Ключ (hex): ${keyHex}`);
    
    const { roundStates: origStates, ciphertextHex: origCipher } = DESDetailed.encryptWithRounds(originalHex, keyHex);
    
    let modifiedHex, modStates, modCipher;
    
    if (mode === 'text') {
        let bits = DESDetailed.hexToBits(originalHex, 64);
        bits[0] = bits[0] ^ 1;
        modifiedHex = DESDetailed.bitsToHex(bits);
        console.log(`Измененный текст (hex): ${modifiedHex} (инвертирован первый бит)`);
        const result = DESDetailed.encryptWithRounds(modifiedHex, keyHex);
        modStates = result.roundStates;
        modCipher = result.ciphertextHex;
    } else {
        let keyBits = DESDetailed.hexToBits(keyHex, 64);
        keyBits[0] = keyBits[0] ^ 1;
        const modifiedKeyHex = DESDetailed.bitsToHex(keyBits);
        console.log(`Измененный ключ (hex): ${modifiedKeyHex} (инвертирован первый бит)`);
        const result = DESDetailed.encryptWithRounds(originalHex, modifiedKeyHex);
        modStates = result.roundStates;
        modCipher = result.ciphertextHex;
    }
    
    console.log(`\nИсходный шифртекст: ${origCipher}`);
    console.log(`Модифицированный шифртекст: ${modCipher}`);
    
    console.log('\n--- ПОРАУНДОВОЕ СРАВНЕНИЕ ---');
    console.log('Раунд | Отличающихся бит в L | Отличающихся бит в R | Всего отличий');
    console.log('------|---------------------|---------------------|--------------');
    
    let totalDiffBits = 0;
    
    for (let i = 0; i < origStates.length; i++) {
        const leftDiff = this.countDiffBits(origStates[i].left, modStates[i].left);
        const rightDiff = this.countDiffBits(origStates[i].right, modStates[i].right);
        const total = leftDiff + rightDiff;
        totalDiffBits = total;
        console.log(`${(i+1).toString().padEnd(5)} | ${leftDiff.toString().padEnd(19)} | ${rightDiff.toString().padEnd(19)} | ${total}`);
        
        const barLength = Math.floor(total / 64 * 50);
        const bar = '#'.repeat(barLength) + '.'.repeat(50 - barLength);
        console.log('текст        '+origStates[i].left.join('')+origStates[i].right.join(''));
        console.log('с изменением '+modStates[i].left.join('')+modStates[i].right.join(''));
        
    }
    
    console.log(`\nИтог: после 16 раундов отличающихся бит: ${totalDiffBits}/64 (${Math.floor(totalDiffBits/64*100)}%)`);
    if (totalDiffBits > 32) {
        console.log("Лавинный эффект соответствует критерию (более 50% бит изменено).");
    } else {
        console.log("Лавинный эффект недостаточен (менее 50% бит).");
    }
    
    return { origStates, modStates, origCipher, modCipher };
}


countDiffBits(arr1, arr2) {
    let diff = 0;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) diff++;
    }
    return diff;
}
}

module.exports = AvalancheAnalyzer;