/**
 * A module that contains utilities used
 * @module utils
 * @author alMukaafih
 * @requires compat
 * @requires node:path
 */
// imports
import { fs, path } from  "./compat.js"

/**
 * Bundles asset
 * @param asset Asset
 * @param env Environment variables
 * @returns Asset's url
 */
export async function bundleAsset(asset: string, env: Env): Promise<string> {
    const assets: string = env.assets
    const base: string = env.base
    const _plugin: Buffer = await fs.readFile(path.join(base,  "plugin.json"));
    const __plugin: string = _plugin.toString();
    const plugin = JSON.parse(__plugin);
    if (!await fs.exists(assets)) 
        await fs.mkdir(assets);
    if (asset in env.assetList)
        return env.assetList[asset];
    const dest = path.basename(asset)
    let dest1 = `${assets}/${dest}`
    if (await fs.exists(dest1))
        dest1 = `${assets}/1_${dest}`
    await fs.copyFile(asset, dest1);
    //console.log(`    asset \x1b[1m\x1b[32m${dest}.${ext} [emitted] [immutable]\x1b[0m [from ${asset}]`)
    env.assetList[asset] = `https://localhost/__cdvfile_files-external__/plugins/${plugin.id}/${path.basename(assets)}/${dest}`
    return `https://localhost/__cdvfile_files-external__/plugins/${plugin.id}/${path.basename(assets)}/${dest}`
}

export async function parse(map0: ArrayMap, env: Env): Promise<string> {
    const root: string = env.root
    const ref: DefsMap = env.iconDefs
    
    let css = "";
    let classes: string;
    let style: string;
    let fontChar: string | undefined = "";
    let fontColor = "";
    let fontId = "";
    let fontSize = "";
    let iconPath = "";
    
    for(const [key, value] of Object.entries(map0)) {
        if (!ref[key])
            continue
        if (ref[key].fontCharacter)
            fontChar = ref[key].fontCharacter;
        if (ref[key].fontColor)
            fontColor = `    color: ${ref[key].fontColor};\n`;

        if (ref[key].fontId)
            fontId = `    font-family: "${ref[key].fontId}" !important;\n`;

        if (ref[key].fontSize)
            fontSize = `    font-size: ${ref[key].fontSize};\n`;

        if (ref[key].iconPath)
            iconPath = `    background-image: url(${await bundleAsset(path.join(root, ref[key].iconPath), env)});\n`;

        classes = value.join(",");
        style = classes + `{\n    content: "${fontChar}" !important;\n`
        + fontColor + fontId + fontSize + iconPath
        + `    background-size: contain;\n`
        + `    background-repeat: no-repeat;\n`
        + `    display: inline-block;\n`
        + `    height: 1em;\n`
        + `    width: 1em;\n}\n`;
        css += style;
    }
    return css.replace(/\s/g, "");
}

export async function parseFont(env: Env): Promise<string> {
    const map: FontsMap = env.iconJson.fonts
    const root: string = env.root

    if (map == undefined)
        return ""
    let css = "";
    let srcs: string[] = [];
    let style = "";
    for (const font of map) {
        for (const src of font.src) {
            srcs.push(`url(${await bundleAsset(path.join(root, src.path), env)}) format("${src.format}")`)
        }
        style = `@font-face {\n`
        + `    font-family: "${font.id}";\n`
        + `    src: ${srcs.join(",\n    ")};\n`
        + `    font-weight: ${font.weight};\n`
        + `    font-style: ${font.style};\n`
        + `    font-size: ${font.size};\n}\n`
        srcs = []
        css += style
    }
    return css.replace(/\s/g, "")
}

/** Generate CSS style
 * @param name Icon path
 * @param exe Extention of file
 * @param kind Prefix to the CSS class name
 * @returns CSS output
 */
export async function _css(name: string, exe="default", kind=".file_type_", env: Env): Promise<string> {
    const root: string = env.root
    const ref: DefsMap = env.iconDefs

    if (!ref[name])
        return "";
    let fontChar: string | undefined = "";
    let fontColor = "";
    let fontId = "";
    let fontSize = "";
    let iconPath = "";
    if (ref[name].fontCharacter)
        fontChar = ref[name].fontCharacter;
    if (ref[name].fontColor)
        fontColor = `    color: ${ref[name].fontColor};\n`;

    if (ref[name].fontId)
        fontId = `    font-family: "${ref[name].fontId}" !important;\n`;

    if (ref[name].fontSize)
        fontSize = `    font-size: ${ref[name].fontSize};\n`;

    if (ref[name].iconPath)
        iconPath = `    background-image: url(${await bundleAsset(path.join(root, ref[name].iconPath), env)});\n`;
    
    const css = kind + exe +  `::before {\n    content: "${fontChar}" !important;\n`
    + fontColor + fontId + fontSize + iconPath
    + `    background-size: contain;\n`
    + `    background-repeat: no-repeat;\n`
    + `    display: inline-block;\n`
    + `    height: 1em;\n`
    + `    width: 1em;\n}\n`;
    return css.replace(/\s/g, "")
}

/**
 * Test if the object exists
 * @param  map
 * @returns Map
 */
export function test(map: IconsMap): object {
    if (map)
        return map;
    else
        return {"": ""};
}

/**
 * Test if Map has a property
 * @param map Definition maps
 * @param name Property name
 * @param def Return value
 * @returns
 */
export function _test(map: DefsMap, name: string | undefined, def=""): string {
    if (!name)
        return def;
    if (map[name] == undefined)
        return def;
    return name.replace(/-/g, "_");
}

/**
 * Check if Icon exists at mapped location
 * @param env - Environment variables
 * @returns Map
 */
export async function validate(env: Env): Promise<DefsMap> {
    const map0: DefsMap = env.iconDefs
    const root: string = env.root
    for(const [key, value] of Object.entries(map0)) {
        // console.log(value);
        if (!value.iconPath)
            continue
        if ( !(await fs.exists(path.join(root, value.iconPath))) )
            delete map0[key];
    }
    return map0;
}

/** Check that Map1 correctly maps Map2
 * @param map1 - Map1
 * @param map2 - Map2
 * @returns Map
 */
export function verify(map1: ObjectMap, map2: DefsMap): ObjectMap {
    for(const [key] of Object.entries(map1)) {
        if (map2[key] == undefined)
            delete map1[key];
    }
    return map1;
}
