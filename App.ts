import {app, BrowserWindow} from 'electron';
import Main from './src/Main';
// import {enableLiveReload} from 'electron-compile';
// enableLiveReload();
// require('electron-debug')({showDevTools: true});

Main.main(app, BrowserWindow);