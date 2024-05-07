#!/usr/bin/env node
/**
 * This is the main file for vsacode
 * @packageDocumentation
 */
import { IconfigToml } from "./typings/configToml.js";
// imports
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import * as Zip from "adm-zip";
import * as toml from "#toml";
import { template } from "ziyy";
import * as help from "./commands/help.js";

type Env = Record<string, any>;

const err = template("[b][c:red]error[c:white]: [/0]")
const env: Env = {
    err: err,
    home: path.dirname(__dirname)
}

/** Temporary directory prefix
 * @constant {string}
 * @default
 */
const appPrefix = "vsa-";

/** Temporary directory fullpath
 * @constant {string}
 */
const tmpDir: string = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));
env.tmpDir = tmpDir

// cleanup task
process.on("exit", () => {
    //console.log("Exiting vsacode.js process with code:", code);
        //console.log(usage);
    fs.rmSync(tmpDir, { recursive: true });
});

// cli arguments
const args: string[] = process.argv.slice(2);
if (args.length == 0) {
    help.main();
}

// load and parse toml file
const _toml: Buffer = fs.readFileSync(path.join(__dirname, "config.toml"));
const __toml: string = _toml.toString();
const config: IconfigToml = toml.parse(__toml);

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


//console.log(toml.stringify(config));
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
        help[commands[subcommand].name]();
    }
}
const usage = help[command.name];
const short_usage = help[`short_${command.name}`];
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
        const zip = new Zip(env.vsix);
        zip.extractAllTo(env.tmpDir);
    }
    catch(error) {
        //console.log(error);
        console.log(err(`${env.vsix} is not a valid VS Code plugin\n`));
        usage(1);
    }
    // read extension/package.json file
    const _json: Buffer = fs.readFileSync(path.join(env.tmpDir, "extension", "package.json"));
    let __json: string = _json.toString();
    __json = __json.replace(/\s\/\/(.)+/g, "");
    // package.json file object
    const packageJson = JSON.parse(__json);
    env.packageJson = packageJson
}
const exec = require(`./commands/${command.name}.js`)
exec[subcommand](env)