const {Bewatch} = require("bewatch");
const {spawn} = require("child_process");
const path = require("path");

const PROJECT_ROOT = path.resolve(path.join(__dirname, ".."));
const SASS_PATH = path.join(PROJECT_ROOT, "src", "css");
const SASS_INDEX = path.join(SASS_PATH, "index.scss");
const OUT_INDEX = path.join(PROJECT_ROOT, "css", "Index.css");

const SASS_CMD = "sass";
const SASS_ARGS = [SASS_INDEX, OUT_INDEX];


const runSass = () => {
    
    let process = spawn(SASS_CMD, SASS_ARGS, {
        shell: true
    });
    
    process.once("close", () => {
        console.log("SASS compilation complete.");
        process = undefined;
    })
    process.stdout.setEncoding("utf8");
    process.stderr.setEncoding("utf8");
    
    process.stdout
    .on("data", (data) => {
        console.log(data);
    })
    .on("error", (err) => {
        console.error(err);
    })
    ;
    process.stderr.on("data", (data) => {
        console.log("SASS Process STDERR");
        console.error(data);
    });
}

const watcher = new Bewatch("../src/css/**/*.scss", {verbose: true});

watcher.on("change", runSass);
watcher.on("add", runSass);
watcher.on("delete", runSass);
watcher.on("rename", runSass);

watcher.Start();