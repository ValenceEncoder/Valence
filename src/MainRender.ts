import {ipcRenderer} from "electron";
import {ElectronUtils, IPCEventType} from "./ElectronUtils";
import {FFMpegUtils} from "./lib/FFMpegUtils";
import {FFProbe, VideoFile} from "./lib/FFProcess";
import {IFileInfo, IProcessOptions} from "./lib/FFInterfaces";


const BrowserWindow                      = require('electron').remote.BrowserWindow;
const fs                                 = require('fs');
const path                               = require('path');
let videoFile:VideoFile;
let ffprobe:FFProbe;
let input:IProcessOptions;
/**
 * Quit Application
 */

$("#btn-quit").on('click', function (event) {
    ipcRenderer.send(IPCEventType.APP_QUIT);
});

/**
 * Open File Picker
 */
function onBrowseClick(event: Event) {
    ipcRenderer.send(IPCEventType.APP_OPEN_FILE);
}
$("#btn-browse-input").on('click', onBrowseClick);


/**
 * Start Encode Job
 */
$("#btn-encode").on('click', function (event) {
    const $txtInput = $("#txt-input");
    const inputFile = $txtInput.val();
    if (!FFMpegUtils.fileExists(inputFile) || $txtInput.val() == "") {
        $("#err-dialog").modal("open");
        return;
    }
    const windowID: number = BrowserWindow.getFocusedWindow().id;

    let encodeWin = new BrowserWindow({
        width: 900,
        height: 300,
        show: true,
        modal: true,
        autoHideMenuBar: true,
    });

    encodeWin.loadURL(ElectronUtils.path("/views/EncodeView.html"));

    encodeWin.webContents.on('did-finish-load', () => {
        encodeWin.show();
        encodeWin.webContents.send(IPCEventType.SPAWN_ENCODER, videoFile, windowID);
    });

    encodeWin.on('closed', () => {
        encodeWin = null;
    });

    ipcRenderer.on(IPCEventType.ENCODE_COMPLETED, function (event, message) {
        encodeWin.close();
        encodeWin = null;
        $("#success-dialog").modal('open');
    });
});

function outputAnalysis(result:IFileInfo) {
    videoFile = new VideoFile(result, input);
    $('#td-video-codec').text(videoFile.VideoCodec);
    $('#td-video-duration').text(videoFile.Duration.toString());
    $('#td-video-size').text(`${videoFile.Size}kb`);
    $("#td-audio-codec").text(videoFile.AudioCodec);
    $('#analysis-result').removeClass('hide');
    $('#analysis-preloader').addClass('hide');
    $('#div-output').removeClass('hide');


}
function onProbeComplete() {
    ffprobe = null;
}
/**
 * ipcRenderer Listeners
 */


ipcRenderer.on(IPCEventType.APP_FILE_SELECTED, function (event: Electron.IpcRendererEvent, file: string) {
    $("#txt-input").val(file);
    $("#txt-output").val(FFMpegUtils.changeExtension(file, "mp4"));
    $("#btn-browse-input").removeClass('pulse');
    input = {input: file};
    ffprobe = new FFProbe(input);
    ffprobe.on(FFProbe.EVENT_OUTPUT, outputAnalysis);
    ffprobe.on(FFProbe.EVENT_COMPLETE, onProbeComplete);
    ffprobe.run();
    Materialize.updateTextFields();
    $('#analysis-preloader').removeClass('hide');
});