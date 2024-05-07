import { style } from "ziyy";
export function main(err = 0): void{
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

export function build(err = 0): void {
    process.stdout.write(style(`Convert the plugin at <path>

[b][c:green]Usage:[/0] [c:cyan][b]vsa build[/0] [c:cyan][OPTIONS] <PATH>

[b][c:green]Arguments:[/0]
  [c:cyan]<PATH>

[b][c:green]Options:
      [c:cyan]--single[/0]
          Produce a single output

Run \`[c:cyan][b]vsa help build[/0]\` for more detailed information.
`));
    process.exit(err);
}

export function short_build(err = 0): void {
    process.stdout.write(style(`[c:green][b]Usage: [c:cyan]vsa build[/0] [c:cyan]<PATH>[/0]
For more information, try '[c:cyan][b]--help[/0]'.
`));
    process.exit(err);
}

export function help(err = 0) {
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

export function print(err = 0, env) {
    process.stdout.write(style(env.cmd.help));
    process.exit(err);
}

export function print_short(err = 0, env) {
    process.stdout.write(style(env.cmd.short_help));
    process.exit(err);
}