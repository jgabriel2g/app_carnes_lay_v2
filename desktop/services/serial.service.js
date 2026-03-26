const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const config = require("../config/app.config.js");

class SerialService {
  constructor() {
    this.port = null;
    this.parser = null;
    this.reconnectTimer = null;
  }

  cleanValue(data) {
    const info = data.split(" ");
    return info[info.length - 1].split("k")[0];
  }

  async findBalancePath() {
    const ports = await SerialPort.list();
    return (
      ports.find(
        (p) =>
          p.vendorId === config.SCALE.VENDOR_ID &&
          p.productId === config.SCALE.PRODUCT_ID
      )?.path ?? null
    );
  }

  scheduleReconnect(win) {
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(
      () => this.connectSerial(win),
      config.SCALE.RETRY_MS
    );
  }

  async connectSerial(win) {
    clearTimeout(this.reconnectTimer);

    if (this.port?.isOpen) return;

    const path = await this.findBalancePath();
    if (!path) {
      this.scheduleReconnect(win);
      return;
    }

    this.port = new SerialPort({
      path,
      baudRate: config.SCALE.BAUD_RATE,
      lock: false,
      autoOpen: false,
    });
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: "\n" }));

    this.setupEventListeners(win);
    this.port.open((err) => {
      if (err) {
        console.error("❌ No se pudo abrir:", err.message);
        this.scheduleReconnect(win);
      }
    });
  }

  setupEventListeners(win) {
    this.port.once("open", () =>
      console.log(`✅ Puerto abierto: ${this.port.path}`)
    );

    this.port.on("close", (err) => {
      console.warn("📴 Puerto cerrado:", err?.message ?? "-");
      this.scheduleReconnect(win);
    });

    this.port.on("error", (err) => {
      console.error("⚠️ Error puerto:", err.message);
      this.scheduleReconnect(win);
    });

    this.parser.on("data", (data) => {
      const value = this.cleanValue(data);
      win.webContents.send("weight", value);
    });
  }
}

module.exports = new SerialService();
