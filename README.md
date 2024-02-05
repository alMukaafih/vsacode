# VS Acode - Plugin Converter

## Overview
This is a Package for converting [VS Code](https://code.visualstudio.com/) plugins to [Acode](https://acode.app/) plugins.

## Installation
You can install it from npm using
```sh
npm install -g vsacode
```

## Usage
This package provides the following command line command
```sh
vsa <command> [option] <filename>
```
> [!Note]
> filename is the name of the VS Code plugin you want to convert

## How to use
1. Install this package from `npm`.
2. Download the plugin you want to convert from [Visual Studio Marketplace](https://marketplace.visualstudio.com/items) e.g. [JetBrains Icon Theme](https://marketplace.visualstudio.com/items?itemName=chadalen.vscode-jetbrains-icon-theme).
3. Note the filename in this case `chadalen.vscode-jetbrains-icon-theme.vsix` you will need it when running the command.
3. Run `vsa icon filename` to convert the plugin. In place of filename input the filename of the plugin you noted.
4. You will see output like this on the command line
    ```
    .....................................................
    .....................................................
    .....................................................
    icons/json_auto.svg 80 bytes [built] [code generated]
      + 54 modules
    modules by path ./ 25.3 KiB
      ./src/main.ts 2.62 KiB [built] [code generated]
      ./src/styles.ts 22.4 KiB [built] [code generated]
      ./plugin.json 299 bytes [built] [code generated]
    webpack 5.88.2 compiled successfully in 43953 ms
    dist.zip written.
    
    
    > vsacode@0.2.3 clean
    > shx rm -rf dist plugin.json icon.png readme.md
    
    output: /current/path/vscode-jetbrains...23-auto.zip
    ```
5. The ouput `zip` file(s) will be created in the current folder.
6. Launch Acode app .
7. Uninstall any Icon Theme you have installed.
7. Navigate to `Settings > Plugins > + > Local` then navigate to the folder where the zip file(s) is/are located, then Select the Icon Theme to install it.
> [!Note]
> Currenty only one Icon Theme can be installed i.e. to change the Icon Theme you need to uninstall the currently installed Icon Theme.


## Available Commands
> [!Note]
> Currently only conversion of icon themes are supported. Future versions may or may not include support for more types.

### icon
> Convert an Icon Theme.

It generates an Acode plugin for each icon theme in the VS Code plugin. Currently only VS Code icon themes that use SVG icons are supported.

| option | Description |
| ---------- | ----------- |
| `main`     | The default option. This is the same as running without an option. Convert the plugin. The output files are generated in current Folder. |
| `list` | List the available icon themes in the plugin |

## Authors
- [@alMukaafih](https://github.com/alMukaafih) - Creator

## Bugs
To report a bug, visit our [GitHub Issues](https://github.com/alMukaafih/vsacode/issues) page and create a new issue.