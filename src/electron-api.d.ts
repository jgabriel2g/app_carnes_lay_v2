declare global {
  interface Window {
    electronAPI?: {
      send: (channel: string, data?: any) => void;
      receive: (channel: string, func: (...args: any[]) => void) => void;
      removeAllListeners: (channel: string) => void;
      triggerPrint: () => void;
      onWeight: (callback: (value: string) => void) => void;
      checkForUpdates: () => void;
      onUpdaterEvent: (callback: (data: any) => void) => void;
      removeUpdaterListener: () => void;
    };
  }
}

export {};
