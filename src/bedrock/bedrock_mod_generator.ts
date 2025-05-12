import { BaseModGenerator } from "../mod_generator";
import { Mod, type ModInfo } from "../mod";
import { type BedrockManifest, type BedrockUUIDs } from "./bedrock_manifest";
import { generateOrGetUUIDs, modInfoToManifest } from "./bedrock_utils";
import fs from "fs-extra";
import path from "path";
import os from "os";
import open from "open";
import archiver from "archiver";
import type { Item } from "../item";
import { BedrockItemGenerator, defaultItemIcon } from "./bedrock_item";
import { BedrockTranslationGenerator } from "./translation_generator";
import type { MinecraftLanguage } from "../language";
import { ModUtils } from "../java/modUtils";
import util from "node:util";
import type { IdentifiablePlatformRegistry } from "../registry";
import { TranslationManager } from "../translation";

const rubydia2Folder = path.join(import.meta.dirname, "..", "..");

export type PackType = 'behavior_pack' | 'resource_pack';

export const defaultPackIcon: string = path.join(rubydia2Folder, "assets", "default_icon.png");

export class BedrockModGenerator extends BaseModGenerator {
    public static override generate(mod: Mod, output_path?: string): void {
        this.log("Generating Bedrock addon...");

        const uuids = generateOrGetUUIDs();

        const generate_path: string = output_path || process.env.DEFAULT_GENERATE_PATH || "./build/";
        const rp_path: string = path.join(generate_path, 'resource_packs');
        const bp_path: string = path.join(generate_path, 'behavior_packs');
        ////// Generating Resource Pack(RP)
        this.generateResourcePack(mod, uuids, rp_path);

        ////// Generating Behavior Pack(BP)
        this.generateBehaviorPack(mod, uuids, bp_path);

        this.log("Done. Generated Bedrock addon.");
    }
    public static override generateToPath(mod: Mod, path: string): void {
        this.generate(mod, path);
    }

    public static generateResourcePackFromMod(mod: Mod, path: string): void {
        this.log("Generating Resource Pack...");

        if (!path) {
            path = "./build/resource_packs";
        }

        fs.ensureDirSync(path);

        this.generateResourcePack(mod, generateOrGetUUIDs(), path);

        this.log("Done. Generated Resource Pack");
        
    }

    public static generateBehaviorPackFromMod(mod: Mod, path: string): void {
        this.log("Generating Behavior Pack...");

        if (!path) {
            path = "./build/behavior_packs";
        }

        fs.ensureDirSync(path);

        this.generateBehaviorPack(mod, generateOrGetUUIDs(), path);

        this.log("Done. Generated Behavior Pack");
    }

    public static override generateAndLaunch(mod: Mod): void {
        if (!(os.platform() === 'win32' && process.env.LOCALAPPDATA)) {
            this.error("Unsupported platform to launch game.");
            return;
        }

        // Getting Minecraft Bedrock Path on windows
        const generate_path = path.join(process.env.LOCALAPPDATA,
                "Packages", "Microsoft.MinecraftUWP_8wekyb3d8bbwe",
                "LocalState", "games", "com.mojang");

        // Generating addon
        const rp_path = path.join(generate_path, "development_resource_packs", this.getResourcePackName(mod.modInfo));
        const bp_path = path.join(generate_path, "development_behavior_packs", this.getBehaviorPackName(mod.modInfo));

        this.generateResourcePackFromMod(mod, rp_path);
        this.generateBehaviorPackFromMod(mod, bp_path);

        // Launching Minecraft
        this.log("Done generating. launching Minecraft.");
        open("minecraft://");
    }

    public static generateAndCreateMcAddon(mod: Mod, output_path?: string, generate_path?: string): void {
        this.generate(mod, generate_path);

        this.log("Creating .mcaddon file...");

        fs.ensureDirSync(output_path || "./dist/");
        const output_stream = fs.createWriteStream(path.join(output_path || "./dist/", `${mod.modInfo.name}.mcaddon`));
        
        const archive = archiver('zip');
        archive.on('warning', (err) => {
            this.warn(`While creating .mcaddon file: ${err}`)
        });
        archive.on('error', (err) => {
            throw new Error(`While creating .mcaddon file: ${err}`);
        });
        
        archive.pipe(output_stream);
        
        const rp_path = path.join(generate_path || "./build/", 'resource_packs');
        const bp_path = path.join(generate_path || "./build/", 'behavior_packs');
        
        archive.directory(rp_path, this.getResourcePackName(mod.modInfo));
        archive.directory(bp_path,  this.getBehaviorPackName(mod.modInfo));

        this.log("Done. Created .mcaddon file.");
    }

    public static generateResourcePack(mod: Mod, uuids: BedrockUUIDs, generate_path?: string): void {
        if (!generate_path) {
            generate_path = "./build/";
            generate_path = path.join(generate_path, 'resource_packs');
        }


        fs.ensureDirSync(generate_path); // Ensuring that Resource Pack folder exists

        this.log("Generating manifest.json and adding Addon Icon.");
        this.generateBasePack(mod.modInfo, generate_path, 'resource_pack', uuids);

        this.log("Generating Item Resources.");
        this.generateItemsResources(mod.modInfo, mod.itemRegistry, generate_path);

        this.log("Generating Translations.");
        this.generateTranslations(mod, 'resource_pack', mod.translationManager, generate_path);

    }

    public static generateBehaviorPack(mod: Mod, uuids: BedrockUUIDs, generate_path?: string): void {
        if (!generate_path) {
            generate_path = "./build/";
            generate_path = path.join(generate_path, 'behavior_packs');
        }


        fs.ensureDirSync(generate_path);

        this.log("Generating manifest.json and adding Addon Icon.");
        this.generateBasePack(mod.modInfo, generate_path, 'behavior_pack', uuids);

        this.log("Generating Item Behaviors.");
        this.generateItemsBehavior(mod.itemRegistry, mod.getModID(), generate_path);
        this.log("Generating Translations.");
        this.generateTranslations(mod, 'behavior_pack', mod.translationManager, generate_path);

    }

    public static generateBasePack(mod_info: ModInfo, gen_path: string, pack_type: PackType, uuids: BedrockUUIDs): void {
        const modManifest: BedrockManifest = modInfoToManifest(mod_info, uuids[pack_type],
            pack_type === 'behavior_pack' ?  'data' : 'resources');
        
        fs.writeJSONSync(path.join(gen_path, "manifest.json"), modManifest);

        if (mod_info.icon && fs.existsSync(mod_info.icon)) {
            fs.copyFileSync(mod_info.icon, path.join(gen_path, "pack_icon.png"));
        } else {
            fs.copyFileSync(defaultPackIcon, path.join(gen_path, "pack_icon.png"));
        }

    }

    public static generateItemsResources(mod_info: ModInfo, items: IdentifiablePlatformRegistry<Item>, generate_path: string): void {
        fs.ensureDirSync(path.join(generate_path, "textures", "items")); // Ensuring that Items folder exists
        fs.ensureDirSync(path.join(generate_path, "texts")); // Ensuring that Blocks folder exists

        items.forEachInBedrock(item => {
            const itemTextureFile: string = item.texture || defaultItemIcon;
            if (fs.existsSync(itemTextureFile)) {
                fs.copyFileSync(itemTextureFile, path.join(generate_path, "textures", "items",  path.parse(itemTextureFile).base));
            } else {
                throw new Error(`[rubydia2] rubydia2 Default item texture file not found: ${itemTextureFile}`);
            }
        });

        fs.writeJSONSync(
            path.join(generate_path, "textures", "item_texture.json"), 
            BedrockItemGenerator.generateItemTextureJSON(this.getResourcePackName(mod_info), ModUtils.getModID(mod_info), items)
        );
    }

    public static generateTranslations(mod: Mod, packType: PackType, translationManager: TranslationManager, generatePath: string) {
        let modUsedLanguages: MinecraftLanguage[] = ['en_US'];
        
        const itemTranslations = BedrockTranslationGenerator.generateRubydiaItemTranslations(translationManager, mod.itemRegistry);
        
        const textsFolder = path.join(generatePath, "texts");
        const enUSTranslationPath = path.join(textsFolder, "en_US.lang");

        fs.ensureDirSync(textsFolder);
        
        let enUSTranslationFileContents = 
        `pack.name=${mod.modInfo.name} [${packType === 'resource_pack' ? 'RP' : 'BP'}]\npack.description=${mod.modInfo.description}\n`;

        fs.writeFileSync(enUSTranslationPath, enUSTranslationFileContents);

        fs.appendFileSync(enUSTranslationPath, BedrockTranslationGenerator.generateTranslations("en_US", itemTranslations));

        for (const language of translationManager.languages()) {
            if (!modUsedLanguages.includes(language)) {
                modUsedLanguages.push(language);
            }

            fs.appendFileSync(path.join(textsFolder, `${language}.lang`),
                BedrockTranslationGenerator.generateRubydiaKeyTranslations(language, translationManager, mod.getModID()));

            if (language !== 'en_US') {
                fs.appendFileSync(path.join(textsFolder, `${language}.lang`), BedrockTranslationGenerator.generateTranslations(language, itemTranslations));
            }
        }

        fs.writeJSONSync(textsFolder, modUsedLanguages);

    }

    public static generateItemsBehavior(items: IdentifiablePlatformRegistry<Item>, mod_id: string, generate_path: string): void {

        fs.ensureDirSync(path.join(generate_path, "items")); // Ensuring that Items folder exists
        
        items.forEachInBedrock(item => {
            const itemPathID = item.getID().getPath();
            fs.writeJSONSync(
                path.join(generate_path, "items", `${itemPathID}.json`), 
                BedrockItemGenerator.generateItemJSON(mod_id, item)
            );
        });

    }

    public static getResourcePackName(mod_info: ModInfo): string {
        return `${mod_info.name} [RP]`;
    }
        public static getBehaviorPackName(mod_info: ModInfo): string {
        return `${mod_info.name} [BP]`;
    }

    public static log(msg: any) {
        console.log(`${util.styleText("dim", "[LOG]")} [rubydia2] [Bedrock Addon Generator]: ${msg}`);
    }

    public static warn(msg: any, version?: string) {
        console.warn(`${util.styleText("yellow", "[WARNING]")} [rubydia2] [Bedrock Addon Generator]: ${msg}`);
    }

    public static error(msg: any, version?: string) {
        console.error(this.getErrorString(msg, version));
    }

    public static getErrorString(msg: any, version?: string) {
        return `${util.styleText("red", "[ERROR]")} [rubydia2] [Bedrock Addon Generator]: ${msg}`;
    }
}