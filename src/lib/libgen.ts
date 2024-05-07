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
import * as fs from "node:fs";
import * as path from "node:path";
import { MapFileIcons } from "./libmap";
import { parse, parseFont, test, _test, _css, validate, verify } from "./libutils";

/** Generates styles.ts file from Icon Theme's json file
 * @name stylesGen
 * @param {object} env - Runtime Variables
 * @returns {void}
 */
export function stylesGen(env): void {
    const dist: string = env.dist
    const iconJson: IfileIconTheme = env.iconJson

    const assets: string = path.join(dist, "assets")
    env.assets = assets

    let fonts = "";
    let folders = "";
    let files = "";
    let iconDefs: IfileIconTheme["iconDefinitions"] = iconJson.iconDefinitions;
    env.iconDefs = iconDefs

    const file: string = _test(iconDefs, iconJson.file);
    const folder: string = _test(iconDefs, iconJson.folder);
    const folderExp: string = _test(iconDefs, iconJson.folderExpanded, folder);
    const rootFolder: string = _test(iconDefs, iconJson.rootFolder, folder);
    const rootFolderExp: string = _test(iconDefs, iconJson.rootFolderExpanded, rootFolder);
    
    files += _css(file, "default", ".file_type_", env);
    folders += `.list.collapsible.hidden > .tile > .folder::before {
        content: "" !important;
        }\n`;
    folders += _css(folder, "", `.list.collapsible.hidden > div.tile[data-name][data-type="dir"] > .icon.folder`, env);

    folders += _css(folder, "", `#file-browser > ul > li.tile[type="dir"]  > .icon.folder`, env);
    
    folders += _css(folder, "", `#file-browser > ul > li.tile[type="directory"]  > .icon.folder`, env);
    
    folders += _css(folderExp,"", `.list.collapsible > div.tile[data-name][data-type="dir"] > .icon.folder`, env);
    
    folders += _css(rootFolder, "", `.list.collapsible.hidden > div[data-type="root"] > .icon.folder`, env);
    
    folders += _css(rootFolderExp, "",`.list.collapsible > div[data-type="root"] > .icon.folder`, env);
    let foldersMap = {};
    let filesMap = {};
    //foldersMap
    const folderNamesMap = test(iconJson.folderNames);
    const folderNamesExp = test(iconJson.folderNamesExpanded);
    // filesMap
    const fileExtMap = test(iconJson.fileExtensions);
    const fileNamesMap = test(iconJson.fileNames);
 //   if (iconJson.languageIds != undefined)
    const langIdsMap = test(iconJson.languageIds);
    
    const sheetA = new MapFileIcons(".file_type_");
    const sheetM = new MapFileIcons(".file_type_", "", true, true);
    filesMap = sheetA.map(fileExtMap, filesMap, iconDefs);
    filesMap = sheetM.map(fileNamesMap, filesMap, iconDefs);
    filesMap = sheetA.map(langIdsMap, filesMap, iconDefs);
    
    const txtB_1 = "#file-browser > ul > li.tile[type='directory'][name='", txtB_2 = "' i] > .icon.folder";
    const sheetB = new MapFileIcons(txtB_1, txtB_2, false);
    foldersMap = sheetB.map(folderNamesMap, foldersMap, iconDefs);
    
    const txtC_1 = "#file-browser > ul > li.tile[type='dir'][name='", txtC_2 = "' i] > .icon.folder";
    const sheetC = new MapFileIcons(txtC_1, txtC_2, false);
    foldersMap = sheetC.map(folderNamesMap, foldersMap, iconDefs);
    
    const txtD_1 = ".list.collapsible.hidden > div.tile[data-name='", txtD_2 = "' i][data-type='dir'] > .icon.folder";
    const sheetD = new MapFileIcons(txtD_1, txtD_2, false);
    foldersMap = sheetD.map(folderNamesMap, foldersMap, iconDefs);
    
    const txtE_1 = ".list.collapsible > div.tile[data-name='", txtE_2 = "' i][data-type='dir'] > span.icon.folder";
    const sheetE = new MapFileIcons(txtE_1, txtE_2, false);
    foldersMap = sheetE.map(folderNamesExp, foldersMap, iconDefs);
    
    // validate
    //iconDefs = rehash(iconDefs);
    iconDefs = validate(env);
    foldersMap = verify(foldersMap, iconDefs);
    filesMap = verify(filesMap, iconDefs);
    
    folders += parse(foldersMap, env);
    files += parse(filesMap, env);
    
    fonts += parseFont(env)

    const css: string = fonts + folders;
    fs.writeFileSync(path.join(dist, "files.css"), files );
    fs.writeFileSync(path.join(dist, "folders.css"), css );
}

/** Generates plugin.json file required by base plugin
 * @function
 * @name pluginJsonGen
 * @param {object} author - Author credentials
 * @param {string} id - The id of the Icon Theme
 * @param {string} label - The Label of the Icon Theme
 * @param {string} version - The Version of the Plugin
 * @param {string} base - Build folder
 * @returns {void}
 */
export function pluginJsonGen(env): void {
    const packageJson = env.packageJson
    const id: string = env.id
    const label: string = env.label
    const tmpDir: string = env.tmpDir
    const base: string = env.base
    const home: string = env.home

    const json = {
        id: id,
        name: label,
        main: "main.js",
        version: packageJson.version,
        readme: "readme.md",
        icon: "icon.png",
        files: [],
        minVersionCode: 292,
        author: packageJson.author
    };
    const assets = path.join(tmpDir, "extension")
    process.chdir(base);
    fs.writeFileSync(path.join("plugin.json"), JSON.stringify(json));
    fs.copyFileSync(path.join(assets, packageJson.icon), "icon.png");
    fs.copyFileSync(path.join(assets, "README.md"), "readme.md");
    const _overrides = path.join(home, "overrides", id)
    if (fs.existsSync(_overrides)) {
        const overrides = fs.readdirSync(_overrides);
        for (const override of overrides) {
            fs.copyFileSync(path.join(_overrides, override), path.basename(override))
        }
    }
}
