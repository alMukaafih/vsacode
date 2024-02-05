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
const { stylesGen, pluginJsonGen } = require('../lib/libgen');
const { distBuild } = require('../lib/libdist');

exports.main = () => {
    if(exports.id == undefined && exports.label == undefined && exports.path == undefined)
        return;
    
    let _json = fs.readFileSync(exports.pwDir);
    let __json = _json.toString();
    __json = __json.replace(/\s\/\/(.)+/g, "");
    let icon_json = JSON.parse(__json);
    let outDir = path.join(exports.acode, "src");
    fs.mkdirSync(outDir, { recursive: true });
    stylesGen(exports.pwDir, outDir, icon_json);
    pluginJsonGen(exports.author, exports.id, exports.label, exports.version, exports.acode);
    distBuild(exports.label, exports.id, exports.acode, exports.icon, exports.readme);
};

exports.list = () => {
    console.log(
        `id    => ${exports.id}\n` +
        `label => ${exports.label}\n`
    );
};
