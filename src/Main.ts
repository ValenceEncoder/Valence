import {BrowserWindow} from 'electron';
import * as Url from "url";
import * as Path from "path";

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow: typeof Electron.BrowserWindow;
    static GlobalShortcut: Electron.GlobalShortcut;
    private static onWindowAllClosed() {
        if(process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static onClose() {
        Main.mainWindow = null;
    }

    private static onReady() {
        Main.mainWindow = new Main.BrowserWindow({width: 800, height: 600, frame: true});
        Main.mainWindow.loadURL(Url.format({
            protocol: "file:",
            pathname: Path.join(__dirname, 'index.html'),
            slashes: true
        }));
        Main.mainWindow.on('closed', Main.onClose);
        Main.GlobalShortcut.register('CommandOrControl+Q', () => {
            Main.application.exit(0);
        });
    }

    static main(app:Electron.App, browserWindow: typeof BrowserWindow, globalShortcut:Electron.GlobalShortcut) {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.GlobalShortcut = globalShortcut;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
    }
}