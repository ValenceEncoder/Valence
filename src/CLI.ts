
import {IFFProcessOptions} from "M2A";
import {Program} from "./Program";
if (require.main != module) {
    // Loaded by another module e.g. with require('./src/Main');
    throw new Error("CLI cannot be loaded by a module loader, it is designed to be used from the command line e.g. `node ./build/CLI.js -i myVid.mkv -o myVidConverted.mp4");

} else {
    // Invoked from the command line e.g. with `node ./src/Main.ts`
    const commandLineArgs = require('command-line-args');

    const argDefs = [
        {name: 'process', alias: 'p', type: String, defaultValue: 'ffprobe'},
        {name: 'input', alias: 'i', type: String},
        {name: 'output', alias: 'o', type: String}
    ];

    const options: IFFProcessOptions = commandLineArgs(argDefs);
    const app: Program = new Program(options);
    console.info(`Starting ${options.process}...`);
    app.run();
}