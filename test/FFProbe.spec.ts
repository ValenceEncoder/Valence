import * as chai from 'chai';
import {FFProbe} from '../src/lib/FFProcess';
import {IConfig, IFileInfo, IProcessOptions} from "../src/lib/FFInterfaces";
import * as Path from "path";
const expect          = chai.expect;
const config: IConfig = {
    bin: {
        ffmpeg: Path.resolve(".", "ffmpeg/bin/ffmpeg"),
        ffprobe: Path.resolve(".", "ffmpeg/bin/ffprobe")
    }
};

const fileInfo: IFileInfo = {
    videoInfo: {codec_name: 'h264', duration: 2629.6, size: 656445642},
    audioInfo: {codec_name: 'ac3'}
};

const options: IProcessOptions = {input: "G:\\Downloads\\Movies\\The Enemies of Reason Part 1.mkv"};

describe("FFProbe", function () {
    let ffprobeInstance = new FFProbe(config, options);
    describe("#constructor()", function () {
        it("be an instance of the FFProbe class", function () {
            expect(ffprobeInstance).to.be.instanceof(FFProbe);
        });
    });

    describe("#parseArgs()", function () {

        it("should construct and array of command line arguments and quote the filepath", function () {
            let expected = [
                '-v',
                'quiet',
                '-print_format',
                'json',
                '-show_format',
                '-show_streams',
                '"G:\\Downloads\\Movies\\The Enemies of Reason Part 1.mkv"'
            ];
            let result   = FFProbe.parseArgs(options);
            expect(result).to.deep.equal(expected);
            expect(result.length).to.equal(7);
        });

    });


    describe("#run()", function () {
        it("should return a JSON object of the correct form", function (done) {
            let expected = fileInfo;

            ffprobeInstance.run().on(FFProbe.EVENT_OUTPUT, (result: any) => {
                expect(result).to.deep.equal(expected);
                done();
            });
        });
    });
});
