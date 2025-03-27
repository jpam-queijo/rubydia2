// many versions could be supported but i not tested so idk if it really works
export type FabricSupportedJavaVersion = "1.21.4" | "1.21.5";

export const settingsByVersion: { [key: string]: FabricModSettings } = {
    "latest": {
        version: "1.21.5",
        yarn_version: "1.21.5+build.1",
        fabric_version: "0.119.5+1.21.5",
        loader_version: "0.16.10",
        java_version: "21"      
    },
    "1.21.5": {
        version: "1.21.5",
        yarn_version: "1.21.5+build.1",
        fabric_version: "0.119.5+1.21.5",
        loader_version: "0.16.10",
        java_version: "21"      
    },
    "1.21.4": {
        version: "1.21.4",
        yarn_version: "1.21.4+build.8",
        fabric_version: "0.115.1+1.21.4",
        loader_version: "0.16.10",
        java_version: "21"
    },
}

export interface FabricModSettings {
    version: FabricSupportedJavaVersion
    yarn_version: string,
    fabric_version: string,
    java_version: string,
    loader_version: string
}