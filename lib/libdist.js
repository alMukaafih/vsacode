// imports
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const { promisify } = require('util');
const sleep = promisify(setTimeout);

// cleanup task
process.on("exit", (code) => {
    // console.log("Exiting Node.js process with code:", code);
    fs.unlinkSync("plugin.json");
    fs.unlinkSync("readme.md");
    fs.unlinkSync("icon.png");
});

let includes = path.join("/data/data/com.termux/pj/vsacode", "includes");

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

function check(_id, req) {
    if ( !(reqExists(_id, req)) )
        return path.join(includes, "default", req);
    return path.join(includes, _id, req);
}

function include(_id) {
    let plugin_json = check(_id, "plugin.json");
    let readme_md = check(_id, "readme.md");
    let icon_png = check(_id, "icon.png");
    
    fs.symlinkSync(plugin_json, "plugin.json");
    fs.symlinkSync(readme_md, "readme.md");
    fs.symlinkSync(icon_png, "icon.png");
}

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

    let outZip = path.join(owd, `${id}.zip`);
    if (fs.existsSync(outZip))
        fs.unlinkSync(outZip);
    fs.renameSync(path.join(acode, "dist.zip"), outZip);
    console.log(`output: ${outZip}\n`);
}

// exports
module.exports = { distBuild };