interface IdefinitionProperties {
    iconPath?: string
    fontCharacter?: string
    fontColor?: string
    fontSize?: string
    fontId?: string
}

interface IfontProperties {
    id: string
    src: [
        {
            path: string
            format: string
        }
    ],
    weight?: string
    style?: string
    size?: string
}

interface IlanguageProperties {
    id: string
    extensions: string[]
    filenames: string[]
    icon: {
        light: string
        dark: string
    }
}

export interface IfileIconTheme {
    hidesExplorerArrows: boolean
    fonts: [IfontProperties]
    iconDefinitions: { 
        [name: string]: IdefinitionProperties
    }
    file: string
    folder?: string
    folderExpanded?: string
    folderNames?: {
        [name: string]: string
    }
    folderNamesExpanded?: {
        [name: string]: string
    }
    rootFolder?: string
    rootFolderExpanded?: string
    rootFolderNames?: {
        [name: string]: string
    }
    rootFolderNamesExpanded?: {
        [name: string]: string
    }
    languageIds?: {
        [name: string]: IlanguageProperties
    }
    fileExtensions?: {
        [name: string]: string
    }
    fileNames?: {
        [name: string]: string
    }
    light?: {}
    highContrast?: {}
}

export type DefsMap = IfileIconTheme["iconDefinitions"]
export type IconsMap = IfileIconTheme["folderNames"]
export type LangsMap = IfileIconTheme["languageIds"]

