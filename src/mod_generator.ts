import { Mod } from "./mod";

export abstract class BaseModGenerator {
    abstract generate(mod: Mod): void;
    abstract generateToPath(mod: Mod, path: string): void;
    abstract generateAndLaunch(mod: Mod): void;
}