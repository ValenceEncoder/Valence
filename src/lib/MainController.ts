import {BrowserWindow, ipcRenderer} from "electron";
import IPCEventType from "./Channels";
import { Config } from "./Config";
import { IFFProbeOutput, IFileInfo, IProcessOptions } from "./FF/FFInterfaces";
import { FFProbe, VideoFile } from "./FF/FFProcess";
import { Utils as FFUtils } from "./FF/Utils";
import {log} from "./Log";
import { IFFConfig } from "./typings/config";

const config: IFFConfig = {
    bin: {
        ffmpeg: Config.System.FFMpegBinary,
        ffprobe: Config.System.FFProbeBinary
    }
};

export class MainController {
    public static StatsVisible: boolean = false;
    private static ffprobe: FFProbe;
    private static videoFile: VideoFile;
    private static probeOutput: IFileInfo = null;
    private static processOptions: IProcessOptions = null;

    private static onBrowseClick(event: JQuery.Event) {
        ipcRenderer.send(IPCEventType.APP_OPEN_FILE);
    }

    private static onBrowseOutputClick(event: JQuery.Event) {
        ipcRenderer.send(IPCEventType.APP_SAVE_FILE, $("#txt-output").val());
    }

    private static onProbeComplete(event: Electron.Event) {
        MainController.ffprobe = null;
    }

    private static onIPCAppFileSelected(event: Electron.Event, file: string) {
        $("#txt-input").val(file);
        $("#txt-output").val(FFUtils.changeExtension(file, "mp4"));
        $("#btn-browse-output").on("click", (e: JQuery.Event) =>  MainController.onBrowseOutputClick(e)).addClass("pulse");
        log.debug("File", file);

        MainController.processOptions   = {input: file};
        MainController.ffprobe          = new FFProbe(config, MainController.processOptions);
        MainController.ffprobe.on(FFProbe.EVENT_OUTPUT, MainController.outputAnalysis);
        MainController.ffprobe.on(FFProbe.EVENT_COMPLETE, MainController.onProbeComplete);
        MainController.ffprobe.run();
        $("#analysis-preloader").removeClass("hide");
    }

    private static outputAnalysis(result: IFFProbeOutput) {
        MainController.probeOutput = FFUtils.getFileInfo(result);
        MainController.videoFile = new VideoFile(MainController.probeOutput, MainController.processOptions);
        $("#td-video-codec").text(MainController.videoFile.VideoCodec);
        $("#td-video-duration").text(MainController.videoFile.Duration.toString());
        $("#td-video-size").text(`${MainController.videoFile.Size}kb`);
        $("#td-audio-codec").text(MainController.videoFile.AudioCodec);
        $("#analysis-result").removeClass("hide");
        $("#analysis-preloader").addClass("hide");
        $("#div-output").removeClass("hide");
    }

    private static onIPCAppSaveFileSelected(event: Electron.Event, file: string) {
        $("#txt-output").val(file);
    }

    private static onEncodeClick(event: JQuery.Event) {
        const $txtInput = $("#txt-input");
        const inputFile = $txtInput.val() as string;
        if (!FFUtils.fileExists(inputFile) || $txtInput.val() === "") {
            log.warn(`Path ${inputFile} does not exist`);
            return;
        }
        ipcRenderer.send(IPCEventType.APP_OPEN_ENCODE_WINDOW, MainController.probeOutput, MainController.processOptions);
    }

    private static onIPCAppShowStatistics(event: Electron.Event): void {
        MainController.StatsVisible = !MainController.StatsVisible;
    }

    public static Init() {
        // $("#err-dialog").modal(); // Init Modals
        // $("#success-dialog").modal(); // Init Modals
        $("#btn-browse-input").click((e: JQuery.Event) => MainController.onBrowseClick(e)); // Open File Picker
        $("#btn-encode").click((e: JQuery.Event) => MainController.onEncodeClick(e)); // Start Encode Job
        ipcRenderer.on(IPCEventType.APP_FILE_SELECTED, MainController.onIPCAppFileSelected);
        ipcRenderer.on(IPCEventType.APP_SAVE_FILE_SELECTED, MainController.onIPCAppSaveFileSelected);
        ipcRenderer.on(IPCEventType.APP_SHOW_STATISTICS, MainController.onIPCAppShowStatistics);
    }
}
