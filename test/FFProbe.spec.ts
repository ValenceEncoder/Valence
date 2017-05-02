import * as chai from 'chai';
import {FFProbe, FFMpeg} from '../src/FFProcess';
import * as mocha from 'mocha';



const expect          = chai.expect;
const ffprobeInstance = new FFProbe({input: "vid/large.mkv"});

describe("FFProbe", function () {

    describe("#constructor()", function () {
        it("be an instance of the FFProbe class", function () {
            expect(ffprobeInstance).to.be.instanceof(FFProbe);
        });
    });

    describe("#run()", function () {
        it("should return a JSON object of the correct form", function (done) {
            let expected = {
                videoInfo: {codec_name: 'h264', duration: 3600.179, size: 931237935},
                audioInfo: {codec_name: 'ac3'}
            };

            ffprobeInstance.run().on(FFProbe.EVENT_OUTPUT, (result:any) => {
                expect(result).to.deep.equal(expected);
                done();
            });
        });
    });
});
