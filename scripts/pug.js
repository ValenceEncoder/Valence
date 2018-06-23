const pug = require("pug");
const fs = require("fs");
const path = require("path");
const {Colours} = require("colours-ts");
const commandLineArgs = require("command-line-args");
const argDefs = [
    {name: "watch", alias: "w", type: Boolean},
    {name: "csp", alias: "c", type: Boolean}
];
const argv = commandLineArgs(argDefs);

const watch = argv.hasOwnProperty("watch") ? true : false;
const csp = argv.hasOwnProperty("csp") ? true: false;

// Set Paths
const ROOT = path.resolve(__dirname, "..");
const DIST_PATH = path.join(ROOT, "dist");
const TEMPLATE_PATH = path.join(ROOT, "src", "views");
const OUTPUT_PATH = path.join(DIST_PATH, "views");


function Compile() {
    const rootTemplates = fs.readdirSync(TEMPLATE_PATH).filter((f) => /.*\_window\.pug/gi.test(f));
    
    // Create dist and views dirs
    if (!fs.existsSync(DIST_PATH)) {
        fs.mkdirSync(DIST_PATH);
    }
    
    if (!fs.existsSync(OUTPUT_PATH)) {
        fs.mkdirSync(OUTPUT_PATH);
    }
    
    for (const template of rootTemplates) {
        CompileSingle(template)
    }
}

function CompileSingle(template) {
    const inFile = path.join(TEMPLATE_PATH, template)
    const outFile = path.join(OUTPUT_PATH, path.basename(template, path.extname(template)) + ".html");
    console.log(`Compiling ${Colours(inFile, "green")} to ${Colours(outFile, "cyan")}`);
    const tmpFn = pug.compileFile(inFile, {pretty: true});
    if (csp) {
        const CSP = require("./csp");
        const cspString = CSP.ContentSecurityPolicy;
        console.log(`Content Security Policy String: ${cspString}`);
    }
    const html = (csp) ? tmpFn({cspString}) : tmpFn({});
    fs.writeFileSync(outFile, html, {encoding: "utf-8"});
}

function onReady(watcher) {
    const os = require("os");
    const justFiles = [];
    const watchedFiles = watcher.getWatched();
    for (const key in watchedFiles) {
        if (typeof key === "string") {
            if (watchedFiles[key].length < 2) { continue; }
            for (const file of watchedFiles[key]) {
                justFiles.push(`${file.trim().yellow}${os.EOL}`);
            }
        }
    }
    console.log("Watching:");
    console.log(justFiles.join(""));

}

const compileWindowFn = (event) => {
    console.log(`${Colours("Change", "magenta")} detected in ${Colours(event, "green")}.`);
    CompileSingle(path.basename(event));
}

const compileIncludesFn = (event) => {
    console.log(`${Colours("Change", "magenta")} detected in ${Colours(event, "green")}.`);
    Compile();
}

Compile();

const WINDOW_TMPL_WATCH = `../src/views/*.pug`;
const INCLUDE_TMPL_WATCH = `../src/views/includes/*.pug`
if (watch) {
    const chokidar = require("chokidar");
    const mainWatcher = chokidar.watch(WINDOW_TMPL_WATCH, {
        persistent: true,
        awaitWriteFinish: true,
        usePolling: false,
        atmoic: true,
        cwd: __dirname,
        depth: 0
    });

    const includesWatcher = chokidar.watch(INCLUDE_TMPL_WATCH, {
        persistent: true,
        awaitWriteFinish: true,
        usePolling: false,
        atmoic: true,
        cwd: __dirname,
        depth: 0
    });
    
    console.log(`Watching ${Colours("Window", "magenta")} Templates at: ${Colours(path.resolve(path.join(__dirname, WINDOW_TMPL_WATCH)), "cyan")}`);
    console.log("Target Files:");

    console.log(`Watching ${"Includes".magenta} at: ${Colours(path.resolve(path.join(__dirname, INCLUDE_TMPL_WATCH)), "cyan")}`);
    console.log("Target Files:");
    
    includesWatcher.on("ready", onReady.bind(undefined, includesWatcher));
    includesWatcher.on("change", compileIncludesFn);
    includesWatcher.on("error", (error) => {
        console.error(`Watcher error: ${error}`);
        process.exit(1);
    });
    
    mainWatcher.on("ready", onReady.bind(undefined, mainWatcher));
    mainWatcher.on("change", compileWindowFn);
    mainWatcher.on("error", (error) => {
        console.error(`Watcher error: ${error}`);
        process.exit(1);
    });

}
