const pug = require("pug");
const fs = require("fs");
const path = require("path");
const colors = require("colors");
const ROOT = path.resolve(__dirname, "..");
const DIST_PATH = path.join(ROOT, "dist");
const TEMPLATE_PATH = path.join(ROOT, "src", "views");
const OUTPUT_PATH = path.join(DIST_PATH, "views");

const rootTemplates = fs.readdirSync(TEMPLATE_PATH).filter((f) => /.*\_window\.pug/gi.test(f));
const CSP = require("./csp");
const cspString = CSP.ContentSecurityPolicy;


console.log(`Compiling Pug Templates`);
console.log(`Content Secutiry Policy String: ${cspString}`);

// Create dist and views dirs
if (!fs.existsSync(DIST_PATH)) {
    fs.mkdirSync(DIST_PATH);
}

if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH);
}

for (const template of rootTemplates) {
    const inFile = path.join(TEMPLATE_PATH, template)
    const outFile = path.join(OUTPUT_PATH, path.basename(template, path.extname(template)) + ".html");
    console.log(`${"Compiling".blue} ${colors.green(inFile)} to ${colors.cyan(outFile)}`);
    const tmpFn = pug.compileFile(inFile, {pretty: true});
    const html = tmpFn({cspString});
    fs.writeFileSync(outFile, html, {encoding: "utf-8"});
}
