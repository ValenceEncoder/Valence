import * as Electron from "electron";
import * as Url from "url";
import * as Path from "path";
import {IPCEventType} from "./ElectronUtils";

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow: typeof Electron.BrowserWindow;

    private static GlobalShortcut: Electron.GlobalShortcut;
    private static ipc: Electron.IpcMain = Electron.ipcMain;

    private static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static isEncoding: boolean = false;

    private static onSpawnEncoder() {
        Main.isEncoding = true;
        console.log("Main::onSpawnEncoder Encoding Started.")
    }

    private static onEncodeCompleted() {
        Main.isEncoding = false;
        console.log("Main::onEncodeCompleted Encoding Complete.")
    }

    private static onQuit() {
        Main.application.exit(0);
    }

    private static onClose() {
        Main.mainWindow = null;
    }

    private static onOpenFile(event:Electron.IpcMainEvent) {
        Electron.dialog.showOpenDialog({
            properties: ['openFile'],

        }, function(file:string[]) {
            if(file) {
                let _file:string = file[0];
                event.sender.send(IPCEventType.APP_FILE_SELECTED, _file);
            }
        })
    }


    private static onReady() {
        Main.mainWindow = new Main.BrowserWindow({ width: 1200, height: 768, frame: false });
        Main.mainWindow.loadURL(Url.format({
            protocol: "file:",
            pathname: Path.join(__dirname, 'index.html'),
            slashes: true
        }));
        Main.mainWindow.on('closed', Main.onClose);
        Main.GlobalShortcut.register('CommandOrControl+Q', () => {
            Main.application.exit(0);
        });

        Main.ipc.on(IPCEventType.APP_QUIT, Main.onQuit);
        Main.ipc.on(IPCEventType.ENCODE_COMPLETED, Main.onEncodeCompleted);
        Main.ipc.on(IPCEventType.SPAWN_ENCODER, Main.onSpawnEncoder);
        Main.ipc.on(IPCEventType.APP_OPEN_FILE, Main.onOpenFile);

    }

    static main(app: Electron.App, browserWindow: typeof Electron.BrowserWindow) {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.GlobalShortcut = Electron.globalShortcut;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);

    }
}