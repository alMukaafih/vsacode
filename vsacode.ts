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
import { style, Template } from "ziyy";

module.paths = [
    path.join(module.path, "lib"),
    path.join(module.path, "engines"),
    path.join(module.path, "node_modules"),
];
import * as Zip from "adm-zip";
import * as toml from "#toml";


/** Temporary directory prefix
 * @constant {string}
 * @default
 */
const appPrefix: string = "vsacode-";

/** Temporary directory fullpath
 * @constant {string}
 */
const tmpDir: string = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));

// cleanup task
process.on("exit", (code) => {
    //console.log("Exiting vsacode.js process with code:", code);
        //console.log(usage);
    fs.rmSync(tmpDir, { recursive: true });
});

// cli arguments
let args: string[] = process.argv.slice(2);
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
        process.stdout.write(`${packageJson.name} ${packageJson.version}\n`)
        process.exit(0)
    }
    if (flag == "--help" || flag == "-h") {
        args.unshift("help")
    }
}

// load and parse toml file
let _toml: Buffer = fs.readFileSync(path.join(__dirname, "config.toml"));
let __toml: string = _toml.toString();
let config: IconfigToml = toml.decode(__toml);
let commands = config.commands;
const help = require("help");
if (commands == undefined)
    process.exit(1);
let cmd: string = args[0]
let command = commands[cmd];
let usage = help[cmd];
args.shift();
if (command == undefined) {
    console.log(style("[b][c:red]Error: valid command is required\n"));
    help["main"]();
}
let option: string = args[0];
if (!command.options.includes(option))
    option = "main";
else
    args.shift();
if (command.engine == undefined) {
    process.exit(1);
}
const engine = require(command.engine);
if (cmd == "help")
    engine[option](1);

// vsix file
/** @constant {string} */
const vsix: string = args[0];
if (vsix == undefined) {
    console.log("Error: filename is required\n");
    usage(1);
}
/** New Zip Instance
 * @constant {object}
 */
try {
    const zip = new Zip(vsix);
    zip.extractAllTo(tmpDir);
}
catch(error) {
    //console.log(error);
    console.log(`Error: ${vsix} is not a valid vsix file\n`);
    usage(1);
}
/** Path to acode directory in temp directory
 *  @constant {string}
 */
const _acode: string = "./build";
if (!fs.existsSync(_acode))
    fs.mkdirSync(_acode)

let outDir: string = process.cwd();
// read extension/package.json file
let _json: Buffer = fs.readFileSync(path.join(tmpDir, "extension", "package.json"));
let __json: string = _json.toString();
__json = __json.replace(/\s\/\/(.)+/g, "");
let packageJson = JSON.parse(__json);
let author = packageJson.author;
let version: string = packageJson.version;

let contributes = packageJson.contributes[command.contrib];
if (contributes == undefined) {
    console.log(`Error: ${vsix} ${command.errorMessage}\n`);
    usage(1);
}

// process each contrib
let acode: string;
for (let contrib of contributes) {
    process.chdir(outDir)
    acode = path.resolve(_acode, contrib.id)
    if (!fs.existsSync(acode))
        fs.cpSync(path.join(__dirname, "source"), acode, { recursive: true });
    if (fs.existsSync(path.join(acode, "dist"))) 
        fs.rmSync(path.join(acode, "dist"), { recursive: true });
    engine.packageJson = packageJson;
    engine.id = contrib.id;
    engine.label = contrib.label;
    engine.path = contrib.path;
    engine.acode = acode;
    engine.tmpDir = tmpDir;
    engine.pwFile = path.join(engine.tmpDir, "extension", engine.path);
    engine.outDir = outDir;
    engine[option]();
}
