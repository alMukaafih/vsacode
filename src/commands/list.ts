async function main(env) {
    const contributes = env.packageJson.contributes
    let _engine
    env.runtime = 0
    for (const k in contributes) {
        _engine = env.engines[k]
        if (_engine == undefined)
            continue
        env.engine = _engine.name
        const { default: engine } = await import(`../engines/${_engine.name}.js`);
        // process each contrib
        for (const contrib of contributes[k]) {
            env.contrib = contrib
            engine.fmt(env);
            env.runtime++
        }
    }
    if (!env.runtime)
        console.error(env.err("could not process file"))
    
}

export default {
    main
}