import {ChildProcess, spawn} from "child_process";
import {
    IProcessOptions, IFFProbeOutput,
    IStreamInfo, IFileInfo, IConfig, IFFMpegProgress
} from "./FFInterfaces";
import {FFMpegUtils} from "./FFMpegUtils";

const config: IConfig = require('config');

export abstract class FFProcess {
    protected args: string[];
    protected process: ChildProcess;
    protected outBuffer: string = "";
    protected abstract readonly targetOutput:"stdout"|"stderr";
    protected command: string;

    public abstract run(args?:any): Promise<IFileInfo|IFFMpegProgress>;

    protected abstract parseArgs(infoVideo?: IStreamInfo, infoAudio?: IStreamInfo): string[];

}

export class FFProbe extends FFProcess {
    protected readonly targetOutput                = "stdout";
    protected bufferOutput: (data: string) => void = (data: string) => {
        this.outBuffer += data;
    };

    constructor(public options: IProcessOptions) {
        super();
        this.args    = this.parseArgs();
        this.command = config.bin.ffprobe;
    }

    public run(): Promise<IFileInfo> {

        return new Promise((resolve, reject) => {
            this.process = spawn(this.command, this.args);
            this.process[this.targetOutput].setEncoding('utf8');
            this.process[this.targetOutput].on('data', this.bufferOutput);
            this.process[this.targetOutput].on('close', () => {
                let output: IFFProbeOutput;
                try {
                    output = JSON.parse(this.outBuffer);
                    resolve(FFMpegUtils.getFileInfo(output));
                } catch(err) {
                    reject(err);
                }

            });
        });
    }

    protected parseArgs(): string[] {
        return `-v quiet -print_format json -show_format -show_streams ${this.options.input}`.split(" ");
    }

}

export class FFMpeg extends FFProcess {
    protected readonly targetOutput = "stderr";


    constructor(public options: IProcessOptions, protected onCloseHandler?: () => void) {
        super();
        this.command = config.bin.ffmpeg;

        if (onCloseHandler == null) {
            this.onCloseHandler = () => {
                console.log("Encoding Complete.");
            }
        }
    }

    public run(fileInfo:IFileInfo): Promise<IFFMpegProgress> {
        return new Promise((resolve, reject) => {
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
                    resolve(result);
                }

            });
            this.process[this.targetOutput].on('close', this.onCloseHandler);
        });
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
