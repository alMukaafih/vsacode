#!/bin/env node
// used packages
const fs = require("fs");
const os = require("os");
const path = require("path");
const AdmZip = require("adm-zip");

// cleanup task
process.on("exit", (code) => {
    console.log("Exiting Node.js process with code:", code);
    //fs.rmSync(tmpDir, { recursive: true });
});


class MapIcons {
    constructor(txt_1, txt_2="", on=true) {
        this.x = txt_1;
        this.y = txt_2;
        this.z = "::before";
        this.switch = on;
    }
    map(map1, map2) {
        this.map1 = map1;
        this.map2 = map2;
        for([this.key, this.value] of Object.entries(this.map1)) {
            if (this.value.includes("-"))
                this.value = this.value.replace(/-/g, '_');
            if (this.map2[this.value] == undefined)
                this.map2[this.value] = [];
            if (this.switch == true && this.key.includes("."))
                this.key = this.key.replace(/\./g, '_');
            this.key = this.x + this.key + this.y + this.z;
            this.map2[this.value].push(this.key);
        }
        return this.map2;
    }
}
function parse(map0) {
    let css = "";
    let classes;
    let style;
    let font = "";
    for(let [key, value] of Object.entries(map0)) {
        if (key == "")
            break;
        classes = value.join(",");
        style = classes + "{\n"
        + "display: inline-block;\n"
        + `content: '${font}';\n`
        + "background-image: url(${" + key +".default});\n"
        + "background-size: contain;\n"
        + "background-repeat: no-repeat;\n"
        + "height: 1em;\n"
        + "width: 1em;}\n";
        css += style;
    }
    return css;
}

function _require(map) {
    let x = "";
    for(let [key, value] of Object.entries(map)) {
       key = key.replace("-", "_");
       let y = `let ${key} = require(\"${value.iconPath}\");\n`;
       x += y;
    }
    return x;
}

function test(name) {
    if (name)
        return name;
    else
        return {"": ""};
}



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

// read extension/package.json file
let _json = fs.readFileSync(path.join(tmpDir, "extension", "package.json"));
let package_json = JSON.parse(_json);
let iconThemes = package_json.contributes.iconThemes;
if (iconThemes == undefined)
    process.exit(1);
 
 
 
 
// d
let end = "`\n";
let folders = "export let folders: string = `";
let files = "export let files: string = `";

// process each icon Theme
let x = 3;
for (let iconTheme of iconThemes) {
    let _id = process.argv[x];
    let _label = iconTheme.label;
    let _path = iconTheme.path;
    let _json = fs.readFileSync(path.join(tmpDir, "extension", _path));
    let icon_json = JSON.parse(_json);
    //console.log(_id, _label, _path);
    let _dir = path.dirname(_path);
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
    mapY = sheetA.map(mapC, mapY);
    mapY = sheetA.map(mapD, mapY);
    mapY = sheetA.map(mapE, mapY);
    
    let txtB_1 = "#file-browser > ul > li.tile[type='directory'][name='", txtB_2 = "'] > .icon.folder";
    let sheetB = new MapIcons(txtB_1, txtB_2, false);
    mapX = sheetB.map(mapA, mapX);
    
    let txtC_1 = "#file-browser > ul > li.tile[type='dir'][name='", txtC_2 = "'] > .icon.folder";
    const sheetC = new MapIcons(txtC_1, txtC_2, false);
    mapX = sheetC.map(mapA, mapX);
    
    let txtD_1 = ".list.collapsible.hidden > div.tile[data-name='", txtD_2 = "'][data-type='dir'] > .icon.folder";
    const sheetD = new MapIcons(txtD_1, txtD_2, false);
    mapX = sheetD.map(mapA, mapX);
    
    let txtE_1 = ".list.collapsible > div.tile[data-name='", txtE_2 = "'][data-type='dir'] > span.icon.folder";
    let sheetE = new MapIcons(txtE_1, txtE_2, false);
    mapX = sheetE.map(mapB, mapX);
    
    folders += parse(mapX);
    files += parse(mapY);
    
    let req = _require(_map);
    _req = req.split("\n");
    _req = [...new Set(_req)];
    req = _req.join("\n");
    req += "\n";
    css = req
        + folders + end
        + files + end
        ;
    let outDir = path.join(tmpDir,"acode/src");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "style.ts"), css );
    x ++;
}

