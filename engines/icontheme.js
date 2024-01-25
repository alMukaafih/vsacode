#!/usr/bin/env node
/**
 * @file Manages the convertion of VSCode plugin to Acode Plugin
 * @name main
 * @author alMukaafih <alMukaafih@example.com>
 * @license MIT
 * @requires node:fs
 * @requires node:os
 * @requires node:path
 * @requires AdmZip
 * @requires libgen
 * @requires libdist
 */
// imports
const fs = require("fs");
const os = require("os");
const path = require("path");
const { stylesGen } = require('../lib/libgen');
const { distBuild } = require('../lib/libdist');

exports.main = () => {
    if(exports._id == undefined && exports._label == undefined && exports._path == undefined)
        return 1;
    
    let _json = fs.readFileSync(exports.pwDir);
    let __json = _json.toString();
    __json = __json.replace(/\s\/\/(.)+/g, "");
    let icon_json = JSON.parse(__json);
    let outDir = path.join(exports.acode, "src");
    fs.mkdirSync(outDir, { recursive: true });
    stylesGen(exports.pwDir, outDir, icon_json);
    distBuild(exports._label, exports._id, exports.acode);
    return 0;
};

exports.list = () => {
    console.log(
        `id    => ${exports._id}\n` +
        `label => ${exports._label}\n` + 
        `path  => ${exports._path}`
    );
};
