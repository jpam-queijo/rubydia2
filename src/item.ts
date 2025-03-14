export interface Item {
    name: string; // Item Display Name
    id: string;
    namespace?: string; // Item Identifier Namespace
    texture?: string;
    max_stack_size?: number;
    rarity?: Rarity;
}

export type Rarity = "common" | "uncommon" | "rare" | "epic";

/*export*/ abstract class AdvancedItem implements Item {
    abstract name: string;
    abstract id: string;
    namespace?: string | undefined;
    texture?: string | undefined;
    max_stack_size?: number | undefined;
    rarity?: Rarity | undefined;
    
    // for the future when logical coding its implemented
}

export function getItemFullID(mod_id: string, item: Item): string {
    return `${(item.namespace) || mod_id}:${item.id}`;
}

export function getItemNamespace(mod_id: string, item: Item): string {
    return `${(item.namespace) || mod_id}`;
}