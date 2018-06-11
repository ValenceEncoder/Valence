import {
    IProcessOptions, IFFProbeOutput, IFFProbeOutputHandler
} from "./FFInterfaces";
import {FFMpeg, FFProbe} from "./FFProcess";
import {FFMpegUtils} from "./FFMpegUtils";
import * as Path from "path";

if (require.main != module) {
    // Loaded by another module e.g. with require('./src/Main');
    throw new Error("CLI cannot be loaded by a module loader, it is designed to be used from the command line e.g. `node ./build/FFCLI.js -i myVid.mkv -o myVidConverted.mp4");
}

const rootPath:string = Path.resolve(Path.join(Path.dirname(__filename), "../../../"));

const config = {
    bin: {
        ffmpeg: Path.join(rootPath, "/ffmpeg/bin/ffmpeg"),
        ffprobe: Path.join(rootPath, "/ffmpeg/bin/ffprobe")
    }
};
// Invoked from the command line e.g. with `node ./src/Main.ts`
const commandLineArgs = require('command-line-args');

const argDefs = [
    {name: 'process', alias: 'p', type: String, defaultValue: 'ffprobe'},
    {name: 'input', alias: 'i', type: String, defaultOption: true},
    {name: 'output', alias: 'o', type: String}
];

const options: IProcessOptions = commandLineArgs(argDefs);

const pipeProbeInfo: IFFProbeOutputHandler = (probeOutput: IFFProbeOutput): void => {

    let fileInfo = FFMpegUtils.getFileInfo(probeOutput);

    ffmpegInstance = new FFMpeg(config, options);

    ffmpegInstance.run(fileInfo).on(FFMpeg.EVENT_OUTPUT, (result: string) => {
        console.log(result);
    });

};

let logProbeInfo: IFFProbeOutputHandler = (result: IFFProbeOutput): void => {
    console.log(result);
};

if (!options.hasOwnProperty('input')) throw new Error("ERROR: No input file specified.");
let ffprobeInstance:FFProbe;
let ffmpegInstance:FFMpeg;

switch (options.process) {

    case "ffprobe":
        ffprobeInstance = new FFProbe(config, options);
        ffprobeInstance.run().on(FFProbe.EVENT_OUTPUT, logProbeInfo);
        break;
    case "ffmpeg":
        console.log("FFMPEG Command Received. Initializing FFProbe first...");
        ffprobeInstance = new FFProbe(config, options);
        ffprobeInstance.run().on(FFProbe.EVENT_OUTPUT, pipeProbeInfo);
        break;
}

