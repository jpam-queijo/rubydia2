export interface Item {
    name: string; // Item Display Name
    id: string;
    namespace?: string; // Item Identifier Namespace
    texture?: string;
    max_stack_size?: number;
}

export function getItemFullID(mod_id: string, item: Item): string {
    return `${(item.namespace) || mod_id}:${item.id}`;
}

export function getItemNamespace(mod_id: string, item: Item): string {
    return `${(item.namespace) || mod_id}`;
}