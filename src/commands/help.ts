import { style } from "ziyy";

async function main(env: Env) {
    const { default: exec } = await import(`./${env.cmd.name}.js`)
    const help_msg = exec.help()
    process.stdout.write(style(help_msg))
    
}

async function help(env: Env) {
    const { default: exec } = await import(`./${env.cmd.name}.js`)
    const help_msg = exec.help()
    return (err = 0) => {
        process.stdout.write(style(help_msg))
        process.exit(err)
    }
}

async function short_help(env: Env) {
    const { default: exec } = await import(`./${env.cmd.name}.js`)
    const help_msg = exec.short_help()
    return (err = 0) => {
        process.stdout.write(style(help_msg))
        process.exit(err)
    }
}


export default {
    main, help, short_help
}