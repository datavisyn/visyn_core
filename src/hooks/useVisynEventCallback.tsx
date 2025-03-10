import * as React from 'react';

import { useSyncedRef } from './useSyncedRef';
import { VisynEventMap, addVisynEventListener, removeVisynEventListener } from '../app/VisynEvents';

/**
 * React hook to listen to event changes utilizing useSyncExternalStore.
 */
export function useVisynEventCallback<K extends keyof VisynEventMap>(eventName: K, callback: (event: CustomEvent<VisynEventMap[K]>) => void): void {
  // Create a stable reference to the callback
  const callbackRef = useSyncedRef(callback);
  const stableCallback = React.useCallback(
    (event: CustomEvent<VisynEventMap[K]>) => {
      callbackRef.current(event);
    },
    [callbackRef],
  );

  // Add and remove the event listener
  React.useEffect(() => {
    addVisynEventListener(eventName, stableCallback);
    return () => {
      removeVisynEventListener(eventName, stableCallback);
    };
  }, [eventName, stableCallback]);
}
