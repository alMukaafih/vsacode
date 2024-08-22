import meta from "./.meta.json";
// @vsa-icontheme
import iconThemes from "./iconThemes";
// @vsa-protheme
import proThemes from "./proThemes";
// @vsa-theme
import themes from "./themes";

class Main {
    // @vsa-icontheme
    iconThemes = new iconThemes.Runtime();
    // @vsa-protheme
    proThemes = new proThemes.Runtime();
    // @vsa-theme
    themes = new themes.Runtime();
    public baseUrl: string | undefined;

    public async init(): Promise<void> {
        // @vsa-protheme
        await this.proThemes.init(meta.id, meta.proThemes);
        // @vsa-theme
        await this.themes.init(meta.themes);
        // @vsa-icontheme
        window.addEventListener("load", () => {
            // @vsa-icontheme
            this.iconThemes.init(meta.id, meta.iconThemes);
        // @vsa-icontheme
        });
    }

    public async destroy(): Promise<void> {
        const elements = document.querySelectorAll(meta.id);
        for (const $el of elements) {
            $el.remove();
        }
    }
}

if (typeof window.acode != "undefined") {
    const main = new Main();
    acode.setPluginInit(meta.id, async (baseUrl, _$page) => {
        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }
        main.baseUrl = baseUrl;
        await main.init();
    });
    acode.setPluginUnmount(meta.id, () => {
        main.destroy();
    });
}
