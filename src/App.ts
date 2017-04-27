import {app, BrowserWindow, globalShortcut} from 'electron';
import {enableLiveReload} from 'electron-compile';
import Main from './Main';

enableLiveReload();

require('electron-debug')({showDevTools: true});

Main.main(app, BrowserWindow, globalShortcut);