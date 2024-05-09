import * as fs from "node:fs";
import * as path from "node:path";
import { productIconThemeStylesGen, pluginJsonGen } from "../lib/libgen.js";
import { distBuild } from "../lib/libdist.js";


function main(env) {
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
    productIconThemeStylesGen(env);
    distBuild(env);
    return 0
}

export default {
    main
}