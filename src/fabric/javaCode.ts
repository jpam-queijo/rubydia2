import type { Item } from "../item";
import type { ModInfo } from "../mod";
import { FabricItemGenerator } from "./item";
import { ModUtils } from "../java/modUtils";

export class FabricJavaParser {
    static parseModInfo(file: string, mod_info: ModInfo): string {
        file = file.replaceAll("${RUBYDIA2_MOD_PACKAGE}", ModUtils.getModPackage(mod_info));
        file = file.replaceAll("${RUBYDIA2_MOD_ID}", ModUtils.getModID(mod_info));
        file = file.replaceAll("${RUBYDIA2_MOD_CLASS_NAME}", ModUtils.getModClassName(mod_info));
        return file;
    }

    static parseModItems(file: string, items: Item[], mod_id: string): string {
        let items_java: string = "";

        for (const item of items) {
            items_java += FabricItemGenerator.generateItemJava(item, mod_id);
        }

        file = file.replaceAll("${RUBYDIA2_MOD_ITEMS_REGISTER}", items_java);

        return file;
    }
}