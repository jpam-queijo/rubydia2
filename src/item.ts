export interface Item {
    name: string; // Item Display Name
    id: string;
    namespace: string; // Item Identifier Namespace
    texture?: string;
    max_stack_size?: number;
}

export function getItemFullID(item: Item): string {
    return `${item.namespace}:${item.id}`;
}