/* eslint-disable react-compiler/react-compiler */
import * as React from 'react';

import { useEvent } from '../../../hooks';
import { useComparison } from '../../../hooks/useComparison';

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
export function useTriggerFrame(frame: () => void, deps: React.DependencyList, options?: {
  profileId?: string;
  comparison?: 'deep' | 'shallow';
}) {
  const frameRef = React.useRef<number | undefined>(undefined);
  const oldSignal = React.useRef<unknown[]>();

  const callbackEvent = useEvent(frame);

  const signal = useComparison(deps as unknown[], { comparison: options?.comparison ?? 'shallow' });

  if (oldSignal.current !== signal) {
    oldSignal.current = signal;

    // Request new frame
    if (frameRef.current === undefined) {
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = undefined;

        if (options?.profileId) {
          let msg = '';
          const t0 = performance.now();
          msg += `Profile: ${options?.profileId}`;

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
