import { Ajax } from './ajax';

/**
 * Interface for the visyn app config.
 *
 * Can be extended globally by other repositories:
 *
 * ```ts
 * declare module 'visyn_core/base' {
 *   export interface IClientConfig {
 *     customProperty: string;
 *   }
 * }
 *
 * ```
 */
export interface IClientConfig {
  env?: 'development' | 'production';
}

/**
 * Loads the app config from '/api/clientConfig'.
 */
export async function loadClientConfig(): Promise<IClientConfig | null> {
  return Ajax.getJSON('/api/clientConfig').catch((e) => {
    console.error('Error loading /api/clientConfig', e);
    return null;
  });
}
