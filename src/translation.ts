import type { MinecraftLanguage, Translatable } from "./language";

export class TranslationManager {
    private readonly storage: Map<MinecraftLanguage, Map<string, string>> = new Map<MinecraftLanguage, Map<string, string>>();

    private _translatableAsString(translatable: Translatable | string): string {
        if (typeof translatable === "string") {
            return translatable;
        }

        return translatable.getTranslationKey();
    }

    setTranslationFor(language: MinecraftLanguage, key: string | Translatable, translation: string): void {
        if (!this.storage.has(language)) {
            this.storage.set(language, new Map<string, string>([[this._translatableAsString(key), translation]]));
            return;
        }

        const languageStorage = this.storage.get(language);
        if (languageStorage) {
            languageStorage.set(this._translatableAsString(key), translation);
        }
    }

    getTranslationFor(language: MinecraftLanguage, key: string | Translatable): string | undefined {
        const languageStorage = this.storage.get(language);
        if (languageStorage) {
            return languageStorage.get(this._translatableAsString(key));
        }
    }

    removeTranslationFor(language: MinecraftLanguage, key: string | Translatable): boolean {
        const languageStorage = this.storage.get(language);
        if (languageStorage) {
            return languageStorage.delete(this._translatableAsString(key));
        }

        return false;
    }

    getAllTranslationsFor(key: string | Translatable): Map<MinecraftLanguage, string> {
        let result = new Map<MinecraftLanguage, string>();

        this.storage.forEach((translation, language) => {
            let translationValue = translation.get(this._translatableAsString(key));

            if (translationValue) {
                result.set(language, translationValue);
            }
        });

        return result;
    }

    
    getLanguageTranslations(language: MinecraftLanguage): Map<string, string> | undefined {
        return this.storage.get(language);
    }
    
    getAllLanguagesTranslations(): Map<MinecraftLanguage, Map<string, string>> {
        return new Map(this.storage);
    }
    
    hasKey(language: MinecraftLanguage, key: string | Translatable): boolean {
        const languageStorage = this.getLanguageTranslations(language);
        
        if (languageStorage) {
            return languageStorage.has(this._translatableAsString(key));
        }
        
        return false;
    }
    
    hasLanguage(language: MinecraftLanguage): boolean {
        return this.storage.has(language);
    }
    
    forEachKey(language: MinecraftLanguage, callbackfn: (translation: string, key: string) => void): void {
        const languageStorage = this.storage.get(language);
        
        if (!languageStorage) {
            throw new Error("Language does'nt exist in the storage");
        }
        
        languageStorage.forEach(callbackfn);
    }
    
    forEachLanguage(callbackfn: (keyAndTranslation: Map<string, string>, language: MinecraftLanguage) => void): void {
        this.storage.forEach(callbackfn);
    }
    
    *languages(): Generator<MinecraftLanguage, void, unknown> {
        yield* this.storage.keys();
    }
    
    *translations(language: MinecraftLanguage): Generator<[string, string], void, unknown> {
        const languageStorage = this.storage.get(language);
        
        if (!languageStorage) {
            throw new Error("Language does'nt exist in the storage");
        }
        
        yield* languageStorage.entries();
    }
    
    *entries(): Generator<[MinecraftLanguage, Map<string, string>], void, unknown> {
        yield* this.storage.entries();
    }

    setTranslationsFromMap(key: string,translations: Map<MinecraftLanguage, string>) {
        for (let translation of translations.entries()) {
            this.setTranslationFor(translation[0], key, translation[1]);
        }
    }

    public get languagesSize() {
        return this.storage.size;
    }
}