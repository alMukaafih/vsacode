const child_process = require("child_process");
const fs = require("fs");
const { join, resolve } = require("path");

var tsc = false;

class Main {
    constructor(env) {
        this.env = env;
        this.__root = resolve(this.env.home, "..");
        this.__bin = join(this.__root, "node_modules", ".bin");
        if (process.platform == "win32") {
            process.env.PATH += `;${this.__bin}`;
        }
        process.env.PATH += `:${this.__bin}`;
        this.__core = resolve(this.__root, "core");
        this.__modules = resolve(this.__root, "modules");
        this.__runtimes = resolve(this.__root, "runtimes");
    }

    init() {
        switch (this.env.args.shift().key) {
            case "b":
            case "build":
                this.build();
                break;

            case "clean":
                this.clean();
                break;

            case "hoist":
                this.hoist();
                break;

            case "resolve":
                this.resolve();
                break;

            case "s":
            case "sync":
                this.sync();
                break;

            case "t":
            case "test":
                this.test();
                break;

            case "universal":
                this.universal();
                break;

            default:
                throw new Error(`Unknown Command: ${this.env.args[0].key}`);
        }
    }

    build() {
        if (this.env.args.length == 0) {
            this.buildAll();
            return;
        }

        let strategy = {};

        for (let arg of this.env.args) {
            if (arg.type === 0) {
                switch (arg.key) {
                    case "babel":
                        strategy.babel = true;
                        break;

                    case "c":
                    case "core":
                        strategy.core = true;
                        break;

                    case "hoist":
                        strategy.hoist = true;
                        break;

                    case "m":
                    case "module":
                        strategy.module = arg.value;
                        break;

                    case "r":
                    case "runtime":
                        strategy.runtime = true;
                        break;

                    case "t":
                    case "target":
                        strategy.target = arg.value;
                        break;

                    case "tsc":
                        tsc = true;
                        break;

                    default:
                        let error;
                        if (arg.key.length == 1) {
                            error = `-${arg.key}`;
                        } else {
                            error = `--${arg.key}`;
                        }
                        throw new Error(`Unknown Option: ${error}`);
                }
            }
        }

        if (this.env.isDebug) console.log("strategy", strategy);

        if (strategy.core) {
            this.buildComponent(this.__core);
        }

        if (strategy.babel) {
            this.buildBabelZip();
        }

        if (strategy.runtime) {
            this.buildComponent(this.__runtimes);
        }

        if (typeof strategy.target != "undefined") {
            this.target = strategy.target;
            let modules = fs.readdirSync(this.__modules);
            for (let dir of modules) {
                this.buildModule(dir);
            }
        } else if (typeof strategy.module != "undefined") {
            this.buildModule(strategy.module);
        }

        if (strategy.hoist) {
            this.hoist();
        }
    }

    buildBabelZip() {
        /** @type string[] */
        let resolved = [];

        const resolveDep = (name, path) => {
            let __path = join(path, "node_modules", name);
            let __path2 = join(this.__root, "node_modules", name);

            if (fs.existsSync(__path)) {
            } else if (fs.existsSync(__path2)) {
                __path = __path2;
            } else {
                return;
            }

            if (!resolved.includes(__path)) {
                resolved.push(__path);
            }

            /** @type Record<string, string> */
            let deps = JSON.parse(
                fs.readFileSync(join(__path, "package.json")).toString(),
            ).dependencies;

            if (typeof deps == "undefined") {
                return;
            }

            for (const dep in deps) {
                resolveDep(dep, __path);
            }
        };

        process.chdir(join(this.__root));
        /** @type Record<string, string> */
        const dependencies = JSON.parse(
            fs.readFileSync("package.json").toString(),
        ).dependencies;

        for (const dependency in dependencies) {
            resolveDep(dependency, this.__root);
        }

        console.log(resolved.sort().join("\n"));
    }

    buildComponent(path) {
        process.chdir(path);
        child_process.execSync(`tsc`, { stdio: "inherit" });
    }

    buildModule(dir) {
        let __module = join(this.__modules, dir);
        if (!fs.existsSync(__module)) {
            throw new Error(`Unknown Module: ${dir}`);
        }

        let __packageJson = join(__module, "package.json");
        let packageJson = JSON.parse(fs.readFileSync(__packageJson).toString());

        let target;
        if (typeof this.target != "undefined" && dir == "build") {
            target = `--target ${this.target}`;
        } else {
            target = "";
        }

        let scripts = packageJson.scripts;
        if (
            typeof scripts != "undefined" &&
            typeof scripts.build != "undefined"
        ) {
            process.chdir(__module);
            child_process.execSync(`${scripts.build} ${target}`, {
                stdio: "inherit",
            });
        }

        if (tsc) {
            child_process.execSync(`tsc`, { stdio: "inherit" });
        }
    }

    buildAll() {
        this.buildComponent(this.__core);
        this.buildComponent(this.__runtimes);
        let modules = fs.readdirSync(this.__modules);
        for (let dir of modules) {
            this.buildModule(dir);
        }
    }

    clean() {
        let modules = fs.readdirSync(this.__modules);
        for (let dir of modules) {
            let __module = join(this.__modules, dir);
            let __cargoToml = join(__module, "Cargo.toml");
            if (!fs.existsSync(__cargoToml)) {
                continue;
            }
            process.chdir(__module);
            child_process.execSync("cargo clean", { stdio: "inherit" });
        }
    }

    hoist() {
        let modules = fs.readdirSync(this.__modules);
        for (let dir of modules) {
            let __module = join(this.__modules, dir);
            let module = fs.readdirSync(__module);
            for (let file of module) {
                let regex = new RegExp(`^${dir}\\..*\\.node$`);
                if (file.match(regex) != null) {
                    let __file_src = join(__module, file);
                    let __file_dest = join(this.__root, file);
                    fs.renameSync(__file_src, __file_dest);
                }
            }
        }
    }

    resolve() {
        let __path = this.__root;
        if (typeof this.env.args[1] != "undefined") {
            __path = join(this.__root, this.env.args[1]);
        }

        let root = fs.readdirSync(__path);
        let modules = fs.readdirSync(this.__modules);
        for (let dir of modules) {
            let __module = join(this.__modules, dir);
            for (let file of root) {
                let __dest = join(__module, file);
                if (typeof this.env.args[1] != "undefined") {
                    __dest = join(__module, this.env.args[1], file);
                    let __dest_dir = join(__module, this.env.args[1]);
                    if (!fs.existsSync(__dest_dir)) {
                        fs.mkdirSync(__dest_dir);
                    }
                }

                let regex = new RegExp(`^${dir}\\..*\\.node$`);
                if (file.match(regex) != null) {
                    let __file_src = join(__path, file);
                    let __file_dest = __dest;
                    fs.renameSync(__file_src, __file_dest);
                }
            }
        }
    }

    sync() {
        let __packageJson = join(this.__root, "package.json");
        let packageJson = JSON.parse(fs.readFileSync(__packageJson).toString());
        this.version = packageJson.version;
        this.description = packageJson.description;
        this.license = packageJson.license;
        this.author = packageJson.author;
        //this.repository = packageJson.repository;
        this.bugs = packageJson.bugs;
        this.homepage = packageJson.homepage;
        this.engines = packageJson.engines;

        this.syncPackage(this.__core);
        this.syncConfig();

        let modules = fs.readdirSync(this.__modules);
        for (let dir of modules) {
            let __module = join(this.__modules, dir);
            this.syncPackage(__module);

            let __cargoToml = join(__module, "Cargo.toml");
            let __npm = join(__module, "npm");
            if (!fs.existsSync(__cargoToml) && !fs.existsSync(__npm)) {
                continue;
            }

            let npm = fs.readdirSync(__npm);
            for (let dir of npm) {
                let __target = join(__npm, dir);
                this.syncPackage(__target);
            }
        }
    }

    syncPackage(dir) {
        let __packageJson = join(dir, "package.json");
        let packageJson = JSON.parse(fs.readFileSync(__packageJson).toString());
        packageJson.version = this.version;
        packageJson.description = this.description;
        packageJson.license = this.license;
        packageJson.author = this.author;
        //packageJson.repository = this.repository;
        packageJson.bugs = this.bugs;
        packageJson.homepage = this.homepage;
        packageJson.engines = this.engines;

        fs.writeFileSync(
            __packageJson,
            JSON.stringify(packageJson, undefined, 2) + "\n",
        );
    }

    syncConfig() {
        let __configToml = join(this.__core, "config.toml");
        let configToml = fs.readFileSync(__configToml).toString();
        configToml = configToml.replace(
            /^version = ".*\..*\..*"$/m,
            `version = "${this.version}"`,
        );
        fs.writeFileSync(__configToml, configToml);
    }

    test() {
        if (this.env.args.length < 2) {
            this.testAll();
            return;
        }
        let i = 1;
        while (i < this.env.args.length) {
            switch (this.env.args[i]) {
                case "-m":
                case "--module":
                    this.testModule(this.env.args[i + 1]);
                    i += 2;
                    break;
                case "-c":
                case "--core":
                    this.testCore();
                    i++;
                    break;

                case "-cm":
                    this.testCore();
                    this.testModule(this.env.args[i + 1]);
                    i += 2;
                    break;

                default:
                    throw new Error(`Unknown Option: ${this.env.args[i]}`);
            }
        }
    }

    testCore() {
        let __packageJson = join(this.__core, "package.json");
        let packageJson = JSON.parse(fs.readFileSync(__packageJson).toString());

        let scripts = packageJson.scripts;
        if (
            typeof scripts != "undefined" &&
            typeof scripts.test != "undefined"
        ) {
            process.chdir(this.__core);
            child_process.execSync(`${this.__bin}/${scripts.test} ${target}`, {
                stdio: "inherit",
            });
        }
    }

    testModule(dir) {
        let __module = join(this.__modules, dir);
        if (!fs.existsSync(__module)) {
            throw new Error(`Unknown Module: ${dir}`);
        }

        let __packageJson = join(__module, "package.json");
        let packageJson = JSON.parse(fs.readFileSync(__packageJson).toString());

        let scripts = packageJson.scripts;
        if (
            typeof scripts != "undefined" &&
            typeof scripts.test != "undefined"
        ) {
            process.chdir(__module);
            child_process.execSync(`${this.__bin}/${scripts.test}`, {
                stdio: "inherit",
            });
        }
    }

    testAll() {
        this.testCore();
        let modules = fs.readdirSync(this.__modules);
        for (let dir of modules) {
            this.testModule(dir);
        }
    }

    universal() {
        let modules = fs.readdirSync(this.__modules);
        for (let dir of modules) {
            let __module = join(this.__modules, dir);

            let __packageJson = join(__module, "package.json");
            let packageJson = JSON.parse(
                fs.readFileSync(__packageJson).toString(),
            );

            let scripts = packageJson.scripts;
            if (
                typeof scripts != "undefined" &&
                typeof scripts.universal != "undefined"
            ) {
                process.chdir(__module);
                child_process.execSync(`${this.__bin}/${scripts.universal}`, {
                    stdio: "inherit",
                });
            }
        }
    }
}

module.exports = { Main };
