import * as React from 'react';
import type { EagerVis } from './EagerVis';

const VisLazy = React.lazy(() => import('./EagerVis').then((m) => ({ default: m.EagerVis })));

export function Vis(props: Parameters<typeof EagerVis>[0]) {
  return (
    <React.Suspense fallback={null}>
      <VisLazy {...props} />
    </React.Suspense>
  );
}
