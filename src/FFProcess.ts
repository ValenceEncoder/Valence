///<reference path="../typings/local.d.ts"/>
import {ChildProcess, spawn} from "child_process";
import {IConfig} from "../typings/local";
import {
    IProcessOptions, IFFmpegOutputHandler, IFFProbeOutput, IFFProbeOutputHandler,
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

    constructor(public options: IProcessOptions, protected outputHandler:IFFProbeOutputHandler) {
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

    



    constructor(public options: IProcessOptions, protected outputHandler:IFFmpegOutputHandler, protected onCloseHandler?:() => void) {
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
        this.process = spawn(this.command, this.args);
        this.process[this.targetOutput].setEncoding('utf8');

        /**
         * Either Node or FFMPEG is flushing the output buffer with partially formed messages, so we test for correctly formed output
         * and if not we buffer it and then flush it once its formed
         */
        this.process[this.targetOutput].on('data', (message:string) => {
            this.outBuffer += message;
            if(this.outBuffer.match(FFMpegUtils.RGX_FORMED_OUTPUT)) {
                let result = this.outBuffer;
                this.outBuffer = "";
                this.outputHandler(result);
            }

        });
        this.process[this.targetOutput].on('close', this.onCloseHandler);
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


export class FFMpegUtils {
    public static RGX_FORMED_OUTPUT = /frame=\s*\d+\s*fps=\s*\d+\s+q=-?\d\.?\d?\s+size=\s*\d+kB\s+time=\s*\d{2}:\d{2}:\d{2}\.?\d{2}?\s*bitrate=\s*\d+\.?\d?k?bits\/s\s+speed=\s*\d+\.?\d?x/;
    public static RGX_FRAME = /frame=\s*(\d+)/;
    public static RGX_FPS = /fps=\s*(\d+)/;
    public static RGX_Q = /q=\s*(-?\d\.?\d?)/;
    public static RGX_SIZE = /size=\s*((\s?\d+)kB)/;
    public static RGX_TIME = /time=\s*(\d{2}:\d{2}:\d{2}\.?\d{2}?)/;
    public static RGX_BITRATE = /bitrate=\s*(\d+\.?\d?k?bits\/s)/;
    public static RGX_SPEED = /speed=\s*(\d+\.?\d?x)/;

    public static FLAG_VERBOSITY: string = "-v";
    public static FLAG_INPUT: string = "-i";
    public static FLAG_OVERWRITE: string = "-y";
    public static FLAG_CODEC_ALL: string = "-c";
    public static FLAG_CODEC_AUDIO: string = "-c:a";
    public static FLAG_CODEC_VIDEO: string = "-c:v";
    public static FLAG_CODEC_SUBS: string = "-c:s";
    public static FLAG_STATS: string = "-stats";

    public static OPT_VERBOSTY_QUIET = "quiet";
    public static OPT_CODEC_COPY: string = "copy";
    public static OPT_CODEC_AUDIO_AAC: string = "aac";
    public static OPT_CODEC_VIDEO_H264: string = "h264";
    
    public static toObject(output:string):IFFMpegProgress {
        return {
            frame: parseInt(output.match(FFMpegUtils.RGX_FRAME)[1]),
            fps: parseInt(output.match(FFMpegUtils.RGX_FPS)[1]),
            q: parseInt(output.match(FFMpegUtils.RGX_Q)[1]),
            size: output.match(FFMpegUtils.RGX_SIZE)[1],
            time: output.match(FFMpegUtils.RGX_TIME)[1],
            bitrate: output.match(FFMpegUtils.RGX_BITRATE)[1],
            speed: output.match(FFMpegUtils.RGX_SPEED)[1]
        }
    }
}

export interface IFFMpegProgress {
    frame:number;
    fps:number;
    q:number;
    size:string;
    time:string;
    bitrate:string;
    speed:string;
}