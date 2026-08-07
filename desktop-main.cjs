const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'JEE Physics Simulation & AI Studio',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#020617',
    autoHideMenuBar: true,
  });

  const appUrl = 'http://localhost:3000';

  // Poll server until ready
  const checkServer = setInterval(() => {
    fetch(appUrl + '/api/health')
      .then(() => {
        clearInterval(checkServer);
        mainWindow.loadURL(appUrl);
      })
      .catch(() => {
        // Server starting...
      });
  }, 500);
}

app.whenReady().then(() => {
  // Spawn local server
  serverProcess = spawn('npx', ['tsx', 'server.ts'], {
    cwd: __dirname,
    env: { ...process.env, PORT: '3000' },
    stdio: 'inherit',
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
