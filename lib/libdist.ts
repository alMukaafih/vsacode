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
import * as child_process from "node:child_process";
import * as webpack from "webpack";
import * as Zip from "adm-zip";

/** Build acode plugin
 * @param {string} label - Icon Theme label
 * @param {string} id - Icon Theme id
 * @param {string} acode - Build folder
 * @returns {void}
 */

export function distBuild(
    label: string,
    id: string, 
    acode: string,
    outDir: string
) {
    process.chdir(acode);
    
    // open plugin.json
    console.log(`building: ${label}`);
    //sleep(2000);
    // child_process.execSync(`nano ${plugin_json}`, { stdio: 'inherit' });
    // child_process.execSync(`nano ${readme_md}`, { stdio: 'inherit' });
    //child_process.execSync(`npm run build-release`, { stdio: 'inherit' });
    //child_process.execSync(`npm run clean`, { stdio: 'inherit' });
    const webpackObject = require(path.join(acode, "webpack.config.js"));
    webpackObject.entry.main = path.join(acode, "src/main.ts")
    webpackObject.output.path = path.join(acode, "dist")
    webpack(
        webpackObject,
        (err, stats) => {
            if (err) {
            console.error(err);
            return;
            }
            console.log(
            stats.toString({
                chunks: true, // Makes the build much quieter
                colors: true, // Shows colors in the console
            })
            );
        }
    );
    let distZip = new Zip();
    let dist = fs.readdirSync(path.join(acode, "dist"));
    for (let entry of dist) {
        entry = path.join(acode, "dist", entry);
        var info = fs.statSync(entry);
        if (info.isDirectory()) {
            distZip.addLocalFolder(entry);
        } else if (info.isFile()) {
            distZip.addLocalFile(entry);
        }
    }
    
    let outZip: string = path.join(outDir, `${id}.zip`);
    if (fs.existsSync(outZip))
        fs.unlinkSync(outZip);
    distZip.writeZip(outZip)
    console.log(`output: ${id}.zip\n`);
}