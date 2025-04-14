import { app, BrowserWindow } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 920,
    webPreferences: {
      nodeIntegration: true,    // Allows Node.js integration in the renderer process (for now)
      contextIsolation: false,  // Disable context isolation for simplicity in this initial setup
      preload: path.join(__dirname, 'preload.js'), // Optional: for more secure context bridging
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../index.html')); // Assuming your HTML is in the root
  // Or load a URL: mainWindow.loadURL('https://example.com');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});