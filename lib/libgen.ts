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
import { StringMap } from "../typings/map.js"
// imports
import * as fs from "node:fs";
import * as path from "node:path";
import { MapFileIcons } from "./libmap";
import { parse, parseFont, test, _test, _css, validate, verify } from "./libutils";

/** Generates styles.ts file from Icon Theme's json file
 * @function
 * @name stylesGen
 * @param {string} pwDir - Relative path to Icon Theme json file
 * @param {string} outDir - Output Directory of styles.ts
 * @param {object} iconJson - Icon Theme json file
 * @returns {void}
 */
export function stylesGen(pwDir: string, outDir: string, iconJson: IfileIconTheme) {
    let _dir: string = path.dirname(pwDir);
    let assets: string = path.join(outDir, "assets")
    let fonts: string = "";
    let folders: string = "";
    let files: string = "";
    let iconDefs: IfileIconTheme["iconDefinitions"] = iconJson.iconDefinitions;

    let file: string = _test(iconDefs, iconJson.file);
    let folder: string = _test(iconDefs, iconJson.folder);
    let folderExp: string = _test(iconDefs, iconJson.folderExpanded, folder);
    let rootFolder: string = _test(iconDefs, iconJson.rootFolder, folder);
    let rootFolderExp: string = _test(iconDefs, iconJson.rootFolderExpanded, rootFolder);
    
    files += _css(file, "default", ".file_type_", iconDefs, _dir, assets);
    folders += `.list.collapsible.hidden > .tile > .folder::before {
        content: "" !important;
        }\n`;
    folders += _css(folder, "", `.list.collapsible.hidden > div.tile[data-name][data-type="dir"] > .icon.folder`, iconDefs, _dir, assets);

    folders += _css(folder, "", `#file-browser > ul > li.tile[type="dir"]  > .icon.folder`, iconDefs, _dir, assets);
    
    folders += _css(folder, "", `#file-browser > ul > li.tile[type="directory"]  > .icon.folder`, iconDefs, _dir, assets);
    
    folders += _css(folderExp,"", `.list.collapsible > div.tile[data-name][data-type="dir"] > .icon.folder`, iconDefs, _dir, assets);
    
    folders += _css(rootFolder, "", `.list.collapsible.hidden > div[data-type="root"] > .icon.folder`, iconDefs, _dir, assets);
    
    folders += _css(rootFolderExp, "",`.list.collapsible > div[data-type="root"] > .icon.folder`, iconDefs, _dir, assets);
    let foldersMap = {};
    let filesMap = {};
    //foldersMap
    let folderNamesMap = test(iconJson.folderNames);
    let folderNamesExp = test(iconJson.folderNamesExpanded);
    // filesMap
    let fileExtMap = test(iconJson.fileExtensions);
    let fileNamesMap = test(iconJson.fileNames);
 //   if (iconJson.languageIds != undefined)
    let langIdsMap = test(iconJson.languageIds);
    
    let sheetA = new MapFileIcons(".file_type_");
    let sheetM = new MapFileIcons(".file_type_", "", true, true);
    filesMap = sheetA.map(fileExtMap, filesMap, iconDefs);
    filesMap = sheetM.map(fileNamesMap, filesMap, iconDefs);
    filesMap = sheetA.map(langIdsMap, filesMap, iconDefs);
    
    let txtB_1: string = "#file-browser > ul > li.tile[type='directory'][name='", txtB_2: string = "' i] > .icon.folder";
    let sheetB = new MapFileIcons(txtB_1, txtB_2, false);
    foldersMap = sheetB.map(folderNamesMap, foldersMap, iconDefs);
    
    let txtC_1: string = "#file-browser > ul > li.tile[type='dir'][name='", txtC_2: string = "' i] > .icon.folder";
    const sheetC = new MapFileIcons(txtC_1, txtC_2, false);
    foldersMap = sheetC.map(folderNamesMap, foldersMap, iconDefs);
    
    let txtD_1: string = ".list.collapsible.hidden > div.tile[data-name='", txtD_2: string = "' i][data-type='dir'] > .icon.folder";
    const sheetD = new MapFileIcons(txtD_1, txtD_2, false);
    foldersMap = sheetD.map(folderNamesMap, foldersMap, iconDefs);
    
    let txtE_1: string = ".list.collapsible > div.tile[data-name='", txtE_2: string = "' i][data-type='dir'] > span.icon.folder";
    let sheetE = new MapFileIcons(txtE_1, txtE_2, false);
    foldersMap = sheetE.map(folderNamesExp, foldersMap, iconDefs);
    
    // validate
    //iconDefs = rehash(iconDefs);
    iconDefs = validate(iconDefs, _dir);
    foldersMap = verify(foldersMap, iconDefs);
    filesMap = verify(filesMap, iconDefs);
    
    folders += parse(foldersMap, iconDefs, _dir, assets);
    files += parse(filesMap, iconDefs, _dir, assets);
    
    fonts += parseFont(iconJson.fonts, iconDefs, _dir, assets)

    let css: string = fonts + folders;
    if (!fs.existsSync(outDir)) 
        fs.mkdirSync(outDir);
    fs.writeFileSync(path.join(outDir, "files.css"), files );
    fs.writeFileSync(path.join(outDir, "folders.css"), css );
}

/** @constant {string} */
const includes: string = path.join("/data/data/com.termux/pj/vsacode", "includes");
/** Checks if required File exits
 * @param {string} id - Icon Theme id
 * @param {string} req - Name of required File
 * @returns {boolean}
 */
function reqExists(id: string, req: string) {
    let file;
    let _path: string = path.join(includes, id);
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
 * @param {string} id - Icon Theme id
 * @param {string} req - Name of required File
 * @param {object} fallback - Fallback to default to
 * @returns {string} Path of required File
 */
function check(id: string, req: string, fallback: StringMap): string {
    if (!reqExists(id, req))
        return path.join(fallback[req]);
    return path.join(includes, id, req);
}

/** Link the required files
 * @param {string} from - Origin
 * @param {string} to - Destination
 * @returns {void}
 */
function link(from: string, to: string): void {
    fs.copyFileSync(from, to);
}

/** Include the required files
 * @param {string} id - Icon Theme id
 * @param {object} fallback - Fallback to default to
 * @returns {void}
 */
function include(id: string, fallback: StringMap): void {
    let plugin_json: string = check(id, "plugin.json", fallback);
    let readme_md: string = check(id, "readme.md", fallback);
    let icon_png: string = check(id, "icon.png", fallback);
    link(plugin_json, "plugin.json");
    link(readme_md, "readme.md");
    link(icon_png, "icon.png");
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
export function pluginJsonGen(packageJson, id: string, label: string, tmpDir: string, acode: string): void {
    let json = {
        id: id,
        name: label,
        main: "dist/main.js",
        version: packageJson.version,
        readme: "readme.md",
        icon: "icon.png",
        files: [],
        minVersionCode: 292,
        author: packageJson.author
    };
    let assets = path.join(tmpDir, "extension")
    fs.writeFileSync(path.join(assets, "plugin.json"), JSON.stringify(json));
        let fallback = {
        "plugin.json": path.join(assets, "plugin.json"),
        "icon.png": path.join(assets, packageJson.icon),
        "readme.md": path.join(assets, "README.md"),
    };
    
    process.chdir(acode);
    include(id, fallback);
}
