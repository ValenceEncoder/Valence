
const fs = require("fs");
const http = require("https");
const path = require("path");
const url = require("url");
const unzip = require("extract-zip");
const cmd = require("command-line-args");
const argDefs = [
    { name: "platform", alias: "p", type: String, defaultValue: process.platform },
    { name: "arch", alias: "a", type: String, defaultValue: process.arch },
    { name: "clean", alias: "c", type: Boolean, defaultValue: false }
];
const argv = cmd(argDefs);

const {clean, cleanInner} = require("./utils");

const AVAILABLE_PLATFORMS = ["win32", "darwin", "linux"];
const AVAILABLE_ARCHS = ["x32", "x64", "ia32"];

const PLATFORM = argv.platform;
const ARCH = argv.arch;
const OS_ARCH = `${PLATFORM}-${ARCH}`;

const FFMPEG_BIN_PATH = path.resolve(path.join(__dirname, "..", "ffmpeg", "bin"));
const TEMP_DIR = path.resolve(path.join(__dirname, "fftmp"));

const cleanup = (dir) => {
    console.log(`Cleaning Up ${dir}`);
    clean(path.resolve(dir));
    process.exit(0);
}

if (!AVAILABLE_PLATFORMS.includes(PLATFORM)) {
    console.error(`Valence currently does not release for ${PLATFORM}`);
    process.exit(1);
}

if (!AVAILABLE_ARCHS.includes(ARCH)) {
    console.error(`Valence currently does not release for ${ARCH} architectures.`);
    process.exit(1);
}

if (PLATFORM === "darwin" && (ARCH === "x32" || ARCH === "ia32")) {
    console.error("32-bit builds are unavailable for MacOS");
    process.exit(1);
}

if (argv.clean) {
    cleanup(TEMP_DIR);
    process.exit(0);
}

if (!fs.existsSync(TEMP_DIR)) { fs.mkdirSync(TEMP_DIR); }
cleanInner(TEMP_DIR);



const URL_WIN64 = "https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-4.0-win64-static.zip"
const URL_WIN32 = "https://ffmpeg.zeranoe.com/builds/win32/static/ffmpeg-4.0-win32-static.zip"
const URL_MACOS = "https://ffmpeg.zeranoe.com/builds/macos64/static/ffmpeg-4.0-macos64-static.zip"
const URL_LIN32 = "https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-32bit-static.tar.xz";
const URL_LIN64 = "https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-64bit-static.tar.xz";


const PLATFORM_MAP = {
    "win32-x64": URL_WIN64,
    "win32-x32": URL_WIN32,
    "win32-ia32": URL_WIN32,
    "darwin-x64" : URL_MACOS,
    "linux-x32": URL_LIN32,
    "linux-ia32": URL_LIN64
};

if (!PLATFORM_MAP.hasOwnProperty(OS_ARCH)) {
    console.error(`No url found for '${OS_ARCH}'. URLS`, PLATFORM_MAP);
}

const URL = PLATFORM_MAP[OS_ARCH];

const TEMP_ZIP = path.join(TEMP_DIR, url.parse(URL).pathname.split("/").pop());
const options = {
    protocol: url.parse(URL).protocol,
    host: url.parse(URL).host,
    port: 80,
    path: url.parse(URL).pathname
};

const writeStream  = fs.createWriteStream(TEMP_ZIP);



const copyBinaries = (EXTRACTED_BIN_FOLDER, done) => {
    const files = fs.readdirSync(EXTRACTED_BIN_FOLDER);
    for (const file of files) {
        const abs = path.join(EXTRACTED_BIN_FOLDER, file);
        const out = path.join(FFMPEG_BIN_PATH, file);
        console.log(`Copying ${abs} to ${out}`);
        const readStream = fs.createReadStream(abs, {flags: 'r', encoding: "binary"});
        const writeStream = fs.createWriteStream(out, {flags: "w", encoding: "binary"});
        writeStream
            .on("error", (err) => console.error(err) && process.exit(1))
            .on("close", () => done(TEMP_DIR))
        readStream
            .on("error", (err) => console.error(err) && process.exit(1))
            .pipe(writeStream);

    }
}

const extractTemp = (copyCb, cleanupCb) => {
    console.log(`Extracting ${TEMP_ZIP}`);
    unzip(TEMP_ZIP, {dir: TEMP_DIR}, (err) => {
        if (err) { console.error(err) && process.exit(1); }
        console.log(`Extracted FFMpeg Binaries to ${TEMP_DIR}`);

        console.log(`Deleting ${TEMP_ZIP}`);
        fs.unlinkSync(TEMP_ZIP);
        const EXTRACTED_FOLDER = path.join(TEMP_DIR, path.basename(TEMP_ZIP, path.extname(TEMP_ZIP)), "bin");
        copyCb(EXTRACTED_FOLDER, cleanupCb);
    });
}

http.get(URL, (res) => {
    res
    .on("data", (data) => {
        writeStream.write(data);
    })
    .on("end", () => {
        writeStream.end();
        console.log(`Downloaded FFMpeg Statics to ${TEMP_ZIP}`);
        extractTemp(copyBinaries, cleanup);
    })
    .on("error", (e) => {
        console.error(e);
        process.exit(1);
    })
    ;
});
