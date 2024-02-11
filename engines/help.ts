import { style } from "ziyy";
exports.main = ( err = 0) => {
    process.stdout.write(style(`vsa command is used to convert a vs code plugin to acode plugin

usage: vsa <command> \[[u]option[/u]\] [<filename>]

parameters:

  command     - name of command you want to run.

  [i]option[/i]      - option of the command.

  filename    - vs code plugin (vsix file).

commands:

  icon        - convert a file icon theme.
 
  help        - print this help message. run help <command> to get the help of the command.

icon options:

  main        - the default option. this is the same as running without an option. convert the plugin.

  list        - list the available file icon themes in the plugin.

`));
    process.exit(err);
};

exports.icon = (err = 0) => {
    process.stdout.write(style(`vsa icon command is used to convert a file icon vs code plugin to acode plugin

usage: vsa icon \[[u]option[/u]\] <filename>

options:

  main        - the default option. this is the same as running without an option. convert the plugin.

  list        - list the available file icon themes in the plugin.
`));
    process.exit(err);
}

exports.help = (err = 0) => {
    process.stdout.write(style(`vsa help command is used to get the help of the specified command.

usage: vsa help [command]

parameters:
  command     - the command to get help about.
`));
    process.exit(err);
}