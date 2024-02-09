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

module.paths = [
    path.join(module.path, "lib"),
    path.join(module.path, "engines"),
    path.join(module.path, "node_modules")
];
import * as AdmZip from "adm-zip";
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
    //fs.rmSync(tmpDir, { recursive: true });
});

const usage = () => {
    process.stdout.write(`vsa command is used to convert a vs code plugin to acode plugin

Usage: vsa <command> [option] <filename>

  parameters:
    command     name of command you want to run.
    command      command of the command.
    filename    vs code plugin (vsix file)

  commands:
    
    icon        convert a file icon theme.
  icon options:
    main        the default option. this is the same as running without an option. convert the plugin.
    list        list the available file icon themes in the plugin.
`);
};

// cli arguments
let args: string[] = process.argv.slice(2);

// load and parse toml file
let _toml: Buffer = fs.readFileSync(path.join(__dirname, "config.toml"));
let __toml: string = _toml.toString();
let config: IconfigToml = toml.decode(__toml);
let commands = config.commands;
if (commands == undefined)
    process.exit(1);
let command = commands[args[0]];
args.shift();
if (command == undefined) {
    console.log("Error: valid command is required\n");
    usage();
    process.exit(1);
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

// vsix file
/** @constant {string} */
const vsix: string = args[0];
if (vsix == undefined) {
    console.log("Error: filename is required\n");
    usage();
    process.exit(1);
}
/** New AdmZip Instance
 * @constant {object}
 */
try {
    const zip = new AdmZip(vsix);
    zip.extractAllTo(tmpDir);
}
catch(error) {
    //console.log(error);
    console.log(`Error: ${vsix} is not a valid vsix file\n`);
    usage();
    process.exit(1);
}
/** Path to acode directory in temp directory
 *  @constant {string}
 */
const acode: string = path.join(tmpDir, "acode");
fs.symlinkSync(path.join(__dirname, "source"), acode);

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
    usage();
    process.exit(1);
}

// process each contrib
for (let contrib of contributes) {
    engine.packageJson = packageJson;
    engine.id = contrib.id;
    engine.label = contrib.label;
    engine.path = contrib.path;
    engine.acode = acode;
    engine.tmpDir = tmpDir;
    engine.pwDir = path.join(engine.tmpDir, "extension", engine.path);
    engine.outDir = outDir;
    engine[option]();
}
