import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { style } from "ziyy";

const toml = require("smol-toml");

export function init(args0: string[]) {
    if (args0.length < 1)
        process.exit()

    if (args0[0].startsWith("-")) {
        process.exit();
    }

    let env: Vsa.Env = {
        currentDir: process.cwd(),
        home: path.dirname(__dirname),
    };

    let _toml = fs
        .readFileSync(path.join(__dirname, "../config.toml"))
        .toString();
    let config = toml.parse(_toml) as Config;

    let cmd = args0[0];

    let _module: Config["modules"][0];
    if (cmd in config.modules) {
        _module = config.modules[cmd];
    } else if (cmd in config.aliases.modules) {
        let c = config.aliases.modules[cmd];
        _module = config.modules[c];
    }
    else {
        console.log(`Unknown Command: ${cmd}`);
        process.exit(1);
    }

    if (_module.attributes.internal && !process.env.VSA__PRIVATE) {
        console.log(style("<c.red>VSA__PRIVATE not set"));
        //process.exit(1)
    } else {
        console.log(style("<c.green>VSA__PRIVATE set"));
    }

    let args: string[] = [];
    let flags: string[] = [];
    if (!_module.attributes.subCmd) {
        for (let i = 1; i < args0.length; i++) {
            let arg = args0[i];
            if (arg.startsWith("-")) {
                flags.push(arg);
                continue;
            }
            args.push(arg);
            }
        env.flags = flags;
    }
    else {
        args = args0.slice(1);
    }

    if (_module.attributes.vsix) {
        if (args.length)
        env.vsixPath = path.resolve(args[0]);
    }

    if (_module.attributes.args)
        env.args = args;

    let tmpDir: string;
    if (_module.attributes.tmpDir) {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vsa-"));
        env.tmpDir = tmpDir;
    }
    // cleanup task
    if (_module.attributes.tmpDir && !args0.includes("--debug")) {
        process.on("exit", () => {
            fs.rmSync(tmpDir, { recursive: true });
        });
    }

    if (args0.includes("--debug")) {
        console.log(env);
    }

    let module: Vsa.Module = require(_module.import);
    let main = new module.Main(env);
    try {
        main.init();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(style(`<c.red>error:</c> ${e.message}`));
        process.exit(1);
    }
}
