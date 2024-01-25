/**
 * A module that contains utilities used
 * @module libdist
 * @author alMukaafih
 * @requires node:fs
 * @requires node:path
 * @requires node:child_process
 * @requires node:util
 */
// imports
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const { promisify } = require('util');
const sleep = promisify(setTimeout);

// cleanup task
process.on("exit", (code) => {
    // console.log("Exiting Node.js process with code:", code);
    //fs.unlinkSync("plugin.json");
    //fs.unlinkSync("readme.md");
    //fs.unlinkSync("icon.png");
});

/** @constant {string} */
const includes = path.join("/data/data/com.termux/pj/vsacode", "includes");
/** Checks if required File exits
 * @param {string} _id - Icon Theme id
 * @param {string} req - Name of required File
 * @returns {boolean}
 */
function reqExists(_id, req) {
    let file;
    let _path = path.join(includes, _id);
    if ( !(fs.existsSync(_path)) )
        return false;
    file = fs.statSync(_path);
    if ( !(file.isDirectory()) )
        return false;
    let _file = path.join(_path, req);
    if ( !(fs.existsSync(_file)) )
        return false;
    return true;
}

/** Check for required File
 * @param {string} _id - Icon Theme id
 * @param {string} req - Name of required File
 * @returns {string} Path of required File
 */
function check(_id, req) {
    if ( !(reqExists(_id, req)) )
        return path.join(includes, "default", req);
    return path.join(includes, _id, req);
}

/** Link the required files
 * @param {string} from - Origin
 * @param {string} to - Destination
 * @returns {undefined}
 */
function link(from, to) {
    if (!fs.existsSync(to))
        fs.symlinkSync(from, to);
}

/** Include the required files
 * @param {string} _id - Icon Theme id
 * @returns {undefined}
 */
function include(_id) {
    let plugin_json = check(_id, "plugin.json");
    let readme_md = check(_id, "readme.md");
    let icon_png = check(_id, "icon.png");
    link(plugin_json, "plugin.json");
    link(readme_md, "readme.md");
    link(icon_png, "icon.png");
}

/** Build acode plugin
 * @param {string} _label - Icon Theme label
 * @param {string} _id - Icon Theme id
 * @param {string} acode - Build folder
 * @returns {undefined}
 */
function distBuild(_label, _id, acode) {
    let owd = process.cwd();
    process.chdir(acode);
    
    // open plugin.json
    console.log(`building: ${_label}`);
    sleep(2000);
    
    
    include(_id);
    // child_process.execSync(`nano ${plugin_json}`, { stdio: 'inherit' });
    // child_process.execSync(`nano ${readme_md}`, { stdio: 'inherit' });
    child_process.execSync(`npm run build-release`, { stdio: 'inherit' });
    child_process.execSync(`npm run clean`, { stdio: 'inherit' });

    let outZip = path.join(owd, `${_id}.zip`);
    if (fs.existsSync(outZip))
        fs.unlinkSync(outZip);
    fs.renameSync(path.join(acode, "dist.zip"), outZip);
    console.log(`output: ${outZip}\n`);
}

// exports
module.exports = { distBuild };