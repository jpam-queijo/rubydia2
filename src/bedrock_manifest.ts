
// Represents a Minecraft Bedrock "manifest.json"
export interface BedrockManifest {
    format_version: number;
    header: BedrockHeader;
    modules: BedrockModule[];
    dependencies?: BedrockDependency[];
    metadata?: BedrockMetadata;
}

// Valid version format in bedrock
export type BedrockVersion = [number, number, number] | string;

export type BedrockManifestType = "resources" | "data" | "world_template" | "script";

// Just the common min_engine_version value for avoiding repetition
export const defaultMinEngineVersion: [number, number, number] = [1, 16, 0];


// More structures that makes up a manifest
export interface BedrockModule {
    description?: string;
    type: BedrockManifestType;
    uuid: string;
    version: BedrockVersion;
    language?: "javascript"
}

export interface BedrockDependency {
    uuid: string;
    module_name: string;
    version: BedrockVersion;
}

export interface BedrockHeader {
    description?: string;
    min_engine_version: [number, number, number];
    name: string;
    pack_scope?: string;
    uuid: string;
    version: BedrockVersion;
}
export interface BedrockUUIDs {
    resource_pack: [string, string];
    behavior_pack: [string, string];
}

export interface BedrockMetadata {
    authors?: string[];
    license?: string;
    generated_with?: {};
    product_type?: string;
    url?: string;
}