import {remote, ipcRenderer} from 'electron';
import {IPCEventType} from './ElectronUtils';
import * as Path from "path";
import {FFMpeg, FFProbe, VideoFile} from "./FFProcess";
import {IFFMpegProgress, IFileInfo, IProcessOptions} from "./FFInterfaces";
import BrowserWindow = Electron.BrowserWindow;
import {FFMpegUtils} from "./FFMpegUtils";


enum EncodeState {
    READY,
    RUNNING,
    COMPLETE
}

export class EncodeRenderer {

    private static ffmpeg: FFMpeg;
    private static parentWindow: BrowserWindow;
    private static readonly remoteWindow: typeof BrowserWindow = remote.BrowserWindow;

    public static state: EncodeState = EncodeState.READY;

    private static videoFile: VideoFile;


    public static onMpegComplete(): void {
        EncodeRenderer.state = EncodeState.COMPLETE;
        EncodeRenderer.parentWindow.webContents.send(IPCEventType.ENCODE_COMPLETED)
    };

    public static onMpegOutput(info: IFFMpegProgress): void {
        console.log(`${EncodeRenderer.videoFile.getProgress(info.size)}% Complete`);
        $("#progress-bar").css('width', `${EncodeRenderer.videoFile.getProgress(info.size)}%`);
        $("#progress-text").text(`${EncodeRenderer.videoFile.getProgress(info.size)}% Complete`);

    }

    public static onError(err: any): void {
        console.log(err);
    }

    public static start(fileInfo: VideoFile, parentId: number): void {

        EncodeRenderer.videoFile    = fileInfo;
        EncodeRenderer.parentWindow = EncodeRenderer.remoteWindow.fromId(parentId);
        $('#heading').text(`Encoding ${Path.basename(fileInfo.InputPath)}`);

        console.log(EncodeRenderer.videoFile);

        EncodeRenderer.ffmpeg = new FFMpeg(EncodeRenderer.videoFile.ProcessOptions);
        EncodeRenderer.ffmpeg.on(FFMpeg.EVENT_OUTPUT, EncodeRenderer.onMpegOutput);
        EncodeRenderer.ffmpeg.on(FFMpeg.EVENT_ERROR, EncodeRenderer.onError);
        EncodeRenderer.ffmpeg.on(FFMpeg.EVENT_COMPLETE, EncodeRenderer.onMpegComplete);
        EncodeRenderer.ffmpeg.run(fileInfo.ProbeData);
        EncodeRenderer.state = EncodeState.RUNNING;

    }

}


ipcRenderer.on(IPCEventType.SPAWN_ENCODER, function (event, fileInfo: VideoFile, parentId: number) {
    console.log("SPAWN_ENCODER");
    //FIXME I assume due to protypical inheritance, this is getting passed as a POJO between window instances
    let videoFile: VideoFile = new VideoFile(fileInfo.ProbeData, fileInfo.ProcessOptions);
    EncodeRenderer.start(videoFile, parentId);


});

