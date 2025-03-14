import type { Mod, ModInfo } from "../mod";
import { BaseModGenerator } from "../mod_generator";
import fs from "fs-extra";
import path from "path";
import { settingsByVersion, type FabricModSettings, type FabricSupportedJavaVersion } from "./modSettings";
import { FabricJavaParser } from "./javaCode";
import type { Item } from "../item";
import { isVersionNewerThan } from "./utils";
import { ModUtils } from "../java/modUtils";
import { JavaItemUtils } from "../java/item/item";
import { TranslationGenerator } from "../java/translationGenerator";
import { GradleUtilities } from "./gradle";
import { FabricModUtils } from "./fabricModUtils";
import util from "node:util";

const rubydia2Folder = path.join(import.meta.dirname, "..", "..");

export class FabricModGenerator extends BaseModGenerator {
    public static override generate(mod: Mod, version?: FabricSupportedJavaVersion, output_path?: string): void {
        const mod_id = ModUtils.getModID(mod.modInfo);
        
        if (!version) {
            version = settingsByVersion.latest.version;
        }

        this.log(`Generating Fabric mod...`, version);
        
        const mod_fabric_settings: FabricModSettings = settingsByVersion[version];
        const generate_path: string = ModUtils.getModGeneratePath(version, output_path);

        // Generating File Structure
        this.log("Generating File Structure...", version);
        fs.ensureDirSync(generate_path);
        this.createModFileStructure(generate_path, mod_id);

        this.log("Generating Gradle files...", version);
        GradleUtilities.generateGradleFiles(generate_path, mod.modInfo, mod_fabric_settings);
        this.log("Generating Fabric Files...", version);
        FabricModUtils.generateModFabricFiles(mod.modInfo, generate_path);

        // Main file structure
        const java_src_folder: string = ModUtils.getJavaSrcFolder(generate_path);
        const assetsFolder = ModUtils.getAssetsFolderLocation(generate_path, mod_id);
        const java_package = path.join(java_src_folder, ModUtils.getModPackage(mod.modInfo).replaceAll(".", path.sep));

        
        // Mod Java File
        this.log("Generating Mod Entrypoint Class...", version);

        let mod_java_file: string = fs.readFileSync(
            path.join(rubydia2Folder, "java_files", "fabric",  "Mod.java"), "utf-8");

        mod_java_file = FabricJavaParser.parseModInfo(mod_java_file, mod.modInfo);

        // checking if mod has items if not then it don't need the item implementation code
        mod_java_file = mod_java_file.replaceAll("${IF_RUBYDIA2_MOD_ITEMS}", (mod.getItems().length <= 0 ? "//" : ""));

        // writing main.java
        fs.writeFileSync(path.join(java_package, `${ModUtils.getModClassName(mod.modInfo)}.java`), mod_java_file);

        // Mod Icon
        this.log("Copying Mod Icon...", version);

        const rubydia2_icon = path.join(rubydia2Folder, "assets", "default_icon.png");
        if (!fs.existsSync(rubydia2_icon)) {
            throw new Error("Missing asset \"default_icon.png\".");
        }

        if (mod.modInfo.icon && fs.existsSync(mod.modInfo.icon)) {
            fs.copyFileSync(mod.modInfo.icon, path.join(assetsFolder, "icon.png"));
        } else {
            this.warn("Icon Specified not found. Using rubydia2 icon.", version);
            fs.copyFileSync(rubydia2_icon, path.join(assetsFolder, "icon.png"));
        }

        fs.copyFileSync(rubydia2_icon, path.join(assetsFolder, "rubydia2_icon.png"));
        
        // Items
        if (mod.getItems().length > 0) {
            this.log("Generating Items code...", version);
            this.generateModItems(mod.getItems(), mod.modInfo, generate_path, mod_fabric_settings);
        } else {
            this.log("No Items in to generate skipping Items generation...", version);
        }
        const mod_items = mod.getItems();
        this.log("Generating translations...", version);
        TranslationGenerator.generateAllTranslations(mod.modInfo, mod.getAllItemTranslations(), mod.getAllLanguages(), generate_path);
        
        this.log("Generating Item Models", version);
        JavaItemUtils.generateModels(mod_items, mod.modInfo, generate_path);
        
        this.log("Copying Item Textures", version);
        JavaItemUtils.copyItemTextures(mod_items, mod.modInfo, generate_path);

        this.log("Done. Generated Fabric mod.", version);
    }

    public static override generateAndLaunch(mod: Mod, version?: FabricSupportedJavaVersion, output_path?: string): void {
        this.generate(mod, version, output_path);
        if (!version) {
            version = settingsByVersion.latest.version;
        }

        this.log("Launching Fabric mod...", version);
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
            throw new Error(`Not found the folder containing the mod jar files in ${libs_folder}.`);
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
        this.log("Building generated mod...");

        GradleUtilities.runGradleTask("build", mod_path);

        this.log("Done building generated mod.");
    }

    public static createModFileStructure(output_path: string, mod_id: string): void {
        const java_src_folder: string = path.join(output_path, "src", "main", "java");
        const assetsFolder = ModUtils.getAssetsFolderLocation(output_path, mod_id);
        
        let java_package: string = path.join(java_src_folder, "com", "rubydia2", mod_id);
        
        if (process.env.JAVA_PACKAGE) {
            java_package = path.join(java_src_folder, process.env.JAVA_PACKAGE.replaceAll(".", path.sep));
        }
        fs.ensureDirSync(path.join(java_package, "mixin"));
        fs.ensureDirSync(assetsFolder);
    }

    public static generateModItems(items: Item[], mod_info: ModInfo, output_path: string, settings?: FabricModSettings): void {

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
        
    }

    public static log(msg: any, version?: string) {
        console.log(`${util.styleText("dim", "[LOG]")} [rubydia2] [Fabric Generator (${version})]: ${msg}`);
    }

    public static warn(msg: any, version?: string) {
        console.warn(`${util.styleText("yellow", "[WARNING]")} [rubydia2] [Fabric Generator (${version})]: ${msg}`);
    }

    public static error(msg: any, version?: string) {
        console.error(this.getErrorString(msg, version));
    }

    public static getErrorString(msg: any, version?: string) {
        return `${util.styleText("red", "[ERROR]")} [rubydia2] [Fabric Generator (${version})]: ${msg}`;
    }
}