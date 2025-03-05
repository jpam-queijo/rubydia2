// Generated with Rubydia2(don't make changes it will be regenerated)
// Boilerplate Java Mod Class that will be used for every mod

package ${RUBYDIA2_MOD_PACKAGE}.item;

import ${RUBYDIA2_MOD_PACKAGE}.${RUBYDIA2_MOD_CLASS_NAME};

import java.util.function.Function;

import net.minecraft.item.Item;
import net.minecraft.item.Items;
import net.minecraft.registry.Registries;
import net.minecraft.registry.Registry;
import net.minecraft.registry.RegistryKey;
import net.minecraft.registry.RegistryKeys;
import net.minecraft.util.Identifier;

// Rarity
import net.minecraft.util.Rarity;

import org.slf4j.Logger;

public class ModItems {
${RUBYDIA2_MOD_ITEMS_REGISTER}

	public static Item registerItem(String namespace, String id, Function<Item.Settings, Item> factory, Item.Settings settings) {
        final RegistryKey<Item> registryKey = RegistryKey.of(RegistryKeys.ITEM, Identifier.of(namespace, id));
		return Items.register(registryKey, factory, settings);
	}
	public static void registerModItems() {
		${RUBYDIA2_MOD_CLASS_NAME}.LOGGER.info("[rubydia2_mod] Registering Mod Items for " + ${RUBYDIA2_MOD_CLASS_NAME}.MOD_ID);
	}
}