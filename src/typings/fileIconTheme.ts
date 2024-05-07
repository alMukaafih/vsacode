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

export interface IfileIconTheme {
    hidesExplorerArrows: boolean
    fonts?: [IfontProperties]
    iconDefinitions: Record<string, IdefinitionProperties>
    file: string
    folder?: string
    folderExpanded?: string
    folderNames?: Record<string, string>
    folderNamesExpanded?: Record<string, string>
    rootFolder?: string
    rootFolderExpanded?: string
    rootFolderNames?: Record<string, string>
    rootFolderNamesExpanded?: Record<string, string>
    languageIds?: Record<string, string>

    fileExtensions?: Record<string, string>
    fileNames?: Record<string, string>
    light?: Record<string, never>
    highContrast?: Record<string, never>
}

export type DefsMap = IfileIconTheme["iconDefinitions"]
export type IconsMap = IfileIconTheme["folderNames"]
export type FontsMap = IfileIconTheme["fonts"]

