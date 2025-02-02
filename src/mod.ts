export type Version = [number, number, number];

export interface ModInfo {
    name: string;
    version: Version;
    description?: string;
    icon?: string;
}

export abstract class Mod {
    abstract modInfo: ModInfo;
}