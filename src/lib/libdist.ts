/**
 * A module that contains utilities used
 * @module libdist
 * @author alMukaafih
 * @requires node:fs
 * @requires node:path
 * @requires node:child_process
 * @requires node:util
 */
// imports
import * as fs from "node:fs";
import * as path from "node:path";
import Zip from "adm-zip";
import nunjucks from "nunjucks";
import { style } from "ziyy";

/**
 * Build acode plugin
 * @param env 
 */
export function distBuild(env: Env) {
    const label: string = env.label
    const id: string = env.id
    const base: string = env.base
    const outDir: string = env.outDir
    const engine = env.engine

    process.chdir(base);
    if (env.runtime) 
        console.log("")
    console.log(style(`    [c:cyan][b]Building[/0] ${label}`));
    const _pluginJson = fs.readFileSync(path.join(base, "plugin.json"));
    const __pluginJson = _pluginJson.toString();
    const pluginJson = __pluginJson.replace(/\s/g, "")
    nunjucks.configure(path.join(env.home, "templates"), { autoescape: false });
    const mainJs = nunjucks.render(`${engine}.njk`, { pluginJson })
    fs.writeFileSync(path.join(base, "dist", "main.js"), mainJs);
    
    const distZip = new Zip();
    distZip.addLocalFolder(path.join(base, "dist"));
    distZip.addLocalFile(path.join(base, "plugin.json"));
    distZip.addLocalFile(path.join(base, "icon.png"));
    distZip.addLocalFile(path.join(base, "readme.md"));
    const outZip: string = path.join(outDir, `${id}.zip`);
    if (fs.existsSync(outZip))
        fs.unlinkSync(outZip);
    distZip.writeZip(outZip);
    console.log(style(`    [c:green][b]Finished[/0] build`));
    console.log(style(`   [c:green][b]Generated[/0] ${path.resolve(outZip)}`));
    env.assetList = {};
}