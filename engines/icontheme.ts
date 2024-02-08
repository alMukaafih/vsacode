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
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { stylesGen, pluginJsonGen } from "../lib/libgen";
import { distBuild } from "../lib/libdist";

exports.main = () => {
    if(exports.id == undefined && exports.label == undefined && exports.path == undefined)
        return;
    
    let _json = fs.readFileSync(exports.pwDir);
    let __json = _json.toString();
    __json = __json.replace(/\s\/\/(.)+/g, "");
    let icon_json = JSON.parse(__json);
    let outDir = path.join(exports.acode, "dist");
    fs.mkdirSync(outDir, { recursive: true });
    stylesGen(
        exports.pwDir,
        outDir,
        icon_json
    );
    pluginJsonGen(
        exports.author, 
        exports.id,
        exports.label, 
        exports.version,
        exports.tmpDir
    );
    distBuild(
        exports.label,
        exports.id,
        exports.acode,
        exports.icon,
        exports.readme,
        exports.plugin,
        exports.outDir
    );
};

exports.list = () => {
    console.log(
        `id    => ${exports.id}\n` +
        `label => ${exports.label}\n`
    );
};
