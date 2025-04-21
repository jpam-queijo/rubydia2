import { Item, type ItemProperties } from "../item";
import path from "path";
import type { IdentifiablePlatformRegistry } from "../registry";


export const defaultItemIcon: string = path.join(import.meta.dirname, "..", "..", "assets", "queijo.png");

export interface BedrockItem {
    format_version: "1.21.40";
    "minecraft:item": {
        description: {
            identifier: string;
        },
        components: {
            "minecraft:icon": string;
            "minecraft:max_stack_size"?: number;
            "minecraft:rarity"?: "common" | "uncommon" | "rare" | "epic";
        }
    }
}

export interface BedrockItemTextures {
    resource_pack_name: string;
    texture_name: "atlas.items";
    texture_data: {
        [key: string]: {
            textures: string | string[];
        };
    }
}

export class BedrockItemGenerator {
    public static generateItemJSON(mod_id: string, item: Item): BedrockItem {
        const itemFullID = item.getID().getIdString();
        return {
            format_version: "1.21.40",
            "minecraft:item": {
                description: {
                    identifier: itemFullID,
                },
                components: {
                    "minecraft:icon": itemFullID,
                    "minecraft:max_stack_size": item.maxStackSize,
                    "minecraft:rarity": item.rarity
                }
            },
        }
    }

    public static generateItemTextureJSON(pack_name: string, mod_id: string, items: IdentifiablePlatformRegistry<Item>): BedrockItemTextures {
        let items_json: BedrockItemTextures = {
            resource_pack_name: pack_name,
            texture_name: "atlas.items",
            texture_data: {}
        }

        
        items.forEachInBedrock(item => {
            const itemFullID = item.getID().getIdString();
            items_json.texture_data[itemFullID] = {
                textures: `textures/items/${path.parse(item.texture || defaultItemIcon).name}`
            }
        });
        
        return items_json;
    }
}