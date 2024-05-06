"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_json_1 = require("../plugin.json");
const helpers = acode.require('helpers');
function encode(text) {
    let match = text.match(/[^a-zA-Z0-9_\.-]/g);
    if (match == null)
        return text;
    let pattern;
    let u = "u";
    let encoded;
    let unicode;
    for (let char of match) {
        encoded = char.charCodeAt(0).toString(16);
        unicode = `\\u{${encoded}}`;
        if (encoded.length == 4) {
            unicode = "\\u" + encoded;
            u = "";
        }
        pattern = new RegExp(unicode, `g${u}`);
        text = text.replace(pattern, `0x${encoded}`);
    }
    return text;
}
function get_type_file(filename) {
    let nam = encode(filename);
    nam = "f_" + nam;
    let names = nam.split('.');
    let li = [];
    while (names.length > 0) {
        li.push(names.join("0x2e"));
        names.shift();
    }
    li.reverse();
    let _icon = "";
    for (let i of li)
        _icon = _icon + "file_type_" + i.toLowerCase() + " ";
    return _icon;
}
helpers.getIconForFile = filename => {
    const { getModeForPath } = ace.require('ace/ext/modelist');
    const type = get_type_file(filename);
    const { name } = getModeForPath(filename);
    const icon_mode = `file_type_${name}`;
    return `file file_type_default ${icon_mode} ${type}`;
};
class IconAcode {
    baseUrl;
    async init() {
        document.head.insertAdjacentHTML("beforeend", `<link id="${plugin_json_1.default.id}" rel="stylesheet" href="https://localhost/__cdvfile_files-external__/plugins/${plugin_json_1.default.id}/files.css"></link>`);
        document.head.insertAdjacentHTML("beforeend", `<link id="${plugin_json_1.default.id}" rel="stylesheet" href="https://localhost/__cdvfile_files-external__/plugins/${plugin_json_1.default.id}/folders.css"></link>`);
    }
    async destroy() {
        let links = document.querySelectorAll(`#${plugin_json_1.default.id}`);
        for (let link of links) {
            link.remove();
        }
    }
}
if (window.acode) {
    const acodePlugin = new IconAcode();
    acode.setPluginInit(plugin_json_1.default.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }
        acodePlugin.baseUrl = baseUrl;
        await acodePlugin.init();
    });
    acode.setPluginUnmount(plugin_json_1.default.id, () => {
        acodePlugin.destroy();
    });
}
