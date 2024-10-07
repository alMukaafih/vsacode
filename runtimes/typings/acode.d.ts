type Strings = string[];
declare var acode: AcodeApi.Acode;
declare var editorManager: AcodeApi.EditorManager;
declare var tag: typeof AcodeApi.tag;
declare var toast: (message: string, duration: number) => void;

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

interface Window {
    ASSETS_DIRECTORY: string;
    DATA_STORAGE: string;
    CACHE_STORAGE: string;
    PLUGIN_DIR: string;
    KEYBINDING_FILE: string;
    IS_FREE_VERSION: string;
    ANDROID_SDK_INT: number;
    DOES_SUPPORT_THEME: boolean;
    acode: AcodeApi.Acode;
    editorManager: AcodeApi.EditorManager;
    tag: typeof AcodeApi.tag;
    toast(message: string, duration: number): void;
}

interface String {
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
    /**
     * This object is used to set/remove ace modes.
     */
    interface AceModes {
        /**
         * Adds a new mode to ace editor.
         * @param name Mode name
         * @param extensions Array of extensions
         * @param caption Mode caption or display name
         * @returns
         */
        addMode(
            name: string,
            extensions: string | string[],
            caption: string
        ): void;
        /**
         * Removes a mode from ace editor.
         * @param name  Mode name
         * @returns
         */
        removeMode(name: string): void;
    }
    interface Acode {
        /**
         * Define a module
         * @param name
         * @param module
         */
        define(name: string, module: Object | Function): void;

        /**
         * This method is used to require a module.
         * @param module The name of the module. Module name is in camelCase.
         */
        require<K extends keyof ModulesMap>(module: K): ModulesMap[K];

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
            initFunction: (
                baseUrl: string,
                $page: WCPage,
                options?: PluginInitOptions
            ) => Promise<void>,
            settings?: PluginSettings
        ): void;

        getPluginSettings(id: string): any;

        setPluginUnmount(id: string, unmountFunction: () => void): void;

        /**
         * @param id plugin id
         * @param baseUrl local plugin url
         * @param $page
         */
        initPlugin(
            id: string,
            baseUrl: string,
            $page: WCPage,
            options?: any
        ): Promise<void>;

        unmountPlugin(id: string): void;

        registerFormatter(
            id: string,
            extensions: string[],
            format: () => Promise<void>
        ): void;

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

        alert(title: string, message: string, onhide: () => void): void;

        loader(
            title: string,
            message: string,
            cancel: { timeout: number; callback: () => void }
        ): void;

        joinUrl(...args: string[]): string;

        addIcon(className: string, src: string): void;

        prompt(
            message: string,
            defaultValue: string,
            type:
                | "textarea"
                | "text"
                | "number"
                | "tel"
                | "search"
                | "email"
                | "url",
            options?: {
                match: RegExp;
                required: boolean;
                placeholder: string;
                test: (value: any) => boolean;
            }
        ): Promise<any>;

        confirm(title: string, message: string): Promise<boolean>;

        select(
            title: string,
            options: [string, string, string, boolean][] | string,
            opts?:
                | {
                      onCancel?: () => void;
                      onHide?: () => void;
                      hideOnSelect?: boolean;
                      textTransform?: boolean;
                      default?: string;
                  }
                | boolean
        ): Promise<any>;

        multiPrompt(
            title: string,
            inputs: Array<Input | Input[]>,
            help: string
        ): Promise<Strings>;

        fileBrowser(
            mode: "file" | "folder" | "both",
            info: string,
            doesOpenLast: boolean
        ): Promise<
            | {
                  name: string;
                  type: "file";
                  url: string;
              }
            | {
                  list: {
                      icon: string;
                      isDirectory: boolean;
                      isFile: boolean;
                      mime: string;
                      name: string;
                      type: "file" | "folder";
                      uri: string;
                      url: string;
                  }[];
                  scroll: number;
                  name: string;
                  type: "folder";
                  url: string;
              }
        >;

        toInternalUrl(url: string): Promise<string>;
    }

    /**
     * A string that can be "file", "folder" or "both"
     */
    type BrowseMode = "file" | "folder" | "both";

    /** Editor Event */
    const enum EditorEvent {
        addFolder = "add-folder",
        change = "changed",
        fileContentChanged = "file-content-changed",
        fileLoaded = "file-loaded",
        initOpenFileList = "init-open-file-list",
        newFile = "new-file",
        removeFile = "remove-file",
        removeFolder = "remove-folder",
        renameFile = "rename-file",
        saveFile = "save-file",
        switchFile = "switch-file",
    }

    /**
     *
     */
    class EditorFile {
        /**
         *
         */
        constructor(name: string, options: FileOptions);

        /** File name */
        filename: string;

        /** File location on the device */
        uri: string;

        /** End of line */
        eol: "windows" | "unix";

        isUnsaved: boolean;
        session: AceApi.Ace.EditSession;

        on(event: string, callback: (file: EditorFile, e: Event) => void): void;

        /** Makes this file active */
        makeActive(): void;
        removeActive(): void;

        /** Saves the file. */
        save(): Promise<boolean>;
    }

    interface EditorManager {
        /** This property returns the current file. */
        activeFile: EditorFile;
        /** This is an instance of the Ace editor. */
        editor: AceApi.Ace.Editor;
        files: EditorFile[];
        /** This function adds a listener for the specified event. */
        emit(event: EditorEvent, ...args: any[]): void;
        on(
            event:
                | EditorEvent.saveFile
                | EditorEvent.switchFile
                | EditorEvent.removeFile
                | EditorEvent.fileLoaded
                | EditorEvent.fileContentChanged,
            listener: (file: EditorFile) => void
        ): void;
        on(
            event: EditorEvent.change,
            listener: (delta: AceApi.Ace.Delta) => void
        ): void;
        on(event: EditorEvent, listener: (...args: any[]) => void): void;

        off(event: string, listener: (...args: any[]) => void): void;
    }

    /**
     *
     */
    interface FileOptions {}

    /**
     *
     */
    interface FileSystem {
        /**
         * It is used to list the contents of a specified directory,
         * including all subdirectories and files within it.
         */
        lsDir?(): Promise<string[]>;

        /**
         * It allows you to read the contents of a specified file.
         * @param encoding
         * @returns
         */
        readFile(): Promise<ArrayBuffer>;

        /**
         * It allows you to read the contents of a specified file.
         * @param encoding
         * @returns
         */
        readFile(encoding: "utf8"): Promise<string>;

        /**
         * It creates a new, empty file in the specified location with the specified file {name}.
         * If a file with the same name already exists, it will be overwritten.
         * @param name
         * @param content
         * @returns
         */
        createFile(name: string, content?: string): Promise<string>;

        /**
         * It is used to write data to a file.
         * @param content
         * @returns
         */
        writeFile(content: string | ArrayBuffer): Promise<void>;

        /**
         * It is used to create a new directory in the file system.
         * @param name
         * @returns
         */
        createDirectory(name: string): Promise<string>;

        /**
         * It is used to remove a specified file or directory from the file system.
         * It is important to use caution when using this method as deleted files and directories cannot be recovered.
         * @returns
         */
        delete(): Promise<void>;

        /**
         * It is used to copy a file or directory from a specified source path to a specified destination path.
         * @param destination
         * @returns
         */
        copyTo(destination: string): Promise<string>;

        /**
         * It allows you to move a file or directory from its current location to a new destination.
         * @param destination
         * @returns
         */
        moveTo(destination: string): Promise<string>;

        /**
         * It allows for the renaming of a file or directory.
         * @param newName
         * @returns
         */
        renameTo(newName: string): Promise<string>;

        /**
         * It checks if a specified file or directory exists in the file system and returns a boolean value indicating the result.
         */
        exists?(): Promise<boolean>;
    }

    /**
     *
     */
    interface Helpers {
        /**
         * This helper method takes in a single parameter, a string named "filename", and returns a string representing an icon class for the file specified by the filename.
         * The icon class returned corresponds to the file type, which is determined by the file extension of the provided filename.
         * In simple, It will return icon according to filename.
         * @param filename The name of the file for which the icon class is to be returned.
         * @returns A string representing an icon class for the file specified by the filename. The icon class returned corresponds to the file type, which is determined by the file extension of the provided filename.
         */
        getIconForFile(filename: string): string;

        /**
         * Checks whether given type is file or not
         * @returns
         */
        isFile(type: "file" | "link"): boolean;

        /**
         * Checks whether given type is directory or not
         * @returns
         */
        isDir(type: "dir" | "directory" | "folder"): boolean;
    }

    /**
     *
     */
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

    /**
     * Adds and remove intent handler for the app.
     * The intent handler supports URI scheme acode://<module>/<action>/<value>.
     * The intent handler is used to open the app from other apps.
     */
    interface Intent {
        /**
         * Adds an intent handler to the app. The handler will be called when the app is opened from other apps.
         * @param handler
         * @returns
         */
        addHandler(handler: (event: IntentEvent) => void): void;

        /**
         * Removes an intent handler from the app.
         * @param handler
         * @returns
         */
        removeHandler(handler: (event: IntentEvent) => void): void;
    }

    /**
     *
     */
    interface IntentEvent {
        /**
         * The module name.
         */
        module: string;

        /**
         * The action name.
         */
        action: string;

        /**
         * The value.
         */
        value: string;

        /**
         * Prevents the default behavior of the intent.
         */
        preventDefault: () => void;

        /**
         * Stops the propagation of the intent.
         */
        stopPropagation: () => void;
    }

    /**
     * Builtin acode modules
     */
    interface ModulesMap {
        EditorFile: typeof EditorFile;
        ThemeBuilder: typeof ThemeBuilder;
        aceModes: AceModes;
        actionStack: any;
        addedfolder: any;
        alert: any;
        color: any;
        colorPicker: any;
        confirm: any;
        contextMenu: any;
        createKeyboardEvent: any;
        dialogBox: any;
        encodings: any;
        fileBrowser: typeof fileBrowser;
        fileList: any;
        fonts: any;
        fs: typeof fs;
        fsOperation: typeof fs;
        helpers: Helpers;
        inputHints: typeof inputHints;
        intent: Intent;
        keyboard: any;
        loader: any;
        multiPrompt: any;
        openfolder: any;
        palette: any;
        page: any;
        projects: any;
        prompt: any;
        select: any;
        selectionMenu: any;
        settings: Settings;
        sideButton: any;
        sidebarApps: SidebarApps;
        themes: Themes;
        toast: any;
        toInternalUrl: any;
        tutorial: any;
        url: Url;
        windowResize: any;
    }

    /**
     * This object can be used to access the cached files
     */
    interface PluginInitOptions {
        /**
         * Url of the cached file.
         */
        cacheFileUrl: string;

        /**
         * File object of the cached file. Using this object, you can write/read the file.
         */
        cacheFile: File;

        /**
         * If this is the first time the plugin is loaded, this value will be true. Otherwise, it will be false.
         */
        firstInit: boolean;
    }

    /**
     * You can use this parameter to define the settings of the plugin. The settings will be displayed in the plugin page.
     */
    interface PluginSettings {
        /**
         * An array of settings
         */
        list: {
            /**
             * The key of the setting. This key will be used to access the value of the setting.
             */
            key: string;

            /**
             * The text of the setting. This text will be displayed in the settings page.
             */
            text: string;

            /**
             * The icon of the setting. This icon will be displayed in the settings page.
             */
            icon?: string;

            /**
             * The info of the setting. This info will be displayed in the settings page.
             */
            info?: string;

            /**
             * The value of the setting. This value will be displayed in the settings page.
             */
            value?: any;

            /**
             * The value text of the setting. This value text will be displayed in the settings page.
             * @param value
             * @returns
             */
            valueText?: (value: any) => string;

            /**
             * If this property is set to true, the setting will be displayed as a checkbox.
             */
            checkbox?: boolean;

            /**
             * If this property is set to an array, the setting will be displayed as a select.
             * The array should contain the options of the select.
             * Each option can be a string or an array of two strings.
             * If the option is a string, the value and the text of the option will be the same.
             * If the option is an array of two strings,
             * the first string will be the value of the option and the second string will be the text of the option.
             */
            select?: (string | string[])[];

            /**
             * If this property is set to true, the setting will be displayed as a prompt.
             */
            prompt?: string;

            /**
             * The type of the prompt. This property is only used when the prompt property is set to true. The default value is text.
             */
            promptType?: string;

            /**
             * The options of the prompt. This property is only used when the prompt property is set to true and the promptType property is set to select.
             */
            promptOptions?: {
                /**
                 * The regular expression to match the value.
                 */
                match: RegExp;

                /**
                 * If this property is set to true, the value is required.
                 */
                required: boolean;

                /**
                 * The placeholder of the prompt.
                 */
                placeholder: string;

                /**
                 * The test function to test the value.
                 * @param value
                 * @returns
                 */
                test: (value: any) => boolean;
            }[];
        }[];

        /**
         * The callback function that will be called when the settings are changed.
         * @param key
         * @param value
         * @returns
         */
        cb: (key: string, value: any) => void;
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
        add(
            icon: string,
            id: string,
            title: string,
            initFunction: (container: HTMLElement) => void,
            prepend?: boolean,
            onSelected?: (container: HTMLElement) => void
        ): void;

        /**
         * Removes a sidebar app with the given ID.
         * @param id - The ID of the sidebar app to remove.
         * @returns
         */
        remove(id: string): void;
    }

    /**
     * An object that contains the type, url and name of the selected file or folder.
     */
    interface SelectedFile {
        /**
         * The type of the selected item, either "file" or "folder"
         */
        type: "file" | "folder";

        /**
         * The url of the selected item
         */
        url: string;

        /**
         * The name of the selected item
         */
        name: string;
    }

    /**
     * The Settings module allows you to get and set app settings.
     */
    interface Settings {
        /**
         * Updates the settings. This method takes two parameters, settings and showToast
         * @param settings An object containing the settings to update.
         * @param showToast A boolean indicating whether to show a toast when the settings are updated.
         * @returns
         */
        update(
            settings: Record<string, any>,
            showToast: boolean
        ): Promise<void>;

        /**
         * Resets the setting to its default value. This method takes one parameter, setting.
         * @param setting The name of the setting to reset. If setting is not provided, all settings will be reset.
         * @returns
         */
        reset(setting?: string): Promise<void>;

        /**
         * Adds an event listener to the settings.
         * @param event The event name."update:\<setting>" | "update:\<setting>:after" | "reset"
         * @param callback The callback function that will be called when the event is triggered
         * @returns
         */
        on(event: string, callback: (value: any) => void): void;

        /**
         * Removes an event listener from the settings.
         * @param event The event name."update:\<setting>" | "update:\<setting>:after" | "reset"
         * @param callback The callback function that will be called when the event is triggered
         * @returns
         */
        off(event: string, callback: (value: any) => void): void;

        /**
         * Gets the value of the setting.
         * @param setting The name of the setting to get.
         * @returns
         */
        get(setting: string): any;
    }

    /**
     * This module is used to create a theme object that can be used as a theme for the Acode.
     */
    class ThemeBuilder {
        /**
         * This module is used to create a theme object that can be used as a theme for the Acode.
         * @param name
         * @param type
         * @param version
         */
        constructor(
            name: string,
            type?: "dark" | "light",
            version?: "free" | "paid"
        );

        /**
         * This method is used to convert the theme builder object to a JSON object.
         */
        toJSON(): any;

        /**
         * This method is used to create a theme builder object from a JSON object.
         * @param json The JSON object.
         */
        static fromJSON(json: any): ThemeBuilder;

        /**
         * This method is used to create a theme builder object from a CSS string.
         * @param css The CSS string.
         */
        static fromCSS(css: string): ThemeBuilder;

        /**
         * The name of the theme.
         */
        name: string;

        /**
         * The type of the theme.
         */
        type: "dark" | "light";

        /**
         * Automatically darken the primary color.
         */
        autoDarkened: boolean;

        /**
         * The preferred editor theme.
         */
        preferredEditorTheme: string;

        /**
         * preferredFont string
         */
        preferredFont: string;

        /**
         * The border radius of the popup.
         */
        popupBorderRadius: string;

        /**
         * The color of the active element.
         */
        activeColor: string;

        /**
         * The color of the icon of the active element.
         */
        activeIconColor: string;

        /**
         * The color of the border.
         */
        borderColor: string;

        /**
         * The color of the box shadow.
         */
        boxShadowColor: string;

        /**
         * The color of the active button.
         */
        buttonActiveColor: string;

        /**
         * The background color of the button.
         */
        buttonBackgroundColor: string;

        /**
         * The text color of the button.
         */
        buttonTextColor: string;

        /**
         * The text color of the error message.
         */
        errorTextColor: string;

        /**
         * The primary color of the application.
         */
        primaryColor: string;

        /**
         * The text color of the primary color.
         */
        primaryTextColor: string;

        /**
         * The secondary color of the application.
         */
        secondaryColor: string;

        /**
         * The text color of the secondary color.
         */
        secondaryTextColor: string;

        /**
         * The text color of the link.
         */
        linkTextColor: string;

        /**
         * The color of the scrollbar.
         */
        scrollbarColor: string;

        /**
         * The color of the popup border.
         */
        popupBorderColor: string;

        /**
         * The color of the popup icon.
         */
        popupIconColor: string;

        /**
         * The background color of the popup.
         */
        popupBackgroundColor: string;

        /**
         * The text color of the popup.
         */
        popupTextColor: string;

        /**
         * The color of the active popup element.
         */
        popupActiveColor: string;

        /**
         * The width of the file tab.
         * The color of the active popup element.
         */
        fileTabWidth: string;

        /**
         * The CSS string of the theme.
         */
        readonly css: string;
    }

    /**
     * You can add new themes using this module.
     */
    interface Themes {
        /**
         * This method is used to add a new theme to the theme list.
         * @param theme The theme to be added.
         * @returns
         */
        add(theme: ThemeBuilder): void;

        /**
         * This method is used to get a theme from the theme list.
         * @param name The name of the theme to be retrieved.
         * @returns The theme object.
         */
        get(name: string): ThemeBuilder;

        /**
         * This method is used to update a theme in the theme list.
         * @param theme The theme to be updated.
         * @returns
         */
        update(theme: ThemeBuilder): void;

        /**
         * List all the themes in the theme list.
         * @returns The names of all the themes in the theme list.
         */
        list(): string[];
    }

    /**
     *
     */
    interface Url {
        /**
         * Returns basename from a url eg. "index.html" from "ftp://localhost/foo/bar/index.html"
         * @param url
         * @returns
         */
        basename(url: string): string;

        /**
         * Checks if given urls are same or not
         * @param urls
         * @returns
         */
        areSame(...urls: string[]): boolean;

        extname(url: string): string | null;

        join(...pathnames: string[]): string;

        safe(url: string): string;

        pathname(url: string): string;

        dirname(url: string): string;

        parse(url: string): { url: string; query: string };

        formate(urlObj: {
            protocol: "ftp:" | "sftp:" | "http:" | "https:";
            hostname: string | number;
            path: string;
            username: string;
            password: string;
            port: string | number;
            query: object;
        }): string;

        getProtocol(url: string): "ftp:" | "sftp:" | "http:" | "https:";

        hidePassword(url: string): string;

        decodeUrl(url: string): {
            protocol: "ftp:" | "sftp:" | "http:" | "https:";
            hostname: string | number;
            path: string;
            username: string;
            password: string;
            port: string | number;
            query: object;
        };

        trimSlash(url: string): string;
    }

    /**
     *
     */
    interface WCPage extends HTMLElement {
        on(event: "hide" | "show", cb: (this: WCPage) => void): void;
        off(event: "hide" | "show", cb: (this: WCPage) => void): void;

        settitle(title: string): void;

        id: string;

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

    /**
     * It allows the user to browse and select a file/folder from their device.
     * @param mode Specify the file browser mode, the value can be "file", "folder" or "both". If no value is provided, the default is "file".
     * @param info A small message to show what the file browser is opened for
     * @param doesOpenLast Should the file browser open the lastly visited directory?
     * @param defaultDir Default directory to open.
     */
    function fileBrowser(
        mode: BrowseMode,
        info: string,
        doesOpenLast: boolean,
        defaultDir?: {
            name: string;
            url: string;
        }[]
    ): Promise<SelectedFile>;

    /**
     * The fs module provides an API for interacting with the file system in Acode.
     * It allows for operations such as reading, writing, and manipulating files and directories.
     * @param url either the location of any file or directory
     */
    function fs(...url: string[]): FileSystem;

    /**
     *
     * @param $input An HTMLInputElement object representing the input element to add the autocomplete functionality.
     * @param hints An array of strings or a callback function that returns an array of strings. The strings in this array are the possible autocomplete suggestions to be displayed when the input element is focused
     * @param onSelect A callback function that is called when an autocomplete suggestion is selected
     */
    function inputHints(
        $input: HTMLInputElement,
        hints: string[],
        onSelect: (value: string) => void
    ): void;

    /**
     * Creates an HTMLElement
     * @param name
     * @param attributes
     */
    function tag<K extends keyof HTMLElementTagNameMap>(
        name: K,
        attributes: Record<string, string>
    ): HTMLElementTagNameMap[K];
}
