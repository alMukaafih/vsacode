import { HOME } from "./constants.js"

const fsOperation = acode.require("fs")
const { join } = acode.require("url")

class IconThemes implements VsaApi.Setting {
    themes: Record<string, string>

    constructor() {
        this.themes = {
            "none": "None"
        }
    }

    add(id: string, name: string) {
        this.themes[id] = name
    }

    remove(id: string) {
        delete this.themes[id]
    }

    list(): string[][] {
        let ls: string[][] = []
        for (let key in this.themes) {
            ls.push([key, this.themes[key]])
        }
        return ls
    }
}

class productIconThemes implements VsaApi.Setting {
    themes: Record<string, string>

    constructor() {
        this.themes = {
            "none": "None"
        }
    }

    add(id: string, name: string) {
        this.themes[id] = name
    }

    remove(id: string) {
        delete this.themes[id]
    }

    list(): string[][] {
        let ls: string[][] = []
        for (let key in this.themes) {
            ls.push([key, this.themes[key]])
        }
        return ls
    }
}

export class Settings {
    #defaultSettings: Record<string, string>
    value: Record<string, string>
    settingsFile: string
    display: AcodeApi.PluginSettings
    iconThemes: IconThemes
    productIconThemes: productIconThemes
    constructor() {
        this.#defaultSettings = {
            IconTheme: "none",
            productIconTheme: "none"
        }
        this.value = structuredClone(this.#defaultSettings)
        this.settingsFile = join(HOME, "settings.json")
        this.iconThemes = new IconThemes()
        this.productIconThemes = new productIconThemes()
        this.display = {
            list: [
                {
                    key: "iconTheme",
                    text: "File Icon Theme",
                    select: this.iconThemes.list()
                },
                {
                    key: "productIconTheme",
                    text: "Product Icon Theme",
                    select: this.productIconThemes.list()
                }
            ],
            cb: this.update
        }
    }

    async init() {
        const fs = fsOperation(this.settingsFile)
        if (fs.exists())
            this.value = JSON.parse(await fs.readFile('utf8'))
    }

    async #save() {
        const fs = fsOperation(this.settingsFile)
        const settingsText = JSON.stringify(this.value, undefined, 2)
        if (!(await fs.exists())) {
            const dirFs = fsOperation(HOME)
            await dirFs.createFile("settings.json")
        }
        await fs.writeFile(settingsText)
    }

    async update(key: string, value: string) {
        this.value[key] = value
        await this.#save()
    }
}