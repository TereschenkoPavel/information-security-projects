const CryptoJS = require('crypto-js');

class DESOperations {
    constructor(config) {
        this.config = config;
        // Подготавливаем ключ EDE2 (8 байт)
        this.key = CryptoJS.enc.Utf8.parse(this.config.encryptionKey);
    }
    
    encrypt(plaintext) {
        const startTime = performance.now();
        const ciphertext = CryptoJS.TripleDES.encrypt(plaintext, this.key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }).toString();
        const endTime = performance.now();
        
        return {
            ciphertext,
            time: endTime - startTime
        };
    }
    
    decrypt(ciphertext) {
        const startTime = performance.now();
        const decrypted = CryptoJS.TripleDES.decrypt(ciphertext, this.key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
        const endTime = performance.now();
        
        return {
            plaintext,
            time: endTime - startTime
        };
    }
    
    analyzeWeakKeys(plaintext) {
        console.log('\nАнализ слабых ключей:');
        
        const results = [];
        const testText = plaintext.substring(0, 8);
        
        this.config.weakKeys.forEach((weakKeyHex, index) => {
            try {
                const weakKey = CryptoJS.enc.Hex.parse(weakKeyHex);
                const encrypted = CryptoJS.DES.encrypt(testText, weakKey, {
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.Pkcs7
                });
                
                results.push({
                    key: weakKeyHex,
                    type: 'слабый',
                    ciphertext: encrypted.toString()
                });
                
                console.log(`   Слабый ключ ${index + 1}: ${weakKeyHex}`);
                console.log(`      Результат: ${encrypted.toString()}`);
            } catch (e) {
                console.log(`   Ошибка с ключом ${weakKeyHex}: ${e.message}`);
            }
        });
        
        return results;
    }
}

module.exports = DESOperations;