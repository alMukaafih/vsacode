declare namespace Vsa {
    interface Env {
        args?: Array<string>
        buildDir?: string
        currentDir: string
        flags?: Array<string>
        home: string
        tmpDir?: string
        vsixPath?: string
    }

    class Component {
        constructor(env: Env);
        init(): void;
    }

    interface Module {
        Main: typeof Component;
    }
}