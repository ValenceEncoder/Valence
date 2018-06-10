const fs = require("fs");
const cmd = require("command-line-args");
const packageFile = require("path").join(__dirname, "../package.json");
const package = require(packageFile);

const argDefs = [
    { name: "patch", alias: "p", type: Boolean },
    { name: "major", alias: "m", type: Boolean },
    { name: "minor", alias: "i", type: Boolean },
    { name: "get", alias: "g", type: Boolean}
];
const argv = cmd(argDefs);

const oldVersion = package.version;
let majorVersion = parseInt(oldVersion.split(".")[0], 10);
let minorVersion = parseInt(oldVersion.split(".")[1], 10);
let patchVersion = parseInt(oldVersion.split(".")[2], 10);

if (argv.hasOwnProperty("patch")) {
    patchVersion++;
} else if (argv.hasOwnProperty("minor")) {
    minorVersion++;
    patchVersion = 0;
} else if (argv.hasOwnProperty("major")) {
    majorVersion++;
    minorVersion = 0;
    patchVersion = 0;
} else if (argv.hasOwnProperty("get")) {
    console.log(package.version);
    process.exit(0);
}


package.version = [majorVersion, minorVersion, patchVersion].join(".");
fs.writeFileSync(packageFile, JSON.stringify(package, null, 2), { encoding: "utf-8" });
console.log(`Version Bumped to ${package.version}`);
