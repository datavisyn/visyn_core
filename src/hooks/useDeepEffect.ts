import * as React from 'react';
import { useDeepComparison } from './useDeepComparison';

export function useDeepEffect(effect: React.EffectCallback, dependencies: React.DependencyList) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useEffect(effect, useDeepComparison(dependencies));
}
