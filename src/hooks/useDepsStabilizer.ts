import * as React from 'react';

import isEqual from 'lodash/isEqual';
import { shallowEqualArrays } from 'shallow-equal';

// Inspired by https://github.com/kentcdodds/use-deep-compare-effect/blob/main/src/index.ts
export function useDepsStabilizer<T>(value: T, options: { deps?: React.DependencyList; comparison: 'deep' | 'shallow' }) {
  const valueRef = React.useRef<T>(value);
  const depsRef = React.useRef<React.DependencyList>([]);

  const comparer = options.comparison === 'deep' ? isEqual : shallowEqualArrays;

  const deps = React.useMemo(() => options?.deps ?? [value], [value, options.deps]);

  if (!comparer(deps, depsRef.current)) {
    valueRef.current = value;
    depsRef.current = deps;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => valueRef.current, [depsRef.current]);
}
