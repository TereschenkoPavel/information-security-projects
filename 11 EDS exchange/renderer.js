const { invoke, onKeyReceived } = window.electronAPI;


const keys = {
  rsa: { publicKey: null, privateKey: null },
  elgamal: { p: null, g: null, y: null, x: null },
  schnorr: { p: null, q: null, g: null, y: null, x: null }
};


document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.getAttribute('data-tab');
    
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');
  });
});


function showError(msg) { alert(`Ошибка: ${msg}`); }


document.getElementById('genRsa').onclick = async () => {
  try {
    console.log('Генерация RSA ключей...');
    const res = await invoke('generate-rsa', 2048);
    console.log('Результат генерации:', res);
    
    
    keys.rsa.publicKey = res.publicKey;
    keys.rsa.privateKey = res.privateKey;
    
    
    const pubElem = document.getElementById('rsaPub');
    const privElem = document.getElementById('rsaPriv');
    if (pubElem) pubElem.innerText = res.publicKey;
    if (privElem) privElem.innerText = res.privateKey;
    
    alert(`RSA ключи сгенерированы за ${res.timeMs.toFixed(2)} мс`);
  } catch (err) {
    console.error('Ошибка генерации RSA:', err);
    alert('Ошибка: ' + err.message);
  }
};

document.getElementById('signRsa').onclick = async () => {
  const msg = document.getElementById('rsaMsg').value;
  if (!keys.rsa.privateKey) return showError('Сначала сгенерируйте ключи RSA');
  try {
    const sig = await invoke('sign-rsa', { message: msg, privateKey: keys.rsa.privateKey });
    document.getElementById('rsaSig').innerText = sig.signature;
    document.getElementById('rsaSigTime').innerText = sig.timeMs.toFixed(2);
  } catch(e) { showError(e.message); }
};

document.getElementById('verifyRsa').onclick = async () => {
  const msg = document.getElementById('rsaMsg').value;
  const sig = document.getElementById('rsaSig').innerText;
  if (!keys.rsa.publicKey) return showError('Нет публичного ключа');
  try {
    const res = await invoke('verify-rsa', { message: msg, signature: sig, publicKey: keys.rsa.publicKey });
    document.getElementById('rsaVerResult').innerText = res.valid ? '✅ ВЕРНО' : '❌ НЕВЕРНО';
    document.getElementById('rsaVerTime').innerText = res.timeMs.toFixed(2);
  } catch(e) { showError(e.message); }
};

document.getElementById('exportRsaPub').onclick = () => {
  if (keys.rsa.publicKey) navigator.clipboard.writeText(keys.rsa.publicKey);
  else alert('Нет ключа');
};

document.getElementById('sendRsaKey').onclick = async () => {
  const host = document.getElementById('sendIp').value;
  const port = parseInt(document.getElementById('sendPort').value);
  if (!keys.rsa.publicKey) return alert('Нет публичного ключа');
  const keyData = { algorithm: 'rsa', publicKey: keys.rsa.publicKey };
  await invoke('send-public-key', { host, port, keyData });
  alert('Ключ отправлен');
};

document.getElementById('importRsaKey').onclick = async () => {
  const text = await navigator.clipboard.readText();
  try {
    
    if (text.includes('BEGIN PUBLIC KEY')) {
      keys.rsa.publicKey = text;
      document.getElementById('rsaPub').innerText = text;
      alert('Публичный ключ RSA импортирован');
    } else alert('Невалидный PEM ключ');
  } catch(e) { showError(e.message); }
};


document.getElementById('genElgamal').onclick = async () => {
  try {
    const res = await invoke('generate-elgamal', 1024);
    keys.elgamal = {
      p: res.p, g: res.g, y: res.y, x: res.x
    };
    document.getElementById('elP').innerText = res.p;
    document.getElementById('elG').innerText = res.g;
    document.getElementById('elY').innerText = res.y;
    document.getElementById('elX').innerText = res.x;
    alert(`Ключи Эль-Гамаля сгенерированы за ${res.timeMs.toFixed(2)} мс`);
  } catch(e) { showError(e.message); }
};

document.getElementById('signElgamal').onclick = async () => {
  const msg = document.getElementById('elMsg').value;
  const k = keys.elgamal;
  if (!k.p) return showError('Сгенерируйте ключи');
  try {
    const sig = await invoke('sign-elgamal', {
      message: msg,
      privateKey: k.x,
      publicKey: k.y,
      p: k.p,
      g: k.g
    });
    document.getElementById('elR').innerText = sig.signature.r;
    document.getElementById('elS').innerText = sig.signature.s;
    document.getElementById('elSigTime').innerText = sig.timeMs.toFixed(2);
  } catch(e) { showError(e.message); }
};

document.getElementById('verifyElgamal').onclick = async () => {
  const msg = document.getElementById('elMsg').value;
  const k = keys.elgamal;
  const r = document.getElementById('elR').innerText;
  const s = document.getElementById('elS').innerText;
  if (!k.p) return showError('Нет параметров');
  try {
    const res = await invoke('verify-elgamal', {
      message: msg,
      signature: { r, s },
      publicKey: k.y,
      p: k.p,
      g: k.g
    });
    document.getElementById('elVerResult').innerText = res.valid ? '✅ ВЕРНО' : '❌ НЕВЕРНО';
    document.getElementById('elVerTime').innerText = res.timeMs.toFixed(2);
  } catch(e) { showError(e.message); }
};

document.getElementById('exportElgamalPub').onclick = () => {
  const k = keys.elgamal;
  if (!k.p) return alert('Нет ключей');
  const exportObj = { algorithm: 'elgamal', p: k.p, g: k.g, y: k.y };
  navigator.clipboard.writeText(JSON.stringify(exportObj));
  alert('Открытые параметры скопированы');
};

document.getElementById('sendElgamalKey').onclick = async () => {
  const host = document.getElementById('sendIp').value;
  const port = parseInt(document.getElementById('sendPort').value);
  const k = keys.elgamal;
  if (!k.p) return alert('Нет ключей');
  const keyData = { algorithm: 'elgamal', p: k.p, g: k.g, y: k.y };
  await invoke('send-public-key', { host, port, keyData });
  alert('Отправлено');
};

document.getElementById('importElgamalKey').onclick = async () => {
  const text = await navigator.clipboard.readText();
  try {
    const obj = JSON.parse(text);
    if (obj.algorithm === 'elgamal' && obj.p && obj.g && obj.y) {
      keys.elgamal = { p: obj.p, g: obj.g, y: obj.y, x: null };
      document.getElementById('elP').innerText = obj.p;
      document.getElementById('elG').innerText = obj.g;
      document.getElementById('elY').innerText = obj.y;
      document.getElementById('elX').innerText = '(приватный неизвестен)';
      alert('Открытые параметры Эль-Гамаля импортированы');
    } else alert('Неверный формат');
  } catch(e) { showError(e.message); }
};


document.getElementById('genSchnorr').onclick = async () => {
  try {
    const res = await invoke('generate-schnorr', 1024);
    keys.schnorr = {
      p: res.p, q: res.q, g: res.g, y: res.y, x: res.x
    };
    document.getElementById('sP').innerText = res.p;
    document.getElementById('sQ').innerText = res.q;
    document.getElementById('sG').innerText = res.g;
    document.getElementById('sY').innerText = res.y;
    document.getElementById('sX').innerText = res.x;
    alert(`Ключи Шнорра сгенерированы за ${res.timeMs.toFixed(2)} мс`);
  } catch(e) { showError(e.message); }
};

document.getElementById('signSchnorr').onclick = async () => {
  const msg = document.getElementById('sMsg').value;
  const k = keys.schnorr;
  if (!k.p) return showError('Сгенерируйте ключи');
  try {
    const sig = await invoke('sign-schnorr', {
      message: msg,
      privateKey: k.x,
      publicKey: k.y,
      p: k.p,
      q: k.q,
      g: k.g
    });
    document.getElementById('sE').innerText = sig.signature.e;
    document.getElementById('sS').innerText = sig.signature.s;
    document.getElementById('sSigTime').innerText = sig.timeMs.toFixed(2);
  } catch(e) { showError(e.message); }
};

document.getElementById('verifySchnorr').onclick = async () => {
  const msg = document.getElementById('sMsg').value;
  const k = keys.schnorr;
  const e = document.getElementById('sE').innerText;
  const s = document.getElementById('sS').innerText;
  if (!k.p) return showError('Нет параметров');
  try {
    const res = await invoke('verify-schnorr', {
      message: msg,
      signature: { e, s },
      publicKey: k.y,
      p: k.p,
      q: k.q,
      g: k.g
    });
    document.getElementById('sVerResult').innerText = res.valid ? '✅ ВЕРНО' : '❌ НЕВЕРНО';
    document.getElementById('sVerTime').innerText = res.timeMs.toFixed(2);
  } catch(e) { showError(e.message); }
};

document.getElementById('exportSchnorrPub').onclick = () => {
  const k = keys.schnorr;
  if (!k.p) return alert('Нет ключей');
  const exportObj = { algorithm: 'schnorr', p: k.p, q: k.q, g: k.g, y: k.y };
  navigator.clipboard.writeText(JSON.stringify(exportObj));
};

document.getElementById('sendSchnorrKey').onclick = async () => {
  const host = document.getElementById('sendIp').value;
  const port = parseInt(document.getElementById('sendPort').value);
  const k = keys.schnorr;
  if (!k.p) return alert('Нет ключей');
  const keyData = { algorithm: 'schnorr', p: k.p, q: k.q, g: k.g, y: k.y };
  await invoke('send-public-key', { host, port, keyData });
  alert('Отправлено');
};

document.getElementById('importSchnorrKey').onclick = async () => {
  const text = await navigator.clipboard.readText();
  try {
    const obj = JSON.parse(text);
    if (obj.algorithm === 'schnorr' && obj.p && obj.q && obj.g && obj.y) {
      keys.schnorr = { p: obj.p, q: obj.q, g: obj.g, y: obj.y, x: null };
      document.getElementById('sP').innerText = obj.p;
      document.getElementById('sQ').innerText = obj.q;
      document.getElementById('sG').innerText = obj.g;
      document.getElementById('sY').innerText = obj.y;
      document.getElementById('sX').innerText = '(приватный неизвестен)';
      alert('Параметры Шнорра импортированы');
    } else alert('Неверный формат');
  } catch(e) { showError(e.message); }
};


onKeyReceived((keyData) => {
  if (keyData.algorithm === 'rsa') {
    keys.rsa.publicKey = keyData.publicKey;
    document.getElementById('rsaPub').innerText = keyData.publicKey;
    alert('Получен публичный ключ RSA');
  } else if (keyData.algorithm === 'elgamal') {
    keys.elgamal = { p: keyData.p, g: keyData.g, y: keyData.y, x: null };
    document.getElementById('elP').innerText = keyData.p;
    document.getElementById('elG').innerText = keyData.g;
    document.getElementById('elY').innerText = keyData.y;
    alert('Получены параметры Эль-Гамаля');
  } else if (keyData.algorithm === 'schnorr') {
    keys.schnorr = { p: keyData.p, q: keyData.q, g: keyData.g, y: keyData.y, x: null };
    document.getElementById('sP').innerText = keyData.p;
    document.getElementById('sQ').innerText = keyData.q;
    document.getElementById('sG').innerText = keyData.g;
    document.getElementById('sY').innerText = keyData.y;
    alert('Получены параметры Шнорра');
  }
});
document.querySelectorAll('textarea').forEach(ta => {
  ta.addEventListener('input', () => console.log('Текст введён:', ta.value));
});