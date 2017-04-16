import { FFMpeg, FFProbe } from "./FFProcess";


const commandLineArgs = require('command-line-args');

const argDefs = [
    {name: 'input', alias: 'i', type: String},
    {name: 'output', alias: 'o', type: String}
];

const options = commandLineArgs(argDefs);

