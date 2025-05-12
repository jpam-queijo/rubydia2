import { Identifier, type Identifiable } from "./identifier";

export interface Registry<T> {
    register(object: T, identifier: string): void;
    get(id: string): T | undefined;
    getAll(): T[];
    unregister(id: string): boolean;
    forEach(callbackfn: (value: T, id: string) => void): void;
    has(id: string): boolean;
    entries(): Generator<[string | Identifier, T], void, unknown>;
    values(): Generator<T, void, unknown>;
    keys(): Generator<string | Identifier, void, unknown>;
    size: number;
}

export class GenericRegistry<T> implements Registry<T> {
    private readonly storage: Map<string, T> = new Map<string, T>();
    
    register(object: T, id: string): void {
        if (this.has(id)) {
            throw new Error("Another object with this key already registered.");
        }
        
        this.storage.set(id, object);
    }
    
    get(id: string): T | undefined {
        return this.storage.get(id);
    }
    
    unregister(id: string): boolean {
        if (!(this.has(id))) {
            throw new Error("Attempted to unregister nonexistent ID Object");
        }
        
        return this.storage.delete(id);
    }
    
    forEach(callbackfn: (value: T, id: string) => void): void {
        this.storage.forEach(callbackfn);
    }
    
    has(id: string): boolean {
        return this.storage.has(id);
    }

    getAll(): T[] {
        return this.storage.values().toArray();
    }

    *values(): Generator<T, void, unknown> {
        yield* this.storage.values();
    }

    *keys(): Generator<string | Identifier, void, unknown> {
        yield* this.storage.keys();
    }
    
    *entries(): Generator<[string | Identifier, T], void, unknown> {
        yield* this.storage.entries();
    }

    public get size(): number {
        return this.storage.size;
    }
}

export class PlatformRegistry<T> {

    // Registries
    private readonly sharedStorage: Registry<T>;
    private readonly bedrockStorage: Registry<T>;
    private readonly javaStorage: Registry<T>;

    constructor(sharedRegistry: Registry<T> = new GenericRegistry<T>(),
         bedrockRegistry: Registry<T> = new GenericRegistry<T>(),
          javaRegistry: Registry<T> = new GenericRegistry<T>()) {
        this.sharedStorage = sharedRegistry;
        this.bedrockStorage = bedrockRegistry;
        this.javaStorage = javaRegistry;
    }

    /* Register */

    registerShared(object: T, id: string): void {
        this.sharedStorage.register(object, id);
    }

    registerForJava(object: T, id: string): void {
        this.javaStorage.register(object, id);
    }

    registerForBedrock(object: T, id: string): void {
        this.bedrockStorage.register(object, id);
    }

    /* Get */

    getShared(id: string): T | undefined {
        return this.sharedStorage.get(id);
    }

    getForBedrock(id: string): T | undefined {
        return this.bedrockStorage.get(id) || this.sharedStorage.get(id);
    }

    getForJava(id: string): T | undefined {
        return this.javaStorage.get(id) || this.sharedStorage.get(id);
    }

    getBedrockSpecific(id: string): T | undefined {
        return this.bedrockStorage.get(id);
    }

    getJavaSpecific(id: string): T | undefined {
        return this.javaStorage.get(id);
    }

    /* Unregister */

    unregisterShared(id: string): boolean {
        return this.sharedStorage.unregister(id);
    }

    unregisterBedrock(id: string): boolean {
        return this.bedrockStorage.unregister(id);
    }

    unregisterJava(id: string): boolean {
        return this.javaStorage.unregister(id);
    }

    unregisterPlatformWide(id: string): boolean {
        const deletedShared = this.sharedStorage.unregister(id);
        const deletedBedrock = this.bedrockStorage.unregister(id);
        const deletedJava = this.javaStorage.unregister(id);
        
        return deletedShared || deletedBedrock || deletedJava;
    }

    /* For each */

    forEachShared(callbackfn: (value: T, key: string) => void): void {
        this.sharedStorage.forEach(callbackfn);
    }
    
    forEachBedrockSpecific(callbackfn: (value: T, key: string) => void): void {
        this.bedrockStorage.forEach(callbackfn);
    }

    forEachJavaSpecific(callbackfn: (value: T, key: string) => void): void {
        this.javaStorage.forEach(callbackfn);
    }

    forEachInBedrock(callbackfn: (value: T, key: string) => void) {
        for (let key of this.effectiveBedrockKeys()) {
            if (!(typeof key === "string")) {
                key = key.getIdString();
            }

            let value = this.getForBedrock(key);

            if (!value) {
                continue;
            }

            callbackfn(value, key);

        }
    }

    forEachInJava(callbackfn: (value: T, key: string) => void) {
        for (let key of this.effectiveJavaKeys()) {
            if (!(typeof key === "string")) {
                key = key.getIdString();
            }

            let value = this.getForJava(key);

            if (!value) {
                continue;
            }

            callbackfn(value, key);

        }
    }


    /* Has */

    hasShared(id: string): boolean {
        return this.sharedStorage.has(id);
    }

    hasForBedrock(id: string): boolean {
        return this.bedrockStorage.has(id) || this.sharedStorage.has(id);
    }

    hasForJava(id: string): boolean {
        return this.javaStorage.has(id) || this.sharedStorage.has(id);
    }

    hasBedrockSpecific(id: string): boolean {
        return this.bedrockStorage.has(id);
    }

    hasJavaSpecific(id: string): boolean {
        return this.javaStorage.has(id);
    }

    /* Size */
    get sharedSize(): number { return this.sharedStorage.size; }
    get bedrockSpecificSize(): number { return this.bedrockStorage.size; }
    get javaSpecificSize(): number { return this.javaStorage.size; }

    /* Entries */
    
    *sharedEntries(): Generator<[string | Identifier, T], void, unknown> { yield* this.sharedStorage.entries(); }
    *bedrockSpecificEntries(): Generator<[string | Identifier, T], void, unknown> { yield* this.bedrockStorage.entries(); }
    *javaSpecificEntries(): Generator<[string | Identifier, T], void, unknown> { yield* this.javaStorage.entries(); }

    /* Keys */
    
    *sharedKeys(): Generator<string | Identifier, void, unknown> { yield* this.sharedStorage.keys(); }
    *bedrockSpecificKeys(): Generator<string | Identifier, void, unknown> { yield* this.bedrockStorage.keys(); }
    *javaSpecificKeys(): Generator<string | Identifier, void, unknown> { yield* this.javaStorage.keys(); }
    
    /* Values */

    *sharedValues(): Generator<T, void, unknown> { yield* this.sharedStorage.values(); }
    *bedrockSpecificValues(): Generator<T, void, unknown> { yield* this.bedrockStorage.values(); }
    *javaSpecificValues(): Generator<T, void, unknown> { yield* this.javaStorage.values(); }

    /* Effective keys */

    *effectiveBedrockKeys(): Generator<string | Identifier, void, unknown> {
        const yielded = new Set<string>();

        for (let key of this.bedrockStorage.keys()) {
            if (!(typeof key === "string")) {
                key = key.getIdString();
            }

            yield key;
            yielded.add(key);
        }

        for (let key of this.sharedStorage.keys()) {
            if (!(typeof key === "string")) {
                key = key.getIdString();
            }

            if (!yielded.has(key)) {
                yield key;
            }
        }
    }

    *effectiveJavaKeys(): Generator<string | Identifier, void, unknown> {
        const yielded = new Set<string>();

        for (let key of this.javaStorage.keys()) {
            if (!(typeof key === "string")) {
                key = key.getIdString();
            }

            yield key;
            yielded.add(key);
        }
        
        for (let key of this.sharedStorage.keys()) {
            if (!(typeof key === "string")) {
                key = key.getIdString();
            }

            if (!yielded.has(key)) {
                yield key;
            }
        }
    }
}


export class IdentifiableRegistry<T extends Identifiable> extends GenericRegistry<T> {
    private _idToString(id: Identifier | string): string {
        if (typeof id === "string") {
            return Identifier.ofString(id).getIdString();
        }
        return id.getIdString();
    }

    register(object: T): void {
        super.register(object, object.getID().getIdString());
    }
    
    get(id: Identifier | string): T | undefined {
        return super.get(this._idToString(id));
    }

    unregister(id: Identifier | string): boolean {
        return super.unregister(this._idToString(id));
    }

    has(id: Identifier | string): boolean {
        return super.has(this._idToString(id));
    }

    *keys(): Generator<string | Identifier, void, unknown> {
        for (const key of super.keys()) {
            if (typeof key === "string") {
                yield Identifier.ofString(key);
            } else {
                yield key;
            }
        }
    }

    *entries(): Generator<[string | Identifier, T], void, unknown> {
        for (const entry of super.entries()) {
            if (typeof entry[0] === "string") {
                yield [Identifier.ofString(entry[0]), entry[1]];
            } else {
                yield entry;
            }
        }
    }
}

export class IdentifiablePlatformRegistry<T extends Identifiable> extends PlatformRegistry<T> {

    constructor(sharedRegistry: IdentifiableRegistry<T> = new IdentifiableRegistry<T>,
         bedrockRegistry: IdentifiableRegistry<T> = new IdentifiableRegistry<T>,
          javaRegistry: IdentifiableRegistry<T> = new IdentifiableRegistry<T>) {

        super(sharedRegistry, bedrockRegistry, javaRegistry);
    }

    private _idToString(id: Identifier | string): string {
        if (typeof id === "string") {
            return Identifier.ofString(id).getIdString();
        }
        return id.getIdString();
    }
    
    /* Register */

    registerShared(object: T): void {
        super.registerShared(object, object.getID().getIdString());
    }

    registerForBedrock(object: T): void {
        super.registerForBedrock(object, object.getID().getIdString());
    }

    registerForJava(object: T): void {
        super.registerForJava(object, object.getID().getIdString());
    }

    /* Get */

    getShared(id: Identifier | string): T | undefined {
        return super.getShared(this._idToString(id));
    }

    getForJava(id: Identifier | string): T | undefined {
        return super.getForJava(this._idToString(id));
    }

    getForBedrock(id: Identifier | string): T | undefined {
        return super.getForBedrock(this._idToString(id));
    }

    getBedrockSpecific(id: Identifier | string): T | undefined {
        return super.getBedrockSpecific(this._idToString(id));
    }

    getJavaSpecific(id: Identifier | string): T | undefined {
        return super.getJavaSpecific(this._idToString(id));
    }

    /* Unregister */

    unregisterBedrock(id: Identifier | string): boolean {
        return super.unregisterBedrock(this._idToString(id));
    }

    unregisterJava(id: Identifier | string): boolean {
        return super.unregisterJava(this._idToString(id));
    }

    unregisterShared(id: Identifier | string): boolean {
        return super.unregisterPlatformWide(this._idToString(id));
    }

    unregisterPlatformWide(id: Identifier | string): boolean {
        return super.unregisterPlatformWide(this._idToString(id));
    }
    
    /* Has */

    hasForBedrock(id: Identifier | string): boolean {
        return super.hasForBedrock(this._idToString(id));
    }

    hasForJava(id: Identifier | string): boolean {
        return super.hasForJava(this._idToString(id));
    }

    hasBedrockSpecific(id: Identifier | string): boolean {
        return super.hasBedrockSpecific(this._idToString(id));
    }

    hasJavaSpecific(id: Identifier | string): boolean {
        return super.hasJavaSpecific(this._idToString(id));
    }


}
