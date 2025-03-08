// many versions could be supported but i not tested so idk if it really works
export type FabricSupportedJavaVersion = "1.21.4"; // | "1.21.3" | "1.21.2" | "1.21.1" | "1.21";

export const settingsByVersion: { [key: string]: FabricModSettings } = {
    "latest": {
        version: "1.21.4",
        yarn_version: "1.21.4+build.8",
        fabric_version: "0.115.1+1.21.4",
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
    /*
    "1.21.3": {
        version: "1.21.3",
        yarn_version: "1.21.3+build.2",
        fabric_version: "0.114.0+1.21.3",
        java_version: "21"
    },
    "1.21.2": {
        version: "1.21.2",
        yarn_version: "1.21.2+build.1",
        fabric_version: "0.106.1+1.21.2",
        java_version: "21"
    },
    "1.21.1": {
        version: "1.21.1",
        yarn_version: "1.21.1+build.3",
        fabric_version: "0.115.1+1.21.1",
        java_version: "21"
    },
    "1.21": {
        version: "1.21",
        yarn_version: "1.21+build.9",
        fabric_version: "0.102.0+1.21",
        java_version: "21"
    }
        */
}

export interface FabricModSettings {
    version: FabricSupportedJavaVersion
    yarn_version: string,
    fabric_version: string,
    java_version: string,
    loader_version: string
}