const {Bewatch} = require("bewatch");
const {spawn} = require("child_process");
const path = require("path");
const {Colours} = require("colours-ts");
const commandLineArgs = require("command-line-args");
const {EventEmitter} = require("events");
const argDefs = [
    {name: "watch", alias: "w", type: Boolean, defaultValue: false},
    {name: "verbose", alias: "v", type: Boolean, defaultValue: false}
];

const argv = commandLineArgs(argDefs);
let args = {...argv};

const PROJECT_ROOT = path.resolve(path.join(__dirname, ".."));
const SASS_PATH = path.join(PROJECT_ROOT, "src", "css");
const SASS_INDEX = path.join(SASS_PATH, "index.scss");
const OUT_INDEX = path.join(PROJECT_ROOT, "css", "Index.css");

const SASS_CMD = "sass";
const SASS_ARGS = [SASS_INDEX, OUT_INDEX];
const emitter = new EventEmitter();

const log = (message) => {
    if (args.verbose) {
        console.log(`${Colours("SASS Compiler", "cyan")}: ${Colours(message, "yellow")}`);
    }
}
const error = console.error;

const logger = {
    log,
    error
};

const 

const runSass = () => {
    
    let process = spawn(SASS_CMD, SASS_ARGS, {
        shell: true
    });
    
    process.once("close", () => {
        logger.log("Compilation complete.");
        emitter.emit("compilation_complete");
        process = undefined;
    })
    process.stdout.setEncoding("utf8");
    process.stderr.setEncoding("utf8");
    
    process.stdout
    .on("data", (data) => {
        logger.log(data);
        logger.log(data);
    })
    .on("error", (err) => {
        logger.error(err);
    })
    ;

    process.stderr
    .on("data", (data) => {
        logger.log(data);
        logger.error(data);
    })
    .on("error", (err) => {
        logger.error(err);
    })
    ;
}

runSass();

const compile = (options = {}) => {
    args = {...defaults, ...options};
    const {watch, verbose} = args;
    if (watch) {
        emitter.once("compilation_complete", () => {
            logger.log("Watching SCSS for changes...");
            const watcher = new Bewatch("../src/css/**/*.scss", {verbose});
            watcher.on("change", runSass);
            watcher.on("add", runSass);
            watcher.on("delete", runSass);
            watcher.on("rename", runSass);
            
            watcher.Start();
    
        });
    }
}

if (require.main !== module) { module.exports = { compile }; } else { compile(argv); }
