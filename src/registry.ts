import { Identifier, type Identifiable } from "./identifier";

export interface Registry<T> {
    register(object: T, identifier: string): void;
    get(id: string): T | undefined;
    getAll(): T[];
    unregister(id: string): void;
    forEach(callbackfn: (value: T) => void): void;
    has(id: string): boolean;
}

export class GenericRegistry<T> implements Registry<T> {
    private storage: Map<string, T> = new Map<string, T>();
    
    register(object: T, id: string): void {
        if (this.has(id)) {
            throw new Error("Another object with this key already registered.");
        }
        
        this.storage.set(id, object);
    }
    
    get(id: string): T | undefined {
        return this.storage.get(id);
    }
    
    unregister(id: string): void {
        if (!(this.has(id))) {
            throw new Error("Attempted to unregister nonexistent ID Object");
        }
        
        this.storage.delete(id);
    }
    
    forEach(callbackfn: (value: T) => void): void {
        this.storage.forEach(callbackfn);
    }
    
    has(id: string): boolean {
        return this.storage.has(id);
    }

    getAll(): T[] {
        return this.storage.values().toArray();
    }
}

export class CrossRegistry<T> extends GenericRegistry<T> {
    private bedrockOnlyStorage: Map<string, T> = new Map<string, T>();
    private javaOnlyStorage: Map<string, T> = new Map<string, T>();

    register(object: T, id: string) {
        /*
        if (this.bedrockOnlyStorage.has(id) || this.javaOnlyStorage.has(id)) {
            throw new Error("ID already exists on Bedrock/Java only registry.");
        }
        */

        super.register(object, id);

    }

    registerJava(object: T, id: string): void {
        if (this.javaOnlyStorage.has(id)) {
            throw new Error("Another object with this key already registered in this registry.");
        }

        this.javaOnlyStorage.set(id, object);
    }

    registerBedrock(object: T, id: string): void {
        if (this.bedrockOnlyStorage.has(id)) {
            throw new Error("Another object with this key already registered in this registry.");
        }

        this.bedrockOnlyStorage.set(id, object);
    }

    getBedrock(id: string): T | undefined {
        return this.bedrockOnlyStorage.get(id) || this.get(id);
    }

    getJava(id: string): T | undefined {
        return this.javaOnlyStorage.get(id) || this.get(id);
    }

    getOnlyBedrock(id: string): T | undefined {
        return this.bedrockOnlyStorage.get(id);
    }

    getOnlyJava(id: string): T | undefined {
        return this.javaOnlyStorage.get(id);
    }

    unregisterBedrock(id: string): void {
        if (!(this.hasOnlyBedrock(id))) {
            throw new Error("Attempted to unregister nonexistent ID Object in this registry");
        }

        this.bedrockOnlyStorage.delete(id);
    }

    unregisterJava(id: string): void {
        if (!(this.hasOnlyJava(id))) {
            throw new Error("Attempted to unregister nonexistent ID Object in this registry");
        }

        this.javaOnlyStorage.delete(id);
    }

    forEachBedrock(callbackfn: (value: T) => void): void {
        this.bedrockOnlyStorage.forEach(callbackfn);
    }

    forEachJava(callbackfn: (value: T) => void): void {
        this.javaOnlyStorage.forEach(callbackfn);
    }

    hasOnlyBedrock(id: string): boolean {
        return this.bedrockOnlyStorage.has(id);
    }

    hasOnlyJava(id: string): boolean {
        return this.javaOnlyStorage.has(id);
    }

    getAllBedrock(): T[] {
        return this.bedrockOnlyStorage.values().toArray();
    }

    getAllJava(): T[] {
        return this.javaOnlyStorage.values().toArray();
    }
}


export class IdentifiableRegistry<T extends Identifiable> extends GenericRegistry<T> {
    register(object: T): void {
        super.register(object, object.getID().getIdString());
    }
    
    get(id: Identifier | string): T | undefined {
        if (typeof id === "string") {
            return super.get(Identifier.ofString(id).getIdString());
        }
        return super.get(id.getIdString());
    }

    unregister(id: Identifier | string): void {
        if (typeof id === "string") {
            return super.unregister(Identifier.ofString(id).getIdString());
        }
        
        super.unregister(id.getIdString());
    }
}

export class IdentifiableCrossRegistry<T extends Identifiable> extends CrossRegistry<T> {
    register(object: T): void {
        super.register(object, object.getID().getIdString());
    }

    registerJava(object: T): void {
        super.registerJava(object, object.getID().getIdString());
    }

    registerBedrock(object: T): void {
        super.registerBedrock(object, object.getID().getIdString());
    }

    getBedrock(id: Identifier | string): T | undefined {
        if (typeof id === "string") {
            return super.getBedrock(Identifier.ofString(id).getIdString());
        }
        return super.getBedrock(id.getIdString());
    }

    getJava(id: Identifier | string): T | undefined {
        if (typeof id === "string") {
            return super.getJava(Identifier.ofString(id).getIdString());
        }
        return super.getJava(id.getIdString());
    }

    getOnlyJava(id: Identifier | string): T | undefined {
        if (typeof id === "string") {
            return super.getJava(Identifier.ofString(id).getIdString());
        }
        return super.getJava(id.getIdString());
    }

    getOnlyBedrock(id: Identifier | string): T | undefined {
        if (typeof id === "string") {
            return super.getOnlyBedrock(Identifier.ofString(id).getIdString());
        }
        return super.getOnlyBedrock(id.getIdString());
    }

    unregisterBedrock(id: Identifier | string): void {
        if (typeof id === "string") {
            return super.unregisterBedrock(Identifier.ofString(id).getIdString());
        }
        
        super.unregisterBedrock(id.getIdString());
    }

    unregisterJava(id: Identifier | string): void {
        if (typeof id === "string") {
            return super.unregisterJava(Identifier.ofString(id).getIdString());
        }
        
        super.unregisterJava(id.getIdString());
    }
}