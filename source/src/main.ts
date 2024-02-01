import { folders } from './styles';
import { files } from './styles';
import plugin from "../plugin.json";
//import ext from './icons.json';
import tag from "html-tag-js";
//const zip = require("./icons/zip.svg");
//const python = require("./icons/python.svg");

// acode
const helpers = acode.require('helpers');

//let file_ext: Ext = ext
//const file_ext: Ext = {};

function get_type_file(filename: string): string {
    let nam = filename.replace("-", "_")
    let names = nam.split('.');
    let li = [];
    while (names.length > 0) {
        li.push(names.join("_"));
        names.shift();
}
        li.reverse();
        let _icon="";
    for (let i of li)
        _icon = _icon + "file_type_" + i.toLowerCase() + " ";
    
    return _icon;
    
}

helpers.getIconForFile = filename => {
    const {
    getModeForPath
    } = ace.require('ace/ext/modelist');

    const type = get_type_file(filename);
    const {
    name
    } = getModeForPath(filename);

    const icon_mode = `file_type_${name}`;

      return `icon file file_type_default ${icon_mode} ${type}`;
};

class IconAcode {
    // Style Element
    //private style!: HTMLStyleElement;
    // Base url
    public baseUrl: string | undefined;
    // Plugin initialization
    public async init(): Promise<void> {
    // Creating new style Element
    //this.style = tag("style", {
    //    textContent: style,
    //});
    // Appending style element with head
    document.head.insertAdjacentHTML("beforeend",`<style id=${plugin.id}>\n${folders}\n</style>`);
    document.head.insertAdjacentHTML("beforeend",`<style id=${plugin.id}>\n${files}\n</style>`);
    }

    public async destroy(): Promise<void> {
    //
    }
}

if (window.acode) {
    const acodePlugin = new IconAcode();
    acode.setPluginInit(
    plugin.id,
    async (
        baseUrl: string,
        $page: WCPage,
        { cacheFileUrl, cacheFile }: any
    ) => {
        if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
        }
        acodePlugin.baseUrl = baseUrl;
        await acodePlugin.init();
    }
    );
    acode.setPluginUnmount(plugin.id, () => {
    acodePlugin.destroy();
    });
}
