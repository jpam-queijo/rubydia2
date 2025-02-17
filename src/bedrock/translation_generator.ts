import type { MinecraftLanguage } from "../language";
import type { Translation } from "../mod";

export class BedrockTranslationGenerator {
    public static generateItemTranslations(item_translations: Translation, language: MinecraftLanguage) {

        let translation_file: string = "";

        Object.entries(item_translations).forEach(([item_id, translations]) => {
            for (const [tr_language, translation] of Object.entries(translations)) {
                if (!(translation && tr_language === language)) continue;

                translation_file += `item.${item_id}=${translation}\n`;
            }
        });

        return translation_file;
    }

    public static generateKeyTranslations(key_translations: Translation, language: MinecraftLanguage) {

        let translation_file: string = "";

        Object.entries(key_translations).forEach(([key, translations]) => {
            for (const [tr_language, translation] of Object.entries(translations)) {
                if (!(translation && tr_language === language)) continue;

                translation_file += `${key}=${translation}\n`;
            }
        });

        return translation_file;
    }
}