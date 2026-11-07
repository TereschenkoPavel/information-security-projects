document.getElementById('hashBtn').addEventListener('click', async () => {
    const text = document.getElementById('inputText').value;
    const resultDiv = document.getElementById('resultDiv');
    resultDiv.innerText = 'Вычисление...';
    try {
        const response = await fetch('/api/hash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await response.json();
        if (data.hash) {
            resultDiv.innerText = `MD5: ${data.hash}`;
        } else {
            resultDiv.innerText = `Ошибка: ${data.error}`;
        }
    } catch (err) {
        resultDiv.innerText = `Ошибка: ${err.message}`;
    }
});

document.getElementById('benchBtn').addEventListener('click', async () => {
    const sizeMB = parseInt(document.getElementById('dataSize').value) || 100;
    const benchDiv = document.getElementById('benchDiv');
    benchDiv.innerText = 'Генерация данных и хэширование...';
    try {
        const response = await fetch('/api/benchmark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sizeMB })
        });
        const data = await response.json();
        if (data.timeMs) {
            benchDiv.innerHTML = `
                <b>Обработано данных:</b> ${sizeMB} МБ<br>
                <b>Время:</b> ${data.timeMs} мс<br>
                <b class="bench-details">Скорость: ${data.speedMBps} МБ/сек</b><br>
                <span style="font-size: 12px; color: gray;">MD5 буфера: ${data.hash}</span>
            `;
        } else {
            benchDiv.innerText = `Ошибка: ${data.error}`;
        }
    } catch (err) {
        benchDiv.innerText = `Ошибка: ${err.message}`;
    }
});