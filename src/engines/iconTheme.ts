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
import * as path from "node:path";
import { iconThemeStylesGen, pluginJsonGen } from "../lib/libgen.js";
import { distBuild } from "../lib/libdist.js";

function main(env: Env) {
    const buildDir: string = env.buildDir
    const contrib = env.contrib
    const outDir = env.outDir
    const home: string = env.home

    const base: string = path.resolve(buildDir, contrib.id)
    env.base = base
    const dist: string = path.join(base, "dist");
    env.dist = dist
    if (!fs.existsSync(base))
        fs.cpSync(path.join(home, "source"), base, { recursive: true });
    if (fs.existsSync(dist))
        fs.rmSync(dist, { recursive: true });
    fs.mkdirSync(dist);
    env.id = contrib.id;
    env.label = contrib.label;
    env.path = contrib.path;
    const icons: string = path.join(env.tmpDir, "extension", env.path);
    const root: string = path.dirname(icons);
    env.root = root
    if(env.id == undefined && env.label == undefined && env.path == undefined)
        return 1;

    const _json: Buffer = fs.readFileSync(icons);
    let __json: string = _json.toString();
    __json = __json.replace(/\s\/\/(.)+/g, "");
    const iconJson = JSON.parse(__json);
    env.iconJson = iconJson
    fs.mkdirSync(outDir, { recursive: true });
    env.assetList = {};
    pluginJsonGen(env);
    iconThemeStylesGen(env);
    distBuild(env);
    return 0
};

function fmt(env: Env): string {
    let formatted = ""
    const contrib = env.contrib
    env.id = contrib.id;
    env.label = contrib.label;
    
    formatted += `[b][c:green]${env.id}[/0]/${env.packageJson.publisher},iconThemes ${env.packageJson.version} vscode [convertible,automatic]\n` 
    // formatted += `label => ${env.label}\n`
    return formatted
};

export default {
    main, fmt
}