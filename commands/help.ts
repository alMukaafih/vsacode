import { style } from "ziyy";
export function main(err: number = 0): void{
    process.stdout.write(style(`Convert VS Code plugin to Acode plugin.

[b]USAGE[/0]
  vsa <command> \[<filename>\] \[flags\]

[b]PARAMETERS[/0]
  command:    Command name
  filename:   VS Code plugin (vsix file)
  flags:      Command flags

[b]COMMANDS[/0]
  make:       Convert the plugin
  list:       List the available entries in plugin
  help:       Show help for command

[b]FLAGS[/0]
  --help      Show help for command
  --version   Show vsacode version

[b]EXAMPLES[/0]
  $ vsa make plugin.vsix
  $ vsa help make 
  $ vsa --version

[b]LEARN MORE[/0]
  Use \`vsa <command> --help\` for more information about a command.

`));
    process.exit(err);
};

export function make(err: number = 0): void {
    process.stdout.write(style(`Convert File Icon Theme plugins.

[b]USAGE[/0]
  vsa make <filename> \[flags\]

[b]PARAMETERS[/0]
  filename:    VS Code plugin (vsix file)
  flags:       Command flags

[b]INHERITED FLAGS[/0]
  --help      Show help for command

[b]EXAMPLES[/0]
  $ vsa make filename.vsix
  $ vsa make plugin.vsix
  $ vsa make --help

`));
    process.exit(err);
}

export function help(err: number = 0) {
    process.stdout.write(style(`Show help for command.

[b]USAGE[/0]
  vsa help <command>

[b]PARAMETERS[/0]
  command:    Command name

[b]EXAMPLES[/0]
  $ vsa help make
  $ vsa help help
  $ vsa help

`));
    process.exit(err);
}
