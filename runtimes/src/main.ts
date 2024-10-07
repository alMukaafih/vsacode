import meta from "./.meta.json";
// @vsa-icontheme
import iconThemes from "./iconThemes";
// @vsa-protheme
import proThemes from "./proThemes";
// @vsa-theme
import themes from "./themes";

let main: Main;

const fsOperation = window.acode.require("fs");

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

async function listener(e: CustomEvent<{ key: string; value: string }>) {
    // @vsa-debug
    console.log(`${meta.id}:config - ${JSON.stringify(e.detail)}`);
    if (e.detail.key === "enable") {
        if (!e.detail.value) {
            main.reset();
        } else {
            await main.init();
        }
    }
    // @vsa-icontheme
    else if (e.detail.key === "iconTheme") {
        // @vsa-icontheme
        main.iconThemes.theme = e.detail.value;
        // @vsa-icontheme
        main.iconThemes.load();
        // @vsa-icontheme
    }
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
        await this.proThemes.init(meta.id, settings.proTheme);
        // @vsa-theme
        await this.themes.init(meta.themes);
        // @vsa-icontheme
        await this.iconThemes.init(meta.id, settings.iconTheme);

        window.addEventListener(`${meta.id}:config`, listener);
    }

    reset() {
        // @vsa-icontheme
        this.iconThemes.dispose();
    }

    dispose() {
        // @vsa-debug
        console.log(`${meta.id}:main:dispose`);
        // @vsa-icontheme
        this.reset();
        window.removeEventListener(`${meta.id}:config`, listener);
    }
}

if (window.acode) {
    main = new Main();
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
                    checkbox: settings.enable,
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
