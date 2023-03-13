import { Ajax } from './ajax';

export interface ITDPClientConfig {
  [key: string]: any;
}

/**
 * Loads the client config from '/api/clientConfig' or '/clientConfig.json' and parses it.
 */
export async function loadClientConfig<T = any>(): Promise<T | null> {
  return Ajax.getJSON('/api/clientConfig')
    .catch((e) => {
      console.error('Error loading /api/clientConfig', e);
      return null;
    })
    .then((r) => {
      if (r == null) {
        return Ajax.getJSON('/clientConfig.json').catch(() => {
          return null;
        });
      }
      return r;
    });
}
