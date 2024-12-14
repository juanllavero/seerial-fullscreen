import { app, BrowserWindow, dialog, ipcMain, screen } from "electron";
import { fileURLToPath } from "node:url";
import path from "path";
import * as fs from "fs";

import { MPVController } from "../src/data/objects/MPVController";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { LibraryData } from "@interfaces/LibraryData";
import { SeriesData } from "@interfaces/SeriesData";
import { SeasonData } from "@interfaces/SeasonData";
import { EpisodeData } from "@interfaces/EpisodeData";

//#region PROPERTIES AND DATA READING

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

let win: BrowserWindow | null;
let fullScreenWindow: BrowserWindow | null;
let controlsWindow: BrowserWindow | null;
let mpvController: MPVController | null = null;
//#endregion

//#region CONFIGURATION FILE
const configPath = app.isPackaged
	? path.join(path.dirname(app.getPath("exe")), "resources/config/config.json")
	: path.join(app.getAppPath(), "resources/config/config.json");

// Cargar o crear la configuración
function loadOrCreateConfig(): Record<string, any> {
	if (fs.existsSync(configPath)) {
		const data = fs.readFileSync(configPath, "utf-8");
		return JSON.parse(data);
	} else {
		const defaultConfig = { language: "es-ES" };
		fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
		return defaultConfig;
	}
}

// Guardar configuración
function saveConfig(config: Record<string, any>): void {
	fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

let configData = loadOrCreateConfig();

// IPC Handlers para `get` y `set`
/*ipcMain.handle("get-config", (_event, key: string, defaultValue: any) => {
	if (!(key in configData)) {
		configData[key] = defaultValue;
		saveConfig(configData);
	}
	return configData[key];
});

ipcMain.handle("set-config", (_event, key: string, value: any) => {
	configData[key] = value;
	saveConfig(configData);
});*/
//#endregion

//#region LOCALIZATION
i18next.use(Backend).init({
	fallbackLng: "en-US",
	supportedLngs: ["en-US", "es-ES", "de-DE", "fr-FR", "it-IT"],
	backend: {
		loadPath: "./src/locales/{{lng}}.json",
	},
});

// Manejar solicitudes de traducción desde las ventanas renderizadas
ipcMain.handle("translate", (_event, key) => {
	return i18next.t(key);
});
//#endregion

//#region WINDOWS CREATION
function createWindow() {
	const { width, height } = screen.getPrimaryDisplay().workAreaSize;

	const windowWidth = Math.floor(width * 0.7);
	const windowHeight = Math.floor(height * 0.8);

	win = new BrowserWindow({
		width: windowWidth,
		height: windowHeight,
		minWidth: 820,
		minHeight: 500,
		alwaysOnTop: false,
		transparent: false,
		titleBarStyle: "hidden",
		backgroundColor: "#00FFFFFF",
		icon: "./src/assets/icon.ico",
		frame: true,
		webPreferences: {
			preload: path.join(__dirname, "preload.mjs"),
			sandbox: true,
			contextIsolation: true,
			nodeIntegration: true,
			webSecurity: false,
			plugins: true,
		},
	});

	win.webContents.on("did-finish-load", () => {
		win?.webContents.send(
			"main-process-message",
			new Date().toLocaleString()
		);
	});

	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
	} else {
		win.loadFile(path.join(RENDERER_DIST, "index.html"));
	}

	win.on("maximize", () => {
		win?.webContents.send("window-state-change", "maximized");
	});

	win.on("unmaximize", () => {
		win?.webContents.send("window-state-change", "restored");
	});

	win.once("ready-to-show", () => {
		win?.show();
	});

	mpvController = new MPVController(win!);
}

// Crear una ventana de controles
function createControlWindow(
	library: LibraryData,
	series: SeriesData,
	season: SeasonData,
	episode: EpisodeData
) {
	controlsWindow = new BrowserWindow({
		parent: win!,
		width: win?.getBounds().width,
		height: win?.getBounds().height,
		minWidth: 820,
		minHeight: 500,
		alwaysOnTop: false,
		icon: "./src/assets/icon.ico",
		transparent: true,
		frame: false,
		hasShadow: false,
		resizable: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.mjs"),
			contextIsolation: true,
			nodeIntegration: true,
			webSecurity: false,
			plugins: true,
		},
	});

	if (VITE_DEV_SERVER_URL) {
		controlsWindow.loadURL(path.join(VITE_DEV_SERVER_URL, "controls"));
	} else {
		controlsWindow.loadFile(path.join(RENDERER_DIST, "../controls.html"));
	}

	// Adjust the size of the two windows to be the same
	if (win) controlsWindow.setBounds(win.getBounds());

	win?.on("resize", () => {
		if (win) controlsWindow?.setBounds(win.getBounds());
	});

	win?.on("move", () => {
		if (win) controlsWindow?.setBounds(win.getBounds());
	});

	controlsWindow.on("enter-full-screen", () => {
		controlsWindow?.webContents.send("window-state-change", "fullscreen");
	});

	controlsWindow.on("leave-full-screen", () => {
		controlsWindow?.webContents.send(
			"window-state-change",
			"exit-fullscreen"
		);
	});

	controlsWindow.on("closed", () => {
		controlsWindow = null;
	});

	controlsWindow.webContents.on("did-finish-load", () => {
		controlsWindow?.webContents.send(
			"data-to-controls",
			library,
			series,
			season,
			episode
		);
	});
}

function createFullscreenWindow() {
	fullScreenWindow = new BrowserWindow({
		fullscreen: false,
		alwaysOnTop: false,
		icon: "./src/assets/icon.ico",
		transparent: false,
		frame: false,
		hasShadow: false,
		resizable: true,
		webPreferences: {
			preload: path.join(__dirname, "preload.mjs"),
			contextIsolation: true,
			nodeIntegration: true,
			webSecurity: false,
			plugins: true,
		},
	});

	if (VITE_DEV_SERVER_URL) {
		fullScreenWindow.loadURL(path.join(VITE_DEV_SERVER_URL, "fullscreen"));
	} else {
		fullScreenWindow.loadFile(path.join(RENDERER_DIST, "../fullscreen.html"));
	}
}

//#endregion

//#region VIDEO PLAYER INTERACTION
ipcMain.on(
	"play-video",
	async (
		_event,
		library: LibraryData,
		series: SeriesData,
		season: SeasonData,
		episode: EpisodeData
	) => {
		if (!controlsWindow) {
			if (!mpvController) mpvController = new MPVController(win!);

			mpvController.startMPV(episode.videoSrc);

			createControlWindow(library, series, season, episode);
		}
	}
);

ipcMain.on("toggle-pause", () => {
	controlsWindow?.webContents.send("toggle-pause");
});

ipcMain.on("stop-video", () => {
	if (mpvController) {
		mpvController.stop();
		controlsWindow?.close();
		controlsWindow = null;
		win?.setResizable(true);
		win?.webContents.send("video-stopped");
	}
});

ipcMain.on("mpv-command", (_event, args) => {
	if (mpvController) {
		mpvController.sendCommand(args);
	}
});

ipcMain.on("show-controls", () => {
	controlsWindow?.webContents.send("show-controls");
});

ipcMain.on("hide-controls", () => {
	controlsWindow?.webContents.send("hide-controls");
});
//#endregion

//#region FOLDER AND FILES SELECTION
ipcMain.handle("dialog:openFolder", async () => {
	const result = await dialog.showOpenDialog({
		properties: ["openDirectory"],
	});
	return result.filePaths;
});
//#endregion

//#region WINDOW CONTROLS
ipcMain.on("minimize-window", () => {
	win?.minimize();
});

ipcMain.on("maximize-window", () => {
	if (win?.isMaximized()) {
		win?.unmaximize();
	} else {
		win?.maximize();
	}
});

ipcMain.on("fullscreen-controls", () => {
	if (win?.isSimpleFullScreen()) {
		controlsWindow?.setSimpleFullScreen(false);
		win.setSimpleFullScreen(false);

		controlsWindow?.setBounds(win.getBounds());
	} else {
		win?.setSimpleFullScreen(true);
		controlsWindow?.setSimpleFullScreen(true);
	}
});

ipcMain.on("close-window", () => {
	win?.close();
});

//#endregion

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
		win = null;
		controlsWindow = null;
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.disableHardwareAcceleration();

app.whenReady().then(() => {
	if (process.env.WINDOW_TYPE !== "fullscreen") {
		createWindow();
	} else {
		createFullscreenWindow();
	}
});
