import { ChildProcess, spawn } from "child_process";
import * as decimal from "decimal.js";
import { EventEmitter } from "events";
import { IFFConfig, IFFProbeOutput, IFileInfo, IProcessOptions, IStreamInfo } from "./FFInterfaces";
import { FFMpegUtils } from "./FFMpegUtils";
import Decimal = decimal.Decimal;

/* tslint:disable:naming-convention no-console */
export abstract class FFProcess extends EventEmitter {
    protected abstract readonly targetOutput: "stdout" | "stderr";
    protected args: string[];
    protected process: ChildProcess;
    protected outBuffer: string                   = "";
    public static readonly EVENT_OUTPUT: string   = "OUTPUT";
    public static readonly EVENT_COMPLETE: string = "COMPLETE";
    public static readonly EVENT_ERROR: string    = "ERROR";

    protected command: string;

    constructor(protected config: IFFConfig, options: IProcessOptions) {
        super();
        if (!FFMpegUtils.fileExists(options.input)) {
            throw new Error(`File ${options.input} does not exist`);
        }
    }

    public abstract run(args?: any): any;
}

export class FFProbe extends FFProcess {
    protected readonly targetOutput: "stdout" = "stdout";

    constructor(protected config: IFFConfig, public options: IProcessOptions) {
        super(config, options);
        this.args    = FFProbe.parseArgs(options);
        this.command = config.bin.ffprobe;
    }

    protected bufferOutput(data: string): void {
        this.outBuffer += data;
    }

    public run(): this {
        this.process = spawn(this.command, this.args, { shell: true });
        this.process[this.targetOutput].setEncoding("utf8");
        this.process[this.targetOutput].on("error", (err: any) => {
            console.error(err);
            this.emit(FFProbe.EVENT_ERROR, err);
        });
        this.process[this.targetOutput].on("data", (data: string) => this.bufferOutput(data));
        this.process[this.targetOutput].on("close", () => {
            try {
                const output: IFFProbeOutput = JSON.parse(this.outBuffer);
                this.emit(FFProbe.EVENT_OUTPUT, output);
            } catch (ex) {

                this.emit(FFProbe.EVENT_ERROR, "FFprobe did not return readable data");
                throw ex;
            }
        });

        return this;
    }

    public static parseArgs(options: IProcessOptions): string[] {
        const quotedFilename = `"${options.input}"`;
        return `-v quiet -print_format json -show_format -show_streams`.split(" ").concat([quotedFilename]);
    }

}

export class FFMpeg extends FFProcess {
    protected readonly targetOutput: "stderr" = "stderr";

    constructor(protected config: IFFConfig, public options: IProcessOptions) {
        super(config, options);
        this.command = config.bin.ffmpeg;

    }

    public run(fileInfo: IFileInfo): FFMpeg {

        this.args    = FFMpeg.parseArgs(fileInfo.videoInfo, fileInfo.audioInfo, this.options);
        this.process = spawn(this.command, this.args);
        this.process[this.targetOutput].setEncoding("utf8");

        /**
         * Either Node or FFMPEG is flushing the output buffer with partially formed messages, so we test for correctly formed output
         * and if not we buffer it and then flush it once its formed
         */
        this.process[this.targetOutput].on("data", (message: string) => {
            this.outBuffer += message;
            if (FFMpegUtils.RGX_FORMED_OUTPUT.test(this.outBuffer)) {
                const result = this.outBuffer;
                this.outBuffer = "";
                this.emit(FFProcess.EVENT_OUTPUT, FFMpegUtils.toObject(result));
            }
        });

        this.process.on("exit", (code: number) => {
            this.emit(FFMpeg.EVENT_COMPLETE, code);
        });
        this.process.on("error", () => {
            this.emit(FFMpeg.EVENT_ERROR);
        });
        return this;
    }

    public static parseArgs(videoInfo: IStreamInfo, audioInfo: IStreamInfo, options: IProcessOptions): string[] {
        const outArgs: string[] = [
            FFMpegUtils.FLAG_VERBOSITY,
            FFMpegUtils.OPT_VERBOSITY_QUIET,
            FFMpegUtils.FLAG_STATS,
            FFMpegUtils.FLAG_INPUT,
            options.input,
            FFMpegUtils.FLAG_OVERWRITE,
            FFMpegUtils.FLAG_CODEC_ALL,
            FFMpegUtils.OPT_CODEC_COPY
        ];

        if (videoInfo.codec_name !== "h264") {
            outArgs.push(FFMpegUtils.FLAG_CODEC_VIDEO, FFMpegUtils.OPT_CODEC_VIDEO_H264);
        }

        if (audioInfo.codec_name !== "aac") {
            outArgs.push(FFMpegUtils.FLAG_CODEC_AUDIO, FFMpegUtils.OPT_CODEC_AUDIO_AAC);
        }

        outArgs.push(options.output);
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

    // TODO Add options to output other container formats
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
        };
    }

    public get Size(): number {
        return this.probeData.videoInfo.size / 1000;
    }

    public getProgress(bytesProcessed: number): number {
        const x: Decimal = new Decimal(bytesProcessed);
        const y: Decimal = new Decimal(this.Size);
        return x.dividedBy(y).times(100).toDecimalPlaces(2).toNumber();
    }

    constructor(private probeData: IFileInfo, private jobOptions: IProcessOptions) {
    }
}
