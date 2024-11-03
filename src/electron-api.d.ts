declare global {
  interface Window {
    electronAPI: {
      send: (channel: string, data: any) => void;
      receive: (channel: string, func: Function) => void;
      removeAllListeners: (channel: string) => void;
      triggerPrint: () => void;
      weight: () => void;
    };
  }
}

export {};
