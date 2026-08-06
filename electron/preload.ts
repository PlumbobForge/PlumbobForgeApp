import { contextBridge, ipcRenderer, webFrame } from 'electron';

// Disable zooming completely
webFrame.setVisualZoomLevelLimits(1, 1);

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getBackendPort: () => ipcRenderer.invoke('get-backend-port'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getSystemLocale: () => ipcRenderer.invoke('get-system-locale'),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  installUpdate: () => ipcRenderer.send('install-update'),
  onUpdateEvent: (channel: string, callback: (data: any) => void) => {
    // Whitelist channels to prevent arbitrary IPC listening
    const validChannels = [
      'update-available',
      'update-not-available',
      'update-error',
      'download-progress',
      'update-downloaded'
    ];
    if (validChannels.includes(channel)) {
      // Remove any existing listeners so we don't duplicate on re-mounts
      ipcRenderer.removeAllListeners(channel);
      ipcRenderer.on(channel, (_event, data) => callback(data));
    }
  }
});
