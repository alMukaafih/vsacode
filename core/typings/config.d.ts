/** Configuration file */
interface Config {
    /** Version */
    version: string;
    /** Expected flags */
    flags: Record<string, string>;

    /** Modules. Each module implicitly provides a command named after it */
    modules: Record<string, {
        /** The package name of the module */
        import: string;

        /** Expected flags */
        flags: Record<string, {
            /** Does flag require an argument? */
            arg: boolean
        }>;

        /** Module attributes */
        attributes: {
            /** Expects arguments? */
            args: boolean;

            /** Is an Internal command? */
            internal: boolean;

            /** Has subcommands? */
            subCmd: boolean;

            /** Requires Temporary Directory? */
            tmpDir: boolean;

            /** Requires vsix file? */
            vsix: boolean;
        }
    }>;

    /** Command aliases */
    aliases: {
        flags: Record<string, string>;
        modules: Record<string, string>;
    }
}