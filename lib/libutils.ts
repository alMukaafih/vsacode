/**
 * A module that contains utilities used
 * @module libutils
 * @author alMukaafih
 * @requires node:fs
 * @requires node:path
 */
/**
 * @typedef {object} Map
 */
// imports
import { IfileIconTheme, DefsMap, IconsMap, FontsMap } from "../typings/fileIconTheme.js";
import { ArrayMap, ObjectMap, StringMap } from "../typings/map.js"
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Converts Map to CSS string
 * @param {Map} map0 - Map to parse
 * @returns {string} CSS style
 */
function bundleAsset(asset: string, outDir: string): string {
    const _plugin: Buffer = fs.readFileSync(path.join(path.dirname(path.dirname(outDir)), "plugin.json"));
    let __plugin: string = _plugin.toString();
    let plugin = JSON.parse(__plugin);
    if (!fs.existsSync(outDir)) 
        fs.mkdirSync(outDir);
    if (asset in bundleAsset)
        return bundleAsset[asset];
    let dest = path.basename(asset)
    let dest1 = `${outDir}/${dest}`
    if (fs.existsSync(dest1))
        dest1 = `${outDir}/1_${dest}`
    fs.renameSync(asset, dest1);
    //console.log(`    asset \x1b[1m\x1b[32m${dest}.${ext} [emitted] [immutable]\x1b[0m [from ${asset}]`)
    bundleAsset[asset] = `https://localhost/__cdvfile_files-external__/plugins/${plugin.id}/assets/${dest}`
    return `https://localhost/__cdvfile_files-external__/plugins/${plugin.id}/assets/${dest}`
}

export function parse(map0: ArrayMap, ref: DefsMap, dir: string, outDir: string): string {
    let css: string = "";
    let classes: string;
    let style: string;
    let fontChar: string = "";
    let fontColor: string = "";
    let fontId: string = "";
    let fontSize: string = "";
    let iconPath: string = "";
    
    for(let [key, value] of Object.entries(map0)) {
        if (key == "")
            continue
        fontChar = ref[key].fontCharacter || "";
        if (ref[key].fontColor)
            fontColor = `    color: ${ref[key].fontColor};\n`;

        if (ref[key].fontId)
            fontId = `    font-family: "${ref[key].fontId}" !important;\n`;

        if (ref[key].fontSize)
            fontSize = `    font-size: ${ref[key].fontSize};\n`;

        if (ref[key].iconPath)
            iconPath = `    background-image: url(${bundleAsset(path.join(dir, ref[key].iconPath), outDir)});\n`;

        classes = value.join(",");
        style = classes + `{\n    content: "${fontChar}" !important;\n`
        + fontColor + fontId + fontSize + iconPath
        + `    background-size: contain;\n`
        + `    background-repeat: no-repeat;\n`
        + `    display: inline-block;\n`
        + `    height: 1em;\n`
        + `    width: 1em;\n}\n`;
        css += style;
    }
    return css.replace(/\s/g, "");
}

export function parseFont(map: FontsMap, ref: DefsMap, dir: string, outDir: string): string {
    if (map == undefined)
        return ""
    let css: string = "";
    let srcs: string[] = [];
    let style: string = "";
    for (let font of map) {
        for (let src of font.src) {
            srcs.push(`url(${bundleAsset(path.join(dir, src.path), outDir)}) format("${src.format}")`)
        }
        style = `@font-face {\n`
        + `    font-family: "${font.id}";\n`
        + `    src: ${srcs.join(",\n    ")};\n`
        + `    font-weight: ${font.weight};\n`
        + `    font-style: ${font.style};\n`
        + `    font-size: ${font.size};\n}\n`
        srcs = []
        css += style
    }
    return css.replace(/\s/g, "")
}

/** Test if the object exists
 * @param {IconsMap} name
 * @returns {object}
 */
export function test(map: IconsMap): object {
    if (map)
        return map;
    else
        return {"": ""};
}

/** Test if Map has a property
 * @param {object} map - Map
 * @param {string} name - Property to test
 * @param {string} [def] - Default return value
 * @returns {string} Property
 */
export function _test(map: DefsMap, name: string, def: string=""): string {
    if ( !(name) )
        return def;
    if (map[name] == undefined)
        return def;
    return name.replace(/-/g, "_");
}
/** Generate CSS style
 * @param {string} name - Icon path
 * @param {string} [exe=default] - Extention of file
 * @param {string} [kind=.file_type_] - Prefix to the CSS class name
 * @returns {string} CSS style
 */
export function _css(name: string, exe: string="default", kind: string=".file_type_", ref: DefsMap, dir: string, outDir: string) {
    if (name == "")
        return "";
    let fontChar: string = "";
    let fontColor: string = "";
    let fontId: string = "";
    let fontSize: string = "";
    let iconPath: string = "";
    
    fontChar = ref[name].fontCharacter || "";
    if (ref[name].fontColor)
        fontColor = `    color: ${ref[name].fontColor};\n`;

    if (ref[name].fontId)
        fontId = `    font-family: "${ref[name].fontId}" !important;\n`;

    if (ref[name].fontSize)
        fontSize = `    font-size: ${ref[name].fontSize};\n`;

    if (ref[name].iconPath)
        iconPath = `    background-image: url(${bundleAsset(path.join(dir, ref[name].iconPath), outDir)});\n`;
    
    let css = kind + exe +  `::before {\n    content: "${fontChar}" !important;\n`
    + fontColor + fontId + fontSize + iconPath
    + `    background-size: contain;\n`
    + `    background-repeat: no-repeat;\n`
    + `    display: inline-block;\n`
    + `    height: 1em;\n`
    + `    width: 1em;\n}\n`;
    return css.replace(/\s/g, "")
}

/** Check if Icon exists at mapped location
 * @param {Map} map0 - Map
 * @param {string} _dir - Parent directory of Icon Theme json file
 * @returns {Map}
 */
export function validate(map0: DefsMap, _dir: string): DefsMap {
    for(let [key, value] of Object.entries(map0)) {
        // console.log(value);
        if (!value.iconPath)
            continue
        if ( !(fs.existsSync(path.join(_dir, value.iconPath))) )
            delete map0[key];
    }
    return map0;
}

/** Check that Map1 correctly maps Map2
 * @param {Map} map1 - Map1
 * @param {Map} map2 - Map2
 * @returns {Map}
 */
export function verify(map1: ObjectMap, map2: DefsMap): ObjectMap {
    for(let [key, value] of Object.entries(map1)) {
        if (map2[key] == undefined)
            delete map1[key];
    }
    return map1;
}
