/**
 * desktop/preload.js
 * Exposes safe IPC bridges to the renderer process.
 */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  storePin:   (pin)      => ipcRenderer.invoke("store-pin",  pin),
  verifyPin:  (pin)      => ipcRenderer.invoke("verify-pin", pin),
  notify:     (opts)     => ipcRenderer.send("notify",       opts),
  clearBadge: ()         => ipcRenderer.send("clear-badge"),
});
