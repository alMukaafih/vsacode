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

        /** Module attributes */
        attributes: {
            /** Is an Internal command? */
            internal: boolean;

            /** Requires Temporary Directory? */
            tmpDir: boolean;
        }
    }>;

    /** Command aliases */
    aliases: {
        flags: Record<string, string>;
        modules: Record<string, string>;
    }
}