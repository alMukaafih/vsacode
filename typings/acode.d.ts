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

        require(module: string): any;

        exec(key: string, val: any): boolean | undefined;

        get exitAppMessage(): string | undefined;

        setLoadingMessage(message: string): void;

        setPluginInit(
            id: string,
            initFunction: (baseUrl: string, $page: WCPage, options?: any) => Promise<void>,
            settings?: any
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
                test: (any)=>boolean
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
}
