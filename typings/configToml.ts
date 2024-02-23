export interface IconfigToml {
    commands: {
        [command: string]: {
            name: string
            options: string[]
            flags: string[]
        }
    }
    contributes: {
        [contribute: string]: {
            name: string
            options: string[]
            template: string
        }
    }
}