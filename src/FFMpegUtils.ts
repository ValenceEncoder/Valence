import {IFFMpegProgress, IFFProbeOutput, IFFProbeStreamData, IFileInfo, IStreamInfo} from "./FFInterfaces";
import * as fs from "fs";
import * as path from "path";

export class FFMpegUtils {
    public static RGX_FORMED_OUTPUT: RegExp = /frame=\s*\d+\s*fps=\s*\d+\s+q=-?\d\.?\d?\s+size=\s*\d+kB\s+time=\s*\d{2}:\d{2}:\d{2}\.?\d{2}?\s*bitrate=\s*\d+\.?\d?k?bits\/s\s+speed=\s*\d+\.?\d?x/;
    public static RGX_FRAME: RegExp         = /frame=\s*(\d+)/;
    public static RGX_FPS: RegExp           = /fps=\s*(\d+)/;
    public static RGX_Q: RegExp             = /q=\s*(-?\d\.?\d?)/;
    public static RGX_SIZE: RegExp          = /size=\s*((\s?\d+)kB)/;
    public static RGX_TIME: RegExp          = /time=\s*(\d{2}:\d{2}:\d{2}\.?\d{2}?)/;
    public static RGX_BITRATE: RegExp       = /bitrate=\s*(\d+\.?\d?k?bits\/s)/;
    public static RGX_SPEED: RegExp         = /speed=\s*(\d+\.?\d?x)/;

    public static FLAG_VERBOSITY: string   = "-v";
    public static FLAG_INPUT: string       = "-i";
    public static FLAG_OVERWRITE: string   = "-y";
    public static FLAG_CODEC_ALL: string   = "-c";
    public static FLAG_CODEC_AUDIO: string = "-c:a";
    public static FLAG_CODEC_VIDEO: string = "-c:v";
    public static FLAG_CODEC_SUBS: string  = "-c:s";
    public static FLAG_STATS: string       = "-stats";

    public static OPT_VERBOSTY_QUIET           = "quiet";
    public static OPT_CODEC_COPY: string       = "copy";
    public static OPT_CODEC_AUDIO_AAC: string  = "aac";
    public static OPT_CODEC_VIDEO_H264: string = "h264";

    public static getFileInfo(fileInfo: IFFProbeOutput): IFileInfo {

        let videoStream: IFFProbeStreamData = fileInfo.streams.find(i => i.codec_type == 'video');
        let audioStream: IFFProbeStreamData = fileInfo.streams.find(i => i.codec_type == 'audio');
        let videoInfo: IStreamInfo          = {codec_name: videoStream.codec_name, duration: videoStream.duration};
        let audioInfo: IStreamInfo          = {codec_name: audioStream.codec_name};
        return {
            videoInfo,
            audioInfo
        }
    }

    public static toObject(output: string): IFFMpegProgress {
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

    public static fileExists(filepath: string): boolean {
        try {
            fs.statSync(path.resolve(filepath));
        } catch (e) {
            console.info(`File ${filepath} does not exist.`);
            return false;
        }

        return true;
    }
}