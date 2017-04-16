// spawn process with shell enabled
// change working directory
// run nvm use
// redirect stdout
/***
 * NOTE: FFMPEG writes debug info to STDERR
 * FFPROBE writes debug to STDOUT
 */
const spawn = require('child_process').spawn;
const encodeArgs = '-i ${input} -c copy -c:a aac ${output}';
const probeArgs = '-v quiet -print_format json -show_format -show_streams ${input}';

//const proc_ats = spawn('ffmpeg', encodeArgs);
const proc_ats = spawn('ffprobe', probeArgs);
proc_ats.stdout.setEncoding('utf8');
proc_ats.stdout.on('data', (data) => console.log(data));
proc_ats.stderr.setEncoding('utf8');
proc_ats.stderr.on('data', (data) => console.log(data));
