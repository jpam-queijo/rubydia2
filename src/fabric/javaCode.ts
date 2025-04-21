import type { Item } from "../item";
import type { ModInfo } from "../mod";
import { FabricItemGenerator } from "./item";
import { ModUtils } from "../java/modUtils";
import type { FabricModSettings } from "./modSettings";
import type { IdentifiablePlatformRegistry } from "../registry";

export class FabricJavaParser {

    public static parseModInfo(file: string, modInfo: ModInfo): string {
        file = file.replaceAll("${RUBYDIA2_MOD_PACKAGE}", ModUtils.getModPackage(modInfo));
        file = file.replaceAll("${RUBYDIA2_MOD_ID}", ModUtils.getModID(modInfo));
        file = file.replaceAll("${RUBYDIA2_MOD_CLASS_NAME}", ModUtils.getModClassName(modInfo));
        return file;
    }

    public static parseModItems(file: string, itemRegistry: IdentifiablePlatformRegistry<Item>, modID: string, version?: FabricModSettings): string {
        let itemsJava: string = "";

        for (const itemID of itemRegistry.effectiveJavaKeys()) {
            let item = itemRegistry.getForJava(itemID);

            if (!item) {
                continue;
            }

            itemsJava += FabricItemGenerator.generateItemJava(item, modID, version);

        }

        file = file.replaceAll("${RUBYDIA2_MOD_ITEMS_REGISTER}", itemsJava);

        return file;
    }
}