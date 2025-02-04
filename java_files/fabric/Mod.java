// Generated with Rubydia2(don't make changes it will be regenerated)
// Boilerplate Java Mod Class that will be used for every mod

package ${RUBYDIA2_MOD_PACKAGE};

import net.fabricmc.api.ModInitializer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ${RUBYDIA2_MOD_CLASS_NAME} implements ModInitializer {
	public static final String MOD_ID = "${RUBYDIA2_MOD_ID}";

	public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

	@Override
	public void onInitialize() {

		LOGGER.info("Hello From Rubydia2: {}!", MOD_ID);
	}
}