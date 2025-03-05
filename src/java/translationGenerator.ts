import type { MinecraftLanguage } from "../language";
import type { Mod, ModInfo, Translation } from "../mod";
import { ModUtils } from "./modUtils";
import path from "path";
import fs from "fs-extra";


export class TranslationGenerator {
    public static generateItemTranslation(mod_id: string, translation: Translation, language: MinecraftLanguage) {
        let lang_file: {[key: string]: string} = {};

        Object.entries(translation).forEach(([item_id, translations]) => {
            for (const [tr_language, translation] of Object.entries(translations)) {
                if (!(translation && tr_language === language)) continue;

                lang_file[`item.${item_id.replace(":", ".")}`] = translation;
            }
        });

        return lang_file;
    }

    public static generateKeyTranslation(translation: Translation, language: MinecraftLanguage) {
        let lang_file: {[key: string]: string} = {};

        Object.entries(translation).forEach(([key, translations]) => {
            for (const [tr_language, translation] of Object.entries(translations)) {
                if (!(translation && tr_language === language)) continue;

                lang_file[key] = translation;
            }
        });

        return lang_file;
    }

    public static generateAllTranslations(mod_info: ModInfo, item_translations: Translation, languages: MinecraftLanguage[], generate_path: string) {
        const mod_id = ModUtils.getModID(mod_info);
        const lang_folder_path = path.join(ModUtils.getAssetsFolderLocation(generate_path, mod_id), "lang");

        fs.ensureDirSync(lang_folder_path);

        for (const language of languages) {
            const json_filepath = path.join(lang_folder_path, `${language.toLowerCase()}.json`);
            const translation = this.generateItemTranslation(mod_id, item_translations, language);
            fs.writeJSONSync(json_filepath, translation);
        }
    }
}