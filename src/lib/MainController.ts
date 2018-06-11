import {BrowserWindow, ipcRenderer} from "electron";
import * as log from "electron-log";
import IPCEventType from "./Channels";
import { Config } from "./Config";
import { IFFConfig, IFileInfo, IProcessOptions } from "./FF/FFInterfaces";
import { FFProbe, VideoFile } from "./FF/FFProcess";
import { Utils } from "./FF/Utils";

const config: IFFConfig = {
    bin: {
        ffmpeg: Config.System.FFMpegBinary,
        ffprobe: Config.System.FFProbeBinary
    }
};

export class MainController {
    private static encodeWin: BrowserWindow;
    public static StatsVisible: boolean = false;
    private static ffprobe: FFProbe;
    private static input: IProcessOptions;
    private static videoFile: VideoFile;

    private static onBrowseClick(event: JQuery.Event) {
        ipcRenderer.send(IPCEventType.APP_OPEN_FILE);
    }

    private static onBrowseOutputClick(event: JQuery.Event) {
        ipcRenderer.send(IPCEventType.APP_SAVE_FILE, $("#txt-output").val());
    }

    private static onProbeComplete(event: Electron.Event) {
        MainController.ffprobe = null;
    }

    private static onQuitClick(event: Electron.Event) {
        ipcRenderer.send(IPCEventType.APP_QUIT);
    }

    private static onIPCAppFileSelected(event: Electron.Event, file: string) {
        $("#txt-input").val(file);
        $("#txt-output").val(Utils.changeExtension(file, "mp4"));
        $("#btn-browse-output").on("click", (e: JQuery.Event) =>  MainController.onBrowseOutputClick(e)).addClass("pulse");

        MainController.input   = {input: file};
        MainController.ffprobe = new FFProbe(config, MainController.input);
        MainController.ffprobe.on(FFProbe.EVENT_OUTPUT, MainController.outputAnalysis);
        MainController.ffprobe.on(FFProbe.EVENT_COMPLETE, MainController.onProbeComplete);
        MainController.ffprobe.run();
        $("#analysis-preloader").removeClass("hide");
    }

    private static outputAnalysis(result: IFileInfo) {
        MainController.videoFile = new VideoFile(result, MainController.input);
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
        // $("#btn-browse-output").removeClass("pulse");
    }

    private static onEncodeClick(event: JQuery.Event) {
        const $txtInput = $("#txt-input");
        const inputFile = $txtInput.val() as string;
        if (!Utils.fileExists(inputFile) || $txtInput.val() === "") {
            log.warn(`Path ${inputFile} does not exist`);
            return;
        }
        const windowID: number = BrowserWindow.getFocusedWindow().id;

        MainController.encodeWin = new BrowserWindow({
            width: 900,
            height: 300,
            show: true,
            modal: true,
            autoHideMenuBar: true,
        });

        MainController.encodeWin.loadURL(Utils.path("/views/encode_window.html"));

        MainController.encodeWin.on("ready-to-show", () => {
            MainController.encodeWin.show();
            MainController.encodeWin.webContents.send(IPCEventType.SPAWN_ENCODER, MainController.videoFile, windowID);
        });

        MainController.encodeWin.on("closed", () => {
            MainController.encodeWin = null;
        });

        ipcRenderer.on(IPCEventType.ENCODE_COMPLETED, MainController.onIPCEncodeCompleted);
    }

    private static onIPCEncodeCompleted(event: Electron.Event, message: any) {
        MainController.encodeWin.close();
        MainController.encodeWin = null;
        // $("#success-dialog").modal('open');
    }

    private static onIPCAppShowStatistics(event: Electron.Event): void {

        MainController.StatsVisible = !MainController.StatsVisible;
        // let navAction: string = (MainController.statsVisible) ? "show" : "hide";
        // $(".button-collapse").sideNav(navAction);

        // MainRenderer.getRAMUsage();

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
