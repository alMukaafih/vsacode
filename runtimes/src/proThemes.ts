const PLUGIN_URL = "https://localhost/__cdvfile_files-external__/plugins";

export class Runtime {
    id: string;
    theme: string;
    link: HTMLLinkElement;

    async init(id: string, theme: string) {
        this.id = id;

        this.theme = theme;

        const linkEl = document.createElement("link");
        linkEl.id = this.id;
        linkEl.href = `${PLUGIN_URL}/${this.id}/2/${this.theme}.css`;
        linkEl.rel = "stylesheet";
        document.head.appendChild(linkEl);
        this.link = linkEl;
    }

    dispose() {
        // @vsa-debug
        console.log(`${this.id}:protheme:dispose - {}`);
        if (this.link) this.link.remove();
    }
}

export default {
    Runtime
}
