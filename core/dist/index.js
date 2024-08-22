"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const node_fs_1 = __importDefault(require("node:fs"));
const ziyy_1 = require("ziyy");
const toml = require("smol-toml");
// eslint-disable-next-line no-var
var __root = node_path_1.default.resolve(node_path_1.default.dirname(__dirname), "..");
var ArgType;
(function (ArgType) {
    ArgType[ArgType["Flag"] = 0] = "Flag";
    ArgType[ArgType["Param"] = 1] = "Param";
})(ArgType || (ArgType = {}));
function exists(dir) {
    return node_fs_1.default.existsSync(node_path_1.default.join(__root, dir));
}
function isInternal() {
    return exists("core") && exists("modules") && exists("runtimes");
}
function normalizeArgs(args0) {
    let args = [];
    for (let i = 0; i < args0.length; i++) {
        let arg = args0[i];
        if (arg.startsWith("-")) {
            if (arg[1] != "-") {
                arg.slice(1)
                    .split("")
                    .map((v) => {
                    args.push(`-${v}`);
                });
            }
            else {
                args.push(arg);
                continue;
            }
        }
        else {
            args.push(arg);
        }
    }
    return args;
}
function parseArgs(args0) {
    args0 = normalizeArgs(args0);
    let args = [];
    let isDebug = false;
    for (let i = 0; i < args0.length; i++) {
        let arg = args0[i];
        if (!isDebug && arg == "--debug") {
            isDebug = true;
        }
        else if (arg.startsWith("--")) {
            let value;
            if (!args0[i + 1]?.startsWith("-")) {
                value = args0[i + 1];
                i++;
            }
            args.push({
                type: ArgType.Flag,
                key: arg.slice(2),
                value
            });
        }
        else if (arg.startsWith("-")) {
            let value;
            if (!args0[i + 1]?.startsWith("-")) {
                value = args0[i + 1];
                i++;
            }
            args.push({
                type: ArgType.Flag,
                key: arg.slice(1),
                value
            });
        }
        else {
            args.push({
                type: ArgType.Param,
                key: arg
            });
        }
    }
    return [args, isDebug];
}
function init(args0) {
    if (args0.length < 1)
        process.exit();
    if (args0[0].startsWith("-")) {
        process.exit();
    }
    let env = {
        home: node_path_1.default.dirname(__dirname),
        isDebug: false,
        args: []
    };
    let _toml = node_fs_1.default
        .readFileSync(node_path_1.default.join(__dirname, "../config.toml"))
        .toString();
    let config = toml.parse(_toml);
    let cmd = args0[0];
    let mod;
    if (cmd in config.modules) {
        mod = config.modules[cmd];
    }
    else if (cmd in config.aliases.modules) {
        let c = config.aliases.modules[cmd];
        mod = config.modules[c];
    }
    else {
        console.log(`Unknown Command: ${cmd}`);
        process.exit(1);
    }
    if (mod.attributes.internal && !isInternal()) {
        process.exit(1);
    }
    let [args, isDebug] = parseArgs(args0.slice(1));
    env.args = args;
    env.isDebug = isDebug;
    let tmpDir;
    if (mod.attributes.tmpDir) {
        tmpDir = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), "vsa-"));
        env.tmpDir = tmpDir;
    }
    // cleanup task
    if (mod.attributes.tmpDir && !isDebug) {
        process.on("exit", () => {
            node_fs_1.default.rmSync(tmpDir, { recursive: true });
        });
    }
    if (isDebug) {
        console.log("env", env);
    }
    let module = require(mod.import);
    let main = new module.Main(env);
    try {
        main.init();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (e) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log((0, ziyy_1.style)(`<c.red>error:</c> ${e.message}`));
        process.exit(1);
    }
}
exports.init = init;
