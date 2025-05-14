import * as React from 'react';

import isEqual from 'lodash/isEqual';

import { shallowEqualArrays } from './shallow-equal-arrays';

// Inspired by https://github.com/kentcdodds/use-deep-compare-effect/blob/main/src/index.ts
export function useComparison<T>(value: T, comparisonType: 'deep' | 'shallow' = 'deep') {
  const ref = React.useRef<T>(value);
  const signalRef = React.useRef<number>(0);

  const comparer = comparisonType === 'deep' ? isEqual : shallowEqualArrays;

  if (!comparer(value, ref.current)) {
    ref.current = value;
    signalRef.current += 1;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => ref.current, [signalRef.current]);
}
