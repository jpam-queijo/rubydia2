import type { Item } from "../../item";
import type { Mod, ModInfo } from "../../mod";
import { ModUtils } from "../modUtils";
import path from "path";
import fs from "fs-extra";
import { FabricItemGenerator } from "../../fabric/item";

export class JavaItemUtils {
    public static copyItemTextures(items: Item[], mod_info: ModInfo, generate_path: string): void {
        const assets_folder = ModUtils.getAssetsFolderLocation(generate_path, ModUtils.getModID(mod_info));
        const item_texture_folder = path.join(assets_folder, "textures", "item");
        const misc_texture_folder = path.join(assets_folder, "textures", "misc");
        const queijo_texture = path.join(ModUtils.getRubydia2Folder(), "assets", "queijo.png");

        fs.ensureDirSync(item_texture_folder);
        fs.ensureDirSync(misc_texture_folder);

        if (!fs.existsSync(queijo_texture)) {
            throw new Error("[rubydia2] Missing default item texture \"queijo.png\".");
        }

        fs.copyFileSync(queijo_texture, path.join(misc_texture_folder, "queijo.png"));

        items.forEach(item => {
            if (item.texture && fs.existsSync(item.texture)) {
                fs.copyFileSync(item.texture, path.join(item_texture_folder, `${item.id}.png`));
            }
        });
    }

    public static generateModels(items: Item[], generate_path: string, mod_info: ModInfo): void {
        const assets_folder = ModUtils.getAssetsFolderLocation(generate_path, ModUtils.getModID(mod_info));
        const item_models_folder = path.join(assets_folder, "models", "item")
        fs.ensureDirSync(item_models_folder);

        console.log("[rubydia2] Generating item models...");

        items.forEach(item => {
            let default_item_texture: boolean = false;
            if (item.texture) {
                default_item_texture = !fs.existsSync(item.texture);
            }
            const item_model = FabricItemGenerator.generateItemModel(item, default_item_texture);
            fs.writeJSONSync(path.join(item_models_folder, `${item.id}.json`), item_model);
        });

        console.log("[rubydia2] Done generating item models.");
    }
}