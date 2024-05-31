const helpers = acode.require('helpers');

function encode(text: string): string {
    const match: RegExpMatchArray | null = text.match(/[^a-zA-Z0-9_\.-]/g);
    if (match == null)
        return text
    let pattern: RegExp;
    let u: string = "u";
    let encoded: string;
    let unicode: string;
    for (const char of match) {
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
    const names = nam.split('.');
    const li = [];
    while (names.length > 0) {
        li.push(names.join("0x2e"));
        names.shift();
    }
    li.reverse();
    let _icon="";
    for (const i of li)
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

let contribution = {
    name: "{{ pluginName }}",
    activate: () => {
        // Appending style element with head
        document.head.insertAdjacentHTML("beforeend",`{% for css in cssList %}<link id="{{ pluginId }}" rel="stylesheet" href="https://localhost/__cdvfile_files-external__/plugins/{{ pluginId }}/{{ css }}"></link>{% endfor %}`)
    },
    deactivate: () => {
        const links = document.querySelectorAll("{{ pluginId }}")
        for (const link of links) {
            link.remove();
        }
    }
}

class IconAcode {
    // Base url
    public baseUrl: string | undefined;
    // Plugin initialization
    public async init(): Promise<void> {
        if (typeof window.vsacode == "undefined") {
            contribution.activate()
            acode.define("iconThemes", {
                "{{ pluginId }}": contribution
            })
            window.vsacode = {
                activeIconTheme: "{{ pluginId }}",
                activeProductIconTheme: "none"
            }
        }
        else if (typeof window.vsacode != "undefined") {
            let iconThemes = acode.require("iconThemes")
            iconThemes["{{ pluginId }}"] = contribution
        }
    }
    public async destroy(): Promise<void> {
        contribution.deactivate()
    }
}

if (typeof window.acode != "undefined") {
    const acodePlugin = new IconAcode();
    acode.setPluginInit(
        "{{ pluginId }}",
        async (
            baseUrl: string,
            $page: AcodeApi.WCPage,
            { cacheFileUrl, cacheFile }: any
        ) => {
            if (!baseUrl.endsWith("/")) {
                baseUrl += "/";
            }
            acodePlugin.baseUrl = baseUrl;
            await acodePlugin.init();
        }
    );
    acode.setPluginUnmount("{{ pluginId }}", () => {
        acodePlugin.destroy();
    });
}
