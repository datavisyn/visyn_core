import * as React from 'react';
import isEqual from 'lodash/isEqual';

// Inspired by https://github.com/kentcdodds/use-deep-compare-effect/blob/main/src/index.ts
export function useDeepComparison<T>(value: T) {
  const ref = React.useRef<T>(value);
  const signalRef = React.useRef<number>(0);

  if (!isEqual(value, ref.current)) {
    ref.current = value;
    signalRef.current += 1;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => ref.current, [signalRef.current]);
}
