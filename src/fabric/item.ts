import { getItemFullID, getItemNamespace, type Item } from "../item";
import { settingsByVersion, type FabricModSettings } from "./modSettings";
import { isVersionNewerThan } from "./utils";

export class FabricItemGenerator {
    public static generateItemJava(item: Item, mod_id: string, version?: FabricModSettings): string {
        let mcVersion: string = settingsByVersion.latest.version;
        if (version && version.version) {
            mcVersion = version.version;
        }
        const item_var = `${getItemNamespace(mod_id, item).toUpperCase()}_${item.id.toUpperCase()}`;
        const item_settings = this.generateItemSettingsJava(item);

        if (isVersionNewerThan(mcVersion, "1.21.2") || mcVersion === "1.21.2") {
            return `public static final Item ${item_var} = registerItem("${getItemNamespace(mod_id, item)}", "${item.id}", Item::new, ${item_settings});\n`;
        }

        return `\tpublic static final Item ${item_var} = registerItem("${getItemNamespace(mod_id, item)}", "${item.id}", new Item(${item_settings}));\n`;
    }

    public static generateItemSettingsJava(item: Item): string {
        let item_settings_modifiers: string = "";
        if (item.max_stack_size) {
            item_settings_modifiers += `.maxCount(${item.max_stack_size})`;
        }
        return 'new Item.Settings()' + item_settings_modifiers;
    }
}