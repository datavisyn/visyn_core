import * as React from 'react';

import { DemoVisynViewPluginType } from './interfaces';

export function createLazyVisynDemoView(): DemoVisynViewPluginType['definition'] {
  return {
    viewType: 'simple',
    defaultParameters: {
      columns: null,
      config: null,
      dataLength: 100,
    },
    view: React.lazy(() => import(/* webpackChunkName: "VisynDemoView" */ './VisynDemoView.js').then((m) => ({ default: m.VisynDemoView }))),
    header: React.lazy(() => import(/* webpackChunkName: "VisynDemoViewHeader" */ './VisynDemoView.js').then((m) => ({ default: m.VisynDemoViewHeader }))),
    tab: React.lazy(() => import(/* webpackChunkName: "VisynDemoViewSidebar" */ './VisynDemoView.js').then((m) => ({ default: m.VisynDemoViewSidebar }))),
  };
}
