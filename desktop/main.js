/**
 * desktop/main.js
 * Electron wrapper for the React frontend.
 *
 * Features:
 *   - Loads built frontend (dist/) or dev server
 *   - System tray icon with unread badge
 *   - Secure PIN storage via safeStorage
 *   - Native notifications
 *
 * Build: npm run build  (from /desktop)
 */

const {
  app, BrowserWindow, Tray, Menu, nativeImage,
  ipcMain, safeStorage, Notification,
} = require("electron");
const path = require("path");
const fs   = require("fs");

const DEV_URL  = "http://localhost:3000";
const PROD_DIR = path.join(__dirname, "../frontend/dist");
const IS_DEV   = !fs.existsSync(path.join(PROD_DIR, "index.html"));

let mainWindow = null;
let tray       = null;
let unreadCount = 0;

// ─── Window ───────────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width:  1200,
    height: 780,
    minWidth: 800,
    minHeight: 600,
    title: "Us, Always 💌",
    backgroundColor: "#f2c7c7",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (IS_DEV) {
    mainWindow.loadURL(DEV_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(PROD_DIR, "index.html"));
  }

  mainWindow.on("close", (e) => {
    // Minimise to tray instead of quitting
    e.preventDefault();
    mainWindow.hide();
  });
}

// ─── Tray ─────────────────────────────────────────────────────────────────────

function createTray() {
  // Inline 16×16 heart PNG as base64 for the tray icon
  const icon = nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADSSURBVDiNY/j//z8DJZihggEAAAD//2NgYGBgJFMDAAAA//8DAFVGBgHXGsL6AAAAAElFTkSuQmCC"
  );

  tray = new Tray(icon);
  tray.setToolTip("Us, Always 💌");

  const contextMenu = Menu.buildFromTemplate([
    { label: "Open",  click: () => mainWindow?.show() },
    { type: "separator" },
    { label: "Quit",  click: () => { app.exit(0); } },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on("click", () => mainWindow?.show());
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────

// Store PIN securely
ipcMain.handle("store-pin", (_e, pin) => {
  if (!safeStorage.isEncryptionAvailable()) return false;
  const encrypted = safeStorage.encryptString(pin);
  fs.writeFileSync(path.join(app.getPath("userData"), "pin.enc"), encrypted);
  return true;
});

// Verify PIN
ipcMain.handle("verify-pin", (_e, pin) => {
  const pinPath = path.join(app.getPath("userData"), "pin.enc");
  if (!fs.existsSync(pinPath)) return true; // no PIN set → always pass
  const buf       = fs.readFileSync(pinPath);
  const stored    = safeStorage.decryptString(buf);
  return stored === pin;
});

// Show native notification
ipcMain.on("notify", (_e, { title, body }) => {
  new Notification({ title, body, silent: false }).show();
  unreadCount++;
  tray?.setTitle(` ${unreadCount}`);
  app.badgeCount = unreadCount; // macOS dock badge
});

// Clear badge when window focuses
ipcMain.on("clear-badge", () => {
  unreadCount = 0;
  tray?.setTitle("");
  app.badgeCount = 0;
});

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on("window-all-closed", () => {
  // Keep running in tray
});

app.on("activate", () => {
  mainWindow?.show();
});
