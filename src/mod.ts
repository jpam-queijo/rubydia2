import { Item } from "..";
import type { MinecraftLanguage } from "./language";
import { IdentifiablePlatformRegistry } from "./registry";
import { TranslationManager } from "./translation";
import { toCamelCaseString, toSnakeCaseString } from "./utils";

export type Version = [number, number, number];

export interface ModInfo {
    name: string;
    version: Version;
    modid?: string;
    description?: string;
    icon?: string;
    authors?: string[];
    homepage?: string;
    license?: string;
}

export abstract class Mod {
    abstract modInfo: ModInfo;
    
    // Items
    public readonly itemRegistry: IdentifiablePlatformRegistry<Item> = new IdentifiablePlatformRegistry<Item>();

    // Translation
    public readonly translationManager: TranslationManager = new TranslationManager();

    public getModID(): string {
        return process.env.MODID || toSnakeCaseString(this.modInfo.modid || this.modInfo.name);
    }

    public getModClassName() {
        return toCamelCaseString(process.env.CLASS_NAME || toCamelCaseString(this.modInfo.modid || this.modInfo.name));
    }
}
