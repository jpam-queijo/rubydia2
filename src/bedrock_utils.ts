import { defaultMinEngineVersion, type BedrockManifest, type BedrockManifestType } from "./bedrock_manifest";
import type { ModInfo } from "./mod";
import { validate as uuidValidate } from "uuid";
import { version as uuidVersion} from "uuid"

export function modInfoToManifest(modInfo: ModInfo, [headerUuid, moduleUuid]: [string, string], 
    manifest_type: BedrockManifestType): BedrockManifest {
    return {
        format_version: 2,
        header: {
            name: modInfo.name,
            description: modInfo.description,
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