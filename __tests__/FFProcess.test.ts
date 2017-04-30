import {FFProbe} from "../src/FFProcess";
let ffprobeInstance:FFProbe;
beforeAll(() => {
    ffprobeInstance = new FFProbe({input: './vid/lage.mkv', process:'ffprobe'});
});
test('FFprobe instantiation', done => {

    expect(ffprobeInstance).toBeInstanceOf(FFProbe);

});

test('FFProbe::run() ')