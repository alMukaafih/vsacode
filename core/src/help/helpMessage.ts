interface Param {
    arg?: string;
    description: string;
    long: string;
    short: string;
}

interface Usage {
    name: string,
    args: [string, boolean][]
}

export class HelpMessage {
    options: Param[];
    commands: Param[];
    description = "";
    usage: Usage = {
        name: "",
        args: []
    };

    constructor() {
        this.options = [];
        this.commands = [];
    }
}
