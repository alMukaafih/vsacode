import { style } from "ziyy";
export function main(err: number = 0): void{
    process.stdout.write(style(`VS Code plugin to Acode plugin converter

[b][c:green]Usage:[/0] [c:cyan][b]vsa[/0] [c:cyan]\[OPTIONS\] \[COMMAND\]

[b][c:green]Options:
  [c:cyan]-V[c:white][/0], [c:cyan][b]--version[/0]
          Print version info and exit[b]
  [c:cyan]-h[c:white][/0], [c:cyan][b]--help[/0]
          Print help

[b][c:green]Commands:
    [c:cyan]build[/0], [c:cyan][b]b[/0]    Convert the plugin[b]
    [c:cyan]list[/0]        List the available entries in plugin[b]
    [c:cyan]help[/0]        Displays help for a vsa subcommand

See '[c:cyan][b]vsa help[/0] [c:cyan]<command>[/0]' for more information on a specific command.
`));
    process.exit(err);
};

export function build(err: number = 0): void {
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
