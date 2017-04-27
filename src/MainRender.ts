import * as Electron from "electron";
import * as Url from "url";
import * as Path from "path";
import IPCEventTypes from "./AppConsts";

const fs = require('fs');
const path = require('path');
const btnEncode: HTMLElement = document.getElementById('btn-encode');
const btnQuit: HTMLElement = document.getElementById('btn-quit');
const elementLog: HTMLElement = document.getElementById('ffmpeg-output');

btnQuit.addEventListener('click', function (event) {
    Electron.ipcRenderer.send(IPCEventTypes.APP_QUIT);
});

btnEncode.addEventListener('click', function (event) {
    //TODO get filepaths from inputs here
    //TODO perform path resolution checking here
    const windowID: number = Electron.BrowserWindow.getFocusedWindow().id;
    const encodeViewPath: string = Url.format({
        protocol: "file:",
        pathname: Path.join(__dirname, "EncodeView.html"),
        slashes: true
    });
    let encodeWin = new Electron.BrowserWindow({ width: 400, height: 400, show: false });
    encodeWin.loadURL(encodeViewPath);

    encodeWin.webContents.on('did-finish-load', function () {
        encodeWin.webContents.send(IPCEventTypes.SPAWN_ENCODER, `hello from ${windowID}`, windowID);
    });
});

Electron.ipcRenderer.on(IPCEventTypes.ENCODE_COMPLETED, function (event, message) {
    console.log(message);
});