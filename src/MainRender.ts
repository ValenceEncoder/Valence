import {ipcRenderer} from "electron";
import {ElectronUtils, IPCEventType} from "./ElectronUtils";

const BrowserWindow = require('electron').remote.BrowserWindow;
const fs = require('fs');
const path = require('path');
const btnEncode: HTMLElement = document.getElementById('btn-encode');
const btnQuit: HTMLElement = document.getElementById('btn-quit');
const divLog: HTMLElement = document.getElementById('ffmpeg-output');


btnQuit.addEventListener('click', function (event) {
    ipcRenderer.send(IPCEventType.APP_QUIT);
});

btnEncode.addEventListener('click', function (event) {
    //TODO get filepaths from inputs here
    //TODO perform path resolution checking here
    const windowID: number = BrowserWindow.getFocusedWindow().id;

    let encodeWin = new BrowserWindow({ width: 300, height: 300, show: true });
    encodeWin.loadURL(ElectronUtils.path("EncodeView.html"));

    encodeWin.webContents.on('did-finish-load', function () {
        encodeWin.webContents.send(IPCEventType.SPAWN_ENCODER, `hello from ${windowID}`, windowID);
    });
});

ipcRenderer.on(IPCEventType.ENCODE_COMPLETED, function (event, message) {
    console.log(message);
});