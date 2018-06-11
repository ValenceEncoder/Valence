import {BrowserWindow, ipcRenderer, remote} from "electron";
import * as Path from "path";
import IPCEventType from "./Channels";
import {Config} from "./Config";
import {IFFMpegProgress} from "./FF/FFInterfaces";
import {FFMpeg, VideoFile} from "./FF/FFProcess";

export enum EncoderState {
    READY,
    RUNNING,
    COMPLETE
}

export class EncodeController {

    private static ffmpeg: FFMpeg;
    private static parentWindow: BrowserWindow;
    private static readonly remoteWindow: typeof BrowserWindow = remote.BrowserWindow;

    public static EncoderState: EncoderState = EncoderState.READY;

    private static videoFile: VideoFile;

    public static OnMpegComplete(): void {
        EncodeController.EncoderState = EncoderState.COMPLETE;
        EncodeController.parentWindow.webContents.send(IPCEventType.ENCODE_COMPLETED);
    }

    public static OnMpegOutput(info: IFFMpegProgress): void {
        $("#progress-bar").css("width", `${EncodeController.videoFile.getProgress(info.size)}%`);
        $("#progress-text").text(`CONVERTING ${EncodeController.videoFile.getProgress(info.size)}%`);

    }

    public static OnError(err: any): void {
        console.log(err);
    }

    public static Start(fileInfo: VideoFile, parentId: number): void {

        EncodeController.videoFile    = fileInfo;
        EncodeController.parentWindow = EncodeController.remoteWindow.fromId(parentId);
        $("#heading").text(`Encoding ${Path.basename(fileInfo.InputPath)}`);

        EncodeController.ffmpeg = new FFMpeg(Config.System.FFConfig, EncodeController.videoFile.ProcessOptions);
        EncodeController.ffmpeg.on(FFMpeg.EVENT_OUTPUT, EncodeController.OnMpegOutput);
        EncodeController.ffmpeg.on(FFMpeg.EVENT_ERROR, EncodeController.OnError);
        EncodeController.ffmpeg.on(FFMpeg.EVENT_COMPLETE, EncodeController.OnMpegComplete);
        EncodeController.ffmpeg.run(fileInfo.ProbeData);
        EncodeController.EncoderState = EncoderState.RUNNING;

    }

}

ipcRenderer.on(IPCEventType.SPAWN_ENCODER, (event: Electron.Event, fileInfo: VideoFile, parentId: number): void => {
    // FIXME(liam): I assume due to prototypical inheritance, this is getting passed as a POJO between window instances so this is a pretty ugly hack atm
    const videoFile: VideoFile = new VideoFile(fileInfo.ProbeData, fileInfo.ProcessOptions);
    EncodeController.Start(videoFile, parentId);
});
