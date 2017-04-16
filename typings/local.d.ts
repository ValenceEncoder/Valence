declare module "config" {
    interface IConfigBin {
        ffprobe: string;
        ffmpeg: string;
    }

    interface IConfigVersions {
        nwjs:number;
        ffmpeg:string;
        node:number;
    }

    export interface IConfig {
        bin: IConfigBin;
    }
}

declare module "M2A" {
    export interface IFFProcess {
        exec(onclick: () => void):void;
    }

    export interface IFFProcessOptions {
        input:string;
        output:string;
        process: "ffprobe" | "ffmpeg";
    }
}
