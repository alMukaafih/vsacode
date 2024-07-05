import { fs, path, toString } from "./compat.js";
import { unzip } from "./utils.js";

export class Runtime {
    env: Env;
    constructor(env: Env) {
        this.env = env
    }

    async run() {
        const env = this.env;
        if (!env.cmd.vsix) {
            try {
                env.zipData = await fs.readFile(env.vsix)
                await unzip(env)
            }
            catch(error) {
                //console.log(error);
                //console.log(err(`${env.vsix} is not a valid VS Code plugin\n`));
            }
            // read extension/package.json file
            const _json = await fs.readFile(path.join(env.tmpDir, "extension", "package.json"));
            let __json: string = toString(_json);
            __json = __json.replace(/\s\/\/(.)+/g, "");
            // package.json file object
            const packageJson = JSON.parse(__json);
            env.packageJson = packageJson
        }
        const { default: exec } = await import(`../commands/${env.cmd.name}.js`)
        exec[env.subCmd](env)
    }
}