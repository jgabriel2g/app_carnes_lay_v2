const { BrowserWindow } = require("electron");
const config = require("../config/app.config");

class PrintService {
  async printTicket(ticketHtml) {
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    });

    try {
      await printWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(ticketHtml)}`
      );

      // Obtener altura del contenido en píxeles
      const contentHeight = await printWindow.webContents.executeJavaScript(
        "document.body.scrollHeight"
      );

      // Convertir px a micrones (1px ≈ 264.58 micrones a 96 DPI)
      const heightInMicrons = Math.ceil(contentHeight * 264.58) + 5000; // +5mm margen

      const printOptions = {
        ...config.PRINT.OPTIONS,
        pageSize: {
          width: config.PRINT.OPTIONS.pageSize.width,
          height: heightInMicrons,
        },
      };

      printWindow.webContents.print(printOptions, (success, failureReason) => {
        if (!success) console.log("Impresión fallida:", failureReason);
        printWindow.close();
      });
    } catch (err) {
      console.error("Error al imprimir ticket:", err.message);
      printWindow.close();
    }
  }

  printCurrentWindow() {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.print(config.PRINT.OPTIONS, (success, failureReason) => {
        if (!success) console.log("Impresión fallida:", failureReason);
      });
    }
  }
}

module.exports = new PrintService();
