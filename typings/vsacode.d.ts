/**
 * Environment variables
 */
interface Env {
    /**
     * Styles error message.
     * @param message
     * @returns Styled string
     */
    err: (message: string) => string
    /**
     * Root directory of package.
     */
    home: string
    /**
     * Temporary directory.
     */
    tmpDir?: string
    /**
     * Available engines.
     */
    engines?: IconfigToml["engines"]
    /**
     * Command internal data.
     */
    cmd?: Record<string, any>
    /**
     * Name of vsix file.
     */
    vsix?: string
    /**
     * VS Code Extension package.json file.
     */
    packageJson?: any
    /**
     * Build directory.
     */
    buildDir?: string
    /**
     * Output directory.
     */
    outDir?: string
    /**
     * Number of times engine runs.
     */
    runtime?: number
    /**
     * Engine internal data.
     */
    engine?: Record<string, any>
    /**
     * Contribution point information.
     */
    contrib?: Record<string, any>
    /**
     * Build directory of contribution.
     */
    base?: string
    /**
     * Dist directory.
     */
    dist?: string
    /**
     * Id of contribution.
     */
    id?: string
    /**
     * Label of contribution.
     */
    label?: string
    /**
     * Path of contribution.
     */
    path?: string
    /**
     * Dirname of VS Code Extension package.json file.
     */
    root?: string
    /**
     * IconTheme JSON file.
     */
    iconJson?: any
    /**
     * Cached assets.
     */
    assetList?: Record<string, any>
    /**
     * Icons definition.
     */
    iconDefs?: DefsMap
    /**
     * Assets directory
     */
    assets?: string
    /**
     * Zip Data
     */
    zipData?: Buffer
    /**
     * CSS file name list
     */
    cssList?: string[]
    /**
     * Plugin id
     */
    pluginId?: string
}