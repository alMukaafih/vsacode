import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { StringMap } from "../typings/map.js"

export function main(env: any) {
    let contributes = env.contributes

    /** Path to acode directory in temp directory
     *  @constant {string}
     */
    const _acode: string = "./build";
    if (!fs.existsSync(_acode))
        fs.mkdirSync(_acode)

    let outDir: string = process.cwd();
    
    let engine
    let contribute
    let runs = 0
    for (let [k, v] of Object.entries(env.packageJson.contributes)) {
        contribute = contributes[k]
        if (contribute == undefined)
            continue
        engine = require(`../engines/${contribute.engine}.js`);

        // process each contrib
        let acode: string;
        for (let contrib of v) {
            process.chdir(outDir)
            acode = path.resolve(_acode, contrib.id)
            if (!fs.existsSync(acode))
                fs.cpSync(path.join(__dirname, "source"), acode, { recursive: true });
            if (fs.existsSync(path.join(acode, "dist"))) 
                fs.rmSync(path.join(acode, "dist"), { recursive: true });
            env.id = contrib.id;
            env.label = contrib.label;
            env.path = contrib.path;
            env.acode = acode;
            env.pwFile = path.join(env.tmpDir, "extension", env.path);
            env.outDir = outDir;
            engine.main(env);
        }
    runs++
    }
    if (!runs)
        console.log("could not process file")
}