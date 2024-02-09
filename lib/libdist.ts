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
    child_process.execSync(`npm run build-release`, { stdio: 'inherit' });
    //child_process.execSync(`npm run clean`, { stdio: 'inherit' });

    let outZip: string = path.join(outDir, `${id}.zip`);
    if (fs.existsSync(outZip))
        fs.unlinkSync(outZip);
    fs.renameSync(path.join(acode, "dist.zip"), outZip);
    console.log(`output: ${id}.zip\n`);
}