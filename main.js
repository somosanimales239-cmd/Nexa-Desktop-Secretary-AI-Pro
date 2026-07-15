const { app, BrowserWindow, ipcMain, safeStorage, clipboard, Notification, globalShortcut, Tray, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const PRODUCT_VERSION = '0.1.0';
let mainWindow;
let tray;
let stopped = false;
let settings = {};

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadSettings() {
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath(), 'utf8')) || {};
  } catch {
    settings = {};
  }
}

function saveSettings() {
  const target = settingsPath();
  const temporary = `${target}.tmp`;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(temporary, JSON.stringify(settings, null, 2), { mode: 0o600 });
  fs.renameSync(temporary, target);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: '#08101f',
    title: `Nexa Desktop Secretary AI Pro ${PRODUCT_VERSION}`,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', event => event.preventDefault());
  mainWindow.on('closed', () => { mainWindow = null; });
}

function activateEmergencyStop() {
  stopped = true;
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('nexa:event', { type: 'emergency-stop', active: true });
  if (Notification.isSupported()) new Notification({ title: 'Nexa Emergency Stop', body: 'All Nexa operations are stopped. WhatsApp was not closed.' }).show();
  return { active: true };
}

function registerIpc() {
  ipcMain.handle('app:get-state', () => ({
    product: 'Nexa Desktop Secretary AI Pro',
    version: PRODUCT_VERSION,
    platform: process.platform,
    stopped,
    whatsapp: { status: 'Implementation verified / Real WhatsApp environment not yet tested', capability: 'Not tested', detected: false },
    openai: { configured: Boolean(settings.openaiConfigured) },
    settings: { mode: settings.mode || 'Manual Mode', onboardingComplete: Boolean(settings.onboardingComplete) }
  }));
  ipcMain.handle('nexa:emergency-stop', () => activateEmergencyStop());
  ipcMain.handle('nexa:resume', () => { stopped = false; return { active: false }; });
  ipcMain.handle('nexa:clipboard-write', (_event, value) => {
    if (stopped || typeof value !== 'string' || value.length > 20000) throw new Error('Operation unavailable');
    clipboard.writeText(value);
    return { copied: true, status: 'Not sent' };
  });
  ipcMain.handle('settings:set-api-key', (_event, value) => {
    if (typeof value !== 'string' || value.length < 10 || value.length > 500 || !safeStorage.isEncryptionAvailable()) throw new Error('Secure storage is unavailable');
    settings.openaiKey = safeStorage.encryptString(value).toString('base64');
    settings.openaiConfigured = true;
    saveSettings();
    return { configured: true };
  });
  ipcMain.handle('settings:clear-api-key', () => {
    delete settings.openaiKey;
    settings.openaiConfigured = false;
    saveSettings();
    return { configured: false };
  });
  ipcMain.handle('settings:set', (_event, patch) => {
    if (!patch || typeof patch !== 'object') throw new Error('Invalid settings');
    const allowed = ['mode', 'onboardingComplete', 'notifications'];
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(patch, key)) settings[key] = patch[key];
    saveSettings();
    return { settings: { mode: settings.mode || 'Manual Mode', onboardingComplete: Boolean(settings.onboardingComplete) } };
  });
}

app.whenReady().then(() => {
  loadSettings();
  registerIpc();
  createWindow();
  globalShortcut.register('CommandOrControl+Shift+Escape', activateEmergencyStop);
  tray = new Tray(path.join(__dirname, 'src', 'tray-icon.png'));
  tray.setToolTip('Nexa Desktop Secretary AI Pro');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open Nexa', click: () => mainWindow?.show() },
    { label: 'Emergency Stop', click: activateEmergencyStop },
    { label: 'Quit', click: () => app.quit() }
  ]));
});

app.on('before-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!mainWindow) createWindow(); });
