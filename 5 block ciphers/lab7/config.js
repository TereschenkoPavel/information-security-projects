const config = {
    algorithm: { name: 'DES-EDE2', type: 'Triple DES EDE2' },
    
    encryptionKey: 'testKey',
    
    weakKeys: [
        '0101010101010101',
        '1F1F1F1F0E0E0E0E',
        'E0E0E0E0F1F1F1F1',
        'FEFEFEFEFEFEFEFE'
    ],
    
    semiWeakKeys: [
        '01FE01FE01FE01FE',
        'FE01FE01FE01FE01',
        '1FE01FE00EF10EF1',
        'E01FE01FF10EF10E'
    ],
    
    testData: {
        plaintext: "Information security lab7",
        shortText: "Hello DES",
        singleBlock: "12345678"
    },
    
    analysis: {
        avalancheIterations: 5,
        performanceIterations: 1000
    }
};

module.exports = config;