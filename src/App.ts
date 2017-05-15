import {app, BrowserWindow} from 'electron';
import Main from './Main';
import * as Path from 'path';
if(process.env.NODE_ENV === "development") {
    global.ValenceConfig = require('config');
    global.ValenceConfig.bin.ffprobe = Path.resolve(__dirname, global.ValenceConfig.bin.ffprobe);
    global.ValenceConfig.bin.ffmpeg = Path.resolve(__dirname, global.ValenceConfig.bin.ffmpeg);
    require('electron-debug')({showDevTools: true});
} else {

    const appPath = require('electron').app.getAppPath();
    global.ValenceConfig = require(Path.join(appPath,  '/src/vendor/electron-node-config'));
    global.ValenceConfig.bin.ffprobe = Path.join(appPath, global.ValenceConfig.bin.ffprobe);
    global.ValenceConfig.bin.ffmpeg = Path.join(appPath, global.ValenceConfig.bin.ffmpeg);
}



Main.main(app, BrowserWindow);