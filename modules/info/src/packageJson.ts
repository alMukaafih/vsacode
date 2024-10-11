export interface ThemeInfo {
    id: string;
    label: string;
    path: string;
}

export interface PackageJson {
    name: string;
    displayName: string;
    description: string;
    version: string;
    publisher: string;
    author:
        | {
              name: string;
              email?: string;
              url?: string;
          }
        | string;
    contributes: {
        iconThemes: ThemeInfo[];
        themes: ThemeInfo[];
    };
}
