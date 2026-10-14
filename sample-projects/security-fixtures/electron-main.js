const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  win.loadURL('http://localhost:3000');
}

// Insecure IPC bridge executing arbitrary commands
ipcMain.on('execute-shell', (event, cmd) => {
  exec(cmd);
});

app.whenReady().then(createWindow);
