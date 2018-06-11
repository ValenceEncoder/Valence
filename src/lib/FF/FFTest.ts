import {spawn} from "child_process";

/* tslint:disable:naming-convention */
const FFMPEG = "./ffmpeg/bin/ffmpeg";
const ARGS = ["-v", "quiet", "-stats", "-i", "./test/CCTest.mkv", "-y", "-c", "copy", "-c:a", "aac", "./test/CCTest.mp4"];

let stdout = "";
let stderr = "";
console.info("Executing command", FFMPEG, ARGS.join(" "));
const proc = spawn(FFMPEG, ARGS);

proc.stdout.on("data", (chunk: string) => {
    console.log("STDOUT Chunk: ", chunk);
    stdout += chunk;
});

proc.stderr.on("data", (chunk: string) => {
    console.log("STDERR Chunk: %s", chunk);
    stderr += chunk;
});

proc.on("close", (code: number) => {
    console.log("PROCESS Exited with Code", code);
    console.log("---------------------- STDOUT ----------------------");
    console.log(stdout);

    console.log("---------------------- STDERR ----------------------");
    console.log(stderr);

});
