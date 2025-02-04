export type FabricSupportedJavaVersion = "1.21.4";
export const latestLoaderVersion: string = "0.16.10";

export const settingsByVersion: { [key: string]: FabricModSettings } = {
    "latest": {
        version: "1.21.4",
        yarn_version: "1.21.4+build.8",
        fabric_version: "0.115.1+1.21.4",
        java_version: "21"      
    },
    "1.21.4": {
        version: "1.21.4",
        yarn_version: "1.21.4+build.8",
        fabric_version: "0.115.1+1.21.4",
        java_version: "21"
    }
}

export interface FabricModSettings {
    version: FabricSupportedJavaVersion
    yarn_version: string,
    fabric_version: string,
    java_version: string
}