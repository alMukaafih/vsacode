let fst
let ost
let pth

if (typeof window != "undefined" && typeof window.acode != "undefined") {
    fst = acode.require("fs")
    ost = {
        tmpdir: (): string => {
            return CACHE_STORAGE
        }
    }
    pth = acode.require("url")
} else {
    fst = await import("node:fs")
    ost = await import("node:os")
    pth = await import("node:path")
}

class Fs {
    async copyFile(src: string, dest: string) {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fst(src).copyTo(dest)
        } else {
            fst.copyFileSync(src, dest)
        }
    }

    async cp(src: string, dest: string, options?: { recursive: boolean }) {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fst(src).copyTo(dest)
        } else {
            fst.cpSync(src, dest, options)
        }
    }

    async exists(path: string): Promise<boolean> {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return await fst(path).exists()
        } else {
            return fst.existsSync(path)
        }
    }

    async mkdir(path: string, options?: { recursive: boolean }) {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return await fst(pth.join(DATA_STORAGE, path)).createDirectory()
        } else {
            return fst.mkdirSync(path, options)
        }
    }

    async mkdtemp(prefix: string): Promise<string> {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            const bytes = new Uint8Array(6)
            crypto.getRandomValues(bytes)
            const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("")
            const rand = btoa(binString)
            return await fst(`${prefix}${rand}`).createDirectory()
        } else {
            return fst.mkdtempSync(prefix)
        }
    }

    async readdir(path:string): Promise<string[]> {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return await fst(path).lsDir()
        } else {
            return fst.readdirSync(path)
        }
    }

    async readFile(path: string): Promise<Buffer> {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return await fst(path).readFile()
        } else {
            return fst.readFileSync(path)
        }
    }

    async rm(path: string, options?: { recursive: boolean }): Promise<void> {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fst(path).delete()
        } else {
            fst.rmSync(path, options)
        }
    }

    async writeFile(file: string, data: string): Promise<void> {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fst(file).writeFile(data)
        } else {
            fst.writeFileSync(file, data)
        }
    }

    async unlink(path: string, options?: { recursive: boolean }): Promise<void> {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fst(path).delete()
        } else {
            fst.unlinkSync(path, options)
        }
    }
}

export const fs = new Fs

class Path {
    basename(path: string): string {
        return pth.basename(path)
    }

    dirname(path: string): string {
        return pth.dirname(path)
    }

    join(...paths: string[]): string {
        return pth.join(...paths)
    }

    resolve(...paths: string[]): string {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return pth.join(...paths)
        } else {
            return pth.resolve(...paths)
        }
    }

}

export const path = new Path

class Os {
    tmpdir(): string {
        return ost.tmpdir()
    }
}

export const os = new Os