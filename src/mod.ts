import { getItemFullID, type Item } from "./item";
import type { MinecraftLanguage } from "./language";
import { toSnakeCaseString } from "./utils";

export type Version = [number, number, number];

export interface ModInfo {
    name: string;
    version: Version;
    description?: string;
    icon?: string;
    authors?: string[];
    homepage?: string;
    license?: string;
}

export abstract class Mod {
    abstract modInfo: ModInfo;

    // Items
    private items: {[key: string]: Item} = {};
    private translations: {
        items: {
            [key: string]: Partial<Record<MinecraftLanguage, string>>;
        }
    } = {items: {}};

    public addItem(item: Item): void {
        if (this.items[getItemFullID(item)]) throw new Error(`Item with ID:"${getItemFullID(item)}" already exists.`);
        this.items[getItemFullID(item)] = item;
    }

    public getItems(): Item[] {
        return Object.values(this.items);
    }

    public getItem(item_id: string): Item | undefined {
        return this.items[item_id];
    }

    public removeItem(item_id: string): void {
        delete this.items[item_id];
    }

    public getModID(): string {
        return process.env.JAVA_MODID || toSnakeCaseString(this.modInfo.name);
    }

    public setTranslation(item: Item, language: MinecraftLanguage, translation: string): void {
        if (!this.translations.items[getItemFullID(item)]) {
            this.translations.items[getItemFullID(item)] = {};
        }
        this.translations.items[getItemFullID(item)][language] = translation;
    }

    public removeTranslation(item: Item, language: MinecraftLanguage): void {
        delete this.translations.items[getItemFullID(item)][language];
    }

    public getAllTranslations(item: Item): Partial<Record<MinecraftLanguage, string>> {
        return this.translations.items[getItemFullID(item)];
    }

    public getTranslation(item: Item, language: MinecraftLanguage): string | undefined {
        return this.translations.items[getItemFullID(item)][language];
    }
}
