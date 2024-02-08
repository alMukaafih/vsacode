import plugin from "../plugin.json";

// acode
const helpers = acode.require('helpers');

//let file_ext: Ext = ext
//const file_ext: Ext = {};

function encode(text: string): string {
    let match: RegExpMatchArray | null = text.match(/[^a-zA-Z0-9_\.-]/g);
    if (match == null)
        return text
    let pattern: RegExp;
    let u: string = "u";
    let encoded: string;
    let unicode: string;
    for (let char of match) {
        encoded = char.charCodeAt(0).toString(16);
        unicode = `\\u{${encoded}}`;
        if (encoded.length == 4) {
            unicode = "\\u" + encoded;
            u = "";
        }
        pattern = new RegExp(unicode, `g${u}`);
        text = text.replace(pattern, `0x${encoded}`)
    }
    return text
}

function get_type_file(filename: string): string {
    let nam = encode(filename);
    nam = "f_" + nam;
    let names = nam.split('.');
    let li = [];
    while (names.length > 0) {
        li.push(names.join("0x2e"));
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

      return `file file_type_default ${icon_mode} ${type}`;
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
    document.head.insertAdjacentHTML("beforeend",`<link id="vsacode" rel="stylesheet" href="https://localhost/__cdvfile_files-external__/plugins/${plugin.id}/files.css"></link>`);
    document.head.insertAdjacentHTML("beforeend",`<link id="vsacode" rel="stylesheet" href="https://localhost/__cdvfile_files-external__/plugins/${plugin.id}/folders.css"></link>`);
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
