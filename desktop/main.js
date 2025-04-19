const { app, BrowserWindow, ipcMain } = require("electron");
const config = require("./config/app.config");
const serialService = require("./services/serial.service");
const printService = require("./services/print.service");


// Crear ventana principal
async function createWindow() {
  const win = new BrowserWindow({
    width: config.WINDOW.WIDTH,
    height: config.WINDOW.HEIGHT,
    title: config.WINDOW.TITLE,
    webPreferences: {
      preload: `${app.getAppPath()}/desktop/preload.js`,
      contextIsolation: true,
      nodeIntegration: true,
    },
  });

  await win.loadURL(config.ALLOWED_URLS.DEV);

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

  return win;
}


// Eventos de impresión
ipcMain.on("trigger-print", () => printService.printCurrentWindow());
ipcMain.on("print-ticket", (event, ticketHtml) =>
  printService.printTicket(ticketHtml)
);


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
