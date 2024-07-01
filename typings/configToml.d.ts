/**
 * Configuration file for vsacode.
 */
interface IconfigToml {
    /**
     * vsacode's version.
     */
    version: string
    /**
     * Commands configuration.
     */
    commands: Record<string, {
            /**
             * Name of command.
             */
            name: string
            /**
             * Path to file that contains the command.
             */
            path: string
            /**
             * Subcommands under command.
             */
            subcommands: string[]
            /**
             * Options command accepts
             */
            options: string[]
            /**
             * Requires vsix file to run?
             */
            vsix: boolean
        }>
    /**
     * Engines configuration.
     */
    engines: Record<string, {
            /**
             * Name of engine to use during build command, corresponds to vscode contribution point.
             */
            name: string
            /**
             * Path to file that contains the engine.
             */
            path: string
            /**
             * Modes the engine runs in.
             */
            modes: string[]
            /**
             * Template file for engine.
             */
            template: string
        }>
}