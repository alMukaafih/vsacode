import { Disposable } from "./main";
const helpers = acode.require("helpers");
const Url = acode.require("url");

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
const languageIds = "3";

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

    /** fileExtensions */
    "1"?: Record<string, number>;
    /** fileNames */
    "2"?: Record<string, number>;
    /** languageIds */
    "3"?: Record<string, number>;
    light?: Record<string, any>;
    highContrast?: Record<string, any>;
}

type Def = IdefinitionProperties;

function getFileType(filename: string) {
    const regex = {
        babel: /\.babelrc$/i,
        jsmap: /\.js\.map$/i,
        yarn: /^yarn\.lock$/i,
        testjs: /\.test\.js$/i,
        testts: /\.test\.ts$/i,
        cssmap: /\.css\.map$/i,
        typescriptdef: /\.d\.ts$/i,
        clojurescript: /\.cljs$/i,
        cppheader: /\.(hh|hpp)$/i,
        jsconfig: /^jsconfig.json$/i,
        tsconfig: /^tsconfig.json$/i,
        android: /\.(apk|aab|slim)$/i,
        jsbeautify: /^\.jsbeautifyrc$/i,
        webpack: /^webpack\.config\.js$/i,
        audio: /\.(mp3|wav|ogg|flac|aac)$/i,
        git: /(^\.gitignore$)|(^\.gitmodules$)/i,
        video: /\.(mp4|m4a|mov|3gp|wmv|flv|avi)$/i,
        image: /\.(png|jpg|jpeg|gif|bmp|ico|webp)$/i,
        npm: /(^package\.json$)|(^package\-lock\.json$)/i,
        compressed: /\.(zip|rar|7z|tar|gz|gzip|dmg|iso)$/i,
        eslint: /(^\.eslintrc(\.(json5?|ya?ml|toml))?$|eslint\.config\.(c?js|json)$)/i,
        postcssconfig:
            /(^\.postcssrc(\.(json5?|ya?ml|toml))?$|postcss\.config\.(c?js|json)$)/i,
        prettier:
            /(^\.prettierrc(\.(json5?|ya?ml|toml))?$|prettier\.config\.(c?js|json)$)/i,
    };

    const fileType = Object.keys(regex).find((type) =>
        regex[type].test(filename),
    );
    if (fileType) return fileType;

    return Url.extname(filename).substring(1);
}

function getIconForFile(filename) {
    const { getModeForPath } = ace.require("ace/ext/modelist");
    const type = getFileType(filename);
    const { name } = getModeForPath(filename);

    return `file file_type_default file_type_${name} file_type_${type}`;
}

export class Runtime implements Disposable {
    currentTheme: string;
    theme_json: IfileIconTheme;
    id: string;
    fileExts: HTMLStyleElement;
    link: HTMLLinkElement;
    sheet: CSSStyleSheet;
    cache: Map<string, null>;
    fileNames: HTMLStyleElement;
    langIds: HTMLStyleElement;

    set theme(value: string) {
        // @vsa-debug
        console.log(`${this.id}:icontheme.currentTheme - ${value}`);
        this.currentTheme = value;
    }

    get theme(): string {
        return this.currentTheme;
    }

    async init(id: string, theme: string) {
        this.cache = new Map();
        // @vsa-debug
        console.log(`${id}:icontheme:init - ${theme}`);
        this.id = id;

        this.theme = theme;

        /* for (const sheet of document.styleSheets) {
            if (sheet.href == "https://localhost/res/file-icons/style.css") {
                sheet.disabled = true;
                this.sheet = sheet;
            }
        } */

        helpers.getIconForFile = (filename) => {
            const { getModeForPath } = ace.require("ace/ext/modelist");
            const type = getFileType(filename);
            const { name: languageId } = getModeForPath(filename);

            const names = filename.split(".");
            let result: number;
            let resultStr = "";
            let isFull = true;
            while (names.length > 0) {
                result = this.resolve(
                    names.join("."),
                    isFull,
                    type,
                    languageId,
                );

                if (result + 1) {
                    resultStr = ` file_type_${result}`;
                    break;
                }
                names.shift();
                isFull = false;
            }

            return `file file_type_default file_type_${languageId} file_type_${type}${resultStr}`;
        };

        this.load();
    }

    async load() {
        // @vsa-debug
        console.log(`${this.id}:reload`);
        this.reset();

        const linkEl = document.createElement("link");
        linkEl.id = this.id;
        linkEl.href = `${PLUGIN_URL}/${this.id}/0/${this.theme}.css`;
        linkEl.rel = "stylesheet";
        document.head.appendChild(linkEl);
        this.link = linkEl;

        this.theme_json = (await import(`./iconThemes/${this.id}.js`)).content;

        const langIds = document.createElement("style");
        langIds.id = this.id;
        document.head.appendChild(langIds);
        this.langIds = langIds;

        const fileExts = document.createElement("style");
        fileExts.id = this.id;
        document.head.appendChild(fileExts);
        this.fileExts = fileExts;

        const fileNames = document.createElement("style");
        fileNames.id = this.id;
        document.head.appendChild(fileNames);
        this.fileNames = fileNames;

        this.resolveAll();
    }

    resolveAll() {
        let elements = document.querySelectorAll(`li.tile[data-type="file"]`);
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

    resolve(
        name: string,
        isFull: boolean,
        type: string,
        languageId: string,
    ): number {
        let key: number;
        let isLanguageId = false;
        if (isFull) {
            key = this.theme_json[fileNames]
                ? this.theme_json[fileNames][name]
                : undefined;
        } else {
            key = this.theme_json[fileExtensions]
                ? this.theme_json[fileExtensions][name]
                : undefined;
        }

        if (typeof key != "undefined") {
        } else if (
            this.theme_json[languageIds] &&
            this.theme_json[languageIds][languageId]
        ) {
            name = languageId;
            isFull = false;
            isLanguageId = true;
            key = this.theme_json[languageIds][languageId];
        } else {
            return -1;
        }

        let def = this.theme_json[iconDefinitions][key.toString()];

        this.insertCss(name, key.toString(), def, isFull, type, isLanguageId);
        return key;
    }

    async insertCss(
        name: string,
        key: string,
        def: Def,
        isFull: boolean,
        type: string,
        isLanguageId: boolean,
    ): Promise<void> {
        if (this.cache.has(name)) {
            return;
        }

        let content: string;
        if (def[fontCharacter]) {
            content = `content:"${def[fontCharacter]}"!important;`;
        } else if (def[iconPath]) {
            content =
                'content:""!important;' +
                `background-image:url(${PLUGIN_URL}/${this.id}/1/${def[iconPath]});`;
        }

        let _fontColor = def[fontColor] ? `color:${def[fontColor]};` : "";
        let _fontId = def[fontId]
            ? `font-family:"${def[fontId]}"!important;`
            : "";
        let _fontSize = def[fontSize] ? `font-size:${def[fontSize]};` : "";

        let typeStr = type.length != 0 ? `,.file_type_${type}::before` : "";

        let selector: string;
        if (isLanguageId) {
            selector =
                `.file_type_${name}::before,` +
                `.file_type_${key}::before` +
                typeStr;
        } else {
            selector = isFull
                ? `*[data-name="${name}"i][data-type="file"]>.file::before,` +
                  `*[name="${name}"i][type="file"]>.file::before,` +
                  `.file_type_${key}::before` +
                  typeStr
                : `*[data-name$="${name}"i][data-type="file"]>.file::before,` +
                  `*[name$="${name}"i][type="file"]>.file::before,` +
                  `.file_type_${key}::before` +
                  typeStr;
        }

        const css =
            selector + `{` + content + _fontColor + _fontId + _fontSize + `}`;
        // @vsa-debug
        console.log(`${this.id}.icontheme.insertCSS - ${name} - ${css}`);

        if (isFull) {
            this.fileNames.sheet.insertRule(
                css,
                this.fileNames.sheet.cssRules.length,
            );
        } else if (isLanguageId) {
            this.langIds.sheet.insertRule(
                css,
                this.langIds.sheet.cssRules.length,
            );
        } else if (!name.includes(".")) {
            this.fileExts.sheet.insertRule(css, 0);
        } else {
            this.fileExts.sheet.insertRule(
                css,
                this.fileExts.sheet.cssRules.length,
            );
        }

        this.cache.set(name, null);
    }

    reset() {
        if (this.fileExts) this.fileExts.remove();
        if (this.fileNames) this.fileNames.remove();
        if (this.langIds) this.langIds.remove();
        if (this.link) this.link.remove();
    }

    dispose() {
        // @vsa-debug
        console.log(`${this.id}:icontheme.dispose`);
        this.reset();
        if (this.sheet) this.sheet.disabled = false;
        helpers.getIconForFile = getIconForFile;
    }
}

export default {
    Runtime,
};
