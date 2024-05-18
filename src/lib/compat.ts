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
    pth = acode.require("Url")
} else {
    fst = await import("node:fs")
    ost = await import("node:os")
    pth = await import("node:path")
}

export const fs = {
    copyFile: async (src: string, dest: string) => {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fst(src).copyTo(dest)
        } else {
            fst.copyFileSync(src, dest)
        }
    },
    cp: async (src: string, dest: string, options?: { recursive: boolean }) => {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fst(src).copyTo(dest)
        } else {
            fst.cpSync(src, dest, options)
        }
    },
    exists: async (path: string): Promise<boolean> => {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return await fst(path).exists()
        } else {
            return fst.existsSync(path)
        }
    },
    mkdir: async (path: string, options?: { recursive: boolean }) => {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return await fst(path).createDirectory()
        } else {
            return fst.mkdirSync(pth.join(DATA_STORAGE, path), options)
        }
    },
    mkdtemp: async (prefix: string): Promise<string> => {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            const bytes = new Uint8Array(6)
            crypto.getRandomValues(bytes)
            const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("")
            const rand = btoa(binString)
            return await fst(`${prefix}${rand}`).createDirectory() 
        } else {
            return fst.mkdtempSync(prefix)
        }
    },
    readdir: async (path:string): Promise<string[]> => {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return await fst(path).lsDir()
        } else {
            return fst.readFileSync(path)
        }
    },
    readFile: async (path: string): Promise<Buffer> => {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return await fst(path).readFile()
        } else {
            return fst.readFileSync(path)
        }
    },
    rm: async (path: string, options?: { recursive: boolean }): Promise<void> => {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fst(path).delete()
        } else {
            fst.rmSync(path, options)
        }
    },
    writeFile: async (file: string, data: string): Promise<void> => {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fst(file).writeFile(data)
        } else {
            fst.writeFileSync(file, data)
        }
    },
    unlink: async (path: string, options?: { recursive: boolean }): Promise<void> => {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            await fst(path).delete()
        } else {
            fst.unlinkSync(path, options)
        }
    },
}

export const path = {
    basename: (path: string): string => {
        return pth.basename(path)
    },
    dirname: (path: string): string => {
        return pth.dirname(path)
    },
    join: (...paths: string[]): string => {
        return pth.join(...paths)
    },
    resolve: (...paths: string[]): string => {
        if (typeof window != "undefined" && typeof window.acode != "undefined") {
            return pth.join(...paths)
        } else {
            return pth.resolve(...paths)
        }
    },

}

export const os = {
    tmpdir: (): string => {
        return ost.tmpdir()
    }
}