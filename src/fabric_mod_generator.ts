import type { Mod, ModInfo, Version } from "./mod";
import { BaseModGenerator } from "./mod_generator";
import { toSnakeCaseString } from "./utils";
import fs from "fs-extra";
import path from "path";

export type FabricSupportedJavaVersion = "1.21.4";
export const latestJavaVersion: FabricSupportedJavaVersion = "1.21.4";
export const latestYarnVersion: string = "1.21.4+build.8";
export const latestFabricVersion: string = "0.16.10";

export const settingsByVersion = {
    "1.21.4": {
        yarn_version: "1.21.4+build.8",
        loader_version: "0.16.10"
    }
}

export interface FabricModSettings {
    version: FabricSupportedJavaVersion
    yarn_version: string,
    loader_version: string
}

export class FabricModGenerator extends BaseModGenerator {
    public static override generate(mod: Mod, version?: FabricSupportedJavaVersion): void {
        if (!version) {
            version = latestJavaVersion;
        }

        const mod_fabric_settings: FabricModSettings = {
            version: version,
            yarn_version: settingsByVersion[version].yarn_version,
            loader_version: settingsByVersion[version].loader_version
        };

        const generate_path: string = `./build/fabric/${version}/`;

        fs.ensureDirSync(generate_path);
        this.generateGradleFiles(generate_path, mod.modInfo, mod_fabric_settings);
    }

    public static generateGradleFiles(output_path: string,
        mod_info: ModInfo, settings?: FabricModSettings): void {
        
        if (!settings) {
            settings = {
                version: latestJavaVersion,
                yarn_version: latestYarnVersion,
                loader_version: latestFabricVersion
            }
        }

        // settings.gradle
        fs.copyFileSync(path.join(import.meta.dirname, "..", "gradle_files", "settings.gradle"),
        path.join(output_path, "settings.gradle"));

        const gradleProperties = this.gradlePropertiesGenerator(settings, mod_info);

        fs.writeFileSync(path.join(output_path, "gradle.properties"), gradleProperties);
    }

    public static gradlePropertiesGenerator(settings: FabricModSettings, mod_info: ModInfo): string {
        // gradle.properties
        const mod_id: string = toSnakeCaseString(mod_info.name);

        const gradleProperties: string = `
org.gradle.jvmargs=-Xmx1G
org.gradle.parallel=true

minecraft_version=${settings.version}
yarn_mappings=${settings.yarn_version}
loader_version=${settings.loader_version}

mod_version=${mod_info.version.join(".") || "1.0.0"}

maven_group=${process.env.JAVA_PACKAGE || "com.rubydia2." + (process.env.JAVA_MODID || mod_id)}
archives_base_name=${process.env.JAVA_MODID || mod_id}
`;

        return gradleProperties;
    }
}