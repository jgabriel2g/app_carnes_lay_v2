const { autoUpdater } = require("electron-updater");
const { dialog } = require("electron");
const secrets = require("../config/secrets");

/**
 * Servicio de Auto-Actualización
 * Maneja la detección, descarga e instalación de actualizaciones
 */

let mainWindow = null;

/**
 * Inicializa el servicio de actualizaciones
 * @param {BrowserWindow} win - Ventana principal de Electron
 */
function initUpdater(win) {
  mainWindow = win;

  // Configuración
  autoUpdater.autoDownload = true; // Descargar automáticamente
  autoUpdater.autoInstallOnAppQuit = true; // Instalar al cerrar la app
  autoUpdater.requestHeaders = {
    Authorization: `token ${secrets.GH_TOKEN}`,
  };

  // Solo verificar actualizaciones en producción
  if (process.env.NODE_ENV === "development") {
    console.log("⚠️  Auto-updater deshabilitado en desarrollo");
    return;
  }

  // Listeners de eventos
  setupEventListeners();

  // Verificar actualizaciones al iniciar (después de 3 segundos)
  setTimeout(() => {
    console.log("🔍 Verificando actualizaciones...");
    autoUpdater.checkForUpdates();
  }, 3000);

  // Verificar cada 30 minutos
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 30 * 60 * 1000);
}

/**
 * Configura los event listeners de autoUpdater
 */
function setupEventListeners() {
  // Cuando encuentra una actualización disponible
  autoUpdater.on("update-available", (info) => {
    console.log("✅ Actualización disponible:", info.version);
    sendStatusToWindow("update-available", {
      version: info.version,
      releaseDate: info.releaseDate,
    });
  });

  // Cuando NO hay actualizaciones
  autoUpdater.on("update-not-available", (info) => {
    console.log("ℹ️  App actualizada. Versión actual:", info.version);
    sendStatusToWindow("update-not-available", { version: info.version });
  });

  // Error al verificar/descargar
  autoUpdater.on("error", (err) => {
    console.error("❌ Error en auto-updater:", err);
    sendStatusToWindow("update-error", { message: err.message });
  });

  // Progreso de descarga
  autoUpdater.on("download-progress", (progressObj) => {
    const message = `Descargando: ${Math.round(progressObj.percent)}%`;
    console.log(`📥 ${message}`);
    sendStatusToWindow("download-progress", {
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
      bytesPerSecond: progressObj.bytesPerSecond,
    });
  });

  // Descarga completada
  autoUpdater.on("update-downloaded", (info) => {
    console.log("✅ Actualización descargada:", info.version);
    console.log("🔄 La actualización se instalará al cerrar la app");

    sendStatusToWindow("update-downloaded", {
      version: info.version,
      releaseDate: info.releaseDate,
    });

    // Mostrar dialog nativo para reiniciar ahora
    showUpdateReadyDialog(info);
  });
}

/**
 * Muestra dialog pidiendo reiniciar para aplicar actualización
 * @param {Object} info - Información de la actualización
 */
function showUpdateReadyDialog(info) {
  const dialogOpts = {
    type: "info",
    buttons: ["Reiniciar ahora", "Más tarde"],
    title: "Actualización lista",
    message: `Versión ${info.version} descargada`,
    detail:
      "La aplicación se reiniciará para aplicar la actualización. ¿Deseas reiniciar ahora?",
  };

  dialog.showMessageBox(mainWindow, dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      // isSilent=true: instala sin mostrar wizard NSIS
      // isForceRunAfter=true: reabre la app después de instalar
      console.log("🔄 Reiniciando para aplicar actualización...");
      autoUpdater.quitAndInstall(true, true);
    } else {
      console.log("⏸️  Actualización pospuesta. Se aplicará al cerrar la app.");
    }
  });
}

/**
 * Envía estado de actualización a la ventana (renderer process)
 * @param {string} event - Nombre del evento
 * @param {Object} data - Datos del evento
 */
function sendStatusToWindow(event, data) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send("updater-event", { event, data });
  }
}

/**
 * Fuerza verificación manual de actualizaciones
 */
function checkForUpdates() {
  if (process.env.NODE_ENV === "development") {
    console.log("⚠️  Auto-updater no funciona en desarrollo");
    return;
  }
  autoUpdater.checkForUpdates();
}

module.exports = {
  initUpdater,
  checkForUpdates,
};
