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
function init(args0) {
    if (args0.length < 1)
        process.exit();
    if (args0[0].startsWith("-")) {
        process.exit();
    }
    let env = {
        currentDir: process.cwd(),
        home: node_path_1.default.dirname(__dirname),
    };
    let _toml = node_fs_1.default
        .readFileSync(node_path_1.default.join(__dirname, "../config.toml"))
        .toString();
    let config = toml.parse(_toml);
    let cmd = args0[0];
    let _module;
    if (cmd in config.modules) {
        _module = config.modules[cmd];
    }
    else if (cmd in config.aliases.modules) {
        let c = config.aliases.modules[cmd];
        _module = config.modules[c];
    }
    else {
        console.log(`Unknown Command: ${cmd}`);
        process.exit(1);
    }
    if (_module.attributes.private && !process.env.VSA__PRIVATE) {
        console.log((0, ziyy_1.style)("<c.red>VSA__PRIVATE not set"));
        //process.exit(1)
    }
    else {
        console.log((0, ziyy_1.style)("<c.green>VSA__PRIVATE set"));
    }
    let args = [];
    let flags = [];
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
            env.vsixPath = node_path_1.default.resolve(args[0]);
    }
    if (_module.attributes.args)
        env.args = args;
    let tmpDir;
    if (_module.attributes.tmpDir) {
        tmpDir = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), "vsa-"));
        env.tmpDir = tmpDir;
    }
    // cleanup task
    if (_module.attributes.tmpDir && !args0.includes("--debug")) {
        process.on("exit", () => {
            node_fs_1.default.rmSync(tmpDir, { recursive: true });
        });
    }
    if (args0.includes("--debug")) {
        console.log(env);
    }
    let module = require(_module.import);
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
