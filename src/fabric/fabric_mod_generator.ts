import type { Mod, ModInfo, Translation, Version } from "../mod";
import { BaseModGenerator } from "../mod_generator";
import { toCamelCaseString, toSnakeCaseString, capitalizeFirstLetter } from "../utils";
import fs from "fs-extra";
import path from "path";
import { type FabricModInfo, type FabricModLoadingInfo, type FabricModMetadata } from "./mod";
import * as shell from "shelljs";
import os from "os";
import { latestLoaderVersion, settingsByVersion, type FabricModSettings, type FabricSupportedJavaVersion } from "./mod_settings";
import { FabricJavaParser } from "./java_code";
import type { Item } from "../item";
import { isVersionNewerThan } from "./utils";
import { FabricTranslationGenerator } from "./translation_generator";
import { FabricItemGenerator } from "./item";

const rubydia2Folder = path.join(import.meta.dirname, "..", "..");

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
            path.join(rubydia2Folder, "java_files", "fabric",  "Mod.java"), "utf-8");

        mod_java_file = FabricJavaParser.parseModInfo(mod_java_file, mod.modInfo);

        // checking if mod has items if not then it don't need the item implementation code
        mod_java_file = mod_java_file.replaceAll("${IF_RUBYDIA2_MOD_ITEMS}", (mod.getItems().length <= 0 ? "//" : ""));

        // writing main.java
        fs.writeFileSync(path.join(java_package, `${capitalizeFirstLetter(toCamelCaseString(mod.modInfo.name))}.java`), mod_java_file);

        // Mod Icon
        const rubydia2_icon = path.join(rubydia2Folder, "assets", "default_icon.png");
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
        
        // Items
        if (mod.getItems().length > 0) {
            this.generateModItems(mod.getItems(), mod.modInfo, generate_path);
        }

        this.generateTranslations(mod, generate_path);
        this.generateModels(mod, generate_path);
        this.copyItemTextures(mod.getItems(), mod.modInfo, generate_path);

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

        const gradleFilesFolder: string = path.join(rubydia2Folder, "gradle_files");
        
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
            path.join(rubydia2Folder, "gradle_files", "build.gradle"), "utf-8");

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

    public static generateModItems(items: Item[], mod_info: ModInfo, output_path: string, settings?: FabricModSettings): void {
        console.log("[rubydia2] Generating Mod Items...");

        let mcVersion: string = settingsByVersion.latest.version;
        if (settings && settings.version) {
            mcVersion = settings.version;
        }

        let mod_items_filepath: string = path.join(rubydia2Folder, "java_files", "fabric", "item", "ModItems.java");
        
        if (isVersionNewerThan(mcVersion, "1.21.2") || mcVersion === "1.21.2") {
            mod_items_filepath = path.join(rubydia2Folder, "java_files", "fabric", "1.21.2", "item", "ModItems.java");
        }
        
        let file_java = fs.readFileSync(mod_items_filepath, "utf-8");
        file_java = FabricJavaParser.parseModInfo(file_java, mod_info);

        const items_java = FabricJavaParser.parseModItems(file_java, items);

        const items_folder = path.join(this.getJavaSrcFolder(output_path), 
        this.getModPackage(mod_info).replaceAll(".", path.sep), "item");

        fs.ensureDirSync(items_folder);
        fs.writeFileSync(path.join(items_folder, "ModItems.java"), items_java);
        

        console.log("[rubydia2] Done generating Mod Items.");
    }

    public static generateTranslations(mod: Mod, generate_path: string): void {
        const mod_id = this.getModID(mod.modInfo);
        const lang_folder_path = path.join(this.getAssetsFolderLocation(generate_path, mod_id), "lang");
        
        fs.ensureDirSync(lang_folder_path);

        //let translations: {[key: string]: string} = {};
        for (const language of mod.getAllLanguages()) {
            const json_filepath = path.join(lang_folder_path, `${language.toLowerCase()}.json`);
            const translation = FabricTranslationGenerator.generateItemTranslation(mod_id, mod.getAllItemTranslations(), language);
            fs.writeJSONSync(json_filepath, translation);
        }
    }

    public static generateModels(mod: Mod, generate_path: string): void {
        const assets_folder = this.getAssetsFolderLocation(generate_path, this.getModID(mod.modInfo));
        const item_models_folder = path.join(assets_folder, "models", "item")
        fs.ensureDirSync(item_models_folder);

        console.log("[rubydia2] Generating item models...");

        mod.getItems().forEach(item => {
            let default_item_texture: boolean = false;
            if (item.texture) {
                default_item_texture = !fs.existsSync(item.texture);
            }
            const item_model = FabricItemGenerator.generateItemModel(item, default_item_texture);
            fs.writeJSONSync(path.join(item_models_folder, `${item.id}.json`), item_model);
        });

        console.log("[rubydia2] Done generating item models.");
    }

    public static copyItemTextures(items: Item[], mod_info: ModInfo, generate_path: string): void {
        const assets_folder = this.getAssetsFolderLocation(generate_path, this.getModID(mod_info));
        const item_texture_folder = path.join(assets_folder, "textures", "item");
        const misc_texture_folder = path.join(assets_folder, "textures", "misc");
        const queijo_texture = path.join(rubydia2Folder, "assets", "queijo.png")

        fs.ensureDirSync(item_texture_folder);
        fs.ensureDirSync(misc_texture_folder);

        if (!fs.existsSync(queijo_texture)) {
            throw new Error("[rubydia2] Default item texture \"queijo.png\".");
        }

        fs.copyFileSync(queijo_texture, path.join(misc_texture_folder, "queijo.png"));

        items.forEach(item => {
            if (item.texture && fs.existsSync(item.texture)) {
                fs.copyFileSync(item.texture, path.join(item_texture_folder, `${item.id}.png`));
            }
        });
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