import {ChildProcess, spawn} from "child_process";
import {EventEmitter} from "events";
import {
    IProcessOptions, IFFProbeOutput,
    IStreamInfo, IFileInfo, IConfig
} from "./FFInterfaces";
import {FFMpegUtils} from "./FFMpegUtils";
import * as decimal from "decimal.js";
import Decimal = decimal.Decimal;



export abstract class FFProcess extends EventEmitter {
    protected abstract readonly targetOutput: "stdout" | "stderr";
    protected args: string[];
    protected process: ChildProcess;
    protected outBuffer: string                   = "";
    public static readonly EVENT_OUTPUT: string   = "OUTPUT";
    public static readonly EVENT_COMPLETE: string = "COMPLETE";
    public static readonly EVENT_ERROR: string    = "ERROR";

    protected command: string;

    constructor(protected config:IConfig, options: IProcessOptions) {
        super();
        if (!FFMpegUtils.fileExists(options.input)) {
            throw new Error(`File ${options.input} does not exist`);
        }
    }

    public abstract run(args?: any): any;

    protected abstract parseArgs(infoVideo?: IStreamInfo, infoAudio?: IStreamInfo): string[];

}

export class FFProbe extends FFProcess {
    protected readonly targetOutput: "stdout" = "stdout";

    protected bufferOutput: (data: string) => void = (data: string) => {
        this.outBuffer += data;
    };

    constructor(protected config:IConfig, public options: IProcessOptions) {
        super(config, options);
        this.args    = this.parseArgs();
        this.command = config.bin.ffprobe;
    }

    public run(): FFProbe {
        this.process = spawn(this.command, this.args);
        this.process[this.targetOutput].setEncoding('utf8');
        this.process[this.targetOutput].on('error', (err: any) => {
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
    protected readonly targetOutput: "stderr" = "stderr";


    constructor(protected config:IConfig, public options: IProcessOptions) {
        super(config, options);
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
            console.log(this.outBuffer);
            this.outBuffer += message;
            if (FFMpegUtils.RGX_FORMED_OUTPUT.test(this.outBuffer)) {
                let result     = this.outBuffer;
                this.outBuffer = "";
                this.emit(FFProcess.EVENT_OUTPUT, FFMpegUtils.toObject(result));
            }
        });
        this.process[this.targetOutput].on('close', () => this.emit(FFMpeg.EVENT_COMPLETE));
        this.process[this.targetOutput].on('error', (err: any) => this.emit(FFMpeg.EVENT_ERROR, err));
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

export class VideoFile {

    public get VideoCodec(): string {
        return this.probeData.videoInfo.codec_name;
    }

    public get AudioCodec(): string {
        return this.probeData.audioInfo.codec_name;
    }

    public get Duration(): number {
        return this.probeData.videoInfo.duration;
    }

    public get InputPath(): string {
        return this.jobOptions.input;
    }

    //TODO Add options to output other container formats
    public get OutputPath(): string {
        return FFMpegUtils.changeExtension(this.InputPath, "mp4");
    }

    public get ProbeData(): IFileInfo {
        return this.probeData;
    }

    public get ProcessOptions(): IProcessOptions {
        return {
            input: this.InputPath,
            output: this.OutputPath
        }
    }

    public get Size(): number {
        return this.probeData.videoInfo.size / 1000;
    }

    public getProgress(bytesProcessed: number): number {
        var x: Decimal = new Decimal(bytesProcessed);
        var y: Decimal = new Decimal(this.Size);
        return x.dividedBy(y).times(100).toDecimalPlaces(2).toNumber();
    }

    constructor(private probeData: IFileInfo, private jobOptions: IProcessOptions) {
    }
}
