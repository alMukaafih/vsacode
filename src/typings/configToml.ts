export interface IconfigToml {
    version: string
    commands: Record<string, {
            name: string
            subcommands: string[]
            options: string[]
        }>
    engines: Record<string, {
            name: string
            modes: string[]
            template: string
        }>
}