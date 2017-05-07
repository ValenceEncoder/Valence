import {app, BrowserWindow} from 'electron';
import {enableLiveReload} from 'electron-compile';
import Main from './Main';

enableLiveReload();

require('electron-debug')({showDevTools: false});

Main.main(app, BrowserWindow);