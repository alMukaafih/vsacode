#!/usr/bin/env node
const child_process = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const toml = require("#toml");

function normalize(config) {
    
}
//child_process.execSync(`npx tsc`, { stdio: 'inherit' });
fs.chmodSync("dist/vsacode.js", 0o775);

let _toml = fs.readFileSync("config.toml");
let __toml = _toml.toString();
let config = toml.parse(__toml);

let newConfig = {
    commands: {},
    contributes: {}
};
let commands = {};
for (let cmd of config.commands) {
    if (cmd.options == undefined) {
        cmd.options = [];
    }
    cmd.options.unshift("main");
    if (cmd.flags == undefined) {
        cmd.flags = [];
    }
    newConfig.commands[cmd.name] = {
        name: cmd.name,
        option: cmd.options,
        flags: cmd.flags,
        alias: cmd.alias,
    };
}
for (let contrib of config.contributes) {
    if (contrib.options == undefined) {
        contrib.options = [];
    }
    contrib.options.unshift("main");
    newConfig.contributes[`${contrib.engine}s`] = {
        engine: contrib.engine,
        options: contrib.options,
        template: contrib.template
    };
}

newConfig.commands.help = {
    name: "help",
    options: ["main"],
    flags: [],
};

for (let k in newConfig.commands) {
    let alias = newConfig.commands[k].alias;
    if (alias && alias in newConfig.commands) {
        newConfig.commands[k] = newConfig.commands[alias];
    }
    newConfig.commands.help.options.push(k);
}
fs.writeFileSync(path.join("dist", "config.toml"), toml.stringify(newConfig));