# VS Acode - Extending the Acode Editor
![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2FalMukaafihuun%2Fvsacode%2Fraw%2Fmain%2Fpackage.json&query=%24.version&logo=github&label=vsacode)

## Overview
This is a Package for installing [VS Code](https://code.visualstudio.com/) Extensions in [Acode](https://acode.app/) Editor.

## Cli Converter
It includes a command line converter.
You can install using
```sh
npm install -g vsacode
```

### Usage
This is the general usage format
```
vsa [OPTIONS] [COMMAND]
```

### Commands
- `build:` Converts the Extension. Currently it generate a plugin for each supported contribution point in the Extension.
- `help:` Prints help about a specific command
- `list:` List the supported contribution point in the Extension

## Acode Plugin
In progress...

## Supported Contribution Points 
- `iconTheme:` 95% support
- `productIconTheme:` in progress...
- `theme:` in progress...

## Authors
- [@alMukaafih](https://github.com/alMukaafih) - Creator

## Bugs
To report a bug, visit our [GitHub Issues](https://github.com/alMukaafih/vsacode/issues) page and create a new issue.
