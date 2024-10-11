import { join } from "path";
import { statSync } from "fs";


export enum ArgType {
    Flag, Param
}

export enum SrcType {
    File,
    Dir,
}

export interface SrcInfo {
    path: string;
    type: SrcType;
}

export function getSrcInfo(args: Vsa.Arg[]): SrcInfo {
    let path = process.cwd();
    for (const arg of args) {
        if (arg.type == ArgType.Flag as Vsa.ArgType) {
            continue;
        }
        path = join(path, arg.key);
        break;
    }

    let stat = statSync(path);
    let type;
    if (stat.isDirectory()) {
        type = SrcType.Dir;
    } else if (stat.isFile()) {
        type = SrcType.File;
    } else {
        throw new Error("invalid <u>path</u>");
    }

    return {
        path,
        type,
    };
}
