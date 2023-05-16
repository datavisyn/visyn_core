import { Ajax } from './ajax';

/**
 * Interface for the visyn app config.
 *
 * Can be extended globally by other repositories:
 *
 * ```ts
 * declare module 'visyn_core' {
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
 * Loads the app config from '/api/v1/visyn/clientConfig'.
 */
export async function loadClientConfig(): Promise<IClientConfig | null> {
  return Ajax.getJSON('/api/v1/visyn/clientConfig').catch((e) => {
    console.error('Error loading /api/v1/visyn/clientConfig', e);
    return null;
  });
}
