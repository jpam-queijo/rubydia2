import { ModUtils } from "../java/modUtils";
import { latestLoaderVersion, settingsByVersion, type FabricModSettings } from "./modSettings";
import path from "path";
import fs from "fs-extra";
import type { ModInfo } from "../mod";
import { toSnakeCaseString } from "../utils";

export class GradleUtilities {
    public static generateGradleFiles(output_path: string,
        mod_info: ModInfo, settings?: FabricModSettings): void {
        ///////////////////// GRADLE FILES GENERATION ///////////////////////////
        console.log("[rubydia2] Generating gradle files...");

        const gradleFilesFolder: string = path.join(ModUtils.getRubydia2Folder(), "gradle_files");
        
        if (!settings) {
            settings = settingsByVersion.latest;
        }

        // settings.gradle
        if (!fs.existsSync(path.join(gradleFilesFolder, "settings.gradle"))) {
            throw new Error("[rubydia2] settings.gradle not found.");
        }
        fs.ensureDirSync(output_path);
        fs.copyFileSync(path.join(gradleFilesFolder, "settings.gradle"),
        path.join(output_path, "settings.gradle"));

        // gradle.properties and build.gradle
        const gradleProperties = this.gradlePropertiesGenerator(settings, mod_info);
        const gradleBuild = this.gradleBuildGenerator(settings);
        fs.writeFileSync(path.join(output_path, "gradle.properties"), gradleProperties);
        fs.writeFileSync(path.join(output_path, "build.gradle"), gradleBuild);

        // gradlew
        if (!fs.existsSync(path.join(gradleFilesFolder, "gradlew"))) {
            throw new Error("[rubydia2] gradlew not found.");
        }
        fs.copyFileSync(path.join(gradleFilesFolder, "gradlew"),
        path.join(output_path, "gradlew"));

        // gradlew.bat
        if (!fs.existsSync(path.join(gradleFilesFolder, "gradlew.bat"))) {
            throw new Error("[rubydia2] gradlew.bat not found.");
        }
        fs.copyFileSync(path.join(gradleFilesFolder, "gradlew.bat"),
        path.join(output_path, "gradlew.bat"));

        // gradle folder
        if (!fs.existsSync(path.join(gradleFilesFolder, "gradle"))) {
            throw new Error("[rubydia2] gradle folder not found.");
        }
        fs.copySync(path.join(gradleFilesFolder, "gradle"), path.join(output_path, "gradle"));

        console.log("[rubydia2] Done generating gradle files.");
    }


    public static gradlePropertiesGenerator(settings: FabricModSettings, mod_info: ModInfo): string {
        ///////////////////// GRADLE PROPERTIES GENERATION ///////////////////////////
        // gradle.properties
        const mod_id: string = toSnakeCaseString(mod_info.name);

        let gradleProperties: string = `
# Generated With Rubydia2(Don't change. this file will be replaced on the next build)
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
        if (process.env.RUBYDIA2_GENERATE_JAVA_HOME) {
            gradleProperties += `org.gradle.java.home=${process.env.RUBYDIA2_GENERATE_JAVA_HOME}`
        }

        return gradleProperties;
    }
    

    public static gradleBuildGenerator(settings: FabricModSettings): string {
        ///////////////////// GRADLE BUILD GENERATION ///////////////////////////
        // build.gradle
        const gradleBuild = fs.readFileSync(
            path.join(ModUtils.getRubydia2Folder(), "gradle_files", "build.gradle"), "utf-8");

        return gradleBuild.replaceAll("${RUBYDIA2_JAVA_VERSION}", settings.java_version);
    }
}