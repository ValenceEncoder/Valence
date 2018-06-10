import { App, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";
import IPCEventType from "./Channels";

export default class Main {
    public static MainWindow: BrowserWindow = null;
    public static Application: App;

    public static IndexPath: string;
    public static MaskPath: string;
    public static RegionPath: string;

    public static Init(application: App) {
        Main.Application = application;
        Main.Application.on("ready", Main.OnReady);
    }

    public static OnReady() {
        Main.IndexPath = path.join(__dirname, "..", "views", "index.html");
        Main.CreateMain();
    }

    public static OnReadyToShow(win: BrowserWindow) {
        win.show();
        Main.ShowDevTools(win);
    }

    public static CreateMain() {
        const mainOpts: any = {
            width: 1450,
            height: 800,
            frame: false,
            show: false
        };

        Main.MainWindow = new BrowserWindow(mainOpts);
        Main.MainWindow.once("ready-to-show", () => { Main.OnReadyToShow(Main.MainWindow); });
        Main.MainWindow.center();

        Main.MainWindow.on("blur", () => {
            Main.MainWindow.webContents.send(IPCEventType.MAIN_WINDOW_BLUR);
        });
        Main.MainWindow.on("focus", () => {
            Main.MainWindow.webContents.send(IPCEventType.MAIN_WINDOW_BLUR);
        });

        Main.MainWindow.loadURL(url.format({pathname: Main.IndexPath, protocol: "file", slashes: true}));

        Main.SetupIPC();

    }

    public static ShowDevTools(win: BrowserWindow): void {
        if (!win.webContents.isDevToolsOpened()) {
            win.webContents.openDevTools();
            win.webContents.on("devtools-opened", () => {
                win.webContents.devToolsWebContents.focus();
            });
            return;
        }
        win.webContents.devToolsWebContents.focus();
    }

    public static SetupIPC() {
        ipcMain.on(IPCEventType.SHOW_DEV_TOOLS, () => { Main.ShowDevTools(Main.MainWindow); });

        ipcMain.on(IPCEventType.APP_QUIT, () => {
            if (Main.MainWindow.isClosable()) { Main.MainWindow.close(); }
            Main.Application.quit();
        });

    }
}
