/**
 * A module that generates files
 * @module libgen
 * @author alMukaafih
 * @requires node:fs
 * @requires node:path
 * @requires libutils
 * @requires libmap
 */
 
import { IfileIconTheme } from "../typings/fileIconTheme.js"
// imports
const fs = require("fs");
const path = require("path");
const { MapFileIcons } = require('./libmap');
const { parse, _require, test, _test, _css, validate, rehash, verify } = require('./libutils');

/** Generates styles.ts file from Icon Theme's json file
 * @function
 * @name stylesGen
 * @param {string} pwDir - Relative path to Icon Theme json file
 * @param {string} outDir - Output Directory of styles.ts
 * @param {object} iconJson - Icon Theme json file
 * @returns {void}
 */
function stylesGen(pwDir: string, outDir: string, iconJson: IfileIconTheme) {
    let end: string = "`\n";
    let folders: string = "export let folders: string = `";
    let files: string = "export let files: string = `";
    let iconDefs: IfileIconTheme["iconDefinitions"] = iconJson.iconDefinitions;

    let file: string = _test(iconDefs, iconJson.file);
    let folder: string = _test(iconDefs, iconJson.folder);
    let folderExp: string = _test(iconDefs, iconJson.folderExpanded, folder);
    let rootFolder: string = _test(iconDefs, iconJson.rootFolder, folder);
    let rootFolderExp: string = _test(iconDefs, iconJson.rootFolderExpanded, rootFolder);
    
    files += _css(file);
    folders += `.list.collapsible.hidden > .tile > .folder::before {
        content: "" !important;
        }\n`;
    folders += _css(folder, "", `.list.collapsible.hidden > div.tile[data-name][data-type="dir"] > .icon.folder`);

    folders += _css(folder, "", `#file-browser > ul > li.tile[type="dir"]  > .icon.folder`);
    
    folders += _css(folder, "", `#file-browser > ul > li.tile[type="directory"]  > .icon.folder`);
    
    folders += _css(folderExp,"", `.list.collapsible > div.tile[data-name][data-type="dir"] > .icon.folder`);
    
    folders += _css(rootFolder, "", `.list.collapsible.hidden > div[data-type="root"] > .icon.folder`);
    
    folders += _css(rootFolderExp, "",`.list.collapsible > div[data-type="root"] > .icon.folder`);

    let _dir: string = path.dirname(pwDir);
    let foldersMap = {};
    let filesMap = {};
    //foldersMap
    let folderNamesMap: IfileIconTheme["folderNames"] = test(iconJson.folderNames);
    let folderNamesExp: IfileIconTheme["folderNamesExpanded"] = test(iconJson.folderNamesExpanded);
    // filesMap
    let fileExtMap: IfileIconTheme["fileExtensions"] = test(iconJson.fileExtensions);
    let fileNamesMap: IfileIconTheme["fileNames"] = test(iconJson.fileNames);
 //   if (iconJson.languageIds != undefined)
    let langIdsMap: IfileIconTheme["languageIds"] = test(iconJson.languageIds);
    
    let sheetA = new MapFileIcons(".file_type_");
    filesMap = sheetA.map(fileExtMap, filesMap, iconDefs);
    filesMap = sheetA.map(fileNamesMap, filesMap, iconDefs);
    filesMap = sheetA.map(langIdsMap, filesMap, iconDefs);
    
    let txtB_1: string = "#file-browser > ul > li.tile[type='directory'][name='", txtB_2 = "'] > .icon.folder";
    let sheetB = new MapFileIcons(txtB_1, txtB_2, false);
    foldersMap = sheetB.map(folderNamesMap, foldersMap, iconDefs);
    
    let txtC_1: string = "#file-browser > ul > li.tile[type='dir'][name='", txtC_2 = "'] > .icon.folder";
    const sheetC = new MapFileIcons(txtC_1, txtC_2, false);
    foldersMap = sheetC.map(folderNamesMap, foldersMap, iconDefs);
    
    let txtD_1: string = ".list.collapsible.hidden > div.tile[data-name='", txtD_2 = "'][data-type='dir'] > .icon.folder";
    const sheetD = new MapFileIcons(txtD_1, txtD_2, false);
    foldersMap = sheetD.map(folderNamesMap, foldersMap, iconDefs);
    
    let txtE_1: string = ".list.collapsible > div.tile[data-name='", txtE_2 = "'][data-type='dir'] > span.icon.folder";
    let sheetE = new MapFileIcons(txtE_1, txtE_2, false);
    foldersMap = sheetE.map(folderNamesExp, foldersMap, iconDefs);
    
    // validate
    iconDefs = rehash(iconDefs);
    iconDefs = validate(iconDefs, _dir);
    foldersMap = verify(foldersMap, iconDefs);
    filesMap = verify(filesMap, iconDefs);
    
    folders += parse(foldersMap);
    files += parse(filesMap);
    
    let req: string = _require(iconDefs, _dir);
    let _req: string[] = req.split("\n");
    _req = [...new Set(_req)];
    req = _req.join("\n");
    req += "\n";
    let css: string = req
        + folders + end
        + files + end;

    fs.writeFileSync(path.join(outDir, "styles.ts"), css );
}

/** Generates plugin.json file required by acode plugin
 * @function
 * @name pluginJsonGen
 * @param {object} author - Author credentials
 * @param {string} id - The id of the Icon Theme
 * @param {string} label - The Label of the Icon Theme
 * @param {string} version - The Version of the Plugin
 * @param {string} acode - Build folder
 * @returns {void}
 */
function pluginJsonGen(author: object | string, id: string, label: string, version: string, tmpDir: string) {
    let json = {
        id: id,
        name: label,
        main: "dist/main.js",
        version: version,
        readme: "README.md",
        icon: "icon.png",
        files: [],
        minVersionCode: 292,
        author: author
    };
    fs.writeFileSync(path.join(tmpDir, "extension", "plugin.json"), JSON.stringify(json));
}

module.exports = { stylesGen, pluginJsonGen };