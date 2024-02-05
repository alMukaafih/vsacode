# VS Acode - Plugin Converter

## • Overview
This is a Package for converting [VS Code](https://code.visualstudio.com/) plugins to [Acode](https://acode.app/) plugins.

## • Installation
You can install it from npm using
```sh
npm install -g vsacode
```

## • Usage
```sh
vsa <command> [option] <filename>
```
> [!Note]
> filename is the name of the VS Code plugin you want to convert

## • Available Commands
> [!Note]
> Currently only conversion of icon themes are supported. Future versions may or may not include support for more types.

### icon
> Convert an Icon Theme.

It generates an Acode plugin for each icon theme in the VS Code plugin. Currently only VS Code icon themes that use SVG icons are supported.

| option | Description |
| ---------- | ----------- |
| `main`     | The default option. This is the same as running without an option. Convert the plugin. The output files are generated in current Folder. |
| `list` | List the available icon themes in the plugin |

#### Example Usage
If running
```sh
vsa icon list ext.vsix
```
gives the following output
```
id    => vscode-jetbrains-icon-theme
label => JetBrains Icon Theme v1 Dark

id    => vscode-jetbrains-icon-theme-2023-light
label => JetBrains Icon Theme 2023+ UI Light

id    => vscode-jetbrains-icon-theme-2023-dark
label => JetBrains Icon Theme 2023+ UI Dark

id    => vscode-jetbrains-icon-theme-2023-auto
label => JetBrains Icon Theme 2023+ UI Auto

```
Then running
```sh
vsa icon ext.vsix
```
will generate the following files
```
vscode-jetbrains-icon-theme.zip
vscode-jetbrains-icon-theme-2023-auto.zip
vscode-jetbrains-icon-theme-2023-dark.zip
vscode-jetbrains-icon-theme-2023-light.zip
```

## Authors
- [@alMukaafih](https://github.com/alMukaafih) - Creator

## Bugs
To report a bug, visit our [GitHub Issues](https://github.com/alMukaafih/vsacode/issues) page and create a new issue.