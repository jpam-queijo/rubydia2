// Item Model Types

import type { MinecraftLanguage } from "../../language";
import type { ModelDefinition } from "./modelDefinition";
import * as TintTypes from "./tints";

export interface Special {
    type: "minecraft:special";
    model: {
        type: "minecraft:banner" | "minecraft:bed" | "minecraft:chest" | "minecraft:conduit" | "minecraft:decorated_pot" | "minecraft:head" | "minecraft:shield" | "minecraft:shulker_box" | "minecraft:standing_sign" | "minecraft:hanging_sign" | "minecraft:trident";
    }
    base: string;
}

export interface BundleSelectedRender {
    type: "minecraft:bundle_contents";
    // nothing here
}

export interface RangeDispatch {
    type: "minecraft:range_dispatch";
    property: "minecraft:bundle/fullness" | "minecraft:compass" | "minecraft:cooldown" | "minecraft:count" | "minecraft:crossbow/pull" | "minecraft:damage" | "minecraft:time" | "minecraft:use_cycle" | "minecraft:use_duration" | "minecraft:custom_model_data";
    scale?: number;
    entries: {
        threshold: number;
        model: ModelType;
    };
    fallback?: ModelType;
    target?: "spawn" | "lodestone" | "recovery" | "none";
    wobble?: boolean;
    normalize?: boolean;
    source?: "daytime" | "moon_phase" | "random";
    period?: number;
    remaining?: boolean;
    index?: number;
}


export interface Select {
    type: "minecraft:select";
    property: "minecraft:block_state" | "minecraft:charge_type" | "minecraft:component" | "minecraft:context_dimension" | "minecraft:context_entity_type" | "minecraft:display_context" | "minecraft:local_time" | "minecraft:main_hand" | "minecraft:trim_material" | "minecraft:custom_model_data";
    cases: {
        when: string | [];
        model: ModelType;
    }[];
    fallback?: ModelType;
    block_state_property?: string;
    component?: string;
    locale?: string | MinecraftLanguage;
    time_zone?: string;
    pattern?: string;
    index?: number;
}


export interface Simple {
    type: "minecraft:model";
    model: string;
    tints?: (TintTypes.Color | TintTypes.Grass | TintTypes.CustomModelData | TintTypes.Constant)[];
}

export interface Condition {
    type: "minecraft:condition";
    property: "minecraft:broken" | "minecraft:bundle/has_selected_item" | "minecraft:carried" | "minecraft:component" | "minecraft:damaged" | "minecraft:extended_view" | "minecraft:fishing_rod/cast" | "minecraft:has_component" | "minecraft:keybind_down" | "minecraft:selected" | "minecraft:using_item" | "minecraft:view_entity" | "minecraft:custom_model_data";
    on_true: ModelType;
    on_false: ModelType;
    predicate?: string;
    value?: string;
    component?: string;
    ignore_default?: boolean;
    keybind?: string;
    index?: number;
}

export interface Composite {
    type: "minecraft:composite";
    models: ModelDefinition[];
}

export type ModelType = Composite | Condition | Simple | Select | RangeDispatch | BundleSelectedRender | Special;
