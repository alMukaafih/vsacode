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
const fs = require("fs");
const path = require("path");

/**
 * Converts Map to CSS string
 * @param {Map} map0 - Map to parse
 * @returns {string} CSS style
 */
function parse(map0) {
    let css = "";
    let classes;
    let style;
    let font = "";
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
function _require(map, dir) {
    let x = "";
    for(let [key, value] of Object.entries(map)) {
       key = key.replace(/-/g, "_");
       key = key.replace(/\./g, "_");
       let y = `let ${key} = require(\"${path.join(dir, value.iconPath)}\");\n`;
       x += y;
    }
    return x;
}
/** Test if the object exists
 * @param {object} name
 * @returns {object}
 */
function test(name) {
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
function _test(map, name, def="") {
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
function _css(name, exe = "default", kind = ".file_type_") {
    if (name == "")
        return "";
    let font = "";
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
function validate(map0, _dir) {
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
function rehash(map0) {
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
function verify(map1, map2) {
    for(let [key, value] of Object.entries(map1)) {
        if (map2[key] == undefined)
            delete map1[key];
    }
    return map1;
}

// exports
module.exports = { parse, _require, test, _test, _css, validate, rehash, verify };