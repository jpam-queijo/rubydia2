import type { MinecraftLanguage } from "../language";
import type { Translation } from "../mod";


export class FabricTranslationGenerator {
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
}