import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Carnes Lay',
  webDir: 'www',
  server: {
    url: 'https://app.laycloud.lat',
    cleartext: true
  }
};

export default config;
