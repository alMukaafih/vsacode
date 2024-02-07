import "js-toml"
import { IconfigToml } from "./configToml.js"
declare module "js-toml" {
    export const load: (toml: string) => IconfigToml;
}