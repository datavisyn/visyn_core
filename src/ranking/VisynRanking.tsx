import * as React from 'react';
import type { EagerVisynRanking } from './EagerVisynRanking';

const LazyVisynRanking = React.lazy(() => import('./EagerVisynRanking').then((m) => ({ default: m.EagerVisynRanking }))) as typeof EagerVisynRanking;

export function VisynRanking<T extends Record<string, unknown>>(props: Parameters<typeof EagerVisynRanking<T>>[0]) {
  return (
    <React.Suspense fallback={null}>
      <LazyVisynRanking<T> {...props} />
    </React.Suspense>
  );
}
