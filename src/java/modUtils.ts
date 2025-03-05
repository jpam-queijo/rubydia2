import type { FabricSupportedJavaVersion } from "../fabric/modSettings";
import type { ModInfo } from "../mod";
import { toSnakeCaseString } from "../utils";
import path from "path";

export class ModUtils {
    public static getModID(mod_info: ModInfo): string {
        return process.env.JAVA_MODID || toSnakeCaseString(mod_info.name);
    }

    public static getModPackage(mod_info: ModInfo): string {
        return process.env.JAVA_PACKAGE || `com.rubydia2.${this.getModID(mod_info)}`;
    }

    public static getModGeneratePath(version: FabricSupportedJavaVersion, specified_path?: string): string {
        return process.env.DEFAULT_GENERATE_PATH || specified_path || `./build/fabric/${version}/`
    }

    public static getAssetsFolderLocation(generate_path: string, mod_id: string): string {
        return path.join(generate_path, "src", "main", "resources", "assets", mod_id);
    }

    public static getJavaSrcFolder(generate_path: string) {
        return path.join(generate_path, "src", "main", "java");
    }

    public static getRubydia2Folder(): string {
        return path.resolve(path.join(import.meta.dirname, "..", ".."));
    }
}