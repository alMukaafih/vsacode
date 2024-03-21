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
import * as Zip from "adm-zip";
import * as nunjucks from "nunjucks";

/** Build acode plugin
 * @param {string} label - Icon Theme label
 * @param {string} id - Icon Theme id
 * @param {string} acode - Build folder
 * @returns {void}
 */

export function distBuild(env) {
    let label: string = env.label
    let id: string = env.id
    let base: string = env.base
    let outDir: string = env.outDir
    let engine: string = env.engine

    process.chdir(base);
    
    console.log(`building: ${label}`);
    let _pluginJson = fs.readFileSync(path.join(base, "plugin.json"));
    let __pluginJson = _pluginJson.toString();
    let pluginJson = __pluginJson.replace(/ /g, "")
    nunjucks.configure(path.join(env.home, "templates"), { autoescape: false });
    let mainJs = nunjucks.render(`${engine}.njk`, { pluginJson })
    fs.writeFileSync(path.join(base, "dist", "main.js"), mainJs);
    
    let distZip = new Zip();
    distZip.addLocalFolder(path.join(base, "dist"));
    distZip.addLocalFile(path.join(base, "plugin.json"));
    distZip.addLocalFile(path.join(base, "icon.png"));
    distZip.addLocalFile(path.join(base, "readme.md"));
    let outZip: string = path.join(outDir, `${id}.zip`);
    if (fs.existsSync(outZip))
        fs.unlinkSync(outZip);
    distZip.writeZip(outZip);
    console.log(`output: ${id}.zip\n`);
}