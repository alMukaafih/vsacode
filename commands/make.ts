import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { StringMap } from "../typings/map.js"

export function main(env: any) {
    let contributes = env.packageJson.contributes
    /** Path to acode directory in temp directory
     *  @constant {string}
     */
    env.buildDir = "./build";
    if (!fs.existsSync(env.buildDir))
        fs.mkdirSync(env.buildDir)

    let outDir = process.cwd();
    env.outDir = outDir
    
    let engine
    let contribute
    let runs = 0
    for (let k in contributes) {
        contribute = env.contributes[k]
        if (contribute == undefined)
            continue
        engine = require(`../engines/${contribute.engine}.js`);

        // process each contrib
        for (let contrib of contributes[k]) {
            process.chdir(outDir)
            env.contrib = contrib
            engine.main(env);
        }
    runs++
    }
    if (!runs)
        console.log("could not process file")
}