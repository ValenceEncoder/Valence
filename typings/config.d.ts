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