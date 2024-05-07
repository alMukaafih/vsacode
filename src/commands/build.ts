import * as fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url)

async function main(env: any) {
    const contributes = env.packageJson.contributes
    /** Path to acode directory in temp directory
     *  @constant {string}
     */
    env.buildDir = "./build";
    if (!fs.existsSync(env.buildDir))
        fs.mkdirSync(env.buildDir)

    const outDir = process.cwd();
    env.outDir = outDir

    let _engine
    env.runtime = 0
    for (const k in contributes) {
        _engine = env.engines[k]
        if (_engine == undefined)
            continue
        env.engine = _engine.name
        const { default: engine } = await import(`../engines/${_engine.name}.js`);
        // process each contrib
        for (const contrib of contributes[k]) {
            process.chdir(outDir)
            env.contrib = contrib
            engine.main(env);
            env.runtime++
        }
    }
    if (!env.runtime)
        console.error(env.err("could not process file"))
}

export function help(): string {
    return `Convert the plugin at <path>

[b][c:green]Usage:[/0] [c:cyan][b]vsa build[/0] [c:cyan][OPTIONS] <PATH>

[b][c:green]Arguments:[/0]
  [c:cyan]<PATH>

[b][c:green]Options:
      [c:cyan]--single[/0]
          Produce a single output

Run \`[c:cyan][b]vsa help build[/0]\` for more detailed information.
`
}

export function short_help(): string {
    return `[c:green][b]Usage: [c:cyan]vsa build[/0] [c:cyan]<PATH>[/0]
For more information, try '[c:cyan][b]--help[/0]'.
`
}

export default {
    main
}