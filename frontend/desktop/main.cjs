const path = require("node:path");

const {
  app,
  BrowserWindow,
  desktopCapturer,
  globalShortcut,
  ipcMain,
  screen,
} = require("electron");

const CAPTURE_CHANNEL = "achievement-maker:capture-display";
const GLOBAL_CAPTURE_CHANNEL = "achievement-maker:global-capture";
const HOTKEY = "Alt+Shift+S";

let mainWindow;
let globalCaptureInProgress = false;

function captureUnavailableMessage() {
  if (process.platform === "darwin") {
    return "Screen capture is unavailable. Allow Screen Recording for Electron in System Settings, then restart the desktop app.";
  }

  if (process.platform === "win32") {
    return "Screen capture is unavailable. Check that Windows privacy or security software allows screen capture, then restart the desktop app.";
  }

  return "Screen capture is unavailable. Check your desktop portal or screen-capture permissions, then restart the desktop app.";
}

async function captureActiveDisplay() {
  const cursorPoint = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPoint);
  const scaleFactor = display.scaleFactor || 1;
  const thumbnailSize = {
    width: Math.max(1, Math.round(display.size.width * scaleFactor)),
    height: Math.max(1, Math.round(display.size.height * scaleFactor)),
  };
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize,
  });
  const source =
    sources.find((candidate) => candidate.display_id === String(display.id)) ??
    sources[0];

  if (!source || source.thumbnail.isEmpty()) {
    throw new Error(captureUnavailableMessage());
  }

  return source.thumbnail.toDataURL();
}

async function captureResult() {
  try {
    return { dataUrl: await captureActiveDisplay() };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Screen capture failed.",
    };
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 650,
    title: "Game Achievement Maker",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  const frontendUrl =
    process.env.ACHIEVEMENT_MAKER_FRONTEND_URL ?? "http://127.0.0.1:5173";
  void mainWindow.loadURL(frontendUrl);
  mainWindow.on("closed", () => {
    mainWindow = undefined;
  });
}

function registerCaptureHotkey() {
  const registered = globalShortcut.register(HOTKEY, async () => {
    if (globalCaptureInProgress || !mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    globalCaptureInProgress = true;
    try {
      mainWindow.webContents.send(GLOBAL_CAPTURE_CHANNEL, await captureResult());
    } finally {
      globalCaptureInProgress = false;
    }
  });

  if (!registered) {
    console.error(`Could not register global shortcut ${HOTKEY}.`);
  }
}

app.whenReady().then(() => {
  ipcMain.handle(CAPTURE_CHANNEL, captureResult);
  createWindow();
  registerCaptureHotkey();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
