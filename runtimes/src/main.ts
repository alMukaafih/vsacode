import meta from "./.meta.json";
// @vsa-icontheme
import iconThemes from "./iconThemes";
// @vsa-protheme
import proThemes from "./proThemes";
// @vsa-theme
import themes from "./themes";

const fsOperation = window.acode.require("fsOperation");

var JSON = window.JSON;

export interface Disposable {
    dispose(): void;
}

const defaultSettings = {
    enable: true,
    // @vsa-icontheme
    iconTheme: meta.iconThemes[0][0],
    // @vsa-protheme
    proTheme: meta.proThemes[0][0],
};

let settings = structuredClone(defaultSettings);

async function initSettings() {
    // @vsa-debug
    console.log(`settings:init - ${JSON.stringify(settings)}`);
    const fs = fsOperation(`${PLUGIN_DIR}/${meta.id}/settings.json`);
    if (await fs.exists()) settings = JSON.parse(await fs.readFile("utf8"));
}

async function saveSettings() {
    const fs = fsOperation(`${PLUGIN_DIR}/${meta.id}/settings.json`);
    const settingsText = JSON.stringify(settings, undefined, 2);
    if (!(await fs.exists())) {
        const dirFs = fsOperation(PLUGIN_DIR, meta.id);
        await dirFs.createFile("settings.json");
    }
    await fs.writeFile(settingsText);
}

async function updateSettings(key: string, value: any) {
    settings[key] = value;
    window.dispatchEvent(
        new CustomEvent(`${meta.id}:config`, {
            detail: { key, value },
        }),
    );
    await saveSettings();
}

class Main implements Disposable {
    // @vsa-icontheme
    iconThemes = new iconThemes.Runtime();
    // @vsa-protheme
    proThemes = new proThemes.Runtime();
    // @vsa-theme
    themes = new themes.Runtime();
    baseUrl: string | undefined;

    async init(): Promise<void> {
        // @vsa-debug
        console.log(`main:init - ${JSON.stringify(settings)}`);

        await initSettings();
        if (!settings.enable) return;
        // @vsa-protheme
        await this.proThemes.init(meta.id, meta.proThemes);

        // @vsa-theme
        await this.themes.init(meta.themes);
        // @vsa-icontheme
        //window.addEventListener("load", () => {
            // @vsa-debug
            //console.log(`window:load`);
            // @vsa-icontheme
            this.iconThemes.theme = settings.iconTheme;
            // @vsa-icontheme
            this.iconThemes.init(meta.id, meta.iconThemes);
            // @vsa-icontheme
        //});

        window.addEventListener(`${meta.id}:config`, this.listener);
    }

    async listener(e: CustomEvent<{ key: string; value: string }>) {
        // @vsa-debug
        console.log(`${meta.id}:config - ${e.detail}`);
        if (e.detail.key === "enable") {
            if (!e.detail.value) this.dispose();
        }
        // @vsa-icontheme
        else if (e.detail.key === "iconTheme") {
            // @vsa-icontheme
            this.iconThemes.theme = e.detail.key;
            // @vsa-icontheme
            this.iconThemes.reload();
            // @vsa-icontheme
        }
    }

    dispose() {
        // @vsa-debug
        console.log(`$dispose:main`);
        // @vsa-icontheme
        this.iconThemes.dispose();

        window.removeEventListener(`${meta.id}:config`, this.listener);
        const elements = document.querySelectorAll(`#${meta.id}`);
        for (const $el of elements) {
            $el.remove();
        }
    }
}

if (window.acode) {
    const main = new Main();
    acode.setPluginInit(
        meta.id,
        async (baseUrl, _$page) => {
            if (!baseUrl.endsWith("/")) {
                baseUrl += "/";
            }
            main.baseUrl = baseUrl;
            await main.init();
        },
        {
            list: [
                {
                    key: "enable",
                    text: "Enable",
                    value: true,
                },
                // @vsa-icontheme
                {
                    // @vsa-icontheme
                    key: "iconTheme",
                    // @vsa-icontheme
                    text: "File Icon Theme",
                    // @vsa-icontheme
                    value: settings.iconTheme,
                    // @vsa-icontheme
                    select: meta.iconThemes,
                    // @vsa-icontheme
                },
            ],
            cb: updateSettings,
        },
    );
    acode.setPluginUnmount(meta.id, () => {
        main.dispose();
    });
}
