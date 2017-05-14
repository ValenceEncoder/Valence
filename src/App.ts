import {app, BrowserWindow} from 'electron';
import Main from './Main';
import * as Path from 'path';
// import {enableLiveReload} from 'electron-compile';
// enableLiveReload();
import {IConfig} from "./lib/FFInterfaces";
const appPath = require('electron').app.getAppPath();
global.ValenceConfig = require(Path.join(appPath,  '/src/vendor/electron-node-config'));
global.ValenceConfig.bin.ffprobe = Path.join(appPath, global.ValenceConfig.bin.ffprobe);
global.ValenceConfig.bin.ffmpeg = Path.join(appPath, global.ValenceConfig.bin.ffmpeg);

require('electron-debug')({showDevTools: true});

Main.main(app, BrowserWindow);