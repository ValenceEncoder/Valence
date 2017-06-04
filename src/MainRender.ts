import {remote, ipcRenderer} from "electron";
import {ElectronUtils, IPCEventType} from "./ElectronUtils";
import {FFMpegUtils} from "./lib/FFMpegUtils";
import {FFProbe, VideoFile} from "./lib/FFProcess";
import {IConfig, IFileInfo, IProcessOptions} from "./lib/FFInterfaces";
import ProcessMemoryInfo = NodeJS.ProcessMemoryInfo;
import IpcRendererEvent = Electron.IpcRendererEvent;


const BrowserWindow   = require('electron').remote.BrowserWindow;
const fs              = require('fs');
const path            = require('path');
const config: IConfig = remote.getGlobal("appConfig");
let videoFile: VideoFile;
let ffprobe: FFProbe;
let input: IProcessOptions;

export class MainRenderer {
    private static encodeWin:  Electron.BrowserWindow;
    public static statsVisible:boolean = false;
    private static onBrowseClick(event: Event) {
        ipcRenderer.send(IPCEventType.APP_OPEN_FILE);
    }

    private static onBrowseOutputClick(event: Event) {
        ipcRenderer.send(IPCEventType.APP_SAVE_FILE, $("#txt-output").val());
    }

    private static onProbeComplete(event:Event) {
        ffprobe = null;
    }

    private static onQuitClick(event:Event) {
        ipcRenderer.send(IPCEventType.APP_QUIT);
    }

    private static onIPCAppFileSelected(event: Electron.IpcRendererEvent, file: string) {
        $("#txt-input").val(file);
        $("#txt-output").val(FFMpegUtils.changeExtension(file, "mp4"));
        $("#btn-browse-output").on('click', MainRenderer.onBrowseOutputClick).addClass("pulse");
        $("#btn-browse-input").removeClass('pulse');
        Materialize.updateTextFields();

        input   = {input: file};
        ffprobe = new FFProbe(config, input);
        ffprobe.on(FFProbe.EVENT_OUTPUT, MainRenderer.outputAnalysis);
        ffprobe.on(FFProbe.EVENT_COMPLETE, MainRenderer.onProbeComplete);
        ffprobe.run();
        $('#analysis-preloader').removeClass('hide');
    }

    private static outputAnalysis(result: IFileInfo) {
        videoFile = new VideoFile(result, input);
        $('#td-video-codec').text(videoFile.VideoCodec);
        $('#td-video-duration').text(videoFile.Duration.toString());
        $('#td-video-size').text(`${videoFile.Size}kb`);
        $("#td-audio-codec").text(videoFile.AudioCodec);
        $('#analysis-result').removeClass('hide');
        $('#analysis-preloader').addClass('hide');
        $('#div-output').removeClass('hide');
    }

    private static onIPCAppSaveFileSelected(event: Electron.IpcRendererEvent, file: string) {
        $("#txt-output").val(file);
        $("#btn-browse-output").removeClass("pulse");
        Materialize.updateTextFields();
    }

    private static onEncodeClick(event: Event) {
        const $txtInput = $("#txt-input");
        const inputFile = $txtInput.val();
        if (!FFMpegUtils.fileExists(inputFile) || $txtInput.val() == "") {
            $("#err-dialog").modal("open");
            return;
        }
        const windowID: number = BrowserWindow.getFocusedWindow().id;

        MainRenderer.encodeWin = new BrowserWindow({
            width: 900,
            height: 300,
            show: true,
            modal: true,
            autoHideMenuBar: true,
        });

        MainRenderer.encodeWin.loadURL(ElectronUtils.path("/views/EncodeView.html"));

        MainRenderer.encodeWin.webContents.on('did-finish-load', () => {
            MainRenderer.encodeWin.show();
            MainRenderer.encodeWin.webContents.send(IPCEventType.SPAWN_ENCODER, videoFile, windowID);
        });

        MainRenderer.encodeWin.on('closed', () => {
            MainRenderer.encodeWin = null;
        });

        ipcRenderer.on(IPCEventType.ENCODE_COMPLETED, MainRenderer.onIPCEncodeCompleted);
    }

    private static onIPCEncodeCompleted(event:IpcRendererEvent, message:any) {
        MainRenderer.encodeWin.close();
        MainRenderer.encodeWin = null;
        $("#success-dialog").modal('open');
    }

    private static onIPCAppShowStatistics(event:Electron.IpcRendererEvent):void {

        MainRenderer.statsVisible          = !MainRenderer.statsVisible;
        let navAction: string = (MainRenderer.statsVisible) ? "show" : "hide";
        $(".button-collapse").sideNav(navAction);

        MainRenderer.getRAMUsage();

    };

    private static getRAMUsage():void {
        if (!MainRenderer.statsVisible) {
            return;
        }

        let memInfo: ProcessMemoryInfo = process.getProcessMemoryInfo();

        $("#ram-working").text(memInfo.workingSetSize);
        $("#ram-max").text(memInfo.workingSetSize);
        $("#ram-process").text(memInfo.privateBytes);
        setTimeout(MainRenderer.getRAMUsage, 500);
    }

    public static init() {
        $("#btn-quit").on('click', MainRenderer.onQuitClick); // Quit Application
        $("#btn-browse-input").on('click', MainRenderer.onBrowseClick); // Open File Picker
        $("#btn-encode").on('click', MainRenderer.onEncodeClick); // Start Encode Job
        ipcRenderer.on(IPCEventType.APP_FILE_SELECTED, MainRenderer.onIPCAppFileSelected);
        ipcRenderer.on(IPCEventType.APP_SAVE_FILE_SELECTED, MainRenderer.onIPCAppSaveFileSelected);
        ipcRenderer.on(IPCEventType.APP_SHOW_STATISTICS, MainRenderer.onIPCAppShowStatistics);


    }

}

MainRenderer.init();
