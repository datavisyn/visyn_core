import * as React from 'react';
import type { EagerVisynRanking } from './EagerVisynRanking';

const LazyVisynRanking = React.lazy(() => import('./EagerVisynRanking.js').then((m) => ({ default: m.EagerVisynRanking })));

export function VisynRanking<T extends Record<string, unknown>>(props: Parameters<typeof EagerVisynRanking<T>>[0]) {
  return (
    <React.Suspense fallback={null}>
      <LazyVisynRanking {...props} />
    </React.Suspense>
  );
}
