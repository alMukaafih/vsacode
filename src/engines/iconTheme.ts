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

export function main(env) {
    let buildDir: string = env.buildDir
    let contrib = env.contrib
    let outDir = env.outDir
    let home: string = env.home

    let base: string = path.resolve(buildDir, contrib.id)
    env.base = base
    let dist: string = path.join(base, "dist");
    env.dist = dist
    if (!fs.existsSync(base))
        fs.cpSync(path.join(home, "source"), base, { recursive: true });
    if (fs.existsSync(dist))
        fs.rmSync(dist, { recursive: true });
    fs.mkdirSync(dist);
    env.id = contrib.id;
    env.label = contrib.label;
    env.path = contrib.path;
    let icons: string = path.join(env.tmpDir, "extension", env.path);
    let root: string = path.dirname(icons);
    env.root = root
    if(env.id == undefined && env.label == undefined && env.path == undefined)
        return 1;

    let _json: Buffer = fs.readFileSync(icons);
    let __json: string = _json.toString();
    __json = __json.replace(/\s\/\/(.)+/g, "");
    let iconJson = JSON.parse(__json);
    env.iconJson = iconJson
    fs.mkdirSync(outDir, { recursive: true });
    env.assetList = {};
    pluginJsonGen(env);
    stylesGen(env);
    distBuild(env);
    return 0
};

export function list(env) {
    console.log(
        `id    => ${env.id}\n` +
        `label => ${env.label}\n`
    );
};
