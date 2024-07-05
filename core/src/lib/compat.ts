let fsNode: typeof import("fs")
let osNode: typeof import("os")
let pathNode: typeof import("path")

let fsBrowser: AcodeApi.ModulesMap["fs"]
let osBrowser: { tmpdir: () => string }
let pathBrowser: AcodeApi.Url

if (typeof window != "undefined" && typeof window.acode != "undefined") {
    fsBrowser = acode.require("fs")
    osBrowser = {
        tmpdir: (): string => {
            return CACHE_STORAGE
        }
    }
    pathBrowser = acode.require("url")
} else {
    fsNode = await import("fs")
    osNode = await import("os")
    pathNode = await import("path")
}

class Fs {
    async copyFile(src: string, dest: string) {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fsBrowser(src).copyTo(dest)
        } else {
            fsNode.copyFileSync(src, dest)
        }
    }

    async cp(src: string, dest: string, options?: { recursive: boolean }) {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fsBrowser(src).copyTo(dest)
        } else {
            fsNode.cpSync(src, dest, options)
        }
    }

    async exists(path: string): Promise<boolean> {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return await fsBrowser(path).exists()
        } else {
            return fsNode.existsSync(path)
        }
    }

    async mkdir(path: string, options?: { recursive: boolean }) {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return await fsBrowser(pathNode.join(DATA_STORAGE, path)).createDirectory("")
        } else {
            return fsNode.mkdirSync(path, options)
        }
    }

    async mkdtemp(prefix: string): Promise<string> {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            const bytes = new Uint8Array(6)
            crypto.getRandomValues(bytes)
            const decoder = new TextDecoder()
            const binString = decoder.decode(bytes)
            const rand = btoa(binString)
            return await fsBrowser(`${prefix}${rand}`).createDirectory("")
        } else {
            return fsNode.mkdtempSync(prefix)
        }
    }

    async readdir(path:string): Promise<string[]> {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return await fsBrowser(path).lsDir()
        } else {
            return fsNode.readdirSync(path)
        }
    }

    async readFile(path: string): Promise<Buffer | Uint8Array> {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return new Uint8Array(await fsBrowser(path).readFile())
        } else {
            return fsNode.readFileSync(path)
        }
    }

    async rm(path: string, options?: { recursive: boolean }): Promise<void> {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fsBrowser(path).delete()
        } else {
            fsNode.rmSync(path, options)
        }
    }

    async writeFile(file: string, data: string): Promise<void> {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fsBrowser(file).writeFile(data)
        } else {
            fsNode.writeFileSync(file, data)
        }
    }

    async unlink(path: string): Promise<void> {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fsBrowser(path).delete()
        } else {
            fsNode.unlinkSync(path)
        }
    }
}

export const fs = new Fs

class Path {
    basename(path: string): string {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return pathBrowser.basename(path)
        } else {
            return pathNode.basename(path)
        }
    }

    dirname(path: string): string {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return pathBrowser.dirname(path)
        } else {
            return pathNode.dirname(path)
        }
    }

    join(...paths: string[]): string {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return pathBrowser.join(...paths)
        } else {
            return pathNode.join(...paths)
        }
    }

    resolve(...paths: string[]): string {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return pathBrowser.join(...paths)
        } else {
            return pathNode.resolve(...paths)
        }
    }

}

export const path = new Path

class Os {
    tmpdir(): string {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return osBrowser.tmpdir()
        } else {
            return osNode.tmpdir()
        }
    }
}

export const os = new Os

export function toString(buf: Buffer | Uint8Array): string {
        const utf8decoder = new TextDecoder()
        return utf8decoder.decode(buf)
}