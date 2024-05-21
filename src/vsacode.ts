#!/usr/bin/env node
/**
 * This is the main file for vsacode
 * @packageDocumentation
 */
// imports
import { fs, path, os } from  "./lib/compat.js"

import { unzip } from "./lib/utils.js"
import * as toml from "smol-toml";
import { style, template } from "ziyy";
import help from "./commands/help.js";

const err = template("[b][c:red]error[c:white]: [/0]")

const env: Env = {
    err: err,
    home: path.dirname(import.meta.dirname)
}

/** Temporary directory prefix
 * @constant {string}
 * @default
 */
const appPrefix = "vsa-";

/** Temporary directory fullpath
 * @constant {string}
 */
const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), appPrefix));
env.tmpDir = tmpDir

// cleanup task
process.on("exit", () => {
    //console.log("Exiting vsacode.js process with code:", code);
        //console.log(usage);
    fs.rm(tmpDir, { recursive: true });
});

// cli arguments
const args: string[] = process.argv.slice(2);
if (args.length == 0) {
    help_msg();
}

// load and parse toml file
const _toml: Buffer = await fs.readFile(path.join(import.meta.dirname, "config.toml"));
const __toml: string = _toml.toString();
const _config: any = toml.parse(__toml);
const config: IconfigToml = _config

const flags: string[] = [];
for (const arg of args) {
    if (arg.startsWith("-")) {
        const i = args.indexOf(arg);
        args.splice(i, 1);
        flags.push(arg);
    }
}
// process flags
for (const flag of flags) {
    if (flag == "--version" || flag == "-V") {
        process.stdout.write(`vsa ${config.version}\n`)
        process.exit(0)
    }
    if (flag == "--help" || flag == "-h") {
        args.unshift("help")
    }
}


const commands = config.commands;
env.engines = config.engines;

const cmd: string = args[0]
const command = commands[cmd];
args.shift();
if (command == undefined) {
    console.error(err(`no such command: \`${cmd}\`\n`));
    process.exit(1);
    //help.main();
}

env.cmd = command;
let subcommand: string = args[0];
if (command.name == "help") {
    if (command.subcommands.includes(subcommand)) {
        const command = commands[subcommand]
        env.cmd = command;
        await help.main(env);
        process.exit(0)
    } else {
        help_msg(1)
    }
}
const usage = await help.help(env);
const short_usage = await help.short_help(env);
if (!command.subcommands.includes(subcommand))
    subcommand = "main";
else
    args.shift();

// vsix file
/** @constant {string} */
const vsix: string = args[0];
env.vsix = vsix
if (env.vsix == undefined && command.name != "help") {
    console.log(err("the following required arguments were not provided:\n  [c:cyan][b]<PATH>[/0]\n"));
    short_usage(1);
}
if (command.name != "help") {
    try {
        env.zipData = await fs.readFile(env.vsix)
        await unzip(env)
    }
    catch(error) {
        //console.log(error);
        console.log(err(`${env.vsix} is not a valid VS Code plugin\n`));
        usage(1);
    }
    // read extension/package.json file
    const _json: Buffer = await fs.readFile(path.join(env.tmpDir, "extension", "package.json"));
    let __json: string = _json.toString();
    __json = __json.replace(/\s\/\/(.)+/g, "");
    // package.json file object
    const packageJson = JSON.parse(__json);
    env.packageJson = packageJson
}
const { default: exec } = await import(`./commands/${command.name}.js`)
exec[subcommand](env)

/**
 * Prints help message for vsacode
 * @param err Exit error code
 */
function help_msg(err = 0) {
    process.stdout.write(style(`VS Code plugin to Acode plugin converter

[b][c:green]Usage:[/0] [c:cyan][b]vsa[/0] [c:cyan]\[OPTIONS\] \[COMMAND\]

[b][c:green]Options:
  [c:cyan]-V[c:white][/0], [c:cyan][b]--version[/0]
          Print version info and exit[b]
  [c:cyan]-h[c:white][/0], [c:cyan][b]--help[/0]
          Print help

[b][c:green]Commands:
    [c:cyan]build[/0], [c:cyan][b]b[/0]    Convert the plugin[b]
    [c:cyan]list[/0]        List convertibles in plugin[b]
    [c:cyan]help[/0]        Displays help for a vsa subcommand

See '[c:cyan][b]vsa help[/0] [c:cyan]<command>[/0]' for more information on a specific command.
`));
    process.exit(err);
}