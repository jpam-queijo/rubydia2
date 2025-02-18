import type { Item } from "../item";
import type { ModInfo } from "../mod";
import { capitalizeFirstLetter, toCamelCaseString } from "../utils";
import { FabricItemGenerator } from "./fabric_item";
import { FabricModGenerator } from "./fabric_mod_generator";

export class FabricJavaParser {
    static parseModInfo(file: string, mod_info: ModInfo): string {
        file = file.replaceAll("${RUBYDIA2_MOD_PACKAGE}", FabricModGenerator.getModPackage(mod_info));
        file = file.replaceAll("${RUBYDIA2_MOD_ID}", FabricModGenerator.getModID(mod_info));
        file = file.replaceAll("${RUBYDIA2_MOD_CLASS_NAME}", capitalizeFirstLetter(toCamelCaseString(mod_info.name)));
        return file;
    }

    static parseModItems(file: string, items: Item[]): string {
        let items_java: string = "";

        for (const item of items) {
            items_java += FabricItemGenerator.generateItemJava(item);
        }

        file = file.replaceAll("${RUBYDIA2_MOD_ITEMS_REGISTER}", items_java);

        return file;
    }
}