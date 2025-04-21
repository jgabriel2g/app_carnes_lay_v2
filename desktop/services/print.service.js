const { BrowserWindow } = require("electron");
const config = require("../config/app.config");

class PrintService {
  printTicket(ticketHtml) {
    const printWindow = new BrowserWindow({ show: false });

    printWindow
      .loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(ticketHtml)}`)
      .then(() => {
        printWindow.webContents.print(
          config.PRINT.OPTIONS,
          (success, failureReason) => {
            if (!success) console.log("Impresión fallida:", failureReason);
          }
        );
      });
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
