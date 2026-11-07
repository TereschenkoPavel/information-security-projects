const crypto = require('crypto');

document.getElementById('hashBtn').addEventListener('click', () => {
    const text = document.getElementById('inputText').value;
    
    const hash = crypto.createHash('md5').update(text, 'utf8').digest('hex');
    
    document.getElementById('resultDiv').innerText = `Хэш (MD5): ${hash}`;
});



document.getElementById('benchBtn').addEventListener('click', () => {
    const sizeMB = parseInt(document.getElementById('dataSize').value) || 100;
    const bytes = sizeMB * 1024 * 1024;
    
    const resultDiv = document.getElementById('benchDiv');
    resultDiv.innerText = "Подготовка памяти и генерация данных...";

    setTimeout(() => {
        const buffer = Buffer.alloc(bytes, 'a'); 
        
        const startTime = performance.now();
        const hash = crypto.createHash('md5').update(buffer).digest('hex');
        const endTime = performance.now();
        
        const timeMs = endTime - startTime;
        const timeSec = timeMs / 1000;
        const speed = sizeMB / timeSec; 
        
        resultDiv.innerHTML = `
            <b>Обработано данных:</b> ${sizeMB} МБ<br>
            <b>Затраченное время:</b> ${timeMs.toFixed(2)} мс<br>
            <b style="color: green;">Скорость хэширования: ${speed.toFixed(2)} МБ/сек</b><br>
            <span style="font-size: 12px; color: gray;">MD5 сгенерированного буфера: ${hash}</span>
        `;
    }, 50);
});