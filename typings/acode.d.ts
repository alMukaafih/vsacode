type Strings = string[];
declare var acode: AcodeApi.Acode;

type LanguageMap = { [key: string]: string };
declare const strings: LanguageMap;
declare const ASSETS_DIRECTORY: string;
declare const DATA_STORAGE: string;
declare const CACHE_STORAGE: string;
declare const PLUGIN_DIR: string;
declare const KEYBINDING_FILE: string;
declare const IS_FREE_VERSION: string;
declare const ANDROID_SDK_INT: number;
declare const DOES_SUPPORT_THEME: boolean;

interface String{
    /**
     * Capitalize the first letter of a string
     */
    capitalize(): string;
    /**
     * Generate a hash from a string
     */
    hash(): string;
}

declare namespace AcodeApi {
    interface WCPage extends HTMLElement {
        on(event: 'hide' | 'show', cb: (this: WCPage) => void): void;
        off(event: 'hide' | 'show', cb: (this: WCPage) => void): void;
        
        settitle(title: string): void;
        
        id: string,
        
        hide(): void;
        show(): void;
        
        get body(): HTMLElement | null;
        set body($el: HTMLElement | null);
        
        get innerHTML(): string;
        set innerHTML(html: string);
        
        get textContent(): string | null;
        set textContent(text: string);
        
        get lead(): HTMLElement;
        set lead($el: HTMLElement);
        
        get header(): HTMLElement;
        set header($el: HTMLElement);
    }
    
    interface Input {
        id: string;
        required?: boolean;
        type: string;
        match?: RegExp;
        value?: string;
        placeholder?: string;
        hints?: string;
        name?: string;
        disabled?: boolean;
        readOnly?: boolean;
        autofocus?: boolean;
        hidden?: boolean;
        onclick?: (event: Event) => void;
        onchange?: (event: Event) => void;
    }
    interface Acode {
        /**
         * Define a module
         * @param name
         * @param module
         */
        define(name: string, module: Object | Function ): void;

        /**
         * This method is used to require a module. 
         * @param module The name of the module. Module name is case insensitive.
         */
        require(module: string): any;

        /**
         * This method executes a command defined in file src/lib/commands.js.
         * @param command The name of the command. Command name is case insensitive.
         * @param value The value of the command. 
         */
        exec(command: string, value?: any): boolean | undefined;

        get exitAppMessage(): string | undefined;

        setLoadingMessage(message: string): void;

         /**
         * Sets plugin init function
         * @param id 
         * @param initFunction 
         * @param settings 
         */
        setPluginInit(
            id: string,
            initFunction: (baseUrl: string, $page: WCPage, options?: PluginInitOptions) => Promise<void>,
            settings?: Settings
        ): void;

        getPluginSettings(id: string): any;

        setPluginUnmount(id: string, unmountFunction: () => void): void;

        /**
         * @param id plugin id
         * @param baseUrl local plugin url
         * @param $page
         */
        initPlugin(id: string, baseUrl: string, $page: WCPage, options?: any): Promise<void>;

        unmountPlugin(id: string): void;

        registerFormatter(id: string, extensions: string[], format: () => Promise<void>): void;

        unregisterFormatter(id: string): void;

        format(selectIfNull?: boolean): Promise<void>;

        fsOperation(file: string): any;

        newEditorFile(filename: string, options?: any): void;

        // readonly formatters(): { id: string; name: string; exts: string[] }[];

        /**
         * @param extensions
         * @returns options
         */
        getFormatterFor(extensions: string[]): [id: string, name: string][];

        alert(title: string, message: string, onhide: ()=>void): void;
        
        loader(title: string, message: string, cancel: { timeout: number,callback: ()=>void }): void;
        
        joinUrl(...args: string[]): string;
        
        addIcon(className: string, src: string): void;
        
        prompt(
            message: string,
            defaultValue: string,
            type: 'textarea' | 'text' | 'number' | 'tel' | 'search' | 'email' | 'url',
            options?: {
                match: RegExp,
                required: boolean,
                placeholder: string,
                test: (value: any) => boolean
            }
        ): Promise<any>;
        
        confirm(title: string, message: string): Promise<boolean>;
        
        select(
            title: string,
            options: [string, string, string, boolean][] | string,
            opts?: {
                onCancel?: () => void;
                onHide?: () => void;
                hideOnSelect?: boolean;
                textTransform?: boolean;
                default?: string;
            } | boolean
        ): Promise<any>;
        
        multiPrompt(title: string, inputs: Array<Input | Input[]>, help: string): Promise<Strings>;
        
        fileBrowser(mode: 'file' | 'folder' | 'both', info: string, doesOpenLast: boolean): Promise<
        | {
            name: string;
            type: 'file';
            url: string;
        }
        | {
            list: {
            icon: string;
            isDirectory: boolean;
            isFile: boolean;
            mime: string;
            name: string;
            type: 'file' | 'folder';
            uri: string;
            url: string;
            }[];
            scroll: number;
            name: string;
            type: 'folder';
            url: string;
        }
        >;
        
        toInternalUrl(url: string): Promise<string>;
    }
    interface Url {
        /**
         * Returns basename from a url eg. 'index.html' from 'ftp://localhost/foo/bar/index.html'
         * @param url 
         * @returns 
         */
        basename: (url: string) => string
        /**
         * Checks if given urls are same or not
         * @param urls 
         * @returns 
         */
        areSame: (...urls: string[]) => boolean
        extname: (url: string) => string | null
        join: (...pathnames: string[]) => string
        safe: (url: string) => string
        pathname: (url: string) => string
        dirname: (url: string) => string
        parse: (url: string) => { url: string, query: string }
        formate: (urlObj: {
            protocol: "ftp:" | "sftp:" | "http:" | "https:"
            hostname: string | number
            path: string
            username: string
            password: string
            port: string | number
            query: object
        }) => string
        getProtocol: (url: string) => "ftp:" | "sftp:" | "http:" | "https:"
        hidePassword: (url: string) => string
        decodeUrl: (url: string) => {
            protocol: "ftp:" | "sftp:" | "http:" | "https:"
            hostname: string | number
            path: string
            username: string
            password: string
            port: string | number
            query: object
        }
        trimSlash: (url: string) => string
    }
    /**
     * You can use this parameter to define the settings of the plugin. The settings will be displayed in the plugin page.
     */
    interface Settings {
        /**
         * An array of settings
         */
        list: {
            /**
             * The key of the setting. This key will be used to access the value of the setting.
             */
            key: string
            /**
             * The text of the setting. This text will be displayed in the settings page.
             */
            text: string
            /**
             * The icon of the setting. This icon will be displayed in the settings page.
             */
            icon? :string
            /**
             * The info of the setting. This info will be displayed in the settings page.
             */
            info?: string
            /**
             * The value of the setting. This value will be displayed in the settings page.
             */
            value?: any
            /**
             * The value text of the setting. This value text will be displayed in the settings page.
             * @param value 
             * @returns 
             */
            valueText?: (value: any) => string
            /**
             * If this property is set to true, the setting will be displayed as a checkbox.
             */
            checkbox?: boolean
            /**
             * If this property is set to an array, the setting will be displayed as a select.
             * The array should contain the options of the select.
             * Each option can be a string or an array of two strings.
             * If the option is a string, the value and the text of the option will be the same.
             * If the option is an array of two strings,
             * the first string will be the value of the option and the second string will be the text of the option.
             */
            select?: (string | string[])[]
            /**
             * If this property is set to true, the setting will be displayed as a prompt.
             */
            prompt?: string
            /**
             * The type of the prompt. This property is only used when the prompt property is set to true. The default value is text.
             */
            promptType?: string
            /**
             * The options of the prompt. This property is only used when the prompt property is set to true and the promptType property is set to select.
             */
            promptOptions?: {
                /**
                 * The regular expression to match the value.
                 */
                match: RegExp
                /**
                 * If this property is set to true, the value is required.
                 */
                required: boolean
                /**
                 * The placeholder of the prompt.
                 */
                placeholder: string
                /**
                 * The test function to test the value.
                 * @param value 
                 * @returns 
                 */
                test: (value: any) => boolean
    
            }[]
        }[]
        /**
         * The callback function that will be called when the settings are changed.
         * @param key 
         * @param value 
         * @returns 
         */
        cb: (key: string, value: any) => void
    }
    /**
     * This object can be used to access the cached files
     */
    interface PluginInitOptions {
        /**
         * Url of the cached file.
         */
        cacheFileUrl: string
        /**
         * File object of the cached file. Using this object, you can write/read the file.
         */
        cacheFile: File
        /**
         * If this is the first time the plugin is loaded, this value will be true. Otherwise, it will be false.
         */
        firstInit: boolean
    }
    interface SidebarApps {
        /**
         * @param icon icon of the app
         * @param id id of the app
         * @param initFunction
         * @param prepend weather to show this app at the top of the sidebar or not
         * @param onSelected
         * @returns
         */
        add: (
            icon: string,
            id: string,
            title: string,
            initFunction: (container: HTMLElement) => void,
            prepend?: boolean,
            onSelected?: (container: HTMLElement) => void
        ) => void
        /**
         * Removes a sidebar app with the given ID.
         * @param id - The ID of the sidebar app to remove.
         * @returns
         */
        remove: (id: string) => void 
    }
    /**
     * The fs module provides an API for interacting with the file system in Acode.
     * It allows for operations such as reading, writing, and manipulating files and directories.
     * @param url either the location of any file or directory
     */
    function fs (url: string): FileSystem
    interface FileSystem {
        /**
         * It is used to list the contents of a specified directory,
         * including all subdirectories and files within it.
         */
        lsDir: () => Promise<string[]>
        /**
         * It allows you to read the contents of a specified file.
         * @param encoding
         * @returns 
         */
        readFile: (encoding?: string) => Promise<string>
        /**
         * It creates a new, empty file in the specified location with the specified file {name}.
         * If a file with the same name already exists, it will be overwritten.
         * @param name 
         * @param content 
         * @returns 
         */
        createFile: (name: string, content: string) => Promise<string>
        /**
         * It is used to write data to a file.
         * @param content 
         * @returns 
         */
        writeFile: (content: string | ArrayBuffer) => Promise<void>
        /**
         * It is used to create a new directory in the file system.
         * @param name 
         * @returns 
         */
        createDirectory: (name: string) => Promise<string>
        /**
         * It is used to remove a specified file or directory from the file system.
         * It is important to use caution when using this method as deleted files and directories cannot be recovered.
         * @returns 
         */
        delete: () => Promise<void>
        /**
         * It is used to copy a file or directory from a specified source path to a specified destination path.
         * @param destination
         * @returns
         */
        copyTo: (destination: string) => Promise<string>
        /**
         * It allows you to move a file or directory from its current location to a new destination.
         * @param destination 
         * @returns 
         */
        moveTo: (destination: string) => Promise<string>
        /**
         * It allows for the renaming of a file or directory.
         * @param newName 
         * @returns 
         */
        renameTo: (newName: string) => Promise<string>
        /**
         * It checks if a specified file or directory exists in the file system and returns a boolean value indicating the result.
         */
        exists: () => Promise<boolean>
    }
}
