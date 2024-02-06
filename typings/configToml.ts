export interface IconfigToml {
    commands: {
        [command: string]: {
            engine: string
            contrib: string
            options: string[]
            errorMessage: string
        }
    }
}