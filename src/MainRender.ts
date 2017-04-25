import {IFFProbeOutput, IFFProbeOutputHandler, IFFProbeStreamData, IProcessOptions, IStreamInfo} from "./FFInterfaces";
import {FFMpeg, FFMpegUtils, FFProbe} from "./FFProcess";

const fs                      = require('fs');
const path                    = require('path');
const testBtn: HTMLElement    = document.getElementById('ffmpeg-test');
const ffmpegDiv: HTMLElement  = document.getElementById('ffmpeg');

testBtn.addEventListener('click', function (event) {
    const options: IProcessOptions = {input: path.resolve("test/vid/large.mkv"), output: path.resolve("tmp/large.mp4"), process: "ffmpeg"};

    const pipeProbeInfo: IFFProbeOutputHandler = (fileInfo: IFFProbeOutput): void => {
        ffmpegDiv.innerText += "\nFFProbe complete... starting encode...";

        let videoStream: IFFProbeStreamData = fileInfo.streams.find(i => i.codec_type == 'video');
        let audioStream: IFFProbeStreamData = fileInfo.streams.find(i => i.codec_type == 'audio');
        let videoInfo: IStreamInfo          = {codec_name: videoStream.codec_name, duration: videoStream.duration};
        let audioInfo: IStreamInfo          = {codec_name: audioStream.codec_name};

        ffmpegInstance = new FFMpeg(options, (result: string) => {
            let progress = FFMpegUtils.toObject(result);
            Object.keys(progress).forEach(function(key) {
                document.getElementById(key).innerText = progress[key];
            });

        }, () => {
            ffmpegDiv.innerHTML += "<br/>Encoding Complete.";
        });

        ffmpegInstance.run(videoInfo, audioInfo);

    };

    let logProbeInfo: IFFProbeOutputHandler = (result: IFFProbeOutput): void => {
        console.log(result);
    };

    if (!options.hasOwnProperty('input')) throw new Error("ERROR: No input file specified.");
    console.info(`Checking file ${options.input} exists`);
    fileExists(options.input);

    let ffprobeInstance: FFProbe;
    let ffmpegInstance: FFMpeg;

    switch (options.process) {

        case "ffprobe":
            ffprobeInstance = new FFProbe(options, logProbeInfo);
            break;
        case "ffmpeg":
            ffmpegDiv.innerHTML = "FFMPEG Command Received. Initializing FFProbe first...";
            ffprobeInstance     = new FFProbe(options, pipeProbeInfo);
            break;
    }

    ffprobeInstance.run();
});

function fileExists(filepath:string): boolean {
    try {
        fs.statSync(filepath);
    } catch (e) {
        let errorMsg = `File ${filepath} does not exist.`;
        console.error(errorMsg);
        ffmpegDiv.innerHTML = `<span style='color: red; font-weight: bold;'>${errorMsg}</span>`;
        return false;
    }

    return true;
}

