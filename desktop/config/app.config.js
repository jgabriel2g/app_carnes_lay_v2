module.exports = {
  // Configuración de la báscula
  SCALE: {
    VENDOR_ID: "0403",
    PRODUCT_ID: "6001",
    BAUD_RATE: 9600,
    RETRY_MS: 1000,
  },

  // Configuración de la ventana
  WINDOW: {
    WIDTH: 1200,
    HEIGHT: 1000,
    TITLE: "Carnes La Victoria",
  },

  // URLs permitidas
  ALLOWED_URLS: {
    DEV: "http://localhost:4200",
    PROD: "https://lay-v2.netlify.app/",
  },

  // Configuración de impresión
  PRINT: {
    OPTIONS: {
      silent: true,
      color: false,
      deviceName: "POS-80C",
      printBackground: false,
      pageSize: { width: 72100, height: 210000 },
      margins: { marginType: "none" },
    },
  },
};
