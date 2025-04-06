import type { Mod } from "./mod";
import { isValidNamespaceID } from "./utils";

export class Identifier {
    private namespace: string;
    private path: string;

    constructor(namespace: string, path: string) {
        if (!isValidNamespaceID(namespace)) {
            throw new Error("Not valid namespace is: Namespace should only have ASCII lowercase letters ([a-z]), ASCII digits ([0-9]), or the characters _, ., and -");
        }
        if (!isValidNamespaceID(path)) {
            throw new Error("Not valid path: Path should only have ASCII lowercase letters ([a-z]), ASCII digits ([0-9]), or the characters _, ., and -");
        }
        this.namespace = namespace;
        this.path = path;
    }

    getNamespace(): string {
        return this.namespace;
    }

    getIdString(): string {
        return `${this.namespace}:${this.path}`;
    }

    getPath(): string {
        return this.path;
    }

    static of(namespace: string, path: string): Identifier;
    static of(namespace: Mod, path: string): Identifier;

    static of(namespace: string | Mod, path: string): Identifier {
        if (typeof namespace === "string") {
            return new this(namespace, path);
        }

        return new this(namespace.getModID(), path);
    }

    static ofString(fullID: string): Identifier {
        if (!fullID.includes(":")) {
            throw new Error("Not valid identifier: string doesn't contain \":\" separator");
        }

        if (fullID.indexOf(":") !== fullID.lastIndexOf(":")) {
            throw new Error("Not valid identifier: Multiple \":\" separators in one string.");
        }

        const id = fullID.split(":");

        return new this(id[0], id[1]);
    }

    static ofMinecraft(path: string): Identifier {
        return new this("minecraft", path);
    }

    static ofRubydia(path: string): Identifier {
        return new this("rubydia", path);
    }

    static isValid(namespace: string, path: string): boolean {
        return (isValidNamespaceID(path) && isValidNamespaceID(namespace));
    }

    static isValidString(fullID: string): boolean {
        if (!fullID.includes(":")) return false;
        if (fullID.indexOf(":") !== fullID.lastIndexOf(":")) return false;
        
        const id = fullID.split(":");
        return this.isValid(id[0], id[1]);
    }
}

export interface Identifiable {
    getID(): Identifier;
}