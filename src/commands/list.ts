import { style } from "ziyy"

async function main(env) {
    const contributes = env.packageJson.contributes
    let _engine
    let formatted = ""
    env.runtime = 0
    for (const k in contributes) {
        _engine = env.engines[k]
        if (_engine == undefined)
            continue
        env.engine = _engine.name
        const { default: engine } = await import(`../engines/${_engine.name}.js`);
        // process each contrib
        for (const contrib of contributes[k]) {
            env.contrib = contrib
            formatted += engine.fmt(env);
            env.runtime++
        }
    }
    if (!env.runtime) {
        console.error(env.err("could not process file"))
        process.exit(1)
    }
    process.stdout.write(style(formatted))
}

function help(): string {
    return `List convertibles in plugin at <path>

[b][c:green]Usage:[/0] [c:cyan][b]vsa list[/0] [c:cyan][OPTIONS] <PATH>

[b][c:green]Arguments:[/0]
  [c:cyan]<PATH>

[b][c:green]Options:
  [c:cyan]-h[c:white][/0], [c:cyan][b]--help[/0]
          Print help

Run \`[c:cyan][b]vsa help list[/0]\` for more detailed information.
`
}

function short_help(): string {
    return `[c:green][b]Usage: [c:cyan]vsa list[/0] [c:cyan]<PATH>[/0]
For more information, try '[c:cyan][b]--help[/0]'.
`
}

export default {
    main, help, short_help
}