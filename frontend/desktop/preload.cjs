const { contextBridge, ipcRenderer } = require("electron");

const CAPTURE_CHANNEL = "achievement-maker:capture-display";
const GLOBAL_CAPTURE_CHANNEL = "achievement-maker:global-capture";

contextBridge.exposeInMainWorld("achievementMakerDesktop", {
  isDesktop: true,
  captureScreen: () => ipcRenderer.invoke(CAPTURE_CHANNEL),
  onGlobalCapture: (callback) => {
    const listener = (_event, result) => callback(result);
    ipcRenderer.on(GLOBAL_CAPTURE_CHANNEL, listener);
    return () => ipcRenderer.removeListener(GLOBAL_CAPTURE_CHANNEL, listener);
  },
});
