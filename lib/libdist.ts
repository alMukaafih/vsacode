/**
 * A module that contains utilities used
 * @module libdist
 * @author alMukaafih
 * @requires node:fs
 * @requires node:path
 * @requires node:child_process
 * @requires node:util
 */
import { StringMap } from "./libutils.js"
// imports
import * as fs from "node:fs";
import * as path from "node:path";
import * as child_process from "node:child_process";

/** @constant {string} */
const includes: string = path.join("/data/data/com.termux/pj/vsacode", "includes");
/** Checks if required File exits
 * @param {string} id - Icon Theme id
 * @param {string} req - Name of required File
 * @returns {boolean}
 */
function reqExists(id: string, req: string) {
    let file;
    let _path: string = path.join(includes, id);
    if ( !(fs.existsSync(_path)) )
        return false;
    file = fs.statSync(_path);
    if ( !(file.isDirectory()) )
        return false;
    let _file = path.join(_path, req);
    if ( !(fs.existsSync(_file)) )
        return false;
    return true;
}

/** Check for required File
 * @param {string} id - Icon Theme id
 * @param {string} req - Name of required File
 * @param {object} fallback - Fallback to default to
 * @returns {string} Path of required File
 */
function check(id: string, req: string, fallback: StringMap): string {
    if (!reqExists(id, req))
        return path.join(fallback[req]);
    return path.join(includes, id, req);
}

/** Link the required files
 * @param {string} from - Origin
 * @param {string} to - Destination
 * @returns {void}
 */
function link(from: string, to: string): void {
    fs.copyFileSync(from, to);
}

/** Include the required files
 * @param {string} id - Icon Theme id
 * @param {object} fallback - Fallback to default to
 * @returns {void}
 */
function include(id: string, fallback: StringMap): void {
    let plugin_json: string = check(id, "plugin.json", fallback);
    let readme_md: string = check(id, "readme.md", fallback);
    let icon_png: string = check(id, "icon.png", fallback);
    link(plugin_json, "plugin.json");
    link(readme_md, "readme.md");
    link(icon_png, "icon.png");
}

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
    icon: string, 
    readme: string, 
    plugin: string
) {
    let owd: string = process.cwd();
    process.chdir(acode);
    
    // open plugin.json
    console.log(`building: ${label}`);
    //sleep(2000);
    let fallback = {
        "plugin.json": plugin,
        "icon.png": icon,
        "readme.md": readme,
    };
    
    
    include(id, fallback);
    // child_process.execSync(`nano ${plugin_json}`, { stdio: 'inherit' });
    // child_process.execSync(`nano ${readme_md}`, { stdio: 'inherit' });
    child_process.execSync(`npm run build-release`, { stdio: 'inherit' });
    child_process.execSync(`npm run clean`, { stdio: 'inherit' });

    let outZip: string = path.join(owd, `${id}.zip`);
    if (fs.existsSync(outZip))
        fs.unlinkSync(outZip);
    fs.renameSync(path.join(acode, "dist.zip"), outZip);
    console.log(`output: ${outZip}\n`);
}