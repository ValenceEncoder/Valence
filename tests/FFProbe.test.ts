import {suite, test} from "mocha-typescript";

import {FFProbe} from "../src/FFProcess";

const ffprobeInstance:FFProbe = new FFProbe({input: '__tests__/vid/large.mkv', process:'ffprobe'});





test.only('FFprobe instantiation', (done) => {

    expect(ffprobeInstance).not.toBeUndefined();

});
// global.Promise = require.requireActual('promise');
//
// test('FFProbe::run()', done => {
//     debugger;
//     ffprobeInstance.run().then(fileInfo => {
//         expect(fileInfo).toBe({
//             videoInfo: {codec_name: 'h264', duration: 3600.179, size: 931237935},
//             audioInfo: {codec_name: 'aac'}
//         });
//         done();
//     })
// });
//
// function sum(a, b) {
//     return a + b;
// }
//
// test('sum()', () => {
//    expect(sum(1, 2)).toBe(3);
// });