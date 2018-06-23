import {BrowserWindow, ipcRenderer} from "electron";
import * as Path from "path";
import IPCEventType from "./Channels";
import {Config} from "./Config";
import {IFFMpegProgress, IFileInfo, IProcessOptions} from "./FF/FFInterfaces";
import {FFMpeg, VideoFile} from "./FF/FFProcess";
import {log} from "./Log";

export enum EncoderState {
    READY,
    RUNNING,
    COMPLETE
}

export class EncodeController {

    private static ffmpeg: FFMpeg;
    public static EncoderState: EncoderState = EncoderState.READY;

    private static videoFile: VideoFile;

    public static OnMpegComplete(): void {
        EncodeController.EncoderState = EncoderState.COMPLETE;
        ipcRenderer.send(IPCEventType.ENCODE_COMPLETED);
    }

    public static OnMpegOutput(info: IFFMpegProgress): void {
        $("#progress-bar").css("width", `${EncodeController.videoFile.getProgress(info.size)}%`);
        $("#progress-text").text(`CONVERTING ${EncodeController.videoFile.getProgress(info.size)}%`);

    }

    public static OnError(err: any): void {
        console.log(err);
    }

    public static StartEncode(fileInfo: VideoFile): void {

        EncodeController.videoFile    = fileInfo;
        $("#heading").text(`Encoding ${Path.basename(fileInfo.InputPath)}`);

        EncodeController.ffmpeg = new FFMpeg(Config.System.FFConfig, EncodeController.videoFile.ProcessOptions);
        EncodeController.ffmpeg.on(FFMpeg.EVENT_OUTPUT, EncodeController.OnMpegOutput);
        EncodeController.ffmpeg.on(FFMpeg.EVENT_ERROR, EncodeController.OnError);
        EncodeController.ffmpeg.on(FFMpeg.EVENT_COMPLETE, EncodeController.OnMpegComplete);
        EncodeController.ffmpeg.run(fileInfo.ProbeData);
        EncodeController.EncoderState = EncoderState.RUNNING;

    }

    public static Init(): void {
        log.info("Initializing Encode Window");
        ipcRenderer.on(IPCEventType.SPAWN_ENCODER, (event: Electron.Event, fileInfo: IFileInfo, jobOptions: IProcessOptions): void => {
            log.info("Spawn Event Recieved");
            const videoFile: VideoFile = new VideoFile(fileInfo, jobOptions);
            EncodeController.StartEncode(videoFile);
        });
    }

}
