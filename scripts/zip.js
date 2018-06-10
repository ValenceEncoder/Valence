const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const npmPackage = require("../package.json");
const commandLineArgs = require("command-line-args");

const argDefs = [
    {name: "platform", alias: "p", type: String},
    {name: "arch", alias: "a", type: String}
];
const argv = commandLineArgs(argDefs);

let platform = argv.hasOwnProperty("platform") ? argv.platform : process.platform;
let arch = argv.hasOwnProperty("arch") ? argv.arch : process.arch;

let appName = `${npmPackage.name}-${platform}-${arch}`;
let appFolder = `out/${appName}`;
let inputFolder = path.join(__dirname, "..", appFolder);
let outputFile = path.join(__dirname, "..", `out/${appName}.zip`);

console.log(`AppName:\t${appName}`);
console.log(`Input Folder:\t${inputFolder}`);
console.log(`Output File:\t${outputFile}`);


let output = fs.createWriteStream(outputFile);
let archive = archiver("zip", {
    zlib: { level: 9 }
});

output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log(`Compression Complete. Zip file created at ${outputFile}`);
});

output.on('end', function() {
    console.log('Data has been drained');
});

archive.on("warning", function(err) {
    if (err.code === "ENOENT") {
      console.warn(err);
    } else {
      // throw error
      throw err;
    }
});

archive.on('error', function(err) {
  throw err;
});

// pipe archive data to the file
archive.pipe(output);

archive.directory(inputFolder, appName);

archive.finalize();
