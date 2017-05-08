import * as chai from 'chai';
import {FFProbe, FFMpeg} from '../src/lib/FFProcess';
import * as mocha from 'mocha';

const expect = chai.expect;

describe("FFProbe", function () {
    let ffprobeInstance = new FFProbe({input: "vid/CCTest.mkv"});
    describe("#constructor()", function () {
        it("be an instance of the FFProbe class", function () {
            expect(ffprobeInstance).to.be.instanceof(FFProbe);
        });
    });

    describe("#run()", function () {
        it("should return a JSON object of the correct form", function (done) {
            let expected = {
                videoInfo: {codec_name: 'h264', duration: 20.256, size: 11808.593},
                audioInfo: {codec_name: 'ac3'}
            };

            ffprobeInstance.run().on(FFProbe.EVENT_OUTPUT, (result: any) => {
                expect(result).to.deep.equal(expected);
                done();
            });
        });
    });
});
