import { App, BrowserWindow, dialog, ipcMain } from "electron";
import * as path from "path";
import IPCEventType from "./Channels";
import { Config } from "./Config";
import { ElectronUtils } from "./ElectronUtils";
import { IFileInfo, IProcessOptions } from "./FF/FFInterfaces";
import { log } from "./Log";

/* tslint:disable:naming-convention */

declare const global: any;
/***
 * Set Global Root path
 * // TODO(liam): Remove this in favour of Config
 */
global.rootpath = `${path.resolve(path.join(path.dirname(__filename), "../"))}`;
global.appConfig = {
  bin: {
      ffmpeg: path.join(global.rootpath, "/ffmpeg/bin/ffmpeg"),
      ffprobe: path.join(global.rootpath, "/ffmpeg/bin/ffprobe")
  }
};

export default class Main {
    public static MainWindow: BrowserWindow = null;
    public static EncodeWin: BrowserWindow = null;
    public static Application: App;
    public static IsEncoding: boolean = false;

    private static onSpawnEncoder() {
        Main.IsEncoding = true;
        log.debug("Main::onSpawnEncoder Encoding Started.");
    }

    private static onEncodeCompleted() {
        Main.IsEncoding = false;
        log.debug("Main::onEncodeCompleted Encoding Complete.");
    }

    public static Init(application: App) {
        Main.Application = application;
        Main.Application.on("ready", Main.OnReady);
    }

    public static OnReady() {
        Main.CreateMain();
    }

    public static OnReadyToShow(win: BrowserWindow) {
        win.show();
        Main.ShowDevTools(win);
    }

    public static CreateMain() {
        const mainOpts: any = {
            width: 1200,
            height: 800,
            frame: false,
            show: false,
            icon: `${Config.System.AppRoot}/icons/valence-prpl-base-transp.png`
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

        Main.MainWindow.loadURL(ElectronUtils.GetTemplate("main_window.html"));

        Main.SetupIPC();

    }

    public static onCreateEncode(event: Electron.Event, probeInfo: IFileInfo, processOptions: IProcessOptions) {
        log.debug(probeInfo, processOptions);
        Main.EncodeWin = new BrowserWindow({
            width: 900,
            height: 200,
            show: true,
            modal: true,
            parent: Main.MainWindow,
            frame: false,
            autoHideMenuBar: true,
            icon: `${Config.System.AppRoot}/icons/valence-prpl-base-transp.png`
        });

        Main.EncodeWin.loadURL(ElectronUtils.GetTemplate("encode_window.html"));

        ipcMain.on(IPCEventType.APP_ENCODE_WINDOW_READY, () => {
            Main.EncodeWin.show();
            Main.EncodeWin.webContents.send(IPCEventType.SPAWN_ENCODER, probeInfo, processOptions);
        });
        ipcMain.on(IPCEventType.ENCODE_COMPLETED, Main.onIPCEncodeCompleted);
        ipcMain.on(IPCEventType.APP_CLOSE_ENCODE_WINDOW, Main.onIPCEncodeCompleted);
        ipcMain.on(IPCEventType.APP_SHOW_DEV_TOOLS_ENCODE_WINDOW, () => Main.ShowDevTools(Main.EncodeWin));

        Main.EncodeWin.on("closed", () => {
            Main.EncodeWin = null;
        });

    }

    private static onIPCEncodeCompleted() {
        Main.EncodeWin.close();
    }

    private static onOpenFile(event: Electron.Event) {
        dialog.showOpenDialog({
            properties: ["openFile"],

        }, (files: string[]) => {
            if (files) {
                const file: string = files[0];
                event.sender.send(IPCEventType.APP_FILE_SELECTED, file);
            }
        });
    }

    private static onSaveFile(event: Electron.Event, defaultPath: string) {
        dialog.showSaveDialog({
          title: "Select output location",
          defaultPath,
          filters: [
            {
              name: "MP4 Video", extensions: ["mp4", "m4v"]
            }
          ]
        }, (file: string) => {
          if (file) {
            event.sender.send(IPCEventType.APP_SAVE_FILE_SELECTED, file);
          }
        });
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
        log.debug("Setup");
        ipcMain.on(IPCEventType.SHOW_DEV_TOOLS, () => { Main.ShowDevTools(Main.MainWindow); });
        ipcMain.on(IPCEventType.ENCODE_COMPLETED, Main.onEncodeCompleted);
        ipcMain.on(IPCEventType.SPAWN_ENCODER, Main.onSpawnEncoder);
        ipcMain.on(IPCEventType.APP_OPEN_FILE, Main.onOpenFile);
        ipcMain.on(IPCEventType.APP_SAVE_FILE, Main.onSaveFile);
        ipcMain.on(IPCEventType.APP_OPEN_ENCODE_WINDOW, Main.onCreateEncode);

        ipcMain.on(IPCEventType.APP_QUIT, () => {
            Main.Application.quit();
        });

    }
}
