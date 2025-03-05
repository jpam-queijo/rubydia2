// Generated with Rubydia2(don't make changes it will be regenerated)
// Boilerplate Java Mod Class that will be used for every mod

package ${RUBYDIA2_MOD_PACKAGE}.item;

import ${RUBYDIA2_MOD_PACKAGE}.${RUBYDIA2_MOD_CLASS_NAME};

import net.fabricmc.api.ModInitializer;

import net.minecraft.item.Item;
import net.minecraft.registry.Registries;
import net.minecraft.registry.Registry;
import net.minecraft.util.Identifier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ModItems {
${RUBYDIA2_MOD_ITEMS_REGISTER}

	public static Item registerItem(String namespace, String id, Item item) {
		return Registry.register(Registries.ITEM, Identifier.of(namespace, id), item);
	}
	public static void registerModItems() {
		${RUBYDIA2_MOD_CLASS_NAME}.LOGGER.info("[rubydia2_mod] Registering Mod Items for " + ${RUBYDIA2_MOD_CLASS_NAME}.MOD_ID);
	}
}