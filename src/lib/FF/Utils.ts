import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import { Config } from "../Config";
import { IFFMpegProgress, IFFProbeOutput, IFFProbeStreamData, IFileInfo, IGPUInfo, IGPUOutput, IStreamInfo } from "./FFInterfaces";

/* tslint:disable:naming-convention */
export class Utils {

    /***
     * FFMpeg Regular Expressions
     * Used to parse FFMpeg Output
     * @type {RegExp}
     */
    public static readonly RGX_FORMED_OUTPUT: RegExp = /frame=\s*\d+\s*fps=\s*\d+\.*\d*\s*q=-?\d\.?\d?\s*size=\s*\d+kB\s*time=\s*\d{2}:\d{2}:\d{2}\.?\d{2}?\s*bitrate=\s*\d+\.?\d?k?bits\/s\s*speed=.*/;
    public static readonly RGX_FRAME: RegExp         = /frame=\s*(\d+)/;
    public static readonly RGX_FPS: RegExp           = /fps=\s*(\d+\.*\d*)/;
    public static readonly RGX_Q: RegExp             = /q=\s*(-?\d\.?\d?)/;
    public static readonly RGX_SIZE: RegExp          = /size=\s*(\d+)kB/;
    public static readonly RGX_TIME: RegExp          = /time=\s*(\d{2}:\d{2}:\d{2}\.?\d{2}?)/;
    public static readonly RGX_BITRATE: RegExp       = /bitrate=\s*(\d+\.?\d?k?bits\/s)/;
    public static readonly RGX_SPEED: RegExp         = /speed=\s*(.*)x*/;

    /**
     * Reslash Regular Expressions
     * To detect and prevent problems with Windows Filepaths.
     * @type {RegExp}
     */
    public static readonly RGX_EXTENDED_PATH: RegExp = /^\\\\\?\\/;
    public static readonly RGX_ASCII: RegExp         = /[^\x00-\x80]+/;

    /**
     * FFMpeg Command Line Flags
     * The flags that ffmpeg uses to start a command, some can be modified using options defined in the OPT props
     * @type {string}
     */
    public static readonly FLAG_VERBOSITY: string   = "-v";
    public static readonly FLAG_INPUT: string       = "-i";
    public static readonly FLAG_OVERWRITE: string   = "-y";
    public static readonly FLAG_CODEC_ALL: string   = "-c";
    public static readonly FLAG_CODEC_AUDIO: string = "-c:a";
    public static readonly FLAG_CODEC_VIDEO: string = "-c:v";
    public static readonly FLAG_CODEC_SUBS: string  = "-c:s";
    public static readonly FLAG_STATS: string       = "-stats";

    /**
     * FFMpeg options
     * Options that modify an FFMPEG command, options can be matched to flags using the naming convention:
     * {TYPE}_{COMMAND}[_{OPTION}]
     * e.g. [FLAG_VERBOSITY, OPT_VERBOSITY_QUIET].join(" ") will compile to "-v quiet"
     * @type {string}
     */
    public static readonly OPT_VERBOSITY_QUIET: string  = "quiet";
    public static readonly OPT_CODEC_COPY: string       = "copy";
    public static readonly OPT_CODEC_AUDIO_AAC: string  = "aac";
    public static readonly OPT_CODEC_VIDEO_H264: string = "h264";

    /**
     * Truncates FFProbe output to IFileInfo format which is used by several consumers.
     * @param fileInfo
     * @returns {{videoInfo: IStreamInfo, audioInfo: IStreamInfo}}
     */
    public static getFileInfo(fileInfo: IFFProbeOutput): IFileInfo {
        const videoStream: IFFProbeStreamData = fileInfo.streams.find((i) => i.codec_type === "video");
        const audioStream: IFFProbeStreamData = fileInfo.streams.find((i) => i.codec_type === "audio");
        const duration                        = fileInfo.format.duration;
        const size                            = fileInfo.format.size;
        const videoInfo: IStreamInfo          = {
            codec_name: videoStream.codec_name,
            duration: parseFloat(duration),
            size: parseInt(size, 10)
        };
        const audioInfo: IStreamInfo          = {codec_name: audioStream.codec_name};
        return {
            videoInfo,
            audioInfo
        };
    }

    /**
     * Joins a relative path to the APP root
     * @param filepath the path to prepend with app root
     */
    public static path(filepath: string): string {
        return url.format({
            protocol: "file:",
            pathname: path.join(Config.System.AppDistRoot, filepath),
            slashes: true
        });
    }

    /**
     * Gets a HTML template from the views directory
     * @param template the path to prepend with template root
     */
    public static getTemplate(template: string): string {
        return url.format({
            protocol: "file:",
            pathname: path.join(Config.System.TemplateRoot, template),
            slashes: true
        });
    }

    public static parseGPUInfo(gpuInfo: IGPUOutput): IGPUInfo {

        return {
            Manufacturer: gpuInfo.AdapterCompatibility,
            Model: gpuInfo.VideoProcessor,
            FullName: gpuInfo.Description,
            Device: gpuInfo.DeviceID
        };
    }

    /**
     * Formats output from FFMpeg as JSON
     * @param output {string} | The FFmpeg output string
     * @returns {{frame: number, fps: number, q: number, size: number, time: string, bitrate: string, speed: string}}
     */
    public static toObject(output: string): IFFMpegProgress {
        return {
            frame: Utils.RGX_FRAME.test(output)       ? parseInt(output.match(Utils.RGX_FRAME)[1], 10) : null,
            fps: Utils.RGX_FPS.test(output)           ? parseInt(output.match(Utils.RGX_FPS)[1], 10) : null,
            q: Utils.RGX_Q.test(output)               ? parseInt(output.match(Utils.RGX_Q)[1], 10) : null,
            size: Utils.RGX_SIZE.test(output)         ? parseInt(output.match(Utils.RGX_SIZE)[1], 10) : null,
            time: Utils.RGX_TIME.test(output)         ? output.match(Utils.RGX_TIME)[1] : null,
            bitrate: Utils.RGX_BITRATE.test(output)   ? output.match(Utils.RGX_BITRATE)[1] : null,
            speed: Utils.RGX_SPEED.test(output)       ? output.match(Utils.RGX_SPEED)[1] : null
        };
    }

    /**
     * Replace backslashes in Windows paths with forward slashes and detect unsupported characters and paths
     * @param filepath {string}
     * @returns {string}
     */
    public static reslashPath(filepath: string): string {
        const isExtendedLengthPath = Utils.RGX_EXTENDED_PATH.test(filepath);
        const hasNonAscii = Utils.RGX_ASCII.test(filepath);

        if (isExtendedLengthPath || hasNonAscii) {
            const err: Error = (isExtendedLengthPath) ? new Error("Windows Extended (UNC) file paths are not supported.") : new Error("There are ASCII characters in the file path. Please rename the file and remove any ASCII characters.");
            throw err;
        }

        return filepath.replace(/\\/g, "/");
    }

    /**
     * Change the extension of a file
     * @param filepath
     * @param ext
     * @returns {string}
     */
    public static changeExtension(filepath: string, ext: string): string {
        return path.join(
            path.dirname(filepath),
            `${path.basename(filepath, path.extname(filepath))}.${ext}`,
        );
    }

    /**
     * Check if a given file exists.
     * @param filepath
     * @returns {boolean}
     */
    public static fileExists(filepath: string): boolean {
        return fs.existsSync(path.resolve(filepath));
    }
}
