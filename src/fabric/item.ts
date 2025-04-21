import { Item, type ItemProperties } from "../item";
import { toCamelCaseString, toSnakeCaseString } from "../utils";
import { settingsByVersion, type FabricModSettings } from "./modSettings";
import { isVersionNewerThan } from "./utils";

export class FabricItemGenerator {
    public static generateItemJava(item: Item, mod_id: string, version?: FabricModSettings): string {
        let mcVersion: string = settingsByVersion.latest.version;
        if (version && version.version) {
            mcVersion = version.version;
        }
        const itemID = item.getID();
        const item_var = toSnakeCaseString(`${itemID.getNamespace()}_${itemID.getPath()}`).toUpperCase();
        const item_settings = this.generateItemSettingsJava(item);

        if (isVersionNewerThan(mcVersion, "1.21.2") || mcVersion === "1.21.2") {
            return `\tpublic static final Item ${item_var} = registerItem("${itemID.getNamespace()}", "${itemID.getPath()}", Item::new, ${item_settings});\n`;
        }

        return `\tpublic static final Item ${item_var} = registerItem("${itemID.getNamespace()}", "${itemID.getPath()}", new Item(${item_settings}));\n`;
    }

    public static generateItemSettingsJava(item: ItemProperties): string {
        let item_settings_modifiers: string = "";

        // Max Stack Size
        if (item.maxStackSize) {
            if (item.maxStackSize > 64 || item.maxStackSize < 1 || Number.isNaN(item.maxStackSize)) {
                throw new Error("Stack Size should be a number in the range: 1 <= Max Stack Size <= 64");
            }
            item_settings_modifiers += `.maxCount(${Math.trunc(item.maxStackSize)})`;
        }

        // Rarity
        if (item.rarity) {
            item_settings_modifiers += `.rarity(Rarity.${item.rarity.toUpperCase()})`;
        }
        return 'new Item.Settings()' + item_settings_modifiers;
    }
}