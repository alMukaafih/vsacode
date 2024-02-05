# VSAcode - Plugin Converter

## • Overview
This is a Package for converting [VS Code](https://code.visualstudio.com/) plugins to [Acode](https://acode.app/) plugins.

## • Installation
```sh
npm install -g vsacode
```

## • Usage
```sh
vsa <command> [option] [filename]
```

## • Available Commands
> Currently only conversion of icon themes are supported. Future versions may or may not include support for more types.

### - icon
> Convert an Icon Theme.

It generates an Acode plugin for each icon theme in the VS Code plugin. Currently only VS Code icon themes that use SVG icons are supported.

| option | Description |
| ---------- | ----------- |
| `main`     | The default option. The same as `vsa icon filename`. Convert the plugin |
| `list` | List the available icon themes in the plugin |