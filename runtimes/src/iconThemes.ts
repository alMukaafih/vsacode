interface IdefinitionProperties {
    iconPath?: string;
    fontCharacter?: string;
    fontColor?: string;
    fontSize?: string;
    fontId?: string;
}

interface IfontProperties {
    id: string;
    src: [
        {
            path: string;
            format: string;
        }
    ];
    weight?: string;
    style?: string;
    size?: string;
}

interface IfileIconTheme {
    hidesExplorerArrows: boolean;
    fonts?: [IfontProperties];
    iconDefinitions: Record<string, IdefinitionProperties>;
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

    fileExtensions?: Record<string, string>;
    fileNames?: Record<string, string>;
    light?: Record<string, any>;
    highContrast?: Record<string, any>;
}

type Definition = IdefinitionProperties;

export class Runtime {
    #themes: Record<string, string> = {};
    #stylesheet: CSSStyleSheet;
    #currentTheme: string;
    #theme: IfileIconTheme;
    #id: string;

    async init(id: string, themes: string[]) {
        this.#id = id;
        for (const theme of themes) {
            this.#themes[theme] = theme;
        }

        const __theme = this.#themes[this.#currentTheme];
        this.#theme = (await import(`iconThemes/${__theme}.js`)).content;

        const linkEl = document.createElement("link");
        linkEl.id = "iconTheme";
        linkEl.href = `${PLUGIN_DIR}/${this.#id}/iconThemes/${__theme}.css`;
        linkEl.rel = "stylesheet";
        document.head.appendChild(linkEl);
        this.#stylesheet = linkEl.sheet;

        const helpers = acode.require("helpers");
        const getIconForFile = structuredClone(helpers.getIconForFile);
        helpers.getIconForFile = (filename) => {
            const names = filename.split(".");
            while (names.length > 0) {
                const status = this.resolve(names.join("."));
                if (status) break;
                names.shift();
            }
            return getIconForFile(filename);
        };
        this.resolveAll();
    }

    resolveAll() {
        let elements = document.querySelectorAll(`.list.collapsible>li.tile[data-type="file"]>.file`);
        for (const $el of elements) {
            this.resolve($el.getAttribute("data-name"));
        }

        elements = document.querySelectorAll(`#file-browser>ul>li.tile[type="file"]>.file`);
        for (const $el of elements) {
            this.resolve($el.getAttribute("name"));
        }
    }

    async insertCSS(name: string, definition: Definition): Promise<void> {
        let fontChar = "";
        let fontColor = "";
        let fontId = "";
        let fontSize = "";
        let iconPath = "";
        if (definition.fontCharacter) fontChar = definition.fontCharacter;
        if (definition.fontColor) fontColor = `color:${definition.fontColor};`;

        if (definition.fontId)
            fontId = `font-family:"${definition.fontId}"!important;`;

        if (definition.fontSize) fontSize = `font-size:${definition.fontSize};`;

        if (definition.iconPath)
            iconPath = `background-image:url(definition.iconPath);`;

        const css =
            `.list.collapsible>li.tile[data-name$="${name}"][data-type="file"]>.file::before,` +
            `#file-browser>ul>li.tile[name$="${name}"][type="file"]>.file::before` +
            `{content:"${fontChar}"!important;` +
            fontColor +
            fontId +
            fontSize +
            iconPath +
            `background-size:contain;` +
            `background-repeat:no-repeat;` +
            `display:inline-block;` +
            `height:1em;` +
            `width:1em;}`;
        this.#stylesheet.insertRule(css, this.#stylesheet.cssRules.length);
    }

    resolve(ext: string): boolean {
        let __ext = this.#theme.iconDefinitions[ext];
        if (typeof __ext == "undefined") {
            return false;
        }

        this.insertCSS(ext, __ext);
        return true;
    }
}

export default {
    Runtime,
};
