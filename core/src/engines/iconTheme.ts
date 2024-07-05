// imports
import { fs, path, toString } from  "../lib/compat.js"
import { iconThemeStylesGen, pluginJsonGen } from "../lib/generator/index.js";

async function __static(env: Env) {
    const buildDir: string = env.buildDir
    const contrib = env.contrib

    const base: string = path.resolve(buildDir, contrib.id)
    env.base = base
    const dist: string = path.join(base, "dist");
    env.dist = dist
    if (!await fs.exists(base))
        await fs.mkdir(base)
    if (await fs.exists(dist))
        await fs.rm(dist, { recursive: true });
    await fs.mkdir(dist);
    env.id = contrib.id;
    env.label = contrib.label;
    env.path = contrib.path;
    const iconJsonPath: string = path.join(env.tmpDir, "extension", env.path);
    const root: string = path.dirname(iconJsonPath);
    env.root = root
    if(env.id == undefined && env.label == undefined && env.path == undefined)
        return 1;

    const _json = await fs.readFile(iconJsonPath);
    let __json: string = toString(_json);
    __json = __json.replace(/\s\/\/(.)+/g, "");
    const iconJson = JSON.parse(__json);
    env.iconJson = iconJson
    env.assetList = {};
    await pluginJsonGen(env);
    await iconThemeStylesGen(env);
    return 0
};

async function __dynamic(env: Env) {
    env.skipStyles = true
    return await __static(env)
}

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
    main: __static, __dynamic, __static, fmt
}