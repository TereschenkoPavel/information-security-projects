class PerformanceMonitor {
    constructor(desOps) {
        this.desOps = desOps;
    }
    
    measureEncryptionSpeed(text, iterations = 1000) {
        console.log(`\nОценка скорости шифрования (${iterations} итераций):`);
        
        const times = [];
        let totalBytes = 0;
        
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            const result = this.desOps.encrypt(text);
            const end = performance.now();
            
            times.push(end - start);
            const byteLength = Buffer.from(result.ciphertext, 'base64').length;
            totalBytes += byteLength;
        }
        
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const throughput = (totalBytes / (avgTime * iterations) * 1000).toFixed(2);
        
        console.log(`   Среднее время: ${avgTime.toFixed(4)} мс`);
        console.log(`   Минимальное время: ${minTime.toFixed(4)} мс`);
        console.log(`   Максимальное время: ${maxTime.toFixed(4)} мс`);
        console.log(`   Пропускная способность: ${throughput} байт/мс`);
        
        return {
            avgTime,
            minTime,
            maxTime,
            throughput
        };
    }
    
    analyzeCompression(plaintext, ciphertext) {
        console.log('\nАнализ сжатия:');
        
        const plainSize = Buffer.byteLength(plaintext, 'utf8');
        const cipherSize = Buffer.byteLength(ciphertext, 'utf8');
        
        console.log(`   Размер открытого текста: ${plainSize} байт`);
        console.log(`   Размер шифртекста (base64): ${cipherSize} байт`);
        
        const simulatedCompressedPlain = Math.floor(plainSize * 0.7);
        const simulatedCompressedCipher = Math.floor(cipherSize * 0.95);
        
        console.log(`\n   После сжатия (имитация):`);
        console.log(`      Открытый текст: ${simulatedCompressedPlain} байт (сжатие ${Math.round((1 - simulatedCompressedPlain/plainSize)*100)}%)`);
        console.log(`      Шифртекст: ${simulatedCompressedCipher} байт (сжатие ${Math.round((1 - simulatedCompressedCipher/cipherSize)*100)}%)`);
        console.log(`\n   Пояснение: Шифртекст похож на случайные данные, поэтому плохо сжимается.`);
    }
}

module.exports = PerformanceMonitor;