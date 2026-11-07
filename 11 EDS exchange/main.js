const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const network = require('./network');
const rsa = require('./crypto/rsa');
const elgamal = require('./crypto/elgamal');
const schnorr = require('./crypto/schnorr');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools(); 

  
  network.startKeyReceiver((keyData) => {
    mainWindow.webContents.send('key-received', keyData);
  });

  
  ipcMain.handle('generate-rsa', async (event, bits) => rsa.generateKeys(bits));
  ipcMain.handle('sign-rsa', async (event, { message, privateKey }) => rsa.sign(message, privateKey));
  ipcMain.handle('verify-rsa', async (event, { message, signature, publicKey }) => rsa.verify(message, signature, publicKey));

  ipcMain.handle('generate-elgamal', async (event, bits) => elgamal.generateKeys(bits));
  ipcMain.handle('sign-elgamal', async (event, { message, privateKey, publicKey, p, g }) => elgamal.sign(message, privateKey, publicKey, p, g));
  ipcMain.handle('verify-elgamal', async (event, { message, signature, publicKey, p, g }) => elgamal.verify(message, signature, publicKey, p, g));

  ipcMain.handle('generate-schnorr', async (event, bits) => schnorr.generateKeys(bits));
  ipcMain.handle('sign-schnorr', async (event, { message, privateKey, publicKey, p, q, g }) => schnorr.sign(message, privateKey, publicKey, p, q, g));
  ipcMain.handle('verify-schnorr', async (event, { message, signature, publicKey, p, q, g }) => schnorr.verify(message, signature, publicKey, p, q, g));

  ipcMain.handle('send-public-key', async (event, { host, port, keyData }) => network.sendPublicKey(host, port, keyData));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});