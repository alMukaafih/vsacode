#!/usr/bin/env node
const child_process = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const toml = require("#toml");

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
            subcommands: cmd.subcommands,
            options: cmd.options,
            alias: cmd.alias,
        };
    }
    for (let contrib of config.engines) {
        if (contrib.modes == undefined) {
            contrib.modes = [];
        }
        contrib.modes.unshift("main");
        newConfig.engines[`${contrib.name}s`] = {
            name: contrib.name,
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

child_process.execSync(`npx tsc`, { stdio: 'inherit' });
fs.chmodSync("dist/vsacode.js", 0o775);

let _toml = fs.readFileSync("config.toml");
let __toml = _toml.toString();
let config = toml.parse(__toml);

let newConfig = normalize(config);

fs.writeFileSync(path.join("dist", "config.toml"), toml.stringify(newConfig));
