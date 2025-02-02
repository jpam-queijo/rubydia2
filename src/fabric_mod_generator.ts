import type { Mod, ModInfo, Version } from "./mod";
import { BaseModGenerator } from "./mod_generator";
import { toSnakeCaseString } from "./utils";
import fs from "fs-extra";
import path from "path";

export type FabricSupportedJavaVersion = "1.21.4";
export const latestMcJavaVersion: FabricSupportedJavaVersion = "1.21.4";
export const latestYarnVersion: string = "1.21.4+build.8";
export const latestFabricVersion: string = "0.115.1+1.21.4";
export const latestLoaderVersion: string = "0.16.10";
export const latestJavaVersion: string = "21";

export const settingsByVersion = {
    "1.21.4": {
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

export class FabricModGenerator extends BaseModGenerator {
    public static override generate(mod: Mod, version?: FabricSupportedJavaVersion): void {
        ///////////////////// FABRIC MOD GENERATION ///////////////////////////
        console.log("[rubydia2] Generating Fabric mod...");


        if (!version) {
            version = latestMcJavaVersion;
        }

        const mod_fabric_settings: FabricModSettings = {
            version: version,
            yarn_version: settingsByVersion[version].yarn_version,
            fabric_version: settingsByVersion[version].fabric_version,
            java_version: settingsByVersion[version].java_version
        };
        const generate_path: string = `./build/fabric/${version}/`;

        fs.ensureDirSync(generate_path);
        this.generateGradleFiles(generate_path, mod.modInfo, mod_fabric_settings);

        console.log("[rubydia2] Done generating Fabric mod.");
    }


    public static generateGradleFiles(output_path: string,
        mod_info: ModInfo, settings?: FabricModSettings): void {
        ///////////////////// GRADLE FILES GENERATION ///////////////////////////
        console.log("[rubydia2] Generating gradle files...");
        
        if (!settings) {
            settings = {
                version: latestMcJavaVersion,
                yarn_version: latestYarnVersion,
                fabric_version: latestFabricVersion,
                java_version: latestJavaVersion
            }
        }

        // settings.gradle
        fs.copyFileSync(path.join(import.meta.dirname, "..", "gradle_files", "settings.gradle"),
        path.join(output_path, "settings.gradle"));

        const gradleProperties = this.gradlePropertiesGenerator(settings, mod_info);
        const gradleBuild = this.gradleBuildGenerator(settings);
        fs.writeFileSync(path.join(output_path, "gradle.properties"), gradleProperties);
        fs.writeFileSync(path.join(output_path, "build.gradle"), gradleBuild);

        console.log("[rubydia2] Done generating gradle files.");
    }


    public static gradlePropertiesGenerator(settings: FabricModSettings, mod_info: ModInfo): string {
        ///////////////////// GRADLE PROPERTIES GENERATION ///////////////////////////
        // gradle.properties
        const mod_id: string = toSnakeCaseString(mod_info.name);

        const gradleProperties: string = `
org.gradle.jvmargs=-Xmx1G
org.gradle.parallel=true

minecraft_version=${settings.version}
yarn_mappings=${settings.yarn_version}
loader_version=${latestLoaderVersion}

mod_version=${mod_info.version.join(".") || "1.0.0"}

maven_group=${process.env.JAVA_PACKAGE || "com.rubydia2." + (process.env.JAVA_MODID || mod_id)}
archives_base_name=${process.env.JAVA_MODID || mod_id}

fabric_version=${settings.fabric_version}
`;

        return gradleProperties;
    }
    

    public static gradleBuildGenerator(settings: FabricModSettings): string {
        ///////////////////// GRADLE BUILD GENERATION ///////////////////////////
        // build.gradle
        let gradleBuild = fs.readFileSync(
            path.join(import.meta.dirname, "..", "gradle_files", "build.gradle"), "utf-8");

        return gradleBuild.replaceAll("${RUBYDIA2_JAVA_VERSION}", settings.java_version);
    }
}