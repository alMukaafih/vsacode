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

module.paths = [
    path.join(module.path, "commands")
]

export function main(env) {
    if(env.id == undefined && env.label == undefined && env.path == undefined)
        return 1;

    let _json = fs.readFileSync(env.pwFile);
    let __json = _json.toString();
    __json = __json.replace(/\s\/\/(.)+/g, "");
    let icon_json = JSON.parse(__json);
    let outDir = path.join(env.acode, "dist");
    fs.mkdirSync(outDir, { recursive: true });
    pluginJsonGen(
        env.packageJson,
        env.id,
        env.label, 
        env.tmpDir,
        env.acode
    );
    stylesGen(
        env.pwFile,
        outDir,
        icon_json
    );
    distBuild(
        env.label,
        env.id,
        env.acode,
        env.outDir
    );
    return 0
};

export function list(env) {
    console.log(
        `id    => ${env.id}\n` +
        `label => ${env.label}\n`
    );
};
