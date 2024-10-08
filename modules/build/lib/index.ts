import {
    Binding,
    Env,
    RunnerOptions,
    SvgoConfig,
    WebPackConfig,
} from "../index";
import _webpack from "webpack";
import { optimize } from "svgo";
import generateFonts from "fantasticon";
import { promisify } from "util";

var isDebug = false;

async function webpack(arg: WebPackConfig): Promise<boolean> {
    let __webpack = promisify(_webpack) as (options: _webpack.Configuration) => Promise<_webpack.Stats | undefined>;
    let stats = await __webpack(arg);
    if (typeof stats !== "undefined") {
        if (isDebug) console.log(stats);
        return stats.hasErrors();
    }
    return false;
}

function svgo(input: string, config: SvgoConfig): string {
    return optimize(input, config).data;
}

function fantasicon(userOptions: RunnerOptions) {
    generateFonts(userOptions).then(() => {});
}

export class Main implements Vsa.Component {
    binding: Binding;
    env: Env;

    constructor(env: Env) {
        this.env = env;
        isDebug = env.isDebug;
        this.binding = new Binding(env, fantasicon, svgo, webpack);
    }
    init() {
        this.binding.init();
    }
}
