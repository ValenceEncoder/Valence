import {BrowserWindow} from 'electron';
import * as Url from "url";
import * as Path from "path";

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow;

    private static onWindowAllClosed() {
        if(process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static onClose() {
        Main.mainWindow = null;
    }

    private static onReady() {
        Main.mainWindow = new Main.BrowserWindow({width: 800, height: 600});
        Main.mainWindow.loadURL(Url.format({
            protocol: "file:",
            pathname: Path.join(__dirname, 'index.html'),
            slashes: true
        }));
        Main.mainWindow.on('closed', Main.onClose);
    }

    static main(app:Electron.App, browserWindow: typeof BrowserWindow) {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
    }
}