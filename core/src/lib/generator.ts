/**
 * A module that generates files
 * @module generator
 * @author alMukaafih
 * @requires compat
 * @requires node:path
 * @requires utils
 * @requires mapper
 */

// imports
import { fs } from  "./compat.js"
import * as path from "node:path";
import { MapFileIcons } from "./mapper.js";
import { parse, parseFont, test, _test, _css, validate, verify } from "./utils.js";

/**
 * Generates styles.ts file from Icon Theme's json file
 * @param env 
 */
export async function iconThemeStylesGen(env: Env): Promise<void> {
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
    
    files += await _css(file, "default", ".file_type_", env);
    folders += `.list.collapsible.hidden > .tile > .folder::before {
        content: "" !important;
        }\n`;
    folders += await _css(folder, "", `.list.collapsible.hidden > div.tile[data-name][data-type="dir"] > .icon.folder`, env);

    folders += await _css(folder, "", `#file-browser > ul > li.tile[type="dir"]  > .icon.folder`, env);
    
    folders += await _css(folder, "", `#file-browser > ul > li.tile[type="directory"]  > .icon.folder`, env);
    
    folders += await _css(folderExp,"", `.list.collapsible > div.tile[data-name][data-type="dir"] > .icon.folder`, env);
    
    folders += await _css(rootFolder, "", `.list.collapsible.hidden > div[data-type="root"] > .icon.folder`, env);
    
    folders += await _css(rootFolderExp, "",`.list.collapsible > div[data-type="root"] > .icon.folder`, env);
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
    iconDefs = await validate(env);
    foldersMap = verify(foldersMap, iconDefs);
    filesMap = verify(filesMap, iconDefs);
    
    folders += await parse(foldersMap, env);
    files += await parse(filesMap, env);
    
    fonts += await parseFont(env)

    const css: string = fonts + folders;
    await fs.writeFile(path.join(dist, "files.css"), files );
    await fs.writeFile(path.join(dist, "folders.css"), css );
    env.cssList = ["files.css", "folders.css"]
}

export function productIconThemeStylesGen(env: Env) {

}

export function themeStylesGen(env: Env) {
    
}

/**
 * Generates plugin.json file required by base plugin
 * @param env 
 */
export async function pluginJsonGen(env: Env): Promise<void> {
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
    await fs.writeFile(path.join("plugin.json"), JSON.stringify(json));
    env.pluginId = json.id
    await fs.copyFile(path.join(assets, packageJson.icon), "icon.png");
    await fs.copyFile(path.join(assets, "README.md"), "readme.md");
    const _overrides = path.join(home, "overrides", id)
    if (await fs.exists(_overrides)) {
        const overrides = await fs.readdir(_overrides);
        for (const override of overrides) {
            await fs.copyFile(path.join(_overrides, override), path.basename(override))
        }
    }
}
