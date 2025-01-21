/* eslint-disable react-compiler/react-compiler */
import * as React from 'react';

import isEqual from 'lodash/isEqual';

import { useEvent } from '../../../hooks';

/**
 * Hook similar to useEffect that triggers a frame when dependencies change.
 * It will deeply compare the dependencies and only trigger a frame if they have changed.
 * Frames are debounced to the next animation frame to ensure consistency with the
 * display refresh rate. The optional profileId gives insights on the frame timings.
 *
 * Usage:
 *
 * ```tsx
 * useTriggerFrame(() => {
 *  // Your frame code here
 * }, [dependencies]);
 * ```
 */
export function useTriggerFrame(frame: () => void, deps: React.DependencyList, profileId?: string) {
  const frameRef = React.useRef<number | undefined>(undefined);
  const depsRef = React.useRef(deps);

  const callbackEvent = useEvent(frame);

  if (!isEqual(depsRef.current, deps)) {
    depsRef.current = deps;

    // Request new frame
    if (frameRef.current === undefined) {
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = undefined;

        if (profileId) {
          let msg = '';
          const t0 = performance.now();
          msg += `Profile: ${profileId}`;

          callbackEvent();

          const t1 = performance.now();
          msg += ` took ${t1 - t0} milliseconds.`;
          console.log(msg);
        } else {
          callbackEvent();
        }
      });
    }
  }
}
