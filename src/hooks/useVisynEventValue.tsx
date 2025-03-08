import * as React from 'react';

import { useVisynEventCallback } from './useVisynEventCallback';
import { VisynEventMap } from '../app/VisynEvents';

/**
 * React hook to listen to the value of a specific event.
 * @param eventName Name of the event to listen to.
 * @returns The latest value of the event.
 */
export function useVisynEventValue<K extends keyof VisynEventMap>(
  eventName: K,
  defaultValue: VisynEventMap[K] | undefined = undefined,
): VisynEventMap[K] | undefined {
  const [value, setValue] = React.useState<VisynEventMap[K] | undefined>(defaultValue);
  useVisynEventCallback<K>(eventName, (event) => setValue(event.detail));
  return value;
}
