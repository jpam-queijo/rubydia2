import { BaseModGenerator } from "./mod_generator";
import { Mod } from "./mod";
import { type BedrockManifest, type BedrockUUIDs } from "./bedrock_manifest";
import { v4 as uuidv4 } from "uuid";
import { modInfoToManifest, validateUUIDv4 } from "./bedrock_utils";
import fs from "fs-extra";
import path from "path";
import os from "os";
import open from "open";

export class BedrockModGenerator extends BaseModGenerator {
    public static override generate(mod: Mod, output_path?: string): void {
        console.log("[rubydia2] Generating Bedrock mod...");

        const uuids = this.generateOrGetUUIDs();

        let generate_path: string = process.env.DEFAULT_GENERATE_PATH || output_path || "./build/";
        let rp_path: string = path.join(generate_path, 'resource_packs');
        let bp_path: string = path.join(generate_path, 'behavior_packs');
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
        console.log("[rubydia2] Generating resource pack...");
        if (!path) {
            path = "./build/resource_packs";
        }

        fs.ensureDirSync(path);

        this.generateResourcePack(mod, this.generateOrGetUUIDs(), path);
        console.log("[rubydia2] Done generating resource pack.");
    }

    public static generateBehaviorPackFromMod(mod: Mod, path: string): void {
        console.log("[rubydia2] Generating behavior pack...");
        if (!path) {
            path = "./build/behavior_packs";
        }

        fs.ensureDirSync(path);

        this.generateBehaviorPack(mod, this.generateOrGetUUIDs(), path);
        console.log("[rubydia2] Done generating behavior pack.");
    }

    public static override generateAndLaunch(mod: Mod): void {
        if (os.platform() === 'win32' && process.env.LOCALAPPDATA) {

            // Getting Minecraft Bedrock Path on windows
            let generate_path = path.join(process.env.LOCALAPPDATA,
                 "Packages", "Microsoft.MinecraftUWP_8wekyb3d8bbwe",
                  "LocalState", "games", "com.mojang");

            // Generating mods
            let rp_path = path.join(generate_path, "development_resource_packs", mod.modInfo.name);
            let bp_path = path.join(generate_path, "development_behavior_packs", mod.modInfo.name);

            this.generateResourcePackFromMod(mod, rp_path);
            this.generateBehaviorPackFromMod(mod, bp_path);

            // Launching Minecraft
            console.log("[rubydia2] Done generating. launching Minecraft.");
            open("minecraft://");
        } else {
            throw new Error("[rubydia2] Unsupported platform to launch game.");
        }
    }

    public static generateMcAddon(mod: Mod, path?: string): void {
        // TODO
    }

    public static generateResourcePack(mod: Mod, uuids: BedrockUUIDs, generate_path?: string): void {
        console.log("[rubydia2] Generating resource pack...");
        if (!generate_path) {
            generate_path = "./build/";
            generate_path = path.join(generate_path, 'resource_packs');
        }


        fs.ensureDirSync(generate_path);

        console.log("[rubydia2] Generating manifest.json...");
        const modManifest: BedrockManifest = modInfoToManifest(mod.modInfo, uuids.resource_pack, 'resources');
        fs.writeFileSync(path.join(generate_path, "manifest.json"), JSON.stringify(modManifest));
    }

    public static generateBehaviorPack(mod: Mod, uuids: BedrockUUIDs, generate_path?: string): void {
        console.log("[rubydia2] Generating behavior pack...");
        if (!generate_path) {
            generate_path = "./build/";
            generate_path = path.join(generate_path, 'behavior_packs');
        }


        fs.ensureDirSync(generate_path);

        console.log("[rubydia2] Generating manifest.json...");
        const modManifest: BedrockManifest = modInfoToManifest(mod.modInfo, uuids.behavior_pack, 'data');
        fs.writeFileSync(path.join(generate_path, "manifest.json"), JSON.stringify(modManifest));
    }
    public static generateOrGetUUIDs(): BedrockUUIDs {
        /////// Getting UUIDs without making TypeScript sad
        let uuids: BedrockUUIDs;
        uuids = {
            resource_pack: [uuidv4(), uuidv4()],
            behavior_pack: [uuidv4(), uuidv4()]
        }

        type PackType = 'resource_pack' | 'behavior_pack';

        interface UuidConfig {
            envName: string;
            packType: PackType;
            index: number;
        }

        const uuidConfigs: UuidConfig[] = [
            { envName: 'RP_UUID_1', packType: 'resource_pack', index: 0},
            { envName: 'RP_UUID_2', packType: 'resource_pack', index: 1},
            { envName: 'BP_UUID_1', packType: 'behavior_pack', index: 0},
            { envName: 'BP_UUID_2', packType: 'behavior_pack', index: 1}
        ]

        for (const config of uuidConfigs) {
            const envValue = process.env[config.envName];
            if (envValue && validateUUIDv4(envValue)) {
                uuids[config.packType][config.index] = envValue;
            } else {
                console.warn(`[rubydia2] The value of environment variable "${config.envName}" is an invalid UUID v4. Please set the environment variable to a valid UUID v4. Generating a new one...`)
            }
        }

        return uuids;
    }
}