"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_json_1 = __importDefault(require("../plugin.json"));
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
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            document.head.insertAdjacentHTML("beforeend", `<link id="${plugin_json_1.default.id}" rel="stylesheet" href="https://localhost/__cdvfile_files-external__/plugins/${plugin_json_1.default.id}/files.css"></link>`);
            document.head.insertAdjacentHTML("beforeend", `<link id="${plugin_json_1.default.id}" rel="stylesheet" href="https://localhost/__cdvfile_files-external__/plugins/${plugin_json_1.default.id}/folders.css"></link>`);
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            let links = document.querySelectorAll(`#${plugin_json_1.default.id}`);
            for (let link of links) {
                link.remove();
            }
        });
    }
}
if (window.acode) {
    const acodePlugin = new IconAcode();
    acode.setPluginInit(plugin_json_1.default.id, (baseUrl, $page, { cacheFileUrl, cacheFile }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }
        acodePlugin.baseUrl = baseUrl;
        yield acodePlugin.init();
    }));
    acode.setPluginUnmount(plugin_json_1.default.id, () => {
        acodePlugin.destroy();
    });
}
