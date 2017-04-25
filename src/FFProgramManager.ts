// import {FFMpeg, FFProbe} from "./FFProcess";
// import {
//     IFFEndHandler, IFFOutputHandler, IFFProbeOutput, IFFProbeStreamData, IFFProcessOptions, IProgramManagerCallback,
//     IStreamInfo
// } from './IFFInterfaces';
//
//
// export class FFMpegProgramManager {
//     public options:IFFProcessOptions;
//     public endHandler: IFFEndHandler;
//     private ffprobeInstance: FFProbe = null;
//     private ffmpegInstance: FFMpeg = null;
//
//     constructor() {
//         if (require.main == module) {
//             throw new Error("FFMpegProgramManager Class cannot be instantiated from the command line. Use FFCLI.js instead");
//         }
//     }
//
//     run(handler:IProgramManagerCallback, options: IFFProcessOptions): void {
//         this.endHandler = handler;
//         this.options = options;
//         switch (this.options.process) {
//             case "ffprobe":
//                 this.ffprobeInstance = new FFProbe(this.options, this.endHandler);
//                 this.ffprobeInstance.run();
//                 break;
//             case "ffmpeg":
//                 this.ffprobeInstance = new FFProbe(this.options, this.pipeProbeInfo);
//                 break;
//
//         }
//
//     }
//
//     private pipeProbeInfo(fileInfo:IFFProbeOutput):void {
//         let videoStream:IFFProbeStreamData = fileInfo.streams.find(i => i.codec_type == 'video');
//         let audioStream:IFFProbeStreamData = fileInfo.streams.find(i => i.codec_type == 'audio');
//         let videoInfo:IStreamInfo = {codec_name: videoStream.codec_name, duration: videoStream.duration};
//         let audioInfo:IStreamInfo = {codec_name: audioStream.codec_name};
//
//         this.ffmpegInstance = new FFMpeg(this.options, null, FFMpegProgramManager.ffmpegOutHandler);
//         this.ffmpegInstance.run(videoInfo, audioInfo);
//     }
//
//     /***
//      * Test Method, Remove before release
//      * @param message
//      */
//     private static ffmpegOutHandler(message:string):void {
//         console.log(message);
//     }
// }
