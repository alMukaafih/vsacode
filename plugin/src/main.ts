import { initApp } from "./app/index.js";
import { HOME, ID } from "./lib/constants.js";
import { Settings } from "./lib/settings.js";

const sidebarApps = acode.require("sidebarApps")
const fs = acode.require("fs")
const { join } = acode.require("url")

// if (typeof window.vsacode == "undefined") {
//     window.vsacode = {
//         activeIconTheme: "none",
//         activeProductIconTheme: "none"
//     }
// }

class Vsacode {
    // Base url
    public baseUrl: string | undefined;
    settings: Settings;
    // Plugin initialization
    async init(): Promise<void> {
        const icon = ".icon.vsacode-icon::before{"
            + "display:inline-block;"
            + "content:'';"
            + `background-image:url(${HOME}app-icon.svg);`
            + "background-size:contain;"
            + "background-repeat:no-repeat;"
            + "height:1em;"
            + "width:1em;"
        let style = document.createElement("style")
        style.id = ID
        style.append(icon)
        document.head.append(style)

        sidebarApps.add("vsacode-icon", "vsacode", "VS Acode", initApp)
        this.settings = new Settings
        this.settings.init()
    }
    async destroy(): Promise<void> {

    }
}

if (typeof window.acode != "undefined") {
    const vsa = new Vsacode()
    acode.setPluginInit(
        ID,
        async (
            baseUrl: string,
            $page: AcodeApi.WCPage,
            { cacheFileUrl, cacheFile }: AcodeApi.PluginInitOptions
        ) => {
            if (!baseUrl.endsWith("/")) {
                baseUrl += "/"
            }
            vsa.baseUrl = baseUrl;
            await vsa.init()
        },
        vsa.settings.display
    );
    acode.setPluginUnmount(ID, () => {
        vsa.destroy()
    })
}