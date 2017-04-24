///<reference path="../typings/local.d.ts"/>
import { ChildProcess, spawn } from "child_process";
import { IConfig } from "../typings/local";

const config: IConfig = require('config');

export interface IFFProcess {
    run(): void;
    options: IFFProcessOptions;
}

export interface IFFProcessOptions {
    input: string;
    output?: string;
    process: "ffprobe" | "ffmpeg";
}

export interface IFFProbeStreamData {
    index: number;
    codec_name: string;
    codec_long_name: string;
    codec_type: string;
    codec_time_base: string;
    codec_tag_string?: string;
    codec_tag?: string;
    sample_fmt?: string;
    sample_rate?: string;
    bits_per_sample: number;
    channels?: number;
    channel_layout?: string;
    profile?: string;
    width?: number;
    height?: number;
    coded_width?: number;
    coded_height?: number;
    has_b_frames?: number;
    sample_aspect_ratio?: string;
    display_aspect_ratio?: string;
    pix_fmt?: string;
    level?: number;
    color_range?: string;
    color_space?: string ;
    color_transfer?: string;
    color_primaries?: string;
    chroma_location?: string;
    refs?: number;
    is_avc?: number;
    nal_length_size?: number;
    r_frame_rate?: string;
    avg_frame_rate?: string;
    time_base?: string;
    start_pts?: number;
    start_time?: string;
    duration_ts?: number;
    duration?: string;
    bit_rate?: string;
    bits_per_raw_sample?: string;
    nb_frames?: string;
    disposition?:IFFProbeDisposition;
    tags:IFFProbeStreamTags;
    
}

export interface IFFProbeStreamTags {
    creation_time?:string;
    language?:string;
    encoder?:string;
}

export interface IFFProbeFormat {
    filename?: string;
    nb_streams?: number;
    nb_programs?: number;
    format_name?: string;
    format_long_name?: string;
    start_time?: string;
    duration?: string;
    size?: string;
    bit_rate?: string;
    probe_score?: number;
    tags?:IFFProbeFormatTags;
}

export interface IFFProbeFormatTags {
    major_brand?: string;
    minor_version?: string;
    compatible_brands?: string;
    creation_time?: string;
    encoder?: string;
}

export interface IFFProbeDisposition {
    "default"?: number;
    dub?: number;
    original?: number;
    comment?: number;
    lyrics?: number;
    karaoke?: number;
    forced?: number;
    hearing_impaired?: number;
    visual_impaired?: number;
    clean_effects?: number;
    attached_pic?: number;
}

export interface IFFProbeOutput {
    streams:IFFProbeStreamData[];
    format?:IFFProbeFormat;
}

export interface IFFOutputHandler {
    (message: string): void;
}

export abstract class FFProcess implements IFFProcess {
    protected args: string[];
    protected process: ChildProcess;
    protected outBuffer: string = "";
    protected outHandler: (data: string) => void = (data: string) => {
        this.outBuffer += data;
    };
    protected targetOutput: "stderr" | "stdout";
    protected command: string;

    constructor(public options: IFFProcessOptions, protected endHandler: (data: any) => void) {
        this.args = this.parseArgs();
        this.endHandler = endHandler;
        this.targetOutput = (options.process == "ffprobe") ? "stdout" : "stderr";
        this.command = (options.process == "ffprobe") ? config.bin.ffprobe : config.bin.ffmpeg;
    }

    public run(): void {
        // console.info(`Spawning ${this.options.process.toUpperCase()} with args: ${this.args.join(" ")}`);
        this.process = spawn(this.command, this.args);
        this.process[this.targetOutput].setEncoding('utf8');
        this.process[this.targetOutput].on('data', this.outHandler);
        this.process[this.targetOutput].on('close', () => { this.endHandler(this.outBuffer) });
    }

    protected abstract parseArgs(): string[];

}

export class FFProbe extends FFProcess {

    protected parseArgs(): string[] {
        return `-v quiet -print_format json -show_format -show_streams ${this.options.input}`.split(" ");
    }

}

export class FFMpeg extends FFProcess {

    protected parseArgs(): string[] {
        return `-i ${this.options.input} -c copy -c:a aac ${this.options.output}`.split(" ");
    }

}