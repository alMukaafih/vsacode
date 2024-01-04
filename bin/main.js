#!/bin/env node
// imports
const fs = require("fs");
const os = require("os");
const path = require("path");
const AdmZip = require("adm-zip");
const child_process = require("child_process");
const { promisify } = require('util');
const sleep = promisify(setTimeout);
const { MapIcons } = require('../lib/libmap');
const { parse, _require, test, _test, _css, validate } = require('../lib/libutils');


// cleanup task
process.on("exit", (code) => {
    console.log("Exiting Node.js process with code:", code);
    //fs.rmSync(tmpDir, { recursive: true });
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
    let end = "`\n";
    let folders = "export let folders: string = `";
    let files = "export let files: string = `";
    let _id = iconTheme.id;
    let _label = iconTheme.label;
    let _path = iconTheme.path;
    let pwDir = path.join(tmpDir, "extension", _path);
    let _json = fs.readFileSync(pwDir);
    let icon_json = JSON.parse(_json);
    //console.log(_id, _label, _path);
    
    
    let valA = _test(icon_json.file);
    let valB = _test(icon_json.folder);
    let valC = _test(icon_json.folderExpanded, valB);
    let valD = _test(icon_json.rootFolder, valB);
    let valE = _test(icon_json.rootFolderExpanded, valD);
    
    files += _css(valA);
    folders += _css(valB, "", `.list.collapsible.hidden > div.tile[data-name][data-type="dir"] > .icon.folder`);

    folders += _css(valB, "", `#file-browser > ul > li.tile[type="dir"]  > .icon.folder`);
    
    folders += _css(valB, "", `#file-browser > ul > li.tile[type="directory"]  > .icon.folder`);
    
    folders += _css(valC,"", `.list.collapsible > div.tile[data-name][data-type="dir"] > .icon.folder`);
    
    folders += _css(valD, "", `.list.collapsible.hidden > div[data-type="root"] > .icon.folder`);
    
    folders += _css(valE, "",`.list.collapsible > div[data-type="root"] > .icon.folder`);



    
    
    
    let _dir = path.dirname(pwDir);
    let _map = icon_json.iconDefinitions;
    let mapX = {};
    let mapY = {};
    //mapX
    let mapA = test(icon_json.folderNames);
    let mapB = test(icon_json.folderNamesExpanded);
    // mapY
    let mapC = test(icon_json.fileExtensions);
    let mapD = test(icon_json.fileNames);
 //   if (icon_json.languageIds != undefined)
    let mapE = test(icon_json.languageIds);
    
    let sheetA = new MapIcons(".file_type_");
    mapY = sheetA.map(mapC, mapY, _map);
    mapY = sheetA.map(mapD, mapY, _map);
    mapY = sheetA.map(mapE, mapY, _map);
    
    let txtB_1 = "#file-browser > ul > li.tile[type='directory'][name='", txtB_2 = "'] > .icon.folder";
    let sheetB = new MapIcons(txtB_1, txtB_2, false);
    mapX = sheetB.map(mapA, mapX, _map);
    
    let txtC_1 = "#file-browser > ul > li.tile[type='dir'][name='", txtC_2 = "'] > .icon.folder";
    const sheetC = new MapIcons(txtC_1, txtC_2, false);
    mapX = sheetC.map(mapA, mapX, _map);
    
    let txtD_1 = ".list.collapsible.hidden > div.tile[data-name='", txtD_2 = "'][data-type='dir'] > .icon.folder";
    const sheetD = new MapIcons(txtD_1, txtD_2, false);
    mapX = sheetD.map(mapA, mapX, _map);
    
    let txtE_1 = ".list.collapsible > div.tile[data-name='", txtE_2 = "'][data-type='dir'] > span.icon.folder";
    let sheetE = new MapIcons(txtE_1, txtE_2, false);
    mapX = sheetE.map(mapB, mapX, _map);
    
    folders += parse(mapX);
    files += parse(mapY);
    
    let req = _require(_map, _dir);
    let _req = req.split("\n");
    _req = [...new Set(_req)];
    req = _req.join("\n");
    req += "\n";
    let css = req
        + folders + end
        + files + end;
        
    let outDir = path.join(acode, "src");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "styles.ts"), css );
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

