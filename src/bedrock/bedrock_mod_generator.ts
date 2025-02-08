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

const rubydia2Folder = path.join(import.meta.dirname, "..", "..");

export type PackType = 'behavior_pack' | 'resource_pack';

export const defaultPackIcon: string = path.join(rubydia2Folder, "assets", "default_icon.png");

export class BedrockModGenerator extends BaseModGenerator {
    public static override generate(mod: Mod, output_path?: string): void {
        console.log("[rubydia2] Generating Bedrock mod...");

        const uuids = generateOrGetUUIDs();

        const generate_path: string = output_path || process.env.DEFAULT_GENERATE_PATH || "./build/";
        const rp_path: string = path.join(generate_path, 'resource_packs');
        const bp_path: string = path.join(generate_path, 'behavior_packs');
        ////// Generating Resource Pack(RP)
        this.generateResourcePack(mod, uuids, rp_path);

        ////// Generating Behavior Pack(BP)
        this.generateBehaviorPack(mod, uuids, bp_path);

        console.log("[rubydia2] Done generating Bedrock mod.");
    }
    public static override generateToPath(mod: Mod, path: string): void {
        this.generate(mod, path);
    }

    public static generateResourcePackFromMod(mod: Mod, path: string): void {
        if (!path) {
            path = "./build/resource_packs";
        }

        fs.ensureDirSync(path);

        this.generateResourcePack(mod, generateOrGetUUIDs(), path);
        
    }

    public static generateBehaviorPackFromMod(mod: Mod, path: string): void {
        if (!path) {
            path = "./build/behavior_packs";
        }

        fs.ensureDirSync(path);

        this.generateBehaviorPack(mod, generateOrGetUUIDs(), path);
    }

    public static override generateAndLaunch(mod: Mod): void {
        if (os.platform() === 'win32' && process.env.LOCALAPPDATA) {

            // Getting Minecraft Bedrock Path on windows
            const generate_path = path.join(process.env.LOCALAPPDATA,
                 "Packages", "Microsoft.MinecraftUWP_8wekyb3d8bbwe",
                  "LocalState", "games", "com.mojang");

            // Generating mods
            const rp_path = path.join(generate_path, "development_resource_packs", this.getResourcePackName(mod.modInfo));
            const bp_path = path.join(generate_path, "development_behavior_packs", this.getBehaviorPackName(mod.modInfo));

            this.generateResourcePackFromMod(mod, rp_path);
            this.generateBehaviorPackFromMod(mod, bp_path);

            // Launching Minecraft
            console.log("[rubydia2] Done generating. launching Minecraft.");
            open("minecraft://");
        } else {
            throw new Error("[rubydia2] Unsupported platform to launch game.");
        }
    }

    public static generateAndCreateMcAddon(mod: Mod, output_path?: string, generate_path?: string): void {
        this.generate(mod, generate_path);

        console.log("[rubydia2] Creating .mcaddon file...");

        fs.ensureDirSync(output_path || "./dist/");
        const output_stream = fs.createWriteStream(path.join(output_path || "./dist/", `${mod.modInfo.name}.mcaddon`));
        
        const archive = archiver('zip');
        archive.on('warning', (err) => {
            console.warn(`[rubydia2] While creating .mcaddon file: ${err}`)
        });
        archive.on('error', (err) => {
            throw new Error(`[rubydia2] While creating .mcaddon file: ${err}`);
        });
        
        archive.pipe(output_stream);
        
        const rp_path = path.join(generate_path || "./build/", 'resource_packs');
        const bp_path = path.join(generate_path || "./build/", 'behavior_packs');
        
        archive.directory(rp_path, this.getResourcePackName(mod.modInfo));
        archive.directory(bp_path,  this.getBehaviorPackName(mod.modInfo));

        console.log("[rubydia2] Done Creating .mcaddon file.");
    }

    public static generateResourcePack(mod: Mod, uuids: BedrockUUIDs, generate_path?: string): void {
        console.log("[rubydia2] Generating resource pack...");
        if (!generate_path) {
            generate_path = "./build/";
            generate_path = path.join(generate_path, 'resource_packs');
        }


        fs.ensureDirSync(generate_path); // Ensuring that Resource Pack folder exists

        this.generateBasePack(mod.modInfo, generate_path, 'resource_pack', uuids);
        this.generateItemsResources(mod.modInfo, mod.getItems(), generate_path);

        console.log("[rubydia2] Done generating resource pack.");
    }

    public static generateBehaviorPack(mod: Mod, uuids: BedrockUUIDs, generate_path?: string): void {
        console.log("[rubydia2] Generating behavior pack...");
        if (!generate_path) {
            generate_path = "./build/";
            generate_path = path.join(generate_path, 'behavior_packs');
        }


        fs.ensureDirSync(generate_path);

        this.generateBasePack(mod.modInfo, generate_path, 'behavior_pack', uuids);
        this.generateItemsBehavior(mod.getItems(), generate_path);

        console.log("[rubydia2] Done generating behavior pack.");
    }

    public static generateBasePack(mod_info: ModInfo, gen_path: string, pack_type: PackType, uuids: BedrockUUIDs): void {
        console.log("[rubydia2] Generating manifest.json and adding pack icon...");

        const modManifest: BedrockManifest = modInfoToManifest(mod_info, uuids[pack_type],
            pack_type === 'behavior_pack' ?  'data' : 'resources');
        
        fs.writeFileSync(path.join(gen_path, "manifest.json"), JSON.stringify(modManifest));

        if (mod_info.icon && fs.existsSync(mod_info.icon)) {
            fs.copyFileSync(mod_info.icon, path.join(gen_path, "pack_icon.png"));
        } else {
            fs.copyFileSync(defaultPackIcon, path.join(gen_path, "pack_icon.png"));
        }

        console.log("[rubydia2] Done generating base pack.");
    }

    public static generateItemsResources(mod_info: ModInfo, items: Item[], generate_path: string): void {
        console.log("[rubydia2] Generating items resources...");
        
        fs.ensureDirSync(path.join(generate_path, "textures", "items")); // Ensuring that Items folder exists

        items.forEach(item => {
            const itemTextureFile: string = item.texture || defaultItemIcon;
            if (fs.existsSync(itemTextureFile)) {
                fs.copyFileSync(itemTextureFile, path.join(generate_path, "textures", "items",  path.parse(itemTextureFile).base));
            } else {
                throw new Error(`[rubydia2] rubydia2 Default item texture file not found: ${itemTextureFile}`);
            }
        });

        fs.writeJSONSync(
            path.join(generate_path, "textures", "item_texture.json"), 
            BedrockItemGenerator.generateItemTextureJSON(this.getResourcePackName(mod_info),items)
        );

        console.log("[rubydia2] Done generating items resources.");
    }

    public static generateItemsBehavior(items: Item[], generate_path: string): void {
        console.log("[rubydia2] Generating items behavior...");

        fs.ensureDirSync(path.join(generate_path, "items")); // Ensuring that Items folder exists

        items.forEach(item => {
            fs.writeJSONSync(
                path.join(generate_path, "items", `${item.id}.json`), 
                BedrockItemGenerator.generateItemJSON(item)
            );
        });

        console.log("[rubydia2] Done generating items behavior.");
    }

    public static getResourcePackName(mod_info: ModInfo): string {
        return `${mod_info.name} [RP]`;
    }
        public static getBehaviorPackName(mod_info: ModInfo): string {
        return `${mod_info.name} [BP]`;
    }
}