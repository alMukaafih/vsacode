#!/usr/bin/env node
// imports
const fs = require("fs");
const os = require("os");
const path = require("path");
const AdmZip = require("adm-zip");
const { stylesGen } = require('../lib/libgen');
const { distBuild } = require('../lib/libdist');

// cleanup task
process.on("exit", (code) => {
    console.log("Exiting main.js process with code:", code);
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
let version = package_json.version;
let iconThemes = package_json.contributes.iconThemes;
if (iconThemes == undefined)
    process.exit(1);

// process each icon Theme
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
    distBuild(_label, _id, acode);
}
