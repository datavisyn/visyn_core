import { pluginRegistry } from './plugin';
import reg from './phovea';
/**
 * build a registry by registering all modules
 */
// self
pluginRegistry.register('visyn_core', reg);
