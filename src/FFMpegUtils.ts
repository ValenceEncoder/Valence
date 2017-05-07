import {IFFMpegProgress, IFFProbeOutput, IFFProbeStreamData, IFileInfo, IStreamInfo} from "./FFInterfaces";
import * as fs from "fs";
import * as path from "path";
import * as Path from "path";

export class FFMpegUtils {
    public static RGX_FORMED_OUTPUT: RegExp = /frame=\s*\d+\s*fps=\s*\d+\.*\d*\s*q=-?\d\.?\d?\s*size=\s*\d+kB\s*time=\s*\d{2}:\d{2}:\d{2}\.?\d{2}?\s*bitrate=\s*\d+\.?\d?k?bits\/s\s*speed=.*/;
    public static RGX_FRAME: RegExp         = /frame=\s*(\d+)/;
    public static RGX_FPS: RegExp           = /fps=\s*(\d+\.*\d*)/;
    public static RGX_Q: RegExp             = /q=\s*(-?\d\.?\d?)/;
    public static RGX_SIZE: RegExp          = /size=\s*(\d+)kB/;
    public static RGX_TIME: RegExp          = /time=\s*(\d{2}:\d{2}:\d{2}\.?\d{2}?)/;
    public static RGX_BITRATE: RegExp       = /bitrate=\s*(\d+\.?\d?k?bits\/s)/;
    public static RGX_SPEED: RegExp         = /speed=\s*(.*)x*/;

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
        let duration                        = fileInfo.format.duration;
        let size                            = fileInfo.format.size;
        let videoInfo: IStreamInfo          = {
            codec_name: videoStream.codec_name,
            duration: parseFloat(duration),
            size: parseInt(size)
        };
        let audioInfo: IStreamInfo          = {codec_name: audioStream.codec_name};
        return {
            videoInfo,
            audioInfo
        }
    }

    public static toObject(output: string): IFFMpegProgress {
        return {
            frame: FFMpegUtils.RGX_FRAME.test(output) ? parseInt(output.match(FFMpegUtils.RGX_FRAME)[1]) : null,
            fps: FFMpegUtils.RGX_FPS.test(output) ? parseInt(output.match(FFMpegUtils.RGX_FPS)[1]) : null,
            q: FFMpegUtils.RGX_Q.test(output) ? parseInt(output.match(FFMpegUtils.RGX_Q)[1]) : null,
            size: FFMpegUtils.RGX_SIZE.test(output) ? parseInt(output.match(FFMpegUtils.RGX_SIZE)[1]) : null,
            time: FFMpegUtils.RGX_TIME.test(output)? output.match(FFMpegUtils.RGX_TIME)[1] : null,
            bitrate: FFMpegUtils.RGX_BITRATE.test(output)? output.match(FFMpegUtils.RGX_BITRATE)[1] : null,
            speed: FFMpegUtils.RGX_SPEED.test(output) ? output.match(FFMpegUtils.RGX_SPEED)[1] : null
        }
    }

    public static changeExtension(filepath: string, ext: string): string {
        return Path.join(
            Path.dirname(filepath),
            `${Path.basename(filepath, Path.extname(filepath))}.${ext}`,
        );
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