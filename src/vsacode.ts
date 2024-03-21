#!/usr/bin/env node
/**
 * @file The entry point of the program
 * @name vsacode
 * @author alMukaafih <alMukaafih@example.com>
 * @license MIT
 * @requires node:fs
 * @requires node:os
 * @requires node:path
 * @requires adm-zip
 * @requires js-toml
 */
import { IconfigToml } from "./typings/configToml.js";
// imports
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import * as Zip from "adm-zip";
import * as toml from "#toml";
import { style, template } from "ziyy";
import * as help from "./commands/help.js";

interface Env {
    [name: string]: any
}

let err = template("[b][c:red]error[c:white]: [/0]")
let env: Env = {
    err: err,
    home: __dirname
}

/** Temporary directory prefix
 * @constant {string}
 * @default
 */
const appPrefix: string = "vsa-";

/** Temporary directory fullpath
 * @constant {string}
 */
const tmpDir: string = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));
env.tmpDir = tmpDir

// cleanup task
process.on("exit", (code) => {
    //console.log("Exiting vsacode.js process with code:", code);
        //console.log(usage);
    fs.rmSync(tmpDir, { recursive: true });
});

// cli arguments
let args: string[] = process.argv.slice(2);
if (args.length == 0) {
    help.main();
}
let flags: string[] = [];
for (let arg of args) {
    if (arg.startsWith("-")) {
        var i = args.indexOf(arg);
        args.splice(i, 1);
        flags.push(arg);
    }
}
// process flags
for (let flag of flags) {
    if (flag == "--version" || flag == "-V") {
        let _json = fs.readFileSync(path.join(__dirname, "package.json"));
        let __json = _json.toString();
        __json = __json.replace(/\s\/\/(.)+/g, "");
        let packageJson = JSON.parse(__json);
        process.stdout.write(`vsa ${packageJson.version}\n`)
        process.exit(0)
    }
    if (flag == "--help" || flag == "-h") {
        args.unshift("help")
    }
}

// load and parse toml file
let _toml: Buffer = fs.readFileSync(path.join(__dirname, "config.toml"));
let __toml: string = _toml.toString();
let config: IconfigToml = toml.parse(__toml);
//console.log(toml.stringify(config));
let commands = config.commands;
env.engines = config.engines;

let cmd: string = args[0]
let command = commands[cmd];
args.shift();
if (command == undefined) {
    console.error(err(`no such command: \`${cmd}\`\n`));
    process.exit(1);
    //help.main();
}
let subcommand: string = args[0];
if (command.name == "help") {
    if (command.subcommands.includes(subcommand)) {
        help[commands[subcommand].name]();
    }
}
let usage = help[command.name];
let short_usage = help[`short_${command.name}`];
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
/** New Zip Instance
 * @constant {object}
 */
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
    let _json: Buffer = fs.readFileSync(path.join(env.tmpDir, "extension", "package.json"));
    let __json: string = _json.toString();
    __json = __json.replace(/\s\/\/(.)+/g, "");
    // package.json file object
    let packageJson = JSON.parse(__json);
    env.packageJson = packageJson
}
const exec = require(`./commands/${command.name}.js`)
exec[subcommand](env)