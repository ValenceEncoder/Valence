import {app, BrowserWindow} from 'electron';
import Main from './Main';
import * as Path from 'path';
const appPath = require('electron').app.getAppPath();

global.ValenceConfig = require(Path.join(appPath,  '/src/vendor/electron-node-config'));
global.ValenceConfig.bin.ffprobe = Path.join(appPath, global.ValenceConfig.bin.ffprobe);
global.ValenceConfig.bin.ffmpeg = Path.join(appPath, global.ValenceConfig.bin.ffmpeg);

require('electron-debug')({showDevTools: true});

Main.main(app, BrowserWindow);