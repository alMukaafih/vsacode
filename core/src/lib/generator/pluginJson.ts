import { fs, path } from  "../compat.js"

/**
 * Generates plugin.json file required by base plugin
 * @param env
 */
export async function pluginJsonGen(env: Env): Promise<void> {
    const packageJson = env.packageJson
    const id: string = env.id
    const label: string = env.label
    const tmpDir: string = env.tmpDir
    const base: string = env.base
    const home: string = env.home

    const json = {
        id: id,
        name: label,
        main: "main.js",
        version: packageJson.version,
        readme: "readme.md",
        icon: "icon.png",
        files: [],
        minVersionCode: 292,
        author: packageJson.author
    };
    const assets = path.join(tmpDir, "extension")
    process.chdir(base);
    await fs.writeFile(path.join("plugin.json"), JSON.stringify(json));
    env.pluginId = json.id
    await fs.copyFile(path.join(assets, packageJson.icon), "icon.png");
    await fs.copyFile(path.join(assets, "README.md"), "readme.md");
    const _overrides = path.join(home, "overrides", id)
    if (await fs.exists(_overrides)) {
        const overrides = await fs.readdir(_overrides);
        for (const override of overrides) {
            await fs.copyFile(path.join(_overrides, override), path.basename(override))
        }
    }
}