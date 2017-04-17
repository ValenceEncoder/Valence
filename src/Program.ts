///<reference path="../typings/local.d.ts"/>
import {FFMpeg, FFProbe} from "./FFProcess";
import {IFFOutputHandler, IFFProcess, IFFProcessOptions} from "M2A";

export class Program {
    private options: IFFProcessOptions;
    private ffprobeInstance: FFProbe;
    private ffmpegInstance: FFMpeg;
    private activeProcess: IFFProcess;

    constructor() {
        if (require.main == module) {
            throw new Error("Program Class cannot be instantiated from the command line. Use CLI.js instead");
        }
    }



    run(endHandler:IFFOutputHandler, options?: IFFProcessOptions): void {

        if (typeof this.options === 'undefined') {
            throw new Error("Options object is undefined. Before running a process you must supply an options object: {input:string, output?:string, process?:string}");
        }

        this.options = options;
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




