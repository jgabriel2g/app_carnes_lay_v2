// load environment variables from .env file
require("dotenv").config();

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const config = require("./config/app.config");
const serialService = require("./services/serial.service");
const printService = require("./services/print.service");
const updaterService = require("./services/updater.service");


// Crear ventana principal
async function createWindow() {
  const win = new BrowserWindow({
    width: config.WINDOW.WIDTH,
    height: config.WINDOW.HEIGHT,
    title: config.WINDOW.TITLE,
    webPreferences: {
      preload: `${app.getAppPath()}/desktop/preload.js`,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Cargar front desde el build de angular
  const indexPath = path.join(__dirname, '..', 'www', 'index.html');
  const loadUrl = `file://${indexPath}`;
  await win.loadURL(loadUrl);
  // await win.loadURL(config.ALLOWED_URLS.PROD);
  win.setMenu(null);

  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools();
  }

  // Configurar permisos de Web Serial API
  win.webContents.session.setDevicePermissionHandler(
    (details) => details.deviceType === "serial"
  );

  // Iniciar servicios
  await serialService.connectSerial(win);

  // Inicializar auto-updater
  updaterService.initUpdater(win);

  return win;
}


// Eventos de impresión
ipcMain.on("trigger-print", () => printService.printCurrentWindow());
ipcMain.on("print-ticket", (event, ticketHtml) =>
  printService.printTicket(ticketHtml)
);

// Eventos de actualización
ipcMain.on("check-for-updates", () => updaterService.checkForUpdates());


// Iniciar aplicación
app.whenReady().then(async () => {
  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Cerrar aplicación
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
