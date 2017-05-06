import {ChildProcess, spawn} from "child_process";
import {EventEmitter} from "events";
import {
    IProcessOptions, IFFProbeOutput,
    IStreamInfo, IFileInfo, IConfig
} from "./FFInterfaces";
import {FFMpegUtils} from "./FFMpegUtils";

const config: IConfig = require('config');

export abstract class FFProcess extends EventEmitter {
    protected args: string[];
    protected process: ChildProcess;
    protected outBuffer: string                   = "";
    protected abstract readonly targetOutput: "stdout" | "stderr";
    public static readonly EVENT_OUTPUT: string   = "OUTPUT";
    public static readonly EVENT_COMPLETE: string = "COMPLETE";
    public static readonly EVENT_ERROR: string    = "ERROR";

    protected command: string;

    constructor(options:IProcessOptions) {
        super();
        if(!FFMpegUtils.fileExists(options.input)) {
            throw new Error(`File ${options.input} does not exist`);
        }
    }

    public abstract run(args?: any): any;

    protected abstract parseArgs(infoVideo?: IStreamInfo, infoAudio?: IStreamInfo): string[];

}

export class FFProbe extends FFProcess {
    protected readonly targetOutput = "stdout";

    protected bufferOutput: (data: string) => void = (data: string) => {
        this.outBuffer += data;
    };

    constructor(public options: IProcessOptions) {
        super(options);
        this.args    = this.parseArgs();
        this.command = config.bin.ffprobe;
    }

    public run(): FFProbe {
        console.log("FFPROBE::RUN");
        this.process = spawn(this.command, this.args);
        this.process[this.targetOutput].setEncoding('utf8');
        this.process[this.targetOutput].on('error', (err:any) => {
           this.emit(FFProbe.EVENT_ERROR, err);
        });
        this.process[this.targetOutput].on('data', this.bufferOutput);
        this.process[this.targetOutput].on('close', () => {
            let output: IFFProbeOutput;
            output = JSON.parse(this.outBuffer);
            this.emit(FFProbe.EVENT_OUTPUT, FFMpegUtils.getFileInfo(output));
        });

        return this;
    }

    protected parseArgs(): string[] {
        return `-v quiet -print_format json -show_format -show_streams ${this.options.input}`.split(" ");
    }

}

export class FFMpeg extends FFProcess {
    protected readonly targetOutput = "stderr";


    constructor(public options: IProcessOptions) {
        super(options);
        this.command = config.bin.ffmpeg;

    }

    public run(fileInfo: IFileInfo): FFMpeg {

        this.args    = this.parseArgs(fileInfo.videoInfo, fileInfo.audioInfo);
        this.process = spawn(this.command, this.args);
        this.process[this.targetOutput].setEncoding('utf8');

        /**
         * Either Node or FFMPEG is flushing the output buffer with partially formed messages, so we test for correctly formed output
         * and if not we buffer it and then flush it once its formed
         */
        this.process[this.targetOutput].on('data', (message: string) => {
            this.outBuffer += message;
            if (this.outBuffer.match(FFMpegUtils.RGX_FORMED_OUTPUT)) {
                let result     = this.outBuffer;
                this.outBuffer = "";
                this.emit(FFProcess.EVENT_OUTPUT, result);
            }

        });
        this.process[this.targetOutput].on('close', () => this.emit(FFMpeg.EVENT_COMPLETE));
        this.process[this.targetOutput].on('error', (err:any) => this.emit(FFMpeg.EVENT_ERROR, err));
        return this;
    }

    protected parseArgs(videoInfo: IStreamInfo, audioInfo: IStreamInfo): string[] {

        let outArgs: string[] = [
            FFMpegUtils.FLAG_VERBOSITY,
            FFMpegUtils.OPT_VERBOSTY_QUIET,
            FFMpegUtils.FLAG_STATS,
            FFMpegUtils.FLAG_INPUT,
            this.options.input,
            FFMpegUtils.FLAG_OVERWRITE,
            FFMpegUtils.FLAG_CODEC_ALL,
            FFMpegUtils.OPT_CODEC_COPY
        ];

        if (videoInfo.codec_name !== "h264") {
            outArgs.push(FFMpegUtils.FLAG_CODEC_VIDEO, FFMpegUtils.OPT_CODEC_VIDEO_H264);
        }

        if (audioInfo.codec_name !== "aac") {
            outArgs.push(FFMpegUtils.FLAG_CODEC_AUDIO, FFMpegUtils.OPT_CODEC_AUDIO_AAC)
        }

        outArgs.push(this.options.output);
        return outArgs;
    }

}
