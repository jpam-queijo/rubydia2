import type { Mod, ModInfo } from "../mod";
import { BaseModGenerator } from "../mod_generator";
import fs from "fs-extra";
import path from "path";
import { type FabricModInfo, type FabricModLoadingInfo, type FabricModMetadata } from "./mod";
import * as shell from "shelljs";
import os from "os";
import { settingsByVersion, type FabricModSettings, type FabricSupportedJavaVersion } from "./modSettings";
import { FabricJavaParser } from "./javaCode";
import type { Item } from "../item";
import { isVersionNewerThan } from "./utils";
import { ModUtils } from "../java/modUtils";
import { JavaItemUtils } from "../java/item/item";
import { TranslationGenerator } from "../java/translationGenerator";
import { GradleUtilities } from "./gradle";

const rubydia2Folder = path.join(import.meta.dirname, "..", "..");

export class FabricModGenerator extends BaseModGenerator {
    public static override generate(mod: Mod, version?: FabricSupportedJavaVersion, output_path?: string): void {
        ///////////////////// FABRIC MOD GENERATION ///////////////////////////
        console.log("[rubydia2] Generating Fabric mod...");

        const mod_id = ModUtils.getModID(mod.modInfo);

        if (!version) {
            version = settingsByVersion.latest.version;
        }

        const mod_fabric_settings: FabricModSettings = settingsByVersion.latest;
        const generate_path: string = ModUtils.getModGeneratePath(version, output_path);

        fs.ensureDirSync(generate_path);
        GradleUtilities.generateGradleFiles(generate_path, mod.modInfo, mod_fabric_settings);
        this.generateModFabricFiles(mod.modInfo, generate_path);

        // Main file structure
        const java_src_folder: string = ModUtils.getJavaSrcFolder(generate_path);
        const assetsFolder = ModUtils.getAssetsFolderLocation(generate_path, mod_id);
        const java_package = path.join(java_src_folder, ModUtils.getModPackage(mod.modInfo).replaceAll(".", path.sep));

        this.createModFileStructure(generate_path, mod_id);
        // Mod Java File

        let mod_java_file: string = fs.readFileSync(
            path.join(rubydia2Folder, "java_files", "fabric",  "Mod.java"), "utf-8");

        mod_java_file = FabricJavaParser.parseModInfo(mod_java_file, mod.modInfo);

        // checking if mod has items if not then it don't need the item implementation code
        mod_java_file = mod_java_file.replaceAll("${IF_RUBYDIA2_MOD_ITEMS}", (mod.getItems().length <= 0 ? "//" : ""));

        // writing main.java
        fs.writeFileSync(path.join(java_package, `${ModUtils.getModClassName(mod.modInfo)}.java`), mod_java_file);

        // Mod Icon
        const rubydia2_icon = path.join(rubydia2Folder, "assets", "default_icon.png");
        if (!fs.existsSync(rubydia2_icon)) {
            throw new Error("[rubydia2] Missing asset \"default_icon.png\".");
        }

        if (mod.modInfo.icon && fs.existsSync(mod.modInfo.icon)) {
            fs.copyFileSync(mod.modInfo.icon, path.join(assetsFolder, "icon.png"));
        } else {
            console.warn("[rubydia2] Icon Specified not found. Using rubydia2 icon.");
            fs.copyFileSync(rubydia2_icon, path.join(assetsFolder, "icon.png"));
        }

        fs.copyFileSync(rubydia2_icon, path.join(assetsFolder, "rubydia2_icon.png"));
        
        // Items
        if (mod.getItems().length > 0) {
            this.generateModItems(mod.getItems(), mod.modInfo, generate_path);
        }
        const mod_items = mod.getItems();
        console.log("[rubydia2] Generating translations...");
        TranslationGenerator.generateAllTranslations(mod.modInfo, mod.getAllItemTranslations(), mod.getAllLanguages(), generate_path);
        console.log("[rubydia2] Done generating translations.");
        
        console.log("[rubydia2] Generating Item Models");
        JavaItemUtils.generateModels(mod_items, mod.modInfo, generate_path);
        JavaItemUtils.generateItemModelDescription(mod_items, generate_path, mod.modInfo);
        console.log("[rubydia2] Done generating Item Models.");
        
        console.log("[rubydia2] Copying Item Textures");
        JavaItemUtils.copyItemTextures(mod_items, mod.modInfo, generate_path);
        console.log("[rubydia2] Done copying item textures.");

        

        console.log("[rubydia2] Done generating Fabric mod.");
    }

    public static override generateAndLaunch(mod: Mod, version?: FabricSupportedJavaVersion, output_path?: string): void {
        this.generate(mod, version, output_path);
        if (!version) {
            version = settingsByVersion.latest.version;
        }

        console.log("[rubydia2] Launching Fabric mod...");
        shell.cd(path.join(shell.pwd(), ModUtils.getModGeneratePath(version, output_path)));
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
        this.buildGeneratedMod(ModUtils.getModGeneratePath(version, output_path));
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
        const assetsFolder = ModUtils.getAssetsFolderLocation(output_path, mod_id);
        
        let java_package: string = path.join(java_src_folder, "com", "rubydia2", mod_id);
        
        if (process.env.JAVA_PACKAGE) {
            java_package = path.join(java_src_folder, process.env.JAVA_PACKAGE.replaceAll(".", path.sep));
        }
        fs.ensureDirSync(path.join(java_package, "mixin"));
        fs.ensureDirSync(assetsFolder);
        console.log("[rubydia2] Done Generating Mod File Structure...");
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
            id: ModUtils.getModID(mod_info),
            version: "${version}"
        };

        const fabric_mod_metadata: FabricModMetadata = {
            name: mod_info.name,
            description: mod_info.description,
            icon: `assets/${ModUtils.getModID(mod_info)}/icon.png`,
            authors: mod_info.authors,
            contact: {
                homepage: mod_info.homepage
            },
            license: mod_info.license
        }

        const fabric_mod_loading_info: FabricModLoadingInfo = {
            environment: "*",
            entrypoints: {
                main: [ `${ModUtils.getModPackage(mod_info)}.${ModUtils.getModClassName(mod_info)}`]
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

        const items_java = FabricJavaParser.parseModItems(file_java, items, ModUtils.getModID(mod_info));

        const items_folder = path.join(ModUtils.getJavaSrcFolder(output_path), 
        ModUtils.getModPackage(mod_info).replaceAll(".", path.sep), "item");

        fs.ensureDirSync(items_folder);
        fs.writeFileSync(path.join(items_folder, "ModItems.java"), items_java);
        

        console.log("[rubydia2] Done generating Mod Items.");
    }
}