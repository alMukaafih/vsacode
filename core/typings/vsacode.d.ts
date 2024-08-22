declare namespace Vsa {
    interface Env {
        args: Array<Arg>;
        buildDir?: string;
        home: string;
        isDebug: boolean;
        tmpDir?: string;
    }

    enum ArgType {
        Flag, Param
    }

    interface Arg {
        type: ArgType;
        key: string;
        value?: string;
    }

    class Component {
        constructor(env: Env, module?: any);
        init(): void;
    }

    interface Module {
        Main: typeof Component;
    }
}
