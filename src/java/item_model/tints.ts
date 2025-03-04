// Tints
export interface CustomModelData {
    type: "minecraft:custom_model_data";
    index?: number;
    default: number | [number, number, number];
}

export interface Grass {
    type: "minecraft:grass";
    temperature: number;
    downfall: number;
}

export interface Constant {
    type: "minecraft:constant";
    value: number | [number, number, number];
}

export interface Color {
    type: "minecraft:dye" | "minecraft:firework" | "minecraft:map_color" | "minecraft:potion" | "minecraft:team";
    default: number | [number, number, number];
}