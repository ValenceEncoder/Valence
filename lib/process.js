// spawn process with shell enabled
// change working directory
// run nvm use
// redirect stdout

const spawn = require('child_process').spawn

var proc_ats = spawn('echo',['$NVM_DIR'], {
  cwd: '/home/liam/Documents/altadis-trade-server',
  shell: '/bin/bash'
});

proc_ats.stdout.on('data', (data) => console.log(`${data}`));
