const CryptoJS = require('crypto-js');

class BlockProcessor {
    processBlocks(text, blockSize = 8) {
        console.log(`\nАнализ разбиения на блоки:`);
        console.log(`   Исходный текст: "${text}"`);
        
        const textBytes = CryptoJS.enc.Utf8.parse(text);
        const originalSize = textBytes.sigBytes;
        
        console.log(`   Длина в байтах: ${originalSize}`);
        console.log(`   Размер блока: ${blockSize} байт`);
        
        const paddingNeeded = blockSize - (originalSize % blockSize);
        let paddedBytes;
        let paddingInfo;
        
        if (paddingNeeded === blockSize) {
            paddingInfo = {
                added: blockSize,
                value: blockSize,
                reason: "длина кратна блоку (PKCS7 требует целый блок)"
            };
            
            const padding = [];
            for (let i = 0; i < blockSize; i++) {
                padding.push(blockSize);
            }
            const paddingWA = CryptoJS.lib.WordArray.create(padding);
            paddedBytes = textBytes.clone().concat(paddingWA);
        } else {
            paddingInfo = {
                added: paddingNeeded,
                value: paddingNeeded,
                reason: "дополнение до полного блока"
            };
            
            const padding = [];
            for (let i = 0; i < paddingNeeded; i++) {
                padding.push(paddingNeeded);
            }
            const paddingWA = CryptoJS.lib.WordArray.create(padding);
            paddedBytes = textBytes.clone().concat(paddingWA);
        }
        
        console.log(`   Padding: +${paddingInfo.added} байт со значением 0x0${paddingInfo.value.toString(16)}`);
        console.log(`   Длина после padding: ${paddedBytes.sigBytes} байт`);
        
        const blocks = [];
        const hexString = paddedBytes.toString(CryptoJS.enc.Hex);
        
        for (let i = 0; i < hexString.length; i += blockSize * 2) {
            const blockHex = hexString.substr(i, blockSize * 2);
            if (blockHex.length === blockSize * 2) {
                blocks.push({
                    hex: blockHex,
                    bytes: blockHex.match(/.{2}/g).map(b => parseInt(b, 16))
                });
            }
        }
        
        console.log(`   Количество блоков: ${blocks.length}`);
        blocks.forEach((block, index) => {
            console.log(`   Блок ${index + 1}: ${block.hex}`);
        });
        
        return {
            originalSize,
            paddedSize: paddedBytes.sigBytes,
            paddingInfo,
            blocks,
            paddedBytes
        };
    }
    
    removePadding(decryptedBytes) {
        const bytes = decryptedBytes.words;
        const lastByte = decryptedBytes.bytes[decryptedBytes.sigBytes - 1];
        const paddingLength = lastByte;
        
        let isValid = true;
        for (let i = 0; i < paddingLength; i++) {
            if (decryptedBytes.bytes[decryptedBytes.sigBytes - 1 - i] !== paddingLength) {
                isValid = false;
                break;
            }
        }
        
        if (isValid && paddingLength <= 8) {
            const resultBytes = CryptoJS.lib.WordArray.create(
                decryptedBytes.bytes.slice(0, decryptedBytes.sigBytes - paddingLength)
            );
            return resultBytes.toString(CryptoJS.enc.Utf8);
        }
        
        return decryptedBytes.toString(CryptoJS.enc.Utf8);
    }
}

module.exports = BlockProcessor;