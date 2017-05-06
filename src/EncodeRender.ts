import {remote, ipcRenderer} from 'electron';
import {IPCEventType} from './ElectronUtils';
import * as Path from "path";
import {FFMpeg, FFProbe} from "./FFProcess";
import {IFFMpegProgress, IFFProbeOutput, IFileInfo, IProcessOptions} from "./FFInterfaces";
import BrowserWindow = Electron.BrowserWindow;
import {FFMpegUtils} from "./FFMpegUtils";

const browserWindow = remote.BrowserWindow;
let ffprobe:FFProbe;
let ffprobeOptions:IProcessOptions;
let ffmpeg:FFMpeg;
let ffmpegOptions:IProcessOptions;
let parentWindow: BrowserWindow;

function onProbeComplete(result:IFileInfo):void {
    console.log(result);
    console.log(FFMpegUtils.changeExtension(ffprobeOptions.input));
    ffmpegOptions = {
        input: ffprobeOptions.input,
        output: FFMpegUtils.changeExtension(ffprobeOptions.input)
    };
    ffmpeg = new FFMpeg(ffmpegOptions);
    ffmpeg.on(FFMpeg.EVENT_OUTPUT, onMpegOutput);
    ffmpeg.on(FFMpeg.EVENT_ERROR, onError);
    ffmpeg.run(result);

}

function onMpegOutput(info:IFFMpegProgress) {
    console.log(info);
}

function onError(err:any) {
    console.log(err);
}

ipcRenderer.on(IPCEventType.SPAWN_ENCODER, function(event, inputFile:string, parentId:number) {
    console.log(IPCEventType.SPAWN_ENCODER);
    parentWindow = browserWindow.fromId(parentId);
    document.getElementById('heading').innerText = `Encoding ${Path.basename(inputFile)}`;

    ffprobeOptions = {
        input: inputFile,
        process: 'ffprobe'
    };
    ffprobe = new FFProbe(ffprobeOptions);
    ffprobe.on(FFProbe.EVENT_OUTPUT, onProbeComplete);
    ffprobe.on(FFProbe.EVENT_ERROR, onError);
    ffprobe.run();


    // const fromWindow = BrowserWindow.fromId(fromWindowId);
    // fromWindow.webContents.send(IPCEventType.ENCODE_COMPLETED)
});

