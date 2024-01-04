#!/usr/bin/env node
// imports
const fs = require("fs");
const os = require("os");
const path = require("path");
const AdmZip = require("adm-zip");
const child_process = require("child_process");
const { promisify } = require('util');
const sleep = promisify(setTimeout);
const { stylesGen } = require('../lib/libgen');

// cleanup task
process.on("exit", (code) => {
    console.log("Exiting Node.js process with code:", code);
    fs.rmSync(tmpDir, { recursive: true });
});

// vsix file
let vsix = process.argv[2];
if (vsix == undefined)
    process.exit(1);

// create temp directory
let tmpDir;
const appPrefix = "vsacode-";
tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));

// extract vsix file
const zip = new AdmZip(vsix);
zip.extractAllTo(tmpDir);

const acode = path.join(tmpDir, "acode");
fs.symlinkSync("/data/data/com.termux/pj/vsacode", acode);

// read extension/package.json file
let _json = fs.readFileSync(path.join(tmpDir, "extension", "package.json"));
let package_json = JSON.parse(_json);
let iconThemes = package_json.contributes.iconThemes;
if (iconThemes == undefined)
    process.exit(1);

// process each icon Theme
let x = 1;
for (let iconTheme of iconThemes) {
    let _id = iconTheme.id;
    let _label = iconTheme.label;
    let _path = iconTheme.path;
    let pwDir = path.join(tmpDir, "extension", _path);
    let _json = fs.readFileSync(pwDir);
    let icon_json = JSON.parse(_json);
    let outDir = path.join(acode, "src");
    fs.mkdirSync(outDir, { recursive: true });
    
    stylesGen(pwDir, outDir, icon_json);

    let owd = process.cwd();
    process.chdir(acode);
    
    // open plugin.json
    console.log(`building: ${_label}`);
    sleep(2000);
    child_process.execSync(`nano ${path.join(acode, "plugin.json")}`, { stdio: 'inherit' });
    child_process.execSync(`nano ${path.join(acode, "readme.md")}`, { stdio: 'inherit' });
    child_process.execSync(`npm run build-release`, { stdio: 'inherit' });
    child_process.execSync(`npm run clean`, { stdio: 'inherit' });
    
    
    
    
    fs.copyFileSync(path.join(acode, "dist.zip"), path.join(owd, _id));
    console.log(`output: ${_id}`);
    x ++;
}

