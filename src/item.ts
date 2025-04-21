import { Identifier, type Identifiable } from "./identifier";
import type { Translatable } from "./language";

export interface ItemProperties {
    displayName: string; // Item Display Name
    texture?: string;
    maxStackSize?: number;
    rarity?: Rarity;
}

export type Rarity = "common" | "uncommon" | "rare" | "epic";

export class Item implements ItemProperties, Identifiable, Translatable {
    private id: Identifier;
    private translationKey: string;

    displayName: string;
    texture?: string | undefined;
    maxStackSize?: number | undefined;
    rarity?: Rarity | undefined;

    constructor(properties: ItemProperties, id: Identifier) {
        this.id = id;

        this.displayName = properties.displayName;
        this.texture = properties.texture;
        this.rarity = properties.rarity;
        this.maxStackSize = properties.maxStackSize;

        this.translationKey = `rubydia.item.${this.id.getIdString()}`;
    }
    
    getID(): Identifier {
        return this.id;
    }
    getTranslationKey(): string {
        return this.translationKey;
    }
    setTranslationKey(key: string): void {
        this.translationKey = key;
    }
}