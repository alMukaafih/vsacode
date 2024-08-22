const child_process = require("child_process");
const fs = require("fs");
const path = require("path");

class Main {
    constructor(env) {
        this.env = env;
        this.__root = path.resolve(this.env.home, "..");
        this.__bin = path.join(this.__root, "node_modules", ".bin");
        if (process.platform == "win32") {
            process.env.PATH += `;${this.__bin}`;
        }
        process.env.PATH += `:${this.__bin}`;
        this.__core = path.resolve(this.__root, "core");
        this.__modules = path.resolve(this.__root, "modules");
    }

    init() {
        switch (this.env.args[0]) {
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
                throw new Error(`Unknown Command: ${this.env.args[0]}`);
        }
    }

    build() {
        if (this.env.args.length < 2) {
            this.buildAll();
            return;
        }
        let i = 1;
        let strategy = {};
        while (i < this.env.args.length) {
            switch (this.env.args[i]) {
                case "-m":
                case "--module":
                    strategy.module = this.env.args[i + 1];
                    i += 2;
                    break;
                case "-c":
                case "--core":
                    strategy.core = true;
                    i++;
                    break;

                case "-cm":
                    strategy.core = true;
                    strategy.module = this.env.args[i + 1];
                    i += 2;
                    break;

                case "--hoist":
                    strategy.hoist = true;
                    i++;
                    break;

                case "-t":
                case "--target":
                    strategy.target = this.env.args[i + 1];
                    i += 2;
                    break;

                default:
                    throw new Error(`Unknown Option: ${this.env.args[i]}`);
            }
        }

        if (strategy.core) {
            this.buildCore();
        }

        if (typeof strategy.target != "undefined") {
            this.target = strategy.target;
            let modules = fs.readdirSync(this.__modules);
            for (let dir of modules) {
                this.buildModule(dir);
            }
        }
        else if (typeof strategy.module != "undefined") {
            this.buildModule(strategy.module);
        }

        if (strategy.hoist) {
            this.hoist();
        }
    }

    buildCore() {
        process.chdir(this.__core);
        child_process.execSync(`tsc`, { stdio: "inherit" });
    }

    buildModule(dir) {
        let __module = path.join(this.__modules, dir);
        if (!fs.existsSync(__module)) {
            throw new Error(`Unknown Module: ${dir}`);
        }

        let __packageJson = path.join(__module, "package.json");
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
    }

    buildAll() {
        this.buildCore();
        let modules = fs.readdirSync(this.__modules);
        for (let dir of modules) {
            this.buildModule(dir);
        }
    }

    clean() {
        let modules = fs.readdirSync(this.__modules);
        for (let dir of modules) {
            let __module = path.join(this.__modules, dir);
            let __cargoToml = path.join(__module, "Cargo.toml");
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
            let __module = path.join(this.__modules, dir);
            let module = fs.readdirSync(__module);
            for (let file of module) {
                let regex = new RegExp(`^${dir}\\..*\\.node$`);
                if (file.match(regex) != null) {
                    let __file_src = path.join(__module, file);
                    let __file_dest = path.join(this.__root, file);
                    fs.renameSync(__file_src, __file_dest);
                }
            }
        }
    }

    resolve() {
        let __path = this.__root;
        if (typeof this.env.args[1] != "undefined") {
            __path = path.join(this.__root, this.env.args[1]);
        }

        let root = fs.readdirSync(__path);
        let modules = fs.readdirSync(this.__modules);
        for (let dir of modules) {
            let __module = path.join(this.__modules, dir);
            for (let file of root) {
                let __dest = path.join(__module, file);
                if (typeof this.env.args[1] != "undefined") {
                    __dest = path.join(__module, this.env.args[1], file);
                    let __dest_dir = path.join(__module, this.env.args[1]);
                    if (!fs.existsSync(__dest_dir)) {
                        fs.mkdirSync(__dest_dir);
                    }
                }

                let regex = new RegExp(`^${dir}\\..*\\.node$`);
                if (file.match(regex) != null) {
                    let __file_src = path.join(__path, file);
                    let __file_dest = __dest;
                    fs.renameSync(__file_src, __file_dest);
                }
            }
        }
    }

    sync() {
        let __packageJson = path.join(this.__root, "package.json");
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
            let __module = path.join(this.__modules, dir);
            this.syncPackage(__module);

            let __cargoToml = path.join(__module, "Cargo.toml");
            let __npm = path.join(__module, "npm");
            if (!fs.existsSync(__cargoToml) && !fs.existsSync(__npm)) {
                continue;
            }

            let npm = fs.readdirSync(__npm);
            for (let dir of npm) {
                let __target = path.join(__npm, dir);
                this.syncPackage(__target);
            }
        }
    }

    syncPackage(dir) {
        let __packageJson = path.join(dir, "package.json");
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
            JSON.stringify(packageJson, undefined, 2) + "\n"
        );
    }

    syncConfig() {
        let __configToml = path.join(this.__core, "config.toml");
        let configToml = fs.readFileSync(__configToml).toString();
        configToml = configToml.replace(
            /^version = ".*\..*\..*"$/m,
            `version = "${this.version}"`
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
        let __packageJson = path.join(this.__core, "package.json");
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
        let __module = path.join(this.__modules, dir);
        if (!fs.existsSync(__module)) {
            throw new Error(`Unknown Module: ${dir}`);
        }

        let __packageJson = path.join(__module, "package.json");
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
            let __module = path.join(this.__modules, dir);

            let __packageJson = path.join(__module, "package.json");
            let packageJson = JSON.parse(
                fs.readFileSync(__packageJson).toString()
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
