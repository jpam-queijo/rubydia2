import { Mod } from "./mod";

export abstract class BaseModGenerator {
    public static generate(mod: Mod): void {
        throw new Error('Method not implemented. Use a subclass.');
    };
    public static generateToPath(mod: Mod, path: string): void {
        throw new Error('Method not implemented. Use a subclass.');
    };
    public static generateAndLaunch(mod: Mod): void {
        throw new Error('Method not implemented. Use a subclass.');
    };
}