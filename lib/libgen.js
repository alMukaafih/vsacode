#!/usr/bin/env node
// imports
const fs = require("fs");
const path = require("path");
const { MapIcons } = require('../lib/libmap');
const { parse, _require, test, _test, _css, validate, rehash, verify } = require('../lib/libutils');

function stylesGen(pwDir, outDir, icon_json) {
    let end = "`\n";
    let folders = "export let folders: string = `";
    let files = "export let files: string = `";
    let _map = icon_json.iconDefinitions;

    let valA = _test(_map, icon_json.file);
    let valB = _test(_map, icon_json.folder);
    let valC = _test(_map, icon_json.folderExpanded, valB);
    let valD = _test(_map, icon_json.rootFolder, valB);
    let valE = _test(_map, icon_json.rootFolderExpanded, valD);
    
    files += _css(valA);
    folders += `.list.collapsible.hidden > .tile > .folder::before {
        content: "" !important;
        }\n`;
    folders += _css(valB, "", `.list.collapsible.hidden > div.tile[data-name][data-type="dir"] > .icon.folder`);

    folders += _css(valB, "", `#file-browser > ul > li.tile[type="dir"]  > .icon.folder`);
    
    folders += _css(valB, "", `#file-browser > ul > li.tile[type="directory"]  > .icon.folder`);
    
    folders += _css(valC,"", `.list.collapsible > div.tile[data-name][data-type="dir"] > .icon.folder`);
    
    folders += _css(valD, "", `.list.collapsible.hidden > div[data-type="root"] > .icon.folder`);
    
    folders += _css(valE, "",`.list.collapsible > div[data-type="root"] > .icon.folder`);

    let _dir = path.dirname(pwDir);
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
    
    // validate
    _map = rehash(_map);
    _map = validate(_map, _dir);
    mapX = verify(mapX, _map);
    mapY = verify(mapY, _map);
    
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

    fs.writeFileSync(path.join(outDir, "styles.ts"), css );
}

// exports
module.exports = { stylesGen };