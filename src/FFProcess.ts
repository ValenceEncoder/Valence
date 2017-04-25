///<reference path="../typings/local.d.ts"/>
import {ChildProcess, spawn} from "child_process";
import {IConfig} from "../typings/local";
import {
    ICLIArgs, IFFmpegOutputHandler, IFFProbeOutput, IFFProbeOutputHandler,
    IStreamInfo
} from "./FFInterfaces";

const config: IConfig = require('config');

export abstract class FFProcess {
    protected args: string[];
    protected process: ChildProcess;
    protected outBuffer: string = "";
    protected abstract readonly targetOutput;
    protected command: string;

    public abstract run(videoInfo?: IStreamInfo, audioInfo?: IStreamInfo):void;

    protected abstract parseArgs(infoVideo?: IStreamInfo, infoAudio?: IStreamInfo): string[];

}

export class FFProbe extends FFProcess {
    protected readonly targetOutput = "stdout";
    protected bufferOutput: (data: string) => void = (data: string) => {
        this.outBuffer += data;
    };

    constructor(public options: ICLIArgs, protected outputHandler:IFFProbeOutputHandler) {
        super();
        this.args = this.parseArgs();
        this.command = config.bin.ffprobe;
    }

    public run(): void {
        this.process = spawn(this.command, this.args);
        this.process[this.targetOutput].setEncoding('utf8');
        this.process[this.targetOutput].on('data', this.bufferOutput);
        this.process[this.targetOutput].on('close', () => {

            let output:IFFProbeOutput = JSON.parse(this.outBuffer);
            this.outputHandler(output);

        });
    }

    protected parseArgs(): string[] {
        return `-v quiet -print_format json -show_format -show_streams ${this.options.input}`.split(" ");
    }

}

export class FFMpeg extends FFProcess {
    protected readonly targetOutput = "stderr";

    private readonly FLAG_VERBOSITY: string = "-v";
    private readonly FLAG_INPUT: string = "-i";
    private readonly FLAG_CODEC_ALL: string = "-c";
    private readonly FLAG_CODEC_AUDIO: string = "-c:a";
    private readonly FLAG_CODEC_VIDEO: string = "-c:v";
    private readonly FLAG_CODEC_SUBS: string = "-c:s";
    private readonly FLAG_STATS: string = "-stats";

    private readonly OPT_VERBOSTY_QUIET = "quiet";
    private readonly OPT_CODEC_COPY: string = "copy";
    private readonly OPT_CODEC_AUDIO_AAC: string = "aac";
    private readonly OPT_CODEC_VIDEO_H264: string = "h264";

    constructor(public options: ICLIArgs, protected outputHandler:IFFmpegOutputHandler, protected onCloseHandler?:() => void) {
        super();
        this.command = config.bin.ffmpeg;

        if(onCloseHandler == null) {
            this.onCloseHandler = () => {
                console.log("Encoding Complete.");
            }
        }
    }

    public run(videoInfo: IStreamInfo, audioInfo: IStreamInfo): void {
        this.args = this.parseArgs(videoInfo, audioInfo);
        console.log(`FFmpeg args: ${this.command} ${this.args.join(" ")}`);
        this.process = spawn(this.command, this.args);
        this.process[this.targetOutput].setEncoding('utf8');
        this.process[this.targetOutput].on('data', this.outputHandler);
        this.process[this.targetOutput].on('close', this.onCloseHandler);
    }

    protected parseArgs(videoInfo: IStreamInfo, audioInfo: IStreamInfo): string[] {

        let outArgs: string[] = [
            this.FLAG_VERBOSITY,
            this.OPT_VERBOSTY_QUIET,
            this.FLAG_STATS,
            this.FLAG_INPUT,
            this.options.input,
            this.FLAG_CODEC_ALL,
            this.OPT_CODEC_COPY
        ];

        if (videoInfo.codec_name !== "h264") {
            outArgs.push(this.FLAG_CODEC_VIDEO, this.OPT_CODEC_VIDEO_H264);
        }

        if (audioInfo.codec_name !== "aac") {
            outArgs.push(this.FLAG_CODEC_AUDIO, this.OPT_CODEC_AUDIO_AAC)
        }

        outArgs.push(this.options.output);
        return outArgs;
    }

}