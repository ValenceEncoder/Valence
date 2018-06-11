import { App, BrowserWindow, dialog, ipcMain } from "electron";
import * as log from "electron-log";
import * as path from "path";
import * as url from "url";
import IPCEventType from "./Channels";
import { Config } from "./Config";

// Initialise Logging plugin
log.transports.file.level = (Config.Logging.File.Enabled) ? Config.Logging.File.Level : false;
log.transports.console.level = (Config.Logging.Console.Enabled) ? Config.Logging.Console.Level : false;
log.transports.file.format = (Config.Logging.File.Enabled && Config.Logging.File.Format) ? Config.Logging.File.Format : log.transports.file.format;
log.transports.console.format = (Config.Logging.Console.Enabled && Config.Logging.Console.Format) ? Config.Logging.Console.Format : log.transports.console.format;
log.transports.file.file = (Config.Logging.File.Enabled) ? Config.Logging.Savepath : log.transports.file.file;

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
            width: 1450,
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

        Main.MainWindow.loadURL(
            url.format({
                pathname: path.join(Config.System.TemplateRoot, "main_window.html"),
                protocol: "file",
                slashes: true
            })
        );

        Main.SetupIPC();

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
        ipcMain.on(IPCEventType.SHOW_DEV_TOOLS, () => { Main.ShowDevTools(Main.MainWindow); });
        ipcMain.on(IPCEventType.ENCODE_COMPLETED, Main.onEncodeCompleted);
        ipcMain.on(IPCEventType.SPAWN_ENCODER, Main.onSpawnEncoder);
        ipcMain.on(IPCEventType.APP_OPEN_FILE, Main.onOpenFile);
        ipcMain.on(IPCEventType.APP_SAVE_FILE, Main.onSaveFile);

        ipcMain.on(IPCEventType.APP_QUIT, () => {
            Main.Application.quit();
        });

    }
}
