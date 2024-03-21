export interface IconfigToml {
    commands: {
        [command: string]: {
            name: string
            subcommands: string[]
            options: string[]
        }
    }
    engines: {
        [engine: string]: {
            name: string
            modes: string[]
            template: string
        }
    }
}