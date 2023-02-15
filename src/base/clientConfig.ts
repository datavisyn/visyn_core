import { Ajax } from './ajax';

export interface ITDPClientConfig {
  [key: string]: any;
}

/**
 * Loads the client config from '/clientConfig.json' and parses it.
 */
export async function loadClientConfig<T = any>(): Promise<T | null> {
  return Ajax.getJSON('/clientConfig.json').catch((e) => {
    console.error('Error parsing clientConfig.json', e);
    return null;
  });
}
