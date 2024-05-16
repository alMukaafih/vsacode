interface IconfigToml {
    version: string
    commands: Record<string, {
            name: string
            path: string
            subcommands: string[]
            options: string[]
        }>
    engines: Record<string, {
            name: string
            path: string
            modes: string[]
            template: string
        }>
}