import * as React from 'react';
import { useSyncedRef } from './useSyncedRef';

/**
 * Hook that provides a setRef function, passable to the ref prop of a React element.
 * The setRef function will register and cleanup the element with the provided callbacks.
 */
export function useSetRef(props?: { cleanup: (lastElement: HTMLElement) => void; register: (element: HTMLElement) => void }) {
  const ref = React.useRef<HTMLElement>();

  const callbackRef = useSyncedRef(props);

  const setRef = React.useCallback(
    (newElement: HTMLElement | null) => {
      if (ref.current) {
        callbackRef.current?.cleanup(ref.current);
      }

      if (newElement) {
        callbackRef.current?.register(newElement);
      }

      ref.current = newElement;
    },
    [callbackRef],
  );

  return {
    setRef,
  };
}
