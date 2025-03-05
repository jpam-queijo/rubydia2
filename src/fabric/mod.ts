export interface FabricModInfo {

    // Mod Info
    schemaVersion: 1;
    id: string;
    version: string;
}

export interface FabricModMetadata {

    // Metadata
    name?: string;
    description?: string;
    authors?: string[] | { name: string; contact: string }[];
    contact?: {
        email?: string;
        irc?: string;
        homepage?: string;
        issues?: string;
        sources?: string;
    };
    license?: string;
    contributors?: string[] | { name: string; contact: string }[];
    icon?: string;
    environment?: string;
    entrypoints?: {
        main: string[];
        client?: string[];
        server?: string[];
    };
}

export interface FabricModDependencyResolution {

    // Dependency Resolution
    depends?: string | string[];
    recommends?: string | string[];
    suggests?: string | string[];
    breaks?: string | string[];
    conflicts?: string | string[];
}

export interface FabricModLoadingInfo {

    // Loading Info
    provides?: string[];
    environment?: "*" | "server" | "client";
    entrypoints?: {
        main?: string[];
        client?: string[];
        server?: string[];
    };
    jars?: {
        file: string;
    }[];
    languageAdapters?: string[];
    mixins?: string[] | {
        config: string;
        environment: "*" | "server" | "client";
    };
    
}