export interface ElementRotation {
    origin: [number, number, number];
    axis: "x" | "y" | "z";
    angle: number;
    rescale?: boolean;
}

export type FaceSides = "down" | "up" | "north" | "south" | "west" | "east";

export interface ElementFace {
    uv: [number, number, number, number];
    texture: string;
    cullface?: FaceSides;
    rotation?: number;
    tintindex?: number;
}

export interface Element {
    from: [number, number, number];
    to: [number, number, number];
    rotation: ElementRotation;
    shade: boolean;
    light_emission: number;
    faces: Record<FaceSides, ElementFace>;
}

export interface Position {
    rotation: [number, number, number];
    translation: [number, number, number];
    scale: [number, number, number];
}

export type DisplayPositions = "thirdperson_righthand" | "thirdperson_lefthand" | "firstperson_righthand" | "firstperson_lefthand" | "gui" | "head" | "ground" | "fixed";

export type Display = Record<DisplayPositions, Position>;

// Basic Model for Item
export interface Model {
    parent?: "minecraft:item/generated" | "minecraft:builtin/entity" | string;
    display?: Display;
    textures?: {
        [key: string]: string | undefined;
        particle?: string;
    }
    gui_light?: "front" | "side";
    elements?: Element[];
}