import { BrowserWindow } from 'electron';

import * as Url from "url";
import * as Path from "path";
import { ipcRenderer } from 'electron'

const fs = require('fs');
const path = require('path');
const btnEncode: HTMLElement = document.getElementById('btn-encode');
const elementLog: HTMLElement = document.getElementById('ffmpeg-output');

//#region move this
// btnEncode.addEventListener('click', function (event) {
//     let inputPath = "test/vid/small.mkv";
//     let outputPath = "tmp/large.mp4";
//     const options: IProcessOptions = {
//         input: path.resolve(inputPath),
//         output: path.resolve(outputPath),
//         process: "ffmpeg"
//     };
//
//     const pipeProbeInfo: IFFProbeOutputHandler = (probeOutput: IFFProbeOutput): void => {
//
//         let fileInfo:IFileInfo = FFMpegUtils.getFileInfo(probeOutput);
//
//         ffmpegInstance = new FFMpeg(options, (result: string) => {
//             let progress = FFMpegUtils.toObject(result);
//             Object.keys(progress).forEach(function (key) {
//                 document.getElementById(key).innerText = progress[key];
//             });
//
//         }, () => {
//             elementLog.innerHTML += "<br/>Encoding Complete.";
//         });
//
//         ffmpegInstance.run(fileInfo);
//
//     };
//
//     let logProbeInfo: IFFProbeOutputHandler = (result: IFFProbeOutput): void => {
//         console.log(result);
//     };
//
//     if (!options.hasOwnProperty('input')) throw new Error("ERROR: No input file specified.");
//     console.info(`Checking file ${options.input} exists`);
//     fileExists(options.input);
//
//     let ffprobeInstance: FFProbe;
//     let ffmpegInstance: FFMpeg;
//
//     switch (options.process) {
//
//         case "ffprobe":
//             ffprobeInstance = new FFProbe(options, logProbeInfo);
//             break;
//         case "ffmpeg":
//             elementLog.innerHTML = "FFMPEG Command Received. Initializing FFProbe first...";
//             ffprobeInstance = new FFProbe(options, pipeProbeInfo);
//             break;
//     }
//
//     ffprobeInstance.run();
// });
//#endregion

btnEncode.addEventListener('click', function (event) {
    //TODO get filepaths from inputs here
    //TODO perform path resolution checking here
    const windowID: number = BrowserWindow.getFocusedWindow().id;
    const encodeViewPath: string = Url.format({
        protocol: "file:",
        pathname: Path.join(__dirname, "EncodeView.html"),
        slashes: true
    });
    let encodeWin: BrowserWindow = new BrowserWindow({ width: 400, height: 400, show: false });
    encodeWin.loadURL(encodeViewPath);

    encodeWin.webContents.on('did-finish-load', function () {
        encodeWin.webContents.send('m2a-spawn-encoder', { message: `hello from ${windowID}` }, windowID);
    });
});

ipcRenderer.on('m2a-encode-completed', function (event, message) {
    console.log(message);
});