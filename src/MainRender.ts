import {ipcRenderer} from "electron";
import {ElectronUtils, IPCEventType} from "./ElectronUtils";
import {FFMpegUtils} from "./FFMpegUtils";
import MainError from "./MainError";

const BrowserWindow                     = require('electron').remote.BrowserWindow;
const fs                                = require('fs');
const path                              = require('path');
const btnEncode: HTMLButtonElement      = <HTMLButtonElement> document.getElementById('btn-encode');
const btnBrowseInput: HTMLButtonElement = <HTMLButtonElement> document.getElementById('btn-browse-input');
const btnQuit: HTMLButtonElement        = <HTMLButtonElement> document.getElementById('btn-quit');
const txtInput: HTMLInputElement        = <HTMLInputElement> document.getElementById('txt-input');

const divLog: HTMLElement = document.getElementById('ffmpeg-output');


/**
 * Quit Application
 */
btnQuit.addEventListener('click', function (event) {
    ipcRenderer.send(IPCEventType.APP_QUIT);
});

/**
 * Open File Picker
 */
btnBrowseInput.addEventListener('click', function (event) {
    ipcRenderer.send(IPCEventType.APP_OPEN_FILE);
});

/**
 * Start Encode Job
 */
btnEncode.addEventListener('click', function (event) {
    const inputFile = txtInput.value;
    if (!FFMpegUtils.fileExists(inputFile) || txtInput.value == "") {
        MainError.showError("The selected file could not be found");
        return;
    }
    const windowID: number = BrowserWindow.getFocusedWindow().id;

    let encodeWin = new BrowserWindow({
        width: 500,
        height: 300,
        show: true,
        modal: true,
        autoHideMenuBar: true,
    });

    encodeWin.loadURL(ElectronUtils.path("EncodeView.html"));

    encodeWin.webContents.on('did-finish-load', () => {
        encodeWin.show();
        encodeWin.webContents.send(IPCEventType.SPAWN_ENCODER, inputFile, windowID);
    });

    encodeWin.on('closed', () => {
        encodeWin = null;
    });
});


/**
 * ipcRenderer Listeners
 */
ipcRenderer.on(IPCEventType.ENCODE_COMPLETED, function (event, message) {
    console.log(message);
});

ipcRenderer.on(IPCEventType.APP_FILE_SELECTED, function (event: Electron.IpcRendererEvent, file: string) {
    txtInput.value = file;
});