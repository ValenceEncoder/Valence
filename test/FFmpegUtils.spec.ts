import * as chai from 'chai';
import {FFMpegUtils} from "../src/lib/FFMpegUtils";
import * as Path from 'path';
import {IFFMpegProgress, IFFProbeOutput, IFileInfo, IGPUInfo, IGPUOutput} from "../src/lib/FFInterfaces";
const expect   = chai.expect;
const platform = require('os').platform();


const filepathWithSpaces: string = Path.resolve(".", "vid", "CCTest with spaces.mkv");
const filepathNotExists: string  = Path.resolve(".", "vid", "CCTest Does Not Exist.mkv");
const filepath: string           = Path.resolve(".", "vid", "CCTest.mkv");

describe("FFMpegUtils", function () {

    if (platform === 'win32') {
        describe("#reslashPath()", function () {
            it("should replace any backlashes with forward slashes", function () {
                let expected: string = "G:/GitProjects/Valence/vid/CCTest with spaces.mkv";
                let result: string   = FFMpegUtils.reslashPath(filepathWithSpaces);
                expect(result).to.equal(expected);

            });
        });

        describe("#getGPUInfo()", function () {
            it("should return an object with basic GPU information", function () {
                let expected: IGPUInfo = {
                    Manufacturer: "NVIDIA",
                    Model: "GeForce GTX 980",
                    FullName: "NVIDIA GeForce GTX 980",
                    Device: "VideoController1"
                };
                return FFMpegUtils.getGPUInfo().then(function (result: IGPUOutput) {
                    let expected = require('./fixtures/gpu.json');
                    expect(result).to.deep.equal(expected);
                });
            });
        });

    } else {
        describe("#getGPUInfo()", function () {
            it("should throw an exception if the platform is not Windows", function () {
                let expected: Error = new Error("Cannot get GPU information. Only Windows is supported at this time.");
                expect(FFMpegUtils.getGPUInfo()).to.throw(expected);
            })
        });
    }

    describe("#getFileInfo()", function () {
        it("should take the output of FFprobe and return a properly formatted object", function () {
            let output: IFFProbeOutput = require('./fixtures/probe.json');
            let result: IFileInfo      = FFMpegUtils.getFileInfo(output);
            let expected: IFileInfo   = {
                videoInfo: {codec_name: 'h264', duration: 20.256, size: 11808593},
                audioInfo: {codec_name: 'ac3'}
            };
            expect(result).to.deep.equal(expected);
        });
    });

    describe("#changeExtension()", function () {
        it("should return the path with the extension of the file changed", function () {
            let expected: string = filepathWithSpaces.substr(0, filepathWithSpaces.length - 4) + ".mp4";
            let result: string   = FFMpegUtils.changeExtension(filepathWithSpaces, "mp4");
            expect(result).to.equal(expected);
        });
    });

    describe("#toObject", function() {
       it("should take FFmpeg output and convert it to JSON object in IFFMpegProgress format", function() {
           let output:string = "frame=   79 fps= 32 q=-1.0 Lsize=    2243kB time=00:00:02.90 bitrate=6331.0kbits/s speed=1.19x";
           let result:IFFMpegProgress = FFMpegUtils.toObject(output);
           let expected:IFFMpegProgress = {
               frame: 79,
               fps: 32,
               q: -1.0,
               size: 2243,
               time: "00:00:02.90",
               bitrate: "6331.0kbits/s",
               speed: "1.19x"
           };
           expect(result).to.deep.equal(expected);
       })
    });

    describe("#fileExists()", function () {
        it("should return true if the file exists and false if the file does not exist", function () {
            expect(FFMpegUtils.fileExists(filepathWithSpaces)).to.be.true;
            expect(FFMpegUtils.fileExists(filepathNotExists)).to.be.false;
        });
    });
});
