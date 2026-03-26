const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  triggerPrint: () => ipcRenderer.send('trigger-print'),
  onWeight: (callback) => ipcRenderer.on('weight', (event, value) => callback(value)),

  // Auto-Updater API
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  onUpdaterEvent: (callback) => ipcRenderer.on('updater-event', (event, data) => callback(data)),
  removeUpdaterListener: () => ipcRenderer.removeAllListeners('updater-event')
})
