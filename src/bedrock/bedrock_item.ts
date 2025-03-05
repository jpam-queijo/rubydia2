import { getItemFullID, type Item } from "../item";
import path from "path";


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
        return {
            format_version: "1.21.40",
            "minecraft:item": {
                description: {
                    identifier: getItemFullID(mod_id, item),
                },
                components: {
                    "minecraft:icon": getItemFullID(mod_id, item),
                    "minecraft:max_stack_size": item.max_stack_size
                }
            },
        }
    }

    public static generateItemTextureJSON(pack_name: string, mod_id: string, items: Item[]): BedrockItemTextures {
        let items_json: BedrockItemTextures = {
            resource_pack_name: pack_name,
            texture_name: "atlas.items",
            texture_data: {}
        }
        items.forEach(item => {
            items_json.texture_data[getItemFullID(mod_id, item)] = {
                textures: `textures/items/${path.parse(item.texture || defaultItemIcon).name}`
            } 
        });
        
        return items_json;
    }
}