import type { Mod, ModInfo, Version } from "./mod";
import { BaseModGenerator } from "./mod_generator";
import { toCamelCaseString, toSnakeCaseString, capitalizeFirstLetter } from "./utils";
import fs from "fs-extra";
import path from "path";
import { type FabricModInfo, type FabricModLoadingInfo, type FabricModMetadata } from "./fabric_mod";
import * as shell from "shelljs";
import os from "os";
import { latestLoaderVersion, settingsByVersion, type FabricModSettings, type FabricSupportedJavaVersion } from "./fabric_mod_settings";

export class FabricModGenerator extends BaseModGenerator {
    public static override generate(mod: Mod, version?: FabricSupportedJavaVersion, output_path?: string): void {
        ///////////////////// FABRIC MOD GENERATION ///////////////////////////
        console.log("[rubydia2] Generating Fabric mod...");

        const mod_id = this.getModID(mod.modInfo);

        if (!version) {
            version = settingsByVersion.latest.version;
        }

        const mod_fabric_settings: FabricModSettings = settingsByVersion.latest;
        const generate_path: string = this.getModGeneratePath(version, output_path);

        fs.ensureDirSync(generate_path);
        this.generateGradleFiles(generate_path, mod.modInfo, mod_fabric_settings);
        this.generateModFabricFiles(mod.modInfo, generate_path);

        // Main file structure
        const java_src_folder: string = this.getJavaSrcFolder(generate_path);
        const assetsFolder = this.getAssetsFolderLocation(generate_path, mod_id);
        const java_package = path.join(java_src_folder, this.getModPackage(mod.modInfo).replaceAll(".", path.sep));

        this.createModFileStructure(generate_path, mod_id);
        // Mod Java File

        let mod_java_file: string = fs.readFileSync(
            path.join(import.meta.dirname, "..", "java_files", "fabric",  "Mod.java"), "utf-8");

        mod_java_file = this.parseJavaFile(mod_java_file, mod.modInfo);
        fs.writeFileSync(path.join(java_package, `${capitalizeFirstLetter(toCamelCaseString(mod.modInfo.name))}.java`), mod_java_file);

        // Mod Icon
        const rubydia2_icon = path.join(import.meta.dirname, "..", "assets", "default_icon.png");
        if (!fs.existsSync(rubydia2_icon)) {
            throw new Error("[rubydia2] Missing asset \"default_icon.png\".");
        }

        if (mod.modInfo.icon && fs.existsSync(mod.modInfo.icon)) {
            fs.copyFileSync(mod.modInfo.icon, path.join(assetsFolder, "icon.png"));
        } else {
            console.warn("[rubydia2] Icon Specified not found. Using rubydia2 icon.")
            fs.copyFileSync(rubydia2_icon, path.join(assetsFolder, "icon.png"));
        }

        fs.copyFileSync(rubydia2_icon, path.join(assetsFolder, "rubydia2_icon.png"));


        console.log("[rubydia2] Done generating Fabric mod.");
    }

    public static override generateAndLaunch(mod: Mod, version?: FabricSupportedJavaVersion, output_path?: string): void {
        this.generate(mod, version, output_path);
        if (!version) {
            version = settingsByVersion.latest.version;
        }

        console.log("[rubydia2] Launching Fabric mod...");
        shell.cd(path.join(shell.pwd(), this.getModGeneratePath(version, output_path)));
        if (!shell.test("-f", "gradlew") || !shell.test("-f", "gradlew.bat")) {
            throw new Error("[rubydia2] Gradlew not found.");
        }

        if (os.platform() === 'win32') {
            shell.exec(`gradlew.bat runClient`);
        } else {
            shell.exec(`./gradlew runClient`);
        }
    }

    public static override generateToPath(mod: Mod, path: string, version?: FabricSupportedJavaVersion): void {
        this.generate(mod, version, path);
    }

    public static generateAndBuild(mod: Mod, version?: FabricSupportedJavaVersion, output_path?: string): void {
        this.generate(mod, version, output_path);
        if (!version) {
            version = settingsByVersion.latest.version;
        }
        this.buildGeneratedMod(this.getModGeneratePath(version, output_path));
    }

    public static buildGeneratedMod(mod_path: string): void {
        console.log("[rubydia2] Building generated mod...");

        shell.cd(path.join(shell.pwd(), mod_path));
        if (!shell.test("-f", "gradlew") || !shell.test("-f", "gradlew.bat")) {
            throw new Error("[rubydia2] Gradlew not found.");
        }
        if (os.platform() === 'win32') {
            shell.exec(`gradlew.bat build`);
        } else {
            shell.exec(`./gradlew build`);
        }

        console.log("[rubydia2] Done building generated mod.");
    }

    public static createModFileStructure(output_path: string, mod_id: string): void {
        console.log("[rubydia2] Generating Mod File Structure...");
        const java_src_folder: string = path.join(output_path, "src", "main", "java");
        const assetsFolder = this.getAssetsFolderLocation(output_path, mod_id);
        
        let java_package: string = path.join(java_src_folder, "com", "rubydia2", mod_id);
        
        if (process.env.JAVA_PACKAGE) {
            java_package = path.join(java_src_folder, process.env.JAVA_PACKAGE.replaceAll(".", path.sep));
        }
        fs.ensureDirSync(path.join(java_package, "mixin"));
        fs.ensureDirSync(assetsFolder);
        console.log("[rubydia2] Done Generating Mod File Structure...");
    }


    public static generateGradleFiles(output_path: string,
        mod_info: ModInfo, settings?: FabricModSettings): void {
        ///////////////////// GRADLE FILES GENERATION ///////////////////////////
        console.log("[rubydia2] Generating gradle files...");

        const gradleFilesFolder: string = path.join(import.meta.dirname, "..", "gradle_files");
        
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
            path.join(import.meta.dirname, "..", "gradle_files", "build.gradle"), "utf-8");

        return gradleBuild.replaceAll("${RUBYDIA2_JAVA_VERSION}", settings.java_version);
    }

    public static generateModFabricFiles(mod_info: ModInfo, output_path: string) {
        console.log("[rubydia2] Generating Fabric Files...");


        fs.ensureDirSync(path.join(output_path, "src", "main", "resources"));
        
        const json_path: string = path.join(output_path, "src", "main", "resources", "fabric.mod.json");

        fs.writeJSONSync(json_path, this.generateFabricModMetadataJSON(mod_info));

        console.log("[rubydia2] Done generating Fabric files.");
    }

    public static generateFabricModMetadataJSON(mod_info: ModInfo) {
        const fabric_mod_info: FabricModInfo = {
            schemaVersion: 1,
            id: this.getModID(mod_info),
            version: "${version}"
        };

        const fabric_mod_metadata: FabricModMetadata = {
            name: mod_info.name,
            description: mod_info.description,
            icon: `assets/${this.getModID(mod_info)}/icon.png`,
            authors: mod_info.authors,
            contact: {
                homepage: mod_info.homepage
            },
            license: mod_info.license
        }

        const fabric_mod_loading_info: FabricModLoadingInfo = {
            environment: "*",
            entrypoints: {
                main: [ `${this.getModPackage(mod_info)}.${capitalizeFirstLetter(toCamelCaseString(mod_info.name))}`]
            },
            // no mixins for now
        }
        
        return {...fabric_mod_info, ...fabric_mod_metadata, ...fabric_mod_loading_info};
    }

    public static parseJavaFile(java_file: string, mod_info: ModInfo): string {
        java_file = java_file.replaceAll("${RUBYDIA2_MOD_PACKAGE}", this.getModPackage(mod_info));
        java_file = java_file.replaceAll("${RUBYDIA2_MOD_ID}", this.getModID(mod_info));
        java_file = java_file.replaceAll("${RUBYDIA2_MOD_CLASS_NAME}", capitalizeFirstLetter(toCamelCaseString(mod_info.name)));
        return java_file;
    }

    public static getModID(mod_info: ModInfo): string {
        return process.env.JAVA_MODID || toSnakeCaseString(mod_info.name);
    }

    public static getModPackage(mod_info: ModInfo): string {
        return process.env.JAVA_PACKAGE || `com.rubydia2.${this.getModID(mod_info)}`;
    }

    public static getModGeneratePath(version: FabricSupportedJavaVersion, specified_path?: string): string {
        return process.env.DEFAULT_GENERATE_PATH || specified_path || `./build/fabric/${version}/`
    }

    public static getAssetsFolderLocation(generate_path: string, mod_id: string): string {
        return path.join(generate_path, "src", "main", "resources", "assets", mod_id);
    }

    public static getJavaSrcFolder(generate_path: string) {
        return path.join(generate_path, "src", "main", "java");
    }
}