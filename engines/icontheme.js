#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("node:fs");
const path = require("node:path");
const libgen_1 = require("../lib/libgen");
const libdist_1 = require("../lib/libdist");
exports.main = () => {
    if (exports.id == undefined && exports.label == undefined && exports.path == undefined)
        return;
    let _json = fs.readFileSync(exports.pwDir);
    let __json = _json.toString();
    __json = __json.replace(/\s\/\/(.)+/g, "");
    let icon_json = JSON.parse(__json);
    let outDir = path.join(exports.acode, "src");
    fs.mkdirSync(outDir, { recursive: true });
    (0, libgen_1.stylesGen)(exports.pwDir, outDir, icon_json);
    (0, libgen_1.pluginJsonGen)(exports.author, exports.id, exports.label, exports.version, exports.tmpDir);
    (0, libdist_1.distBuild)(exports.label, exports.id, exports.acode, exports.icon, exports.readme, exports.plugin);
};
exports.list = () => {
    console.log(`id    => ${exports.id}\n` +
        `label => ${exports.label}\n`);
};
