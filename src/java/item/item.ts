import type { Item } from "../../item";
import type { Mod, ModInfo } from "../../mod";
import { ModUtils } from "../modUtils";
import path from "path";
import fs from "fs-extra";
import { FabricItemGenerator } from "../../fabric/item";
import type { ModelDefinition } from "../item_model/modelDefinition";
import * as JavaItemModel from "../item_model/model";

export class JavaItemUtils {
    public static copyItemTextures(items: Item[], mod_info: ModInfo, generate_path: string): void {
        const assets_folder = ModUtils.getAssetsFolderLocation(generate_path, "rubydia2");
        const item_texture_folder = path.join(assets_folder, "textures", "item");

        fs.ensureDirSync(item_texture_folder);

        const queijo_texture = path.join(ModUtils.getRubydia2Folder(), "assets", "queijo.png");

        if (!fs.existsSync(queijo_texture)) {
            throw new Error("[rubydia2] Missing default item texture \"queijo.png\".");
        }

        fs.copyFileSync(queijo_texture, path.join(item_texture_folder, "rubydia2_queijo.png"));

        items.forEach(item => {
            const cur_assets_folder = ModUtils.getAssetsFolderLocation(generate_path, item.namespace);
            const cur_item_texture_folder = path.join(cur_assets_folder, "textures", "item");
            fs.ensureDirSync(cur_item_texture_folder);

            if (item.texture && fs.existsSync(item.texture)) {
                fs.copyFileSync(item.texture, path.join(cur_item_texture_folder, `${item.id}.png`));
            }
        });
    }

    public static generateModels(items: Item[], generate_path: string, mod_info: ModInfo): void {


        items.forEach(item => {
            const assets_folder = ModUtils.getAssetsFolderLocation(generate_path, item.namespace);
            const item_models_folder = path.join(assets_folder, "models", "item")
            fs.ensureDirSync(item_models_folder);

            let default_item_texture: boolean = false;
            if (item.texture) {
                default_item_texture = !fs.existsSync(item.texture);
            }
            const item_model = this.generateItemModel(item, default_item_texture);
            fs.writeJSONSync(path.join(item_models_folder, `${item.id}.json`), item_model);
        });
    }

    public static generateItemModelDescription(items: Item[], generate_path: string) {

        items.forEach((item: Item) => {
            const assets_folder = ModUtils.getAssetsFolderLocation(generate_path, item.namespace);
            const item_folder = path.join(assets_folder, "items");
            fs.ensureDirSync(item_folder);

            const item_description: ModelDefinition = {
                model: {
                    "type": "minecraft:model",
                    "model": `${item.namespace}:item/${item.id}`
                }
            }

            fs.writeJSONSync(path.join(item_folder, `${item.id}.json`), item_description);
        });
    }

    public static generateItemModel(item: Item, default_texture?: boolean): JavaItemModel.Model {
        if (!item.texture || default_texture === true) {
            return {
                parent: "minecraft:item/generated",
                textures: {
                    layer0: `rubydia2:item/rubydia2_queijo`
                }
            };
        }
        return {
            parent: "minecraft:item/generated",
            textures: {
                layer0: `${item.namespace}:item/${item.id}`
            }
        };
    }
}