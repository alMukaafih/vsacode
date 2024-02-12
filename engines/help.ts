import { style } from "ziyy";
export function main(err: number = 0): void{
    process.stdout.write(style(`Convert VS Code plugins to Acode plugins.

USAGE
  vsa \[<command>\] \[[u]option[/u]\] \[<filename>\] \[flags\]

PARAMETERS
  command:     Command name
  option:      Command option
  filename:    VS Code plugin (vsix file)
  flags:       Command flags

CONVERSION COMMANDS
  icon:       Convert File Icon Theme

GENERAL CONVERSION OPTIONS
  main:       Convert the plugin
  list:       List the available entries for command in plugin

ADDITIONAL COMMANDS
  help:       Show help for command

FLAGS
  --help      Show help for command
  --version   Show vsacode version

EXAMPLES
  $ vsa icon plugin.vsix
  $ vsa help icon 
  $ vsa --version

LEARN MORE
  Use \`vsa <command> --help\` for more information about a command.

`));
    process.exit(err);
};

export function icon(err: number = 0): void {
    process.stdout.write(style(`Convert File Icon Theme plugins.

USAGE
  vsa icon \[[u]option[/u]\] <filename> \[flags\]

PARAMETERS
  option:      Option of the command
  filename:    VS Code plugin (vsix file)
  flags:       Command flags

COMMANDS
  icon:       Convert File Icon Theme
  help:       Show help for command

OPTIONS
  main:       Convert the plugin
  list:       List the available File Icon Themes in plugin

INHERITED FLAGS
  --help      Show help for command

EXAMPLES
  $ vsa icon list plugin.vsix
  $ vsa icon plugin.vsix
  $ vsa icon --help

`));
    process.exit(err);
}

export function help(err: number = 0) {
    process.stdout.write(style(`Show help for command.

USAGE
  vsa icon <command>

PARAMETERS
  command:    Command name

EXAMPLES
  $ vsa help icon
  $ vsa help help
  $ vsa help

`));
    process.exit(err);
}