import { initApp } from "./app/index.js";
import { HOME, ID } from "./lib/constants.js";

const sidebarApps = acode.require("sidebarApps")
const fs = acode.require("fs")
const { join } = acode.require("url")

if (typeof window.vsacode == "undefined") {
    window.vsacode = {
        activeIconTheme: "none",
        activeProductIconTheme: "none"
    }
}

let active = {
    fileIconTheme: ""
}

let settings: AcodeApi.PluginSettings = {
    list: [
        {
            key: "fileIconTheme",
            text: "File Icon Theme",
            select: [
                "Icons", "File Icons"
            ]
        }
    ],
    cb: (key, value) => {
        if (key == "fileIconTheme") {
            active.fileIconTheme = value
        }
        fs(join(HOME, "active.json")).writeFile(JSON.stringify(active))
    }
}

class Vsacode {
    // Base url
    public baseUrl: string | undefined;
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
        active = JSON.parse(await fs(join(HOME, "active.json")).readFile("utf-8"))
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
        settings
    );
    acode.setPluginUnmount(ID, () => {
        vsa.destroy()
    })
}