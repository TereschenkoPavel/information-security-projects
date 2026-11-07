const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  onKeyReceived: (callback) => ipcRenderer.on('key-received', (_, data) => callback(data))
});