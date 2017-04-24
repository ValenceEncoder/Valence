import {FFMpegProgramManager} from "./FFProgramManager";
const programManager:FFMpegProgramManager = new FFMpegProgramManager();

const ffprobeEndHandler:(message:string) => void = (message:string) => {
  document.getElementById('ffprobe').innerHTML = message;
};

programManager.run(ffprobeEndHandler, {input: './test/vid/small.mkv', process: 'ffprobe'});
