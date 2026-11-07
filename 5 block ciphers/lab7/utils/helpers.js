const CryptoJS = require('crypto-js');

class Helpers {
    /**
     * Преобразование текста в разные форматы
     */
    
    static textToHex(text) {
        return CryptoJS.enc.Utf8.parse(text).toString(CryptoJS.enc.Hex);
    }
    
    static hexToText(hex) {
        return CryptoJS.enc.Hex.parse(hex).toString(CryptoJS.enc.Utf8);
    }
    
    static base64ToHex(base64) {
        return CryptoJS.enc.Base64.parse(base64).toString(CryptoJS.enc.Hex);
    }
    
    static hexToBase64(hex) {
        return CryptoJS.enc.Hex.parse(hex).toString(CryptoJS.enc.Base64);
    }
    
    /**
     * Форматирование вывода
     */
    static printSeparator(char = '=', length = 60) {
        console.log(char.repeat(length));
    }
    
    static printTitle(title) {
        this.printSeparator();
        console.log(title);
        this.printSeparator('-');
    }
    
    /**
     * Создание тестовых данных
     */
    static generateTestData() {
        return {
            short: "Test",
            medium: "Information security",
            long: "This is a longer test string to analyze block processing and avalanche effect in DES algorithm for laboratory work number 5.",
            exactBlock: "12345678", // Ровно 8 байт
            twoBlocks: "1234567812345678" // Ровно 16 байт
        };
    }
    
    /**
     * Валидация ключа для DES
     */
    static validateDESKey(key) {
        const keyBytes = CryptoJS.enc.Utf8.parse(key);
        const keyLength = keyBytes.sigBytes;
        
        console.log(`   Длина ключа: ${keyLength} байт`);
        
        if (keyLength < 8) {
            console.log(`   ⚠️  Ключ короче 8 байт, будет дополнен нулями`);
            return false;
        } else if (keyLength > 8) {
            console.log(`   ⚠️  Ключ длиннее 8 байт, будет обрезан`);
            return false;
        }
        return true;
    }
}

module.exports = Helpers;