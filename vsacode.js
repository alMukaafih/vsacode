#!/usr/bin/env node
/**
 * @file The entry point of the program
 * @name vsacode
 * @author alMukaafih <alMukaafih@example.com>
 * @license MIT
 * @requires node:fs
 * @requires node:os
 * @requires node:path
 * @requires AdmZip
 * @requires libgen
 * @requires libdist
 */
module.paths = ["./lib", "./engines", "./node_modules"];
// imports
const fs = require("fs");
const os = require("os");
const path = require("path");
const AdmZip = require("adm-zip");

const toml = require("js-toml");

/** Temporary directory prefix
 * @constant {string}
 * @default
 */
const appPrefix = "vsacode-";

/** Temporary directory fullpath
 * @constant {string}
 */
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));

// cleanup task
process.on("exit", (code) => {
    console.log("Exiting vsacode.js process with code:", code);
    fs.rmSync(tmpDir, { recursive: true });
});

// cli arguments
let args = process.argv.slice(2);

// load and parse toml file
let _toml = fs.readFileSync(path.join(__dirname, "config.toml"));
let __toml = _toml.toString();
let config = toml.load(__toml);
let options = config.options;
if (options == undefined)
    process.exit(1);
let option = options[args[0]];
args.shift();
if (option == undefined)
    process.exit(1);
let opt = args[0];
if (!option.routines.includes(opt))
    opt = "main";
else
    args.shift();
if (option.engine == undefined)
    process.exit(1);
const engine = require(option.engine);

// vsix file
/** @constant {string} */
const vsix = args[0];
if (vsix == undefined)
    process.exit(1);

/** New AdmZip Instance
 * @constant {object}
 */
const zip = new AdmZip(vsix);
zip.extractAllTo(tmpDir);

/** Path to acode directory in temp directory
 *  @constant {string}
 */
const acode = path.join(tmpDir, "acode");
fs.symlinkSync(__dirname, acode);


// read extension/package.json file
let _json = fs.readFileSync(path.join(tmpDir, "extension", "package.json"));
let __json = _json.toString();
__json = __json.replace(/\s\/\/(.)+/g, "");
let package_json = JSON.parse(__json);
let version = package_json.version;
let contributes = package_json.contributes[option.contrib];
if (contributes == undefined)
    process.exit(1);

// process each icon Theme
for (let contrib of contributes) {
    engine._id = contrib.id;
    engine._label = contrib.label;
    engine._path = contrib.path;
    engine.acode = acode;
    engine.tmpDir = tmpDir;
    engine.pwDir = path.join(engine.tmpDir, "extension", engine._path);
    routine = engine[opt];
    engine[opt]();
}
