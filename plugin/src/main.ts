import plugin from "../plugin.json";
import { initApp } from "./app/index.js";

const sidebarApps: AcodeApi.SidebarApps = acode.require("sidebarApps")
const fs: typeof AcodeApi.fs = acode.require("fs")

let active = {
    fileIconTheme: ""
}

let settings: AcodeApi.Settings = {
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
        fs(`https://localhost/__cdvfile_files-external__/plugins/${plugin.id}/active.json`).writeFile(JSON.stringify(active))
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
            + `background-image:url(https://localhost/__cdvfile_files-external__/plugins/${plugin.id}/app-icon.svg);`
            + "background-size:contain;"
            + "background-repeat:no-repeat;"
            + "height:1em;"
            + "width:1em;"
        let style = document.createElement("style")
        style.id = plugin.id
        style.append(icon)
        document.head.append(style)

        sidebarApps.add("vsacode-icon", "vsacode", "VS Acode", initApp)
        active = JSON.parse(await fs(`https://localhost/__cdvfile_files-external__/plugins/${plugin.id}/active.json`).readFile("utf-8"))
    }
    async destroy(): Promise<void> {

    }
}

if (window.acode) {
    const vsacode = new Vsacode()
    acode.setPluginInit(
        plugin.id,
        async (
            baseUrl: string,
            $page: AcodeApi.WCPage,
            { cacheFileUrl, cacheFile }: AcodeApi.PluginInitOptions
        ) => {
            if (!baseUrl.endsWith("/")) {
                baseUrl += "/"
            }
            vsacode.baseUrl = baseUrl;
            await vsacode.init()
        },
        settings
    );
    acode.setPluginUnmount(plugin.id, () => {
        vsacode.destroy()
    })
}