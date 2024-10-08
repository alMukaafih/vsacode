import { ArgType, SrcType, getSrcInfo } from "./source";
import { join } from "path";
import fs from "fs";
import type { PackageJson, ThemeInfo } from "./packageJson";
import { style } from "ziyy";
import AdmZip from "adm-zip";

class Main implements Vsa.Component {
    env: Vsa.Env;
    pretty: boolean = true;
    buf: string = "";

    constructor(env: Vsa.Env) {
        this.env = env;

        for (const arg of env.args) {
            if (arg.type == (ArgType.Flag as Vsa.ArgType)) {
                if (arg.key == "no-pretty-print") {
                    this.pretty = false;
                }
            }
        }
    }
    init() {
        let srcInfo;
        try {
            srcInfo = getSrcInfo(this.env.args);
        } catch (e) {
            throw new Error("invalid <u>vsix file</u>");
        }

        let _packageJson: string;
        switch (srcInfo.type) {
            case SrcType.File:
                try {
                    const zip = new AdmZip(srcInfo.path);
                    _packageJson = zip
                        .getEntry("extension/package.json")
                        ?.getData()
                        .toString()!;
                } catch (e: any) {
                    throw new Error("invalid <u>vsix file</u>");
                }
                break;

            case SrcType.Dir:
                let path = join(srcInfo.path, "package.json");
                _packageJson = fs.readFileSync(path).toString();
                break;
        }

        let packageJson: PackageJson = JSON.parse(_packageJson);

        this.write("Name", packageJson.displayName);
        this.write("Version", packageJson.version);
        this.write("Publisher", packageJson.publisher);
        this.write("Description", packageJson.description);

        for (const contrib in packageJson.contributes) {
            if (contrib == "iconThemes") {
                this.write_theme(
                    packageJson.contributes.iconThemes,
                    "IconThemes",
                );
            } else if (contrib == "themes") {
                this.write_theme(packageJson.contributes.themes, "Themes");
            } else {
                this.write(
                    contrib[0].toUpperCase() + contrib.slice(1),
                    "...",
                );
            }
        }

        this.finish();
    }

    write_theme(themes: ThemeInfo[], title: string) {
        if (themes) {
            let dem = this.pretty ? "<c.yellow>*</c>" : "*";
            this.write(title, "");
            for (const theme of themes) {
                this.buf += `  ${dem} ${theme.label}\n`;
            }
        }
    }

    write(key: string, value: string) {
        this.pretty ? (this.buf += `<c.cyan>${key}</c>`) : (this.buf += key);
        this.pretty ? (this.buf += `<c.yellow>:</c> `) : (this.buf += ": ");
        this.buf += value;
        this.buf += "\n";
    }

    finish() {
        process.stdout.write(style(this.buf));
    }
}

export { Main };
