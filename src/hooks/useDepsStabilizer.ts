import * as React from 'react';

import isEqual from 'lodash/isEqual';
import { shallowEqualArrays } from 'shallow-equal';

// Inspired by https://github.com/kentcdodds/use-deep-compare-effect/blob/main/src/index.ts
export function useDepsStabilizer<T>(value: T, options: { deps?: React.DependencyList; comparison: 'deep' | 'shallow' }) {
  const ref = React.useRef<T>(value);
  const signalRef = React.useRef<number>(0);

  const comparer = options.comparison === 'deep' ? isEqual : shallowEqualArrays;

  const deps = React.useMemo(() => options?.deps ?? [value], [value, options.deps]);

  if (!comparer(deps, ref.current)) {
    ref.current = value;
    signalRef.current += 1;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => ref.current, [signalRef.current]);
}
