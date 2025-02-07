import * as React from 'react';

import { FlameBin } from './math';

export function useCutoffFilter<V extends Record<string, unknown>>(bins: Record<string, FlameBin<V>>, accessor: keyof V, cutoff: number) {
  return React.useMemo(() => {
    const value: Record<string, boolean> = {};

    // eslint-disable-next-line guard-for-in
    for (const key in bins) {
      const bin = bins[key]!;

      if ((bin.value[accessor] as number) < cutoff) {
        value[key] = true;
      }
    }

    return value;
  }, [accessor, bins, cutoff]);
}

/**
 * Immediately triggers callback when observed value changes.
 */
export function useStateReset<T>(effect: () => void, observedValue: T) {
  const [lastState, setLastState] = React.useState(observedValue);

  if (lastState !== observedValue) {
    setLastState(observedValue);
    effect();
  }
}
