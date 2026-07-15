const { contextBridge, ipcRenderer } = require('electron');

const invoke = (channel, value) => ipcRenderer.invoke(channel, value);

contextBridge.exposeInMainWorld('nexa', Object.freeze({
  versions: Object.freeze({
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }),
  getState: () => invoke('app:get-state'),
  emergencyStop: () => invoke('nexa:emergency-stop'),
  resume: () => invoke('nexa:resume'),
  copyText: text => invoke('nexa:clipboard-write', text),
  setApiKey: key => invoke('settings:set-api-key', key),
  clearApiKey: () => invoke('settings:clear-api-key'),
  setSettings: patch => invoke('settings:set', patch),
  onEvent: callback => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('nexa:event', listener);
    return () => ipcRenderer.removeListener('nexa:event', listener);
  }
}));
