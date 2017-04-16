///<reference path="../typings/local.d.ts"/>
import {ChildProcess, spawn, exec} from "child_process";
import {IConfig} from "config";
import {IFFProcess, IFFProcessOptions} from "M2A";

const config:IConfig = require('config');


abstract class FFProcess implements IFFProcess {
    protected args:string[];
    protected process:ChildProcess;
    protected outBuffer:string = "";
    protected outHandler:(data:string) => void = (data:string) => {
        this.outBuffer += data;
    };
    protected targetOutput:"stderr"|"stdout";
    protected command:string;

    constructor(public options:IFFProcessOptions, protected endHandler:(data:any) => void) {
        this.args = this.parseArgs();
        this.endHandler = endHandler;
        this.targetOutput = (options.process == "ffprobe") ? "stdout" : "stderr";
        this.command = (options.process == "ffprobe") ? config.bin.ffprobe : config.bin.ffmpeg;
    }

    public exec():void{
        console.info(`Spawning ${this.options.process.toUpperCase()} with args: ${this.args.join(" ")}`);
        this.process = spawn(this.command, this.args);
        this.process[this.targetOutput].setEncoding('utf8');
        this.process[this.targetOutput].on('data', this.outHandler);
        this.process[this.targetOutput].on('close', () => { this.endHandler(this.outBuffer) });
    }

    protected abstract parseArgs(): string[]; 

}

export class FFProbe extends FFProcess {

    protected parseArgs():string[] {
        return `-v quiet -print_format json -show_format -show_streams ${this.options.input}`.split(" ");
    }

}

export class FFMpeg extends FFProcess {

    protected parseArgs():string[] {
        return `-i ${this.options.input} -c copy -c:a aac ${this.options.output}`.split(" ");
    }

}