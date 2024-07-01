/**
 * A module that contains utilities used
 * @module dist
 * @author alMukaafih
 * @requires compat
 * @requires node:path
 * @requires node:util
 */
// imports
import { fs, path } from  "./compat.js"
import Zip from "adm-zip";
import nunjucks from "nunjucks";
import { style } from "ziyy";

/**
 * Build acode plugin
 * @param env 
 */
export async function distBuild(env: Env) {
    const label: string = env.label
    const id: string = env.id
    const base: string = env.base
    const outDir: string = env.outDir
    const engine = env.engine

    process.chdir(base);
    if (env.runtime) 
        console.log("")
    console.log(style(`    [c:cyan][b]Building[/0] ${label}`));
    nunjucks.configure(path.join(env.home, "dist", "templates"), { autoescape: false });
    const mainJs = nunjucks.render(`${engine}.njk`, { cssList: env.cssList, pluginId: env.pluginId })
    await fs.writeFile(path.join(base, "dist", "main.js"), mainJs);
    
    const distZip = new Zip();
    distZip.addLocalFolder(path.join(base, "dist"));
    distZip.addLocalFile(path.join(base, "plugin.json"));
    distZip.addLocalFile(path.join(base, "icon.png"));
    distZip.addLocalFile(path.join(base, "readme.md"));
    const outZip: string = path.join(outDir, `${id}.zip`);
    if (await fs.exists(outZip))
        await fs.unlink(outZip);
    distZip.writeZip(outZip);
    console.log(style(`    [c:green][b]Finished[/0] build`));
    console.log(style(`   [c:green][b]Generated[/0] ${path.resolve(outZip)}`));
    env.assetList = {};
}