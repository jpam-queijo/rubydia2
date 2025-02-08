import { getItemFullID, type Item } from "./item";
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
    private items: {[key: string]: Item} = {};

    public addItem(item: Item): void {
        if (this.items[getItemFullID(item)]) throw new Error(`[rubydia2] Item ${getItemFullID(item)} already exists.`);
        this.items[getItemFullID(item)] = item;
    }

    public getItems(): Item[] {
        return Object.values(this.items);
    }

    public getItem(string_id: string): Item | undefined {
        return this.items[string_id];
    }

    public removeItem(string_id: string): void {
        delete this.items[string_id];
    }

    public getModID(): string {
        return process.env.JAVA_MODID || toSnakeCaseString(this.modInfo.name);
    }
}