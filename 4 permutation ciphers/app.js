const fs = require('fs')

const file = fs.readFileSync('text.txt').toString()
const ALPHABET = 'АБВГДЕЁЖЗІЙКЛМНОПРСТУЎФХЦЧШЫЬЭЮЯ\'';

let old = performance.now()
const dimension =  Math.ceil(Math.sqrt(file.length))
const routePermutationEncrypted = routePermutation(file,dimension,dimension)
const routePermutationPerformance = performance.now() - old

fs.writeFileSync('route.txt',routePermutationEncrypted)
console.log('гистограмма оригинального текста')
histogram(file)
console.log('гистограмма зашифрованнного шифром маршрутной перестановки текста ')
histogram(routePermutationEncrypted)

old = performance.now()
const decryptedRoutePermutation = decryptRoutePermutation(routePermutationEncrypted, dimension,dimension)
const decryptedRoutePermutationPerformance = performance.now() - old
if(decryptedRoutePermutation.replace(/_/g,"").toUpperCase() == file.replace(/_/g,"").toUpperCase()) {console.log('маршрутная перестановка успешно расшифрован')}
console.log('время шифрования маршрутной перестановки: ', routePermutationPerformance)
console.log('время расшифрования маршрутной перестановки: ', decryptedRoutePermutationPerformance)


old = performance.now()
const doubleExchangeEncrypted = doubleExchange(file,'Павел','Терещенко')
const doubleExchangePerformance = performance.now() - old

fs.writeFileSync('doubleExchange.txt',doubleExchangeEncrypted)
console.log('гистограмма оригинального текста для шифра двойной перестановки текста')
histogram(file.slice(0,"Павел".length*"Терещенко".length))
console.log('гистограмма зашифрованнного шифром двойной перестановки текста ')
histogram(doubleExchangeEncrypted)

old = performance.now()
const decryptedDoubleExchange = decryptDoubleExchange(doubleExchangeEncrypted, 'Павел','Терещенко')
const decryptedDoubleExchangePerformance = performance.now() - old
if(decryptedDoubleExchange == file.slice(0,"Павел".length*"Терещенко".length)) {console.log('двойной перестановки успешно расшифрован')}
console.log('время шифрования двойной перестановки: ', doubleExchangePerformance)
console.log('время расшифрования двойной перестановки: ', decryptedDoubleExchangePerformance)


function histogram(text){
    var freq = new Map();
    for(const ch of ALPHABET){
        freq.set(ch,0)
    }
    for(const ch of text){
        freq.set(ch.toUpperCase(),freq.get(ch.toUpperCase())+1);
    }
    for(const ch of ALPHABET){
        console.log(`${ch}\t${freq.get(ch)/text.length}`)
    }
}

function routePermutation(text, rows, cols, padChar = '_') {
    const totalCells = rows * cols;1
 
    if (text.length < totalCells) {
        text = text.padEnd(totalCells, padChar);
    } else if (text.length > totalCells) {
        console.log(`Предупреждение: текст длиннее таблицы (${text.length} > ${totalCells}). Будет обрезан до ${totalCells} символов.`);
        text = text.slice(0, totalCells);
    }

    const table = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            const index = r * cols + c;
            row.push(text[index]);
        }
        table.push(row);
    }

    let cipher = '';
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            cipher += table[r][c];
        }
    }
    
    return cipher;
}

function decryptRoutePermutation(cipher, rows, cols) {
    const totalCells = rows * cols;
    if (cipher.length !== totalCells) {
        throw new Error(`Длина шифртекста (${cipher.length}) не соответствует размеру таблицы (${rows}x${cols}=${totalCells})`);
    }

    const table = Array.from({ length: rows }, () => Array(cols).fill(''));
    let idx = 0;
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            table[r][c] = cipher[idx++];
        }
    }

    let plain = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            plain += table[r][c];
        }
    }

    return plain;
}


function getPermutationOrder(key) {
    const items = Array.from(key).map((char, idx) => ({ char, idx }));
    items.sort((a, b) => {
        if (a.char < b.char) return -1;
        if (a.char > b.char) return 1;
        return 0;
    });
    return items.map(item => item.idx);
}

function inverseOrder(order) {
    const inv = new Array(order.length);
    for (let i = 0; i < order.length; i++) {
        inv[order[i]] = i;
    }
    return inv;
}

function printTable(table) {
    if (!table.length) return;
    const colNum = table[0].map((_, colIdx) =>
        Math.max(1, ...table.map(row => String(row[colIdx]).length))
    );
    for (const row of table) {
        const cells = row.map((cell, i) => ` ${String(cell).padEnd(colNum[i])} `);
        console.log(cells);
    }
}

function doubleExchange(plaintext, keyCols, keyRows, padChar = '_') {
    const cols = keyCols.length;
    const rows = keyRows.length;
    const total = rows * cols;

    let text = plaintext;
    if (text.length < total) {
        text = text.padEnd(total, padChar);
    } else if (text.length > total) {
        console.warn(`Предупреждение: текст длиннее таблицы (${text.length} > ${total}). Будет обрезан до ${total} символов.`);
        text = text.slice(0, total);
    }

    const table = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push(text[r * cols + c]);
        }
        table.push(row);
    }

    console.log('\nИсходная таблица (заполнение по строкам):');
    printTable(table);

    const colOrder = getPermutationOrder(keyCols);
    const rowOrder = getPermutationOrder(keyRows);

    console.log('Порядок столбцов (по ключу):', colOrder.map(i => i + 1).join(', '));
    console.log('Порядок строк (по ключу):', rowOrder.map(i => i + 1).join(', '));

    const tableAfterRows = rowOrder.map(rowIdx => table[rowIdx]);

    console.log('\nПосле перестановки строк:');
    printTable(tableAfterRows);

    const tableAfterCols = tableAfterRows.map(row => colOrder.map(colIdx => row[colIdx]));

    console.log('\nПосле перестановки столбцов:');
    printTable(tableAfterCols);

    let cipher = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            cipher += tableAfterCols[r][c];
        }
    }

    return cipher;
}


function decryptDoubleExchange(ciphertext, keyCols, keyRows) {
    const cols = keyCols.length;
    const rows = keyRows.length;
    const total = rows * cols;

    if (ciphertext.length !== total) {
        throw new Error(`Длина шифртекста (${ciphertext.length}) не соответствует размеру таблицы (${rows}x${cols}=${total})`);
    }

    // Заполняем таблицу из шифртекста по строкам (так как при шифровании считали по строкам)
    const cipherTable = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push(ciphertext[r * cols + c]);
        }
        cipherTable.push(row);
    }

    console.log('\nТаблица шифртекста (заполнение по строкам):');
    printTable(cipherTable);

    // Получаем прямые порядки
    const colOrder = getPermutationOrder(keyCols);
    const rowOrder = getPermutationOrder(keyRows);

    // Вычисляем обратные порядки
    const invColOrder = inverseOrder(colOrder);
    const invRowOrder = inverseOrder(rowOrder);

    // Восстанавливаем исходную таблицу: сначала обратная перестановка столбцов, затем строк
    // Т.к. при шифровании: new[r][c] = old[ rowOrder[r] ][ colOrder[c] ]
    // Тогда old[i][j] = new[ invRowOrder[i] ][ invColOrder[j] ]
    const originalTable = Array.from({ length: rows }, () => Array(cols));
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            originalTable[i][j] = cipherTable[ invRowOrder[i] ][ invColOrder[j] ];
        }
    }

    console.log('\nВосстановленная исходная таблица:');
    printTable(originalTable);

    // Считываем по строкам
    let plain = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            plain += originalTable[r][c];
        }
    }

    return plain;
}
