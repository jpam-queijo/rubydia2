import type { ModInfo } from "../mod";
import path from "path";
import fs from "fs-extra";
import type { FabricModInfo, FabricModLoadingInfo, FabricModMetadata } from "./fabricModData";
import { ModUtils } from "../java/modUtils";

export class FabricModUtils {
    public static generateModFabricFiles(mod_info: ModInfo, output_path: string) {
        fs.ensureDirSync(path.join(output_path, "src", "main", "resources"));
        
        const json_path: string = path.join(output_path, "src", "main", "resources", "fabric.mod.json");

        fs.writeJSONSync(json_path, this.generateFabricModMetadataJSON(mod_info));
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
}