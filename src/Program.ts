///<reference path="../typings/local.d.ts"/>
import {FFMpeg, FFProbe} from "./FFProcess";
import {IFFProcess, IFFProcessOptions} from "M2A";

let endHandler:(message:string)=>void = function(message:string) {
    require('fs').writeFileSync('output.json', message);
    var metadata = JSON.parse(message);
    console.log(metadata);
};

export class Program {
    private options: IFFProcessOptions;
    private ffprobeInstance: FFProbe;
    private ffmpegInstance: FFMpeg;

    constructor(options?: IFFProcessOptions) {
        if (require.main == module) {
            throw new Error("Program Class cannot be instantiated from the command line. Use CLI.js instead");
        } else {
            // Loaded by another module e.g. with require('./src/Main');
            if (typeof options === 'undefined') {
                throw new Error("MKV2ATV.Program must be initialized with options object: {input:string, output?:string, process?:string}");
            }

            this.options = options;


        }

    }

    run(): void {
        switch (this.options.process) {
            case "ffprobe":
                this.ffprobeInstance = new FFProbe(this.options, endHandler);
                this.ffprobeInstance.exec();
                break;
            case "ffmpeg":
                this.ffmpegInstance = new FFMpeg(this.options, endHandler);
                this.ffmpegInstance.exec();
                break;

        }

    }
}




