import * as React from 'react';

import { useDeepComparison } from './useDeepComparison';

export function useDeepMemo<T>(factory: () => T, dependencies: React.DependencyList) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(factory, useDeepComparison(dependencies));
}
