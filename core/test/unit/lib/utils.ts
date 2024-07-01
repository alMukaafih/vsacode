import { bundleAsset, parse } from "../../../src/lib/utils"
import { describe, expect, test } from "@jest/globals"
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const appPrefix = "vsa-test-";
const tmpDir: string = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));
process.on("exit", () => {
    //console.log("Exiting vsacode.js process with code:", code);
        //console.log(usage);
    fs.rmSync(tmpDir, { recursive: true });
});
process.chdir(tmpDir)
fs.writeFileSync("plugin.json", JSON.stringify({ "id": "test-id" }));
fs.writeFileSync("test-asset", "")

describe("asset bundler function", () => {
    test("returns valid link to asset", () => {
        expect(bundleAsset("./test-asset", {
            base: `./`,
            assets: `./assets`,
            assetList: {}
        })).toBe(`https://localhost/__cdvfile_files-external__/plugins/test-id/assets/test-asset`)
    })
    test("link returned will point to a valid file", async () => {
        const link = bundleAsset("./test-asset", {
            base: `./`,
            assets: `./assets`,
            assetList: {}
        })
        expect(fs.existsSync((await link).substring(61))).toBe(true)
    })
})

describe("parser function", () => {
    test("returns valid css output", () => {
        const style = "case-1,case-2" + `{\n    content: "" !important;\n`
        + "background-image: url(https://localhost/__cdvfile_files-external__/plugins/test-id/assets/test-asset);"
        + `    background-size: contain;\n`
        + `    background-repeat: no-repeat;\n`
        + `    display: inline-block;\n`
        + `    height: 1em;\n`
        + `    width: 1em;\n}\n`;
        expect(parse({ "test-asset": ["case-1", "case-2"] }, {
            base: `./`,
            assets: `./assets`,
            assetList: {},
            root: "./",
            iconDefs: {
                "test-asset": {
                    iconPath: "test-asset"
                }
            }
        })).toBe(style.replace(/\s/g, ""))
    })
})