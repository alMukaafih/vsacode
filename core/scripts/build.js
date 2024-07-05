#!/usr/bin/env node
import * as child_process from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as toml from "smol-toml";

function normalize(config) {
    let newConfig = {
        commands: {},
        engines: {}
    };
    for (let cmd of config.commands) {
        if (cmd.subcommands == undefined) {
            cmd.subcommands = [];
        }
        cmd.subcommands.unshift("main");
        if (cmd.options == undefined) {
            cmd.options = [];
        }
        newConfig.commands[cmd.name] = {
            name: cmd.name,
            path: `./commands/${cmd.name}.js`,
            subcommands: cmd.subcommands,
            options: cmd.options,
            vsix: cmd.vsix,
            alias: cmd.alias,
        };
    }
    for (let contrib of config.engines) {
        if (contrib.modes == undefined) {
            contrib.modes = [];
        }
        contrib.modes.unshift("main");
        newConfig.engines[`${contrib.contrib}`] = {
            name: contrib.name,
            path: `./engines/${contrib.name}.js`,
            modes: contrib.modes,
            template: contrib.template
        };
    }

    newConfig.commands.help = {
        name: "help",
        subcommands: ["main"],
        options: [],
    };

    for (let k in newConfig.commands) {
        let alias = newConfig.commands[k].alias;
        if (alias && alias in newConfig.commands) {
            newConfig.commands[k] = newConfig.commands[alias];
        }
        newConfig.commands.help.subcommands.push(k);
    }
    return newConfig;
}

try {
    child_process.execSync(`yarn run -T tsc`, { stdio: 'inherit' });
} catch {}

fs.chmodSync("dist/bin/vsacode.js", 0o775);

let _toml = fs.readFileSync("config.toml");
let __toml = _toml.toString();
let config = toml.parse(__toml);

let newConfig = normalize(config);

let _json = fs.readFileSync("package.json");
let __json = _json.toString();
__json = __json.replace(/\s\/\/(.)+/g, "");
let packageJson = JSON.parse(__json);
newConfig.version = packageJson.version;

fs.writeFileSync(path.join("dist", "config.toml"), toml.stringify(newConfig));
fs.writeFileSync(path.join("dist", "config.json"), JSON.stringify(newConfig, undefined, 2));
