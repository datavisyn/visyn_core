import React, { useCallback, useMemo } from 'react';
import { Box, Container } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { EAggregateTypes, EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig, IRaincloudConfig, VisColumn } from '../interfaces';
import { getRaincloudData } from './utils';

import { useAsync } from '../../hooks/useAsync';
import { SplitViolin } from './cloud/SplitViolin';
import { DotPlot } from './rain/DotPlot';

const margin = {
  top: 30,
  bottom: 60,
  left: 60,
  right: 25,
};

export function Raincloud({ columns, config }: { columns: VisColumn[]; config: IRaincloudConfig }) {
  const [ref, { width, height }] = useResizeObserver();

  const { value: data } = useAsync(getRaincloudData, [columns, config.numColumnsSelected]);

  return (
    <svg ref={ref} style={{ width: '100%', height: '100%' }}>
      {data ? (
        <g>
          <SplitViolin width={width} height={height} config={config} numCol={data.numColVals[0]} />
          <DotPlot width={width} height={height} config={config} numCol={data.numColVals[0]} />
        </g>
      ) : null}
    </svg>
  );
}
