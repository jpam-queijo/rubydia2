import { Item } from "../item";
import type { MinecraftLanguage } from "../language";
import { IdentifiablePlatformRegistry } from "../registry";
import { TranslationManager } from "../translation";

export class BedrockTranslationGenerator {
    public static generateTranslations(language: MinecraftLanguage, translationManager: TranslationManager): string {

        let translationFile: string = "";

        translationManager.forEachKey(language, (translation, key) => {
            translationFile += `${key}=${translation}\n`;
        });

        return translationFile;
    }

    public static generateRubydiaKeyTranslations(language: MinecraftLanguage, translationManager: TranslationManager, modID: string): string {

        let translationFile: string = "";

        translationManager.forEachKey(language, (translation, key) => {
            translationFile += `rubydia.mod.${modID}.${key}=${translation}\n`;
        });

        return translationFile;
    }

    public static generateRubydiaItemTranslations(translationManager: TranslationManager, itemRegistry: IdentifiablePlatformRegistry<Item>): TranslationManager {
        let bedrockTranslations = new TranslationManager();
        
        itemRegistry.forEachInBedrock((item) => {
            const itemID = item.getID();
            const itemTranslationKey = item.getTranslationKey();
            
            bedrockTranslations.setTranslationFor('en_US', `item.${itemID.getIdString()}`, item.displayName);
            bedrockTranslations.setTranslationsFromMap(`item.${itemID.getIdString()}`, translationManager.getAllTranslationsFor(itemTranslationKey));
        });

        return bedrockTranslations;
    }
}
