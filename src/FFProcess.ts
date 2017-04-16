import {ChildProcess, spawn, exec} from "child_process";
import {IConfig} from "../typings/config";

const config:IConfig = require('config');

interface IFFProcess {
    exec(onclick: () => void):void;
}

abstract class FFProcess implements IFFProcess {

    protected args:string[];
    protected readonly command:string;
    protected process:ChildProcess;

    constructor(public inputFile:string, protected outputHandler:(data:any) => void, public outputFile?:string) {
        this.args = this.parseArgs();
        this.outputHandler = outputHandler;
    }

    abstract exec(onData: (data:any) => void): void;

    protected abstract parseArgs(): string[]; 

}

export class FFProbe extends FFProcess {
    command = config.bin.ffprobe;

    protected parseArgs():string[] {
        return `-v quiet -print_format json -show_format -show_streams ${this.inputFile}`.split(" ");
    }

    constructor(inputFile, outputHandler) {
        super(inputFile, outputHandler);
    }

    exec(onData: (data:any) => void):void {
        this.process = exec(this.command, this.args);
        this.process.stdout.setEncoding('utf8');
        this.process.stdout.on('data', this.outputHandler);
    }
}

export class FFMpeg extends FFProcess {
    command = config.bin.ffmpeg;

    protected parseArgs():string[] {
        return `-i ${this.inputFile} -c copy -c:a aac ${this.outputFile}`.split(" ");
    }

    constructor(inputFile, outputHandler, outputFile) {
        super(inputFile, outputHandler, outputFile);
    }

    exec(onData: (data:any) => void):void {
        this.process = spawn(this.command, this.args);
        this.process.stderr.setEncoding('utf8');
        this.process.stderr.on('data', this.outputHandler);
    }
}