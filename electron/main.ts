import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import net from 'net';

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let backendPort = 5184;

async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

function startBackend(port: number) {
  let backendPath = '';
  if (app.isPackaged) {
    backendPath = path.join(process.resourcesPath, 'dist-backend', 'PlumbobForge.Backend.exe');
  } else {
    // Development path: assume we ran build.ps1 to put it in dist-backend
    backendPath = path.join(__dirname, '../../dist-backend', 'PlumbobForge.Backend.exe');
  }

  // Start the process
  backendProcess = spawn(backendPath, [`--urls`, `http://127.0.0.1:${port}`], {
    cwd: path.dirname(backendPath)
  });

  backendProcess.stdout?.on('data', (data) => console.log(`[Backend] ${data}`));
  backendProcess.stderr?.on('data', (data) => console.error(`[Backend ERR] ${data}`));
}

async function createWindow() {
  backendPort = await getFreePort();
  startBackend(backendPort);

  mainWindow = new BrowserWindow({
    width: 1295,
    height: 740,
    minWidth: 1295,
    minHeight: 740,
    frame: false,
    show: false,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  const devToolsEnabled = process.argv.includes('--devtoolsenabled');

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (!devToolsEnabled) {
      // Disable devtools shortcuts
      if (
        input.key === 'F12' ||
        (input.control && input.shift && input.key.toLowerCase() === 'i')
      ) {
        event.preventDefault();
      }
      // Disable zoom shortcuts
      if (
        input.control &&
        (input.key === '=' || input.key === '-' || input.key === '0')
      ) {
        event.preventDefault();
      }
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  ipcMain.handle('get-backend-port', () => backendPort);

  ipcMain.on('window-minimize', () => mainWindow?.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window-close', () => mainWindow?.close());
  ipcMain.handle('get-app-version', () => app.getVersion());
  
  ipcMain.handle('select-directory', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  // Auto-updater setup
  autoUpdater.autoDownload = false;

  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update-available', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    mainWindow?.webContents.send('update-not-available', info);
  });

  autoUpdater.on('error', (err) => {
    mainWindow?.webContents.send('update-error', err.message);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow?.webContents.send('download-progress', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('update-downloaded', info);
  });

  ipcMain.on('check-for-updates', () => {
    autoUpdater.checkForUpdates().catch(err => {
      mainWindow?.webContents.send('update-error', err.message);
    });
  });

  ipcMain.on('download-update', () => {
    autoUpdater.downloadUpdate().catch(err => {
      mainWindow?.webContents.send('update-error', err.message);
    });
  });

  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

let isQuitting = false;

app.on('before-quit', (e) => {
  if (backendProcess && !isQuitting) {
    e.preventDefault();
    isQuitting = true;

    // Send shutdown signal but do not await to avoid deadlocks
    fetch(`http://127.0.0.1:${backendPort}/api/shutdown`, { method: 'POST' }).catch(() => { });

    // Wait briefly for graceful shutdown, then forcefully kill and quit
    setTimeout(() => {
      if (backendProcess) {
        try {
          backendProcess.kill();
        } catch (err) {
          console.error('Error killing backend process:', err);
        }
        backendProcess = null;
      }
      app.quit();
    }, 500);
  }
});
