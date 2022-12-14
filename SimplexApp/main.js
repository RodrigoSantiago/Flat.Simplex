const { app, BrowserWindow, Main } = require('electron');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1366 + 250,//1280,
        height: 940,//768,
        resizable: true
    });

    win.removeMenu();
    win.loadFile('index.html');
    win.webContents.openDevTools();
};

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
});
