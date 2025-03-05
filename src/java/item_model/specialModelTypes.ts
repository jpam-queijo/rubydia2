// minecraft:special Model Types
export interface ItemBanner {
    type: "minecraft:banner";
    color: string; // temporary(forever)
}

export interface Bed {
    type: "minecraft:bed";
    texture: string;
}

export interface Chest {
    type: "minecraft:chest";
    texture: string;
    openness?: number;
}

export interface Conduit {
    type: "minecraft:conduit";
    // nothing here(minecraft hasn't any properties here)
}

export interface DecoratedPot {
    type: "minecraft:decorated_pot";
    // also nothing here for now
}

export interface Shield {
    type: "minecraft:shield";
    // nothing there for now
}

export interface Trident {
    type: "minecraft:trident";
    // also nothing here
}

export interface ShulkerBox {
    type: "minecraft:shulker_box";
    texture: string;
    openness?: number;
    orientation?: string | "up";
}

export interface Head {
    type: "minecraft:head";
    kind: "skeleton" | "wither_skeleton" | "player" | "zombie" | "creeper" | "piglin" | "dragon";
    texture?: string;
    animation?: number;
}

export interface StandingSign {
    type: "minecraft:standing_sign";
    wood_type: WoodTypes;
    texture?: string;
}

type WoodTypes = "oak" | "spruce" | "birch" | "acacia" | "cherry" | "jungle" | "dark_oak" | "pale_oak" | "mangrove" | "bamboo" | "crimson" | "warped";

export interface HangingSign {
    type: "minecraft:hanging_sign";
    wood_type: WoodTypes;
    texture?: string;
}