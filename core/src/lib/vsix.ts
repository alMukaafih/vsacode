import { fs, path, toString } from "./compat.js";
import xml2js from "xml2js"

export class Vsix {
    root: string;
    vsixManifest: object;
    contentTypes: object;
    constructor(root: string) {
        this.root = root
    }

    async validate() {
        if (await fs.exists(path.join(this.root, "extension.vsixmanifest"))) {
            const _file = await fs.readFile(path.join(this.root, "extension.vsixmanifest"))
            const file = toString(_file)
            this.vsixManifest = await xml2js.parseStringPromise(file)
         }
        else {
            throw new Error("not a vsix file")
        }
        const _file = await fs.readFile(path.join(this.root, "[Content_Types].xml"))
        const file = toString(_file)
        this.contentTypes = await xml2js.parseStringPromise(file)
    }
}