import * as React from 'react';
import { useSyncedRef } from './useSyncedRef';

/**
 * Hook that provides a setRef function, passable to the ref prop of a React element.
 * The setRef function will register and cleanup the element with the provided callbacks.
 * https://legacy.reactjs.org/docs/hooks-faq.html?source=post_page-----eb7c15198780--------------------------------#how-can-i-measure-a-dom-node
 * https://medium.com/@teh_builder/ref-objects-inside-useeffect-hooks-eb7c15198780
 */
export function useSetRef<T extends Element>(props?: { cleanup: (lastElement: T) => void; register: (element: T) => void }) {
  const ref = React.useRef<T | null>();

  const callbackRef = useSyncedRef(props);

  const setRef = React.useCallback(
    (newElement: T | null) => {
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
    // This ref is stale, do not use in useEffect dependencies
    ref,

    // This should be passed to the ref
    setRef,
  };
}
