import { pluginRegistry } from './plugin';
import { i18nManager } from './i18n';
import reg from './phovea';

/**
 * Initializes all dependencies of the library. This is required when using it as standalone library, i.e. without any application initializing it.
 */
export async function initializeLibrary(): Promise<void> {
  pluginRegistry.register('visyn_core', reg);

  await i18nManager.initI18n();
}
