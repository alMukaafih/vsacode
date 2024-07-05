import { fs, path, toString } from  "../lib/compat.js"
import { productIconThemeStylesGen, pluginJsonGen } from "../lib/generator/index.js";
import { distBuild } from "../lib/dist.js";

async function main(env: Env) {
    const buildDir: string = env.buildDir
    const contrib = env.contrib
    const outDir = env.outDir
    const home: string = env.home

    const base: string = path.resolve(buildDir, contrib.id)
    env.base = base
    const dist: string = path.join(base, "dist");
    env.dist = dist
    if (!await fs.exists(base))
        await fs.cp(path.join(home, "source"), base, { recursive: true });
    if (await fs.exists(dist))
        await fs.rm(dist, { recursive: true });
    await fs.mkdir(dist);
    env.id = contrib.id;
    env.label = contrib.label;
    env.path = contrib.path;
    const icons: string = path.join(env.tmpDir, "extension", env.path);
    const root: string = path.dirname(icons);
    env.root = root
    if(env.id == undefined && env.label == undefined && env.path == undefined)
        return 1;

    const _json = await fs.readFile(icons);
    let __json: string = toString(_json);
    __json = __json.replace(/\s\/\/(.)+/g, "");
    const iconJson = JSON.parse(__json);
    env.iconJson = iconJson
    await fs.mkdir(outDir, { recursive: true });
    env.assetList = {};
    await pluginJsonGen(env);
    await productIconThemeStylesGen(env);
    await distBuild(env);
    return 0
};

export default {
    main
}