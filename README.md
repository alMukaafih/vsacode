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
```
vsa [OPTIONS] [COMMAND]
```

## Available Commands
### build
```
Convert the plugin at <path>

Usage: vsa build [OPTIONS] <PATH>

Arguments:
  <PATH>

Options:
      --single
          Produce a single output

Run `vsa help build` for more detailed information.
```

It generates an Acode plugin for each reconized entry in the VS Code plugin file.

## Authors
- [@alMukaafih](https://github.com/alMukaafih) - Creator

## Bugs
To report a bug, visit our [GitHub Issues](https://github.com/alMukaafih/vsacode/issues) page and create a new issue.