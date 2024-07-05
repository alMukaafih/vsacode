/**
 * Environment variables
 */
interface Env {
    /**
     * Assets directory
     */
    assets?: string

    /**
     * Cached assets.
     */
    assetList?: Record<string, string>

    /**
     * Build directory of contribution.
     */
    base?: string

    /**
     * Build directory.
     */
    buildDir?: string

    /**
     * Command internal data.
     */
    cmd?: IconfigToml["commands"][""]

    /**
     * Contribution point information.
     */
    contrib?: Record<string, any>

    /**
     * CSS file name list
     */
    cssList?: string[]

    /**
     * Dist directory.
     */
    dist?: string

    /**
     * Engine internal data.
     */
    engine?: IconfigToml["engines"][""]

    /**
     * Available engines.
     */
    engines?: IconfigToml["engines"]

    /**
     * Styles error message.
     * @param message
     * @returns Styled string
     */
    err?: (message: string) => string

    /**
     * Root directory of package.
     */
    home: string

    /**
     * Id of contribution.
     */
    id?: string

    /**
     * Icons definition.
     */
    iconDefs?: DefsMap

    /**
     * IconTheme JSON file.
     */
    iconJson?: any

    /**
     * Label of contribution.
     */
    label?: string

    /**
     * Output directory.
     */
    outDir?: string

    /**
     * VS Code contribution
     *  package.json file.
     */
    packageJson?: any

    /**
     * Path of contribution.
     */
    path?: string

    /**
     * Plugin id
     */
    pluginId?: string

    /**
     * Dirname of VS Code contribution
     *  JSON file.
     */
    root?: string

    /**
     * Number of times engine runs.
     */
    runtime?: number

    /**
     * Subcommand
     */
    subCmd?: string | "main"

    /**
     * Skip style generation
     */
    skipStyles?: boolean

    /**
     * Temporary directory.
     */
    tmpDir?: string

    /**
     * Name of vsix file.
     */
    vsix?: string

    /**
     * Zip Data
     */
    zipData?: Buffer | Uint8Array
}
declare namespace VsaApi {
    /**
     * An contribution
     *
     */
    interface Contribution {
        /**
         * Name of contribution
         *
         */
        name: string
        /**
         * Activate contribution
         *
         */
        activate(): void
        /**
         * Deactivate contribution
         *
         */
        deactivate(): void
    }

    /**
     * List of contributions
     */
    interface Contributions {
        [id: string]: Contribution
    }

    interface ModulesMap {
        iconThemes: VsaApi.Contributions
        prodctIconThemes: VsaApi.Contributions
    }

    /**
     * A Setting
     */
    class Setting {
        /**
         * Add a setting
         * @param id
         * @param name
         */
        add(id: string, name: string): void
        /**
         * Remove a setting
         * @param id
         */
        remove(id: string): void
        /**
         * Returns the list of settings
         */
        list(): string[][]
    }

    interface Vsacode {
        activeIconTheme: string
        activeProductIconTheme: string
        modules?: Record<string, any>
        define?: (module: string, value: any) => void
        require?: (module: string) => void
    }
}

declare namespace AcodeApi {
    interface ModulesMap {
        iconThemes: VsaApi.Contributions
        prodctIconThemes: VsaApi.Contributions
    }
}

declare var vsacode: VsaApi.Vsacode