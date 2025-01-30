export interface ModInfo {
    name: string;
    version: number[];
    description?: string;
}

export abstract class Mod {
    abstract modInfo: ModInfo;
}