import {remote, ipcRenderer} from 'electron';
import {IPCEventType} from './ElectronUtils';
import * as Path from "path";
import {FFMpeg, FFProbe} from "./FFProcess";
import {IFFProbeOutput, IProcessOptions} from "./FFInterfaces";
import BrowserWindow = Electron.BrowserWindow;

const browserWindow = remote.BrowserWindow;
let ffprobe:FFProbe;
let ffmpeg:FFMpeg;
let parentWindow: BrowserWindow;

function onProbeComplete(result:IFFProbeOutput):void {
   console.log(result);

}


ipcRenderer.on(IPCEventType.SPAWN_ENCODER, function(event, inputFile:string, parentId:number) {
    console.log(IPCEventType.SPAWN_ENCODER);
    parentWindow = browserWindow.fromId(parentId);
    document.getElementById('heading').innerText = `Encoding ${Path.basename(inputFile)}`;

    let ffprobeOptions:IProcessOptions = {
        input: inputFile,
        process: 'ffprobe'
    };
    ffprobe = new FFProbe(ffprobeOptions);
    ffprobe.on(FFProbe.EVENT_OUTPUT, onProbeComplete);
    ffprobe.on(FFProbe.EVENT_ERROR, (err:Error) => {
        console.error(err);
    });
    ffprobe.run();


    // const fromWindow = BrowserWindow.fromId(fromWindowId);
    // fromWindow.webContents.send(IPCEventType.ENCODE_COMPLETED)
});