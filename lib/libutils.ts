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
export type ArrayMap = {
    [name: string]: string[]
}
export type ObjectMap = {
    [name: string]: {
        [property: string]: string
    }
}

export type StringMap = {
    [name: string]: string
}
import { IfileIconTheme, DefsMap, IconsMap, LangsMap } from "../typings/fileIconTheme.js";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Converts Map to CSS string
 * @param {Map} map0 - Map to parse
 * @returns {string} CSS style
 */
export function parse(map0: ArrayMap): string {
    let css: string = "";
    let classes: string;
    let style: string;
    let font: string = "";
    for(let [key, value] of Object.entries(map0)) {
        if (key == "")
            continue;
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
/** Generate require directive for each key: value in Map
 * @param {Map} map - Map to parse
 * @param {string} dir - Parent directory of Icon Theme json file
 * @returns {string} Require directives
 */
export function _require(map: DefsMap, dir: string): string {
    let x: string = "";
    for(let [key, value] of Object.entries(map)) {
       key = key.replace(/-/g, "_");
       key = key.replace(/\./g, "_");
       let y: string = `let ${key} = require(\"${path.join(dir, value.iconPath)}\");\n`;
       x += y;
    }
    return x;
}
/** Test if the object exists
 * @param {object} name
 * @returns {object}
 */
export function test(name: IconsMap| LangsMap): object {
    if (name)
        return name;
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
export function _css(name: string, exe: string="default", kind: string=".file_type_") {
    if (name == "")
        return "";
    let font: string = "";
    return kind + exe +  "::before {\n"
    + "display: inline-block;\n"
    + `content: '${font}';\n`
    + "background-image: url(${" + name +".default});\n"
    + "background-size: contain;\n"
    + "background-repeat: no-repeat;\n"
    + "height: 1em;\n"
    + "width: 1em;}\n";
}

/** Check if Icon exists at mapped location
 * @param {Map} map0 - Map
 * @param {string} _dir - Parent directory of Icon Theme json file
 * @returns {Map}
 */
export function validate(map0: DefsMap, _dir: string): DefsMap {
    for(let [key, value] of Object.entries(map0)) {
        // console.log(value);
        if ( !(fs.existsSync(path.join(_dir, value.iconPath))) )
            delete map0[key];
    }
    return map0;
}

/** Replaces invalid entries in Map key name
 * @param {Map} map0 - Map
 * @returns {Map}
 */
export function rehash(map0: DefsMap): DefsMap {
    let map = {};
    for(let [key, value] of Object.entries(map0)) {
        key = key.replace(/-/g, "_");
        key = key.replace(/\./g, "_");
        map[key] = value;
    }
    return map;
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
