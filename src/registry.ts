import { Identifier, type Identifiable } from "./identifier";

export interface RegistryLike<T> {
    register(): void;
}

export class Registry<T> {
    private storage: Map<string, T> = new Map<string, T>();

    register(object: T, id: string): void {
        if (this.storage.has(id)) {
            throw new Error("Another object with this key already registered.");
        }

        this.storage.set(id, object);
    }

    get(id: string): T | undefined {
        return this.storage.get(id);
    }

    unregister(id: string): void {
        if (!(this.storage.has(id))) {
            throw new Error("Attempted to unregister nonexistent ID Object");
        }

        this.storage.delete(id);
    }

    forEach(callbackfn: (value: T) => void) {
        this.storage.forEach(callbackfn);
    }
}

export class IdentifiableRegistry<T extends Identifiable> extends Registry<T> {
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