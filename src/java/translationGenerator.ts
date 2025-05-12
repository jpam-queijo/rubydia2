import type { MinecraftLanguage } from "../language";
import type { IdentifiablePlatformRegistry } from "../registry";
import type { Item } from "../item";
import { TranslationManager } from "../translation";
import assert from "assert";


export class JavaTranslationGenerator {
    public static generateTranslations(language: MinecraftLanguage, translationManager: TranslationManager): Map<string, string> {
        let translations = translationManager.getLanguageTranslations(language);
        assert(translations);

        return translations;
    }
    
    public static generateRubydiaKeyTranslations(language: MinecraftLanguage, translationManager: TranslationManager, modID: string): Map<string, string> {
        
        let inGameTranslation = new TranslationManager();
        
        translationManager.forEachKey(language, (translation, key) => {
            inGameTranslation.setTranslationFor(language, `rubydia.mod.${modID}.${key}`, translation);
        });

        let translations = inGameTranslation.getLanguageTranslations(language);
        assert(translations);

        return translations
    }
    
    public static generateRubydiaItemTranslations(translationManager: TranslationManager, itemRegistry: IdentifiablePlatformRegistry<Item>): TranslationManager {
        let inGameTranslations = new TranslationManager();
        
        itemRegistry.forEachInJava((item) => {
            const itemID = item.getID();
            const itemPath = itemID.getPath();
            const itemNamespace = itemID.getNamespace();

            const itemTranslationKey = item.getTranslationKey();
            
            inGameTranslations.setTranslationFor('en_US', `item.${itemNamespace}.${itemPath}`, item.displayName);
            inGameTranslations.setTranslationsFromMap(`item.${itemNamespace}.${itemPath}`, translationManager.getAllTranslationsFor(itemTranslationKey));
        });
        
        return inGameTranslations;
    }
}