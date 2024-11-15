const { app, BrowserWindow, ipcMain } = require('electron');
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const RECONNECT_INTERVAL = 5000;

const cleanValue = (data) => {
  const info = data.split(' ');
  return info[2].split('k')[0];
};

const findBalance = async () => {
  try {
    const ports = await SerialPort.list();
    console.log(ports);
    const balancePort = ports.find(
      (port) => port.manufacturer && port.manufacturer.includes("FTDI")
    );
    if (balancePort) {
      console.log(`Puerto encontrado: ${balancePort.path}`);
      return balancePort.path;
    } else {
      console.error('No se encontró la báscula.');
      return null;
    }
  } catch (err) {
    console.error('Error al listar los puertos:', err);
    return null;
  }
};

const listenBalance = (win, path) => {
  let port;
  const openPort = () => {
    port = new SerialPort(
      { path: path, baudRate: 9600, autoOpen: false },
      (err) => {
        if (err) {
          console.log('Error opening port:', err.message);
        }
      }
    );

    const parser = new ReadlineParser({ delimiter: '\n' });
    port.pipe(parser);

    port.open((err) => {
      if (err) {
        console.error('Error al abrir el puerto:', err.message);
        attemptReconnect();
      } else {
        console.log('Puerto abierto');
      }
    });

    port.on('error', (err) => {
      console.log('Error en el puerto:', err.message);
      attemptReconnect();
    });

    port.on('close', () => {
      console.log('Puerto cerrado. Intentando reconectar...');
      attemptReconnect();
    });

    parser.on('data', (data) => {
      let value = cleanValue(data);
      win.webContents.send('weight', value);
    });
  };

  const attemptReconnect = () => {
    if (port) {
      port.close((err) => {
        if (err) {
          console.log('Error cerrando el puerto:', err.message);
        }
        console.log(`Reintentando conexión en ${RECONNECT_INTERVAL / 1000} segundos...`);
        setTimeout(openPort, RECONNECT_INTERVAL);
      });
    } else {
      console.log(`Reintentando conexión en ${RECONNECT_INTERVAL / 1000} segundos...`);
      setTimeout(openPort, RECONNECT_INTERVAL);
    }
  };

  openPort();
};

const createWindow = async () => {
  let win = new BrowserWindow({
    width: 1200,
    height: 1000,
    title: 'Carnes La Victoria',
    webPreferences: {
      preload: `${app.getAppPath()}/desktop/preload.js`,
      contextIsolation: true,
      nodeIntegration: true,
    }
  });

  win.loadURL('https://lay-v2.netlify.app/').then();
  win.setMenu(null);

  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }

  win.on('closed', () => {
    win = null;
  });

  // find balance
  win.webContents.session.setDevicePermissionHandler((details) => {
    return details.deviceType === 'serial';
  });

  findBalance().then((portPath) => {
    if (portPath) listenBalance(win, portPath);
  });
};

ipcMain.on('trigger-print', (event) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.webContents.print(
      {
        silent: true,
        color: false,
        deviceName: 'POS-80C',
        printBackground: false,
        pageSize: { width: 72100, height: 210000 },
        margins: { marginType: 'none' }
      },
      (success, failureReason) => {
        if (!success) console.log('Impresión fallida:', failureReason);
      }
    );
  }
});

ipcMain.on('print-ticket', (event, ticketHtml) => {
  let printWindow = new BrowserWindow({ show: false });
  printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(ticketHtml)}`).then();

  printWindow.webContents.on('did-finish-load', () => {
    printWindow.webContents.print({
      silent: true,
      color: false,
      printBackground: false,
      deviceName: 'POS-80C',
      pageSize: { width: 72100, height: 210000 },
      margins: { marginType: 'none' }
    },(success, failureReason) => {
      if (!success) console.log('Impresión fallida:', failureReason);
    });
  });
});

app.whenReady().then(() => {
  createWindow().then();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow().then();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
