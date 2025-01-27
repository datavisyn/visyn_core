import reg from './phovea';
import { pluginRegistry } from './plugin';
/**
 * build a registry by registering all modules
 */
// self
pluginRegistry.register('visyn_core', reg);
