import "smol-toml"
import { IconfigToml } from "./configToml.js"
declare module "smol-toml" {
    export function parse(toml: string): IconfigToml
}