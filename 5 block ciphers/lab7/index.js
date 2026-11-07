const CryptoJS = require('crypto-js');
const config = require('./config');
const BlockProcessor = require('./modules/blockProcessor');
const DESOperations = require('./modules/desOperations');
const AvalancheAnalyzer = require('./modules/avalancheAnalyzer');
const PerformanceMonitor = require('./modules/performanceMonitor');
const DESDetailed = require('./modules/desDetailed');
const Helpers = require('./utils/helpers')

class DESLabApplication {
    constructor(config) {
        this.config = config;
        this.blockProcessor = new BlockProcessor();
        this.desOps = new DESOperations(config);
        this.avalancheAnalyzer = new AvalancheAnalyzer(this.desOps);
        this.performanceMonitor = new PerformanceMonitor(this.desOps);
    }
    
    async run() {
        console.log('\n');
        console.log('ЛАБОРАТОРНАЯ РАБОТА №7: ИССЛЕДОВАНИЕ БЛОЧНЫХ ШИФРОВ');
        console.log(`Алгоритм: ${this.config.algorithm.name}`);
        console.log(`Ключ: ${this.config.encryptionKey}`);
        
        await this.runTask1();
        await this.runTask2();
        await this.runTask3();
    }
    
    async runTask1() {
        console.log('\nОСНОВНЫЕ ОПЕРАЦИИ');
        
        const testData = this.config.testData;
        
        console.log('\n Разделение на блоки и дополнение:');
        const blockInfo = this.blockProcessor.processBlocks(testData.plaintext, 8);
        
        console.log('\n Шифрование:');
        const encryptResult = this.desOps.encrypt(testData.plaintext);
        console.log(`   Исходный текст: "${testData.plaintext}"`);
        console.log(`   Зашифровано (base64): ${encryptResult.ciphertext}`);
        console.log(`   Время шифрования: ${encryptResult.time.toFixed(3)} мс`);
        
        console.log('\n Расшифрование:');
        const decryptResult = this.desOps.decrypt(encryptResult.ciphertext);
        console.log(`   Расшифровано: "${decryptResult.plaintext}"`);
        console.log(`   Время расшифрования: ${decryptResult.time.toFixed(3)} мс`);
        
        const isCorrect = decryptResult.plaintext === testData.plaintext;
        console.log(`\n   Корректность: ${isCorrect ? 'Успешно' : 'Ошибка!'}`);
        
        console.log('\n Оценка скорости:');
        const speedResults = this.performanceMonitor.measureEncryptionSpeed(
            testData.plaintext,
            this.config.analysis.performanceIterations
        );
        
        console.log('\n Анализ лавинного эффекта:');
        
        const keyForAvalanche = this.config.encryptionKey;

        await this.avalancheAnalyzer.detailedRoundAnalysis(
            testData.singleBlock,
            keyForAvalanche,
            'text' 
        );
        
        return {
            blockInfo,
            encryptResult,
            decryptResult,
            speedResults,
        };
    }

    async runTask2() {
        console.log('\nАНАЛИЗ СЛАБЫХ И ПОЛУСЛАБЫХ КЛЮЧЕЙ');
        const testBlock = this.config.testData.singleBlock; 
        const testBlockHex = Helpers.textToHex(testBlock);
        
        console.log('\n--- СЛАБЫЕ КЛЮЧИ ---');
        const weakKeyHex = DESDetailed.WEAK_KEYS_HEX[0]
        console.log(`\nКлюч (hex): ${weakKeyHex}`);
        const analysis = DESDetailed.analyzeKeySchedule(weakKeyHex);
        
        const encrypted = DESDetailed.encryptBlock(testBlockHex, weakKeyHex);
        const decrypted = DESDetailed.encryptBlock(encrypted, weakKeyHex);
        
        console.log(`   Тестовый блок: ${testBlockHex}`);
        console.log(`   Шифртекст: ${encrypted}`);
        console.log(`   Дважды зашифрованный: ${decrypted} (${decrypted === testBlockHex ? 'совпадает' : 'ошибка'})`);
    
        
        console.log('\n--- ПОЛУСЛАБЫЕ КЛЮЧИ И ПАРЫ ---');
        const processedPairs = new Set();
        
        const semiKeyHex = DESDetailed.SEMI_WEAK_KEYS_HEX[0]
        
        const pairKeyHex = DESDetailed.getSemiWeakPair(semiKeyHex);
        
        processedPairs.add(semiKeyHex);
        processedPairs.add(pairKeyHex);
        
        console.log(`\nПара полуслабых ключей:`);
        console.log(`   Ключ A: ${semiKeyHex}`);
        console.log(`   Ключ B: ${pairKeyHex}`);
        
        // Анализируем расписание для A
        console.log(`\n   Раундовые ключи ключа A:`);
        DESDetailed.analyzeKeySchedule(semiKeyHex);
        
        console.log(`\n   Раундовые ключи ключа B:`);
        DESDetailed.analyzeKeySchedule(pairKeyHex);
        
        const encryptedd = DESDetailed.encryptBlock(testBlockHex, semiKeyHex);
        const decryptedd = DESDetailed.decryptBlock(encrypted, pairKeyHex);
        console.log(`   Тестовый блок: ${testBlockHex}`);
        console.log(`   Шифртекст: ${encryptedd}`);
        console.log(`   Расшифрованный другим ключем: ${decrypted}`);
    
    }

    
    async runTask3() {
        console.log('\nОЦЕНКА СТЕПЕНИ СЖАТИЯ');
        
        const testData = this.config.testData;
        
        console.log('\nАнализ сжимаемости открытого и зашифрованного текста:');
        
        const encryptResult = this.desOps.encrypt(testData.plaintext);
        
        const plainSize = Buffer.byteLength(testData.plaintext, 'utf8');
        const cipherSize = Buffer.byteLength(encryptResult.ciphertext, 'utf8');
        
        console.log(`\n   Исходный текст (длина: ${testData.plaintext.length} символов):`);
        console.log(`      "${testData.plaintext.substring(0, 50)}${testData.plaintext.length > 50 ? '...' : ''}"`);
        console.log(`   Размер открытого текста: ${plainSize} байт`);
        console.log(`   Размер шифртекста (base64): ${cipherSize} байт`);
        console.log(`   Соотношение: ${(cipherSize / plainSize * 100).toFixed(1)}%`);
        
        return {
            plainSize,
            cipherSize,
            ratio: cipherSize / plainSize
        };
    }
}

const app = new DESLabApplication(config);

async function runInteractive() {
    console.log('\n');
    await app.run();
}

if (require.main === module) {
    runInteractive().catch(console.error);
}

module.exports = DESLabApplication;