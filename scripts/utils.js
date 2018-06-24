const fs = require("fs");
const path = require("path");

/**
 * Delete all files in DIRECTORY (does not delete the DIRECTORY)
 * @param {*} DIRECTORY 
 */
function cleanInner(DIRECTORY) {
    if (!fs.existsSync(DIRECTORY)) {
        // directory doesnt exist, exit with OK code. 
        return
    }

    const files = fs.readdirSync(DIRECTORY, { encoding: "utf8" });
    for (const file of files) {
        try {
            const abs = path.join(DIRECTORY, file)
            const stats = fs.lstatSync(abs);
            if (stats.isDirectory()) { 
                clean(abs);
                continue;
            }
            fs.unlinkSync(path.join(DIRECTORY, file));
        } catch (e) {
            console.error
            console.error(e);
            return;
        }
    }
}

/**
 * Deletes all files in the directory and then deletes the directory
 * @param {*} DIRECTORY 
 */
function clean(DIRECTORY) {
    if (!fs.existsSync(DIRECTORY)) {
        return;
    }
    cleanInner(DIRECTORY);
    fs.rmdirSync(DIRECTORY);
    return;
}



module.exports = {
    cleanInner,
    clean
}