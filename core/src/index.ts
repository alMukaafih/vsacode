import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { style } from "ziyy";

const toml = require("smol-toml");

// eslint-disable-next-line no-var
var __root = path.resolve(path.dirname(__dirname), "..");

enum ArgType {
    Flag, Param
}

function exists(dir: string): boolean {
    return fs.existsSync(path.join(__root, dir));
}

function isInternal(): boolean {
    return exists("core") && exists("modules") && exists("runtimes");
}

function normalizeArgs(args0: string[]): string[] {
    let args: string[] = [];
    for (let i = 0; i < args0.length; i++) {
        let arg = args0[i];
        if (arg.startsWith("-")) {
            if (arg[1] != "-") {
                arg.slice(1)
                    .split("")
                    .map((v) => {
                        args.push(`-${v}`);
                    });
            } else {
                args.push(arg);
                continue;
            }
        } else {
            args.push(arg);
        }
    }

    return args;
}

function parseArgs(args0: string[]): [Vsa.Arg[], boolean] {
    args0 = normalizeArgs(args0);
    let args: Vsa.Arg[] = [];
    let isDebug = false;
    for (let i = 0; i < args0.length; i++) {
        let arg = args0[i];
        if (!isDebug && arg == "--debug") {
            isDebug = true
        } else if (arg.startsWith("--")) {
            let value: string | undefined;
            if (!args0[i + 1]?.startsWith("-")) {
                value = args0[i + 1]
                i++
            }
            args.push({
                type: ArgType.Flag,
                key: arg.slice(2),
                value
            })
        } else if (arg.startsWith("-")) {
            let value: string | undefined;
            if (!args0[i + 1]?.startsWith("-")) {
                value = args0[i + 1]
                i++
            }
            args.push({
                type: ArgType.Flag,
                key: arg.slice(1),
                value
            })
        } else {
            args.push({
                type: ArgType.Param,
                key: arg
            })
        }
    }

    return [args, isDebug];
}

export function init(args0: string[]) {
    if (args0.length < 1) process.exit();

    if (args0[0].startsWith("-")) {
        process.exit();
    }

    let env: Vsa.Env = {
        home: path.dirname(__dirname),
        isDebug: false,
        args: []
    };

    let _toml = fs
        .readFileSync(path.join(__dirname, "../config.toml"))
        .toString();
    let config = toml.parse(_toml) as Config;

    let cmd = args0[0];

    let mod: Config["modules"][0];
    if (cmd in config.modules) {
        mod = config.modules[cmd];
    } else if (cmd in config.aliases.modules) {
        let c = config.aliases.modules[cmd];
        mod = config.modules[c];
    } else {
        console.log(`Unknown Command: ${cmd}`);
        process.exit(1);
    }

    if (mod.attributes.internal && !isInternal()) {
        process.exit(1);
    }

    let [args, isDebug]= parseArgs(args0.slice(1));
    env.args = args;
    env.isDebug = isDebug;

    let tmpDir: string;
    if (mod.attributes.tmpDir) {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vsa-"));
        env.tmpDir = tmpDir;
    }
    // cleanup task
    if (mod.attributes.tmpDir && !isDebug) {
        process.on("exit", () => {
            fs.rmSync(tmpDir, { recursive: true });
        });
    }

    if (isDebug) {
        console.log("env", env);
    }

    let module: Vsa.Module = require(mod.import);
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
