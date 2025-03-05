import { defaultMinEngineVersion, type BedrockManifest, type BedrockManifestType, type BedrockUUIDs } from "./bedrock_manifest";
import type { ModInfo } from "../mod";
import { validate as uuidValidate } from "uuid";
import { version as uuidVersion} from "uuid"
import { v4 as uuidv4 } from "uuid";

export function modInfoToManifest(modInfo: ModInfo, [headerUuid, moduleUuid]: [string, string], 
    manifest_type: BedrockManifestType): BedrockManifest {
    return {
        format_version: 2,
        header: {
            name: 'pack.name',
            description: 'pack.description',
            version: modInfo.version,
            min_engine_version: defaultMinEngineVersion,
            uuid: headerUuid
        },
        modules: [
            {
                type: manifest_type,
                uuid: moduleUuid,
                version: modInfo.version
            }
        ],
        metadata: {
            authors: modInfo.authors,
            license: modInfo.license,
            url: modInfo.homepage
        }
    }
}

export function validateUUIDv4(uuid_?: string): boolean {
    if (!uuid_) {
        return false;
    }
    return uuidValidate(uuid_) && uuidVersion(uuid_) === 4;
}

export function generateOrGetUUIDs(): BedrockUUIDs {
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