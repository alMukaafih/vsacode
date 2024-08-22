export class Runtime {
    #themes: Record<string, string> = {};
    #currentTheme: string;
    #id: string;

    async init(id: string, themes: string[][]) {
        this.#id = id;
        for (const theme of themes) {
            this.#themes[theme[0]] = theme[0];
        }

        const __theme = this.#themes[this.#currentTheme];
        const linkEl = document.createElement("link");
        linkEl.id = "iconTheme";
        linkEl.href = `${PLUGIN_DIR}/${this.#id}/productIconThemes/${__theme}.css`;
        linkEl.rel = "stylesheet";
        document.head.appendChild(linkEl);
    }
}

export default {
    Runtime
}
