import {app, BrowserWindow} from 'electron';
import Main from './Main';
import * as Path from 'path';
if(process.env.NODE_ENV === "development") {

    global.ValenceConfig = {
        bin: {
            ffprobe: Path.resolve(__dirname, "../ffmpeg/bin/ffprobe"),
            ffmpeg: Path.resolve(__dirname, "../ffmpeg/bin/ffmpeg")
        }
    };
    require('electron-debug')({showDevTools: true});

} else {

    const appPath = require('electron').app.getAppPath();
    global.ValenceConfig = {
        bin: {
            ffprobe: Path.join(appPath, "/ffmpeg/bin/ffprobe"),
            ffmpeg: Path.join(appPath, "/ffmpeg/bin/ffmpeg")
        }
    };
}

Main.main(app, BrowserWindow);
