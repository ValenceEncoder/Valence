// import { FFMpegProgramManager } from "./FFProgramManager";
import {ICLIArgs, IFFProbeOutput, IFFProbeOutputHandler, IFFProbeStreamData, IStreamInfo} from "./FFInterfaces";
import {FFMpeg, FFProbe, FFProcess} from "./FFProcess";

if (require.main != module) {
    // Loaded by another module e.g. with require('./src/Main');
    throw new Error("CLI cannot be loaded by a module loader, it is designed to be used from the command line e.g. `node ./build/FFCLI.js -i myVid.mkv -o myVidConverted.mp4");
}

// Invoked from the command line e.g. with `node ./src/Main.ts`
const commandLineArgs = require('command-line-args');

const argDefs = [
    {name: 'process', alias: 'p', type: String, defaultValue: 'ffprobe'},
    {name: 'input', alias: 'i', type: String, defaultOption: true},
    {name: 'output', alias: 'o', type: String}
];

const options: ICLIArgs = commandLineArgs(argDefs);

const pipeProbeInfo: IFFProbeOutputHandler = (fileInfo: IFFProbeOutput): void => {
    console.log("FFProbe complete... starting encode...");
    let videoStream: IFFProbeStreamData = fileInfo.streams.find(i => i.codec_type == 'video');
    let audioStream: IFFProbeStreamData = fileInfo.streams.find(i => i.codec_type == 'audio');
    let videoInfo: IStreamInfo = {codec_name: videoStream.codec_name, duration: videoStream.duration};
    let audioInfo: IStreamInfo = {codec_name: audioStream.codec_name};

    ffmpegInstance = new FFMpeg(options, (result: string) => {
        console.log(result);
    }, () => console.log("Encoding Complete"));

    ffmpegInstance.run(videoInfo, audioInfo);

};

let logProbeInfo: IFFProbeOutputHandler = (result: IFFProbeOutput): void => {
    console.log(result);
};

if (!options.hasOwnProperty('input')) throw new Error("ERROR: No input file specified.");
let ffprobeInstance:FFProbe;
let ffmpegInstance:FFMpeg;

switch (options.process) {

    case "ffprobe":
        ffprobeInstance = new FFProbe(options, logProbeInfo);
        break;
    case "ffmpeg":
        console.log("FFMPEG Command Received. Initializing FFProbe first...");
        ffprobeInstance = new FFProbe(options, pipeProbeInfo);
        break;
}

ffprobeInstance.run();


