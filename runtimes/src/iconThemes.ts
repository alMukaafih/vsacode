const helpers = acode.require("helpers");

const iconPath = "0";
const fontCharacter = "1";
const fontColor = "2";
const fontSize = "3";
const fontId = "4";

const PLUGIN_URL = "https://localhost/__cdvfile_files-external__/plugins";

interface IdefinitionProperties {
    /** iconPath */
    "0"?: string;
    /** fontCharacter */
    "1"?: string;
    /** fontColor */
    "2"?: string;
    /** fontSize */
    "3"?: string;
    /** fontId */
    "4"?: string;
}

interface IfontProperties {
    id: string;
    src: [
        {
            path: string;
            format: string;
        },
    ];
    weight?: string;
    style?: string;
    size?: string;
}

const iconDefinitions = "0";
const fileExtensions = "1";
const fileNames = "2";

interface IfileIconTheme {
    hidesExplorerArrows: boolean;
    fonts?: [IfontProperties];
    /** iconDefinitions */
    "0": Record<string, IdefinitionProperties>;
    file: string;
    folder?: string;
    folderExpanded?: string;
    folderNames?: Record<string, string>;
    folderNamesExpanded?: Record<string, string>;
    rootFolder?: string;
    rootFolderExpanded?: string;
    rootFolderNames?: Record<string, string>;
    rootFolderNamesExpanded?: Record<string, string>;
    languageIds?: Record<string, string>;

    /** fileExtensions */
    "1"?: Record<string, number>;
    /** fileNames */
    "2"?: Record<string, number>;
    light?: Record<string, any>;
    highContrast?: Record<string, any>;
}

type Def = IdefinitionProperties;

export class Runtime {
    #themes: Record<string, string> = {};
    #stylesheet: CSSStyleSheet;
    #currentTheme: string;
    #theme: IfileIconTheme;
    #id: string;
    #style: HTMLStyleElement;
    #link: HTMLLinkElement;

    async init(id: string, themes: string[][]) {
        // @vsa-debug
        console.log(`${id}:icontheme:init - ${themes}`)
        this.#id = id;
        for (const theme of themes) {
            this.#themes[theme[0]] = theme[0];
        }

        const __theme = this.#themes[this.#currentTheme];
        this.#theme = (await import(`./iconThemes/${__theme}.js`)).content;

        const linkEl = document.createElement("link");
        linkEl.id = id;
        linkEl.href = `${PLUGIN_URL}/${this.#id}/iconThemes/${__theme}.css`;
        linkEl.rel = "stylesheet";
        document.head.appendChild(linkEl);
        // @vsa-debug
        console.log(`${id}:icontheme:append:linkEl - ${linkEl}`)
        this.#link = linkEl;

        const styleEl = document.createElement("style");
        styleEl.id = id;
        document.head.appendChild(styleEl);
        // @vsa-debug
        console.log(`${id}:icontheme:append:styleEl - ${styleEl}`)
        this.#style = styleEl;
        this.#stylesheet = this.#style.sheet;

        const getIconForFile = structuredClone(helpers.getIconForFile);
        helpers.getIconForFile = (filename) => {
            // @vsa-debug
            console.log(`${id}:icontheme:getIconForFile - ${filename}`)
            const names = filename.split(".");
            let full = true;
            while (names.length > 0) {
                const status = this.resolve(names.join("."), full);
                if (status) break;
                names.shift();
                full = false;
            }
            return getIconForFile(filename);
        };
        this.resolveAll();
    }

    resolveAll() {
        let elements = document.querySelectorAll(
            `.list.collapsible>li.tile[data-type="file"]`,
        );
        for (const $el of elements) {
            helpers.getIconForFile($el.getAttribute("data-name"));
        }

        elements = document.querySelectorAll(
            `#file-browser>ul>li.tile[type="file"]`,
        );
        for (const $el of elements) {
            helpers.getIconForFile($el.getAttribute("name"));
        }
    }

    async insertCSS(name: string, def: Def): Promise<void> {
        // @vsa-debug
        console.log(`${this.#id}:icontheme:insertCSS - ${name}, ${def}`)
        let fontChar = def[fontCharacter] ? def[fontCharacter] : "";
        let _fontColor = def[fontColor] ? `color:${def[fontColor]};` : "";
        let _fontId = def[fontId]
            ? `font-family:"${def[fontId]}"!important;`
            : "";
        let _fontSize = def[fontSize] ? `font-size:${def[fontSize]};` : "";
        let _iconPath = def[iconPath]
            ? `background-image:url(${PLUGIN_URL}/${this.#id}/assets/${def[iconPath]});`
            : "";

        const css =
            `*[data-name$="${name}"i][data-type="file"]>.file::before,` +
            `*[name$="${name}"i][type="file"]>.file::before` +
            `{content:"${fontChar}"!important;` +
            _fontColor +
            _fontId +
            _fontSize +
            _iconPath +
            `}`;
        this.#stylesheet.insertRule(css, this.#stylesheet.cssRules.length);
    }

    resolve(ext: string, full: boolean): boolean {
        // @vsa-debug
        console.log(`${this.#id}:resolve - ${ext}, ${full}`)
        let key: number;
        if (full) {
            key = this.#theme[fileNames]
                ? this.#theme[fileNames][ext]
                : undefined;
        } else {
            key = this.#theme[fileExtensions]
                ? this.#theme[fileExtensions][ext]
                : undefined;
        }
        if (typeof key == "undefined") {
            return false;
        }
        let __ext = this.#theme[iconDefinitions][key.toString()];

        this.insertCSS(ext, __ext);
        return true;
    }

    async reload() {
        // @vsa-debug
        console.log(`${this.#id}:reload - {}`)
        this.dispose();

        const __theme = this.#themes[this.#currentTheme];
        this.#theme = (await import(`./iconThemes/${__theme}.js`)).content;
        const styleEl = document.createElement("style");
        styleEl.id = this.#id;
        document.head.appendChild(styleEl);
        // @vsa-debug
        console.log(`${this.#id}:icontheme:append:styleEl - ${styleEl}`)
        this.#style = styleEl;

        const linkEl = document.createElement("link");
        linkEl.id = this.#id;
        linkEl.href = `${PLUGIN_URL}/${this.#id}/iconThemes/${__theme}.css`;
        linkEl.rel = "stylesheet";
        document.head.appendChild(linkEl);
        // @vsa-debug
        console.log(`${this.#id}:icontheme:append:linkEl - ${linkEl}`)
        this.#link = linkEl;

        this.resolveAll();
    }

    dispose() {
        // @vsa-debug
        console.log(`$dispose:icontheme - {}`)
        this.#style.remove();
        this.#link.remove();
    }

    set theme(value: string) {
        if (this.#themes[value]) this.#currentTheme = value;
    }

    get theme(): string {
        return this.#currentTheme;
    }
}

export default {
    Runtime,
};
