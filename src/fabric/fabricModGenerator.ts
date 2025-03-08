import type { Mod, ModInfo } from "../mod";
import { BaseModGenerator } from "../mod_generator";
import fs from "fs-extra";
import path from "path";
import { type FabricModInfo, type FabricModLoadingInfo, type FabricModMetadata } from "./fabricModData";
import { settingsByVersion, type FabricModSettings, type FabricSupportedJavaVersion } from "./modSettings";
import { FabricJavaParser } from "./javaCode";
import type { Item } from "../item";
import { isVersionNewerThan } from "./utils";
import { ModUtils } from "../java/modUtils";
import { JavaItemUtils } from "../java/item/item";
import { TranslationGenerator } from "../java/translationGenerator";
import { GradleUtilities } from "./gradle";
import { FabricModUtils } from "./fabricModUtils";

const rubydia2Folder = path.join(import.meta.dirname, "..", "..");

export class FabricModGenerator extends BaseModGenerator {
    public static override generate(mod: Mod, version?: FabricSupportedJavaVersion, output_path?: string): void {
        ///////////////////// FABRIC MOD GENERATION ///////////////////////////
        console.log(`[rubydia2] Generating Fabric mod for version ${version}...`);

        const mod_id = ModUtils.getModID(mod.modInfo);

        if (!version) {
            version = settingsByVersion.latest.version;
        }

        const mod_fabric_settings: FabricModSettings = settingsByVersion[version];
        const generate_path: string = ModUtils.getModGeneratePath(version, output_path);

        fs.ensureDirSync(generate_path);
        GradleUtilities.generateGradleFiles(generate_path, mod.modInfo, mod_fabric_settings);
        FabricModUtils.generateModFabricFiles(mod.modInfo, generate_path);

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
            this.generateModItems(mod.getItems(), mod.modInfo, generate_path, mod_fabric_settings);
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
        GradleUtilities.runGradleTask("runClient", ModUtils.getModGeneratePath(version, output_path));
    }

    public static generateJar(mod: Mod, version?: FabricSupportedJavaVersion, output_path?: string): void {
        if (!version) {
            version = settingsByVersion.latest.version;
        }
        fs.ensureDirSync("./dist/");

        this.generateAndBuild(mod, version, output_path);

        const mod_path = ModUtils.getModGeneratePath(version, output_path);
        const libs_folder = path.join(mod_path, "build", "libs");

        if (fs.existsSync(libs_folder)) {
            fs.copySync(libs_folder, path.resolve("dist/"));
        } else {
            throw new Error(`[rubydia2] Error: Not found the folder containing the mod jar files in ${libs_folder}.`);
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

        GradleUtilities.runGradleTask("build", mod_path);

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

        const items_java = FabricJavaParser.parseModItems(file_java, items, ModUtils.getModID(mod_info), settings);

        const items_folder = path.join(ModUtils.getJavaSrcFolder(output_path), 
        ModUtils.getModPackage(mod_info).replaceAll(".", path.sep), "item");

        fs.ensureDirSync(items_folder);
        fs.writeFileSync(path.join(items_folder, "ModItems.java"), items_java);
        

        console.log("[rubydia2] Done generating Mod Items.");
    }
}