import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Carnes La victoria',
  webDir: 'www',
  server: {
    url: 'https://lay-v2.netlify.app',
    cleartext: true
  }
};

export default config;
