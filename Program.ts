import {FFMpeg, FFProbe, FFProcess, IFFOutputHandler, IFFProcessOptions} from "./FFProcess";

export class Program {
    public options: IFFProcessOptions;
    private ffprobeInstance: FFProbe = null;
    private ffmpegInstance: FFMpeg = null;

    constructor() {
        if (require.main == module) {
            throw new Error("Program Class cannot be instantiated from the command line. Use CLI.js instead");
        }
    }

    run(endHandler:IFFOutputHandler, options?: IFFProcessOptions): void {
        
        if (typeof this.options === 'undefined' && typeof options === 'undefined') {
            throw new Error("Options object is undefined. Before running a process you must supply an options object: {input:string, output?:string, process?:string}");
        }

        this.options = options;
        switch (this.options.process) {
            case "ffprobe":
                this.ffprobeInstance = new FFProbe(this.options, endHandler);
                this.ffprobeInstance.run();
                break;
            case "ffmpeg":
                this.ffmpegInstance = new FFMpeg(this.options, endHandler);
                this.ffmpegInstance.run();
                break;

        }

    }
}
