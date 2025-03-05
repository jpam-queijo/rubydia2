import { getItemFullID, type Item } from "./item";
import type { MinecraftLanguage } from "./language";
import { toCamelCaseString, toSnakeCaseString } from "./utils";

export type Version = [number, number, number];

export interface ModTranslation {
    items: Translation;
    languages: MinecraftLanguage[];
    keys: Translation;
}

export interface Translation {
    [key: string]: Partial<Record<MinecraftLanguage, string>>;
};

export interface ModInfo {
    name: string;
    modid?: string;
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
    private translations: ModTranslation  = {items: {}, keys: {}, languages: []};

    public addItem(item: Item): void {
        if (this.items[getItemFullID(item)]) throw new Error(`Item with ID:"${getItemFullID(item)}" already exists.`);
        this.items[getItemFullID(item)] = item;

        if (!this.getItemTranslation(item, 'en_US')) {
            this.setItemTranslation(item, 'en_US', item.name);
        }
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
        return process.env.MODID || toSnakeCaseString(this.modInfo.modid || this.modInfo.name);
    }

    public getModClassName() {
        return toCamelCaseString(process.env.CLASS_NAME || toCamelCaseString(this.modInfo.modid || this.modInfo.name));
    }

    private addLanguageToTranslations(language: MinecraftLanguage): void {
        if (!this.translations.languages.includes(language)) {
            this.translations.languages.push(language);
        }
    }

    public setItemTranslation(item: Item, language: MinecraftLanguage, translation: string): void {
        this.addLanguageToTranslations(language);
        const itemID = getItemFullID(item);
        if (!this.translations.items[itemID]) {
            this.translations.items[itemID] = {};
        }

        this.translations.items[itemID][language] = translation;
    }

    public setKeyTranslation(key: string, language: MinecraftLanguage, translation: string): void {
        this.addLanguageToTranslations(language);

        if (!this.translations.keys[key]) {
            this.translations.keys[key] = {};
        }
        this.translations.keys[key][language] = translation;
    }

    public removeItemTranslation(item: Item, language: MinecraftLanguage): void {
        delete this.translations.items[getItemFullID(item)][language];
    }

    public removeKeyTranslation(key: string, language: MinecraftLanguage): void {
        delete this.translations.keys[key][language];
    }

    public getAllTranslationsForItem(item: Item): Partial<Record<MinecraftLanguage, string>> {
        return this.translations.items[getItemFullID(item)];
    }

    public getAllTranslationsForKey(key: string): Partial<Record<MinecraftLanguage, string>> {
        return this.translations.keys[key];
    }

    public getItemTranslation(item: Item, language: MinecraftLanguage): string | undefined {
        const itemID = getItemFullID(item);

        if (!this.translations.items[itemID]) {
            this.translations.items[itemID] = {};
        }

        return this.translations.items[itemID][language];
    }

    public getKeyTranslation(key: string, language: MinecraftLanguage): string | undefined {
        if (!this.translations.keys[key]) {
            this.translations.keys[key] = {};
        }

        return this.translations.keys[key][language];
    }

    public getAllLanguages(): MinecraftLanguage[] {
        return this.translations.languages;
    }

    public getAllItemTranslations(): Translation {
        return this.translations.items;
    }

    public getAllKeyTranslations(): Translation {
        return this.translations.keys;
    }

    public getAllModTranslations(): ModTranslation {
        return this.translations;
    }
}
