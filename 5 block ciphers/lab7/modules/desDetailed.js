// Полноценная реализация DES с пошаговым выводом раундов
// Основана на стандартных таблицах перестановок, S-блоках и раундовых ключах

class DESDetailed {
     static WEAK_KEYS_HEX = [
        "0101010101010101",
        "FEFEFEFEFEFEFEFE",
        "1F1F1F1F0E0E0E0E",
        "E0E0E0E0F1F1F1F1"
    ];
    static SEMI_WEAK_KEYS_HEX = [
        "01FE01FE01FE01FE", "FE01FE01FE01FE01",
        "1FE01FE00EF10EF1", "E01FE01FF10EF10E",
        "01E001E001F101F1", "E001E001F101F101",
        "1FFE1FFE0EFE0EFE", "FE1FFE1FFE0EFE0E",
        "011F011F010E010E", "1F011F010E010E01",
        "E0FEE0FEF1FEF1FE", "FEE0FEE0FEF1FEF1"
    ];
    static SEMI_WEAK_PAIRS = {
        "01FE01FE01FE01FE": "FE01FE01FE01FE01",
        "FE01FE01FE01FE01": "01FE01FE01FE01FE",
        "1FE01FE00EF10EF1": "E01FE01FF10EF10E",
        "E01FE01FF10EF10E": "1FE01FE00EF10EF1",
        "01E001E001F101F1": "E001E001F101F101",
        "E001E001F101F101": "01E001E001F101F1",
        "1FFE1FFE0EFE0EFE": "FE1FFE1FFE0EFE0E",
        "FE1FFE1FFE0EFE0E": "1FFE1FFE0EFE0EFE",
        "011F011F010E010E": "1F011F010E010E01",
        "1F011F010E010E01": "011F011F010E010E",
        "E0FEE0FEF1FEF1FE": "FEE0FEE0FEF1FEF1",
        "FEE0FEE0FEF1FEF1": "E0FEE0FEF1FEF1FE"
    };
    // Начальная перестановка IP
    static IP = [
        58, 50, 42, 34, 26, 18, 10, 2,
        60, 52, 44, 36, 28, 20, 12, 4,
        62, 54, 46, 38, 30, 22, 14, 6,
        64, 56, 48, 40, 32, 24, 16, 8,
        57, 49, 41, 33, 25, 17, 9, 1,
        59, 51, 43, 35, 27, 19, 11, 3,
        61, 53, 45, 37, 29, 21, 13, 5,
        63, 55, 47, 39, 31, 23, 15, 7
    ];

    // Обратная перестановка FP
    static FP = [
        40, 8, 48, 16, 56, 24, 64, 32,
        39, 7, 47, 15, 55, 23, 63, 31,
        38, 6, 46, 14, 54, 22, 62, 30,
        37, 5, 45, 13, 53, 21, 61, 29,
        36, 4, 44, 12, 52, 20, 60, 28,
        35, 3, 43, 11, 51, 19, 59, 27,
        34, 2, 42, 10, 50, 18, 58, 26,
        33, 1, 41, 9, 49, 17, 57, 25
    ];

    // Расширяющая перестановка E (32 -> 48)
    static E = [
        32, 1, 2, 3, 4, 5,
        4, 5, 6, 7, 8, 9,
        8, 9, 10, 11, 12, 13,
        12, 13, 14, 15, 16, 17,
        16, 17, 18, 19, 20, 21,
        20, 21, 22, 23, 24, 25,
        24, 25, 26, 27, 28, 29,
        28, 29, 30, 31, 32, 1
    ];

    // Перестановка P (32 -> 32)
    static P = [
        16, 7, 20, 21, 29, 12, 28, 17,
        1, 15, 23, 26, 5, 18, 31, 10,
        2, 8, 24, 14, 32, 27, 3, 9,
        19, 13, 30, 6, 22, 11, 4, 25
    ];

    // S-блоки (8 блоков по 4x16)
    static S_BOXES = [
        // S1
        [
            [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
            [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
            [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
            [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
        ],
        // S2
        [
            [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
            [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
            [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
            [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]
        ],
        // S3
        [
            [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
            [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
            [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
            [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]
        ],
        // S4
        [
            [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
            [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
            [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
            [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]
        ],
        // S5
        [
            [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
            [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
            [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
            [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]
        ],
        // S6
        [
            [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
            [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
            [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
            [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]
        ],
        // S7
        [
            [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
            [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
            [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
            [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]
        ],
        // S8
        [
            [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
            [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
            [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
            [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
        ]
    ];
    static isWeakKey(keyHex) {
        return this.WEAK_KEYS_HEX.includes(keyHex.toUpperCase());
    }

    // Проверка, является ли ключ полуслабым
    static isSemiWeakKey(keyHex) {
        return this.SEMI_WEAK_KEYS_HEX.includes(keyHex.toUpperCase());
    }

    // Возвращает парный полуслабый ключ (если есть)
    static getSemiWeakPair(keyHex) {
        return this.SEMI_WEAK_PAIRS[keyHex.toUpperCase()] || null;
    }
    // Генерация раундовых ключей (16 раундов по 48 бит)
    static generateRoundKeys(keyHex) {
        // Перестановка PC-1 (64 -> 56)
        const PC1 = [
            57, 49, 41, 33, 25, 17, 9,
            1, 58, 50, 42, 34, 26, 18,
            10, 2, 59, 51, 43, 35, 27,
            19, 11, 3, 60, 52, 44, 36,
            63, 55, 47, 39, 31, 23, 15,
            7, 62, 54, 46, 38, 30, 22,
            14, 6, 61, 53, 45, 37, 29,
            21, 13, 5, 28, 20, 12, 4
        ];
        const PC2 = [
            14, 17, 11, 24, 1, 5,
            3, 28, 15, 6, 21, 10,
            23, 19, 12, 4, 26, 8,
            16, 7, 27, 20, 13, 2,
            41, 52, 31, 37, 47, 55,
            30, 40, 51, 45, 33, 48,
            44, 49, 39, 56, 34, 53,
            46, 42, 50, 36, 29, 32
        ];
        const shifts = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

        let keyBits = this.hexToBits(keyHex, 64);
        let key56 = PC1.map(pos => keyBits[pos - 1]);
        let left = key56.slice(0, 28);
        let right = key56.slice(28);
        let roundKeys = [];

        for (let i = 0; i < 16; i++) {
            // Циклический сдвиг
            left = this.rotateLeft(left, shifts[i]);
            right = this.rotateLeft(right, shifts[i]);
            let combined = left.concat(right);
            // Применяем PC-2
            let roundKey48 = PC2.map(pos => combined[pos - 1]);
            roundKeys.push(roundKey48);
        }
        return roundKeys;
    }
    static generateRoundKeysHex(keyHex) {
        const keys = this.generateRoundKeys(keyHex);
        return keys.map(k => this.bitsToHex(k));
    }
    // Функция шифрования одного блока 64 бит с возвратом состояний после каждого раунда
    static encryptWithRounds(plaintextHex, keyHex) {
        const roundKeys = this.generateRoundKeys(keyHex);
        let bits = this.hexToBits(plaintextHex, 64);
        // Начальная перестановка IP
        bits = this.IP.map(pos => bits[pos - 1]);
        let left = bits.slice(0, 32);
        let right = bits.slice(32);
        
        const roundStates = []; // Сохраняем (L, R) после каждого раунда
        const cipherStates = [];
        for (let i = 0; i < 16; i++) {
            const newRight = this.feistel(right, roundKeys[i]);
            const newLeft = right;
            // XOR для правой половины
            const xorResult = this.xorArrays(left, newRight);
            right = xorResult;
            left = newLeft;
            
            // Сохраняем состояние
            roundStates.push({
                round: i + 1,
                left: left.slice(),
                right: right.slice()
            });
            cipherStates.push(left.join('').toString()+right.join('').toString())
        }
        
        // Финальная перестановка (обмен L и R + FP)
        const preOutput = right.concat(left);
        const outputBits = this.FP.map(pos => preOutput[pos - 1]);
        const ciphertextHex = this.bitsToHex(outputBits);
        
        return { roundStates, cipherStates, ciphertextHex };
    }
    static encryptBlock(plaintextHex, keyHex) {
        const roundKeys = this.generateRoundKeys(keyHex);
        let bits = this.hexToBits(plaintextHex, 64);
        bits = this.IP.map(pos => bits[pos - 1]);
        let left = bits.slice(0, 32);
        let right = bits.slice(32);
        
        for (let i = 0; i < 16; i++) {
            const newRight = this.feistel(right, roundKeys[i]);
            const newLeft = right;
            const xorResult = this.xorArrays(left, newRight);
            right = xorResult;
            left = newLeft;
        }
        const preOutput = right.concat(left);
        const outputBits = this.FP.map(pos => preOutput[pos - 1]);
        return this.bitsToHex(outputBits);
    }
     static decryptBlock(ciphertextHex, keyHex) {
        const roundKeys = this.generateRoundKeys(keyHex).reverse();
        let bits = this.hexToBits(ciphertextHex, 64);
        bits = this.IP.map(pos => bits[pos - 1]);
        let left = bits.slice(0, 32);
        let right = bits.slice(32);
        
        for (let i = 0; i < 16; i++) {
            const newRight = this.feistel(right, roundKeys[i]);
            const newLeft = right;
            const xorResult = this.xorArrays(left, newRight);
            right = xorResult;
            left = newLeft;
        }
        const preOutput = right.concat(left);
        const outputBits = this.FP.map(pos => preOutput[pos - 1]);
        return this.bitsToHex(outputBits);
    }
    static analyzeKeySchedule(keyHex) {
        const roundKeysHex = this.generateRoundKeysHex(keyHex);
        const unique = new Set(roundKeysHex);
        console.log(`раундовые ключи для: ${keyHex}`);
        for (let i = 0; i < roundKeysHex.length; i++) {
                console.log(`   Раунд ${i+1}: ${roundKeysHex[i]}`);
        }
        console.log(`Количество уникальных раундовых подключей: ${unique.size}`);
        
        if (unique.size === 1) {
            console.log(`[Слабый ключ] Все 16 раундовых ключей одинаковы:`);
            console.log(`   ${roundKeysHex[0]}`);
        } else if (unique.size === 2) {
            console.log(`[Полуслабый ключ] Генерирует только 2 различных подключа, чередуются:`);
        } else {
            console.log(`[Нормальный ключ] Обычное расписание, все 16 ключей различны.`);

        }
        return { uniqueCount: unique.size, roundKeysHex };
    }

    // Функция Фейстеля
    static feistel(right32, roundKey48) {
        // Расширение 32 -> 48
        let expanded = this.E.map(pos => right32[pos - 1]);
        // XOR с раундовым ключом
        let xored = this.xorArrays(expanded, roundKey48);
        // S-блоки (48 -> 32)
        let sboxOutput = [];
        for (let i = 0; i < 8; i++) {
            const block6 = xored.slice(i * 6, i * 6 + 6);
            const row = (block6[0] << 1) | block6[5];
            const col = (block6[1] << 3) | (block6[2] << 2) | (block6[3] << 1) | block6[4];
            const val = this.S_BOXES[i][row][col];
            sboxOutput.push((val >> 3) & 1, (val >> 2) & 1, (val >> 1) & 1, val & 1);
        }
        // Перестановка P
        let result = this.P.map(pos => sboxOutput[pos - 1]);
        return result;
    }


    static hexToBits(hex, length) {
        let bits = [];
        for (let i = 0; i < hex.length; i++) {
            let val = parseInt(hex[i], 16);
            for (let b = 3; b >= 0; b--) {
                bits.push((val >> b) & 1);
            }
        }
        while (bits.length < length) bits.unshift(0);
        return bits.slice(0, length);
    }
    
    static bitsToHex(bits) {
        let hex = '';
        for (let i = 0; i < bits.length; i += 4) {
            let val = 0;
            for (let j = 0; j < 4; j++) {
                val = (val << 1) | (bits[i + j] || 0);
            }
            hex += val.toString(16);
        }
        return hex;
    }
    
    static xorArrays(a, b) {
        return a.map((bit, idx) => bit ^ b[idx]);
    }
    
    static rotateLeft(arr, shift) {
        return arr.slice(shift).concat(arr.slice(0, shift));
    }
}

module.exports = DESDetailed;