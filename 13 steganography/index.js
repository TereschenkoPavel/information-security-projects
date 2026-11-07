const fs = require('fs');

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

// Текст → биты
function textToBits(text) {
    let bits = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const binary = charCode.toString(2).padStart(8, '0');
        bits += binary;
    }
    return bits;
}

// Биты → текст
function bitsToText(bits) {
    let text = '';
    for (let i = 0; i < bits.length; i += 8) {
        const byte = bits.slice(i, i + 8);
        if (byte.length === 8) {
            const charCode = parseInt(byte, 2);
            text += String.fromCharCode(charCode);
        }
    }
    return text;
}

// Добавляем маркер конца сообщения (16 битов: 11111111 00000000)
function addEndMarker(bits) {
    return bits + '1111111100000000';
}

// Обрезаем по маркеру
function trimEndMarker(bits) {
    const markerIndex = bits.indexOf('1111111100000000');
    if (markerIndex !== -1) {
        return bits.substring(0, markerIndex);
    }
    return bits;
}

// ========== МЕТОД 1: МОДИФИКАЦИЯ ПРОБЕЛОВ ==========

// Прячем сообщение через пробелы между словами
function hideInSpaces(text, secretMessage) {
    let secretBits = textToBits(secretMessage);
    secretBits = addEndMarker(secretBits);
    
    let words = text.split(/(\s+)/);
    
    let spacePositions = [];
    for (let i = 0; i < words.length; i++) {
        if (i % 2 === 1 && words[i].includes(' ')) {
            spacePositions.push(i);
        }
    }
    
    if (spacePositions.length < secretBits.length) {
        console.log('Ошибка: текст-контейнер слишком мал для этого сообщения!');
        console.log(`Нужно ${secretBits.length} пробелов, а есть ${spacePositions.length}`);
        return null;
    }
    
    for (let i = 0; i < secretBits.length; i++) {
        const bit = secretBits[i];
        const pos = spacePositions[i];
        if (bit === '0') {
            words[pos] = ' ';
        } else {
            words[pos] = '  ';
        }
    }
    
    let htmlResult = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Стего-контейнер (пробелы)</title></head><body><pre style="font-family: monospace; white-space: pre-wrap;">';
    htmlResult += words.join('');
    htmlResult += '</pre></body></html>';
    
    return htmlResult;
}

// Извлекаем сообщение из пробелов
function extractFromSpaces(htmlContent) {
    let bits = '';
    
    const preMatch = htmlContent.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
    if (!preMatch) return '';
    
    const encodedText = preMatch[1];
    const spaceMatches = encodedText.match(/ +/g);
    
    if (spaceMatches) {
        for (let space of spaceMatches) {
            if (space.length === 1) {
                bits += '0';
            } else if (space.length === 2) {
                bits += '1';
            }
        }
    }
    
    bits = trimEndMarker(bits);
    return bitsToText(bits);
}

// ========== МЕТОД 2: МОДИФИКАЦИЯ ЦВЕТА ==========

// Прячем сообщение через цвет букв (создаем HTML)
function hideInColor(text, secretMessage) {
    let secretBits = textToBits(secretMessage);
    secretBits = addEndMarker(secretBits);
    
    if (text.length < secretBits.length) {
        console.log('Ошибка: текст слишком короткий!');
        console.log(`Нужно ${secretBits.length} символов, а есть ${text.length}`);
        return null;
    }
    
    let htmlResult = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Стего-контейнер (цвет)</title></head><body>';
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (i < secretBits.length) {
            const bit = secretBits[i];
            if (bit === '0') {
                htmlResult += `<span style="color: black;">${char}</span>`;
            } else {
                htmlResult += `<span style="color: red;">${char}</span>`;
            }
        } else {
            htmlResult += `<span style="color: black;">${char}</span>`;
        }
    }
    
    htmlResult += '</body></html>';
    return htmlResult;
}

// Извлекаем сообщение из HTML-цвета
function extractFromColor(htmlContent) {
    let bits = '';
    
    const regex = /<span style="color: (\w+);">(.)<\/span>/gs;
    let match;
    
    while ((match = regex.exec(htmlContent)) !== null) {
        const color = match[1];
        if (color === 'black') {
            bits += '0';
        } else if (color === 'red') {
            bits += '1';
        }
        
        if (bits.includes('1111111100000000')) {
            const markerIndex = bits.indexOf('1111111100000000');
            bits = bits.substring(0, markerIndex);
            break;
        }
    }
    
    return bitsToText(bits);
}

// ========== ГЛАВНАЯ ФУНКЦИЯ ==========

function main() {
    console.log('=== СТЕГАНОГРАФИЯ (Лаба 15) ===\n');
    
    const containerText = fs.readFileSync('container.txt', 'utf8');
    const secretMessage = fs.readFileSync('secret.txt', 'utf8');
    
    console.log('Текст-контейнер:', containerText.substring(0, 100) + '...');
    console.log('Секретное сообщение:', secretMessage);
    console.log('---\n');
    
    // Метод пробелов
    console.log('【МЕТОД 1: Модификация пробелов】');
    const hiddenInSpaces = hideInSpaces(containerText, secretMessage);
    
    if (hiddenInSpaces) {
        fs.writeFileSync('output_space.html', hiddenInSpaces, 'utf8');
        console.log('✓ Сохранено в output_space.html');
        
        const extractedSpace = extractFromSpaces(hiddenInSpaces);
        console.log('Извлеченное сообщение:', extractedSpace);
        console.log('Проверка:', extractedSpace === secretMessage ? '✅ УСПЕХ' : '❌ ОШИБКА');
    }
    console.log('');
    
    // Метод цвета
    console.log('【МЕТОД 2: Модификация цвета】');
    const hiddenInColor = hideInColor(containerText, secretMessage);
    
    if (hiddenInColor) {
        fs.writeFileSync('output_color.html', hiddenInColor, 'utf8');
        console.log('✓ Сохранено в output_color.html');
        
        const extractedColor = extractFromColor(hiddenInColor);
        console.log('Извлеченное сообщение:', extractedColor);
        console.log('Проверка:', extractedColor === secretMessage ? '✅ УСПЕХ' : '❌ ОШИБКА');
    }
}

// Запускаем программу
main();